import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Send, RefreshCw, Eye, EyeOff, Lock, AlertTriangle, Clock } from 'lucide-react'

interface SMSVerifyProps {
  phone: string
  verified: boolean
  onVerified: (code: string, expiredAt: number) => void
  onExpired?: () => void
  smsExpiredAt?: number | null
}

const CODE_LENGTH = 6
const COUNTDOWN_SECONDS = 60
const CODE_EXPIRE_MINUTES = 5
const TEST_CODE = '888888'
const LOCK_DURATION_MS = 60 * 1000
const MAX_ATTEMPTS = 3

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

type StatusType = 'idle' | 'sent' | 'success' | 'error' | 'locked' | 'expired'

export default function SMSVerify({ phone, onVerified, verified, onExpired, smsExpiredAt }: SMSVerifyProps) {
  const [codes, setCodes] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(0)
  const [sent, setSent] = useState(false)
  const [sentAt, setSentAt] = useState<number | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [showTestCode, setShowTestCode] = useState(true)
  const [status, setStatus] = useState<StatusType>('idle')
  const [localVerified, setLocalVerified] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const hasExpiredNotifiedRef = useRef(false)

  const codeExpiredAt = smsExpiredAt ?? (sentAt ? sentAt + CODE_EXPIRE_MINUTES * 60 * 1000 : null)

  useEffect(() => {
    if (verified) {
      setSent(true)
      setStatus('success')
      setLocalVerified(true)
      hasExpiredNotifiedRef.current = false
    }
  }, [verified])

  useEffect(() => {
    let timer: number | undefined
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!sent || !codeExpiredAt) return
    const checkTimer = window.setInterval(() => {
      if (Date.now() > codeExpiredAt) {
        setStatus('expired')
        setErrorMsg('验证码已过期，请重新获取')
        setCodes(Array(CODE_LENGTH).fill(''))
        setLocalVerified(false)
        if (!hasExpiredNotifiedRef.current && (verified || localVerified)) {
          hasExpiredNotifiedRef.current = true
          onExpired?.()
        }
        clearInterval(checkTimer)
      }
    }, 1000)
    return () => clearInterval(checkTimer)
  }, [sent, codeExpiredAt, verified, localVerified, onExpired])

  useEffect(() => {
    if (!lockUntil) return
    if (Date.now() >= lockUntil) {
      setLockUntil(null)
      setAttempts(0)
      setStatus(sent ? 'sent' : 'idle')
      setErrorMsg('')
      return
    }
    const timer = window.setInterval(() => {
      if (Date.now() >= lockUntil) {
        setLockUntil(null)
        setAttempts(0)
        setStatus(sent ? 'sent' : 'idle')
        setErrorMsg('')
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [lockUntil, sent])

  const isLocked = lockUntil !== null && Date.now() < lockUntil
  const isVerifiedAndExpired = (verified || localVerified) && codeExpiredAt !== null && Date.now() > codeExpiredAt
  const isCodeExpired = codeExpiredAt !== null && Date.now() > codeExpiredAt
  const effectiveVerified = (verified || localVerified) && !isVerifiedAndExpired

  const getLockRemaining = () => {
    if (!lockUntil) return 0
    return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
  }

  const handleSendCode = () => {
    if (countdown > 0 || isLocked) return
    if (effectiveVerified) return
    const newCode = generateRandomCode()
    setGeneratedCode(newCode)
    setSent(true)
    setSentAt(Date.now())
    setCountdown(COUNTDOWN_SECONDS)
    setCodes(Array(CODE_LENGTH).fill(''))
    setErrorMsg('')
    setStatus('sent')
    setLocalVerified(false)
    hasExpiredNotifiedRef.current = false
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, 100)
  }

  const validateCode = (inputCode: string) => {
    if (isCodeExpired) {
      setStatus('expired')
      setErrorMsg('验证码已过期，请重新获取')
      setCodes(Array(CODE_LENGTH).fill(''))
      return
    }

    if (inputCode === generatedCode || inputCode === TEST_CODE) {
      setStatus('success')
      setErrorMsg('')
      setLocalVerified(true)
      hasExpiredNotifiedRef.current = false
      onVerified(inputCode, Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockUntil(Date.now() + LOCK_DURATION_MS)
        setStatus('locked')
        setErrorMsg('错误次数过多，请1分钟后重试')
      } else {
        setStatus('error')
        setErrorMsg(`验证码错误（${newAttempts}/${MAX_ATTEMPTS}）`)
      }
      setTimeout(() => {
        setCodes(Array(CODE_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      }, 300)
    }
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (effectiveVerified || isLocked) return
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      const newCodes = [...codes]
      newCodes[index] = ''
      setCodes(newCodes)
      return
    }

    const digits = val.split('')
    const newCodes = [...codes]
    let i = index
    for (const d of digits) {
      if (i >= CODE_LENGTH) break
      newCodes[i] = d
      i++
    }
    setCodes(newCodes)

    const nextIndex = Math.min(i, CODE_LENGTH - 1)
    if (i < CODE_LENGTH) {
      inputRefs.current[nextIndex]?.focus()
    }

    const allFilled = newCodes.every(c => c !== '')
    if (allFilled) {
      const fullCode = newCodes.join('')
      setTimeout(() => validateCode(fullCode), 150)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (effectiveVerified || isLocked) return
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (effectiveVerified || isLocked) return
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    const digits = pasted.slice(0, CODE_LENGTH).split('')
    const newCodes = Array(CODE_LENGTH).fill('')
    digits.forEach((d, i) => { newCodes[i] = d })
    setCodes(newCodes)
    const focusIdx = Math.min(digits.length, CODE_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
    if (digits.length === CODE_LENGTH) {
      const fullCode = newCodes.join('')
      setTimeout(() => validateCode(fullCode), 150)
    }
  }

  const statusBar = () => {
    if (status === 'expired' || isCodeExpired) {
      return (
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-rose/20 text-rose-dark">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMsg || '验证码已过期，请重新获取'}</span>
        </div>
      )
    }
    if (status === 'success' || effectiveVerified) {
      return (
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-mint/20 text-mint-dark">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">验证成功</span>
        </div>
      )
    }
    if (status === 'locked' || isLocked) {
      return (
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-amber/20 text-amber-dark">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMsg || `错误次数过多，请${getLockRemaining()}秒后重试`}</span>
        </div>
      )
    }
    if (status === 'error') {
      return (
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-rose/20 text-rose-dark">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )
    }
    if (!sent) {
      return (
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-gray-100 text-ink-light">
          <Send className="w-4 h-4" />
          <span className="text-sm font-medium">请先点击获取验证码</span>
        </div>
      )
    }
    return null
  }

  const inputDisabled = effectiveVerified || isLocked || !sent || isCodeExpired

  const resendDisabled = countdown > 0 || effectiveVerified || isLocked

  return (
    <div className="w-full relative">
      {sent && generatedCode && (
        <div className="absolute -top-2 right-0 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setShowTestCode(v => !v)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {showTestCode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <span className="text-white text-xs font-mono tracking-wide">
              护士测试码: {showTestCode ? '8888 88' : '•••• ••'}
            </span>
          </div>
        </div>
      )}

      {statusBar()}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Send className="w-4 h-4 text-gray-400" />
          <span>{sent ? '验证码已发送至' : '验证码将发送至'}</span>
          <span className="font-medium text-gray-900">{maskPhone(phone)}</span>
        </div>
        <button
          onClick={handleSendCode}
          disabled={resendDisabled}
          className={cn(
            'flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            resendDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95'
          )}
        >
          {countdown > 0 ? (
            <>
              <RefreshCw className={cn('w-3.5 h-3.5', countdown > 0 && 'animate-spin')} />
              {countdown}s 后重发
            </>
          ) : (
            <>
              {sent ? '重新获取' : '获取验证码'}
            </>
          )}
        </button>
      </div>

      <div
        className="flex items-center justify-center gap-3"
        onPaste={handlePaste}
      >
        {codes.map((code, index) => (
          <div
            key={index}
            className={cn(
              'relative w-12 h-14 rounded-xl border-2 flex items-center justify-center transition-all',
              effectiveVerified
                ? 'border-mint-dark bg-mint/30'
                : isCodeExpired
                  ? 'border-rose-400 bg-rose-50'
                  : status === 'error'
                    ? 'border-rose-400 bg-rose-50 animate-shake'
                    : inputDisabled && !sent
                      ? 'border-gray-200 bg-gray-50'
                      : code
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-gray-200 bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100'
            )}
          >
            <input
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code}
              onChange={e => handleChange(index, e)}
              onKeyDown={e => handleKeyDown(index, e)}
              disabled={inputDisabled}
              className={cn(
                'w-full h-full text-center text-2xl font-bold bg-transparent outline-none',
                effectiveVerified ? 'text-mint-dark' : isCodeExpired ? 'text-rose-600' : 'text-gray-900',
                inputDisabled ? 'cursor-not-allowed text-gray-300' : '',
                'selection:bg-transparent'
              )}
            />
            {effectiveVerified && index === CODE_LENGTH - 1 && (
              <CheckCircle className="absolute -right-2 -top-2 w-5 h-5 text-mint-dark bg-white rounded-full" />
            )}
          </div>
        ))}
      </div>

      {sent && codeExpiredAt && !isCodeExpired && (
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-ink-light">
          <Clock className="w-3.5 h-3.5" />
          <span>验证码有效期 {CODE_EXPIRE_MINUTES} 分钟</span>
        </div>
      )}
    </div>
  )
}
