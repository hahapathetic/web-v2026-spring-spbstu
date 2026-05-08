package app

import (
	"database/sql"
	"fmt"
	"gadget_hub.com/internal/config"
	"gadget_hub.com/internal/handler"
	"gadget_hub.com/internal/repository/postgres"
	"gadget_hub.com/internal/service"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"net/http"
)

type App struct {
	Config *config.Config
	Router *mux.Router
}

func New() (*App, error) {
	cfg, err := config.Load("configs/config.yaml")
	if err != nil {
		return nil, fmt.Errorf("ошибка загрузки конфигурации: %w", err)
	}

	postgresDSN := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host, cfg.Database.Port, cfg.Database.User,
		cfg.Database.Password, cfg.Database.DBName, cfg.Database.SSLMode)
	db, err := sql.Open("postgres", postgresDSN)
	if err != nil {
		return nil, fmt.Errorf("ошибка подключения к БД: %w", err)
	}
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("не удалось достучаться до БД: %w", err)
	}

	userRepository := &postgres.UserRepository{DB: db}
	productRepository := &postgres.ProductRepository{DB: db}
	orderRepository := &postgres.OrderRepository{DB: db}

	authService := &service.AuthService{UserRepository: userRepository, JWTSecret: cfg.Server.JWTSecret}
	productService := &service.ProductService{ProductRepository: productRepository}
	orderService := &service.OrderService{OrderRepository: orderRepository, ProductRepository: productRepository}

	authHandler := &handler.AuthHandler{AuthService: authService}
	goodsHandler := &handler.GoodsHandler{ProductService: productService}
	ordersHandler := &handler.OrdersHandler{OrderService: orderService}

	router := mux.NewRouter()
	router.HandleFunc("/login", authHandler.Login).Methods("POST")
	router.HandleFunc("/logout", authHandler.Logout).Methods("POST")
	router.HandleFunc("/goods", goodsHandler.GetGoods).Methods("GET")
	router.HandleFunc("/goods/{id:[0-9]+}", goodsHandler.GetGoodByID).Methods("GET")

	protected := router.PathPrefix("/").Subrouter()
	protected.Use(handler.AuthMiddleware(cfg.Server.JWTSecret))
	protected.HandleFunc("/orders", ordersHandler.GetOrders).Methods("GET")
	protected.HandleFunc("/orders", ordersHandler.CreateOrder).Methods("POST")

	router.Use(corsMiddleware)

	return &App{Config: cfg, Router: router}, nil
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
