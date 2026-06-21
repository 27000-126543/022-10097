import { cn } from '@/lib/utils'

interface ProgressDotsProps {
  total: number
  current: number
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  const safeCurrent = Math.max(0, Math.min(current, total - 1))

  return (
    <div
      className="flex items-center justify-center gap-2.5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total - 1}
      aria-valuenow={safeCurrent}
      aria-label={`步骤 ${safeCurrent + 1}，共 ${total} 步`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isPast = index < safeCurrent
        const isCurrent = index === safeCurrent

        return (
          <span
            key={index}
            className={cn(
              'rounded-full transition-all duration-300 ease-out',
              isPast && 'h-2.5 w-2.5 bg-rose',
              isCurrent && [
                'h-3.5 w-3.5 bg-rose shadow-[0_0_0_3px_rgba(232,180,184,0.25)]',
                'animate-[pulseSoft_2s_ease-in-out_infinite]',
              ],
              !isPast && !isCurrent && 'h-2.5 w-2.5 bg-ink-pale/25'
            )}
          />
        )
      })}
    </div>
  )
}
