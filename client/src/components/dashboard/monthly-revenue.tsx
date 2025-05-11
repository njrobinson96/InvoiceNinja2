import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for the chart
const revenueData = [
  { month: "Jan", amount: 16500 },
  { month: "Feb", amount: 37200 },
  { month: "Mar", amount: 28800 },
  { month: "Apr", amount: 49500 },
  { month: "May", amount: 41300 },
  { month: "Jun", amount: 62000 },
  { month: "Jul", amount: 74200 },
];

export default function MonthlyRevenue() {
  // Calculate percentage increase from previous month
  const currentMonth = revenueData[revenueData.length - 1].amount;
  const previousMonth = revenueData[revenueData.length - 2].amount;
  const percentageIncrease = ((currentMonth - previousMonth) / previousMonth) * 100;
  const isIncrease = percentageIncrease > 0;

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="px-6 pt-6 pb-0">
          <CardTitle className="text-lg font-medium">Monthly Revenue</CardTitle>
          <div className="mt-2 flex items-center text-sm">
            <span className={isIncrease ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {isIncrease ? "+" : ""}{percentageIncrease.toFixed(1)}% 
            </span>
            <span className="ml-1 text-gray-500">from last month</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
