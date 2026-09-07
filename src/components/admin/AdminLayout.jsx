import Categories from "../../pages/admin/Categories";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderOpen,
  FileSpreadsheet,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: ShoppingBag,
    },
    {
      path: "/admin/products",
      label: "Products",
      icon: Package,
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: FolderOpen,
    },
    {
      path: "/admin/price-list",
      label: "Price List",
      icon: FileSpreadsheet,
    },
    {
      path: "/admin/images",
      label: "Images",
      icon: Image,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="admin-layout">
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-circle">
              SPT
            </div>

            <div>
              <strong>SRI PRIYA</strong>
              <span>TRADERS</span>
            </div>
          </div>

          <button
            className="admin-close-button"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="admin-sidebar-label">
          STORE MANAGEMENT
        </div>

        <nav className="admin-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={closeSidebar}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink
            to="/"
            className="admin-store-link"
            onClick={closeSidebar}
          >
            <Store size={18} />
            <span>View Store</span>
          </NavLink>

          <button
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="admin-topbar-title">
            <strong>Sri Priya Traders</strong>
            <span>Admin Panel</span>
          </div>

          <div className="admin-user">
            <div className="admin-user-avatar">
              {user?.email?.charAt(0).toUpperCase() ||
                "A"}
            </div>

            <div className="admin-user-info">
              <strong>Admin</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;