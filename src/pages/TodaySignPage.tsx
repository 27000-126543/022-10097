import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignFlowStore } from '@/store/signFlowStore';
import PhoneInput from '@/components/PhoneInput';
import AppointmentCard from '@/components/AppointmentCard';
import CapsuleButton from '@/components/ui/CapsuleButton';

export default function TodaySignPage() {
  const navigate = useNavigate();
  const { phone, setPhone, appointment, setAppointment, queryAppointment } = useSignFlowStore();
  const [hasQueried, setHasQueried] = useState(false);

  const formatDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[now.getDay()];
    return `${year}年${month}月${day}日 ${weekDay}`;
  };

  const [todayDate] = useState(formatDate);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setHasQueried(false);
  };

  const handleQuery = () => {
    setAppointment(null);
    queryAppointment();
    setHasQueried(true);
  };

  const handleStartSign = () => {
    navigate('/identity');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmwhite via-white to-rose-light/20 flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full bg-white/80 backdrop-blur-sm border-b border-rose-light/30 px-8 py-5"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose to-rose-light flex items-center justify-center shadow-soft">
              <Heart className="w-5.5 h-5.5 text-white" fill="white" strokeWidth={0} />
            </div>
          </div>

          <h1 className="text-xl font-bold text-ink tracking-wide">
            悦美医美 · 术前知情同意
          </h1>

          <div className="text-sm text-ink-light font-medium bg-warmwhite px-4 py-2 rounded-full">
            {todayDate}
          </div>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-10"
      >
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-ink mb-3">
              您好，请输入手机号查询今日预约
            </h2>
            <p className="text-ink-light text-base">
              我们将通过手机号为您匹配今日的手术预约信息
            </p>
          </div>

          <PhoneInput
            value={phone}
            onChange={handlePhoneChange}
            onConfirm={handleQuery}
          />

          {hasQueried && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-4 flex flex-col items-center gap-6"
            >
              {appointment ? (
                <>
                  <AppointmentCard appointment={appointment} />
                  <div className="pt-2">
                    <CapsuleButton
                      size="lg"
                      onClick={handleStartSign}
                      className="text-lg px-12"
                    >
                      开始签署
                    </CapsuleButton>
                  </div>
                </>
              ) : (
                <div className="w-full max-w-[640px] bg-gray-50 rounded-[24px] border border-gray-100 p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <Shield className="w-8 h-8 text-gray-400" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    暂无今日预约信息
                  </h3>
                  <p className="text-gray-400 text-base">
                    请联系护士确认您的预约安排
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full py-6 px-6"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-xs text-ink-pale">
          <Shield className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
          <span>
            您的个人信息将被严格保密，仅用于本次医疗服务，受《个人信息保护法》保护
          </span>
        </div>
      </motion.footer>
    </div>
  );
}
