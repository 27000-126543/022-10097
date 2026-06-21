import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  stepLabel?: string
}

export default function PageHeader({
  title,
  showBack = true,
  onBack,
  stepLabel,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white',
        'border-b border-ink-pale/10 shadow-[0_1px_0_rgba(45,42,50,0.04)]'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-between px-4">
        <div className="flex w-16 items-center justify-start">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="返回"
              className={cn(
                'flex h-10 w-10 items-center justify-center',
                'rounded-full text-ink-light transition-colors',
                'hover:bg-warmwhite hover:text-ink',
                'active:scale-95 active:bg-rose-light/40',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose/50'
              )}
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
            </button>
          )}
        </div>

        <h1 className="flex-1 truncate text-center text-base font-semibold text-ink">
          {title}
        </h1>

        <div className="flex w-16 items-center justify-end">
          {stepLabel && (
            <span className="rounded-full bg-rose-light/40 px-3 py-1 text-xs font-medium text-rose-dark">
              {stepLabel}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
