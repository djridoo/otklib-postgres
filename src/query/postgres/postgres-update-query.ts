import { Props } from '@otklib/core'
import { DbConnector, QueryAst } from '@otklib/db'
import { PostgresComparerBuilder } from './postgres-comparer-builder'

export class PostgresUpdateQuery {
  private readonly table: string = 'unknown'
  private readonly connector: DbConnector
  private readonly returning: boolean

  constructor(connector: DbConnector, table: string, returning: boolean) {
    this.connector = connector
    this.table = table
    this.returning = returning
  }

  public makeSql(data: Props, ast: QueryAst): string {
    const setSql = this.makeSetSql(data)
    const conditionSql = this.makeConditionSql(ast)
    return `UPDATE "${this.table}" SET ${setSql} WHERE ${conditionSql}${this.returning ? ' RETURNING *' : ''}`
  }

  public makeProps(data: Props, ast: QueryAst): Props {
    const builder = new PostgresComparerBuilder(ast)
    const { props } = builder.build()
    return { ...data, ...props }
  }

  public async execute(data: Props, condition: QueryAst): Promise<Props[]> {
    const sql = this.makeSql(data, condition)
    const props = this.makeProps(data, condition)
    return this.connector.query(sql, props)
  }

  protected makeConditionSql(ast: QueryAst): string {
    const builder = new PostgresComparerBuilder(ast)
    return builder.build().sql
  }

  protected makeSetSql(data: Props): string {
    return Object.keys(data)
      .map((key: string) => `"${key}" = {${key}}`)
      .join(', ')
  }
}
