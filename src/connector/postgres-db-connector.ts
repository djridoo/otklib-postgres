import { Pool, PoolConfig } from 'pg'
import { Props, PropValue } from '@otklib/core'
import { DbConnector } from '@otklib/db'

export class PostgresDbConnector implements DbConnector {
  private db: Pool

  constructor(config: PoolConfig) {
    this.db = new Pool(config)
  }

  public async query(sql: string, props: Props): Promise<Props[]> {
    const client = await this.db.connect()
    const entries = Object.entries(props)
    const pgValues: PropValue[] = []
    let pgSql = sql
    for (let i = 0; i < entries.length; i++) {
      const [prop, value] = entries[i]
      pgSql = pgSql.split(`{${prop}}`).join(`$${i + 1}`)
      pgValues.push(value)
    }

    try {
      const result = await client.query(pgSql, pgValues)

      client.release()

      return result.rows
    } catch (error) {
      client.release()

      throw error
    }
  }
}
