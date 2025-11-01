require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fp = require('fastify-plugin');

const db = require('./config/db');

const PORT = process.env.PORT || 8080;

// Register plugins
fastify.register(fastifyCors, { origin: true });
fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'supersecretkey' });

// make db available as fastify.db
fastify.register(fp(async (instance, opts) => {
  instance.decorate('db', db);
  // authentication decorator
  instance.decorate('authenticate', async function (request, reply) {
    let decoded = null
    try {
      // request.jwtVerify returns the decoded token payload; capture it
      decoded = await request.jwtVerify();
    } catch (err) {
      // send the error and rethrow so Fastify stops the request flow
      reply.send(err);
      throw err;
    }

    // normalize request.user to the decoded payload and ensure an `id` property exists
    try {
      if (decoded && typeof decoded === 'object') {
        // assign decoded payload explicitly to request.user so downstream handlers see it
        request.user = decoded
        // prefer numeric id when subject is numeric
        const sub = decoded.sub ?? decoded.subject ?? null
        if (sub !== null && sub !== undefined && sub !== '') {
          const maybeNum = Number(sub)
          request.user.id = Number.isNaN(maybeNum) ? sub : maybeNum
        }
      }
    } catch (e) {
      // ignore any issues when normalizing
    }
  });
}));

// Database initialization is performed via knex migrations/seeds on container start.
// Keep server focused on handling requests.

// register routes
fastify.register(require('./routes/auth.routes'));
fastify.register(require('./routes/game.routes'));
fastify.register(require('./routes/ranking.routes'));

fastify.get('/', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
