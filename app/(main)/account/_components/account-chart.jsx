"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AccountChart({ transactions }) {
  // 时间范围选择：默认 7 天，可选 "7"、"30"（1 个月）、"365"（1 年）
  const [timeRange, setTimeRange] = useState("7");

  // 根据 timeRange 计算时间下限
  const lowerBound = useMemo(() => {
    const days = parseInt(timeRange, 10);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }, [timeRange]);

  // 根据时间范围和分组方式生成图表数据
  const chartData = useMemo(() => {
    // 只保留在时间范围内的交易记录
    const filtered = transactions.filter((t) => new Date(t.date) >= lowerBound);
    const grouped = {};

    if (timeRange === "365") {
      // 1 年：按月份分组，key 格式为 "yyyy-MM"
      filtered.forEach((t) => {
        const key = format(new Date(t.date), "yyyy-MM");
        if (!grouped[key]) {
          grouped[key] = { date: key, income: 0, expense: 0 };
        }
        if (t.type === "INCOME") {
          grouped[key].income += t.amount;
        } else {
          grouped[key].expense += t.amount;
        }
      });
      return Object.keys(grouped)
        .sort()
        .map((key) => ({
          // 显示月份，例如 "Mar"
          date: format(new Date(key + "-01"), "MMM"),
          income: parseFloat(grouped[key].income.toFixed(2)),
          expense: parseFloat(grouped[key].expense.toFixed(2)),
        }));
    } else {
      // 7 天和 1 个月：按天分组，key 格式为 "yyyy-MM-dd"
      filtered.forEach((t) => {
        const key = format(new Date(t.date), "yyyy-MM-dd");
        if (!grouped[key]) {
          grouped[key] = { date: key, income: 0, expense: 0 };
        }
        if (t.type === "INCOME") {
          grouped[key].income += t.amount;
        } else {
          grouped[key].expense += t.amount;
        }
      });
      return Object.keys(grouped)
        .sort()
        .map((key) => ({
          // 显示为 "MMM dd"，例如 "Mar 15"
          date: format(new Date(key), "MMM dd"),
          income: parseFloat(grouped[key].income.toFixed(2)),
          expense: parseFloat(grouped[key].expense.toFixed(2)),
        }));
    }
  }, [transactions, lowerBound, timeRange]);

  return (
    <div>
      {/* 时间范围选择按钮 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={timeRange === "7" ? "solid" : "outline"}
          size="sm"
          onClick={() => setTimeRange("7")}
        >
          7天
        </Button>
        <Button
          variant={timeRange === "30" ? "solid" : "outline"}
          size="sm"
          onClick={() => setTimeRange("30")}
        >
          1个月
        </Button>
        <Button
          variant={timeRange === "365" ? "solid" : "outline"}
          size="sm"
          onClick={() => setTimeRange("365")}
        >
          1年
        </Button>
      </div>

      {/* 柱状图 */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => value.toFixed(2)} />
          <Legend />
          <Bar dataKey="income" fill="#16a34a" name="收入" />
          <Bar dataKey="expense" fill="#dc2626" name="支出" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
