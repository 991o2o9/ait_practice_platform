import Editor from '@monaco-editor/react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Code2, History } from 'lucide-react';
import { useState } from 'react';

const MOCK_CODE = `class Enrollment:
    def __init__(self, student_id, course_id):
        pass
`;

const MOCK_PAST_CONTEXT = `# Previous Task: Student & Teacher Models
class Student:
    def __init__(self, id, name):
        self.id = id
        self.name = name

class Teacher:
    def __init__(self, id, name):
        self.id = id
        self.name = name
`;

export function CodeWorkspace() {
  const { theme } = useTheme();
  const [code, setCode] = useState(MOCK_CODE);

  // When system theme changes or toggle is used, monaco theme should match
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

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
          
          <div className="flex gap-2">
            <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
              python 3.11
            </div>
          </div>
        </div>

        <TabsContent value="current" className="flex-1 m-0 border-none outline-none p-0">
          <Editor
            height="100%"
            language="python"
            theme={monacoTheme}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </TabsContent>

        <TabsContent value="context" className="flex-1 m-0 border-none outline-none p-0">
          <Editor
            height="100%"
            language="python"
            theme={monacoTheme}
            value={MOCK_PAST_CONTEXT}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
