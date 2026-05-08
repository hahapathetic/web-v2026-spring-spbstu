package postgres

import (
	"database/sql"
	"fmt"
	"gadget_hub.com/internal/model"
	"gadget_hub.com/internal/repository"
	"strings"
	"time"
)

type ProductRepository struct {
	DB *sql.DB
}

func (r *ProductRepository) FindAll(filter repository.ProductFilter) ([]model.Product, error) {
	whereClause, args, nextArgIndex := buildProductFilterWhere(filter)
	query := `SELECT id, name, description, price, rating, image_url, category, color, is_new, is_hit FROM products WHERE 1=1` + whereClause

	switch filter.Sort {
	case repository.SortPriceAsc:
		query += " ORDER BY price ASC"
	case repository.SortPriceDesc:
		query += " ORDER BY price DESC"
	case repository.SortNew:
		query += " ORDER BY is_new DESC, id DESC"
	case repository.SortPopular:
		query += " ORDER BY rating DESC"
	default:
		query += " ORDER BY id"
	}

	if filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", nextArgIndex, nextArgIndex+1)
		args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	}

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		var color sql.NullString
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Rating,
			&p.ImageURL, &p.Category, &color, &p.IsNew, &p.IsHit)
		if err != nil {
			return nil, err
		}
		if color.Valid {
			p.Color = &color.String
		}
		products = append(products, p)
	}
	time.Sleep(1 * time.Second)
	return products, nil
}

func (r *ProductRepository) Count(filter repository.ProductFilter) (int, error) {
	whereClause, args, _ := buildProductFilterWhere(filter)
	query := `SELECT COUNT(*) FROM products WHERE 1=1` + whereClause

	var total int
	if err := r.DB.QueryRow(query, args...).Scan(&total); err != nil {
		return 0, err
	}

	return total, nil
}

func buildProductFilterWhere(filter repository.ProductFilter) (string, []interface{}, int) {
	queryBuilder := strings.Builder{}
	args := make([]interface{}, 0, 6)
	argIndex := 1

	if len(filter.Categories) > 0 {
		queryBuilder.WriteString(" AND (")
		for index, category := range filter.Categories {
			if index > 0 {
				queryBuilder.WriteString(" OR ")
			}
			queryBuilder.WriteString(fmt.Sprintf("LOWER(TRIM(category)) LIKE '%%' || LOWER(TRIM($%d)) || '%%'", argIndex))
			args = append(args, category)
			argIndex++
		}
		queryBuilder.WriteString(")")
	}

	if len(filter.Colors) > 0 {
		queryBuilder.WriteString(" AND (")
		for index, color := range filter.Colors {
			if index > 0 {
				queryBuilder.WriteString(" OR ")
			}
			queryBuilder.WriteString(fmt.Sprintf("LOWER(TRIM(color)) = LOWER(TRIM($%d))", argIndex))
			args = append(args, color)
			argIndex++
		}
		queryBuilder.WriteString(")")
	}

	if filter.MinPrice > 0 {
		queryBuilder.WriteString(fmt.Sprintf(" AND price >= $%d", argIndex))
		args = append(args, filter.MinPrice)
		argIndex++
	}

	if filter.MaxPrice > 0 {
		queryBuilder.WriteString(fmt.Sprintf(" AND price <= $%d", argIndex))
		args = append(args, filter.MaxPrice)
		argIndex++
	}

	return queryBuilder.String(), args, argIndex
}

func (r *ProductRepository) FindByID(id int) (*model.Product, error) {
	product := &model.Product{}
	var color sql.NullString
	err := r.DB.QueryRow(`SELECT id, name, description, price, rating, image_url, category, color, is_new, is_hit FROM products WHERE id=$1`, id).
		Scan(&product.ID, &product.Name, &product.Description, &product.Price, &product.Rating,
			&product.ImageURL, &product.Category, &color, &product.IsNew, &product.IsHit)
	if err != nil {
		return nil, err
	}
	if color.Valid {
		product.Color = &color.String
	}
	return product, nil
}
