function gtag(...args) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag(...args)
}

export function ga4Event(eventName, params = {}) {
  gtag('event', eventName, params)
}

export function ga4SetUserId(userId) {
  gtag('set', { user_id: userId })
}
