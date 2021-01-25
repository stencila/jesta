export const start = (): bigint => {
  return process.hrtime.bigint()
}

export const seconds = (start: bigint): number => {
  return Number(process.hrtime.bigint() - start) / 1e9
}
