"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClientComponentClient } from "@/lib/supabase";
import {
  categorizeAuthError,
  logAuthError,
  logAuthSuccess,
  retryAuthOperation,
  createErrorContext,
} from "@/lib/error-handler";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: any
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const userDataForLogging = {
      email,
      userType: "unknown", // We'll get this from the user profile after signin
    };

    const errorContext = createErrorContext("AuthContext", "signin");

    try {
      console.log("🔐 Attempting user signin:", {
        email: email.split("@")[0] + "@***",
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Log successful signin
      if (data.user) {
        const userType = data.user.user_metadata?.user_type || "unknown";

        logAuthSuccess(
          "signin",
          {
            ...userDataForLogging,
            userId: data.user.id,
            userType,
          },
          {
            lastSignInAt: data.user.last_sign_in_at,
            emailConfirmed: data.user.email_confirmed_at !== null,
            userMetadata: data.user.user_metadata,
          }
        );

        console.log("✅ User signed in successfully, profile should exist", {
          userId: data.user.id,
          email: email.split("@")[0] + "@***",
          userType,
          lastSignInAt: data.user.last_sign_in_at,
        });
      }

      return { error: null };
    } catch (error: any) {
      // Enhanced error logging with categorization
      const authError = categorizeAuthError(
        error,
        "signin",
        userDataForLogging
      );
      logAuthError(authError, {
        context: errorContext,
        signinAttempt: {
          email: email.split("@")[0] + "@***",
          hasPassword: !!password,
        },
        supabaseError: {
          message: error?.message,
          status: error?.status,
          code: error?.code,
        },
      });

      // Return categorized error with user-friendly message
      return {
        error: {
          ...authError,
          originalMessage: error?.message,
        },
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const userDataForLogging = {
      email,
      userType: userData?.user_type,
      fullName: userData?.full_name,
    };

    const errorContext = createErrorContext("AuthContext", "signup");

    try {
      // Use retry mechanism for signup operation
      const result = await retryAuthOperation(
        async () => {
          console.log("🔐 Attempting user signup:", {
            email: email.split("@")[0] + "@***",
            userType: userData?.user_type,
            timestamp: new Date().toISOString(),
          });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData,
            },
          });

          if (error) {
            throw error;
          }

          return { data, error: null };
        },
        "signup",
        userDataForLogging,
        2, // maxRetries
        1000 // delay
      );

      // Log successful signup
      if (result.data?.user) {
        logAuthSuccess(
          "signup",
          {
            ...userDataForLogging,
            userId: result.data.user.id,
          },
          {
            confirmedAt: result.data.user.email_confirmed_at,
            createdAt: result.data.user.created_at,
            hasProfileTrigger: true, // Database trigger should create profile
          }
        );

        console.log(
          "✅ User created successfully, profile should be created by database trigger",
          {
            userId: result.data.user.id,
            email: email.split("@")[0] + "@***",
            userType: userData?.user_type,
          }
        );
      }

      return result;
    } catch (error: any) {
      // Enhanced error logging with categorization
      const authError = categorizeAuthError(
        error,
        "signup",
        userDataForLogging
      );
      logAuthError(authError, {
        context: errorContext,
        signupAttempt: {
          email: email.split("@")[0] + "@***",
          userType: userData?.user_type,
          hasPassword: !!password,
          passwordLength: password?.length,
        },
        supabaseError: {
          message: error?.message,
          status: error?.status,
          code: error?.code,
        },
      });

      // Return categorized error with user-friendly message
      return {
        error: {
          ...authError,
          originalMessage: error?.message, // Keep original for debugging
        },
      };
    }
  };

  const signOut = async () => {
    const errorContext = createErrorContext("AuthContext", "signout");
    const currentUserId = user?.id;
    const currentUserType = user?.user_metadata?.user_type;

    try {
      console.log("🔐 Attempting user signout:", {
        userId: currentUserId,
        email: user?.email ? user.email.split("@")[0] + "@***" : undefined,
        userType: currentUserType,
        timestamp: new Date().toISOString(),
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Log successful signout
      logAuthSuccess(
        "signout",
        {
          userId: currentUserId,
          email: user?.email,
          userType: currentUserType,
        },
        {
          sessionEndedAt: new Date().toISOString(),
        }
      );

      console.log("✅ User signed out successfully", {
        userId: currentUserId,
        userType: currentUserType,
      });
    } catch (error: any) {
      // Enhanced error logging with categorization
      const authError = categorizeAuthError(error, "signout", {
        userId: currentUserId,
        email: user?.email,
        userType: currentUserType,
      });

      logAuthError(authError, {
        context: errorContext,
        signoutAttempt: {
          userId: currentUserId,
          userType: currentUserType,
        },
        supabaseError: {
          message: error?.message,
          status: error?.status,
          code: error?.code,
        },
      });

      // For signout, we don't throw the error to avoid blocking the UI
      // but we still log it for debugging
      console.error("Error during signout (logged):", authError.userMessage);
    }
  };

  const resetPassword = async (email: string) => {
    const userDataForLogging = { email };
    const errorContext = createErrorContext("AuthContext", "reset_password");

    try {
      console.log("🔐 Attempting password reset:", {
        email: email.split("@")[0] + "@***",
        timestamp: new Date().toISOString(),
      });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Log successful password reset request
      logAuthSuccess("reset_password", userDataForLogging, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
        emailSentAt: new Date().toISOString(),
      });

      console.log("✅ Password reset email sent successfully", {
        email: email.split("@")[0] + "@***",
      });

      return { error: null };
    } catch (error: any) {
      // Enhanced error logging with categorization
      const authError = categorizeAuthError(
        error,
        "reset_password",
        userDataForLogging
      );
      logAuthError(authError, {
        context: errorContext,
        resetAttempt: {
          email: email.split("@")[0] + "@***",
        },
        supabaseError: {
          message: error?.message,
          status: error?.status,
          code: error?.code,
        },
      });

      // Return categorized error with user-friendly message
      return {
        error: {
          ...authError,
          originalMessage: error?.message,
        },
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
