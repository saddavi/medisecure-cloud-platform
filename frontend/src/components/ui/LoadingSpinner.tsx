import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  text,
  className = "",
}) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Main spinner */}
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full animate-spin`}
          style={{
            borderTopColor: "#3b82f6",
            animationDuration: "1s",
          }}
        />

        {/* Inner pulse effect */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-blue-100 rounded-full animate-ping`}
          style={{
            animationDuration: "2s",
          }}
        />
      </div>

      {text && (
        <p
          className={`mt-3 text-gray-600 ${textSizeClasses[size]} font-medium`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
