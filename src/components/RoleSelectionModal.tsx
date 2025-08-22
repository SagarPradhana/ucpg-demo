import React, { useCallback, useMemo, useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Crown,
  User as UserIcon,
  Coins,
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

  const selectedRoleData = useMemo(
    () => roles.find((r) => r.id === selectedRole) || null,
    [roles, selectedRole]
  );

  const handleRoleSelect = useCallback((roleId: SelectedRole) => {
    setSelectedRole(roleId);
  }, []);

  const handleProceed = useCallback(() => {
    if (!selectedRole) return;
    setIsProcessing(true);

    // Small UX delay
    setTimeout(() => {
      const roleData = roles.find((r) => r.id === selectedRole);
      if (roleData) {
        navigate(roleData.route);
        onClose();
      }
      setIsProcessing(false);
    }, 600);
  }, [navigate, onClose, selectedRole, roles]);

  const handleCancel = useCallback(() => {
    setSelectedRole(null);
    onClose();
    navigate("/dashboard");
  }, [navigate, onClose]);

  const initials = useMemo(() => {
    const name = userInfo?.name?.trim();
    if (name) {
      const parts = name.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0][0]?.toUpperCase() || "U";
    }
    const email = userInfo?.email || "user@crypto";
    return email[0]?.toUpperCase() || "U";
  }, [userInfo]);

  const onCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, roleId: SelectedRole) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRoleSelect(roleId);
      }
    },
    [handleRoleSelect]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[min(100vw,1100px)] max-w-[1100px] xl:max-h-none xl:overflow-visible max-h-[90vh] overflow-y-auto rounded-2xl border border-border/60 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        hideCloseButton={true}
        preventOutsideClose={true}
      >
        <DialogHeader className="text-center space-y-3 sticky top-0 z-10 bg-gradient-to-b from-background/80 to-background/60 backdrop-blur rounded-t-2xl pb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-extrabold tracking-tight">
              {t("roleSelection.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {t("roleSelection.subtitle")}
          </DialogDescription>

          {userInfo && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-center gap-3 justify-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium leading-tight">{userInfo.name}</p>
                <p className="text-muted-foreground leading-tight">
                  {userInfo.email}
                </p>
              </div>
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
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${t("roleSelection.proceed")} ${role.title}`}
                  className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isSelected
                      ? "ring-2 ring-primary shadow-xl scale-[1.02]"
                      : "hover:scale-[1.01]"
                  } ${role.color} overflow-hidden group`}
                  onClick={() => handleRoleSelect(role.id)}
                  onKeyDown={(e) => onCardKeyDown(e, role.id)}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/0 via-white/20 to-white/0" />
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-3 rounded-lg bg-white/80 ${role.iconColor}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <Badge variant="default" className="text-xs">
                            {t("roleSelection.selected")}
                          </Badge>
                        </div>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-foreground/30 opacity-40" />
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
                      <Badge
                        variant="secondary"
                        className={`${role.badgeColor} shadow-sm`}
                      >
                        {t("roleSelection.keyFeatures")}
                      </Badge>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {role.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t("roleSelection.proceeding")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>
                    {selectedRoleData
                      ? `${t("roleSelection.proceed")} - ${
                          selectedRoleData.title
                        }`
                      : t("roleSelection.proceed")}
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
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
