import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clearAdminSession } from "../../utils/storage";

export function AdminHeader() {
  const navigate = useNavigate();

  function logout() {
    clearAdminSession();
    navigate("/");
  }

  return (
    <header className="admin-header">
      <div>
        <strong>创作工作室 Studio</strong>
        <span>这里用于写作、整理照片、记录心情和收纳灵感。</span>
      </div>
      <div className="admin-header-actions">
        <Link className="secondary-button" to="/">查看前台</Link>
        <button className="ghost-button" onClick={logout} type="button"><LogOut size={17} />退出</button>
      </div>
    </header>
  );
}
