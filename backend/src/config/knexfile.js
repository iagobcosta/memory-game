require('dotenv').config();
const { parse } = require('pg-connection-string');

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  const parsed = parse(databaseUrl);
  module.exports = {
    client: 'pg',
    connection: {
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database
    },
    migrations: {
      directory: '../migrations'
    },
    seeds: {
      directory: '../seeds'
    }
  };
} else {
  module.exports = {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'db',
      user: process.env.DB_USER || 'memory_user',
      password: process.env.DB_PASS || 'memory_pass',
      database: process.env.DB_NAME || 'memory_game'
    },
    migrations: {
      directory: '../migrations'
    },
    seeds: {
      directory: '../seeds'
    }
  };
}
