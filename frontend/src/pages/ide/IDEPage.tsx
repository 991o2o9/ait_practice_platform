import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui/resizable';
import { IDEHeader } from '@/widgets/ide/Header';
import { TaskSidebar } from '@/widgets/ide/TaskSidebar';
import { CodeWorkspace } from '@/widgets/ide/CodeWorkspace';
import { IDEConsole } from '@/widgets/ide/Console';
import { useProjectStore } from '@/entities/project/model/useProjectStore';

export function IDEPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentProject, currentProject, isLoading, error } = useProjectStore();

  useEffect(() => {
    if (id) {
      setCurrentProject(id).catch(() => {
        // Если проект не найден или ошибка, возвращаем на главную
        navigate('/');
      });
    }
  }, [id, setCurrentProject, navigate]);

  if (isLoading || !currentProject) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <IDEHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

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
