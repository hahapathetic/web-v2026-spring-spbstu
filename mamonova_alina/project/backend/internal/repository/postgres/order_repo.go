package postgres

import (
	"database/sql"
	"gadget_hub.com/internal/model"
	"time"
)

type OrderRepository struct {
	DB *sql.DB
}

func (r *OrderRepository) Create(userID int, order *model.Order) (int, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	needPackaging := 0
	if order.NeedPackaging {
		needPackaging = 1
	}

	var orderID int
	err = tx.QueryRow(`
        INSERT INTO orders (user_id, total_amount, status, phone, email, delivery_method, payment_method, need_packaging, address, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
		userID, order.TotalAmount, model.OrderStatusCreated, order.Phone, order.Email,
		order.DeliveryMethod, order.PaymentMethod, needPackaging, order.Address, time.Now(),
	).Scan(&orderID)
	if err != nil {
		return 0, err
	}

	for _, item := range order.Items {
		_, err = tx.Exec(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)`,
			orderID, item.ProductID, item.Quantity, item.Price,
		)
		if err != nil {
			return 0, err
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, err
	}
	return orderID, nil
}

func (r *OrderRepository) FindByUserID(userID int) ([]model.Order, error) {
	rows, err := r.DB.Query(`
        SELECT id, user_id, total_amount, status, phone, email, delivery_method, payment_method, need_packaging, address, created_at
        FROM orders WHERE user_id=$1 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var o model.Order
		var needPack bool
		err := rows.Scan(&o.ID, &o.UserID, &o.TotalAmount, &o.Status,
			&o.Phone, &o.Email, &o.DeliveryMethod, &o.PaymentMethod,
			&needPack, &o.Address, &o.CreatedAt)
		if err != nil {
			return nil, err
		}
		o.NeedPackaging = needPack
		orders = append(orders, o)
	}

	for i := range orders {
		items, err := r.getOrderItems(orders[i].ID)
		if err != nil {
			return nil, err
		}
		orders[i].Items = items
	}
	return orders, nil
}

func (r *OrderRepository) getOrderItems(orderID int) ([]model.OrderItem, error) {
	rows, err := r.DB.Query(`
        SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
               p.id, p.name, p.price, p.rating, p.image_url, p.category, p.color
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.OrderItem
	for rows.Next() {
		var item model.OrderItem
		var product model.Product
		var color sql.NullString
		err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Quantity, &item.Price,
			&product.ID, &product.Name, &product.Price, &product.Rating,
			&product.ImageURL, &product.Category, &color)
		if err != nil {
			return nil, err
		}
		if color.Valid {
			product.Color = &color.String
		}
		item.Product = &product
		items = append(items, item)
	}
	return items, nil
}
