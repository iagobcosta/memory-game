module.exports = async function (fastify, opts) {
  const db = fastify.db;

  fastify.get('/ranking', async (request, reply) => {
    const rows = await db('games')
      .join('players', 'games.player_id', 'players.id')
      .select('players.id as player_id', 'players.name', db.raw('MAX(games.score) as top_score'), db.raw('MIN(games.time_elapsed) as best_time'))
      .groupBy('players.id', 'players.name')
      .orderByRaw('MAX(games.score) DESC, MIN(games.time_elapsed) ASC')
      .limit(10);

    return rows;
  });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const user = await db('players').where({ id: userId }).first().select('id', 'name', 'email', 'created_at');
    return user;
  });
};
