package postgres

import (
	"database/sql"
	"gadget_hub.com/internal/model"
)

type UserRepository struct {
	DB *sql.DB
}

func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	user := &model.User{}
	err := r.DB.QueryRow(
		`SELECT id, username, password_hash FROM users WHERE username=$1`,
		username,
	).Scan(&user.ID, &user.Username, &user.PasswordHash)
	if err != nil {
		return nil, err
	}
	return user, nil
}
