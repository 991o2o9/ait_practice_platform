import { create } from 'zustand';
import type { Project, Task } from '../api/projectApi';
import { projectApi } from '../api/projectApi';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  activeTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  setCurrentProject: (projectId: string) => Promise<void>;
  setActiveTask: (taskId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  activeTaskId: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.getProjects();
      set({ projects, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch projects', isLoading: false });
    }
  },

  setCurrentProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Устанавливаем проект из списка
      const state = get();
      let project = state.projects.find(p => p.id === projectId);
      
      // Если списка нет (например, зашли по прямой ссылке), сначала грузим все
      if (!project) {
        const projects = await projectApi.getProjects();
        project = projects.find(p => p.id === projectId);
        set({ projects });
      }

      if (!project) {
        throw new Error("Project not found");
      }

      // 2. Грузим таски проекта
      const tasks = await projectApi.getProjectTasks(projectId);
      
      // Сортируем таски по order_index
      tasks.sort((a, b) => a.order_index - b.order_index);

      set({ 
        currentProject: project, 
        tasks, 
        activeTaskId: tasks.length > 0 ? tasks[0].id : null,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load project details', isLoading: false });
    }
  },

  setActiveTask: (taskId: string) => {
    set({ activeTaskId: taskId });
  }
}));
