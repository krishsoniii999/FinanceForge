import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface AllocationData {
  name: string
  value: number
  color: string
}

interface AllocationPieProps {
  data: AllocationData[]
}

const COLORS = [
  '#3b82f6',
  '#06b6d4',
  '#8b5cf6',
  '#f59e0b',
  '#22c55e',
  '#ef4444',
  '#ec4899',
  '#64748b',
]

export function AllocationPie({ data }: AllocationPieProps) {
  const chartData = data.map((d, i) => ({
    ...d,
    color: d.color || COLORS[i % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(18, 18, 26, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '8px 12px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          }}
          itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
          labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
