export type Product = {
  id: number
  name: string
  description: string
  price: number
  rating: number
  image_url: string
  category: string
  color?: string | null
  is_new: boolean
  is_hit: boolean
}

