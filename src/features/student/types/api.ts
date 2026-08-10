import type { ApiMessageResponse } from "../../../types/api";
import type {
  LearningEnrollment,
  LearningEnrollmentStatus,
  ProgramType,
} from "../../../types/Enrollment";

export type BatchType = ProgramType;

export type EnrollmentStatus = LearningEnrollmentStatus;

export type StudentLearningEnrollment = LearningEnrollment;

export interface StudentLearningEnrollmentsResponse {
  enrollments: StudentLearningEnrollment[];
  total: number;
}

export interface StudentHomeBooking {
  id: number;
  date: string | null;
  formattedDate: string | null;
  cancelled: boolean;
  slotId?: number;
  slotName?: string;
  chapterId?: number;
  chapterNumber?: number;
  chapterName?: string;
  slokaCount: number | null;
  memorizationGrade: string | null;
  pronunciationGrade: string | null;
  teacherComment: string | null;
  assignedTeacherName?: string;
}

export interface StudentHomeResponse {
  volunteerId: string;
  studentName: string;
  groupId: string | null;
  totalBookings: number;
  gradedCount: number;
  pendingCount: number;
  avgMem: string;
  avgPro: string;
  totalSlokas: number;
  chapterCounts: Record<string, number>;
  gradeDist: Record<string, number>;
  bookings: StudentHomeBooking[];
  learningProgress: LearningProgress;
}

export interface LearningProgressExam {
  bookingId: number;
  date: string | null;
  chapterNumber: number | null;
  chapterName: string | null;
  slokaCount: number | null;
  memorizationGrade: string | null;
  pronunciationGrade: string | null;
}

export interface LearningProgressSyllabusChapter {
  chapterId: number;
  chapterNumber: number;
  chapterName: string;
  allowedSlokas: string;
}

export interface LearningProgress {
  overallProgressPercent: number;
  completedChapters: number;
  totalChapters: number;
  completedSlokas: number;
  totalSlokas: number;
  remainingSlokas: number;
  latestGradedExam: LearningProgressExam | null;
  latestBooking: LearningProgressExam | null;
  currentSyllabus: LearningProgressSyllabusChapter[];
  attendance: { present: number; total: number; percent: string };
  gradeSummary: {
    completedExams: number;
    awaitingFinalGrade: number;
    retests: number;
  };
}

export interface StudentSlot {
  id: number;
  name: string;
  duration: number;
  availableCount: number;
}

export interface StudentChapter {
  id: number;
  chapterNumber: number;
  chapterName: string;
  totalSlokas: number;
  allowedSlokas?: string;
}

export interface StudentExistingBooking {
  id: number;
  date: string | null;
  cancelled: boolean;
  slotId?: number;
  slotName?: string;
  chapterId?: number;
  chapterNumber?: number;
  chapterName?: string;
  slokaCount: number | null;
}

export interface StudentSlotsResponse {
  volunteerId: string;
  studentName: string;
  slotEligible: boolean;
  bookingAllowed: boolean;
  date: string;
  formattedDate: string;
  slots: StudentSlot[];
  chapters: StudentChapter[];
  existingBookings: StudentExistingBooking[];
  existingBookingsCount: number;
}

export interface BookStudentSlotRequest {
  slotId: number;
  chapterId: number;
  slokaCount: number;
  date?: string;
  chapterId2?: number;
  slokaCount2?: number;
}

export interface CancelStudentBookingRequest {
  bookingId: number;
}

export interface StudentGrade {
  id: number;
  date: string | null;
  formattedDate: string | null;
  cancelled: boolean;
  slotName?: string;
  chapterNumber?: number;
  chapterName?: string;
  slokaCount: number | null;
  memorizationGrade: string | null;
  pronunciationGrade: string | null;
  teacherComment: string | null;
  assignedTeacherName?: string;
}

export interface StudentGradesResponse {
  volunteerId: string;
  studentName: string;
  groupId?: string | null;
  grades: StudentGrade[];
}

export interface StudentAttendanceRecord {
  id: number;
  present: boolean;
  classDate?: string;
  groupId?: string;
  noClass?: boolean;
}

export interface StudentAttendanceResponse {
  volunteerId: string;
  studentName: string;
  groupId: string | null;
  present: number;
  total: number;
  percent: string;
  groupStartDate: string | null;
  groupEndDate: string | null;
  groupStatus: string | null;
  history: StudentAttendanceRecord[];
}

export type StudentMutationResponse = ApiMessageResponse;
