import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type {
  AdminMessageResponse,
  AllowedSlokasQuery,
  AllowedSlokasResponse,
  ApproveEnrollmentRequest,
  AttendanceConfigResponse,
  BookingIdRequest,
  BulkBookingResponse,
  DatedQuery,
  DropVolunteerRequest,
  EditVolunteerRequest,
  EnrollmentListResponse,
  SaveAttendanceConfigRequest,
  SaveBulkBookingRequest,
  SaveBulkBookingResponse,
  SaveDashboardRowRequest,
  SaveSyllabusRequest,
  SaveSyllabusResponse,
  SaveTeacherAvailabilityRequest,
  SyllabusQuery,
  SyllabusResponse,
  TeacherAvailabilityResponse,
  TeachersDashboardQuery,
  TeachersDashboardResponse,
  VolunteerAnalyticsResponse,
  VolunteerListResponse,
  VolunteerQuery,
} from "../types/api";

class AdminService {
  async getVolunteers(
    query: VolunteerQuery = {},
  ): Promise<VolunteerListResponse> {
    const response = await axiosInstance.get<VolunteerListResponse>(
      API_ENDPOINTS.ADMIN.VOLUNTEERS,
      { params: query },
    );
    return response.data;
  }

  async editVolunteer(
    volunteerId: string,
    request: EditVolunteerRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.VOLUNTEER_EDIT(volunteerId),
      request,
    );
    return response.data;
  }

  async dropVolunteer(
    volunteerId: string,
    request: DropVolunteerRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.VOLUNTEER_DROP(volunteerId),
      request,
    );
    return response.data;
  }

  async reactivateVolunteer(
    volunteerId: string,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.VOLUNTEER_REACTIVATE(volunteerId),
    );
    return response.data;
  }

  async getVolunteerAnalytics(
    volunteerId: string,
  ): Promise<VolunteerAnalyticsResponse> {
    const response = await axiosInstance.get<VolunteerAnalyticsResponse>(
      API_ENDPOINTS.ADMIN.VOLUNTEER_ANALYTICS(volunteerId),
    );
    return response.data;
  }

  async getEnrollments(): Promise<EnrollmentListResponse> {
    const response = await axiosInstance.get<EnrollmentListResponse>(
      API_ENDPOINTS.ADMIN.ENROLLMENTS,
    );
    return response.data;
  }

  async approveEnrollment(
    id: number,
    request: ApproveEnrollmentRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.ENROLLMENT_APPROVE(id),
      request,
    );
    return response.data;
  }

  async rejectEnrollment(id: number): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.ENROLLMENT_REJECT(id),
    );
    return response.data;
  }

  async getSyllabus(query: SyllabusQuery = {}): Promise<SyllabusResponse> {
    const response = await axiosInstance.get<SyllabusResponse>(
      API_ENDPOINTS.ADMIN.SYLLABUS,
      { params: query },
    );
    return response.data;
  }

  async saveSyllabus(
    request: SaveSyllabusRequest,
  ): Promise<SaveSyllabusResponse> {
    const response = await axiosInstance.post<SaveSyllabusResponse>(
      API_ENDPOINTS.ADMIN.SYLLABUS_SAVE,
      request,
    );
    return response.data;
  }

  async getTeacherAvailability(
    query: DatedQuery = {},
  ): Promise<TeacherAvailabilityResponse> {
    const response = await axiosInstance.get<TeacherAvailabilityResponse>(
      API_ENDPOINTS.ADMIN.TEACHER_AVAILABILITY,
      { params: query },
    );
    return response.data;
  }

  async saveTeacherAvailability(
    request: SaveTeacherAvailabilityRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.TEACHER_AVAILABILITY_SAVE,
      request,
    );
    return response.data;
  }

  async getBulkBooking(
    query: DatedQuery = {},
  ): Promise<BulkBookingResponse> {
    const response = await axiosInstance.get<BulkBookingResponse>(
      API_ENDPOINTS.ADMIN.BULK_BOOKING,
      { params: query },
    );
    return response.data;
  }

  async saveBulkBooking(
    request: SaveBulkBookingRequest,
  ): Promise<SaveBulkBookingResponse> {
    const response = await axiosInstance.post<SaveBulkBookingResponse>(
      API_ENDPOINTS.ADMIN.BULK_BOOKING_SAVE,
      request,
    );
    return response.data;
  }

  async deleteBulkBooking(
    request: BookingIdRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.BULK_BOOKING_DELETE,
      request,
    );
    return response.data;
  }

  async getTeachersDashboard(
    query: TeachersDashboardQuery = {},
  ): Promise<TeachersDashboardResponse> {
    const response = await axiosInstance.get<TeachersDashboardResponse>(
      API_ENDPOINTS.ADMIN.TEACHERS_DASHBOARD,
      { params: query },
    );
    return response.data;
  }

  async saveDashboardRow(
    request: SaveDashboardRowRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.TEACHERS_DASHBOARD_SAVE_ONE,
      request,
    );
    return response.data;
  }

  async deleteDashboardRow(
    request: BookingIdRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.TEACHERS_DASHBOARD_DELETE,
      request,
    );
    return response.data;
  }

  async getAttendanceConfig(): Promise<AttendanceConfigResponse> {
    const response = await axiosInstance.get<AttendanceConfigResponse>(
      API_ENDPOINTS.ADMIN.ATTENDANCE_CONFIG,
    );
    return response.data;
  }

  async getAllowedSlokas(
    query: AllowedSlokasQuery,
  ): Promise<AllowedSlokasResponse> {
    const response = await axiosInstance.get<AllowedSlokasResponse>(
      API_ENDPOINTS.ADMIN.ALLOWED_SLOKAS,
      { params: query },
    );
    return response.data;
  }

  async saveAttendanceConfig(
    request: SaveAttendanceConfigRequest,
  ): Promise<AdminMessageResponse> {
    const response = await axiosInstance.post<AdminMessageResponse>(
      API_ENDPOINTS.ADMIN.ATTENDANCE_CONFIG_SAVE,
      request,
    );
    return response.data;
  }
}

const adminService = new AdminService();

export default adminService;
