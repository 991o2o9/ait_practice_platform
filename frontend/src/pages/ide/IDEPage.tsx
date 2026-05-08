import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui/resizable';
import { IDEHeader } from '@/widgets/ide/Header';
import { TaskSidebar } from '@/widgets/ide/TaskSidebar';
import { CodeWorkspace } from '@/widgets/ide/CodeWorkspace';
import { IDEConsole } from '@/widgets/ide/Console';

export function IDEPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header */}
      <IDEHeader />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-none border-none">
          
          {/* Left Panel: Sidebar */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <TaskSidebar />
          </ResizablePanel>

          {/* Draggable Handle */}
          <ResizableHandle withHandle />

          {/* Right Panel: Editor + Console */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Top Sub-Panel: Code Editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <CodeWorkspace />
              </ResizablePanel>

              {/* Draggable Handle */}
              <ResizableHandle withHandle />

              {/* Bottom Sub-Panel: Console */}
              <ResizablePanel defaultSize={30} minSize={15}>
                <IDEConsole />
              </ResizablePanel>
              
            </ResizablePanelGroup>
          </ResizablePanel>
          
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
