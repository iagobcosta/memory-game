module.exports = async function (fastify, opts) {
  const db = fastify.db;

  fastify.post('/game/save', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { moves, time_elapsed, score } = request.body;
    if (typeof moves !== 'number' || typeof time_elapsed !== 'number' || typeof score !== 'number') {
      return reply.code(400).send({ error: 'Invalid payload' });
    }
  // debug: log authenticated user and auth header (log as objects so pino emits them)
  fastify.log.info({ requestUser: request.user || null }, 'Saving game - request.user')
  fastify.log.info({ authHeaderPreview: request.headers && request.headers.authorization ? (request.headers.authorization.substring(0, 40) + '...') : null }, 'Saving game - auth header')

    // derive player id from multiple possible token claim locations
    let playerId = null
    if (request.user) {
      const raw = request.user.id ?? request.user.sub ?? request.user.subject ?? null
      if (raw !== null && raw !== undefined && raw !== '') {
        const n = Number(raw)
        playerId = Number.isNaN(n) ? raw : n
      }
    }
    // normalize returning id shape across pg/knex versions
    const inserted = await db('games').insert({ player_id: playerId, moves, time_elapsed, score }).returning('id');
    let returnedId = null
    if (Array.isArray(inserted)) {
      returnedId = inserted[0] && (inserted[0].id || inserted[0])
    } else {
      returnedId = inserted
    }
    return { id: returnedId || null };
  });
};
