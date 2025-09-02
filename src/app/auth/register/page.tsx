"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
} from "@/components/ui";
import { Heart, Users, Building2 } from "lucide-react";

type UserType = "planner" | "vendor" | "viewer";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<UserType>("planner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const userData = {
      full_name: fullName,
      user_type: userType,
    };

    const { error } = await signUp(email, password, userData);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Show success message and redirect to login
      router.push(
        "/auth/login?message=Please check your email to verify your account"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" className="max-w-md w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-500">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-display text-2xl font-light text-text-primary">
                Join MomentMoi
              </CardTitle>
              <CardDescription className="text-body text-text-secondary">
                Create your event planning account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-text-primary">
                  I am a...
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={
                      userType === "planner" ? "stacked" : "stacked-outline"
                    }
                    onClick={() => setUserType("planner")}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>Planner</span>
                  </Button>
                  <Button
                    type="button"
                    variant={
                      userType === "vendor" ? "stacked" : "stacked-outline"
                    }
                    onClick={() => setUserType("vendor")}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Vendor</span>
                  </Button>
                  <Button
                    type="button"
                    variant={
                      userType === "viewer" ? "stacked" : "stacked-outline"
                    }
                    onClick={() => setUserType("viewer")}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Viewer</span>
                  </Button>
                </div>
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-text-secondary">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
