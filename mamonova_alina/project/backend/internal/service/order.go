package service

import (
	"errors"
	"gadget_hub.com/internal/model"
	"gadget_hub.com/internal/repository"
)

type OrderService struct {
	OrderRepository   repository.OrderRepository
	ProductRepository repository.ProductRepository
}

func (s *OrderService) CreateOrder(userID int, req model.CreateOrderRequest) (int, error) {
	if req.Phone == "" {
		return 0, errors.New("телефон обязателен")
	}
	if req.DeliveryMethod == model.DeliveryMethodDelivery && (req.Address == nil || *req.Address == "") {
		return 0, errors.New("адрес доставки обязателен")
	}
	if len(req.Items) == 0 {
		return 0, errors.New("корзина пуста")
	}

	totalAmount := 0
	orderItems := make([]model.OrderItem, 0, len(req.Items))
	for _, item := range req.Items {
		product, err := s.ProductRepository.FindByID(item.ProductID)
		if err != nil {
			return 0, errors.New("товар не найден")
		}
		totalAmount += product.Price * item.Quantity
		orderItems = append(orderItems, model.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		})
	}

	order := &model.Order{
		TotalAmount:    totalAmount,
		Phone:          req.Phone,
		Email:          req.Email,
		DeliveryMethod: req.DeliveryMethod,
		PaymentMethod:  req.PaymentMethod,
		NeedPackaging:  req.NeedPackaging,
		Address:        req.Address,
		Items:          orderItems,
	}

	return s.OrderRepository.Create(userID, order)
}

func (s *OrderService) GetUserOrders(userID int) ([]model.Order, error) {
	return s.OrderRepository.FindByUserID(userID)
}
