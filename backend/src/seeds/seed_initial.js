const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  // Deletes ALL existing entries and inserts initial seeds
  // await knex('games').del().catch(() => {})
  // await knex('players').del().catch(() => {})

  // const pass1 = await bcrypt.hash('password123', 10)
  // const pass2 = await bcrypt.hash('secret456', 10)

  // // knex + pg may return an array of objects like [{ id: 1 }]
  // const inserted1 = await knex('players').insert({ name: 'Alice', email: 'alice@example.com', password_hash: pass1 }).returning('id')
  // const inserted2 = await knex('players').insert({ name: 'Bob', email: 'bob@example.com', password_hash: pass2 }).returning('id')

  // const id1 = Array.isArray(inserted1) ? (inserted1[0].id || inserted1[0]) : inserted1
  // const id2 = Array.isArray(inserted2) ? (inserted2[0].id || inserted2[0]) : inserted2

  // await knex('games').insert([
  //   { player_id: id1 || 1, moves: 12, time_elapsed: 30, score: 800 },
  //   { player_id: id1 || 1, moves: 15, time_elapsed: 40, score: 700 },
  //   { player_id: id2 || 2, moves: 10, time_elapsed: 25, score: 850 }
  // ])
}
