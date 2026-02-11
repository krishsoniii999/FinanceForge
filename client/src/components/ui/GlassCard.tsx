import { cn } from '../../lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function GlassCard({
  hover = false,
  glow = false,
  padding = 'md',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover cursor-pointer',
        glow && 'pulse-glow',
        paddingMap[padding],
        className
      )}
      whileHover={hover ? { scale: 1.008 } : undefined}
      whileTap={hover ? { scale: 0.995 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
