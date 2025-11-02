'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      initiateEmailSignIn(auth, data.email, data.password);
    } catch (error: any) {
       let errorMessage = 'An unexpected error occurred during sign-in.';
       if (error.code) {
         switch (error.code) {
           case 'auth/user-not-found':
           case 'auth/wrong-password':
             errorMessage = 'Invalid email or password.';
             break;
           case 'auth/invalid-email':
             errorMessage = 'Please enter a valid email address.';
             break;
           default:
             errorMessage = 'Failed to sign in. Please try again later.';
             break;
         }
       }
       setAuthError(errorMessage);
       toast({
         title: 'Authentication Error',
         description: errorMessage,
         variant: 'destructive',
       });
    }
  };

  if (isUserLoading || user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <HeartPulse className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your medication dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
        <CardFooter>
          <Card className="w-full bg-muted/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm text-center">Sample Credentials</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-center">
              <p>First, <Link href="/register" className="font-medium text-primary hover:underline">register</Link> with:</p>
              <p className="font-mono text-xs mt-2">Email: user@example.com</p>
              <p className="font-mono text-xs">Password: password</p>
            </CardContent>
          </Card>
        </CardFooter>
      </Card>
    </div>
  );
}
