import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  isLoading?: boolean;
  color: "blue" | "green" | "purple" | "orange" | "teal" | "amber";
  subtitle?: string;
}

const colorConfig = {
  blue: {
    border: "border-l-blue-500",
    icon: "text-blue-600",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    trend: "text-blue-600",
  },
  green: {
    border: "border-l-green-500",
    icon: "text-green-600",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    trend: "text-green-600",
  },
  purple: {
    border: "border-l-purple-500",
    icon: "text-purple-600",
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    trend: "text-purple-600",
  },
  orange: {
    border: "border-l-orange-500",
    icon: "text-orange-600",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    trend: "text-orange-600",
  },
  teal: {
    border: "border-l-teal-500",
    icon: "text-teal-600",
    bg: "bg-teal-50",
    iconBg: "bg-teal-100",
    trend: "text-teal-600",
  },
  amber: {
    border: "border-l-amber-500",
    icon: "text-amber-600",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    trend: "text-amber-600",
  },
};

export const EnhancedKPICard: React.FC<EnhancedKPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  isLoading,
  color,
  subtitle,
}) => {
  const colors = colorConfig[color];

  if (isLoading) {
    return (
      <Card
        className={`${colors.border} hover:shadow-md transition-shadow duration-200`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${colors.border} hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {trend && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="font-medium">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-muted-foreground">vs {trend.period}</p>
            )}
          </div>
          <div
            className={`h-12 w-12 rounded-full ${colors.iconBg} flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
