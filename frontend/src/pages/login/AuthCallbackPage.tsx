import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/useUserStore';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const loginAction = useUserStore((state) => state.login);
  const checkAuth = useUserStore((state) => state.checkAuth);

  useEffect(() => {
    const handleAuth = async () => {
      if (token) {
        loginAction(token);
        await checkAuth();
        navigate('/');
      } else {
        // If no token, maybe there was an error
        navigate('/login');
      }
    };

    handleAuth();
  }, [token, loginAction, checkAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
