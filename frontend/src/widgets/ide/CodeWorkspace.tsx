import Editor from '@monaco-editor/react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Code2, History, Play } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
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

  const activeCode = codeByTaskId[activeTaskId] || '';
  const contextCode = contextByTaskId[activeTaskId] || '';

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
