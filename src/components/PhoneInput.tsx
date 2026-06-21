import { useState } from 'react';
import { Delete, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  onConfirm?: () => void;
  disabledConfirm?: boolean;
}

const PHONE_MAX_LENGTH = 11;

function formatPhoneDisplay(value: string): string[] {
  const digits = value.padEnd(PHONE_MAX_LENGTH, '-').split('');
  return [
    digits.slice(0, 3).join(''),
    digits.slice(3, 7).join(''),
    digits.slice(7, 11).join(''),
  ];
}

export default function PhoneInput({
  value,
  onChange,
  onConfirm,
  disabledConfirm = false,
}: PhoneInputProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const displayGroups = formatPhoneDisplay(value);
  const isFull = value.length === PHONE_MAX_LENGTH;

  const handleKeyPress = (key: string) => {
    if (value.length >= PHONE_MAX_LENGTH) return;
    onChange(value + key);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handlePressStart = (key: string) => {
    setPressedKey(key);
  };

  const handlePressEnd = () => {
    setPressedKey(null);
  };

  const keyButtons: Array<{ key: string; type: 'num' | 'delete' | 'clear' }> = [
    { key: '1', type: 'num' }, { key: '2', type: 'num' }, { key: '3', type: 'num' },
    { key: '4', type: 'num' }, { key: '5', type: 'num' }, { key: '6', type: 'num' },
    { key: '7', type: 'num' }, { key: '8', type: 'num' }, { key: '9', type: 'num' },
    { key: 'clear', type: 'clear' }, { key: '0', type: 'num' }, { key: 'delete', type: 'delete' },
  ];

  const handleButtonClick = (btn: { key: string; type: 'num' | 'delete' | 'clear' }) => {
    if (btn.type === 'num') handleKeyPress(btn.key);
    else if (btn.type === 'delete') handleDelete();
    else if (btn.type === 'clear') handleClear();
  };

  return (
    <div className="w-full max-w-[560px] mx-auto flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-3">
        <div className="text-lg font-medium text-gray-600 text-center">请输入您的手机号</div>
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 px-8 py-6">
          <div className="flex items-center justify-center gap-3">
            {displayGroups.map((group, idx) => (
              <div key={idx} className="flex items-center">
                {group.split('').map((ch, i) => (
                  <span
                    key={i}
                    className={cn(
                      'w-11 h-16 flex items-center justify-center text-4xl font-bold tracking-wider',
                      ch === '-' ? 'text-gray-300' : 'text-gray-800'
                    )}
                  >
                    {ch}
                  </span>
                ))}
                {idx < displayGroups.length - 1 && (
                  <span className="text-gray-300 text-3xl mx-1"> </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {keyButtons.map((btn) => (
          <button
            key={btn.key}
            onMouseDown={() => handlePressStart(btn.key)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={() => handlePressStart(btn.key)}
            onTouchEnd={handlePressEnd}
            onClick={() => handleButtonClick(btn)}
            className={cn(
              'w-[72px] h-[72px] rounded-full bg-white shadow-md flex items-center justify-center',
              'transition-all duration-150 ease-out select-none active:shadow-lg',
              btn.type === 'num' ? 'text-3xl font-semibold text-gray-800' : '',
              btn.type === 'clear' ? 'text-gray-500' : '',
              btn.type === 'delete' ? 'text-gray-500' : '',
              pressedKey === btn.key ? 'scale-110 shadow-xl bg-gray-50' : 'hover:bg-gray-50'
            )}
          >
            {btn.type === 'delete' && <Delete className="w-8 h-8" strokeWidth={2} />}
            {btn.type === 'clear' && <X className="w-8 h-8" strokeWidth={2} />}
            {btn.type === 'num' && btn.key}
          </button>
        ))}
      </div>

      {onConfirm && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onConfirm}
            disabled={!isFull || disabledConfirm}
            className={cn(
              'px-12 py-4 rounded-full text-lg font-semibold transition-all duration-200',
              isFull && !disabledConfirm
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            查询预约
          </button>
        </div>
      )}
    </div>
  );
}
