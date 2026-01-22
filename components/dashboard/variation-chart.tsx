import React from "react";

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

const buildPoints = (data: VariationPoint[], width: number, height: number) => {
  const values = data.map((item) => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return data
    .map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((item.value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

export const VariationChart: React.FC<VariationChartProps> = ({
  title,
  subtitle,
  accentClassName = "text-primary",
  data,
}) => {
  const width = 260;
  const height = 90;
  const points = buildPoints(data, width, height);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className={`text-xs font-semibold ${accentClassName}`}>
          {data[data.length - 1].value.toFixed(1)}%
        </span>
      </div>
      <div className="mt-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={accentClassName}
            points={points}
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
            points={`0,${height} ${width},${height}`}
          />
        </svg>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          {data.map((item) => (
            <span key={item.month}>{item.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
