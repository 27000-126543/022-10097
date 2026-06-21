import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle, UserCheck, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import CapsuleButton from '@/components/ui/CapsuleButton'
import SpecialConditionList from '@/components/SpecialConditionList'
import FAQAccordion from '@/components/FAQAccordion'
import { faqItems } from '@/data/mockFAQs'
import { useSignFlowStore } from '@/store/signFlowStore'

export default function QAPage() {
  const navigate = useNavigate()
  const appointment = useSignFlowStore((s) => s.appointment)
  const conditions = useSignFlowStore((s) => s.specialConditions)
  const toggleSpecialCondition = useSignFlowStore((s) => s.toggleSpecialCondition)
  const hasCheckedSpecialCondition = useSignFlowStore((s) => s.hasCheckedSpecialCondition)

  const [nurseConfirmed, setNurseConfirmed] = useState(false)

  useEffect(() => {
    if (!appointment) {
      navigate('/', { replace: true })
    }
  }, [appointment, navigate])

  const handleBack = () => {
    navigate(-1)
  }

  const handleNurseConfirm = () => {
    setNurseConfirmed(true)
  }

  const handleSign = () => {
    navigate('/sign')
  }

  const hasAnyChecked = conditions.some((c) => c.checked)
  const needNurse = hasCheckedSpecialCondition()
  const canProceed = hasAnyChecked && (!needNurse || nurseConfirmed)

  if (!appointment) return null

  return (
    <div className="flex min-h-screen flex-col bg-warmwhite">
      <PageHeader
        title="健康与问答"
        stepLabel="第4步/共5步"
        onBack={handleBack}
      />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-ink">
                请勾选以下如有符合的情况
              </h2>
            </div>

            <SpecialConditionList
              conditions={conditions}
              onToggle={toggleSpecialCondition}
            />

            {needNurse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-2 flex flex-col gap-4 rounded-2xl border border-amber/30 bg-amber/10 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/20">
                    {nurseConfirmed ? (
                      <UserCheck className="h-5 w-5 text-amber-dark" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-dark" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-dark">
                      {nurseConfirmed
                        ? '已与护士确认完毕'
                        : '已为您呼叫护士，请稍候'}
                    </p>
                    <p className="mt-1 text-sm text-amber-dark/80">
                      {nurseConfirmed
                        ? '护士已复核您的特殊情况，可以继续签署流程'
                        : '因您勾选了需要护士复核的项目，护士将很快过来与您当面沟通'}
                    </p>
                  </div>
                </div>

                {!nurseConfirmed && (
                  <CapsuleButton
                    variant="danger"
                    size="md"
                    onClick={handleNurseConfirm}
                    icon={UserCheck}
                  >
                    我已与护士确认，继续签署
                  </CapsuleButton>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-light/40">
                <HelpCircle className="h-5 w-5 text-rose-dark" />
              </div>
              <h2 className="text-xl font-bold text-ink">常见问题</h2>
            </div>

            <FAQAccordion items={faqItems} />
          </motion.div>
        </div>
      </motion.main>

      <footer className="sticky bottom-0 z-30 border-t border-ink-pale/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-4">
          {canProceed ? (
            <CapsuleButton size="lg" variant="primary" onClick={handleSign}>
              已确认，去签名
            </CapsuleButton>
          ) : (
            <span className="text-sm text-ink-light">
              请先勾选一项以继续
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}
