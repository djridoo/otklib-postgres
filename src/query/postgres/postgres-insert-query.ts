import { Props } from '@otklib/core'
import { DbConnector } from '@otklib/db'

export class PostgresInsertQuery<I = Props, O = Props> {
  private readonly table: string = 'unknown'
  private readonly connector: DbConnector
  private readonly returning: boolean

  constructor(connector: DbConnector, table: string, returning: boolean) {
    this.connector = connector
    this.table = table
    this.returning = returning
  }

  public makeSql(data: Props): string {
    const fieldsSql = this.makeFieldsSql(data)
    const placeholderSql = this.makePlaceholderSql(data)
    return `INSERT INTO "${this.table}" (${fieldsSql}) VALUES (${placeholderSql})${this.returning ? ' RETURNING *' : ''}`
  }

  public async execute(data: Props): Promise<Props[]> {
    const sql = this.makeSql(data)
    return this.connector.query(sql, data)
  }

  protected makePlaceholderSql(data: Props): string {
    return Object.keys(data)
      .map((key) => `{${key}}`)
      .join(', ')
  }

  protected makeFieldsSql(data: Props): string {
    return Object.keys(data)
      .map((key: string) => `"${key}"`)
      .join(', ')
  }
}
