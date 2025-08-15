import React from "react";
import { FileX, Search, Calendar, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NoDataProps {
  title?: string;
  description?: string;
  icon?: "file" | "search" | "calendar" | "database" | "alert";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "detailed";
}

const iconMap = {
  file: FileX,
  search: Search,
  calendar: Calendar,
  database: Database,
  alert: AlertCircle,
};

const NoData: React.FC<NoDataProps> = ({
  title = "No data available",
  description = "There are no items to display at the moment.",
  icon = "file",
  actionLabel,
  onAction,
  className,
  size = "md",
  variant = "default",
}) => {
  const IconComponent = iconMap[icon];

  const sizeClasses = {
    sm: {
      container: "py-6",
      icon: "h-8 w-8",
      title: "text-sm font-medium",
      description: "text-xs",
      button: "text-xs px-3 py-1.5",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-lg font-semibold",
      description: "text-sm",
      button: "text-sm px-4 py-2",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-xl font-bold",
      description: "text-base",
      button: "px-6 py-3",
    },
  };

  const currentSize = sizeClasses[size];

  if (variant === "minimal") {
    return (
      <div className={cn("text-center text-muted-foreground py-8", className)}>
        <div className={currentSize.title}>{title}</div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("text-center", currentSize.container, className)}>
        <div className="mx-auto mb-4 flex items-center justify-center">
          <div className="rounded-full bg-muted p-4">
            <IconComponent className={cn(currentSize.icon, "text-muted-foreground")} />
          </div>
        </div>
        <h3 className={cn(currentSize.title, "text-foreground mb-2")}>{title}</h3>
        <p className={cn(currentSize.description, "text-muted-foreground mb-6 max-w-md mx-auto")}>
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" className={currentSize.button}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("text-center", currentSize.container, className)}>
      <IconComponent className={cn(currentSize.icon, "mx-auto text-muted-foreground mb-4")} />
      <h3 className={cn(currentSize.title, "text-foreground mb-2")}>{title}</h3>
      <p className={cn(currentSize.description, "text-muted-foreground mb-4")}>{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className={currentSize.button}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

NoData.displayName = "NoData";

export { NoData };

// Preset configurations for common use cases
export const NoDataPresets = {
  reports: {
    title: "No reports available",
    description: "No data found for the selected time range and filters. Try adjusting your filters or selecting a different time period.",
    icon: "calendar" as const,
  },
  transactions: {
    title: "No transactions found",
    description: "No transactions match your current filters. Try adjusting the date range or clearing some filters.",
    icon: "search" as const,
  },
  users: {
    title: "No users found",
    description: "No users match your search criteria. Try adjusting your filters or search terms.",
    icon: "search" as const,
  },
  errors: {
    title: "No errors found",
    description: "No error logs found for the selected time period. This is good news!",
    icon: "alert" as const,
  },
  general: {
    title: "No data available",
    description: "There is no data to display at the moment.",
    icon: "database" as const,
  },
} as const;
