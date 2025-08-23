import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, Activity } from "lucide-react";

interface PromoMetricsProps {
  activeLinks: any;
  usedLinks: any;
  isLoading?: boolean;
}

export const PromoMetrics: React.FC<PromoMetricsProps> = ({
  activeLinks,
  usedLinks,
  isLoading,
}) => {
  const activeCount = activeLinks?.data?.active_promo_links ?? 0;
  const usedCount = usedLinks?.data?.used_promo_links ?? 0;
  const totalCount = activeCount + usedCount;
  const usageRate =
    totalCount > 0 ? ((usedCount / totalCount) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5" />
            Promo Code Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 border shadow-sm"
              >
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-teal-500 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-teal-600" />
          Promo Code Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Promo Links */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-teal-700 uppercase tracking-wide">
                Active Links
              </div>
              <div className="h-8 w-8 rounded-full bg-teal-200 flex items-center justify-center">
                <Activity className="h-4 w-4 text-teal-700" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-teal-800">{activeCount}</p>
              <p className="text-xs text-teal-600">Ready for use</p>
            </div>
          </div>

          {/* Used Promo Links */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                Used Links
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center">
                <QrCode className="h-4 w-4 text-amber-700" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-amber-800">{usedCount}</p>
              <p className="text-xs text-amber-600">Successfully redeemed</p>
            </div>
          </div>

          {/* Usage Rate */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                Usage Rate
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-800">{usageRate}%</p>
              <p className="text-xs text-blue-600">Conversion rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
