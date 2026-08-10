import { Link } from "react-router-dom";

export interface DashboardAction {
  title: string;
  description: string;
  icon: string;
  to?: string;
  status?: string;
}

interface DashboardActionsProps {
  actions: readonly DashboardAction[];
  ariaLabel: string;
}

function DashboardActionContent({ action }: { action: DashboardAction }) {
  return (
    <>
      <span aria-hidden="true">{action.icon}</span>
      <strong>{action.title}</strong>
      <small>{action.description}</small>
      {action.status && <small className="dashboard-action-card__status">{action.status}</small>}
    </>
  );
}

function DashboardActions({ actions, ariaLabel }: DashboardActionsProps) {
  return (
    <nav className="dashboard-action-grid" aria-label={ariaLabel}>
      {actions.map((action) => (
        action.to ? (
          <Link className="dashboard-action-card" key={action.title} to={action.to}>
            <DashboardActionContent action={action} />
          </Link>
        ) : (
          <div
            className="dashboard-action-card dashboard-action-card--disabled"
            aria-disabled="true"
            key={action.title}
          >
            <DashboardActionContent action={action} />
          </div>
        )
      ))}
    </nav>
  );
}

export default DashboardActions;
