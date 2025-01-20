import { and, any, equals, less, match, greater, not, or, isNull, overlap } from '@otklib/db'
import { PostgresComparerBuilder } from '../../src/query/postgres/postgres-comparer-builder'

describe('PostgresComparerBuilder', () => {
  test('compare', () => {
    const comparerBuilder = new PostgresComparerBuilder(
      and(
        equals('a', 'b'), // #1
        match('c', 'd'), // #2
        not(match('e', 'f')), // #3
        or(
          not(any('g', ['h', 'i', 'j'])), // #4
          any('k', ['l', 'm']), // #5
          less('n', 'p'), // #6
          greater('q', 'r'), // #7
        ),
        not(equals('s', 't')), // #8
        isNull('q'),
        overlap('arr', ['a', 'b', 'c']),
      ),
    )

    const result = comparerBuilder.build()
    expect(result).toEqual({
      sql: `("a" = {#1} AND "c" ILIKE '%' || {#2} || '%' AND "e" NOT ILIKE '%' || {#3} || '%' AND ("g" != ANY ({#4}) OR "k" = ANY ({#5}) OR "n" < {#6} OR "q" > {#7}) AND "s" != {#8} AND "q" IS NULL AND "arr" && {#9})`,
      values: ['b', 'd', 'f', ['h', 'i', 'j'], ['l', 'm'], 'p', 'r', 't', ['a', 'b', 'c']],
      props: {
        '#1': 'b',
        '#2': 'd',
        '#3': 'f',
        '#4': ['h', 'i', 'j'],
        '#5': ['l', 'm'],
        '#6': 'p',
        '#7': 'r',
        '#8': 't',
        '#9': ['a', 'b', 'c'],
      },
    })
  })
})
