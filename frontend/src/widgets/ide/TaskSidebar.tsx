import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import Editor from '@monaco-editor/react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useProjectStore } from '@/entities/project/model/useProjectStore';

export function TaskSidebar() {
  const { tasks, activeTaskId, setActiveTask, passedTaskIds } = useProjectStore();

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const { theme } = useTheme();
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-lg tracking-tight">Project Steps</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete all steps to finish the project.</p>
      </div>

      {/* Stepper (List of tasks) */}
      <ScrollArea className="h-[30%] border-b border-border">
        <div className="p-4 space-y-3">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">No tasks yet.</p>
          )}
          {tasks.map((task, index) => {
            const isPassed = passedTaskIds.includes(task.id);
            const isCurrent = task.id === activeTaskId;
            
            // Task is unlocked if it's passed, or if the PREVIOUS task is passed (or it's the first task)
            const isUnlocked = index === 0 || passedTaskIds.includes(tasks[index - 1].id);
            
            let status = 'locked';
            if (isPassed && !isCurrent) status = 'passed';
            else if (isCurrent) status = 'current';
            else if (isUnlocked) status = 'unlocked_not_current';

            return (
              <div 
                key={task.id} 
                onClick={() => {
                  if (isUnlocked || isPassed) {
                    setActiveTask(task.id);
                  }
                }}
                className={`flex items-start gap-3 p-2 rounded-md transition-colors ${
                  isUnlocked || isPassed ? 'cursor-pointer hover:bg-muted/50' : 'cursor-not-allowed opacity-50'
                } ${status === 'current' ? 'bg-primary/10' : ''}`}
              >
                <div className="mt-0.5 shrink-0">
                  {isPassed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {isCurrent && !isPassed && <Circle className="h-5 w-5 text-primary fill-primary/20" />}
                  {!isPassed && !isCurrent && isUnlocked && <Circle className="h-5 w-5 text-muted-foreground" />}
                  {!isPassed && !isUnlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {index + 1}. {task.title}
                    </p>
                    <Badge variant={task.difficulty === 'easy' ? 'secondary' : task.difficulty === 'medium' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0 capitalize">
                      {task.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Task Description */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTask ? (
            <div className="space-y-6">
              <div className="space-y-4">
                {activeTask.description && (
                  <div className="text-sm text-muted-foreground">
                    <p>{activeTask.description}</p>
                  </div>
                )}
                
                {activeTask.learning_objective && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                    <span className="font-semibold text-primary block mb-1">Learning Objective:</span>
                    {activeTask.learning_objective}
                  </div>
                )}

                {activeTask.connections && (
                  <div className="text-xs text-muted-foreground italic">
                    <span className="font-medium not-italic mr-1">Connections:</span>
                    {activeTask.connections}
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-2">Instructions</h3>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeTask.hints || '*No description provided for this task.*'}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View Tests
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] bg-zinc-900 border-zinc-800 text-zinc-100">
                    <DialogHeader>
                      <DialogTitle>Task Test Code</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        This is the code that will be used to evaluate your solution.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="h-[400px] w-full rounded-md border border-zinc-800 overflow-hidden mt-4">
                      <Editor
                        height="100%"
                        language="python"
                        theme={monacoTheme}
                        value={activeTask.test_code}
                        options={{
                          readOnly: true,
                          domReadOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic prose prose-sm dark:prose-invert max-w-none">Select a task to view its description.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
