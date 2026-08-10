import type { ReactNode } from "react";

import "../../theme/dashboard.css";

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
  invocation?: string;
  action?: ReactNode;
  children?: ReactNode;
}

function DashboardPageHeader({
  title,
  subtitle,
  invocation,
  action,
  children,
}: DashboardPageHeaderProps) {
  return (
    <header className="dashboard-heading">
      {action && <div className="dashboard-heading__action">{action}</div>}
      <h1>{title}</h1>
      {invocation && <p>{invocation}</p>}
      {subtitle && <p>{subtitle}</p>}
      {children}
    </header>
  );
}

export default DashboardPageHeader;
