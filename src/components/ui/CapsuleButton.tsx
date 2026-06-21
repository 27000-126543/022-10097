import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'lg' | 'md'

interface CapsuleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  icon?: LucideIcon
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-rose-dark via-rose to-rose-light text-white shadow-soft hover:shadow-pressed',
  secondary: 'bg-rose-light/60 text-ink hover:bg-rose-light/80',
  ghost: 'bg-white text-ink-light border border-ink-pale/30 hover:bg-warmwhite',
  danger: 'bg-amber text-ink hover:bg-amber-dark',
}

const sizeStyles: Record<Size, string> = {
  lg: 'h-14 px-8 text-base',
  md: 'h-14 px-6 text-sm',
}

export default function CapsuleButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  icon: Icon,
  className,
  ...rest
}: CapsuleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center rounded-capsule font-semibold',
        'transition-all duration-200 ease-out',
        'active:scale-[0.97] active:shadow-pressed',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose/50 focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {Icon && <Icon className="mr-2 h-5 w-5 shrink-0" strokeWidth={2} />}
      <span className="truncate">{children}</span>
    </button>
  )
}
