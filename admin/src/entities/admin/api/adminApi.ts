import { apiClient } from '@/shared/api/axios';

export interface AdminStats {
  total_users: number;
  total_projects: number;
  total_passed_submissions: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ai_generated: boolean;
  created_at: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/admin/stats');
    return response.data;
  },

  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects/');
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async updateProject(id: string, data: ProjectUpdate): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${id}`, data);
    return response.data;
  }
};
