import { useState, useCallback, useMemo } from "react";
import { epochRangeForLabel, type EpochRange, type TimeFilterLabel } from "@/utils/timeFilters";

export type TimeFilterMode = "epoch" | "relative" | "custom";

export interface UseTimeFilterOptions {
  mode?: TimeFilterMode;
  defaultValue?: string;
  defaultEpochRange?: EpochRange;
  defaultDateFrom?: string;
  defaultDateTo?: string;
  onFilterChange?: (filter: TimeFilterState) => void;
}

export interface TimeFilterState {
  mode: TimeFilterMode;
  value: string;
  epochRange?: EpochRange;
  dateFrom?: string;
  dateTo?: string;
  // Computed values for different modes
  relativeTimeMs?: number;
  isValidRange: boolean;
}

export interface RelativeTimeCalculation {
  fromTimestamp: number;
  toTimestamp: number;
  isValid: boolean;
}

// Helper function to calculate relative time ranges
export const calculateRelativeTime = (value: string): RelativeTimeCalculation => {
  const now = Date.now();
  let fromTimestamp = now;
  let isValid = true;

  switch (value) {
    case "1h":
      fromTimestamp = now - (60 * 60 * 1000);
      break;
    case "6h":
      fromTimestamp = now - (6 * 60 * 60 * 1000);
      break;
    case "24h":
      fromTimestamp = now - (24 * 60 * 60 * 1000);
      break;
    case "7d":
      fromTimestamp = now - (7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      fromTimestamp = now - (30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      fromTimestamp = now - (90 * 24 * 60 * 60 * 1000);
      break;
    case "all":
      fromTimestamp = 0;
      break;
    default:
      isValid = false;
  }

  return {
    fromTimestamp,
    toTimestamp: now,
    isValid,
  };
};

// Helper function to convert date string to epoch
export const dateToEpoch = (dateString: string): number => {
  return Math.floor(new Date(dateString).getTime() / 1000);
};

// Helper function to convert epoch to date string
export const epochToDateString = (epoch: number): string => {
  return new Date(epoch * 1000).toISOString().split('T')[0];
};

export const useTimeFilter = (options: UseTimeFilterOptions = {}) => {
  const {
    mode = "epoch",
    defaultValue = "Today",
    defaultEpochRange,
    defaultDateFrom,
    defaultDateTo,
    onFilterChange,
  } = options;

  // Initialize state based on mode
  const [currentMode, setCurrentMode] = useState<TimeFilterMode>(mode);
  const [value, setValue] = useState<string>(defaultValue);
  const [epochRange, setEpochRange] = useState<EpochRange>(
    defaultEpochRange || epochRangeForLabel(defaultValue)
  );
  const [dateFrom, setDateFrom] = useState<string>(
    defaultDateFrom || epochToDateString(epochRange.from_date)
  );
  const [dateTo, setDateTo] = useState<string>(
    defaultDateTo || epochToDateString(epochRange.to_date)
  );

  // Compute current state
  const currentState = useMemo((): TimeFilterState => {
    let isValidRange = true;
    let relativeTimeMs: number | undefined;

    if (currentMode === "relative") {
      const calc = calculateRelativeTime(value);
      isValidRange = calc.isValid;
      relativeTimeMs = calc.toTimestamp - calc.fromTimestamp;
    } else if (currentMode === "custom") {
      isValidRange = !!(dateFrom && dateTo && new Date(dateFrom) <= new Date(dateTo));
    }

    return {
      mode: currentMode,
      value,
      epochRange: currentMode === "epoch" ? epochRange : undefined,
      dateFrom: currentMode === "custom" ? dateFrom : undefined,
      dateTo: currentMode === "custom" ? dateTo : undefined,
      relativeTimeMs,
      isValidRange,
    };
  }, [currentMode, value, epochRange, dateFrom, dateTo]);

  // Handle value changes for epoch mode
  const handleEpochChange = useCallback((newValue: string) => {
    setValue(newValue);
    const newRange = epochRangeForLabel(newValue);
    setEpochRange(newRange);
    
    const newState: TimeFilterState = {
      mode: "epoch",
      value: newValue,
      epochRange: newRange,
      isValidRange: true,
    };
    
    onFilterChange?.(newState);
  }, [onFilterChange]);

  // Handle value changes for relative mode
  const handleRelativeChange = useCallback((newValue: string) => {
    setValue(newValue);
    const calc = calculateRelativeTime(newValue);
    
    const newState: TimeFilterState = {
      mode: "relative",
      value: newValue,
      relativeTimeMs: calc.toTimestamp - calc.fromTimestamp,
      isValidRange: calc.isValid,
    };
    
    onFilterChange?.(newState);
  }, [onFilterChange]);

  // Handle date changes for custom mode
  const handleDateFromChange = useCallback((newDateFrom: string) => {
    setDateFrom(newDateFrom);
    
    const newState: TimeFilterState = {
      mode: "custom",
      value: "custom",
      dateFrom: newDateFrom,
      dateTo,
      isValidRange: !!(newDateFrom && dateTo && new Date(newDateFrom) <= new Date(dateTo)),
    };
    
    onFilterChange?.(newState);
  }, [dateTo, onFilterChange]);

  const handleDateToChange = useCallback((newDateTo: string) => {
    setDateTo(newDateTo);
    
    const newState: TimeFilterState = {
      mode: "custom",
      value: "custom",
      dateFrom,
      dateTo: newDateTo,
      isValidRange: !!(dateFrom && newDateTo && new Date(dateFrom) <= new Date(newDateTo)),
    };
    
    onFilterChange?.(newState);
  }, [dateFrom, onFilterChange]);

  // Switch between modes
  const switchMode = useCallback((newMode: TimeFilterMode) => {
    setCurrentMode(newMode);
    
    // Reset to appropriate defaults for the new mode
    if (newMode === "epoch") {
      const defaultLabel = "Today";
      setValue(defaultLabel);
      const newRange = epochRangeForLabel(defaultLabel);
      setEpochRange(newRange);
    } else if (newMode === "relative") {
      setValue("24h");
    } else if (newMode === "custom") {
      setValue("custom");
      const today = new Date().toISOString().split('T')[0];
      setDateFrom(today);
      setDateTo(today);
    }
  }, []);

  // Utility functions for filtering data
  const filterByTimestamp = useCallback((timestamp: number): boolean => {
    if (currentMode === "epoch" && epochRange) {
      return timestamp >= epochRange.from_date && timestamp <= epochRange.to_date;
    } else if (currentMode === "relative") {
      const calc = calculateRelativeTime(value);
      if (!calc.isValid) return true;
      const timestampMs = timestamp * 1000; // Convert to milliseconds if needed
      return timestampMs >= calc.fromTimestamp && timestampMs <= calc.toTimestamp;
    } else if (currentMode === "custom" && dateFrom && dateTo) {
      const fromEpoch = dateToEpoch(dateFrom);
      const toEpoch = dateToEpoch(dateTo) + 86400; // Add one day to include the end date
      return timestamp >= fromEpoch && timestamp <= toEpoch;
    }
    return true;
  }, [currentMode, epochRange, value, dateFrom, dateTo]);

  const filterByDate = useCallback((date: Date | string): boolean => {
    const timestamp = typeof date === 'string' ? new Date(date).getTime() / 1000 : date.getTime() / 1000;
    return filterByTimestamp(timestamp);
  }, [filterByTimestamp]);

  // Reset to defaults
  const reset = useCallback(() => {
    setValue(defaultValue);
    setEpochRange(defaultEpochRange || epochRangeForLabel(defaultValue));
    setDateFrom(defaultDateFrom || epochToDateString(epochRange.from_date));
    setDateTo(defaultDateTo || epochToDateString(epochRange.to_date));
    setCurrentMode(mode);
  }, [defaultValue, defaultEpochRange, defaultDateFrom, defaultDateTo, mode, epochRange.from_date]);

  return {
    // Current state
    state: currentState,
    
    // Individual values
    mode: currentMode,
    value,
    epochRange,
    dateFrom,
    dateTo,
    
    // Change handlers
    handleEpochChange,
    handleRelativeChange,
    handleDateFromChange,
    handleDateToChange,
    switchMode,
    
    // Utility functions
    filterByTimestamp,
    filterByDate,
    reset,
    
    // Computed values
    isValidRange: currentState.isValidRange,
  };
};
