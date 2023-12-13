function isNumeric(val: string): boolean {
  return /^\d+(\.\d+)?$/.test(val)
}

function isDef<T>(val: T): val is NonNullable<T> {
  return val !== undefined && val !== null
}

export function addUnit(
  value: string | number,
  unit = 'px'
): string | undefined {
  if (!isDef(value)) {
    return undefined
  }

  // eslint-disable-next-line no-param-reassign
  value = String(value)
  return isNumeric(value) ? `${value}${unit}` : value
}
