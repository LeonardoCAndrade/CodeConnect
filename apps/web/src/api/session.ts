const SESSION_KEY = 'codeconnect.session'

type StoredSession = { accessToken: string; expiresAt: number }

function storages(): Storage[] {
  const result: Storage[] = []
  try {
    result.push(window.localStorage)
  } catch {
    // storage indisponível
  }
  try {
    result.push(window.sessionStorage)
  } catch {
    // storage indisponível
  }
  return result
}

export function saveSession(accessToken: string, expiresIn: number, remember: boolean) {
  clearSession()
  const session: StoredSession = { accessToken, expiresAt: Date.now() + expiresIn * 1000 }
  try {
    const storage = remember ? window.localStorage : window.sessionStorage
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // sem storage, a sessão não é persistida
  }
}

export function getAccessToken(): string | null {
  for (const storage of storages()) {
    try {
      const raw = storage.getItem(SESSION_KEY)
      if (!raw) continue
      const session = JSON.parse(raw) as Partial<StoredSession>
      if (typeof session.accessToken === 'string' && typeof session.expiresAt === 'number' && session.expiresAt > Date.now()) {
        return session.accessToken
      }
      storage.removeItem(SESSION_KEY)
    } catch {
      // ignora sessão ilegível
    }
  }
  return null
}

export function clearSession() {
  for (const storage of storages()) {
    try {
      storage.removeItem(SESSION_KEY)
    } catch {
      // nada a limpar
    }
  }
}
