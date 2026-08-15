import axiosInstance from "../../../api/axios";
import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type { Profile, UpdateProfileContactRequest } from "../types/Profile";

class ProfileService {
  async getProfile(): Promise<Profile> {
    const response = await axiosInstance.get<Profile>(API_ENDPOINTS.PROFILE.GET);
    return response.data;
  }

  async updateContact(request: UpdateProfileContactRequest): Promise<Profile> {
    const response = await axiosInstance.put<Profile>(
      API_ENDPOINTS.PROFILE.CONTACT,
      request,
    );
    return response.data;
  }
}

const profileService = new ProfileService();

export default profileService;
