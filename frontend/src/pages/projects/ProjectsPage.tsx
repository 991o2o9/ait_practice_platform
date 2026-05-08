import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { LayoutDashboard, Clock, Search, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { useUserStore } from '@/entities/user/model/useUserStore';
import { IDEHeader } from '@/widgets/ide/Header';
import { projectApi } from '@/entities/project/api/projectApi';
import { useDebounce } from '@/shared/lib/hooks';

export function ProjectsPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['projects', debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 20;
      return projectApi.getProjects({ limit, offset: pageParam, search: debouncedSearch });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProjects = data?.pages.flatMap(page => page) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans">
      <IDEHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b pb-8">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Practice Scenarios
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Dive into real-world architectures and level up your system design skills.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl transition-all"
              />
            </div>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/admin')} className="h-11 px-6 rounded-xl font-semibold gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="mt-6 text-muted-foreground font-medium tracking-wide">Loading architecture scenarios...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-2xl text-center max-w-lg mx-auto">
            <p className="text-destructive font-medium mb-6">{error instanceof Error ? error.message : 'An error occurred'}</p>
            <Button variant="outline" className="h-10 px-6 rounded-xl" onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        ) : allProjects.length === 0 ? (
          <div className="text-center py-32 px-6 border rounded-3xl bg-muted/20 max-w-2xl mx-auto">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No scenarios found</h3>
            <p className="text-muted-foreground mb-8 text-lg">We couldn't find any projects matching your criteria.</p>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/admin')} className="h-12 px-8 rounded-xl font-medium">
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project) => {
              const total = project.total_tasks || 0;
              const passed = project.passed_tasks || 0;
              const progressPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
              const isCompleted = total > 0 && passed === total;

              return (
                <Card 
                  key={project.id} 
                  className="group flex flex-col hover:border-primary/50 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-primary/5"
                >
                  <CardHeader className="p-6 md:p-8 pb-4">
                    <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 px-6 md:px-8 pb-6">
                    <CardDescription className="line-clamp-3 text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      {project.description}
                    </CardDescription>
                  </CardContent>
                  
                  <div className="px-6 md:px-8 pb-6">
                    <div className="flex justify-between items-end mb-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress</p>
                        <p className="text-sm font-medium">
                          {passed} / {total} tasks
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isCompleted ? 'bg-primary' : 'bg-primary/60 group-hover:bg-primary/80'}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <CardFooter className="p-6 md:p-8 pt-4 border-t bg-muted/10 flex justify-between items-center group-hover:bg-muted/20 transition-colors">
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4 opacity-70" />
                      {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <Button 
                      onClick={() => navigate(`/projects/${project.id}/workspace`)}
                      className={`h-10 px-5 rounded-xl font-semibold gap-2 transition-all duration-300 ${isCompleted ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {isCompleted ? 'Review' : passed > 0 ? 'Continue' : 'Start'}
                      {!isCompleted && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Intersection Observer target */}
        <div ref={ref} className="py-8 flex justify-center mt-4">
          {isFetchingNextPage && (
            <div className="animate-pulse flex items-center gap-3 bg-muted px-6 py-3 rounded-full border">
              <div className="h-4 w-4 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
              <span className="text-sm font-medium text-muted-foreground">Loading more...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
