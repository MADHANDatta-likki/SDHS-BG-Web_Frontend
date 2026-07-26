import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type { JobTriggerResponse } from "../types/api";

class InternalJobService {
  async triggerSundayTeacherReminders(): Promise<JobTriggerResponse> {
    const response = await axiosInstance.post<JobTriggerResponse>(
      API_ENDPOINTS.INTERNAL_JOBS.SUNDAY_TEACHER_REMINDERS,
    );
    return response.data;
  }

  async triggerSundayStudentReminders(): Promise<JobTriggerResponse> {
    const response = await axiosInstance.post<JobTriggerResponse>(
      API_ENDPOINTS.INTERNAL_JOBS.SUNDAY_STUDENT_REMINDERS,
    );
    return response.data;
  }

  async triggerPendingEnrollmentReminder(): Promise<JobTriggerResponse> {
    const response = await axiosInstance.post<JobTriggerResponse>(
      API_ENDPOINTS.INTERNAL_JOBS.PENDING_ENROLLMENT_REMINDER,
    );
    return response.data;
  }
}

const internalJobService = new InternalJobService();

export default internalJobService;
