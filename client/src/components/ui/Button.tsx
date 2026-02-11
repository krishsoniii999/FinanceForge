import { cn } from '../../lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]':
            variant === 'primary',
          'bg-white/[0.06] text-text-primary border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15]':
            variant === 'secondary',
          'text-text-secondary hover:text-text-primary hover:bg-white/[0.06]':
            variant === 'ghost',
          'bg-loss/20 text-loss hover:bg-loss/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]':
            variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
          'px-4 py-2 text-sm gap-2': size === 'md',
          'px-6 py-3 text-base gap-2': size === 'lg',
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
