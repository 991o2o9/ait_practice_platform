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

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const loginAction = useUserStore((state) => state.login);
  const checkAuth = useUserStore((state) => state.checkAuth);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => userApi.register(values.username, values.email, values.password),
    onSuccess: async (_, variables) => {
      // Auto-login after successful registration
      try {
        const tokenData = await userApi.login(variables.email, variables.password);
        loginAction(tokenData.access_token);
        await checkAuth();
        navigate('/');
      } catch (loginError) {
        navigate('/login'); // Fallback to login if auto-login fails
      }
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.detail || "Failed to register. Please try again.");
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-background/80 border-white/10 dark:border-white/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="johndoe" 
              {...register("username")}
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
            {mutation.isPending ? "Creating account..." : "Create account"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
