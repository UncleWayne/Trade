"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { EquityPoint } from "@/lib/stats";

const PALETTES = {
  dark: {
    grid: "#2C2F39",
    axis: "#8D9099",
    line: "#E4E7EC",
    fill: "#E4E7EC",
    tooltipBg: "#1C1E25",
    tooltipBorder: "#2C2F39",
    tooltipText: "#E9EAEE",
    dotFill: "#15161B",
  },
  light: {
    grid: "#E1E3E8",
    axis: "#6B6F7C",
    line: "#33363F",
    fill: "#33363F",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E1E3E8",
    tooltipText: "#1B1D23",
    dotFill: "#FFFFFF",
  },
};

export function EquityChart({ data }: { data: EquityPoint[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const palette = mounted && resolvedTheme === "light" ? PALETTES.light : PALETTES.dark;

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-fg-muted">
        No closed trades yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.fill} stopOpacity={0.22} />
            <stop offset="100%" stopColor={palette.fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="date" tick={{ fill: palette.axis, fontSize: 12 }} />
        <YAxis tick={{ fill: palette.axis, fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: palette.tooltipBg,
            border: `1px solid ${palette.tooltipBorder}`,
            borderRadius: 6,
            color: palette.tooltipText,
          }}
        />
        <Area
          type="monotone"
          dataKey="cumulativePnl"
          stroke={palette.line}
          strokeWidth={1.6}
          fill="url(#equity-fill)"
          dot={(props: { cx?: number; cy?: number; index?: number }) =>
            props.index === data.length - 1 && props.cx != null && props.cy != null ? (
              <circle
                key={`dot-${props.index}`}
                cx={props.cx}
                cy={props.cy}
                r={3.5}
                fill={palette.dotFill}
                stroke={palette.line}
                strokeWidth={1.6}
              />
            ) : (
              <g key={`dot-${props.index}`} />
            )
          }
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
