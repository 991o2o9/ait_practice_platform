import { useEffect, useState } from 'react';
import { adminUserApi, type AdminUserResponse } from '@/entities/user/api/adminUserApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Shield, CheckCircle2, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function UsersListPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminUserApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlockUser = async (userId: string) => {
    try {
      setIsPending(true);
      const data = await adminUserApi.toggleBlock(userId);
      toast.success(`User has been ${data.is_blocked ? 'blocked' : 'unblocked'}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to toggle block status');
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        <h2 className="mb-2 text-lg font-semibold">Error Loading Users</h2>
        <p>There was a problem fetching the users list. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage all users registered on the platform.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Socials</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registered</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Passed</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user: AdminUserResponse) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="h-8 w-8 rounded-full bg-muted object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {user.github_id && <span>GitHub</span>}
                      {user.discord_id && <span>Discord</span>}
                      {!user.github_id && !user.discord_id && <span>-</span>}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {user.role === 'admin' ? (
                      <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 flex w-fit gap-1 items-center">
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Student</Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 align-middle font-medium">
                    {user.passed_submissions_count || 0}
                  </td>
                  <td className="p-4 align-middle">
                    {user.is_blocked ? (
                      <Badge variant="destructive" className="flex w-fit gap-1 items-center">
                        <Ban className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 flex w-fit gap-1 items-center">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Button
                      variant={user.is_blocked ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => toggleBlockUser(user.id)}
                      disabled={isPending || user.role === 'admin'}
                      className="w-[100px]"
                    >
                      {user.is_blocked ? 'Unblock' : 'Block User'}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
