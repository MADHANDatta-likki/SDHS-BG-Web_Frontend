import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import enrollmentService from "../../enrollment/services/EnrollmentService";
import type {
  BookStudentSlotRequest,
  CancelStudentBookingRequest,
  StudentAttendanceResponse,
  StudentGradesResponse,
  StudentHomeResponse,
  StudentLearningEnrollmentsResponse,
  StudentMutationResponse,
  StudentSlotsResponse,
} from "../types/api";

class StudentService {
  private enrollmentHeaders(enrollmentId: number) {
    return { headers: { "X-Enrollment-Id": String(enrollmentId) } };
  }

  async getHome(enrollmentId: number): Promise<StudentHomeResponse> {
    const response = await axiosInstance.get<StudentHomeResponse>(
      API_ENDPOINTS.STUDENT.HOME,
      this.enrollmentHeaders(enrollmentId),
    );
    return response.data;
  }

  async getEnrollments(): Promise<StudentLearningEnrollmentsResponse> {
    const enrollments = await enrollmentService.getEnrollments();
    return {
      enrollments,
      total: enrollments.length,
    };
  }

  async getSlots(enrollmentId: number): Promise<StudentSlotsResponse> {
    const response = await axiosInstance.get<StudentSlotsResponse>(
      API_ENDPOINTS.STUDENT.SLOTS,
      this.enrollmentHeaders(enrollmentId),
    );
    return response.data;
  }

  async bookSlot(
    request: BookStudentSlotRequest,
    enrollmentId: number,
  ): Promise<StudentMutationResponse> {
    const response = await axiosInstance.post<StudentMutationResponse>(
      API_ENDPOINTS.STUDENT.BOOK,
      request,
      this.enrollmentHeaders(enrollmentId),
    );
    return response.data;
  }

  async cancelBooking(
    request: CancelStudentBookingRequest,
    enrollmentId: number,
  ): Promise<StudentMutationResponse> {
    const response = await axiosInstance.post<StudentMutationResponse>(
      API_ENDPOINTS.STUDENT.CANCEL,
      request,
      this.enrollmentHeaders(enrollmentId),
    );
    return response.data;
  }

  async getGrades(enrollmentId: number): Promise<StudentGradesResponse> {
    const response = await axiosInstance.get<StudentGradesResponse>(
      API_ENDPOINTS.STUDENT.GRADES,
      this.enrollmentHeaders(enrollmentId),
    );
    return response.data;
  }

  async getAttendance(enrollmentId: number): Promise<StudentAttendanceResponse> {
    const response = await axiosInstance.get<StudentAttendanceResponse>(
      API_ENDPOINTS.STUDENT.ATTENDANCE,
      this.enrollmentHeaders(enrollmentId),
    );
    return response.data;
  }
}

const studentService = new StudentService();

export default studentService;
