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
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => window.location.href = "http://localhost:8000/api/v1/oauth/github/login"}
            >
              <Github className="w-5 h-5" />
              GitHub
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center gap-2 hover:text-[#5865F2] transition-colors"
              onClick={() => window.location.href = "http://localhost:8000/api/v1/oauth/discord/login"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor" className="w-5 h-5">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Discord
            </Button>
          </div>

          <div className="text-sm text-center text-muted-foreground pt-2">
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
