import { apiClient } from '@/shared/api/axios';

export interface Project {
  id: string;
  title: string;
  description: string;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  passed_tasks?: number;
  total_tasks?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
  learning_objective?: string;
  connections?: string;
  hints?: string;
  order_index: number;
  test_code: string;
  solution_template?: string;
}

export const projectApi = {
  async getProjects(params?: { limit?: number; offset?: number; search?: string }): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects/', { params });
    return response.data;
  },

  async getProjectTasks(projectId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  async getProjectProgress(projectId: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(`/projects/${projectId}/progress`);
    return response.data;
  }
};
