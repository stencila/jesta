export const start = (): bigint => {
  return process.hrtime.bigint()
}

export const seconds = (start: bigint) => {
  return Number(process.hrtime.bigint() - start) / 1e9
}
