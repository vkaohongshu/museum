import { FormEvent, ReactNode, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { isAdminSession, setAdminSession } from "../../utils/storage";

const localPassword = "admin123";

export function AdminGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(() => isAdminSession());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (password === localPassword) {
      setAdminSession(true);
      setAllowed(true);
      setError("");
      return;
    }
    setError("本地密码不正确");
  }

  if (allowed) return <>{children}</>;

  return (
    <div className="admin-gate">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-icon"><LockKeyhole size={28} /></div>
        <h1>进入创作工作室</h1>
        <p>这是 MVP 本地保护，只用于区分前台展厅和 Studio。正式上线必须接入真实认证、权限控制和服务端校验。</p>
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="输入本地密码 admin123" type="password" />
        {error ? <span className="form-error">{error}</span> : null}
        <button className="primary-button" type="submit">进入后台</button>
      </form>
    </div>
  );
}
