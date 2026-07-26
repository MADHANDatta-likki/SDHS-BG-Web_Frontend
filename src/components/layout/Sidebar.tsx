import NavigationItem from "./NavigationItem";
import type { NavigationItemConfig } from "../../config/navigation";

interface SidebarProps {
  items: NavigationItemConfig[];
  open: boolean;
  onNavigate: () => void;
}

function Sidebar({ items, open, onNavigate }: SidebarProps) {
  return (
    <aside
      id="application-sidebar"
      className="app-sidebar"
      aria-label="Application navigation"
      data-open={open}
    >
      <div className="app-sidebar__heading">Navigation</div>
      <nav aria-label="Role navigation">
        <ul className="app-navigation">
          {items.map((item) => (
            <NavigationItem
              key={item.path}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
