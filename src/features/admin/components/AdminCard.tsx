import RoleCard from "../../../components/common/RoleCard";

function AdminCard({ title, label, children }: { title: string; label?: string; children: React.ReactNode }) {
  return <RoleCard title={title} label={label} cardClassName="admin-card" bodyClassName="admin-card__body">{children}</RoleCard>;
}
export default AdminCard;
