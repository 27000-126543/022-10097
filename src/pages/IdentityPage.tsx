import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Syringe, ChevronDown, ChevronUp, Award, GraduationCap, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignFlowStore } from '@/store/signFlowStore';
import PageHeader from '@/components/ui/PageHeader';
import CapsuleButton from '@/components/ui/CapsuleButton';
import RecoveryTimeline from '@/components/RecoveryTimeline';
import PrecautionGrid from '@/components/PrecautionGrid';
import { cn } from '@/lib/utils';

export default function IdentityPage() {
  const navigate = useNavigate();
  const { appointment } = useSignFlowStore();
  const [showDoctorDetail, setShowDoctorDetail] = useState(false);

  useEffect(() => {
    if (!appointment) {
      navigate('/', { replace: true });
    }
  }, [appointment, navigate]);

  if (!appointment) return null;

  const { patientName, projectName, bodyPart, anesthesiaLabel, recoveryDays, doctor, precautions } = appointment;

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    navigate('/risks');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmwhite via-white to-rose-light/15 flex flex-col">
      <PageHeader
        title="身份确认"
        stepLabel="第2步/共5步"
        onBack={handleBack}
      />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 overflow-y-auto px-8 py-8 pb-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="lg:w-[55%] flex flex-col gap-6"
            >
              <div className="bg-white rounded-[28px] shadow-card border border-gray-50 p-10">
                <p className="text-2xl font-semibold text-ink-light mb-6">
                  {patientName}您好
                </p>

                <h1 className="text-6xl font-black text-ink leading-tight tracking-tight mb-8">
                  {projectName}
                </h1>

                <div className="flex flex-wrap gap-4 mb-10">
                  <div className={cn(
                    'inline-flex items-center gap-2.5 px-5 py-3 rounded-full',
                    'bg-sky-50 text-sky-700 border border-sky-100'
                  )}>
                    <MapPin className="w-5 h-5 shrink-0" strokeWidth={2.2} />
                    <span className="text-base font-semibold">{bodyPart}</span>
                  </div>
                  <div className={cn(
                    'inline-flex items-center gap-2.5 px-5 py-3 rounded-full',
                    'bg-violet-50 text-violet-700 border border-violet-100'
                  )}>
                    <Syringe className="w-5 h-5 shrink-0" strokeWidth={2.2} />
                    <span className="text-base font-semibold">{anesthesiaLabel}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="inline-block w-1 h-5 bg-rose rounded-full" />
                    <h3 className="text-lg font-bold text-ink">术后恢复时间轴</h3>
                  </div>
                  <RecoveryTimeline days={recoveryDays} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="lg:w-[45%] flex flex-col gap-6"
            >
              <div className="bg-white rounded-[28px] shadow-card border border-gray-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-rose-light/50 shadow-soft"
                      />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-mint rounded-full border-3 border-white flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-ink">{doctor.name}</h3>
                        <span className="text-sm text-rose-dark font-medium shrink-0">医生</span>
                      </div>
                      <p className="text-ink-light text-base mb-3">{doctor.title}</p>
                      <button
                        onClick={() => setShowDoctorDetail(!showDoctorDetail)}
                        className={cn(
                          'inline-flex items-center gap-1 text-sm font-medium',
                          'text-rose-dark hover:text-rose transition-colors'
                        )}
                      >
                        查看详情
                        {showDoctorDetail ? (
                          <ChevronUp className="w-4 h-4" strokeWidth={2.2} />
                        ) : (
                          <ChevronDown className="w-4 h-4" strokeWidth={2.2} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {showDoctorDetail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 border-t border-gray-50 pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                              <GraduationCap className="w-4.5 h-4.5 text-amber-dark" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink mb-1">教育背景</p>
                              <p className="text-sm text-ink-light leading-relaxed">
                                上海交通大学医学院临床医学博士，曾于韩国首尔大学整形外科进修学习
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-mint/30 flex items-center justify-center shrink-0 mt-0.5">
                              <Award className="w-4.5 h-4.5 text-mint-dark" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink mb-1">专业擅长</p>
                              <p className="text-sm text-ink-light leading-relaxed">
                                面部精细化注射美容、面部年轻化综合治疗、眼部整形，累计完成手术超10000例
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-white rounded-[28px] shadow-card border border-gray-50 p-8">
                <PrecautionGrid precautions={precautions} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-light/30"
      >
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-center">
          <CapsuleButton
            size="lg"
            onClick={handleNext}
            className="text-lg px-16 py-7 min-w-[360px]"
          >
            信息确认无误，下一步
          </CapsuleButton>
        </div>
      </motion.div>
    </div>
  );
}
