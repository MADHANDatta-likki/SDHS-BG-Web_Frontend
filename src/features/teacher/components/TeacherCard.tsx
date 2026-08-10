import RoleCard from "../../../components/common/RoleCard";

interface TeacherCardProps {
  title: string;
  label?: string;
  children: React.ReactNode;
}

function TeacherCard({ title, label, children }: TeacherCardProps) {
  return <RoleCard title={title} label={label} cardClassName="teacher-card" bodyClassName="teacher-card__body">{children}</RoleCard>;
}

export default TeacherCard;
