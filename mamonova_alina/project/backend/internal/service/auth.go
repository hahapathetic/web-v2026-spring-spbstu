package service

import (
	"errors"
	"gadget_hub.com/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var ErrInvalidCredentials = errors.New("неправильный логин или пароль")

type AuthService struct {
	UserRepository repository.UserRepository
	JWTSecret      string
}

func (s *AuthService) Login(username, password string) (string, error) {
	user, err := s.UserRepository.FindByUsername(username)
	if err != nil {
		return "", ErrInvalidCredentials
	}

	if user.PasswordHash != password {
		return "", ErrInvalidCredentials
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})
	return token.SignedString([]byte(s.JWTSecret))
}

func (s *AuthService) Logout() error {
	return nil
}
