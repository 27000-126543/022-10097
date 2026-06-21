import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  User,
  Target,
  Syringe,
  ShieldAlert,
  Stethoscope,
  Volume2,
  PenLine,
  Camera,
  MessageSquare,
  Printer,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useSignFlowStore } from '@/store/signFlowStore';
import { riskPoints } from '@/data/mockRisks';
import { specialConditions as allConditions } from '@/data/mockFAQs';
import { maskPhone, cn } from '@/lib/utils';
import type { ConsentRecord, SignMethod } from '@/types';

function formatDateCN(ts: string | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateShort(ts: string | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTime(ts: string | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function generateRecordNo(createdAt: string): string {
  const d = new Date(createdAt);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const suffix = Math.floor((d.getHours() * 60 + d.getMinutes()) % 9000 + 1000);
  return `CR-${dateStr}-${suffix}`;
}

function getSignMethodLabel(method: SignMethod): string {
  switch (method) {
    case 'handwrite':
      return '手写签名';
    case 'photo':
      return '照片确认';
    case 'sms':
      return '短信验证';
    default:
      return '待确认';
  }
}

function getSignMethodIcon(method: SignMethod) {
  switch (method) {
    case 'handwrite':
      return PenLine;
    case 'photo':
      return Camera;
    case 'sms':
      return MessageSquare;
    default:
      return PenLine;
  }
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full bg-ink/90 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_32px_rgba(45,42,50,0.25)] backdrop-blur-md">
            <CheckCircle2 className="h-4.5 w-4.5 text-mint" strokeWidth={2.2} />
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose to-rose-light">
        <Icon className="h-4 w-4 text-white" strokeWidth={2.2} />
      </div>
      <h3 className="text-base font-bold text-ink">
        【{title}】
      </h3>
    </div>
  );
}

function SectionDivider() {
  return <div className="my-6 h-px bg-gradient-to-r from-transparent via-ink-pale/20 to-transparent" />;
}

export default function ConsentPreviewPage() {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const { findConsentRecordById } = useSignFlowStore();
  const [toastVisible, setToastVisible] = useState(false);

  const record = useMemo(
    () => (recordId ? findConsentRecordById(recordId) : undefined),
    [recordId, findConsentRecordById]
  );

  const understoodRisksDetail = useMemo(() => {
    if (!record) return [];
    return record.understoodRisks
      .map((rid) => riskPoints.find((r) => r.id === rid))
      .filter(Boolean) as typeof riskPoints;
  }, [record]);

  const checkedConditionIds = useMemo(() => {
    if (!record) return new Set<string>();
    return new Set(record.checkedConditions.map((c) => c.id));
  }, [record]);

  useEffect(() => {
    if (!toastVisible) return;
    const t = window.setTimeout(() => setToastVisible(false), 2400);
    return () => window.clearTimeout(t);
  }, [toastVisible]);

  const handleBack = () => {
    navigate('/nurse-records');
  };

  const handlePrint = () => {
    setToastVisible(true);
  };

  if (!record) {
    return (
      <div className="flex h-screen w-full flex-col bg-warmwhite">
        <header className="sticky top-0 z-40 w-full border-b border-ink-pale/10 bg-white shadow-[0_1px_0_rgba(45,42,50,0.04)]">
          <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-between px-4">
            <div className="flex w-16 items-center justify-start">
              <button
                onClick={() => navigate(-1)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-ink-light transition-colors',
                  'hover:bg-warmwhite hover:text-ink',
                  'active:scale-95 active:bg-rose-light/40'
                )}
              >
                <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
              </button>
            </div>
            <h1 className="flex-1 truncate text-center text-base font-semibold text-ink">
              电子同意书预览
            </h1>
            <div className="w-16" />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full max-w-md flex-col items-center rounded-[28px] bg-white p-12 text-center shadow-card"
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-ink-pale/10">
              <FileText className="h-10 w-10 text-ink-pale" strokeWidth={1.6} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-ink">
              同意书不存在或已删除
            </h2>
            <p className="mb-6 text-sm text-ink-light">
              该同意书记录可能已被移除，或您访问的链接已失效
            </p>
            <button
              onClick={handleBack}
              className="rounded-capsule bg-gradient-to-r from-rose-dark via-rose to-rose-light px-8 py-3 text-sm font-semibold text-white shadow-soft transition-all active:scale-[0.97]"
            >
              返回记录列表
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const recordNo = generateRecordNo(record.createdAt);
  const SignIcon = getSignMethodIcon(record.signMethod);
  const signMethodLabel = getSignMethodLabel(record.signMethod);

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-warmwhite via-white to-rose-light/15">
      <header className="sticky top-0 z-40 w-full border-b border-ink-pale/10 bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(45,42,50,0.04)]">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-5">
          <div className="flex w-24 items-center justify-start">
            <button
              onClick={handleBack}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-ink-light transition-colors',
                'hover:bg-warmwhite hover:text-ink',
                'active:scale-95 active:bg-rose-light/40'
              )}
            >
              <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
            </button>
          </div>
          <h1 className="flex-1 truncate text-center text-base font-bold text-ink">
            电子同意书预览
          </h1>
          <div className="flex w-24 items-center justify-end gap-1.5">
            <Sparkles className="h-4 w-4 text-rose" strokeWidth={2} />
            <span className="rounded-full bg-rose-light/40 px-3 py-1 text-xs font-medium text-rose-dark">
              {recordNo}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center overflow-hidden px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
          className={cn(
            'flex h-full max-h-full w-full max-w-[595px] flex-col',
            'rounded-[24px] bg-white',
            'shadow-[0_20px_60px_rgba(139,109,113,0.10),0_4px_16px_rgba(139,109,113,0.05)]'
          )}
        >
          <div className="flex flex-1 flex-col overflow-hidden px-10 py-8">
            <div className="shrink-0 text-center">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-rose-light/30 px-4 py-1.5">
                <FileText className="h-3.5 w-3.5 text-rose-dark" strokeWidth={2.2} />
                <span className="text-xs font-bold tracking-wider text-rose-dark">
                  悦美医美 · 术前知情同意书
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-ink-pale">
                编号：{recordNo}
              </p>
              <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-rose-light to-transparent" />
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-2">
              <div>
                <SectionHeader icon={User} title="患者基本信息" />
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-warmwhite/60 p-4">
                  <div>
                    <span className="text-xs font-medium text-ink-pale">姓名</span>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {record.patientName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-ink-pale">手机</span>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {maskPhone(record.phone)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-medium text-ink-pale">签署日期</span>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {formatDateCN(record.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <SectionDivider />

              <div>
                <SectionHeader icon={Target} title="治疗信息" />
                <div className="space-y-3 rounded-2xl bg-warmwhite/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-pale">项目名称</span>
                    <span className="text-sm font-semibold text-ink text-right">
                      {record.projectName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-pale">治疗部位</span>
                    <span className="text-sm font-semibold text-ink text-right">
                      {record.bodyPart}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-pale">麻醉方式</span>
                    <span className="text-sm font-semibold text-ink text-right">
                      {record.anesthesiaLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-pale">操作医生</span>
                    <span className="text-sm font-semibold text-ink text-right">
                      {record.doctorName}
                    </span>
                  </div>
                </div>
              </div>

              <SectionDivider />

              <div>
                <SectionHeader icon={ShieldAlert} title="风险告知阅读确认" />
                <div className="space-y-2 rounded-2xl bg-warmwhite/60 p-4">
                  {understoodRisksDetail.map((risk) => (
                    <div
                      key={risk.id}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(139,109,113,0.04)]"
                    >
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${risk.color}22` }}
                      >
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          style={{ color: risk.color }}
                          strokeWidth={2.8}
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-ink">
                          {risk.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{
                              backgroundColor: `${risk.color}22`,
                              color: risk.color,
                            }}
                          >
                            {risk.probability}
                          </span>
                          <span className="rounded-full bg-ink-pale/10 px-2 py-0.5 text-[10px] font-medium text-ink-light">
                            {risk.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 rounded-xl bg-mint/15 p-3">
                    <p className="text-xs font-semibold text-mint-dark">
                      ✓ 已全部阅读并理解以上 {understoodRisksDetail.length} 项风险
                    </p>
                  </div>
                </div>
              </div>

              <SectionDivider />

              <div>
                <SectionHeader icon={CheckSquare} title="健康情况勾选确认" />
                <div className="space-y-2 rounded-2xl bg-warmwhite/60 p-4">
                  {allConditions.map((cond) => {
                    const isChecked = checkedConditionIds.has(cond.id);
                    return (
                      <div
                        key={cond.id}
                        className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(139,109,113,0.04)]"
                      >
                        {isChecked ? (
                          <CheckSquare
                            className="h-5 w-5 shrink-0 text-rose"
                            strokeWidth={2.2}
                            fill="currentColor"
                            fillOpacity={0.12}
                          />
                        ) : (
                          <Square
                            className="h-5 w-5 shrink-0 text-ink-pale/50"
                            strokeWidth={1.8}
                          />
                        )}
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isChecked ? 'text-ink' : 'text-ink-light'
                          )}
                        >
                          {cond.label}
                        </span>
                      </div>
                    );
                  })}
                  {record.nurseReview.reviewedItems.length > 0 && (
                    <div className="mt-3 rounded-xl bg-amber/15 p-3">
                      <p className="text-xs font-semibold text-amber-dark">
                        ☑️ （若有上述选择，护士已当面复核）
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {record.nurseReview.reviewed && (
                <>
                  <SectionDivider />
                  <div>
                    <SectionHeader icon={Stethoscope} title="护士复核记录" />
                    <div className="space-y-3 rounded-2xl bg-mint/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-ink-pale">复核时间</span>
                        <span className="text-sm font-semibold text-mint-dark">
                          {formatDateShort(record.nurseReview.reviewedAt)}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="pt-0.5 text-xs font-medium text-ink-pale shrink-0">复核内容</span>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {record.nurseReview.reviewedItems.map((item, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-mint-dark shadow-[0_1px_3px_rgba(127,191,153,0.12)]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-ink-pale">复核护士</span>
                        <span className="text-sm font-semibold text-ink">
                          演示护士（0000）
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <SectionDivider />

              <div>
                <SectionHeader icon={Volume2} title="语音提醒播放确认" />
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl p-4',
                    record.voiceCompleted ? 'bg-mint/15' : 'bg-ink-pale/8'
                  )}
                >
                  {record.voiceCompleted ? (
                    <CheckCircle2
                      className="h-7 w-7 shrink-0 text-mint-dark"
                      strokeWidth={2.4}
                    />
                  ) : (
                    <XCircle
                      className="h-7 w-7 shrink-0 text-ink-pale"
                      strokeWidth={2.4}
                    />
                  )}
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      record.voiceCompleted ? 'text-mint-dark' : 'text-ink-light'
                    )}
                  >
                    {record.voiceCompleted
                      ? '✓ 已完整收听30秒术前语音提醒'
                      : '✗ 未完成语音提醒播放'}
                  </span>
                </div>
              </div>

              <SectionDivider />

              <div>
                <SectionHeader icon={SignIcon} title="确认方式 & 凭证" />
                <div className="space-y-4 rounded-2xl bg-warmwhite/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-light/60 to-rose/50 px-4 py-2">
                      <SignIcon className="h-4 w-4 text-rose-dark" strokeWidth={2.2} />
                      <span className="text-sm font-bold text-rose-dark">
                        {signMethodLabel}
                      </span>
                    </div>
                    <span className="rounded-full bg-mint/25 px-3 py-1 text-xs font-bold text-mint-dark">
                      已确认
                    </span>
                  </div>

                  {record.signMethod === 'handwrite' && record.handwriteData && (
                    <div className="flex justify-center rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(139,109,113,0.06)]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-ink-pale">手写签名</span>
                        <img
                          src={record.handwriteData}
                          alt="患者手写签名"
                          className="h-[90px] w-[180px] object-contain"
                          style={{ imageRendering: 'auto' }}
                        />
                      </div>
                    </div>
                  )}

                  {record.signMethod === 'handwrite' && !record.handwriteData && (
                    <div className="flex justify-center rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(139,109,113,0.06)]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-ink-pale">手写签名</span>
                        <div className="flex h-[72px] w-[180px] items-end justify-center border-b-2 border-ink-pale/30">
                          <span className="pb-1 text-sm font-semibold text-ink-pale">
                            {record.patientName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {record.signMethod === 'photo' && record.photoData && (
                    <div className="flex justify-center rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(139,109,113,0.06)]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-ink-pale">确认照片</span>
                        <img
                          src={record.photoData}
                          alt="患者确认照片"
                          className="h-[96px] w-[128px] rounded-lg object-cover border border-ink-pale/10"
                        />
                      </div>
                    </div>
                  )}

                  {record.signMethod === 'sms' && record.smsCode && (
                    <div className="rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(139,109,113,0.06)]">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-ink-pale">验证手机</span>
                        <span className="text-sm font-semibold text-ink">
                          {maskPhone(record.smsVerifiedPhone ?? record.phone)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-warmwhite p-3">
                        <span className="text-xs font-medium text-ink-pale">验证码末6位</span>
                        <span className="tracking-[0.4em] font-black text-lg text-rose-dark">
                          {record.smsCode.slice(-6)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <SectionDivider />

              <div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2 text-xs font-medium text-ink-pale">患者签名</p>
                    <div className="border-b-2 border-ink-pale/30 pt-4 pb-2 min-h-[52px] flex items-end">
                      <span className="text-sm font-semibold text-ink">
                        {record.patientName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-ink-pale">护士签名</p>
                    <div className="border-b-2 border-ink-pale/30 pt-4 pb-2 min-h-[52px] flex items-end">
                      <span className="text-sm font-semibold text-ink">
                        演示护士
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <p className="text-xs font-medium text-ink-pale">
                    日期：
                    <span className="font-semibold text-ink">
                      {formatDateShort(record.submittedAt ?? record.createdAt).slice(0, 10)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="my-8" />
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-ink-pale/10 bg-white/85 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-4">
          <button
            onClick={handleBack}
            className={cn(
              'flex items-center gap-2 rounded-capsule px-7 py-3.5 text-sm font-semibold transition-all active:scale-[0.97]',
              'bg-white text-ink-light border border-ink-pale/30 hover:bg-warmwhite'
            )}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            返回记录列表
          </button>
          <button
            onClick={handlePrint}
            className={cn(
              'flex items-center gap-2 rounded-capsule px-8 py-3.5 text-sm font-semibold transition-all active:scale-[0.97]',
              'bg-gradient-to-r from-rose-dark via-rose to-rose-light text-white shadow-[0_8px_24px_rgba(209,148,152,0.32)] hover:shadow-[0_10px_32px_rgba(209,148,152,0.4)]'
            )}
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
            打印预览
          </button>
        </div>
      </footer>

      <Toast message="已发送到护士站打印机" visible={toastVisible} />
    </div>
  );
}
