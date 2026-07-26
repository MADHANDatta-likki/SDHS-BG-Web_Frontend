interface StudentPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function StudentPageHeader({ title, description, action }: StudentPageHeaderProps) {
  return (
    <header className="student-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

export default StudentPageHeader;
