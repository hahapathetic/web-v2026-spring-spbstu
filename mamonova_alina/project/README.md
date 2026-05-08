# Gadget Hub Project

Инструкция по локальному запуску фронтенда и бэкенда проекта.

## Структура

- `backend` — Go API (+ PostgreSQL)
- `frontend` — React + TypeScript

## 1) Настройка БД

1. Поднимите PostgreSQL.
2. Создайте базу данных:
   - `gadget_hub_db`
3. Убедитесь, что в базе есть таблицы и данные товаров.
4. Проверьте настройки подключения в:
   - `backend/configs/config.yaml`

По умолчанию используется:

- host: `localhost`
- port: `5432`
- user: `postgres`
- password: `00000`
- dbname: `gadget_hub_db`
- sslmode: `disable`

## 2) Запуск backend

```bash
cd backend
go mod tidy
go run ./cmd/server
```

Backend стартует на порту из `backend/configs/config.yaml` (по умолчанию `8080`).

Проверка, что API доступен:

- [http://localhost:8080/goods](http://localhost:8080/goods)

## 3) Запуск frontend

Откройте второй терминал:

```bash
cd frontend
npm install
npm run dev
```

Vite поднимет приложение на локальном порту (`5173`/`5174`).

## 4) Подключение frontend к backend

Во фронтенде API base URL читается из переменной:

- `VITE_API_BASE_URL`

Файл: `frontend/src/shared/config/env.ts`

```ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
};
```

Если нужно, создайте `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Если переменная не задана, фронтенд ходит по относительным путям (`/api/...`).