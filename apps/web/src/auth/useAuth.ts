import { useCallback, useSyncExternalStore } from 'react'
import { clearSession, getAccessToken, saveSession, subscribeSession } from '../api/session'

const isLoggedIn = () => getAccessToken() !== null

/** Estado da sessão, atualizado a cada login, logout ou mudança em outra aba. */
export function useAuth() {
  const isAuthenticated = useSyncExternalStore(subscribeSession, isLoggedIn)
  const signIn = useCallback((accessToken: string, expiresIn: number, remember: boolean) => {
    saveSession(accessToken, expiresIn, remember)
  }, [])
  const signOut = useCallback(() => clearSession(), [])
  return { isAuthenticated, signIn, signOut }
}
