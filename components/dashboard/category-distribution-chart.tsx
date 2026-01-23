"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDataPoint {
  label: string;
  value: number;
  color: string;
}

interface CategoryDistributionChartProps {
  title: string;
  subtitle: string;
  data: CategoryDataPoint[];
}

export const CategoryDistributionChart = ({
  title,
  subtitle,
  data,
}: CategoryDistributionChartProps) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr] lg:items-center">
        <div className="h-48 w-full max-w-[220px]">
          <Doughnut
            data={{
              labels: data.map((item) => item.label),
              datasets: [
                {
                  data: data.map((item) => item.value),
                  backgroundColor: data.map((item) => item.color),
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              cutout: "65%",
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.label}: ${context.parsed}%`,
                  },
                },
              },
            }}
          />
        </div>
        <div className="space-y-4">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-foreground">
                  {item.label}
                </span>
              </div>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
