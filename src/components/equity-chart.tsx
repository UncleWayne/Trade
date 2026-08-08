"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { EquityPoint } from "@/lib/stats";

export function EquityChart({ data }: { data: EquityPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
        No closed trades yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="date" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
        <YAxis tick={{ fill: "#a3a3a3", fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #404040",
            borderRadius: 8,
            color: "#e5e5e5",
          }}
        />
        <Line
          type="monotone"
          dataKey="cumulativePnl"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
