const store = new Map()
const EXPIRATION = 5 * 60 * 1000 // 5 минут

module.exports = {
  set: (phone, code) => {
    store.set(phone, { code, ts: Date.now() })
    setTimeout(() => store.delete(phone), EXPIRATION)
  },
  get: (phone) => {
    const entry = store.get(phone)
    if (!entry) return null
    if (Date.now() - entry.ts > EXPIRATION) {
      store.delete(phone)
      return null
    }
    return entry.code
  },
  delete: (phone) => store.delete(phone)
}
