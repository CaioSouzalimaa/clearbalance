"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDataPoint {
  label: string;
  value: number;  // percentage
  amount: number; // BRL total
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
    <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm">
      <h2 className="text-sm sm:text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
      {data.length === 0 ? (
        <p className="mt-4 text-xs sm:text-sm text-muted-foreground">Nenhum dado disponível ainda.</p>
      ) : (
      <div className="mt-3 sm:mt-6 grid gap-3 sm:gap-6 lg:grid-cols-[200px_1fr] lg:items-center">
        <div className="mx-auto h-36 sm:h-48 w-full max-w-[180px] sm:max-w-[220px] lg:mx-0">
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
                    label: (context) => {
                      const item = data[context.dataIndex];
                      const brl = item.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      });
                      return `${context.label}: ${brl} (${item.value}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
        <div className="space-y-2 sm:space-y-4">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs sm:text-sm"
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
              <span className="text-muted-foreground">
                  {item.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}{" "}
                  <span className="text-xs opacity-60">({item.value}%)</span>
                </span>
            </div>
          ))}
        </div>
      </div>      )}    </div>
  );
};
