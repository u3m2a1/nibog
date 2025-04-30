"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Mock data - in a real app, this would come from an API
const data = [
  {
    name: "Jan",
    revenue: 180000,
    bookings: 100,
  },
  {
    name: "Feb",
    revenue: 250000,
    bookings: 140,
  },
  {
    name: "Mar",
    revenue: 320000,
    bookings: 180,
  },
  {
    name: "Apr",
    revenue: 450000,
    bookings: 250,
  },
  {
    name: "May",
    revenue: 520000,
    bookings: 290,
  },
  {
    name: "Jun",
    revenue: 610000,
    bookings: 340,
  },
]

export default function AdminOverviewChart() {
  const { theme } = useTheme()

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "revenue") {
              return [`₹${value}`, "Revenue"]
            }
            return [value, "Bookings"]
          }}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            borderRadius: "0.375rem",
          }}
        />
        <Bar dataKey="revenue" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
