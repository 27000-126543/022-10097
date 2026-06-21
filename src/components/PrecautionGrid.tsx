import {
  Wine,
  Pill,
  Ban,
  Sun,
  Droplets,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { Precaution } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Wine,
  Pill,
  Ban,
  Sun,
  Droplets,
  UtensilsCrossed,
};

interface PrecautionGridProps {
  precautions: Precaution[];
}

export default function PrecautionGrid({ precautions }: PrecautionGridProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          术前术后注意事项
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {precautions.map((item) => {
          const IconComponent = iconMap[item.icon] ?? Ban;
          const isBefore = item.type === 'before';

          return (
            <div
              key={item.id}
              className={cn(
                'p-4 rounded-2xl',
                'bg-white',
                'border border-gray-100',
                'shadow-sm',
                'flex flex-col gap-3'
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl',
                    'flex items-center justify-center',
                    isBefore
                      ? 'bg-blue-100 text-blue-500'
                      : 'bg-emerald-100 text-emerald-500'
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    isBefore
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-emerald-50 text-emerald-600'
                  )}
                >
                  {isBefore ? '术前' : '术后'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
