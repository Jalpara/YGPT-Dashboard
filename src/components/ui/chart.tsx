import * as React from "react";
import {
  AreaChart,
  BarChart,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

import { cn } from "@/lib/utils";

type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
  children: React.ReactNode;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-tooltip-cursor]:fill-muted/60",
          className
        )}
        {...props}
      >
        <style>
          {Object.entries(config)
            .map(
              ([key, value]) => `
                .chart-color-${key} { color: ${value.color}; }
                .chart-fill-${key} { fill: ${value.color}; }
                .chart-stroke-${key} { stroke: ${value.color}; }
              `
            )
            .join("\n")}
        </style>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

type ChartTooltipProps = Partial<TooltipProps<number, string>> & {
  labelFormatter?: (label: string) => string;
};

function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <div className="text-xs font-medium text-muted-foreground">
        {labelFormatter ? labelFormatter(label as string) : label}
      </div>
      <div className="mt-1 space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey as string} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ChartTooltipContent = (props: ChartTooltipProps) => (
  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip {...props} />} />
);

export { AreaChart, BarChart, LineChart, ChartContainer, ChartTooltipContent };
