import { createContext } from "react";

import type { LearningEnrollment } from "../types/Enrollment";

export interface EnrollmentContextValue {
  selectedEnrollment: LearningEnrollment | null;
  setSelectedEnrollment: (enrollment: LearningEnrollment) => void;
  clearSelectedEnrollment: () => void;
  isEnrollmentSelected: () => boolean;
  validatingSelection: boolean;
  selectionValidationError: string;
  retrySelectionValidation: () => void;
}

export const EnrollmentContext = createContext<
  EnrollmentContextValue | undefined
>(undefined);
