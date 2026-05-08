import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { userApi } from '@/entities/user/api/userApi';
import { useUserStore } from '@/entities/user/model/useUserStore';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const loginAction = useUserStore((state) => state.login);
  const checkAuth = useUserStore((state) => state.checkAuth);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => userApi.login(values.email, values.password),
    onSuccess: async (data) => {
      loginAction(data.access_token);
      await checkAuth();
      navigate('/');
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.detail || "Failed to login. Please try again.");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-background/80 border-white/10 dark:border-white/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          {errorMsg && (
            <div className="p-3 bg-destructive/15 text-destructive rounded-md text-sm">
              {errorMsg}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full font-semibold transition-all" 
            type="submit" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
