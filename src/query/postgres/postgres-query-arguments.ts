import { Props } from '@otklib/core'
import { QueryAstValue } from '@otklib/db'

export interface PostgresQueryArguments {
  sql: string
  values: QueryAstValue[]
  props: Props
}
