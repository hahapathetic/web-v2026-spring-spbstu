package handler

import (
	"context"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"strings"
)

type contextKey string

const UserIDKey contextKey = "userID"

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				jsonError(w, http.StatusUnauthorized, "требуется авторизация")
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				return []byte(jwtSecret), nil
			})
			if err != nil || !token.Valid {
				jsonError(w, http.StatusUnauthorized, "невалидный токен")
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				jsonError(w, http.StatusUnauthorized, "невалидные claims")
				return
			}

			userIDFloat, ok := claims["user_id"].(float64)
			if !ok {
				jsonError(w, http.StatusUnauthorized, "отсутствует user_id")
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, int(userIDFloat))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserID(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(UserIDKey).(int)
	return id, ok
}
