import type { ApiMessageResponse } from "../../../types/api";
import type { LearningEnrollment, ProgramType } from "../../../types/Enrollment";

export interface VolunteerQuery {
  q?: string;
  status?: string;
  enrollmentType?: string;
  trackType?: string;
  groupId?: string;
}

export interface AdminVolunteer {
  volunteerId: string;
  name: string;
  groupId: string | null;
  groupName: string | null;
  enrollmentType: string | null;
  trackType: string | null;
  status: string;
  statusReason: string | null;
  slotEligible: boolean | null;
  email: string | null;
  phoneNumber: string | null;
  createdAt: string | null;
}

export interface VolunteerListResponse {
  volunteers: AdminVolunteer[];
  total: number;
}

export interface VolunteerCsvDownload {
  content: Blob;
  filename: string;
}

export interface EditVolunteerRequest {
  name?: string;
  phoneNumber?: string;
  email?: string | null;
  groupId?: string;
  trackType?: string;
  enrollmentType?: string;
  slotEligible?: boolean;
}

export interface DropVolunteerRequest {
  reason?: string;
}

export interface VolunteerAnalyticsIdentity {
  volunteerId: string;
  name: string;
  groupId: string | null;
  status: string;
  phoneNumber: string | null;
  email: string | null;
  trackType: string | null;
  enrollmentType: string | null;
}

export interface VolunteerAnalyticsBooking {
  id: number;
  date: string | null;
  formattedDate: string | null;
  slotName?: string;
  chapterNumber?: number;
  chapterName?: string;
  slokaCount: number | null;
  memorizationGrade: string | null;
  pronunciationGrade: string | null;
  teacherComment: string | null;
  assignedTeacherName?: string;
}

export interface VolunteerAnalyticsResponse {
  volunteer: VolunteerAnalyticsIdentity;
  totalBookings: number;
  gradedCount: number;
  pendingCount: number;
  avgMem: string;
  avgPro: string;
  totalSlokas: number;
  gradeDist: Record<string, number>;
  chapterCounts: Record<string, number>;
  bookings: VolunteerAnalyticsBooking[];
}

export interface Enrollment {
  enrollmentId: number;
  volunteerId: string;
  volunteerName: string;
  programType: ProgramType;
  requestedDate: string;
  currentActivePrograms: ProgramType[];
  currentPendingPrograms: ProgramType[];
  defaultEnrollment: boolean;
}

export interface EnrollmentListResponse {
  enrollments: Enrollment[];
  total: number;
  activeEnrollments: ActiveEnrollment[];
}

export interface ActiveEnrollment {
  enrollmentId: number;
  volunteerId: string;
  volunteerName: string;
  programType: ProgramType;
  groupId: string | null;
  slotEligible: boolean;
  defaultEnrollment: boolean;
}

export interface ApproveEnrollmentRequest {
  groupId: string;
  slotEligible: boolean;
}

export interface RejectEnrollmentRequest { reason?: string; }

export type EnrollmentActionResponse = LearningEnrollment;

export interface SyllabusQuery {
  date?: string;
}

export interface SyllabusChapter {
  id: number;
  chapterNumber: number;
  chapterName: string;
  totalSlokas: number;
  allowedSlokas: string;
  enabled: boolean;
}

export interface SyllabusResponse {
  date: string;
  chapters: SyllabusChapter[];
}

export interface SyllabusEntry {
  chapterId: number;
  allowedSlokas: string;
}

export interface SaveSyllabusRequest {
  date: string;
  entries: SyllabusEntry[];
}

export interface SaveSyllabusResponse extends ApiMessageResponse {
  saved: number;
}

export interface DatedQuery {
  date?: string;
}

export interface SlotOption {
  id: number;
  name: string;
}

export interface TeacherAvailability {
  volunteerId: string;
  name: string;
  status: "SUBMITTED" | "PENDING";
  selectedSlotIds: number[];
}

export interface TeacherAvailabilitySummary {
  teachers: number;
  submitted: number;
  pending: number;
  availabilityWindows: number;
}

export interface TeacherAvailabilityResponse {
  date: string;
  summary: TeacherAvailabilitySummary;
  teachers: TeacherAvailability[];
  slots: SlotOption[];
}

export interface TeacherAvailabilityEntry {
  volunteerId: string;
  slotIds?: number[];
}

export interface SaveTeacherAvailabilityRequest {
  date: string;
  entries: TeacherAvailabilityEntry[];
}

export interface BulkBookingStudent {
  volunteerId: string;
  name: string;
  groupId?: string | null;
}

export interface BulkBookingChapter {
  id: number;
  chapterNumber: number;
  chapterName: string;
  allowedSlokas: string;
}

export interface BulkBooking {
  id: number;
  volunteerId: string;
  studentName: string;
  slotId?: number;
  slotName?: string;
  chapterId?: number;
  chapterNumber?: number;
  chapterName?: string;
  slokaCount: number | null;
  assignedTeacherName?: string;
}

export interface BulkBookingResponse {
  date: string;
  students: BulkBookingStudent[];
  slots: SlotOption[];
  chapters: BulkBookingChapter[];
  bookings: BulkBooking[];
}

export interface BulkBookingEntry {
  volunteerId: string;
  date: string;
  slotId: number;
  chapterId: number;
  slokaCount: number;
  chapterId2?: number;
  slokaCount2?: number;
}

export type BulkBookingTrackType = "MEMORIZATION" | "REVISION";

export interface SaveBulkBookingRequest {
  trackType: BulkBookingTrackType;
  entries: BulkBookingEntry[];
}

export interface SaveBulkBookingResponse {
  saved: number;
  failed: number;
  messages: string[];
}

export interface BookingIdRequest {
  bookingId: number;
}

export interface TeachersDashboardQuery {
  date?: string;
  teacherId?: string;
}

export interface TeachersDashboardBooking {
  id: number;
  volunteerId: string;
  studentName: string;
  slotName?: string;
  chapterId?: number;
  chapterNumber?: number;
  chapterName?: string;
  slokaCount: number | null;
  memorizationGrade: string | null;
  pronunciationGrade: string | null;
  teacherComment: string | null;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
}

export interface TeacherOption {
  volunteerId: string;
  name: string;
}

export interface TeachersDashboardResponse {
  date: string;
  selectedTeacherId: string;
  bookings: TeachersDashboardBooking[];
  teachers: TeacherOption[];
  chapters: BulkBookingChapter[];
  grades: string[];
}

export interface SaveDashboardRowRequest {
  bookingId: number;
  memorizationGrade?: string;
  pronunciationGrade?: string;
  comment?: string;
  assignedTeacherId?: string;
}

export interface AttendanceGroup {
  groupId: string;
  groupName: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

export interface AttendanceConfigResponse {
  groups: AttendanceGroup[];
}

export interface AllowedSlokasQuery {
  volunteerId: string;
  date: string;
  chapterId: number;
}

export interface AllowedSlokasResponse {
  allowed: number[];
  minNext?: number;
}

export interface SaveAttendanceGroup {
  groupId: string;
  groupName?: string;
  startDate?: string;
  endDate?: string | null;
  status?: string;
}

export interface SaveAttendanceConfigRequest {
  groups: SaveAttendanceGroup[];
}

export type AdminMessageResponse = ApiMessageResponse;
