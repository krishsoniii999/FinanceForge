import { Sparkles, PieChart, BarChart3, BookOpen } from 'lucide-react'

interface QuickActionsProps {
  symbol?: string | null
  onAction: (prompt: string) => void
}

export function QuickActions({ symbol, onAction }: QuickActionsProps) {
  const actions = [
    ...(symbol
      ? [
          {
            icon: Sparkles,
            label: `Summarize ${symbol}`,
            prompt: `Give me a quick summary of ${symbol}. What does the company do, how is it performing, and what should I know as an investor?`,
          },
          {
            icon: BarChart3,
            label: `Analyze ${symbol}`,
            prompt: `Analyze ${symbol}'s stock. Look at the current price, recent performance, and key metrics. Is it a good buy right now?`,
          },
        ]
      : []),
    {
      icon: PieChart,
      label: 'Review portfolio',
      prompt: 'Review my current paper trading portfolio. How am I doing? Any suggestions for improvement?',
    },
    {
      icon: BookOpen,
      label: 'Teach me',
      prompt: 'What are the most important things a beginner investor should know? Give me practical advice.',
    },
  ]

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.prompt)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all"
        >
          <action.icon size={12} />
          {action.label}
        </button>
      ))}
    </div>
  )
}
