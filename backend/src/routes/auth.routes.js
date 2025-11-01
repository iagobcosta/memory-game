const { z } = require('zod');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = async function (fastify, opts) {
  const db = fastify.db;

  fastify.post('/register', async (request, reply) => {
    const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.errors });

    const { name, email, password } = parsed.data;
    const existing = await db('players').where({ email }).first();
    if (existing) return reply.code(409).send({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const [id] = await db('players').insert({ name, email, password_hash: hash }).returning('id');
    return { id: id || null, name, email };
  });

  fastify.post('/login', async (request, reply) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.errors });

    const { email, password } = parsed.data;
    const user = await db('players').where({ email }).first();
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return reply.code(401).send({ error: 'Invalid credentials' });

  // include user id explicitly in the token payload so downstream code can read it
  const accessToken = fastify.jwt.sign({ email: user.email, id: user.id }, { subject: String(user.id), expiresIn: '15m' });
  const refreshToken = fastify.jwt.sign({ email: user.email, id: user.id }, { subject: String(user.id), expiresIn: '7d' });

    // persist refresh token hash in DB for revocation/validation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
      await db('refresh_tokens').insert({ token_hash: tokenHash, player_id: user.id, expires_at: expiresAt });
    } catch (e) {
      fastify.log.warn('Could not persist refresh token hash:', e.message || e);
    }

    return { accessToken, refreshToken };
  });

  fastify.post('/refresh', async (request, reply) => {
    const schema = z.object({ refreshToken: z.string().min(1) });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.errors });

    const { refreshToken } = parsed.data;
    try {
      // verify signature
      const decoded = fastify.jwt.verify(refreshToken);
      // compute hash and try to find by token_hash
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
      let row = await db('refresh_tokens').where({ token_hash: tokenHash }).first();
      if (!row) {
        // fallback for older records that may have stored token plaintext
        row = await db('refresh_tokens').where({ token: refreshToken }).first();
        if (row) {
          // migrate to token_hash and clear token column
          await db('refresh_tokens').where({ id: row.id }).update({ token_hash: tokenHash, token: null }).catch(() => {})
        }
      }
      if (!row) return reply.code(401).send({ error: 'Refresh token revoked or not found' });
      if (new Date(row.expires_at) < new Date()) {
        // expired
        await db('refresh_tokens').where({ id: row.id }).del().catch(() => {})
        return reply.code(401).send({ error: 'Refresh token expired' });
      }

      const userId = decoded.sub;
      const email = decoded.email;
  // include id in the payload for consistency
  const accessToken = fastify.jwt.sign({ email, id: userId }, { subject: String(userId), expiresIn: '15m' });

  // rotate refresh token: issue a new refresh token and update DB
  const newRefresh = fastify.jwt.sign({ email: userId ? email : decoded.email, id: userId }, { subject: String(userId), expiresIn: '7d' });
      const newHash = crypto.createHash('sha256').update(newRefresh).digest('hex')
      const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      try {
        if (row && row.id) {
          await db('refresh_tokens').where({ id: row.id }).update({ token_hash: newHash, expires_at: newExpires }).catch(() => {})
        } else {
          await db('refresh_tokens').insert({ token_hash: newHash, player_id: userId, expires_at: newExpires }).catch(() => {})
        }
      } catch (e) {
        fastify.log.warn('Failed to rotate refresh token:', e.message || e)
      }

      return { accessToken, refreshToken: newRefresh };
    } catch (err) {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });

  // logout / revoke a refresh token (or revoke all tokens for authenticated user)
  fastify.post('/logout', async (request, reply) => {
    const schema = z.object({ refreshToken: z.string().optional() });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.errors });

    const { refreshToken } = parsed.data;
    try {
      if (refreshToken) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
        await db('refresh_tokens').where({ token_hash: tokenHash }).del()
        await db('refresh_tokens').where({ token: refreshToken }).del()
        return { ok: true };
      }

      // if no refreshToken provided, try to revoke all tokens for authenticated user
      try {
        await request.jwtVerify();
        const userId = request.user ? request.user.id : null;
        if (userId) {
          await db('refresh_tokens').where({ player_id: userId }).del();
          return { ok: true };
        }
      } catch (e) {
        // not authenticated
      }

      return reply.code(400).send({ error: 'No refreshToken provided and user not authenticated' });
    } catch (e) {
      return reply.code(500).send({ error: 'Failed to revoke token' });
    }
  });
};
