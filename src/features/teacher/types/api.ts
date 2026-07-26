import type { ApiMessageResponse } from "../../../types/api";

export interface TeacherHomeResponse {
  volunteerId: string;
  teacherName: string;
  totalExams: number;
  gradedCount: number;
  pendingCount: number;
  uniqueStudents: number;
  totalSessions: number;
  avgMem: string;
  avgPro: string;
  gradeDist: Record<string, number>;
  chapterCounts: Record<string, number>;
}

export interface TeacherDashboardBooking {
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
  studentName: string;
  studentPhone: string | null;
  studentVolunteerId: string;
}

export interface TeacherDashboardResponse {
  volunteerId: string;
  bookings: TeacherDashboardBooking[];
  gradesList: string[];
}

export interface UpdateGradeRequest {
  bookingId: number;
  memorizationGrade?: string;
  pronunciationGrade?: string;
  comment?: string;
}

export interface UpdateGradeResponse {
  ok: boolean;
  message: string;
}

export interface TeacherAttendanceQuery {
  groupId?: string;
  weekStart?: string;
}

export interface AttendanceVolunteer {
  id: number;
  volunteerId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  groupId: string | null;
  enrollmentType: string | null;
  createdAt: string;
  updatedAt: string | null;
  slotEligible: boolean;
  status: string;
  statusReason: string | null;
  statusUpdatedAt: string | null;
  statusUpdatedBy: string | null;
  reactivatedAt: string | null;
  passwordHash: string | null;
  role: string;
  trackType: string | null;
}

export interface TeacherAttendanceResponse {
  teacherVid: string;
  groupId: string | null;
  groups: string[];
  weekStart: string;
  weekEnd: string;
  weekDates: string[];
  dateLabels: Record<string, string>;
  students: AttendanceVolunteer[];
  presentMap: Record<string, boolean>;
  noClassMap: Record<string, boolean>;
  groupStartDate: string | null;
  groupEndDate: string | null;
  today: string;
}

export interface SaveTeacherAttendanceRequest {
  groupId: string;
  weekStart?: string;
  [parameter: string]: string | string[] | undefined;
}

export type SaveTeacherAttendanceResponse = ApiMessageResponse;
