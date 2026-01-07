import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema, refreshSchema, RegisterInput, LoginInput, RefreshInput } from './auth.schema.js';
import { problems, sendProblem } from '../../lib/errors.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify);

  // POST /auth/register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      const errors: Record<string, string[]> = {};
      parseResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return sendProblem(reply, problems.validation(errors));
    }

    const input: RegisterInput = parseResult.data;
    const result = await authService.register(input);

    if ('error' in result) {
      switch (result.error) {
        case 'email_exists':
          return sendProblem(reply, problems.conflict('Email already registered'));
        case 'group_name_exists':
          return sendProblem(reply, problems.conflict('Group name already exists'));
        case 'invalid_join_code':
          return sendProblem(reply, problems.notFound('Join code'));
        default:
          return sendProblem(reply, problems.internal());
      }
    }

    return reply.status(201).send({
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        city: result.user.city,
      },
      tenant: {
        id: result.tenant.id,
        groupName: result.tenant.groupName,
      },
      membership: {
        id: result.membership.id,
        role: result.membership.role,
        isCurrent: result.membership.isCurrent,
      },
      tokens: result.tokens,
    });
  });

  // POST /auth/login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendProblem(reply, problems.validation({ credentials: ['Invalid email or password format'] }));
    }

    const input: LoginInput = parseResult.data;
    const result = await authService.login(input);

    if ('error' in result) {
      switch (result.error) {
        case 'invalid_credentials':
          return sendProblem(reply, problems.unauthorized('Invalid email or password'));
        case 'no_membership':
          return sendProblem(reply, problems.forbidden('User has no active group membership'));
        default:
          return sendProblem(reply, problems.internal());
      }
    }

    return reply.send({
      user: { id: result.user.id },
      tokens: result.tokens,
    });
  });

  // POST /auth/refresh
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = refreshSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendProblem(reply, problems.badRequest('refreshToken is required'));
    }

    const input: RefreshInput = parseResult.data;
    const result = await authService.refresh(input.refreshToken);

    if ('error' in result) {
      return sendProblem(reply, problems.unauthorized('Invalid or expired refresh token'));
    }

    return reply.send({ tokens: result.tokens });
  });
}

