const SESSION_KEY = 'codeconnect.session'

type StoredSession = { accessToken: string; expiresAt: number }

const listeners = new Set<() => void>()

/** Avisa quando a sessão muda (login, logout ou outra aba). Retorna a função de cancelamento. */
export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SESSION_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function notify() {
  for (const listener of listeners) listener()
}

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
  removeStored()
  const session: StoredSession = { accessToken, expiresAt: Date.now() + expiresIn * 1000 }
  try {
    const storage = remember ? window.localStorage : window.sessionStorage
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // sem storage, a sessão não é persistida
  }
  notify()
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
  removeStored()
  notify()
}

function removeStored() {
  for (const storage of storages()) {
    try {
      storage.removeItem(SESSION_KEY)
    } catch {
      // nada a limpar
    }
  }
}
