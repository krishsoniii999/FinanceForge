import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30',
              'transition-all duration-200',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'
