import { apiClient } from '@/shared/api/axios';

export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url: string | null;
  is_blocked: boolean;
  github_id: string | null;
  discord_id: string | null;
  passed_submissions_count: number;
}

export const adminUserApi = {
  getUsers: async (): Promise<AdminUserResponse[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  
  toggleBlock: async (userId: string): Promise<{ message: string; is_blocked: boolean }> => {
    const response = await apiClient.patch(`/admin/users/${userId}/toggle-block`);
    return response.data;
  }
};
