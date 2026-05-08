import type { Product } from '../product/types'

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product | null
}

export type Order = {
  id: number
  user_id: number
  total_amount: number
  status: string
  phone: string
  email?: string | null
  delivery_method: string
  payment_method: string
  need_packaging: boolean
  address?: string | null
  created_at: string
  items?: OrderItem[]
}

export type CreateOrderRequest = {
  items: Array<{ product_id: number; quantity: number }>
  phone: string
  email?: string | null
  delivery_method: 'pickup' | 'delivery' | string
  payment_method: 'card' | 'cash' | string
  need_packaging: boolean
  address?: string | null
}

export type CreateOrderResponse = { order_id: number; message: string }

