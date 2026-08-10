import RolePageHeader from "../../../components/common/RolePageHeader";

function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <RolePageHeader title={title} description={description} action={action} className="admin-page-header" />;
}
export default AdminPageHeader;
