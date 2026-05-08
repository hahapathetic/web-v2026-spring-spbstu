package handler

import (
	"encoding/json"
	"gadget_hub.com/internal/model"
	"gadget_hub.com/internal/service"
	"net/http"
)

type OrdersHandler struct {
	OrderService *service.OrderService
}

func (h *OrdersHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok {
		jsonError(w, http.StatusUnauthorized, "пользователь не авторизован")
		return
	}

	var req model.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "некорректные данные")
		return
	}

	orderID, err := h.OrderService.CreateOrder(userID, req)
	if err != nil {
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}

	jsonResponse(w, http.StatusCreated, map[string]interface{}{
		"order_id": orderID,
		"message":  "заказ успешно оформлен",
	})
}

func (h *OrdersHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok {
		jsonError(w, http.StatusUnauthorized, "пользователь не авторизован")
		return
	}

	orders, err := h.OrderService.GetUserOrders(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "ошибка получения заказов")
		return
	}

	jsonResponse(w, http.StatusOK, orders)
}
