package handler

import (
	"gadget_hub.com/internal/repository"
	"gadget_hub.com/internal/service"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
	"strings"
)

type GoodsHandler struct {
	ProductService *service.ProductService
}

func (h *GoodsHandler) GetGoods(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	minPrice, _ := strconv.Atoi(query.Get("min_price"))
	maxPrice, _ := strconv.Atoi(query.Get("max_price"))
	sort := query.Get("sort")
	page, _ := strconv.Atoi(query.Get("page"))
	limit, _ := strconv.Atoi(query.Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 9
	}

	filter := repository.ProductFilter{
		Categories: splitCSVQuery(query.Get("category")),
		Colors:     splitCSVQuery(query.Get("color")),
		MinPrice:   minPrice,
		MaxPrice:   maxPrice,
		Sort:       sort,
		Page:       page,
		Limit:      limit,
	}

	products, err := h.ProductService.GetProducts(filter)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "ошибка получения товаров")
		return
	}

	total, err := h.ProductService.CountProducts(filter)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "ошибка получения количества товаров")
		return
	}

	w.Header().Set("X-Total-Count", strconv.Itoa(total))
	jsonResponse(w, http.StatusOK, products)
}

func splitCSVQuery(rawValue string) []string {
	if rawValue == "" {
		return nil
	}
	parts := strings.Split(rawValue, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			values = append(values, trimmed)
		}
	}
	return values
}

func (h *GoodsHandler) GetGoodByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		jsonError(w, http.StatusBadRequest, "некорректный id")
		return
	}

	product, err := h.ProductService.GetProductByID(id)
	if err != nil {
		jsonError(w, http.StatusNotFound, "товар не найден")
		return
	}
	jsonResponse(w, http.StatusOK, product)
}
