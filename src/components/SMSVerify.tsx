import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Send, RefreshCw } from 'lucide-react'

interface SMSVerifyProps {
  phone: string
  onVerified: () => void
  verified: boolean
}

const CODE_LENGTH = 6
const COUNTDOWN_SECONDS = 60

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

export default function SMSVerify({ phone, onVerified, verified }: SMSVerifyProps) {
  const [codes, setCodes] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(0)
  const [sent, setSent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (verified) {
      setSent(true)
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

  const handleSendCode = () => {
    if (countdown > 0 || verified) return
    setSent(true)
    setCountdown(COUNTDOWN_SECONDS)
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, 100)
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (verified) return
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
      setTimeout(() => onVerified(), 200)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (verified) return
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (verified) return
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
      setTimeout(() => onVerified(), 200)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Send className="w-4 h-4 text-gray-400" />
          <span>验证码已发送至</span>
          <span className="font-medium text-gray-900">{maskPhone(phone)}</span>
        </div>
        <button
          onClick={handleSendCode}
          disabled={countdown > 0 || verified}
          className={cn(
            'flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            countdown > 0 || verified
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
              verified
                ? 'border-green-400 bg-green-50'
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
              disabled={verified}
              className={cn(
                'w-full h-full text-center text-2xl font-bold bg-transparent outline-none',
                verified ? 'text-green-600' : 'text-gray-900',
                'selection:bg-transparent'
              )}
            />
            {verified && index === CODE_LENGTH - 1 && (
              <CheckCircle className="absolute -right-2 -top-2 w-5 h-5 text-green-500 bg-white rounded-full" />
            )}
          </div>
        ))}
      </div>

      {verified && (
        <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">验证成功</span>
        </div>
      )}
    </div>
  )
}
