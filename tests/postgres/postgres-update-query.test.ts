import { Props } from '@otklib/core'
import { and, equals, match } from '@otklib/db'
import { SpyDbConnector } from '../spy/spy-db-connector'
import { PostgresUpdateQuery } from '../../src/query/postgres/postgres-update-query'

describe('PostgresUpdateQuery', () => {
  test('update', async () => {
    const connector = new SpyDbConnector()
    const query = new PostgresUpdateQuery(connector, 'test_table', false)

    const data: Props = {
      d: 'some-string', // #1
      c: [1, 2, 3], // #2
    }

    const condition = and(
      equals('a', 'k'), // #3
      match('b', 'l'), // #4
    )

    const expectedQuery = `UPDATE "test_table" SET "d" = {d}, "c" = {c} WHERE ("a" = {#1} AND "b" ILIKE '%' || {#2} || '%')`
    const expectedProps = { d: 'some-string', c: [1, 2, 3], '#1': 'k', '#2': 'l' }

    expect(query.makeSql(data, condition)).toBe(expectedQuery)
    expect(query.makeProps(data, condition)).toEqual(expectedProps)

    await query.execute(data, condition)

    expect(connector.lastQuery).toBe(expectedQuery)
    expect(connector.lastProps).toEqual(expectedProps)
  })
})
