import type { ReactNode } from "react";

interface AppContentProps {
  children: ReactNode;
}

function AppContent({ children }: AppContentProps) {
  return (
    <main id="main-content" className="app-content" tabIndex={-1}>
      {children}
    </main>
  );
}

export default AppContent;
