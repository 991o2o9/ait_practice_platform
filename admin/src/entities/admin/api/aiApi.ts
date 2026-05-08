import { apiClient } from '@/shared/api/axios';

export interface DraftTask {
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  learning_objective?: string;
  connections?: string;
  test_code: string;
  solution_template: string;
  hints?: string;
}

export interface DraftResponse {
  project_title: string;
  project_description: string;
  tasks: DraftTask[];
}

export const aiApi = {
  async generateDraft(prompt: string): Promise<DraftResponse> {
    const response = await apiClient.post<DraftResponse>('/ai/generate-draft', { prompt });
    return response.data;
  },

  async refineDraft(currentDraft: DraftResponse, feedback: string): Promise<DraftResponse> {
    const response = await apiClient.post<DraftResponse>('/ai/refine-draft', {
      current_draft: currentDraft,
      feedback
    });
    return response.data;
  },

  async publishProject(draft: DraftResponse): Promise<any> {
    const response = await apiClient.post('/projects/publish-draft', {
      project_title: draft.project_title,
      project_description: draft.project_description,
      ai_generated: true,
      tasks: draft.tasks.map((t) => ({
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        learning_objective: t.learning_objective,
        connections: t.connections,
        test_code: t.test_code,
        solution_template: t.solution_template,
        hints: t.hints || ''
      }))
    });
    return response.data;
  }
};
