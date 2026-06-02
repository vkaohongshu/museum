import { FormEvent, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={searchParams.get("redirect") ?? "/admin"} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate(searchParams.get("redirect") ?? "/admin", { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    }
  }

  return (
    <main className="public-main">
      <section className="panel" style={{ maxWidth: 420, margin: "8vh auto" }}>
        <div className="page-stack">
          <div>
            <p className="eyebrow">Life Museum Studio</p>
            <h1>登录创作工作室</h1>
          </div>
          <form className="editor-form" onSubmit={handleSubmit}>
            <label>
              邮箱
              <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>
            <label>
              密码
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
            </label>
            {error ? <p className="todo-note">{error}</p> : null}
            <button className="primary-button" type="submit">进入 Studio</button>
          </form>
        </div>
      </section>
    </main>
  );
}
