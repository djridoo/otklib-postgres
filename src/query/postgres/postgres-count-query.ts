import { Props } from '@otklib/core'
import { DbConnector, QueryAst } from '@otklib/db'
import { PostgresComparerBuilder } from './postgres-comparer-builder'

export class PostgresCountQuery {
  private readonly table: string = 'unknown'

  private readonly connector: DbConnector

  constructor(connector: DbConnector, table: string) {
    this.connector = connector
    this.table = table
  }

  public makeSql(ast: QueryAst): string {
    const conditionSql = this.makeConditionSql(ast)
    return `SELECT COUNT(TRUE) as "count" FROM "${this.table}" WHERE ${conditionSql}`
  }

  public makeProps(ast: QueryAst): Props {
    const builder = new PostgresComparerBuilder(ast)
    return builder.build().props
  }

  public async execute(ast: QueryAst): Promise<number> {
    const sql = this.makeSql(ast)
    const props = this.makeProps(ast)
    const rows = this.connector.query(sql, props)
    return rows[0]?.count || 0
  }

  protected makeConditionSql(ast: QueryAst): string {
    const builder = new PostgresComparerBuilder(ast)
    return builder.build().sql
  }
}
