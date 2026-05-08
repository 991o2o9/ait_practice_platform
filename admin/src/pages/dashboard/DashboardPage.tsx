import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderGit2, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/entities/admin/api/adminApi';
import type { AdminStats } from '@/entities/admin/api/adminApi';

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Overview of platform statistics and activity.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Users"
          value={isLoading ? '...' : stats?.total_users || 0}
          icon={Users}
          description="Registered platform users"
        />
        <StatCard
          title="Total Projects"
          value={isLoading ? '...' : stats?.total_projects || 0}
          icon={FolderGit2}
          description="Active practice projects"
        />
        <StatCard
          title="Passed Submissions"
          value={isLoading ? '...' : stats?.total_passed_submissions || 0}
          icon={CheckCircle2}
          description="Successfully completed tasks"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description }: any) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-zinc-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
