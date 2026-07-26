interface GradeBadgeProps {
  grade: string | null;
}

function GradeBadge({ grade }: GradeBadgeProps) {
  const value = grade?.trim() || "Pending";
  const modifier = value.toLowerCase().replaceAll("+", "-plus").replaceAll(" ", "-");
  return <span className={`student-grade student-grade--${modifier}`}>{value}</span>;
}

export default GradeBadge;
