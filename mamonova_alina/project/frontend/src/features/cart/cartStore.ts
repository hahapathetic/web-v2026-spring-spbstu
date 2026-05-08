import { create } from 'zustand'
import { useAuthStore } from '../auth/authStore'

export type CartItems = Record<number, number>

const CART_KEY = 'gadget_hub_cart_by_scope'
const LEGACY_CART_KEY = 'gadget_hub_cart'
const ANON_SCOPE = 'anon'

type CartsByScope = Record<string, CartItems>

function normalizeItems(parsed: unknown): CartItems {
  if (!parsed || typeof parsed !== 'object') return {}
  const out: CartItems = {}
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    const id = Number(k)
    const qty = Number(v)
    if (Number.isFinite(id) && Number.isFinite(qty) && qty > 0) out[id] = qty
  }
  return out
}

function getScopeKey() {
  return useAuthStore.getState().userScope || ANON_SCOPE
}

function readAllCarts(): CartsByScope {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_CART_KEY)
      if (!legacyRaw) return {}
      const legacy = normalizeItems(JSON.parse(legacyRaw))
      if (Object.keys(legacy).length === 0) return {}
      const migrated = { [getScopeKey()]: legacy }
      localStorage.setItem(CART_KEY, JSON.stringify(migrated))
      return migrated
    }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: CartsByScope = {}
    for (const [scope, items] of Object.entries(parsed as Record<string, unknown>)) {
      out[scope] = normalizeItems(items)
    }
    return out
  } catch {
    return {}
  }
}

function readCart(scope: string): CartItems {
  return readAllCarts()[scope] ?? {}
}

function writeCart(scope: string, items: CartItems) {
  const all = readAllCarts()
  all[scope] = items
  localStorage.setItem(CART_KEY, JSON.stringify(all))
}

type CartState = {
  scope: string
  items: CartItems
  totalCount: number
  getQty: (productId: number) => number
  addOne: (productId: number) => void
  removeOne: (productId: number) => void
  setQty: (productId: number, qty: number) => void
  removeMany: (productIds: number[]) => void
  clear: () => void
  syncScope: () => void
}

function calcTotalCount(items: CartItems) {
  return Object.values(items).reduce((acc, n) => acc + n, 0)
}

export const useCartStore = create<CartState>((set, get) => {
  const scope = getScopeKey()
  const initial = readCart(scope)
  return {
    scope,
    items: initial,
    totalCount: calcTotalCount(initial),
    getQty: (id) => get().items[id] ?? 0,
    addOne: (id) => {
      const next = { ...get().items, [id]: (get().items[id] ?? 0) + 1 }
      writeCart(get().scope, next)
      set({ items: next, totalCount: calcTotalCount(next) })
    },
    removeOne: (id) => {
      const current = get().items[id] ?? 0
      const next = { ...get().items }
      if (current <= 1) delete next[id]
      else next[id] = current - 1
      writeCart(get().scope, next)
      set({ items: next, totalCount: calcTotalCount(next) })
    },
    setQty: (id, qty) => {
      const next = { ...get().items }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      writeCart(get().scope, next)
      set({ items: next, totalCount: calcTotalCount(next) })
    },
    removeMany: (ids) => {
      const next = { ...get().items }
      for (const id of ids) delete next[id]
      writeCart(get().scope, next)
      set({ items: next, totalCount: calcTotalCount(next) })
    },
    clear: () => {
      writeCart(get().scope, {})
      set({ items: {}, totalCount: 0 })
    },
    syncScope: () => {
      const nextScope = getScopeKey()
      const nextItems = readCart(nextScope)
      set({ scope: nextScope, items: nextItems, totalCount: calcTotalCount(nextItems) })
    },
  }
})

useAuthStore.subscribe((state, prev) => {
  if (state.userScope !== prev.userScope) {
    useCartStore.getState().syncScope()
  }
})

