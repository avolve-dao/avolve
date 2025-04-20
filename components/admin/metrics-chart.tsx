import { useMemo } from 'react'
import {
  Area,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  date: string;
  value: number;
}

interface MetricsChartProps {
  title: string
  data?: ChartData[]
  type?: 'line' | 'bar' | 'area' | 'heatmap'
}

export function MetricsChart({ title, data = [], type = 'line' }: MetricsChartProps) {
  // Format data for the chart
  const chartData = useMemo(() => {
    return data.map((item: ChartData) => ({
      ...item,
      value: typeof item.value === 'number' ? item.value : 0,
    }))
  }, [data])

  // Get chart component based on type
  const ChartComponent = useMemo(() => {
    switch (type) {
      case 'bar':
        return Bar
      case 'area':
        return Area
      case 'heatmap':
        // For heatmap, we'll use a custom implementation
        return null
      default:
        return Line
    }
  }, [type])

  if (type === 'heatmap') {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {data.map((week: ChartData, weekIndex: number) => (
            <div key={weekIndex} className="space-y-1">
              {[week].flat().map((day: ChartData, dayIndex: number) => {
                const intensity = Math.min(Math.max(day.value / 100, 0), 1)
                const alpha = Math.round(intensity * 100)
                return (
                  <div
                    key={dayIndex}
                    className="h-4 w-4 rounded-sm"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${alpha}%)`,
                    }}
                    title={`${day.date}: ${day.value}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              bottom: 20,
              left: 10,
            }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
              itemStyle={{
                color: 'rgba(255, 255, 255, 0.9)',
              }}
              labelStyle={{
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '0.25rem',
              }}
            />
            {ChartComponent && (
              <ChartComponent
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
