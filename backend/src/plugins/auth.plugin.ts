import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { config } from '../lib/config.js';
import { problems, sendProblem } from '../lib/errors.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string;
      tenantId: string;
      role: string;
    };
    user: {
      userId: string;
      tenantId: string;
      role: string;
    };
  }
}

async function authPluginCallback(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    },
  });

  // Decorate fastify with authenticate function
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch {
      return sendProblem(reply, problems.unauthorized('Invalid or expired token'));
    }
  });
}

// Wrap with fp() to skip encapsulation - makes authenticate available everywhere
export const authPlugin = fp(authPluginCallback, {
  name: 'auth-plugin',
});