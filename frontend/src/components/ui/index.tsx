// MediSecure Cloud Platform - Common UI Components
// Healthcare-grade reusable components

import React from "react";
import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

// ============= Button Component =============
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon: Icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary:
      "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 focus:ring-neutral-500",
    danger:
      "bg-accent-600 hover:bg-accent-700 text-white focus:ring-accent-500",
    ghost: "hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500",
    outline:
      "border border-neutral-300 hover:bg-neutral-50 text-neutral-700 focus:ring-neutral-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
}

// ============= Input Component =============
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: LucideIcon;
}

export function Input({
  label,
  error,
  helper,
  icon: Icon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-neutral-400" />
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            "medical-input",
            Icon && "pl-10",
            error &&
              "border-accent-500 focus:border-accent-500 focus:ring-accent-500",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-accent-600">{error}</p>}
      {helper && !error && <p className="text-sm text-neutral-500">{helper}</p>}
    </div>
  );
}

// ============= Card Component =============
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  children,
  className,
  actions,
}: CardProps) {
  return (
    <div className={clsx("medical-card", className)}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ============= Loading Spinner =============
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-2 border-primary-600 border-t-transparent",
        sizes[size],
        className
      )}
    />
  );
}

// ============= Status Badge =============
interface StatusBadgeProps {
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusClasses = {
    ACTIVE: "status-active",
    INACTIVE: "status-inactive",
    PENDING: "status-pending",
  };

  return (
    <span className={clsx(statusClasses[status], className)}>{status}</span>
  );
}

// ============= Alert Component =============
interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  variant?: "info" | "success" | "warning" | "error"; // Added for compatibility
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  type,
  variant,
  title,
  children,
  className,
}: AlertProps) {
  // Use variant or type (for compatibility)
  const alertType = variant || type || "info";

  const typeClasses = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-secondary-50 border-secondary-200 text-secondary-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-accent-50 border-accent-200 text-accent-800",
  };

  return (
    <div
      className={clsx(
        "p-4 rounded-lg border",
        typeClasses[alertType],
        className
      )}
    >
      {title && <h4 className="font-medium mb-1">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ============= Modal Component =============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={clsx(
            "inline-block w-full p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg",
            sizeClasses[size]
          )}
        >
          {title && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {title}
              </h3>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
