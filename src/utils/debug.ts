const warn = (msg: string) => {
  // eslint-disable-next-line no-console
  console.warn(`[SiteContainer Warn] ${msg}`)
}
const error = (msg: string) => {
  // eslint-disable-next-line no-console
  console.error(`[SiteContainer Error] ${msg}`)
}
const ok = (msg: string) => {
  // eslint-disable-next-line no-console
  console.log(`%c [SiteContainer] ${msg}`, 'color: #fff; background: #66c18c')
}

export { warn, error, ok }
