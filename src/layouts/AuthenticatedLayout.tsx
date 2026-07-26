import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AppContent from "../components/layout/AppContent";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { getNavigationItems } from "../config/navigation";
import { useAuth } from "../features/auth/hooks/useAuth";
import "../theme/layout.css";

function AuthenticatedLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = useMemo(
    () => getNavigationItems(currentUser?.role ?? "STUDENT"),
    [currentUser?.role],
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  if (currentUser === null) {
    return null;
  }

  return (
    <div className="app-shell" data-sidebar-open={sidebarOpen}>
      <a className="app-shell__skip-link" href="#main-content">
        Skip to main content
      </a>

      <Header
        user={currentUser}
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
        onLogout={logout}
      />

      <Sidebar
        items={navigationItems}
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <button
        className="app-shell__backdrop"
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setSidebarOpen(false)}
      />

      <AppContent>
        <Outlet />
      </AppContent>
    </div>
  );
}

export default AuthenticatedLayout;
