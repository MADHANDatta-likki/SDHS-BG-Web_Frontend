import type { AuthenticatedUser } from "../../features/auth/types/AuthenticatedUser";
import UserMenu from "./UserMenu";

interface HeaderProps {
  user: AuthenticatedUser;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  onLogout: () => void;
}

function Header({
  user,
  sidebarOpen,
  onMenuToggle,
  onLogout,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand-group">
        <button
          className="app-header__menu-toggle"
          type="button"
          aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="application-sidebar"
          aria-expanded={sidebarOpen}
          onClick={onMenuToggle}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div className="app-header__logo" aria-label="SDHS logo placeholder">
          SDHS
        </div>
        <div className="app-header__title">Bhagavad Gita Memorization</div>
      </div>

      <div className="app-header__actions">
        <UserMenu user={user} />
        <button
          className="app-header__logout"
          type="button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
