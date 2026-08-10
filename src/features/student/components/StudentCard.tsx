import RoleCard from "../../../components/common/RoleCard";

interface StudentCardProps {
  title: string;
  label?: string;
  children: React.ReactNode;
}

function StudentCard({ title, label, children }: StudentCardProps) {
  return <RoleCard title={title} label={label} cardClassName="student-card" headerAs="div" headerClassName="student-card__header" bodyClassName="student-card__body">{children}</RoleCard>;
}

export default StudentCard;
