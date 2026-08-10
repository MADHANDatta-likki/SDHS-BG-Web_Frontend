import { useCallback } from "react";

import type { LearningEnrollment } from "../../../types/Enrollment";
import { useStudentResource } from "../../student/hooks/useStudentResource";
import enrollmentService from "../services/EnrollmentService";

export interface UseEnrollmentsResult {
  enrollments: LearningEnrollment[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const LOAD_ERROR = "Unable to load learning enrollments.";

export function useEnrollments(): UseEnrollmentsResult {
  const loadEnrollments = useCallback(
    () => enrollmentService.getEnrollments(),
    [],
  );
  const { data, error, loading, reload } = useStudentResource(
    loadEnrollments,
    LOAD_ERROR,
  );

  const refresh = useCallback(async () => {
    enrollmentService.clearCache();
    await reload();
  }, [reload]);

  return {
    enrollments: data ?? [],
    loading,
    error,
    refresh,
  };
}
