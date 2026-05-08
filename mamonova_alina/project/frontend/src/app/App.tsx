import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../widgets/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../pages/home/HomePage'
import { LoginPage } from '../pages/login/LoginPage'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { CartPage } from '../pages/cart/CartPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

