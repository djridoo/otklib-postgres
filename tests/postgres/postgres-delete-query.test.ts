import { and, equals, match } from '@otklib/db'
import { SpyDbConnector } from '../spy/spy-db-connector'
import { PostgresDeleteQuery } from '../../src/query/postgres/postgres-delete-query'

describe('PostgresDeleteQuery', () => {
  test('delete', async () => {
    const connector = new SpyDbConnector()
    const query = new PostgresDeleteQuery(connector, 'test_table')

    const condition = and(
      equals('d', 'e'), // #1
      match('f', 'g'), // #2
    )

    const expectedQuery = `DELETE FROM "test_table" WHERE ("d" = {#1} AND "f" ILIKE '%' || {#2} || '%')`
    const expectedProps = {
      '#1': 'e',
      '#2': 'g',
    }

    expect(query.makeSql(condition)).toBe(expectedQuery)
    expect(query.makeProps(condition)).toEqual(expectedProps)

    await query.execute(condition)

    expect(connector.lastQuery).toBe(expectedQuery)
    expect(connector.lastProps).toEqual(expectedProps)
  })
})
