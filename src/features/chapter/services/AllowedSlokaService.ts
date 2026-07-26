import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type { AllowedSlokasQuery, AllowedSlokasResponse } from "../types/api";

class AllowedSlokaService {
  async getAllowedSlokas(
    query: AllowedSlokasQuery,
  ): Promise<AllowedSlokasResponse> {
    const response = await axiosInstance.get<AllowedSlokasResponse>(
      API_ENDPOINTS.CHAPTER.ALLOWED_SLOKAS,
      { params: query },
    );
    return response.data;
  }
}

const allowedSlokaService = new AllowedSlokaService();

export default allowedSlokaService;
