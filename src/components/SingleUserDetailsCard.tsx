import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface SingleUserDetailsCardProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SingleUserDetailsCard: React.FC<SingleUserDetailsCardProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const { t } = useLanguage();
  const singleUserDetails = useSelector(
    (store: RootState) => store.singleUserDetails
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("profile.userDetails")}
          </CardTitle>
          <CardDescription>{t("profile.userInfoFromAPI")}</CardDescription>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {singleUserDetails.loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("profile.loadingUserData")}
            </span>
          </div>
        )}

        {singleUserDetails.error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {t("profile.errorLoadingUserData")}
              </p>
              <p className="text-xs text-destructive/80">
                {singleUserDetails.error}
              </p>
            </div>
          </div>
        )}

        {!singleUserDetails.loading &&
          !singleUserDetails.error &&
          singleUserDetails.userDetails && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Loaded
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    User ID
                  </label>
                  <p className="text-sm font-mono">
                    {singleUserDetails.userDetails.id}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Name
                  </label>
                  <p className="text-sm">
                    {singleUserDetails.userDetails.name}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email
                  </label>
                  <p className="text-sm">
                    {singleUserDetails.userDetails.email}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Role
                  </label>
                  <Badge variant="secondary">
                    {singleUserDetails.userDetails.role}
                  </Badge>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </label>
                  <Badge
                    variant={
                      singleUserDetails.userDetails.is_active
                        ? "default"
                        : "destructive"
                    }
                  >
                    {singleUserDetails.userDetails.is_active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                {singleUserDetails.userDetails.metadata && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Metadata
                    </label>
                    <div className="text-xs bg-muted p-2 rounded mt-1">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(
                          singleUserDetails.userDetails.metadata,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {!singleUserDetails.loading &&
          !singleUserDetails.error &&
          !singleUserDetails.userDetails && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No user data available
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default SingleUserDetailsCard;
