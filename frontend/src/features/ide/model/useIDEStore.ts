import { create } from 'zustand';
import { submissionApi } from '@/entities/submission/api/submissionApi';

interface IDEState {
  codeByTaskId: Record<string, string>;
  contextByTaskId: Record<string, string>;
  consoleOutput: string;
  isSubmitting: boolean;

  setCode: (taskId: string, code: string) => void;
  fetchContext: (projectId: string, taskId: string) => Promise<void>;
  submitCode: (taskId: string, code: string) => Promise<void>;
  clearConsole: () => void;
}

export const useIDEStore = create<IDEState>((set, get) => ({
  codeByTaskId: {},
  contextByTaskId: {},
  consoleOutput: "Welcome to AIT Practice Console.\nReady to run tests...",
  isSubmitting: false,

  setCode: (taskId, code) => set((state) => ({
    codeByTaskId: { ...state.codeByTaskId, [taskId]: code }
  })),

  fetchContext: async (projectId, taskId) => {
    try {
      const response = await submissionApi.getTaskContext(projectId, taskId);
      set((state) => ({
        contextByTaskId: { ...state.contextByTaskId, [taskId]: response.context_code || "# No previous context available." }
      }));
    } catch (e) {
      set((state) => ({
        contextByTaskId: { ...state.contextByTaskId, [taskId]: "# Error loading context." }
      }));
    }
  },

  submitCode: async (taskId, code) => {
    set({ isSubmitting: true, consoleOutput: "Running tests...\n" });
    try {
      const response = await submissionApi.submitCode(taskId, code);
      const newOutput = `[TEST RESULTS]\nStatus: ${response.submission.status.toUpperCase()}\n\n[LOGS]\n${response.details}`;
      set({ consoleOutput: newOutput, isSubmitting: false });
    } catch (err: any) {
      set({ 
        consoleOutput: `[ERROR] Failed to submit code:\n${err.response?.data?.detail || err.message}`,
        isSubmitting: false 
      });
    }
  },

  clearConsole: () => set({ consoleOutput: "Welcome to AIT Practice Console.\nReady to run tests..." })
}));
