import { Props } from '@otklib/core'
import { DbConnector, QueryAst } from '@otklib/db'
import { PostgresComparerBuilder } from './postgres-comparer-builder'

export type Limit = number | null
export type Offset = number | null
export type Select = string[] | '*'
export type SortDirection = string

export class PostgresSelectQuery {
  private readonly table: string = 'unknown'

  private readonly connector: DbConnector

  constructor(connector: DbConnector, table: string) {
    this.connector = connector
    this.table = table
  }

  public makeSql(
    select: Select,
    ast: QueryAst,
    limit: Limit = null,
    offset: Offset = null,
    sortField: string | null = null,
    sortDirection: SortDirection | null = null,
  ): string {
    const selectSql = this.makeSelectSql(select)
    const conditionSql = this.makeConditionSql(ast)
    const sortSql = this.makeSortSql(sortField, sortDirection)
    const boundariesSql = this.makeBoundariesSql(ast, limit, offset)
    return `SELECT ${selectSql} FROM "${this.table}"${conditionSql}${sortSql}${boundariesSql}`
  }

  public makeProps(ast: QueryAst, limit: Limit = null, offset: Offset = null): Props {
    const builder = new PostgresComparerBuilder(ast)
    const props = { ...builder.build().props }
    if (limit !== null) props['$limit'] = limit
    if (offset !== null) props['$offset'] = offset
    return props
  }

  public async execute(
    select: Select,
    ast: QueryAst,
    limit: number | null = null,
    offset: number | null = null,
    sortField: string | null = null,
    sortDirection: SortDirection | null = null,
  ): Promise<Props[]> {
    const sql = this.makeSql(select, ast, limit, offset, sortField, sortDirection)
    const props = this.makeProps(ast, limit, offset)
    return this.connector.query(sql, props)
  }

  protected makeConditionSql(ast: QueryAst): string {
    const builder = new PostgresComparerBuilder(ast)
    const sql = builder.build().sql
    if (sql !== '()') return ` WHERE ${sql}`
    return ''
  }

  protected makeSelectSql(select: string[] | '*'): string {
    if (select === '*') return '*'
    return select.map((field: string) => `"${field}"`).join(', ')
  }

  protected makeSortSql(sortField: string | null = null, sortDirection: SortDirection | null = null): string {
    const sqlChunks: string[] = []
    if (sortField !== null) sqlChunks.push(` ORDER BY "${sortField}"`)
    if (sortField !== null && sortDirection !== null) sqlChunks.push(` ${sortDirection.toUpperCase()}`)
    return sqlChunks.join('')
  }

  protected makeBoundariesSql(ast: QueryAst, limit: number | null = null, offset: number | null = null): string {
    const sqlChunks: string[] = []
    if (limit !== null) sqlChunks.push(` LIMIT {$limit}`)
    if (offset !== null) sqlChunks.push(` OFFSET {$offset}`)
    return sqlChunks.join('')
  }
}
