import { and, equals, match } from '@otklib/db'
import { SpyDbConnector } from '../spy/spy-db-connector'
import { PostgresSelectQuery } from '../../src/query/postgres/postgres-select-query'

describe('PostgresSelectQuery', () => {
  test('select', async () => {
    const connector = new SpyDbConnector()
    const query = new PostgresSelectQuery(connector, 'test_table')

    const select = ['a', 'b', 'c']

    const condition = and(
      equals('d', 'e'), // $1
      match('f', 'g'), // $2
    )

    const limit = 100
    const offset = 500
    const sortField = 'a'
    const sortDirection = 'desc'

    const expectedQuery = `SELECT "a", "b", "c" FROM "test_table" WHERE ("d" = {#1} AND "f" ILIKE '%' || {#2} || '%') ORDER BY "a" DESC LIMIT {$limit} OFFSET {$offset}`
    const expectedProps = {
      '#1': 'e',
      '#2': 'g',
      $limit: 100,
      $offset: 500,
    }

    expect(query.makeSql(select, condition, limit, offset, sortField, sortDirection)).toBe(expectedQuery)
    expect(query.makeProps(condition, limit, offset)).toEqual(expectedProps)

    await query.execute(select, condition, limit, offset, sortField, sortDirection)

    expect(connector.lastQuery).toBe(expectedQuery)
    expect(connector.lastProps).toEqual(expectedProps)
  })
})
