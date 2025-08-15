import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Eye, FileX, Loader2, RefreshCw } from "lucide-react";
import { epochToCustomLocalStringTime } from "@/Common";
import { getErrorLogs } from "@/service/adminservices";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommonPagination from "@/components/ui/common-pagination";
import { usePagination } from "@/hooks/usePagination";

interface ErrorLog {
  id: string;
  timestamp: string;
  errorCode: string;
  message: string;
  endpoint: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface AdminErrorLogsProps {
  getSeverityBadge: (severity: string) => string;
}

const AdminErrorLogs: React.FC<AdminErrorLogsProps> = ({
  getSeverityBadge,
}) => {
  const calculateEpochDates = (
    filter: string
  ): { from: number; to: number } => {
    const now = Math.floor(Date.now() / 1000);
    let from = now;
    let to = now;

    switch (filter) {
      case "1h":
        from = now - 3600;
        break;
      case "6h":
        from = now - 21600;
        break;
      case "24h":
        from = now - 86400;
        break;
      case "7d":
        from = now - 604800;
        break;
      case "30d":
        from = now - 2592000;
        break;
      case "90d":
        from = now - 7776000;
        break;
      case "custom":
        // Use custom dates set by user
        from = errorLogFromDate;
        to = errorLogToDate;
        break;
      default:
        from = now - 86400;
    }

    return { from, to };
  };
  const { from, to } = calculateEpochDates("24h");
  const [errorLogFromDate, setErrorLogFromDate] = useState<number>(from);
  const [errorLogToDate, setErrorLogToDate] = useState<number>(to);
  const [errorLogsTime, SetErrorLogsTime] = useState<string>("24h");

  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    pageSize: 10,
  });

  const {
    data: getErrorLogResponse,
    isLoading: isLoadingLogs,
    isError: isErrorLogs,
    error: errorLogserror,
    refetch: refetchLogs,
  } = useQuery<any>({
    queryKey: [
      "errorLogs",
      errorLogFromDate,
      errorLogToDate,
      pagination.currentPage,
      pagination.pageSize,
    ],
    queryFn: () => {
      const payload = {
        from_date: errorLogFromDate,
        to_date: errorLogToDate,
        page: pagination.currentPage,
        per_page: pagination.pageSize,
      };
      return getErrorLogs(payload);
    },
    gcTime: 60000,
    staleTime: 60000,
  });

  console.log("getErrorLogResponse", getErrorLogResponse);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  // Update pagination when data changes
  const totalCount = getErrorLogResponse?.total_count ?? errorLogs.length;
  useEffect(() => {
    pagination.setTotalItems(totalCount);
  }, [totalCount, pagination]);

  useEffect(() => {
    if (getErrorLogResponse && Array.isArray(getErrorLogResponse.data)) {
      const FilteredErrorLogs = getErrorLogResponse?.data?.map((item) => ({
        id: item?.id,
        timestamp: epochToCustomLocalStringTime(item?.created_date),
        errorCode: item?.error_code,
        message: item?.error,
        endpoint: item?.endpoint,
        severity: item?.severity,
      }));
      setErrorLogs(FilteredErrorLogs);
    } else {
      // Set empty array if data is not available or not an array
      setErrorLogs([]);
    }
  }, [getErrorLogResponse]);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Error Logs</span>
            <Badge variant="outline" className="ml-2">
              {getErrorLogResponse?.data?.length ?? 0} entries
            </Badge>
          </CardTitle>
          <CardDescription>
            System errors and API failures with time-based filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Time Filter Controls */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Time Range
                </Label>
                <Select
                  value={errorLogsTime}
                  onValueChange={(value) => {
                    SetErrorLogsTime(value);
                    const { from, to } = calculateEpochDates(value);
                    setErrorLogFromDate(from);
                    setErrorLogToDate(to);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Error Code</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingLogs && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {isErrorLogs && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                      <p>
                        Error loading error logs:{" "}
                        {(errorLogserror as Error)?.message || "Unknown error"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchLogs()}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoadingLogs && !isErrorLogs && errorLogs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileX className="h-8 w-8" />
                      <p>No error logs found for the selected time period</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoadingLogs &&
                errorLogs.map((error: any) => (
                  <TableRow key={error.id}>
                    <TableCell>{error?.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{error?.errorCode}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {error?.message}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {error?.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadge(error.severity) as any}>
                        {error?.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(error);
                            setOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <CommonPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={totalCount}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setCurrentPage}
            disabled={isLoadingLogs}
          />

          {/* JSON Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Error Log Details</DialogTitle>
              </DialogHeader>
              <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminErrorLogs;
