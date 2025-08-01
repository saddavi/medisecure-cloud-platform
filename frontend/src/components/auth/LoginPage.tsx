// MediSecure Cloud Platform - Login Component
// Healthcare-grade authentication interface

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Alert } from "@/components/ui";
import { LoginFormData } from "@/types";

// ============= Validation Schema =============
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// ============= Login Component =============
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);

      // Redirect to dashboard on successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-neutral-900">
                MediSecure
              </h1>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">Welcome back</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Modern healthcare platform for Qatar's digital transformation
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Secure patient management system built with AWS cloud infrastructure
          </p>
        </div>

        {/* Login Form */}
        <div className="medical-card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Alert */}
            {error && (
              <Alert type="error" className="animate-fade-in">
                {error}
              </Alert>
            )}

            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`medical-input pl-10 pr-10 ${
                    errors.password
                      ? "border-accent-500 focus:border-accent-500 focus:ring-accent-500"
                      : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-accent-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-neutral-700"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full"
            >
              {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* AI Symptom Checker Link */}
        <div className="mt-6 text-center">
          <Link
            to="/symptom-checker"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Try FREE AI Symptom Checker (No Login Required)
          </Link>
          <p className="mt-2 text-sm text-neutral-600">
            🤖 Powered by AWS Bedrock AI • Bilingual Arabic/English Support
          </p>
        </div>

        {/* Personal Portfolio Branding */}
        <div className="text-center space-y-2 mt-8">
          <p className="text-sm font-medium text-primary-600">
            AWS Cloud Engineering Portfolio Project by Talha Nasiruddin
          </p>
          <p className="text-xs text-neutral-600">
            Production healthcare platform built with AWS Lambda, DynamoDB,
            Cognito & CloudFront CDN
          </p>
          <p className="text-xs text-neutral-600">
            Demonstrating production AWS expertise • Open to Qatar & remote
            Cloud Architecture/DevOps roles
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <a
              href="https://linkedin.com/in/talhanasiruddin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              LinkedIn Profile
            </a>
            <span className="text-neutral-400">•</span>
            <a
              href="https://www.talharesume.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Portfolio & Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
