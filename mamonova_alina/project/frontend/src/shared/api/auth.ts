import { apiRequest } from './client'

export type LoginRequest = { username: string; password: string }
export type LoginResponse = { token: string }

export function apiLogin(body: LoginRequest) {
  return apiRequest<LoginResponse>('/api/login', { method: 'POST', body, auth: false })
}

