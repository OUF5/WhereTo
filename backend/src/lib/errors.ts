import { FastifyReply } from 'fastify';

// RFC 9457 Problem Details
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

const BASE_URL = 'https://api.adventure-roulette.com/problems';

export const problems = {
  // 400 Bad Request
  badRequest: (detail: string, instance?: string): ProblemDetails => ({
    type: `${BASE_URL}/bad-request`,
    title: 'Bad Request',
    status: 400,
    detail,
    instance,
  }),

  // 401 Unauthorized
  unauthorized: (detail = 'Invalid credentials'): ProblemDetails => ({
    type: `${BASE_URL}/unauthorized`,
    title: 'Unauthorized',
    status: 401,
    detail,
  }),

  // 403 Forbidden
  forbidden: (detail = 'You do not have permission to access this resource'): ProblemDetails => ({
    type: `${BASE_URL}/forbidden`,
    title: 'Forbidden',
    status: 403,
    detail,
  }),

  // 404 Not Found
  notFound: (resource: string): ProblemDetails => ({
    type: `${BASE_URL}/not-found`,
    title: 'Not Found',
    status: 404,
    detail: `${resource} not found`,
  }),

  // 409 Conflict
  conflict: (detail: string): ProblemDetails => ({
    type: `${BASE_URL}/conflict`,
    title: 'Conflict',
    status: 409,
    detail,
  }),

  // 422 Validation Error
  validation: (errors: Record<string, string[]>): ProblemDetails => ({
    type: `${BASE_URL}/validation-error`,
    title: 'Validation failed',
    status: 422,
    detail: 'One or more fields are invalid.',
    errors,
  }),

  // 500 Internal Server Error
  internal: (detail = 'An unexpected error occurred'): ProblemDetails => ({
    type: `${BASE_URL}/internal-error`,
    title: 'Internal Server Error',
    status: 500,
    detail,
  }),
};

export function sendProblem(reply: FastifyReply, problem: ProblemDetails) {
  return reply
    .status(problem.status)
    .header('Content-Type', 'application/problem+json')
    .send(problem);
}

