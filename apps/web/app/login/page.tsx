"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { requestPasswordReset } from "@/lib/api/auth"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Users, Clock, FileText } from "lucide-react";
import { toast } from "sonner"

function toReadableSignInError(errorCode?: string): string {
  if (!errorCode) {
    return "Invalid email or password"
  }

  if (errorCode === "CredentialsSignin") {
    return "Invalid email or password"
  }

  return "Unable to sign in. Please try again."
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false)
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim()
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false, // handle redirect manually
      });

      if (result?.error) {
        setError(toReadableSignInError(result.error));
      } else if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError("Unable to sign in. Please try again.")
      }
    } catch (error) {
      console.error("[auth] Sign-in failed:", error)
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //for forgot password
  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      toast.error("Please enter your email first")
      return
    }

    setSendingResetEmail(true)
    try {
      await requestPasswordReset(normalizedEmail)
      console.log(`[auth] Password reset requested for ${normalizedEmail}`)
      toast.success("Password reset email sent (if account exists). Check your inbox.")
    } catch (err) {
      console.error("[auth] Failed to send reset email:", err)
      toast.error(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setSendingResetEmail(false)
    }
  }

  // Don't render anything while checking auth or if already authenticated
  if (status === "loading" || status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  HR - Zero to One
                </h1>
                <p className="text-slate-600">Professional HR Management</p>
              </div>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              Streamline your workforce management with our comprehensive HR
              platform. Track attendance, manage leave requests, and empower
              your team with self-service tools.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Employee Management
                </h3>
                <p className="text-sm text-slate-600">
                  Complete employee profiles and directory
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Time Tracking</h3>
                <p className="text-sm text-slate-600">
                  Automated check-in and attendance
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Leave Management
                </h3>
                <p className="text-sm text-slate-600">
                  Streamlined leave requests and approvals
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 " />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Analytics & Reports
                </h3>
                <p className="text-sm text-slate-600">
                  Comprehensive workforce insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-slate-900">
                  HR - 021
                </span>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm sm:text-base">
                Sign in to your HR dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-11 border-slate-200 focus:border-black focus:ring-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11 border-slate-200 focus:border-black focus:ring-black"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-black hover:bg-black/90 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={sendingResetEmail}
                  className="text-black dark:text-white hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {sendingResetEmail ? "Sending reset email..." : "Forgot Password?"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
