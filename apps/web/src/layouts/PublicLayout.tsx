import { Camera, Clock3, FileText, Home, Image, Info, MessageCircle, Newspaper, Sparkles, Trophy } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useLife } from "../context/LifeContext";

const publicNav = [
  { to: "/", label: "首页", icon: Home },
  { to: "/articles", label: "文章", icon: FileText },
  { to: "/moments", label: "碎碎念", icon: MessageCircle },
  { to: "/gallery", label: "图库", icon: Image },
  { to: "/timeline", label: "时间线", icon: Clock3 },
  { to: "/monthly-digest", label: "月度小报", icon: Newspaper },
  { to: "/year-review", label: "年度回顾", icon: Trophy },
  { to: "/about", label: "关于", icon: Info }
];

export function PublicLayout() {
  const { settings } = useLife();
  const location = useLocation();

  return (
    <div className={`app-shell public-shell theme-${settings.theme}`}>
      <aside className="sidebar public-sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><Sparkles size={22} /></span>
          <span>
            <strong>{settings.siteName}</strong>
            <small>{settings.siteDescription}</small>
          </span>
        </NavLink>

        <nav className="nav-list" aria-label="前台导航">
          {publicNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <Camera size={20} />
          <strong>公开展厅</strong>
          <p>这里是人生记录馆的阅读展厅，创作与维护都在 Studio 中完成。</p>
        </div>
      </aside>

      <main className="main-content">
        <div className="route-frame" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
