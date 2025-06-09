// MediSecure Cloud Platform - Register Component
// Healthcare-grade user registration interface

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Heart,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Alert } from "@/components/ui";
import { RegisterFormData } from "@/types";

// ============= Validation Schema =============
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[\d\s-()]+$/.test(val),
        "Invalid phone number format"
      ),
    dateOfBirth: z
      .string()
      .optional()
      .refine(
        (val) => !val || new Date(val) < new Date(),
        "Date of birth must be in the past"
      ),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and privacy policy"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ============= Register Component =============
export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Watch password for strength indicator
  const password = watch("password");

  const getPasswordStrength = (password: string) => {
    const checks = [
      { regex: /.{12,}/, label: "At least 12 characters" },
      { regex: /[A-Z]/, label: "Uppercase letter" },
      { regex: /[a-z]/, label: "Lowercase letter" },
      { regex: /[0-9]/, label: "Number" },
      { regex: /[^A-Za-z0-9]/, label: "Special character" },
    ];

    return checks.map((check) => ({
      ...check,
      passed: check.regex.test(password),
    }));
  };

  const passwordChecks = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
      });

      // Redirect to login with success message
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please check your email for verification.",
        },
      });
    } catch (error) {
      console.error("Registration failed:", error);
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
          <h2 className="text-3xl font-bold text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Join our secure healthcare platform
          </p>
        </div>

        {/* Registration Form */}
        <div className="medical-card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Alert */}
            {error && (
              <Alert type="error" className="animate-fade-in">
                {error}
              </Alert>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                icon={User}
                placeholder="John"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Last Name"
                type="text"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="john.doe@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone Number (Optional)"
                type="tel"
                icon={Phone}
                placeholder="+974 XXXX XXXX"
                error={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
              <Input
                label="Date of Birth (Optional)"
                type="date"
                icon={Calendar}
                error={errors.dateOfBirth?.message}
                {...register("dateOfBirth")}
              />
            </div>

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
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {password && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-neutral-700">
                    Password requirements:
                  </p>
                  <div className="space-y-1">
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check
                          className={`h-3 w-3 ${
                            check.passed
                              ? "text-secondary-600"
                              : "text-neutral-300"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            check.passed
                              ? "text-secondary-600"
                              : "text-neutral-500"
                          }`}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`medical-input pl-10 pr-10 ${
                    errors.confirmPassword
                      ? "border-accent-500 focus:border-accent-500 focus:ring-accent-500"
                      : ""
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-accent-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  {...register("acceptTerms")}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-neutral-700">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-accent-600">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full"
            >
              {isSubmitting || isLoading
                ? "Creating account..."
                : "Create account"}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Healthcare Compliance Notice */}
        <div className="text-center">
          <p className="text-xs text-neutral-500">
            Your data is protected with enterprise-grade security
            <br />
            and complies with HIPAA regulations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
