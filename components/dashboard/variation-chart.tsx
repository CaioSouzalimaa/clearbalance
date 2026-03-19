"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type Plugin,
} from "chart.js";
import { Line } from "react-chartjs-2";

interface VariationPoint {
  month: string;
  value: number;
}

interface VariationChartProps {
  title: string;
  subtitle: string;
  incomeData: VariationPoint[];
  expenseData: VariationPoint[];
  className?: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const INCOME_COLOR = "#69b3a2";
const EXPENSE_COLOR = "#f43f5e";
const INCOME_FILL = "rgba(105,179,162,0.18)";
const EXPENSE_FILL = "rgba(244,63,94,0.14)";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Custom plugin that draws per-segment fill areas following the actual bezier
 * curves of each dataset (tension: 0.35).
 * For each segment:
 *   – The band between the two curves uses the HIGHER line's color
 *   – The band from baseline up to the LOWER line uses the LOWER line's color
 */
const dualFillPlugin: Plugin<"line"> = {
  id: "dualFill",
  beforeDatasetsDraw(chart) {
    const ctx = chart.ctx;
    const meta0 = chart.getDatasetMeta(0); // income
    const meta1 = chart.getDatasetMeta(1); // expense
    if (meta0.data.length < 2 || meta1.data.length < 2) return;

    const baseline = chart.scales.y.getPixelForValue(0);

    const getPoints = (meta: ReturnType<typeof chart.getDatasetMeta>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta.data.map((el: any) => ({
        x: el.x as number,
        y: el.y as number,
        cp1x: (el.cp1x ?? el.x) as number,
        cp1y: (el.cp1y ?? el.y) as number,
        cp2x: (el.cp2x ?? el.x) as number,
        cp2y: (el.cp2y ?? el.y) as number,
      }));

    const inc = getPoints(meta0);
    const exp = getPoints(meta1);

    // Forward bezier from pts[i] → pts[i+1]
    const bezierForward = (
      pts: ReturnType<typeof getPoints>,
      i: number,
    ) => {
      ctx.bezierCurveTo(
        pts[i].cp2x, pts[i].cp2y,
        pts[i + 1].cp1x, pts[i + 1].cp1y,
        pts[i + 1].x, pts[i + 1].y,
      );
    };

    // Reverse bezier from pts[i+1] → pts[i]
    const bezierReverse = (
      pts: ReturnType<typeof getPoints>,
      i: number,
    ) => {
      ctx.bezierCurveTo(
        pts[i + 1].cp1x, pts[i + 1].cp1y,
        pts[i].cp2x, pts[i].cp2y,
        pts[i].x, pts[i].y,
      );
    };

    ctx.save();
    for (let i = 0; i < inc.length - 1; i++) {
      const incMidY = (inc[i].y + inc[i + 1].y) / 2;
      const expMidY = (exp[i].y + exp[i + 1].y) / 2;

      // Lower pixel Y = higher value on chart
      const incBigger = incMidY <= expMidY;
      const big  = incBigger ? inc : exp;
      const small = incBigger ? exp : inc;
      const bigFill   = incBigger ? INCOME_FILL : EXPENSE_FILL;
      const smallFill = incBigger ? EXPENSE_FILL : INCOME_FILL;

      // Upper band: between the two bezier curves → bigger dataset's color
      ctx.beginPath();
      ctx.moveTo(big[i].x, big[i].y);
      bezierForward(big, i);
      ctx.lineTo(small[i + 1].x, small[i + 1].y);
      bezierReverse(small, i);
      ctx.closePath();
      ctx.fillStyle = bigFill;
      ctx.fill();

      // Lower band: baseline → small bezier → baseline → smaller dataset's color
      ctx.beginPath();
      ctx.moveTo(small[i].x, baseline);
      ctx.lineTo(small[i].x, small[i].y);
      bezierForward(small, i);
      ctx.lineTo(small[i + 1].x, baseline);
      ctx.closePath();
      ctx.fillStyle = smallFill;
      ctx.fill();
    }
    ctx.restore();
  },
};

export const VariationChart: React.FC<VariationChartProps> = ({
  title,
  subtitle,
  incomeData,
  expenseData,
  className,
}) => {
  const isEmpty = incomeData.length === 0 && expenseData.length === 0;

  // Use income months as labels; fall back to expenseData if income is empty
  const labels =
    incomeData.length > 0
      ? incomeData.map((p) => p.month)
      : expenseData.map((p) => p.month);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Entradas",
        data: incomeData.map((p) => p.value),
        borderColor: INCOME_COLOR,
        backgroundColor: "transparent",
        fill: false,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5,
      },
      {
        label: "Saídas",
        data: expenseData.map((p) => p.value),
        borderColor: EXPENSE_COLOR,
        backgroundColor: "transparent",
        fill: false,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5,
      },
    ],
  };

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm flex flex-col ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: INCOME_COLOR }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
            Entradas&nbsp;
            <span className="font-semibold">
              {formatBRL(incomeData[incomeData.length - 1]?.value ?? 0)}
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: EXPENSE_COLOR }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
            Saídas&nbsp;
            <span className="font-semibold">
              {formatBRL(expenseData[expenseData.length - 1]?.value ?? 0)}
            </span>
          </span>
        </div>
      </div>
      {isEmpty ? (
        <p className="mt-4 text-xs sm:text-sm text-muted-foreground">Nenhum dado disponível ainda.</p>
      ) : (
        <div className="mt-3 sm:mt-6 h-52 flex-1 min-h-50 sm:min-h-65">
          <Line
            data={chartData}
            plugins={[dualFillPlugin]}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.dataset.label}: ${formatBRL(context.parsed.y ?? 0)}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: "#6b7280", font: { size: 10 } },
                },
                y: {
                  min: 0,
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
      )}
    </div>
  );
};
