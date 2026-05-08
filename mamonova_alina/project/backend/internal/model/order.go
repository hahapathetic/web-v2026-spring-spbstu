package model

import "time"

const (
	DeliveryMethodDelivery = "delivery"
	OrderStatusCreated     = "оформлен"
)

type Order struct {
	ID             int         `json:"id"`
	UserID         int         `json:"user_id"`
	TotalAmount    int         `json:"total_amount"`
	Status         string      `json:"status"`
	Phone          string      `json:"phone"`
	Email          *string     `json:"email,omitempty"`
	DeliveryMethod string      `json:"delivery_method"`
	PaymentMethod  string      `json:"payment_method"`
	NeedPackaging  bool        `json:"need_packaging"`
	Address        *string     `json:"address,omitempty"`
	CreatedAt      time.Time   `json:"created_at"`
	Items          []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID        int      `json:"id"`
	OrderID   int      `json:"order_id"`
	ProductID int      `json:"product_id"`
	Quantity  int      `json:"quantity"`
	Price     int      `json:"price"`
	Product   *Product `json:"product,omitempty"`
}

type CreateOrderRequest struct {
	Items          []CartItem `json:"items"`
	Phone          string     `json:"phone"`
	Email          *string    `json:"email,omitempty"`
	DeliveryMethod string     `json:"delivery_method"`
	PaymentMethod  string     `json:"payment_method"`
	NeedPackaging  bool       `json:"need_packaging"`
	Address        *string    `json:"address,omitempty"`
}

type CartItem struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}
