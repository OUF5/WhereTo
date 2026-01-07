import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { problems, sendProblem } from '../../lib/errors.js';

export async function usersRoutes(fastify: FastifyInstance) {
  // GET /users/me - requires auth
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, tenantId } = request.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { tenantId },
          include: { tenant: true },
        },
      },
    });

    if (!user) {
      return sendProblem(reply, problems.notFound('User'));
    }

    const currentMembership = user.memberships[0];

    return reply.send({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      city: user.city,
      isActive: true,
      currentMembership: currentMembership ? {
        tenantId: currentMembership.tenantId,
        role: currentMembership.role,
        isCurrent: currentMembership.isCurrent,
        tenant: {
          id: currentMembership.tenant.id,
          groupName: currentMembership.tenant.groupName,
          joinCode: currentMembership.tenant.joinCode,
        },
      } : null,
    });
  });
}

