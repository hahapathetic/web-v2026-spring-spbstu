import { create } from 'zustand'

const TOKEN_KEY = 'gadget_hub_token'

type AuthState = {
  token: string | null
  isAuthed: boolean
  userScope: string | null
  setToken: (token: string, scopeHint?: string) => void
  logout: () => void
}

const SCOPE_KEY = 'gadget_hub_user_scope'

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function readScope(): string | null {
  try {
    return localStorage.getItem(SCOPE_KEY)
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const token = readToken()
  const userScope = readScope()
  return {
    token,
    isAuthed: Boolean(token),
    userScope,
    setToken: (t, scopeHint) => {
      const nextScope = scopeHint?.trim().toLowerCase() || userScope || null
      localStorage.setItem(TOKEN_KEY, t)
      if (nextScope) localStorage.setItem(SCOPE_KEY, nextScope)
      set({ token: t, isAuthed: true, userScope: nextScope })
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      set({ token: null, isAuthed: false, userScope: null })
    },
  }
})

