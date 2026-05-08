import { Terminal, Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';

const MOCK_OUTPUT = `[INFO] Initializing environment...
[INFO] Loading user code...
[TEST] Running tests for Enrollment Entity...
[FAIL] AssertionError: Enrollment class is missing __init__ method.
[HINT] Ensure you define __init__(self, id, student_id, course_id, enrollment_date)
`;

export function IDEConsole() {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#252526]">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Terminal className="h-4 w-4" />
          TERMINAL & TEST RESULTS
        </div>
        
        <Button size="sm" className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white font-medium shadow-none">
          <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
          Run Code
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-sm whitespace-pre-wrap">
          <span className="text-blue-400">{'>'} python grader.py</span>
          {'\n'}
          <span className="text-gray-300">{MOCK_OUTPUT}</span>
          <span className="animate-pulse">_</span>
        </div>
      </ScrollArea>
    </div>
  );
}
