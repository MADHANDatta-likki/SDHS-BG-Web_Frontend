import { useEffect, useId, useRef, useState } from "react";

import type { AuthenticatedUser } from "../../features/auth/types/AuthenticatedUser";

interface UserMenuProps {
  user: AuthenticatedUser;
}

function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current !== null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="app-user-menu" ref={containerRef}>
      <button
        className="app-user-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="app-user-menu__avatar" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="app-user-menu__summary">
          <span className="app-user-menu__name">{user.name}</span>
          <span className="app-user-menu__role">{user.role}</span>
        </span>
        <span className="app-user-menu__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          className="app-user-menu__panel"
          role="dialog"
          aria-label="User profile"
        >
          <div className="app-user-menu__panel-name">{user.name}</div>
          <div className="app-user-menu__panel-row">
            <span>Volunteer ID</span>
            <strong>{user.volunteerId}</strong>
          </div>
          <div className="app-user-menu__panel-row">
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>
          {user.groupId !== "" ? (
            <div className="app-user-menu__panel-row">
              <span>Group</span>
              <strong>{user.groupId}</strong>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default UserMenu;
