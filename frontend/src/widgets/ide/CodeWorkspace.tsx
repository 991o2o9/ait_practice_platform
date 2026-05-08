import Editor from '@monaco-editor/react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Code2, History, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { useIDEStore } from '@/features/ide/model/useIDEStore';
import { useProjectStore } from '@/entities/project/model/useProjectStore';

export function CodeWorkspace() {
  const { theme } = useTheme();
  
  const { activeTaskId, currentProject } = useProjectStore();
  const { codeByTaskId, contextByTaskId, setCode, fetchContext, submitCode, isSubmitting } = useIDEStore();

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

  useEffect(() => {
    if (currentProject && activeTaskId && !contextByTaskId[activeTaskId]) {
      fetchContext(currentProject.id, activeTaskId);
    }
  }, [currentProject, activeTaskId, contextByTaskId, fetchContext]);

  const handleRunCode = () => {
    if (activeTaskId) {
      const code = codeByTaskId[activeTaskId] || '';
      submitCode(activeTaskId, code);
    }
  };

  if (!activeTaskId) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center text-muted-foreground">
        Select a task to view the editor.
      </div>
    );
  }

  const currentTask = currentProject ? useProjectStore.getState().tasks.find(t => t.id === activeTaskId) : null;
  const activeCode = codeByTaskId[activeTaskId] ?? (currentTask?.solution_template || '');
  const contextCode = contextByTaskId[activeTaskId] || '';

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleResetToTemplate = () => {
    if (activeTaskId && currentTask) {
      setCode(activeTaskId, currentTask.solution_template || '');
      setIsResetDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-b border-border">
      <Tabs defaultValue="current" className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <TabsList className="h-8">
            <TabsTrigger value="current" className="text-xs">
              <Code2 className="h-3.5 w-3.5 mr-1.5" />
              Current Code
            </TabsTrigger>
            <TabsTrigger value="context" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Past Context
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-3 items-center">
            <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md hidden sm:block">
              python 3.11
            </div>
            
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-300 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-white">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to template?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This will permanently delete your current code and restore the initial task template. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetToTemplate} className="bg-red-600 hover:bg-red-700 text-white">
                    Yes, reset code
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button size="sm" onClick={handleRunCode} disabled={isSubmitting} className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-3.5 w-3.5" />
              {isSubmitting ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        </div>

        <TabsContent value="current" className="flex-1 m-0 border-none outline-none p-0">
          <Editor
            height="100%"
            language="python"
            theme={monacoTheme}
            value={activeCode}
            onChange={(val) => setCode(activeTaskId, val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
            }}
          />
        </TabsContent>

        <TabsContent value="context" className="flex-1 m-0 border-none outline-none p-0">
          <Editor
            height="100%"
            language="python"
            theme={monacoTheme}
            value={contextCode}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
