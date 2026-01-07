import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { problems, sendProblem } from '../../lib/errors.js';
import { createPlaceSchema, listPlacesQuerySchema } from './places.schema.js';
import { normalizePlaceName } from '../../lib/utils.js';

const paramsSchema = z.object({
  tenantId: z.string(),
});

export async function placesRoutes(fastify: FastifyInstance) {
  // Middleware: verify membership
  const verifyMembership = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return sendProblem(reply, problems.badRequest('Invalid tenant ID'));
    }

    const { userId } = request.user;
    const { tenantId } = params.data;

    const membership = await prisma.membership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });

    if (!membership) {
      return sendProblem(reply, problems.forbidden('You are not a member of this group'));
    }
  };

  // POST /tenants/:tenantId/places
  fastify.post('/:tenantId/places', {
    preHandler: [fastify.authenticate, verifyMembership],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = paramsSchema.parse(request.params);
    const { userId } = request.user;

    const parseResult = createPlaceSchema.safeParse(request.body);
    if (!parseResult.success) {
      const errors: Record<string, string[]> = {};
      parseResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return sendProblem(reply, problems.validation(errors));
    }

    const input = parseResult.data;

    // Check for duplicate name (case-insensitive)
    const existingPlace = await prisma.suggestedPlace.findFirst({
      where: {
        tenantId,
        name: { equals: normalizePlaceName(input.name), mode: 'insensitive' },
      },
    });

    if (existingPlace) {
      return sendProblem(reply, problems.conflict(`A place named "${input.name}" already exists`));
    }

    const place = await prisma.suggestedPlace.create({
      data: {
        tenantId,
        suggestedByUserId: userId,
        name: input.name,
        category: input.category,
        description: input.description,
      },
      include: {
        suggestedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return reply.status(201).send({
      id: place.id,
      name: place.name,
      category: place.category,
      description: place.description,
      suggestedBy: place.suggestedBy,
      isActive: place.isActive,
      createdAt: place.createdAt,
    });
  });

  // GET /tenants/:tenantId/places
  fastify.get('/:tenantId/places', {
    preHandler: [fastify.authenticate, verifyMembership],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = paramsSchema.parse(request.params);

    const query = listPlacesQuerySchema.safeParse(request.query);
    const filters = query.success ? query.data : {};

    const where: Record<string, unknown> = { tenantId };

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.q) {
      where.name = { contains: filters.q, mode: 'insensitive' };
    }

    const places = await prisma.suggestedPlace.findMany({
      where,
      include: {
        suggestedBy: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      items: places.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        suggestedBy: p.suggestedBy,
        isActive: p.isActive,
        createdAt: p.createdAt,
      })),
      next_cursor: null, // Stage 1: no pagination
    });
  });
}

