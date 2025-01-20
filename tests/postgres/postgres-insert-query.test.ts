import { Props } from '@otklib/core'
import { SpyDbConnector } from '../spy/spy-db-connector'
import { PostgresInsertQuery } from '../../src/query/postgres/postgres-insert-query'

describe('PostgresInsertQuery', () => {
  test('insert', async () => {
    const connector = new SpyDbConnector()
    const query = new PostgresInsertQuery(connector, 'test_table', false)

    const data: Props = {
      d: 'some-string',
      a: 1,
      b: false,
      k: true,
      e: null,
      c: [1, 2, 3],
    }

    const expectedQuery = `INSERT INTO "test_table" ("d", "a", "b", "k", "e", "c") VALUES ({d}, {a}, {b}, {k}, {e}, {c})`

    expect(query.makeSql(data)).toBe(expectedQuery)

    await query.execute(data)

    expect(connector.lastQuery).toBe(expectedQuery)
    expect(connector.lastProps).toEqual(data)
  })
})
