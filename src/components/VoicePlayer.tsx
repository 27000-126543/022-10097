import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react'

interface VoicePlayerProps {
  onCompleted: () => void
  completed: boolean
}

const TOTAL_DURATION = 30

export default function VoicePlayer({ onCompleted, completed }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const remainingSeconds = Math.max(0, TOTAL_DURATION - progress)
  const progressPercent = (progress / TOTAL_DURATION) * 100

  useEffect(() => {
    if (completed) {
      setProgress(TOTAL_DURATION)
      setIsPlaying(false)
    }
  }, [completed])

  useEffect(() => {
    if (isPlaying && !completed) {
      intervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          const next = prev + 0.1
          if (next >= TOTAL_DURATION) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setIsPlaying(false)
            setTimeout(() => onCompleted(), 0)
            return TOTAL_DURATION
          }
          return next
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, completed, onCompleted])

  const handlePlayPause = () => {
    if (completed) return
    setIsPlaying(prev => !prev)
  }

  const handleReplay = () => {
    if (!completed) return
    setProgress(0)
    setIsPlaying(true)
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <button
          onClick={handlePlayPause}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
            'bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-200',
            'hover:shadow-xl hover:scale-105 active:scale-95',
            completed && 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-200 cursor-default'
          )}
        >
          {isPlaying ? (
            <div className="flex gap-1">
              <span className={cn(
                'w-1 h-5 bg-white rounded-full animate-pulse'
              )} />
              <span className={cn(
                'w-1 h-5 bg-white rounded-full animate-pulse',
                'animation-delay-200'
              )} />
            </div>
          ) : (
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className={cn(
              'w-4 h-4',
              isPlaying ? 'text-rose-500' : 'text-gray-400'
            )} />
            <span className="text-sm font-medium text-gray-700">
              30秒语音提醒
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-mono text-gray-600 w-8 text-right">
            {Math.ceil(remainingSeconds)}s
          </span>
          <button
            onClick={handleReplay}
            disabled={!completed}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
              completed
                ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 active:scale-95'
                : 'text-gray-300 bg-gray-100 cursor-not-allowed'
            )}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className={cn(
        'text-xs mt-3 text-center',
        completed ? 'text-green-600 font-medium' : 'text-gray-500'
      )}>
        {completed
          ? '✓ 语音已播放完成，可以进行签名操作'
          : '请播放完整语音后再进行签名操作'
        }
      </p>
    </div>
  )
}
