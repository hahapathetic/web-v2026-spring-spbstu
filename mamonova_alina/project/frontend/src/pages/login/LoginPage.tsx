import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../features/auth/authStore";
import { apiLogin } from "../../shared/api/auth";
import "./login.css";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const setToken = useAuthStore((s) => s.setToken);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/";
  }, [location.state]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ username: false, password: false });

  const usernameError = touched.username && username.trim().length === 0;
  const passwordError = touched.password && password.trim().length === 0;

  const login = useMutation({
    mutationFn: () => apiLogin({ username, password }),
    onSuccess: (res) => {
      setToken(res.token, username);
      navigate(from, { replace: true });
    },
  });

  if (isAuthed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="loginStage">
      <div className="loginCard">
        <div className="loginTitle">Добро пожаловать!</div>

        <form
          style={{ display: "grid", gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            setTouched({ username: true, password: true });
            if (!username.trim() || !password.trim()) return;
            login.mutate();
          }}
        >
          <label style={{ display: "grid" }}>
            <div className="fieldLabel">
              Логин<span className="reqStar">*</span>
            </div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              className={usernameError ? "field fieldError" : "field"}
            />
          </label>

          <label style={{ display: "grid" }}>
            <div className="fieldLabel">
              Пароль<span className="reqStar">*</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={passwordError ? "field fieldError" : "field"}
            />
          </label>

          <button type="submit" disabled={login.isPending} className="loginBtn">
            Войти
          </button>

          {login.isError ? (
            <div className="loginError">
              Такого пользователя нет, возможно неправильный логин или пароль -
              проверьте данные
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
