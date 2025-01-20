import { Props } from '@otklib/core'
import { DbConnector } from '@otklib/db'

export class SpyDbConnector implements DbConnector {
  public lastQuery: string
  public lastProps: Props

  public async query(sql: string, props: Props): Promise<Props[]> {
    this.lastQuery = sql
    this.lastProps = props
    return []
  }
}
