"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", value: 200 },
  { name: "Feb", value: 400 },
  { name: "Mar", value: 350 },
  { name: "Apr", value: 500 },
  { name: "May", value: 700 },
];

export function AreaChartDemo() {
  return (
    <div className="w-full h-[350px] p-4 border rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            fill="#c4b5fd"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
