import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  epochRangeForLabel,
  timeFilterLabels,
  type TimeFilterLabel,
  type EpochRange,
} from "@/utils/timeFilters";

// Time filter types
export type TimeFilterMode = "epoch" | "relative" | "custom";

export interface RelativeTimeOption {
  value: string;
  label: string;
}

export interface TimeFilterProps {
  // Mode configuration
  mode?: TimeFilterMode;

  // Common props
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;

  // Epoch mode specific props
  epochRange?: EpochRange;
  onEpochRangeChange?: (range: EpochRange) => void;
  showEpochDebug?: boolean;

  // Custom date range props
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;

  // Relative mode specific props
  relativeOptions?: RelativeTimeOption[];

  // Layout props
  showIcon?: boolean;
  variant?: "default" | "compact" | "inline";
  orientation?: "horizontal" | "vertical";
}

// Default relative time options for different use cases
export const defaultRelativeOptions: RelativeTimeOption[] = [
  { value: "1h", label: "Last 1 Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

export const extendedRelativeOptions: RelativeTimeOption[] = [
  { value: "1h", label: "Last 1 Hour" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

const TimeFilter: React.FC<TimeFilterProps> = ({
  mode = "epoch",
  value,
  onChange,
  label = "Time Range",
  placeholder = "Select time range",
  className,
  disabled = false,
  epochRange,
  onEpochRangeChange,
  showEpochDebug = false,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  relativeOptions = defaultRelativeOptions,
  showIcon = true,
  variant = "default",
  orientation = "horizontal",
}) => {
  // Handle epoch mode changes
  const handleEpochChange = (selectedLabel: string) => {
    if (onChange) {
      onChange(selectedLabel);
    }
    if (onEpochRangeChange) {
      const newRange = epochRangeForLabel(selectedLabel);
      onEpochRangeChange(newRange);
    }
  };

  // Handle relative mode changes
  const handleRelativeChange = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  // Render epoch mode
  const renderEpochMode = () => (
    <div
      className={cn(
        "space-y-2",
        orientation === "horizontal" && "flex items-end gap-4 space-y-0"
      )}
    >
      <div className="flex-1">
        <Label className="mb-1 block text-sm font-medium">
          {showIcon && <CalendarIcon className="h-4 w-4 inline mr-1" />}
          {label}
        </Label>
        <Select
          value={value}
          onValueChange={handleEpochChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn("w-full", variant === "compact" && "h-8")}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {timeFilterLabels.map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showEpochDebug && epochRange && (
          <div className="text-xs text-muted-foreground mt-1">
            from_date: {epochRange.from_date} | to_date: {epochRange.to_date}
          </div>
        )}
      </div>
    </div>
  );

  // Render relative mode
  const renderRelativeMode = () => (
    <div
      className={cn(
        "space-y-2",
        orientation === "horizontal" && "flex items-end gap-4 space-y-0"
      )}
    >
      <div className="flex-1">
        <Label className="mb-1 block text-sm font-medium">
          {showIcon && <CalendarIcon className="h-4 w-4 inline mr-1" />}
          {label}
        </Label>
        <Select
          value={value}
          onValueChange={handleRelativeChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn("w-full", variant === "compact" && "h-8")}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {relativeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Render custom date range mode
  const renderCustomMode = () => (
    <div
      className={cn(
        "space-y-2",
        orientation === "horizontal" && "flex items-end gap-4 space-y-0"
      )}
    >
      <div className="flex-1">
        <Label className="mb-1 block text-sm font-medium">
          {showIcon && <CalendarIcon className="h-4 w-4 inline mr-1" />}
          Custom Range
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                variant === "compact" && "h-8",
                !dateFrom && !dateTo && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom && dateTo ? (
                <span>
                  {dateFrom} – {dateTo}
                </span>
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="range"
              selected={
                {
                  from: dateFrom ? new Date(dateFrom) : undefined,
                  to: dateTo ? new Date(dateTo) : undefined,
                } as any
              }
              onSelect={(range: any) => {
                const from = range?.from
                  ? range.from.toISOString().split("T")[0]
                  : "";
                const to = range?.to
                  ? range.to.toISOString().split("T")[0]
                  : from;
                if (from) onDateFromChange?.(from);
                if (to) onDateToChange?.(to);
              }}
              numberOfMonths={2}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  // Main render logic
  const renderContent = () => {
    switch (mode) {
      case "epoch":
        return renderEpochMode();
      case "relative":
        return renderRelativeMode();
      case "custom":
        return renderCustomMode();
      default:
        return renderEpochMode();
    }
  };

  return <div className={cn("time-filter", className)}>{renderContent()}</div>;
};

TimeFilter.displayName = "TimeFilter";

export { TimeFilter };
