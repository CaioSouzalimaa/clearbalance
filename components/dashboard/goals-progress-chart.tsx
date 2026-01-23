"use client";

import React from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface GoalDataPoint {
  label: string;
  value: number;
}

interface GoalsProgressChartProps {
  title: string;
  subtitle: string;
  data: GoalDataPoint[];
  barColor?: string;
}

export const GoalsProgressChart = ({
  title,
  subtitle,
  data,
  barColor = "#8fc1a9",
}: GoalsProgressChartProps) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 h-52">
        <Bar
          data={{
            labels: data.map((item) => item.label),
            datasets: [
              {
                data: data.map((item) => item.value),
                backgroundColor: barColor,
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 20,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.parsed.y}%`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "#6b7280", font: { size: 11 } },
              },
              y: {
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 20,
                  color: "#6b7280",
                  callback: (value) => `${value}%`,
                },
                grid: { color: "#e9ecef" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
