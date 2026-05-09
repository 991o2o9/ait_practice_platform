import { useEffect, useState } from 'react';
import { adminApi } from '@/entities/admin/api/adminApi';
import type { Project } from '@/entities/admin/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog states
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProjects();
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDescription(project.description);
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;
    setIsSaving(true);
    try {
      await adminApi.updateProject(editingProject.id, {
        title: editTitle,
        description: editDescription,
      });
      toast.success('Project updated successfully');
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteProject(deletingProject.id);
      toast.success('Project deleted successfully');
      setDeletingProject(null);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Projects</h1>
        <p className="text-zinc-400 mt-2">Manage all platform projects and tasks.</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">All Projects</CardTitle>
          <CardDescription>A list of all projects created by you and AI.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">No projects found. Go generate some!</div>
          ) : (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableHead className="text-zinc-400">Title</TableHead>
                    <TableHead className="text-zinc-400">Description</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Created At</TableHead>
                    <TableHead className="w-[100px] text-right text-zinc-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-zinc-200">
                        {project.title}
                      </TableCell>
                      <TableCell className="text-zinc-400 max-w-[300px] truncate">
                        {project.description}
                      </TableCell>
                      <TableCell>
                        {project.ai_generated ? (
                          <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Generated
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-400 border-zinc-700">Manual</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          {/* @ts-expect-error Trigger asChild prop type might be missing */}
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <DropdownMenuItem onClick={() => openEditDialog(project)} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingProject(project)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 focus:bg-red-400/10 focus:text-red-300 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Make changes to your project details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-300">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-zinc-300">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-zinc-950 border-zinc-800 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProject(null)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently delete the project
              "<span className="text-zinc-200 font-medium">{deletingProject?.title}</span>" and remove all its tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingProject(null)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
