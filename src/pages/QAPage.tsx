import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, UserCheck, AlertTriangle, X, CheckCircle2, ShieldCheck } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import CapsuleButton from '@/components/ui/CapsuleButton'
import SpecialConditionList from '@/components/SpecialConditionList'
import FAQAccordion from '@/components/FAQAccordion'
import { faqItems } from '@/data/mockFAQs'
import { useSignFlowStore } from '@/store/signFlowStore'
import { cn } from '@/lib/utils'

export default function QAPage() {
  const navigate = useNavigate()
  const appointment = useSignFlowStore((s) => s.appointment)
  const conditions = useSignFlowStore((s) => s.specialConditions)
  const toggleSpecialCondition = useSignFlowStore((s) => s.toggleSpecialCondition)
  const hasCheckedSpecialCondition = useSignFlowStore((s) => s.hasCheckedSpecialCondition)
  const setNurseReview = useSignFlowStore((s) => s.setNurseReview)

  const [nurseConfirmed, setNurseConfirmed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [nurseId, setNurseId] = useState('')
  const [nurseIdVerified, setNurseIdVerified] = useState(false)

  useEffect(() => {
    if (!appointment) {
      navigate('/', { replace: true })
    }
  }, [appointment, navigate])

  useEffect(() => {
    if (!showModal) {
      setNurseId('')
      setNurseIdVerified(false)
    }
  }, [showModal])

  const handleBack = () => {
    navigate(-1)
  }

  const handleCallNurse = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleNurseIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setNurseId(val)
    if (nurseIdVerified) {
      setNurseIdVerified(false)
    }
  }

  const handleVerifyNurseId = () => {
    if (nurseId.length === 4) {
      setNurseIdVerified(true)
    }
  }

  const handleConfirmReview = () => {
    const reviewedItems = conditions
      .filter((c) => c.checked && c.needNurseReview)
      .map((c) => c.label)
    setNurseReview(reviewedItems)
    setNurseConfirmed(true)
    setShowModal(false)
  }

  const handleSign = () => {
    navigate('/sign')
  }

  const hasAnyChecked = conditions.some((c) => c.checked)
  const needNurse = hasCheckedSpecialCondition()
  const canProceed = hasAnyChecked && (!needNurse || nurseConfirmed)
  const nurseReviewItems = conditions.filter((c) => c.checked && c.needNurseReview)

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
                        : '需护士当面复核'}
                    </p>
                    <p className="mt-1 text-sm text-amber-dark/80">
                      {nurseConfirmed
                        ? '护士已复核您的特殊情况，可以继续签署流程'
                        : '因您勾选了需要护士复核的项目，请呼叫护士进行当面确认'}
                    </p>
                  </div>
                </div>

                {!nurseConfirmed && (
                  <CapsuleButton
                    variant="danger"
                    size="md"
                    onClick={handleCallNurse}
                    icon={UserCheck}
                  >
                    呼叫护士复核
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

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-soft">
                <div className="bg-gradient-to-r from-rose-dark via-rose to-rose-light px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">护士复核确认</h3>
                        <p className="text-xs text-white/80">请护士当面完成复核流程</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white/90 transition-all hover:bg-white/25 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-light/20 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-dark" />
                    <p className="text-sm font-medium text-rose-dark">
                      请护士当面复核以下勾选项目
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {nurseReviewItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-2xl border border-ink-pale/15 bg-warmwhite/50 p-3.5"
                      >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/30">
                          <CheckCircle2 className="h-3.5 w-3.5 text-mint-dark" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink">{item.label}</span>
                            {item.needNurseReview && (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-dark" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-ink-light">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3.5">
                    <div className="rounded-2xl border border-ink-pale/20 bg-gray-50/50 p-4">
                      <div className="mb-2.5 flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-ink-light" />
                        <span className="text-sm font-medium text-ink">护士身份校验</span>
                      </div>
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={nurseId}
                          onChange={handleNurseIdChange}
                          disabled={nurseIdVerified}
                          placeholder="请输入4位护士工号"
                          className={cn(
                            'flex-1 h-11 rounded-xl border-2 px-4 text-sm font-medium tracking-widest text-center outline-none transition-all',
                            nurseIdVerified
                              ? 'border-mint-dark bg-mint/15 text-mint-dark'
                              : 'border-ink-pale/20 bg-white focus:border-rose focus:ring-2 focus:ring-rose/20'
                          )}
                        />
                        <CapsuleButton
                          variant={nurseIdVerified ? 'primary' : 'secondary'}
                          size="md"
                          onClick={handleVerifyNurseId}
                          disabled={nurseId.length !== 4 || nurseIdVerified}
                          icon={nurseIdVerified ? CheckCircle2 : ShieldCheck}
                          className="!h-11 !px-5"
                        >
                          {nurseIdVerified ? '已验证' : '确定'}
                        </CapsuleButton>
                      </div>
                      <p className="mt-2 text-xs text-ink-light">
                        护士工号：演示环境任意4位数字即可
                      </p>
                    </div>

                    {nurseIdVerified && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CapsuleButton
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={handleConfirmReview}
                          icon={UserCheck}
                          className="bg-gradient-to-r from-mint-dark via-mint to-mint-dark !shadow-soft hover:!shadow-pressed"
                        >
                          确认复核完毕
                        </CapsuleButton>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
