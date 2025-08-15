# Time Filter Migration Guide

This guide shows how to migrate existing time filter implementations to use the new unified TimeFilter component and useTimeFilter hook.

## Overview

The new time filter system provides:
- ✅ Unified API across all components
- ✅ Consistent behavior and styling
- ✅ Better state management
- ✅ Type safety
- ✅ Reusable logic
- ✅ Easier testing

## Migration Steps

### 1. Install the New System

The following files have been created:
- `src/components/ui/time-filter.tsx` - Main component
- `src/hooks/useTimeFilter.ts` - State management hook
- `src/utils/timeFilters.ts` - Extended utilities (updated)

### 2. Update Imports

```tsx
// Add these imports to your components
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";
```

### 3. Component-Specific Migrations

#### AdminReports.tsx Migration

**Before:**
```tsx
// Old state management
const [timeLabel, setTimeLabel] = useState<string>("Today");
const [epochRange, setEpochRange] = useState(() => epochRangeForLabel("Today"));

// Old UI
<Select
  value={timeLabel}
  onValueChange={(label: string) => {
    setTimeLabel(label);
    setEpochRange(epochRangeForLabel(label));
  }}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select time range" />
  </SelectTrigger>
  <SelectContent>
    {["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Week", "Last Week", "This Month", "Last Month"].map((label) => (
      <SelectItem key={label} value={label}>
        {label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**After:**
```tsx
// New state management
const timeFilter = useTimeFilter({
  mode: "epoch",
  defaultValue: "Today",
  onFilterChange: (state) => {
    console.log("Time filter changed:", state);
  },
});

// New UI
<TimeFilter
  mode="epoch"
  value={timeFilter.value}
  onChange={timeFilter.handleEpochChange}
  epochRange={timeFilter.epochRange}
  showEpochDebug={true}
  label="Time Range"
  placeholder="Select time range"
/>
```

#### AdminDashboard.tsx Migration

**Before:**
```tsx
const [timeFilter, setTimeFilter] = useState("24h");

// Manual filtering logic
const logTime = new Date(log.timestamp).getTime();
const now = Date.now();
let matchesTime = true;

switch (timeFilter) {
  case "1h":
    matchesTime = now - logTime <= 60 * 60 * 1000;
    break;
  case "24h":
    matchesTime = now - logTime <= 24 * 60 * 60 * 1000;
    break;
  // ... more cases
}
```

**After:**
```tsx
const timeFilter = useTimeFilter({
  mode: "relative",
  defaultValue: "24h",
});

// Simplified filtering
const filteredLogs = auditLogs.filter(log => 
  timeFilter.filterByTimestamp(new Date(log.timestamp).getTime() / 1000)
);
```

#### AdminErrorLogs.tsx Migration

**Before:**
```tsx
const calculateEpochDates = (filter: string): { from: number; to: number } => {
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
    // ... more cases
  }
  return { from, to };
};

const [errorLogsTime, SetErrorLogsTime] = useState<string>("24h");
const [errorLogFromDate, setErrorLogFromDate] = useState<number>(from);
const [errorLogToDate, setErrorLogToDate] = useState<number>(to);
```

**After:**
```tsx
const timeFilter = useTimeFilter({
  mode: "relative",
  defaultValue: "24h",
  onFilterChange: (state) => {
    // Automatically triggers query refetch
  },
});

// Use in query
const { data: getErrorLogResponse } = useQuery({
  queryKey: ["errorLogs", timeFilter.state],
  queryFn: () => {
    const calc = calculateRelativeTime(timeFilter.value);
    return getErrorLogs({
      from_date: Math.floor(calc.fromTimestamp / 1000),
      to_date: Math.floor(calc.toTimestamp / 1000),
      page,
      per_page: pageSize,
    });
  },
});
```

#### AdminTransactions.tsx Migration

**Before:**
```tsx
interface TransactionFilters {
  status: string;
  currency: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
  status: "all",
  currency: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
});

// Manual date inputs
<Input
  type="date"
  value={transactionFilters.dateFrom}
  onChange={(e) =>
    setTransactionFilters((prev) => ({
      ...prev,
      dateFrom: e.target.value,
    }))
  }
/>
<Input
  type="date"
  value={transactionFilters.dateTo}
  onChange={(e) =>
    setTransactionFilters((prev) => ({
      ...prev,
      dateTo: e.target.value,
    }))
  }
/>
```

**After:**
```tsx
// Separate time filter from other filters
const [filters, setFilters] = useState({
  status: "all",
  currency: "all",
  search: "",
});

const timeFilter = useTimeFilter({
  mode: "custom",
  defaultDateFrom: "2024-01-01",
  defaultDateTo: "2024-12-31",
});

// Simplified UI
<TimeFilter
  mode="custom"
  dateFrom={timeFilter.dateFrom}
  dateTo={timeFilter.dateTo}
  onDateFromChange={timeFilter.handleDateFromChange}
  onDateToChange={timeFilter.handleDateToChange}
  orientation="horizontal"
/>
```

### 4. Update React Query Dependencies

**Before:**
```tsx
const { data } = useQuery({
  queryKey: ["data", epochRange.from_date, epochRange.to_date],
  queryFn: () => fetchData(epochRange),
});
```

**After:**
```tsx
const { data } = useQuery({
  queryKey: ["data", timeFilter.state],
  queryFn: () => fetchData(timeFilter.epochRange),
  enabled: timeFilter.isValidRange,
});
```

### 5. Testing the Migration

1. **Verify functionality:**
   - Time filter changes trigger data updates
   - All time ranges work correctly
   - UI is responsive and accessible

2. **Check console for errors:**
   - No TypeScript errors
   - No runtime errors
   - Proper state updates

3. **Test edge cases:**
   - Invalid date ranges
   - Network errors during filter changes
   - Rapid filter changes

### 6. Benefits After Migration

1. **Consistency:** All time filters behave the same way
2. **Maintainability:** Single source of truth for time filtering logic
3. **Reusability:** Easy to add time filters to new components
4. **Type Safety:** Full TypeScript support
5. **Performance:** Optimized state management and rendering

### 7. Common Issues and Solutions

#### Issue: Query not updating when filter changes
**Solution:** Ensure the query key includes the filter state:
```tsx
queryKey: ["data", timeFilter.state]
```

#### Issue: Invalid date ranges
**Solution:** Use the built-in validation:
```tsx
enabled: timeFilter.isValidRange
```

#### Issue: Performance issues with frequent updates
**Solution:** Use debouncing in the onFilterChange callback:
```tsx
const debouncedFilterChange = useMemo(
  () => debounce((state) => {
    // Handle filter change
  }, 300),
  []
);

const timeFilter = useTimeFilter({
  onFilterChange: debouncedFilterChange,
});
```

### 8. Next Steps

1. Migrate one component at a time
2. Test thoroughly after each migration
3. Update any related tests
4. Consider removing old time filter utilities once migration is complete
5. Update documentation and team knowledge

### 9. Example Files

- `src/components/examples/TimeFilterExample.tsx` - Comprehensive examples
- `src/components/examples/AdminReportsRefactored.tsx` - Real migration example
- `src/components/ui/time-filter.md` - Complete documentation

### 10. Support

If you encounter issues during migration:
1. Check the documentation in `time-filter.md`
2. Review the examples in the `examples/` folder
3. Ensure all imports are correct
4. Verify the component props match the expected interface
