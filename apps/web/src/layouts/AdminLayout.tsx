import { Outlet, useLocation } from "react-router-dom";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminGate } from "../components/admin/AdminGate";
import { useLife } from "../context/LifeContext";

export function AdminLayout() {
  const { settings } = useLife();
  const location = useLocation();

  return (
    <AdminGate>
      <div className={`admin-shell theme-${settings.theme}`}>
        <AdminSidebar />
        <main className="admin-main">
          <AdminHeader />
          <div className="route-frame admin-route" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </AdminGate>
  );
}
