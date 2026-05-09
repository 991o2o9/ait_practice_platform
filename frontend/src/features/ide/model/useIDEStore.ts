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

export const useIDEStore = create<IDEState>((set, _get) => ({
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
      
      if (response.submission.status === 'passed') {
        // Fire confetti
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        });
        
        // Mark task passed
        const { markTaskPassed } = await import('@/entities/project/model/useProjectStore').then(m => m.useProjectStore.getState());
        markTaskPassed(taskId);
      }
    } catch (err: any) {
      set({ 
        consoleOutput: `[ERROR] Failed to submit code:\n${err.response?.data?.detail || err.message}`,
        isSubmitting: false 
      });
    }
  },

  clearConsole: () => set({ consoleOutput: "Welcome to AIT Practice Console.\nReady to run tests..." })
}));
