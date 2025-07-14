import { MessageSquare } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex justify-center items-center  gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6F31B5] to-purple-700 rounded-lg blur-sm opacity-75"></div>
        <div
          className={`${sizeClasses[size]} bg-gradient-to-r from-[#6F31B5] to-purple-700 rounded-lg flex items-center justify-center relative`}
        >
          <MessageSquare className="h-1/2 w-1/2 text-white" />
        </div>
      </div>
      {showText && (
        <span
          className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent`}
        >
          MyCHAT
        </span>
      )}
    </div>
  );
}
