import { Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Header } from './Header'
import { Footer } from './Footer'
import './layout.css'

export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="appRoot">
      <Header />
      <main
        className={clsx(
          'appMain',
          pathname === '/cart' && 'appMainCart',
          pathname === '/login' && 'appMainLogin',
        )}
      >
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

