import RolePageHeader from "../../../components/common/RolePageHeader";

interface StudentPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function StudentPageHeader({ title, description, action }: StudentPageHeaderProps) {
  return <RolePageHeader title={title} description={description} action={action} className="student-page-header" />;
}

export default StudentPageHeader;
