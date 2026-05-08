import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div>
      <h1 className="h24">Страница не найдена</h1>
      <p className="p16" style={{ marginTop: 8 }}>
        Вернуться на <Link to="/">главную</Link>.
      </p>
    </div>
  )
}

