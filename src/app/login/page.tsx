"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { user, loading, accessDenied, authError, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Sign-in failed. Please try again.");
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-card shadow-sm">
            <Image src="/logo.avif" alt="YGPT" width={36} height={36} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">YGPT Dashboard</h1>
            <p className="text-sm text-muted-foreground">Event Operations</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>
              Use your YGPT Google account to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessDenied ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Access denied. Your Google account is not registered in this system.
                Contact your admin to get access.
              </div>
            ) : null}

            {authError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {authError}
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              className="w-full"
              onClick={handleSignIn}
              disabled={signingIn || loading}
            >
              {signingIn ? "Signing in..." : "Continue with Google"}
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is restricted to authorised YGPT team members only.
        </p>
      </div>
    </div>
  );
}
