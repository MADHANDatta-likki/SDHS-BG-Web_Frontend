import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

function PublicLayout({ children }: PublicLayoutProps) {
  return children;
}

export default PublicLayout;
