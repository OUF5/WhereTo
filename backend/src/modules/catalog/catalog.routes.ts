import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function catalogRoutes(fastify: FastifyInstance) {
  // GET /catalog/categories
  fastify.get('/categories', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      items: ['EATING', 'CHILLING', 'EVENT_JOY'],
    });
  });

  // GET /catalog/roles
  fastify.get('/roles', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      items: ['OWNER', 'MEMBER'],
    });
  });
}

