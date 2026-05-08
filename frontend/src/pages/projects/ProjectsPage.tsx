import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/entities/project/model/useProjectStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { LayoutDashboard, Sparkles, Clock, User as UserIcon } from 'lucide-react';
import { useUserStore } from '@/entities/user/model/useUserStore';
import { IDEHeader } from '@/widgets/ide/Header';

export function ProjectsPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { projects, isLoading, error, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <IDEHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
            <p className="text-muted-foreground mt-1">Select a project to start practicing your system design skills.</p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => navigate('/admin')} className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchProjects()}>Try Again</Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/10">
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">There are currently no active projects available.</p>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/admin')}>Create Project in Admin Panel</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-primary/5">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    {project.ai_generated ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full">
                        <Sparkles className="h-3 w-3" />
                        AI Generated
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <UserIcon className="h-3 w-3" />
                        Manual
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="line-clamp-3 text-sm/relaxed">
                    {project.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border flex justify-between items-center">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <Button size="sm" onClick={() => navigate(`/projects/${project.id}/workspace`)}>
                    Start Practicing
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
