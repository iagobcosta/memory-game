/**
 * Migration: add token_hash column to refresh_tokens
 */
exports.up = async function (knex) {
  const has = await knex.schema.hasTable('refresh_tokens')
  if (!has) return
  await knex.schema.table('refresh_tokens', (table) => {
    table.string('token_hash', 128).nullable()
  })
}

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('refresh_tokens')
  if (!has) return
  await knex.schema.table('refresh_tokens', (table) => {
    table.dropColumn('token_hash')
  })
}
