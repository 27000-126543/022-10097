import { useRef, useEffect, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { cn } from '@/lib/utils'
import { Trash2, Check, AlertCircle } from 'lucide-react'

interface HandwritePadProps {
  onSave: (dataUrl: string) => void
  value?: string
  onClear?: () => void
}

export default function HandwritePad({ onSave, value, onClear }: HandwritePadProps) {
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    if (value && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current.getCanvas()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = value
      }
      setIsEmpty(false)
    }
  }, [value])

  const handleBegin = () => {
    setError(null)
    setIsEmpty(false)
  }

  const handleClear = () => {
    sigCanvasRef.current?.clear()
    setIsEmpty(true)
    setError(null)
    onClear?.()
  }

  const checkSignatureQuality = (): { valid: boolean; message?: string } => {
    const canvas = sigCanvasRef.current?.getCanvas()
    if (!canvas) return { valid: false, message: '画布未初始化' }

    if (sigCanvasRef.current?.isEmpty()) {
      return { valid: false, message: '请先书写签名' }
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return { valid: false }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let pixelCount = 0
    let minX = canvas.width
    let maxX = 0
    let minY = canvas.height
    let maxY = 0

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4
        const alpha = data[idx + 3]
        if (alpha > 50) {
          pixelCount++
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    if (pixelCount < 150) {
      return { valid: false, message: '签名笔画太少，请重新书写清晰的签名' }
    }

    const width = maxX - minX
    const height = maxY - minY
    const minSize = Math.min(canvas.width, canvas.height) * 0.2

    if (width < minSize || height < minSize) {
      return { valid: false, message: '签名太小，请书写更大的签名' }
    }

    return { valid: true }
  }

  const handleSave = () => {
    const quality = checkSignatureQuality()
    if (!quality.valid) {
      setError(quality.message || '签名无效，请重新书写')
      return
    }

    const dataUrl = sigCanvasRef.current?.toDataURL('image/png')
    if (dataUrl) {
      setError(null)
      onSave(dataUrl)
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative rounded-2xl border-2 border-dashed overflow-hidden transition-colors',
          error ? 'border-red-300 bg-red-50/30' : 'border-gray-300 bg-white'
        )}
        style={{ borderRadius: '16px' }}
      >
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="#1f2937"
          onBegin={handleBegin}
          canvasProps={{
            className: 'w-full cursor-crosshair',
            style: { height: '180px', display: 'block' }
          }}
        />
        {isEmpty && !value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">请在上方区域手写签名</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={handleClear}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
            'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
          )}
        >
          <Trash2 className="w-4 h-4" />
          清除
        </button>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all',
            'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-200',
            'hover:shadow-xl hover:from-rose-600 hover:to-rose-700 active:scale-95'
          )}
        >
          <Check className="w-4 h-4" />
          确认保存
        </button>
      </div>
    </div>
  )
}
