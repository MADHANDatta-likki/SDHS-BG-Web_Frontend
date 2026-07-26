import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type {
  BookStudentSlotRequest,
  CancelStudentBookingRequest,
  StudentAttendanceResponse,
  StudentGradesResponse,
  StudentHomeResponse,
  StudentMutationResponse,
  StudentSlotsResponse,
} from "../types/api";

class StudentService {
  async getHome(): Promise<StudentHomeResponse> {
    const response = await axiosInstance.get<StudentHomeResponse>(
      API_ENDPOINTS.STUDENT.HOME,
    );
    return response.data;
  }

  async getSlots(): Promise<StudentSlotsResponse> {
    const response = await axiosInstance.get<StudentSlotsResponse>(
      API_ENDPOINTS.STUDENT.SLOTS,
    );
    return response.data;
  }

  async bookSlot(
    request: BookStudentSlotRequest,
  ): Promise<StudentMutationResponse> {
    const response = await axiosInstance.post<StudentMutationResponse>(
      API_ENDPOINTS.STUDENT.BOOK,
      request,
    );
    return response.data;
  }

  async cancelBooking(
    request: CancelStudentBookingRequest,
  ): Promise<StudentMutationResponse> {
    const response = await axiosInstance.post<StudentMutationResponse>(
      API_ENDPOINTS.STUDENT.CANCEL,
      request,
    );
    return response.data;
  }

  async getGrades(): Promise<StudentGradesResponse> {
    const response = await axiosInstance.get<StudentGradesResponse>(
      API_ENDPOINTS.STUDENT.GRADES,
    );
    return response.data;
  }

  async getAttendance(): Promise<StudentAttendanceResponse> {
    const response = await axiosInstance.get<StudentAttendanceResponse>(
      API_ENDPOINTS.STUDENT.ATTENDANCE,
    );
    return response.data;
  }
}

const studentService = new StudentService();

export default studentService;
