import { useContext } from "react";

import { EnrollmentContext } from "../context/EnrollmentContext";
import type { EnrollmentContextValue } from "../context/EnrollmentContext";

export function useEnrollment(): EnrollmentContextValue {
  const context = useContext(EnrollmentContext);

  if (context === undefined) {
    throw new Error(
      "useEnrollment must be used within an EnrollmentProvider",
    );
  }

  return context;
}

export function useOptionalEnrollment(): EnrollmentContextValue | undefined {
  return useContext(EnrollmentContext);
}
