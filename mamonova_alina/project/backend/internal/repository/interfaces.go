package repository

import "gadget_hub.com/internal/model"

type UserRepository interface {
	FindByUsername(username string) (*model.User, error)
}

type ProductRepository interface {
	FindAll(filter ProductFilter) ([]model.Product, error)
	Count(filter ProductFilter) (int, error)
	FindByID(id int) (*model.Product, error)
}

type OrderRepository interface {
	Create(userID int, order *model.Order) (int, error)
	FindByUserID(userID int) ([]model.Order, error)
}

type ProductFilter struct {
	Categories []string
	Colors     []string
	MinPrice   int
	MaxPrice   int
	Sort       string
	Page       int
	Limit      int
}

const (
	SortPriceAsc  = "price_asc"
	SortPriceDesc = "price_desc"
	SortNew       = "new"
	SortPopular   = "popular"
)
