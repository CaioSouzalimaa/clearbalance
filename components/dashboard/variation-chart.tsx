"use client";

import React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VariationPoint {
  month: string;
  value: number;
}

interface VariationChartProps {
  title: string;
  subtitle: string;
  accentClassName?: string;
  data: VariationPoint[];
}

const accentMap: Record<string, string> = {
  "text-primary": "#69b3a2",
  "text-rose-500": "#f43f5e",
};

export const VariationChart: React.FC<VariationChartProps> = ({
  title,
  subtitle,
  accentClassName = "text-primary",
  data,
}) => {
  const latest = data[data.length - 1]?.value ?? 0;
  const strokeColor = accentMap[accentClassName] ?? "#69b3a2";

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <span className={`text-xs font-semibold ${accentClassName}`}>
          {latest.toFixed(1)}%
        </span>
      </div>
      <div className="mt-6 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              cursor={{ stroke: "#e5e7eb", strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: "12px",
                borderColor: "#e5e7eb",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Variação"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
