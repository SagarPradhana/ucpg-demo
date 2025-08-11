import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  amount: number;
  currency: string;
  createdDate: string;
  expirationDate: string;
  usageStatus: "active" | "used" | "expired";
  qrLink: string;
}

interface AdminPromoCodesProps {
  promoCodes: PromoCode[];
  getStatusBadge: (status: string) => string;
}

const AdminPromoCodes: React.FC<AdminPromoCodesProps> = ({
  promoCodes,
  getStatusBadge,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes Management</CardTitle>
          <CardDescription>Manage QR links and promo codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-xl font-semibold mb-1">Coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              We’re working on this section. You’ll be able to create and manage
              promo codes here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromoCodes;
