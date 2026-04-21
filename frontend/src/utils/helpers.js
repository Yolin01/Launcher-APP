// ── Formatage de dates ────────────────────────────
export const formatDate = (iso) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
    .format(new Date(iso))
// ── Troncature de texte ───────────────────────────
export const truncate = (str, max = 30) =>
  str.length > max ? str.slice(0, max) + '…' : str
// ── Debounce ──────────────────────────────────────
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
// ── Initiales depuis un nom ───────────────────────
export const initials = (name = '') =>
  name.split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
// ── Validation URL ────────────────────────────────
export const isValidUrl = (str) => {
  try { new URL(str); return true }
  catch { return false }
}