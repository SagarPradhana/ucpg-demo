import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  BarChart3,
  Users,
  Settings,
  Coins,
  ArrowRight,
  CheckCircle2,
  Crown,
  User as UserIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo?: {
    name?: string;
    email?: string;
  };
}

type SelectedRole = "admin" | "user" | null;

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  userInfo,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const roles = [
    {
      id: "admin" as const,
      title: t("roleSelection.admin.title"),
      subtitle: t("roleSelection.admin.subtitle"),
      description: t("roleSelection.admin.description"),
      icon: Crown,
      color: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200",
      iconColor: "text-orange-600",
      badgeColor: "bg-orange-100 text-orange-800",
      route: "/admin",
      features: [
        t("roleSelection.admin.features.userManagement"),
        t("roleSelection.admin.features.systemAnalytics"),
        t("roleSelection.admin.features.platformSettings"),
        t("roleSelection.admin.features.securityControls"),
        t("roleSelection.admin.features.transactionMonitoring"),
      ],
    },
    {
      id: "user" as const,
      title: t("roleSelection.user.title"),
      subtitle: t("roleSelection.user.subtitle"),
      description: t("roleSelection.user.description"),
      icon: UserIcon,
      color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
      iconColor: "text-blue-600",
      badgeColor: "bg-blue-100 text-blue-800",
      route: "/dashboard",
      features: [
        t("roleSelection.user.features.sendPayments"),
        t("roleSelection.user.features.receivePayments"),
        t("roleSelection.user.features.transactionHistory"),
        t("roleSelection.user.features.walletManagement"),
        t("roleSelection.user.features.anonymousTransactions"),
      ],
    },
  ];

  const handleRoleSelect = (roleId: SelectedRole) => {
    setSelectedRole(roleId);
  };

  const handleProceed = async () => {
    if (!selectedRole) return;

    setIsProcessing(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const selectedRoleData = roles.find((role) => role.id === selectedRole);
      if (selectedRoleData) {
        navigate(selectedRoleData.route);
        onClose();
      }
      setIsProcessing(false);
    }, 800);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    onClose();
    navigate("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              {t("roleSelection.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {t("roleSelection.subtitle")}
          </DialogDescription>
          {userInfo && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium">{userInfo.name}</p>
              <p className="text-muted-foreground">{userInfo.email}</p>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected
                      ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                      : "hover:scale-[1.01]"
                  } ${role.color}`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-3 rounded-lg bg-white/80 ${role.iconColor}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {isSelected && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <Badge variant="default" className="text-xs">
                            {t("roleSelection.selected")}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {role.subtitle}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {role.description}
                    </p>

                    <div className="space-y-2">
                      <Badge variant="secondary" className={role.badgeColor}>
                        {t("roleSelection.keyFeatures")}
                      </Badge>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {role.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 sm:flex-none"
              disabled={isProcessing}
            >
              {t("roleSelection.cancel")}
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!selectedRole || isProcessing}
              className="flex-1 group"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t("roleSelection.proceeding")}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{t("roleSelection.proceed")}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              <span>{t("roleSelection.securityNotice")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("roleSelection.securityText")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal;
