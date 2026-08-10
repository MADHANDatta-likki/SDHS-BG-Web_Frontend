import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type {
  SaveTeacherAttendanceRequest,
  SaveTeacherAttendanceResponse,
  SaveTeacherAvailabilityRequest,
  SaveTeacherAvailabilityResponse,
  TeacherAttendanceQuery,
  TeacherAttendanceResponse,
  TeacherAvailabilityResponse,
  TeacherDashboardResponse,
  TeacherHomeResponse,
  UpdateGradeRequest,
  UpdateGradeResponse,
} from "../types/api";

class TeacherService {
  async getHome(): Promise<TeacherHomeResponse> {
    const response = await axiosInstance.get<TeacherHomeResponse>(
      API_ENDPOINTS.TEACHER.HOME,
    );
    return response.data;
  }

  async getMyAvailability(): Promise<TeacherAvailabilityResponse> {
    const response = await axiosInstance.get<TeacherAvailabilityResponse>(
      API_ENDPOINTS.TEACHER.MY_AVAILABILITY,
    );
    return response.data;
  }

  async saveMyAvailability(
    request: SaveTeacherAvailabilityRequest,
  ): Promise<SaveTeacherAvailabilityResponse> {
    const response = await axiosInstance.post<SaveTeacherAvailabilityResponse>(
      API_ENDPOINTS.TEACHER.MY_AVAILABILITY,
      request,
    );
    return response.data;
  }

  async getDashboard(): Promise<TeacherDashboardResponse> {
    const response = await axiosInstance.get<TeacherDashboardResponse>(
      API_ENDPOINTS.TEACHER.DASHBOARD,
    );
    return response.data;
  }

  async updateGrade(request: UpdateGradeRequest): Promise<UpdateGradeResponse> {
    const response = await axiosInstance.post<UpdateGradeResponse>(
      API_ENDPOINTS.TEACHER.GRADE,
      request,
    );
    return response.data;
  }

  async getAttendance(
    query: TeacherAttendanceQuery = {},
  ): Promise<TeacherAttendanceResponse> {
    const response = await axiosInstance.get<TeacherAttendanceResponse>(
      API_ENDPOINTS.TEACHER.ATTENDANCE,
      { params: query },
    );
    return response.data;
  }

  async saveAttendance(
    request: SaveTeacherAttendanceRequest,
  ): Promise<SaveTeacherAttendanceResponse> {
    const response = await axiosInstance.post<SaveTeacherAttendanceResponse>(
      API_ENDPOINTS.TEACHER.ATTENDANCE,
      request,
    );
    return response.data;
  }
}

const teacherService = new TeacherService();

export default teacherService;
