import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  PenLine,
  Camera,
  MessageSquare,
  FileText,
  Target,
  Syringe,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
} from 'lucide-react'
import { useSignFlowStore } from '@/store/signFlowStore'
import PageHeader from '@/components/ui/PageHeader'
import CapsuleButton from '@/components/ui/CapsuleButton'
import VoicePlayer from '@/components/VoicePlayer'
import HandwritePad from '@/components/HandwritePad'
import PhotoUploader from '@/components/PhotoUploader'
import SMSVerify from '@/components/SMSVerify'
import { cn } from '@/lib/utils'
import type { SignMethod } from '@/types'

const TABS: { key: Exclude<SignMethod, null>; label: string; icon: typeof PenLine }[] = [
  { key: 'handwrite', label: '手写签名', icon: PenLine },
  { key: 'photo', label: '拍照确认', icon: Camera },
  { key: 'sms', label: '短信验证码', icon: MessageSquare },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 24 },
  },
}

export default function SignPage() {
  const navigate = useNavigate()
  const {
    appointment,
    voiceCompleted,
    setVoiceCompleted,
    signMethod,
    setSignMethod,
    signData,
    setSignData,
    smsVerified,
    setSmsVerified,
    phone,
    understoodRisks,
    specialConditions,
    canProceedToSign,
    completeFlow,
    completed,
    queueNumber,
  } = useSignFlowStore()

  const confirmedSpecialCount = useMemo(
    () => specialConditions.filter((c) => c.checked).length,
    [specialConditions]
  )

  const randomAhead = useMemo(() => Math.floor(Math.random() * 6) + 2, [])
  const randomWait = useMemo(() => Math.floor(Math.random() * 15) + 10, [])

  useEffect(() => {
    if (!appointment) {
      navigate('/')
    }
  }, [appointment, navigate])

  const handleBack = () => {
    navigate(-1)
  }

  const handleTabClick = (method: Exclude<SignMethod, null>) => {
    setSignMethod(method)
  }

  const handleSubmit = () => {
    if (canProceedToSign()) {
      completeFlow()
    }
  }

  if (!appointment) return null

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.15 }}
          className="relative z-10 flex w-[90%] max-w-md flex-col items-center rounded-[32px] bg-white px-8 py-12 shadow-[0_20px_60px_rgba(139,109,113,0.12)]"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.3 }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-mint/30 animate-pulse-soft" />
            <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-mint via-mint-dark to-emerald-500 shadow-[0_12px_32px_rgba(127,191,153,0.35)] animate-success-pop">
              <CheckCircle2 className="h-[72px] w-[72px] text-white" strokeWidth={2.8} />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mb-2 text-4xl font-black tracking-tight text-ink"
          >
            提交成功
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="mb-8 text-center text-base text-ink-light"
          >
            请将平板交给护士，耐心等待叫号
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.8 }}
            className="relative mb-8"
          >
            <div className="absolute -inset-2 rounded-full bg-mint/20 animate-pulse-soft" />
            <div className="relative rounded-full border-2 border-dashed border-mint-dark/40 bg-mint/10 px-10 py-5">
              <span className="bg-gradient-to-r from-mint-dark via-emerald-600 to-teal-600 bg-clip-text text-5xl font-black tracking-widest text-transparent">
                {queueNumber}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="flex w-full flex-col gap-3 rounded-2xl bg-warmwhite p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-light/40">
                <Users className="h-4 w-4 text-rose-dark" strokeWidth={2.2} />
              </div>
              <span className="text-sm text-ink-light">
                前方有{' '}
                <span className="font-bold text-ink">{randomAhead}</span>{' '}
                位顾客等候
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint/30">
                <Clock className="h-4 w-4 text-mint-dark" strokeWidth={2.2} />
              </div>
              <span className="text-sm text-ink-light">
                预计等待{' '}
                <span className="font-bold text-ink">{randomWait}</span>{' '}
                分钟
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-warmwhite">
      <PageHeader
        title="签署同意书"
        stepLabel="第5步/共5步"
        onBack={handleBack}
      />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-hidden"
      >
        <div className="h-full w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 gap-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-5 overflow-y-auto pr-2"
          >
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <motion.div
                variants={itemVariants}
                className="mb-4 flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose to-rose-light shadow-soft">
                  <Volume2 className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
                </div>
                <h2 className="text-lg font-bold text-ink">术前语音提醒</h2>
              </motion.div>

              <motion.div variants={itemVariants}>
                <VoicePlayer
                  completed={voiceCompleted}
                  onCompleted={() => setVoiceCompleted(true)}
                />
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="rounded-3xl bg-white p-6 shadow-card"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mint to-mint-dark shadow-soft">
                  <FileText className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
                </div>
                <h2 className="text-lg font-bold text-ink">同意书摘要</h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: Target,
                    label: '项目名称',
                    value: appointment.projectName,
                    color: 'from-rose to-rose-light',
                    iconBg: 'bg-rose-light/40',
                    iconColor: 'text-rose-dark',
                  },
                  {
                    icon: FileText,
                    label: '手术部位',
                    value: appointment.bodyPart,
                    color: 'from-amber to-amber-dark',
                    iconBg: 'bg-amber/30',
                    iconColor: 'text-amber-dark',
                  },
                  {
                    icon: Syringe,
                    label: '麻醉方式',
                    value: appointment.anesthesiaLabel,
                    color: 'from-blue-400 to-blue-500',
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                  },
                  {
                    icon: ShieldCheck,
                    label: '已确认风险',
                    value: `${understoodRisks.length} 项`,
                    color: 'from-mint to-mint-dark',
                    iconBg: 'bg-mint/30',
                    iconColor: 'text-mint-dark',
                  },
                  {
                    icon: AlertTriangle,
                    label: '特殊情况',
                    value: `${confirmedSpecialCount} 项`,
                    color: 'from-violet-400 to-violet-500',
                    iconBg: 'bg-violet-100',
                    iconColor: 'text-violet-600',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-4 rounded-2xl bg-warmwhite/60 p-4 transition-all hover:bg-warmwhite hover:shadow-[0_2px_12px_rgba(139,109,113,0.06)]"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        item.iconBg
                      )}
                    >
                      <item.icon
                        className={cn('h-5 w-5', item.iconColor)}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-medium text-ink-pale">
                        {item.label}
                      </span>
                      <span className="mt-0.5 truncate text-sm font-semibold text-ink">
                        {item.value}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-card"
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-dark via-rose to-rose-light shadow-soft">
                <PenLine className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
              </div>
              <h2 className="text-lg font-bold text-ink">选择确认方式</h2>
            </div>

            <div className="mb-6">
              <div className="flex rounded-full bg-warmwhite p-1.5 shadow-[inset_0_1px_3px_rgba(139,109,113,0.06)]">
                {TABS.map((tab) => {
                  const isActive = signMethod === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabClick(tab.key)}
                      className={cn(
                        'relative flex-1 flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-semibold transition-all duration-300',
                        isActive
                          ? 'text-white shadow-soft'
                          : 'text-ink-light hover:text-ink'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSignTab"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-dark via-rose to-rose-light shadow-soft"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <tab.icon className="h-4 w-4" strokeWidth={2} />
                        <span>{tab.label}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <AnimatePresence mode="wait">
                {signMethod === 'handwrite' && (
                  <motion.div
                    key="handwrite"
                    initial={{ opacity: 0, x: -20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <HandwritePad
                      value={signData ?? undefined}
                      onSave={(data) => setSignData(data)}
                      onClear={() => setSignData(null)}
                    />
                  </motion.div>
                )}

                {signMethod === 'photo' && (
                  <motion.div
                    key="photo"
                    initial={{ opacity: 0, x: -20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <PhotoUploader
                      value={signData ?? undefined}
                      onSave={(data) => setSignData(data)}
                    />
                  </motion.div>
                )}

                {signMethod === 'sms' && (
                  <motion.div
                    key="sms"
                    initial={{ opacity: 0, x: -20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <SMSVerify
                      phone={phone}
                      verified={smsVerified}
                      onVerified={() => setSmsVerified(true)}
                    />
                  </motion.div>
                )}

                {!signMethod && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-rose-light/50 bg-warmwhite/40"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-light/60 to-rose/40"
                    >
                      <PenLine className="h-8 w-8 text-rose-dark" strokeWidth={1.8} />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-ink">请选择一种确认方式</p>
                      <p className="mt-1 text-xs text-ink-pale">手写签名、拍照确认 或 短信验证</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.main>

      <AnimatePresence>
        {canProceedToSign() && (
          <motion.footer
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="sticky bottom-0 z-30 border-t border-ink-pale/10 bg-white/85 backdrop-blur-md"
          >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-5">
              <CapsuleButton
                size="lg"
                fullWidth
                onClick={handleSubmit}
                className="!max-w-xl !h-16 !text-lg shadow-[0_10px_32px_rgba(209,148,152,0.3)]"
              >
                完成签署并提交
              </CapsuleButton>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  )
}
