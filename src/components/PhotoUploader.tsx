import { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Check, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  onSave: (dataUrl: string) => void;
  value?: string;
}

export default function PhotoUploader({ onSave, value }: PhotoUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(value ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setImageUrl(value);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleReupload = () => {
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (imageUrl) {
      onSave(imageUrl);
    }
  };

  if (imageUrl) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-md">
          <img
            src={imageUrl}
            alt="预览图片"
            className={cn(
              'w-full object-cover',
              'rounded-[20px]',
              'shadow-lg'
            )}
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={handleReupload}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl',
              'bg-gray-100 text-gray-700',
              'font-medium',
              'hover:bg-gray-200 transition-colors'
            )}
          >
            <RotateCcw className="w-5 h-5" />
            重新上传
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl',
              'bg-emerald-500 text-white',
              'font-medium',
              'hover:bg-emerald-600 transition-colors'
            )}
          >
            <Check className="w-5 h-5" />
            确认使用
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={cn(
          'w-full max-w-md',
          'border-2 border-dashed border-gray-300',
          'rounded-[24px]',
          'bg-gray-50',
          'p-10',
          'flex flex-col items-center justify-center',
          'gap-4'
        )}
      >
        <div className={cn(
          'w-20 h-20 rounded-full',
          'bg-blue-100',
          'flex items-center justify-center'
        )}>
          <Camera className="w-10 h-10 text-blue-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            拍照或上传照片
          </h3>
          <p className="text-sm text-gray-500">
            支持 JPG、PNG 格式，建议清晰拍摄面部
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleCameraClick}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl',
              'bg-blue-500 text-white',
              'font-medium text-sm',
              'hover:bg-blue-600 transition-colors'
            )}
          >
            <Camera className="w-4 h-4" />
            拍照
          </button>
          <button
            type="button"
            onClick={handleGalleryClick}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl',
              'border border-gray-300 bg-white text-gray-700',
              'font-medium text-sm',
              'hover:bg-gray-50 transition-colors'
            )}
          >
            <Upload className="w-4 h-4" />
            从相册选择
          </button>
        </div>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
