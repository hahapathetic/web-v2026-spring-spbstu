import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "../../features/auth/authStore";
import { useCartStore } from "../../features/cart/cartStore";
import catalogIcon from "../../shared/assets/icons/catalog.png";
import profileIcon from "../../shared/assets/icons/profile.png";
import cartIcon from "../../shared/assets/icons/cart.svg";

export function Header() {
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const logout = useAuthStore((s) => s.logout);
  const totalCount = useCartStore((s) => s.totalCount);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="container">
        <div className="headerInner">
          <NavLink to="/" className="logo">
            <span className="logoGadget">Gadget</span>
            <span className="logoHub">Hub</span>
          </NavLink>

          <nav className="nav">
            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                clsx("navLink", isActive && "navLinkActive")
              }
            >
              <img src={catalogIcon} width={16} height={16} alt="" />
              Каталог
            </NavLink>

            {!isAuthed ? (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  clsx("navLink", isActive && "navLinkActive")
                }
              >
                <img src={profileIcon} width={16} height={16} alt="" />
                Войти
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    clsx("navLink", isActive && "navLinkActive")
                  }
                >
                  <img src={cartIcon} width={16} height={16} alt="" />
                  Корзина
                  {totalCount > 0 ? (
                    <span className="badge">{totalCount}</span>
                  ) : null}
                </NavLink>

                <button
                  type="button"
                  className="navLink"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  <img src={profileIcon} width={16} height={16} alt="" />
                  Выйти
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
