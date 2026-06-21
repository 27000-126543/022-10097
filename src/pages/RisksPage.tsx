import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '@/components/ui/PageHeader'
import ProgressDots from '@/components/ui/ProgressDots'
import CapsuleButton from '@/components/ui/CapsuleButton'
import RiskCard from '@/components/RiskCard'
import { riskPoints } from '@/data/mockRisks'
import { useSignFlowStore } from '@/store/signFlowStore'

export default function RisksPage() {
  const navigate = useNavigate()
  const appointment = useSignFlowStore((s) => s.appointment)
  const markRiskUnderstood = useSignFlowStore((s) => s.markRiskUnderstood)
  const isRiskUnderstood = useSignFlowStore((s) => s.isRiskUnderstood)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (!appointment) {
      navigate('/', { replace: true })
    }
  }, [appointment, navigate])

  const total = riskPoints.length
  const allUnderstood = riskPoints.every((r) => isRiskUnderstood(r.id))

  const handleUnderstood = () => {
    const currentRisk = riskPoints[currentIndex]
    if (!isRiskUnderstood(currentRisk.id)) {
      markRiskUnderstood(currentRisk.id)
    }
    if (currentIndex < total - 1) {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleNext = () => {
    navigate('/qa')
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  }

  if (!appointment) return null

  return (
    <div className="flex min-h-screen flex-col bg-warmwhite">
      <PageHeader
        title="风险告知"
        stepLabel="第3步/共5步"
        onBack={handleBack}
      />

      <div className="mx-auto w-full max-w-3xl px-4 pt-6">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-ink-light">
          <span>共 {total} 项常见风险</span>
          <span>
            已了解 {riskPoints.filter((r) => isRiskUnderstood(r.id)).length} /{' '}
            {total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-pale/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-dark via-rose to-rose-light"
            initial={{ width: 0 }}
            animate={{
              width: `${
                (riskPoints.filter((r) => isRiskUnderstood(r.id)).length /
                  total) *
                100
              }%`,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-ink-light">
          阅读以下 {total} 个常见风险，了解后点击「我已理解」进入下一个
        </p>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 320, damping: 32 },
                opacity: { duration: 0.25 },
              }}
            >
              <RiskCard
                risk={riskPoints[currentIndex]}
                onUnderstood={handleUnderstood}
                understood={isRiskUnderstood(riskPoints[currentIndex].id)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-ink-pale/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <ProgressDots total={total} current={currentIndex} />

          <div className="flex items-center gap-3">
            {!allUnderstood ? (
              <span className="rounded-full bg-ink-pale/10 px-4 py-2 text-sm font-medium text-ink-light">
                第 {currentIndex + 1} 个 / 共 {total} 个
              </span>
            ) : (
              <CapsuleButton
                size="lg"
                variant="primary"
                onClick={handleNext}
              >
                全部风险已了解，下一步
              </CapsuleButton>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
