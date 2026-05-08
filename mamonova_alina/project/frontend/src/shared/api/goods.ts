import { useAuthStore } from "../../features/auth/authStore";
import { env } from "../config/env";
import { ApiError, apiRequest } from "./client";
import type { Product } from '../../entities/product/types'

export function apiGetGoods(params?: {
  sort?: string
  page?: number
  limit?: number
  category?: string | string[]
  color?: string | string[]
  min_price?: number
  max_price?: number
}) {
  const sp = new URLSearchParams()
  if (params?.sort) sp.set('sort', params.sort)
  if (params?.page) sp.set('page', String(params.page))
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.category) {
    sp.set(
      "category",
      Array.isArray(params.category) ? params.category.join(",") : params.category,
    );
  }
  if (params?.color) {
    sp.set("color", Array.isArray(params.color) ? params.color.join(",") : params.color);
  }
  if (typeof params?.min_price === 'number') sp.set('min_price', String(params.min_price))
  if (typeof params?.max_price === 'number') sp.set('max_price', String(params.max_price))

  const q = sp.toString()
  return apiRequest<Product[]>(`/api/goods${q ? `?${q}` : ''}`, { auth: true })
}

export function apiGetGoodById(id: number) {
  return apiRequest<Product>(`/api/goods/${id}`, { auth: true })
}

export async function apiGetGoodsPage(params?: {
  sort?: string;
  page?: number;
  limit?: number;
  category?: string[];
  color?: string[];
  min_price?: number;
  max_price?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.category?.length) sp.set("category", params.category.join(","));
  if (params?.color?.length) sp.set("color", params.color.join(","));
  if (typeof params?.min_price === "number") sp.set("min_price", String(params.min_price));
  if (typeof params?.max_price === "number") sp.set("max_price", String(params.max_price));

  const query = sp.toString();
  const path = `/api/goods${query ? `?${query}` : ""}`;
  const baseUrl = env.apiBaseUrl?.trim() ?? "";
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const token = useAuthStore.getState().token;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = (await response.json()) as { error?: string; message?: string };
      message = data.error || data.message || message;
    } catch {
      message = message || response.statusText;
    }
    throw new ApiError(response.status, message);
  }

  const items = (await response.json()) as Product[];
  const headerValue = response.headers.get("X-Total-Count");
  const total = headerValue ? Number(headerValue) : items.length;

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
  };
}

