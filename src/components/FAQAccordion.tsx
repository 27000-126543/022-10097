import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/types";

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl bg-white transition-all duration-300",
              isOpen ? "shadow-card" : "shadow-pressed"
            )}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span
                className={cn(
                  "text-base font-semibold transition-colors duration-300",
                  isOpen ? "text-ink" : "text-ink-light"
                )}
              >
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                    isOpen ? "text-rose" : "text-ink-pale"
                  )}
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="border-t border-ink/5 px-5 py-4">
                    <p className="text-sm leading-relaxed text-ink-light">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
