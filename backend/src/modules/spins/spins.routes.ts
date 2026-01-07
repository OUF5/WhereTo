import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { problems, sendProblem } from '../../lib/errors.js';
import { createSpinSchema } from './spins.schema.js';

const paramsSchema = z.object({
  tenantId: z.string(),
});

export async function spinsRoutes(fastify: FastifyInstance) {
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

  // POST /tenants/:tenantId/spins
  fastify.post('/:tenantId/spins', {
    preHandler: [fastify.authenticate, verifyMembership],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = paramsSchema.parse(request.params);
    const { userId } = request.user;

    const parseResult = createSpinSchema.safeParse(request.body);
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

    // Get all active places in the category, excluding already spun ones
    const places = await prisma.suggestedPlace.findMany({
      where: {
        tenantId,
        category: input.category,
        isActive: true,
        id: { notIn: input.excludedItemKeys },
      },
      include: {
        suggestedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (places.length === 0) {
      return sendProblem(reply, problems.notFound('No places available for this category'));
    }

    // Pick a random place
    const randomIndex = Math.floor(Math.random() * places.length);
    const selectedPlace = places[randomIndex];

    // Return the spin result (Stage 1: not persisted)
    return reply.status(201).send({
      id: `spin_${Date.now()}`, // Temporary ID since we're not persisting
      type: 'GROUP_SUGGESTED',
      tenantId,
      userId,
      excludedItemKeys: input.excludedItemKeys,
      startedAt: new Date().toISOString(),
      result: {
        source: 'SUGGESTED',
        place: {
          id: selectedPlace.id,
          name: selectedPlace.name,
          category: selectedPlace.category,
          description: selectedPlace.description,
          suggestedBy: selectedPlace.suggestedBy,
        },
      },
    });
  });
}

