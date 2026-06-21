import { cn } from "@/lib/utils";

interface RecoveryTimelineProps {
  days: number;
}

interface TimelineNode {
  day: number;
  label: string;
  description: string;
}

const timelineNodes: TimelineNode[] = [
  { day: 0, label: "Day 0", description: "手术日" },
  { day: 1, label: "Day 1", description: "红肿高峰" },
  { day: 3, label: "Day 3", description: "开始消肿" },
  { day: 7, label: "Day 7", description: "初步恢复" },
];

export default function RecoveryTimeline({ days }: RecoveryTimelineProps) {
  return (
    <div className="w-full py-4">
      <div className="relative flex items-start justify-between px-2">
        {timelineNodes.map((node, index) => {
          const isPassed = days >= node.day;
          const isLast = index === timelineNodes.length - 1;

          return (
            <div
              key={node.day}
              className="relative flex flex-1 flex-col items-center"
            >
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-1/2 top-4 h-0.5 w-full -translate-x-0",
                    isPassed && days >= timelineNodes[index + 1].day
                      ? "bg-rose"
                      : "bg-gray-200"
                  )}
                />
              )}

              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isPassed
                    ? "border-rose bg-rose text-white"
                    : "border-gray-200 bg-white text-gray-300"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isPassed ? "text-white" : "text-gray-400"
                  )}
                >
                  {node.day}
                </span>
              </div>

              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isPassed ? "text-ink" : "text-ink-pale"
                  )}
                >
                  {node.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isPassed ? "text-ink-light" : "text-ink-pale"
                  )}
                >
                  {node.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
