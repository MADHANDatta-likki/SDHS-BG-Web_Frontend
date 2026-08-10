interface AdminBadgeProps {
  children: React.ReactNode;
  tone?: "active" | "inactive" | "dropped" | "student" | "teacher" | "admin";
}

function AdminBadge({ children, tone = "inactive" }: AdminBadgeProps) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export default AdminBadge;
