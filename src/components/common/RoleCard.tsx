import type { ElementType, ReactNode } from "react";

interface RoleCardProps {
  title: string;
  label?: string;
  children: ReactNode;
  cardClassName: string;
  bodyClassName: string;
  headerClassName?: string;
  headerAs?: ElementType;
}

function RoleCard({
  title,
  label,
  children,
  cardClassName,
  bodyClassName,
  headerClassName,
  headerAs: Header = "header",
}: RoleCardProps) {
  return (
    <section className={cardClassName}>
      <Header className={headerClassName}>
        <h2>{title}</h2>
        {label && <span>{label}</span>}
      </Header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export default RoleCard;
