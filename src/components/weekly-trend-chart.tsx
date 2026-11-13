import { Bar, CartesianGrid, ComposedChart, LabelList, Line, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function WeeklyTrendChart({ weekly }: { weekly: number[] }) {
  const data = weekly.map((reports, index) => ({
    week: `W${index + 1}`,
    reports,
  }));

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No weekly reports available.</p>;
  }

  return (
    <ChartContainer
      className="h-64 w-full aspect-auto"
      config={{ reports: { label: "Reports", color: "var(--primary)" } }}
      role="img"
      aria-label={`Weekly report trend, oldest to newest: ${weekly.join(", ")}`}
    >
      <ComposedChart accessibilityLayer data={data} margin={{ top: 24, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis allowDecimals={false} domain={[0, "auto"]} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent labelKey="week" />} />
        <Bar dataKey="reports" fill="var(--color-reports)" fillOpacity={0.35} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
          <LabelList dataKey="reports" position="top" offset={10} className="fill-foreground" />
        </Bar>
        <Line dataKey="reports" type="linear" stroke="var(--color-reports)" strokeWidth={2} dot={{ r: 4, fill: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 6 }} tooltipType="none" isAnimationActive={false} />
      </ComposedChart>
    </ChartContainer>
  );
}