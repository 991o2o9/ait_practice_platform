import { adminUserApi, type AdminUserResponse } from '@/entities/user/api/adminUserApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Ban, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function UsersListPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminUserApi.getUsers,
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (userId: string) => adminUserApi.toggleBlock(userId),
    onSuccess: (data) => {
      toast.success(`User has been ${data.is_blocked ? 'blocked' : 'unblocked'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to toggle block status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6 text-red-500">
        <h2 className="mb-2 text-lg font-semibold">Error Loading Users</h2>
        <p>There was a problem fetching the users list. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Users</h1>
        <p className="text-zinc-400">
          Manage all users registered on the platform.
        </p>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-zinc-300">
            <thead className="[&_tr]:border-b border-zinc-800">
              <tr className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 data-[state=selected]:bg-zinc-800">
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">Socials</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">Registered</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">Passed</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users?.map((user: AdminUserResponse) => (
                <tr key={user.id} className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50 data-[state=selected]:bg-zinc-800">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="h-8 w-8 rounded-full bg-zinc-800 object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-zinc-200">{user.username}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2 text-zinc-400">
                      {user.github_id && <span className="text-xs">GitHub</span>}
                      {user.discord_id && <span className="text-xs">Discord</span>}
                      {!user.github_id && !user.discord_id && <span>-</span>}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {user.role === 'admin' ? (
                      <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 flex w-fit gap-1 items-center border-none">
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-400 border-zinc-700">Student</Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle text-zinc-400">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 align-middle font-medium text-zinc-200">
                    {user.passed_submissions_count || 0}
                  </td>
                  <td className="p-4 align-middle">
                    {user.is_blocked ? (
                      <Badge variant="destructive" className="flex w-fit gap-1 items-center border-none">
                        <Ban className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 flex w-fit gap-1 items-center border-none">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Button
                      variant={user.is_blocked ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => toggleBlockMutation.mutate(user.id)}
                      disabled={toggleBlockMutation.isPending || user.role === 'admin'}
                      className={`w-[100px] ${user.is_blocked ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : ''}`}
                    >
                      {user.is_blocked ? 'Unblock' : 'Block User'}
                    </Button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
