import { NavLink } from "react-router-dom";

import type { NavigationItemConfig } from "../../config/navigation";

interface NavigationItemProps {
  item: NavigationItemConfig;
  onNavigate: () => void;
}

function NavigationItem({ item, onNavigate }: NavigationItemProps) {
  return (
    <li className="app-navigation__item">
      <NavLink
        className={({ isActive }) =>
          `app-navigation__link${isActive ? " app-navigation__link--active" : ""}`
        }
        to={item.path}
        onClick={onNavigate}
      >
        <span className="app-navigation__marker" aria-hidden="true" />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

export default NavigationItem;
