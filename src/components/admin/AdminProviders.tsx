import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  type: string;
  apiEndpoint: string;
  redirectLink: string;
  transactionCount: number;
  totalAmount: number;
  isActive: boolean;
  lastActivity: string;
}

interface AdminProvidersProps {
  providers: Provider[];
}

const AdminProviders: React.FC<AdminProvidersProps> = ({ providers }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Providers</CardTitle>
          <CardDescription>
            Manage connected services and providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-xl font-semibold mb-1">Coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              We’re building out this section. You’ll be able to manage and
              configure providers here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProviders;
