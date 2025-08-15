# Time Filter Component Documentation

A comprehensive, reusable time filtering system for the entire project. This replaces the scattered time filter implementations with a unified, flexible solution.

## Overview

The time filter system consists of:
- `TimeFilter` component - The UI component
- `useTimeFilter` hook - State management and logic
- Extended `timeFilters` utilities - Helper functions

## Quick Start

```tsx
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";

// Basic usage
const MyComponent = () => {
  const filter = useTimeFilter({
    mode: "epoch",
    defaultValue: "Today"
  });

  return (
    <TimeFilter
      mode="epoch"
      value={filter.value}
      onChange={filter.handleEpochChange}
      epochRange={filter.epochRange}
    />
  );
};
```

## Modes

### 1. Epoch Mode
Perfect for reports and analytics. Uses predefined labels that convert to epoch timestamp ranges.

**Use cases:** AdminReports, analytics dashboards, historical data analysis

```tsx
const filter = useTimeFilter({ mode: "epoch" });

<TimeFilter
  mode="epoch"
  value={filter.value}
  onChange={filter.handleEpochChange}
  epochRange={filter.epochRange}
  showEpochDebug={true} // Shows epoch values for debugging
/>
```

**Available labels:** Today, Yesterday, Last 7 Days, Last 30 Days, This Week, Last Week, This Month, Last Month

### 2. Relative Mode
Great for real-time data and logs. Uses relative time periods from now.

**Use cases:** AdminDashboard, AdminErrorLogs, live monitoring

```tsx
const filter = useTimeFilter({ mode: "relative", defaultValue: "24h" });

<TimeFilter
  mode="relative"
  value={filter.value}
  onChange={filter.handleRelativeChange}
  relativeOptions={getRelativeTimeOptions('logs')}
/>
```

**Available options:** 1h, 6h, 24h, 7d, 30d, 90d, all

### 3. Custom Mode
Allows specific date range selection for detailed analysis.

**Use cases:** AdminTransactions, custom reports, date-specific queries

```tsx
const filter = useTimeFilter({ mode: "custom" });

<TimeFilter
  mode="custom"
  dateFrom={filter.dateFrom}
  dateTo={filter.dateTo}
  onDateFromChange={filter.handleDateFromChange}
  onDateToChange={filter.handleDateToChange}
/>
```

## Component Props

### TimeFilter Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"epoch" \| "relative" \| "custom"` | `"epoch"` | Filter mode |
| `value` | `string` | - | Current filter value |
| `onChange` | `(value: string) => void` | - | Value change handler |
| `label` | `string` | `"Time Range"` | Field label |
| `placeholder` | `string` | `"Select time range"` | Placeholder text |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the filter |
| `showIcon` | `boolean` | `true` | Show calendar icon |
| `variant` | `"default" \| "compact" \| "inline"` | `"default"` | Visual variant |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout orientation |

#### Epoch Mode Specific Props
| Prop | Type | Description |
|------|------|-------------|
| `epochRange` | `EpochRange` | Current epoch range |
| `onEpochRangeChange` | `(range: EpochRange) => void` | Epoch range change handler |
| `showEpochDebug` | `boolean` | Show debug epoch values |

#### Relative Mode Specific Props
| Prop | Type | Description |
|------|------|-------------|
| `relativeOptions` | `RelativeTimeOption[]` | Available time options |

#### Custom Mode Specific Props
| Prop | Type | Description |
|------|------|-------------|
| `dateFrom` | `string` | Start date (YYYY-MM-DD) |
| `dateTo` | `string` | End date (YYYY-MM-DD) |
| `onDateFromChange` | `(date: string) => void` | Start date change handler |
| `onDateToChange` | `(date: string) => void` | End date change handler |

## useTimeFilter Hook

### Options

```tsx
interface UseTimeFilterOptions {
  mode?: TimeFilterMode;
  defaultValue?: string;
  defaultEpochRange?: EpochRange;
  defaultDateFrom?: string;
  defaultDateTo?: string;
  onFilterChange?: (filter: TimeFilterState) => void;
}
```

### Returned Values

```tsx
const {
  // Current state
  state,           // Complete filter state
  mode,            // Current mode
  value,           // Current value
  epochRange,      // Current epoch range (epoch mode)
  dateFrom,        // Start date (custom mode)
  dateTo,          // End date (custom mode)
  
  // Change handlers
  handleEpochChange,
  handleRelativeChange,
  handleDateFromChange,
  handleDateToChange,
  switchMode,
  
  // Utility functions
  filterByTimestamp,  // Filter data by timestamp
  filterByDate,       // Filter data by date
  reset,              // Reset to defaults
  
  // Computed values
  isValidRange,       // Whether current range is valid
} = useTimeFilter(options);
```

## Migration Guide

### From AdminReports
```tsx
// Before
const [timeLabel, setTimeLabel] = useState<string>("Today");
const [epochRange, setEpochRange] = useState(() => epochRangeForLabel("Today"));

// After
const filter = useTimeFilter({ mode: "epoch", defaultValue: "Today" });
```

### From AdminDashboard
```tsx
// Before
const [timeFilter, setTimeFilter] = useState("24h");

// After
const filter = useTimeFilter({ mode: "relative", defaultValue: "24h" });
```

### From AdminErrorLogs
```tsx
// Before
const [errorLogsTime, SetErrorLogsTime] = useState<string>("24h");
const calculateEpochDates = (filter: string) => { /* custom logic */ };

// After
const filter = useTimeFilter({ mode: "relative", defaultValue: "24h" });
// Use filter.filterByTimestamp() for filtering
```

### From AdminTransactions
```tsx
// Before
const [transactionFilters, setTransactionFilters] = useState({
  dateFrom: "",
  dateTo: "",
  // ... other filters
});

// After
const timeFilter = useTimeFilter({ mode: "custom" });
// Use timeFilter.dateFrom and timeFilter.dateTo
```

## Utility Functions

### From timeFilters.ts
```tsx
import {
  epochRangeForLabel,
  dateStringToEpoch,
  epochToDateString,
  createEpochRangeFromDates,
  isTimestampInRange,
  formatEpochRange,
  getRelativeTimeOptions
} from "@/utils/timeFilters";
```

### Data Filtering Examples

```tsx
// Filter array of items with timestamps
const filteredData = data.filter(item => 
  filter.filterByTimestamp(item.timestamp)
);

// Filter by date objects
const filteredByDate = data.filter(item => 
  filter.filterByDate(item.createdAt)
);

// Manual timestamp checking
const isInRange = isTimestampInRange(timestamp, filter.epochRange);
```

## Best Practices

1. **Choose the right mode:**
   - Use `epoch` for reports and historical analysis
   - Use `relative` for real-time data and logs
   - Use `custom` for user-defined date ranges

2. **Handle state changes:**
   ```tsx
   const filter = useTimeFilter({
     onFilterChange: (state) => {
       // Trigger data refetch
       refetch();
     }
   });
   ```

3. **Combine with React Query:**
   ```tsx
   const { data } = useQuery({
     queryKey: ["data", filter.state],
     queryFn: () => fetchData(filter.epochRange),
   });
   ```

4. **Responsive design:**
   ```tsx
   <TimeFilter
     variant="compact"
     orientation={isMobile ? "vertical" : "horizontal"}
   />
   ```

## Examples

See `src/components/examples/TimeFilterExample.tsx` for comprehensive usage examples.
