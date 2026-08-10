import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import { AUTH_STORAGE_KEYS } from "../../../constants/AuthConstants";
import type { LearningEnrollment } from "../../../types/Enrollment";
import type { CreateLearningEnrollmentRequest } from "../../../types/Enrollment";

interface EnrollmentApiResponse {
  enrollments: LearningEnrollment[];
  total: number;
}

class EnrollmentService {
  private cachedEnrollments: LearningEnrollment[] | null = null;
  private pendingRequest: Promise<LearningEnrollment[]> | null = null;
  private cacheIdentity: string | null = null;

  getEnrollments(): Promise<LearningEnrollment[]> {
    this.resetCacheForChangedIdentity();

    if (this.cachedEnrollments !== null) {
      return Promise.resolve(this.cachedEnrollments);
    }

    if (this.pendingRequest !== null) {
      return this.pendingRequest;
    }

    const requestIdentity = this.getCurrentIdentity();
    const request = axiosInstance
      .get<EnrollmentApiResponse>(API_ENDPOINTS.STUDENT.ENROLLMENTS)
      .then((response) => {
        if (requestIdentity === this.getCurrentIdentity()) {
          this.cacheIdentity = requestIdentity;
          this.cachedEnrollments = response.data.enrollments;
        }
        return response.data.enrollments;
      })
      .finally(() => {
        if (this.pendingRequest === request) {
          this.pendingRequest = null;
        }
      });

    this.pendingRequest = request;
    return request;
  }

  refreshEnrollments(): Promise<LearningEnrollment[]> {
    this.clearCache();
    return this.getEnrollments();
  }

  async createEnrollment(
    request: CreateLearningEnrollmentRequest,
  ): Promise<LearningEnrollment> {
    const response = await axiosInstance.post<LearningEnrollment>(
      API_ENDPOINTS.STUDENT.ENROLLMENTS,
      request,
    );
    this.clearCache();
    return response.data;
  }

  clearCache(): void {
    this.cachedEnrollments = null;
    this.cacheIdentity = this.getCurrentIdentity();
  }

  private resetCacheForChangedIdentity(): void {
    const currentIdentity = this.getCurrentIdentity();
    if (this.cacheIdentity !== currentIdentity) {
      this.cachedEnrollments = null;
      this.pendingRequest = null;
      this.cacheIdentity = currentIdentity;
    }
  }

  private getCurrentIdentity(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }
}

const enrollmentService = new EnrollmentService();

export default enrollmentService;
