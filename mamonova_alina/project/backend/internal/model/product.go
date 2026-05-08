package model

type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       int     `json:"price"`
	Rating      float64 `json:"rating"`
	ImageURL    string  `json:"image_url"`
	Category    string  `json:"category"`
	Color       *string `json:"color,omitempty"`
	IsNew       bool    `json:"is_new"`
	IsHit       bool    `json:"is_hit"`
}
