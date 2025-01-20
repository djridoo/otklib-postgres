import { Props } from '@otklib/core'
import { QueryAst, QueryAstArg, QueryAstFn, QueryAstValue } from '@otklib/db'
import { and, any, equals, greater, isNull, less, match, not, or, overlap } from './postgres-condition'
import { PostgresQueryArguments } from './postgres-query-arguments'

export class PostgresComparerBuilder {
  protected logicFns = new Map<QueryAstFn, Function>([
    [QueryAstFn.OR, or],
    [QueryAstFn.NOT, not],
    [QueryAstFn.AND, and],
  ])

  protected compareFns = new Map<QueryAstFn, Function>([
    [QueryAstFn.EQUALS, equals],
    [QueryAstFn.MATCH, match],
    [QueryAstFn.LESS, less],
    [QueryAstFn.GREATER, greater],
    [QueryAstFn.ANY, any],
    [QueryAstFn.IS_NULL, isNull],
    [QueryAstFn.OVERLAP, overlap],
  ])

  private ast: QueryAst
  private placeholderNumber: number
  private values: QueryAstValue[] = []

  constructor(ast: QueryAst, initialPlaceholderNumber: number = 1) {
    this.ast = ast
    this.placeholderNumber = initialPlaceholderNumber
  }

  public build(): PostgresQueryArguments {
    const args = this.extractArgs()
    const logicResult = this.buildLogic(args)
    if (logicResult !== null) return logicResult
    return this.buildCompare(args[0] as string, args[1] as QueryAstValue)
  }

  private extractArgs(): QueryAstArg[] {
    return this.ast.args.map((arg: QueryAstArg) => this.parseArgument(arg))
  }

  protected parseArgument(arg: QueryAstArg): QueryAstArg {
    if (typeof arg !== 'object' || !arg?.['fn'] || !arg?.['args']) return arg
    const builder = new PostgresComparerBuilder(arg as QueryAst, this.placeholderNumber)
    const { sql, values } = builder.build()
    this.placeholderNumber += values.length
    this.values.push(...values)
    return sql
  }

  private buildLogic(args: QueryAstArg[]): PostgresQueryArguments | null {
    const logicFn = this.logicFns.get(this.ast.fn)
    if (!logicFn) return null
    const sql = logicFn(...args)
    return { sql, values: this.values, props: this.makePropsFromValues() }
  }

  private buildCompare(key: string, value: QueryAstValue): PostgresQueryArguments {
    const compareFn = this.compareFns.get(this.ast.fn)
    if (!compareFn) return { sql: '', values: [], props: {} }
    const sql = compareFn(key, `{#${this.placeholderNumber}}`)
    if (this.ast.fn === QueryAstFn.IS_NULL) return { sql, values: [], props: {} }
    return { sql, values: [value], props: { '#1': value } }
  }

  private makePropsFromValues(): Props {
    return Object.fromEntries(this.values.map((value: QueryAstValue[], i: number) => [`#${i + 1}`, value]))
  }
}
