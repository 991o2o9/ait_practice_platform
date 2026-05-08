import { Terminal, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useIDEStore } from '@/features/ide/model/useIDEStore';

export function IDEConsole() {
  const { consoleOutput, clearConsole } = useIDEStore();

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#252526]">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Terminal className="h-4 w-4" />
          TERMINAL & TEST RESULTS
        </div>
        
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#333]" onClick={clearConsole}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-sm whitespace-pre-wrap">
          <span className="text-gray-300">{consoleOutput}</span>
          <span className="animate-pulse">_</span>
        </div>
      </ScrollArea>
    </div>
  );
}
