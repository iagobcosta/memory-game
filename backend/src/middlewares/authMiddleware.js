async function authMiddleware(request, reply) {
  try {
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader) return reply.code(401).send({ error: 'Missing Authorization header' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return reply.code(401).send({ error: 'Invalid Authorization format' });

    const token = parts[1];
    const decoded = await request.jwtVerify(token).catch((err) => null);
    if (!decoded) return reply.code(401).send({ error: 'Invalid or expired token' });

    request.user = { id: decoded.sub, email: decoded.email };
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
