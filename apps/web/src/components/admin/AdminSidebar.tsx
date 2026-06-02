import {
  Archive,
  CalendarDays,
  FileText,
  Folder,
  Heart,
  Home,
  Image,
  Lightbulb,
  Map,
  MessageCircle,
  NotebookPen,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const studioNav = [
  { to: "/admin", label: "创作工作台", icon: Home, end: true },
  { to: "/admin/articles", label: "文章工作台", icon: FileText },
  { to: "/admin/moments", label: "碎碎念时间流", icon: MessageCircle },
  { to: "/admin/gallery", label: "事件相册", icon: Image },
  { to: "/admin/inspirations", label: "灵感便签墙", icon: Lightbulb },
  { to: "/admin/mood-calendar", label: "心情日历", icon: Heart },
  { to: "/admin/taxonomy", label: "分类与标签", icon: Folder },
  { to: "/admin/notes", label: "便签", icon: NotebookPen },
  { to: "/admin/capsules", label: "记忆胶囊", icon: CalendarDays },
  { to: "/admin/locations", label: "人生地图", icon: Map },
  { to: "/admin/backups", label: "数据生命线", icon: Archive },
  { to: "/admin/settings", label: "工作室设置", icon: Settings }
];

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar studio-sidebar">
      <div className="admin-brand">
        <strong>人生记录 Studio</strong>
        <span>Write · Collect · Remember</span>
      </div>
      <nav className="admin-nav" aria-label="Studio 导航">
        {studioNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "admin-nav-item active" : "admin-nav-item")}>
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
