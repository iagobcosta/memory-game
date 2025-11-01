const db = require('../config/db');
const bcrypt = require('bcrypt');

async function init() {
  await db.schema.hasTable('players').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('players', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  await db.schema.hasTable('games').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('games', (table) => {
        table.increments('id').primary();
        table.integer('player_id').unsigned().references('id').inTable('players').onDelete('CASCADE');
        table.integer('moves').notNullable();
        table.integer('time_elapsed').notNullable();
        table.integer('score').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

//   // Seeds: insert 2 users and some games if not present
//   const users = await db('players').select('*').limit(1);
//   if (users.length === 0) {
//     const pass1 = await bcrypt.hash('password123', 10);
//     const pass2 = await bcrypt.hash('secret456', 10);
//     const [id1] = await db('players').insert({ name: 'Alice', email: 'alice@example.com', password_hash: pass1 }).returning('id');
//     const [id2] = await db('players').insert({ name: 'Bob', email: 'bob@example.com', password_hash: pass2 }).returning('id');

//     await db('games').insert([
//       { player_id: id1 || 1, moves: 12, time_elapsed: 30, score: 800 },
//       { player_id: id1 || 1, moves: 15, time_elapsed: 40, score: 700 },
//       { player_id: id2 || 2, moves: 10, time_elapsed: 25, score: 850 }
//     ]);
//   }
}

module.exports = init;
