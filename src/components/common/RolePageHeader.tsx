import type { ReactNode } from "react";

interface RolePageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className: string;
}

function RolePageHeader({ title, description, action, className }: RolePageHeaderProps) {
  return (
    <header className={className}>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

export default RolePageHeader;
