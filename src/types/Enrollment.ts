export type ProgramType = "FLUENT" | "MEMORIZATION" | "REVISION";

export type LearningEnrollmentStatus =
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "DROPPED"
  | "REJECTED";

export interface LearningEnrollment {
  id: number;
  batchType: ProgramType;
  status: LearningEnrollmentStatus;
  groupId: string | null;
  slotEligible: boolean;
  defaultEnrollment: boolean;
  enrollmentId?: number;
  programType?: ProgramType;
  enrollmentStatus?: LearningEnrollmentStatus;
  isDefault?: boolean;
  groupName?: string | null;
  centerId?: string | null;
  centerName?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  enrollmentDate?: string | null;
  completionDate?: string | null;
  decisionDate?: string | null;
}

export interface CreateLearningEnrollmentRequest {
  programType: ProgramType;
}
