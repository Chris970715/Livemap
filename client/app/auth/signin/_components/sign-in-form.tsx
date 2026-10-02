"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInAsDemo, signInWithCredentials } from "@/app/actions/auth";
import { signInSchema, type SignInFormValues } from "@/lib/validations/auth";

interface SignInFormProps {
  callbackUrl?: string;
  demoEmail: string;
  demoPassword: string;
}

export function SignInForm({ callbackUrl, demoEmail, demoPassword }: SignInFormProps) {
  const [isDemoPending, startDemoTransition] = useTransition();

  // 전체 페이지 이동 — 헤더의 useSession이 새 세션을 읽도록
  const handleDemoSignIn = () =>
    startDemoTransition(async () => {
      const result = await signInAsDemo(callbackUrl);
      if (result.data) {
        window.location.assign(result.data.redirectTo);
      } else {
        toast.error(result.error);
      }
    });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: demoEmail,
      password: demoPassword,
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (callbackUrl) formData.append("callbackUrl", callbackUrl);

    const result = await signInWithCredentials(formData);
    if (result.data) {
      window.location.assign(result.data.redirectTo);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="relative w-full max-w-md">
        <Link
          href="/"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Back to home</span>
        </Link>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>Explore Huginn instantly with the demo account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={handleDemoSignIn} disabled={isDemoPending}>
            {isDemoPending ? "Signing in..." : "Continue with demo account"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo account: {demoEmail} / {demoPassword}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
