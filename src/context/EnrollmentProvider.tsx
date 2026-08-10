import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ENROLLMENT_STORAGE_KEYS } from "../constants/EnrollmentConstants";
import enrollmentService from "../features/enrollment/services/EnrollmentService";
import { useAuth } from "../features/auth/hooks/useAuth";
import type { LearningEnrollment } from "../types/Enrollment";
import { EnrollmentContext } from "./EnrollmentContext";
import type { EnrollmentContextValue } from "./EnrollmentContext";

interface EnrollmentProviderProps {
  children: ReactNode;
}

const SELECTION_VALIDATION_ERROR =
  "Unable to validate the selected enrollment. Please try again.";

function isLearningEnrollment(value: unknown): value is LearningEnrollment {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const enrollment = value as Partial<LearningEnrollment>;
  return (
    typeof enrollment.id === "number" &&
    typeof enrollment.batchType === "string" &&
    typeof enrollment.status === "string" &&
    (typeof enrollment.groupId === "string" || enrollment.groupId === null) &&
    typeof enrollment.slotEligible === "boolean" &&
    typeof enrollment.defaultEnrollment === "boolean"
  );
}

function restoreSelectedEnrollment(): LearningEnrollment | null {
  const storedEnrollment = localStorage.getItem(
    ENROLLMENT_STORAGE_KEYS.SELECTED_ENROLLMENT,
  );
  if (storedEnrollment === null) {
    return null;
  }

  try {
    const parsedEnrollment: unknown = JSON.parse(storedEnrollment);
    if (isLearningEnrollment(parsedEnrollment)) {
      return parsedEnrollment;
    }
  } catch {
    // Invalid persisted state is cleared below.
  }

  localStorage.removeItem(ENROLLMENT_STORAGE_KEYS.SELECTED_ENROLLMENT);
  return null;
}

function EnrollmentProvider({ children }: EnrollmentProviderProps) {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedEnrollment, setSelectedEnrollmentState] =
    useState<LearningEnrollment | null>(restoreSelectedEnrollment);
  const [validatingSelection, setValidatingSelection] = useState(false);
  const [selectionValidationError, setSelectionValidationError] = useState("");
  const [validationAttempt, setValidationAttempt] = useState(0);
  const validationSequence = useRef(0);

  const setSelectedEnrollment = useCallback(
    (enrollment: LearningEnrollment) => {
      localStorage.setItem(
        ENROLLMENT_STORAGE_KEYS.SELECTED_ENROLLMENT,
        JSON.stringify(enrollment),
      );
      setSelectionValidationError("");
      setSelectedEnrollmentState(enrollment);
    },
    [],
  );

  const clearSelectedEnrollment = useCallback(() => {
    localStorage.removeItem(ENROLLMENT_STORAGE_KEYS.SELECTED_ENROLLMENT);
    setSelectionValidationError("");
    setValidatingSelection(false);
    setSelectedEnrollmentState(null);
  }, []);

  const retrySelectionValidation = useCallback(() => {
    enrollmentService.clearCache();
    setValidationAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    const sequence = validationSequence.current + 1;
    validationSequence.current = sequence;

    if (authLoading) {
      return;
    }

    if (
      !isAuthenticated ||
      currentUser === null ||
      currentUser.role !== "STUDENT"
    ) {
      enrollmentService.clearCache();
      clearSelectedEnrollment();
      return;
    }

    if (selectedEnrollment === null) {
      setSelectionValidationError("");
      setValidatingSelection(false);
      return;
    }

    setSelectionValidationError("");
    setValidatingSelection(true);

    void enrollmentService
      .getEnrollments()
      .then((enrollments) => {
        if (validationSequence.current !== sequence) {
          return;
        }

        const selectedEnrollmentId =
          selectedEnrollment.enrollmentId ?? selectedEnrollment.id;
        const validEnrollment = enrollments.find((enrollment) => {
          const enrollmentId = enrollment.enrollmentId ?? enrollment.id;
          const enrollmentStatus =
            enrollment.enrollmentStatus ?? enrollment.status;

          return (
            enrollmentId === selectedEnrollmentId &&
            enrollmentStatus === "ACTIVE"
          );
        });

        if (validEnrollment === undefined) {
          clearSelectedEnrollment();
        }
      })
      .catch(() => {
        if (validationSequence.current === sequence) {
          setSelectionValidationError(SELECTION_VALIDATION_ERROR);
        }
      })
      .finally(() => {
        if (validationSequence.current === sequence) {
          setValidatingSelection(false);
        }
      });

    return () => {
      if (validationSequence.current === sequence) {
        validationSequence.current += 1;
      }
    };
  }, [
    authLoading,
    clearSelectedEnrollment,
    currentUser,
    isAuthenticated,
    selectedEnrollment,
    validationAttempt,
  ]);

  const isEnrollmentSelected = useCallback(
    () => selectedEnrollment !== null,
    [selectedEnrollment],
  );

  const value = useMemo<EnrollmentContextValue>(
    () => ({
      selectedEnrollment,
      setSelectedEnrollment,
      clearSelectedEnrollment,
      isEnrollmentSelected,
      validatingSelection,
      selectionValidationError,
      retrySelectionValidation,
    }),
    [
      clearSelectedEnrollment,
      isEnrollmentSelected,
      retrySelectionValidation,
      selectedEnrollment,
      selectionValidationError,
      setSelectedEnrollment,
      validatingSelection,
    ],
  );

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export default EnrollmentProvider;
