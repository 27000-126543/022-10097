import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { SpecialCondition } from '@/types'

interface SpecialConditionListProps {
  conditions: SpecialCondition[]
  onToggle: (id: string) => void
}

export default function SpecialConditionList({ conditions, onToggle }: SpecialConditionListProps) {
  const noneChecked = conditions.find(c => c.id === 'sc-6')?.checked

  return (
    <div className="grid grid-cols-2 gap-3">
      {conditions.map(condition => {
        const isNone = condition.id === 'sc-6'
        const isDisabled = !isNone && noneChecked

        return (
          <div
            key={condition.id}
            onClick={() => !isDisabled && onToggle(condition.id)}
            className={cn(
              'relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
              condition.checked
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
              isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                  condition.checked
                    ? 'bg-rose-500 border-rose-500'
                    : 'bg-white border-gray-300',
                  isDisabled && 'bg-gray-200 border-gray-300'
                )}
              >
                {condition.checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-medium text-sm leading-tight',
                  condition.checked ? 'text-rose-700' : 'text-gray-800',
                  isDisabled && 'text-gray-500'
                )}>
                  {condition.label}
                </h4>
                <p className={cn(
                  'text-xs mt-1 leading-relaxed',
                  condition.checked ? 'text-rose-600/80' : 'text-gray-500',
                  isDisabled && 'text-gray-400'
                )}>
                  {condition.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
