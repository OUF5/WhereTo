import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { problems, sendProblem } from '../../lib/errors.js';

const paramsSchema = z.object({
  tenantId: z.string(),
});

export async function tenantsRoutes(fastify: FastifyInstance) {
  // Middleware: verify user is member of the tenant
  const verifyMembership = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return sendProblem(reply, problems.badRequest('Invalid tenant ID'));
    }

    const { userId } = request.user;
    const { tenantId } = params.data;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_tenantId: { userId, tenantId },
      },
    });

    if (!membership) {
      return sendProblem(reply, problems.forbidden('You are not a member of this group'));
    }

    // Attach membership to request for later use
    (request as unknown as { membership: typeof membership }).membership = membership;
  };

  // GET /tenants/:tenantId
  fastify.get('/:tenantId', {
    preHandler: [fastify.authenticate, verifyMembership],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = paramsSchema.parse(request.params);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return sendProblem(reply, problems.notFound('Group'));
    }

    return reply.send({
      id: tenant.id,
      groupName: tenant.groupName,
      joinCode: tenant.joinCode,
      createdAt: tenant.createdAt,
    });
  });

  // GET /tenants/:tenantId/members
  fastify.get('/:tenantId/members', {
    preHandler: [fastify.authenticate, verifyMembership],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = paramsSchema.parse(request.params);

    const members = await prisma.membership.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return reply.send({
      items: members.map((m) => ({
        id: m.id,
        user: {
          id: m.user.id,
          fullName: m.user.fullName,
        },
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      next_cursor: null, // Stage 1: no pagination
    });
  });
}

