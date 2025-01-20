const applyNotToMatch = (arg: string) =>
  !arg.includes(' ILIKE ')
    ? arg
    : `${arg}`
        .split(' ILIKE ')
        .map((chunk: string, i: number) => (i === 0 ? `${chunk} NOT` : chunk))
        .join(' ILIKE ')

const applyNotToEquals = (arg: string) =>
  !arg.includes('=')
    ? arg
    : `${arg}`
        .split('=')
        .map((chunk: string, i: number) => (i === 0 ? `${chunk}!` : chunk))
        .join('=')

export const not = (arg: string): string => applyNotToEquals(applyNotToMatch(arg))
export const or = (...args: string[]): string => `(${args.join(' OR ')})`
export const and = (...args: string[]): string => `(${args.join(' AND ')})`
export const equals = (field: string, placeholder: string): string => `"${field}" = ${placeholder}`
export const match = (field: string, placeholder: string): string => `"${field}" ILIKE '%' || ${placeholder} || '%'`
export const less = (field: string, placeholder: string): string => `"${field}" < ${placeholder}`
export const greater = (field: string, placeholder: string): string => `"${field}" > ${placeholder}`
export const any = (field: string, placeholder: string): string => `"${field}" = ANY (${placeholder})`
export const isNull = (field: string): string => `"${field}" IS NULL`
export const overlap = (field: string, placeholder: string): string => `"${field}" && ${placeholder}`
