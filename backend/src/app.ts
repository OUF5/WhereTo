import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './lib/config.js';
import { authPlugin } from './plugins/auth.plugin.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { tenantsRoutes } from './modules/tenants/tenants.routes.js';
import { placesRoutes } from './modules/places/places.routes.js';
import { spinsRoutes } from './modules/spins/spins.routes.js';
import { catalogRoutes } from './modules/catalog/catalog.routes.js';

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Register CORS - allow all origins for now
await fastify.register(cors, {
  origin: true,  // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Register auth plugin (JWT)
await fastify.register(authPlugin);

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Register routes with /v1 prefix
await fastify.register(async (api) => {
  await api.register(authRoutes, { prefix: '/auth' });
  await api.register(usersRoutes, { prefix: '/users' });
  await api.register(tenantsRoutes, { prefix: '/tenants' });
  await api.register(placesRoutes, { prefix: '/tenants' });
  await api.register(spinsRoutes, { prefix: '/tenants' });
  await api.register(catalogRoutes, { prefix: '/catalog' });
}, { prefix: '/v1' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.PORT, host: config.HOST });
    console.log(`🚀 Server running at http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export { fastify };

