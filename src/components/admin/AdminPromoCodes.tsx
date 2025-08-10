import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Link,
  Edit,
  Trash2,
} from "lucide-react";

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
          <div className="space-y-4">
            {/* Add New Promo Code */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
              <Input placeholder="Code" />
              <Input placeholder="Amount" type="number" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin</SelectItem>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Code
              </Button>
            </div>

            {/* Promo Codes Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>{code.amount}</TableCell>
                    <TableCell>{code.currency}</TableCell>
                    <TableCell>
                      {new Date(code.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(code.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(code.usageStatus) as any}>
                        {code.usageStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Link className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromoCodes;
