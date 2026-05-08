import { apiRequest } from './client'
import type { CreateOrderRequest, CreateOrderResponse, Order } from '../../entities/order/types'

export function apiGetOrders() {
  return apiRequest<Order[]>('/api/orders', { auth: true })
}

export function apiCreateOrder(body: CreateOrderRequest) {
  return apiRequest<CreateOrderResponse>('/api/orders', { method: 'POST', body, auth: true })
}

