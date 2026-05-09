import { apiClient } from '@/shared/api/axios';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: 'student' | 'admin';
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const userApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username'
    formData.append('password', password);
    
    const response = await apiClient.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
