"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

interface VariationPoint {
  month: string;
  value: number;
}

interface VariationChartProps {
  title: string;
  subtitle: string;
  accentClassName?: string;
  accentColor?: string;
  data: VariationPoint[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const buildDataset = (data: VariationPoint[], accentColor: string) => ({
  labels: data.map((item) => item.month),
  datasets: [
    {
      data: data.map((item) => item.value),
      borderColor: accentColor,
      backgroundColor: "transparent",
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 5,
    },
  ],
});

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const VariationChart: React.FC<VariationChartProps> = ({
  title,
  subtitle,
  accentClassName = "text-primary",
  accentColor = "#69b3a2",
  data,
}) => {
  const chartData = buildDataset(data, accentColor);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className={`text-xs font-semibold ${accentClassName}`}>
          {formatBRL(data[data.length - 1]?.value ?? 0)}
        </span>
      </div>
      <div className="mt-6 h-32">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => formatBRL(context.parsed.y ?? 0),
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "#6b7280", font: { size: 10 } },
              },
              y: {
                grid: { color: "#e9ecef" },
                ticks: {
                  color: "#6b7280",
                  font: { size: 10 },
                  callback: (value) =>
                    formatBRL(typeof value === "number" ? value : Number(value)),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
