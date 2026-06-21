import {
  Hand,
  Wind,
  Palette,
  SplitSquareHorizontal,
  Lightbulb,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskPoint } from "@/types";

interface RiskCardProps {
  risk: RiskPoint;
  onUnderstood: () => void;
  understood: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Hand,
  Wind,
  Palette,
  SplitSquareHorizontal,
};

const probabilityStyles: Record<string, string> = {
  高: "bg-rose/20 text-rose-dark",
  中: "bg-amber/20 text-amber-dark",
  低: "bg-mint/20 text-mint-dark",
};

export default function RiskCard({
  risk,
  onUnderstood,
  understood,
}: RiskCardProps) {
  const IconComponent = iconMap[risk.illustration] || Hand;

  return (
    <div className="w-full rounded-3xl bg-white p-8 shadow-soft">
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: `${risk.color}20` }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: risk.color }}
          >
            <IconComponent className="h-7 w-7 text-white" />
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-ink">{risk.title}</h2>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <span
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              probabilityStyles[risk.probability]
            )}
          >
            概率：{risk.probability}
          </span>
          <span className="rounded-full bg-ink/5 px-4 py-1.5 text-sm font-semibold text-ink-light">
            持续：{risk.duration}
          </span>
        </div>

        <div className="mb-6 w-full text-left">
          <p className="text-sm leading-relaxed text-ink-light">
            {risk.description}
          </p>
        </div>

        <div className="mb-8 w-full rounded-2xl bg-warmwhite p-4 text-left">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-dark" />
            <span className="text-sm font-semibold text-ink">应对方案</span>
          </div>
          <p className="pl-7 text-sm leading-relaxed text-ink-light">
            {risk.solution}
          </p>
        </div>

        <button
          onClick={onUnderstood}
          disabled={understood}
          className={cn(
            "w-full rounded-capsule py-4 text-lg font-semibold transition-all duration-300",
            understood
              ? "bg-mint text-white shadow-pressed"
              : "bg-rose text-white hover:bg-rose-dark active:scale-[0.98]"
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {understood && <Check className="h-5 w-5 animate-success-pop" />}
            {understood ? "我已理解" : "我已理解"}
          </span>
        </button>
      </div>
    </div>
  );
}
