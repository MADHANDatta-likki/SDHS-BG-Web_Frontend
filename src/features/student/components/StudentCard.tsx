interface StudentCardProps {
  title: string;
  label?: string;
  children: React.ReactNode;
}

function StudentCard({ title, label, children }: StudentCardProps) {
  return (
    <section className="student-card">
      <div className="student-card__header">
        <h2>{title}</h2>
        {label && <span>{label}</span>}
      </div>
      <div className="student-card__body">{children}</div>
    </section>
  );
}

export default StudentCard;
