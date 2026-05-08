import { apiClient } from '@/shared/api/axios';

export interface SubmissionResponse {
  submission: {
    id: string;
    task_id: string;
    code: string;
    status: 'passed' | 'failed' | 'pending';
    created_at: string;
  };
  details: string;
}

export const submissionApi = {
  async submitCode(taskId: string, code: string): Promise<SubmissionResponse> {
    const response = await apiClient.post<SubmissionResponse>('/submissions/', {
      task_id: taskId,
      code: code
    });
    return response.data;
  },

  async getTaskContext(projectId: string, taskId: string): Promise<{ context_code: string }> {
    const response = await apiClient.get<{ context_code: string }>(`/projects/${projectId}/tasks/${taskId}/context`);
    return response.data;
  }
};
