import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  Search,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  CircleCheck,
  MessageSquare,
  Volume2,
  VolumeX,
  Eye,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSignFlowStore } from '@/store/signFlowStore';
import type { ConsentRecord, ConsentStatus } from '@/types';

const statusConfig: Record<
  ConsentStatus,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    dotBg: string;
  }
> = {
  pending_review: {
    label: '待复核',
    badgeBg: 'bg-amber/20',
    badgeText: 'text-amber-dark',
    dotBg: 'bg-amber-dark',
  },
  called: {
    label: '已叫号',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-600',
    dotBg: 'bg-sky-500',
  },
  completed: {
    label: '已完成',
    badgeBg: 'bg-mint/30',
    badgeText: 'text-mint-dark',
    dotBg: 'bg-mint-dark',
  },
};

const tabList: { key: ConsentStatus; label: string; width: number }[] = [
  { key: 'pending_review', label: '待复核', width: 140 },
  { key: 'called', label: '已叫号', width: 132 },
  { key: 'completed', label: '已完成', width: 132 },
];

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

function formatTime(iso: string | null): string {
  if (!iso) return '--:--';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const w = weekDays[d.getDay()];
  return `${y}年${m}月${day}日 周${w} ${hh}:${mm}`;
}

interface RecordCardProps {
  record: ConsentRecord;
  index: number;
  onMarkComplete: (id: string) => void;
}

function RecordCard({ record, index, onMarkComplete }: RecordCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[record.status];

  const signMethodLabel: Record<string, string> = {
    handwrite: '手写签名',
    photo: '拍照签名',
    sms: '短信验证',
  };

  const riskIcons = [0, 1, 2, 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.25, 0.8, 0.25, 1],
      }}
      className="w-full"
    >
      <div className="bg-white rounded-[24px] shadow-card border border-rose-light/20 overflow-hidden">
        <div className="p-5 xl:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-ink truncate">
                  {record.patientName}
                </h3>
                <span className="text-sm text-ink-light font-medium">
                  {maskPhone(record.phone)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-light/40 text-ink">
                  {record.projectName}
                </span>
                <span className="text-sm text-ink-light">
                  操作医生：{record.doctorName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold',
                    cfg.badgeBg,
                    cfg.badgeText
                  )}
                >
                  {cfg.label}
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warmwhite text-ink font-bold text-sm shadow-card border border-rose-light/30">
                  {record.queueNumber}
                </span>
              </div>
              <span className="text-xs text-ink-pale font-medium">
                {formatTime(record.submittedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-ink-pale/10">
            <button
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-semibold transition-all duration-200',
                'bg-rose-light/50 text-ink hover:bg-rose-light active:scale-[0.98]'
              )}
            >
              <Eye className="w-4 h-4" strokeWidth={2} />
              查看详情
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2.2} />
              </motion.div>
            </button>

            <button
              onClick={() => navigate(`/consent-preview/${record.id}`)}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-semibold transition-all duration-200 bg-white text-ink-light border border-ink-pale/30 hover:bg-warmwhite active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" strokeWidth={2} />
              查看同意书
              <ChevronRight className="w-4 h-4" strokeWidth={2.2} />
            </button>

            {record.status === 'called' && (
              <button
                onClick={() => onMarkComplete(record.id)}
                className="ml-auto inline-flex items-center gap-1.5 h-10 px-6 rounded-full text-sm font-bold transition-all duration-200 bg-gradient-to-r from-mint to-mint-dark text-white shadow-soft hover:shadow-pressed active:scale-[0.98]"
              >
                <CircleCheck className="w-4 h-4" strokeWidth={2.2} />
                标记为完成
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expand"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 xl:px-6 pb-6 pt-2 border-t border-ink-pale/10 bg-warmwhite/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-rose-light/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-light/40 text-ink text-xs font-bold">
                        项
                      </span>
                      <h4 className="text-sm font-bold text-ink">项目信息</h4>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex gap-2">
                        <span className="text-ink-pale shrink-0 w-16">
                          项目：
                        </span>
                        <span className="text-ink font-medium">
                          {record.projectName}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-ink-pale shrink-0 w-16">
                          部位：
                        </span>
                        <span className="text-ink">{record.bodyPart}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-ink-pale shrink-0 w-16">
                          麻醉：
                        </span>
                        <span className="text-ink">
                          {record.anesthesiaLabel}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-ink-pale shrink-0 w-16">
                          医生：
                        </span>
                        <span className="text-ink">{record.doctorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-rose-light/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-light/40 text-ink text-xs font-bold">
                        风
                      </span>
                      <h4 className="text-sm font-bold text-ink">风险阅读</h4>
                    </div>
                    <div className="flex items-center gap-5">
                      {riskIcons.map((i) => {
                        const done = i < record.understoodRisks.length;
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <div
                              className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                                done
                                  ? 'bg-mint/30 text-mint-dark'
                                  : 'bg-gray-100 text-gray-400'
                              )}
                            >
                              {done ? (
                                <CheckCircle2
                                  className="w-5 h-5"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <CheckCircle2
                                  className="w-5 h-5"
                                  strokeWidth={2}
                                />
                              )}
                            </div>
                            <span
                              className={cn(
                                'text-xs font-medium',
                                done ? 'text-mint-dark' : 'text-ink-pale'
                              )}
                            >
                              {done ? '已理解' : '未读'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-xs text-ink-pale">
                      共 {record.understoodRisks.length} / 4 项已确认理解
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-rose-light/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-light/40 text-ink text-xs font-bold">
                        勾
                      </span>
                      <h4 className="text-sm font-bold text-ink">勾选情况</h4>
                    </div>
                    {record.checkedConditions.length > 0 ? (
                      <ul className="space-y-2">
                        {record.checkedConditions.map((c) => (
                          <li
                            key={c.id}
                            className={cn(
                              'flex items-start gap-2 text-sm',
                              c.needNurseReview && 'text-amber-dark'
                            )}
                          >
                            {c.needNurseReview && (
                              <AlertTriangle
                                className="w-4 h-4 mt-0.5 shrink-0"
                                strokeWidth={2}
                              />
                            )}
                            <span className="font-medium">{c.label}</span>
                            {c.needNurseReview && (
                              <span className="text-xs bg-amber/30 px-1.5 py-0.5 rounded font-semibold">
                                需复核
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-ink-pale">
                        无特殊勾选情况
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-rose-light/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-light/40 text-ink text-xs font-bold">
                        护
                      </span>
                      <h4 className="text-sm font-bold text-ink">护士复核</h4>
                    </div>
                    {record.nurseReview.reviewed ? (
                      <>
                        <div className="text-sm text-ink font-medium mb-2">
                          复核人：演示护士(0000)
                        </div>
                        <div className="text-xs text-ink-light mb-2">
                          时间：{formatTime(record.nurseReview.reviewedAt)}
                        </div>
                        {record.nurseReview.reviewedItems.length > 0 && (
                          <ul className="space-y-1">
                            {record.nurseReview.reviewedItems.map(
                              (item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-1.5 text-xs text-ink-light"
                                >
                                  <CheckCircle2
                                    className="w-3.5 h-3.5 text-mint-dark shrink-0 mt-0.5"
                                    strokeWidth={2.5}
                                  />
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-amber-dark font-semibold flex items-center gap-1.5">
                        <AlertTriangle
                          className="w-4 h-4"
                          strokeWidth={2}
                        />
                        暂未复核，请尽快处理
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-rose-light/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-light/40 text-ink text-xs font-bold">
                        签
                      </span>
                      <h4 className="text-sm font-bold text-ink">确认方式</h4>
                    </div>
                    <div className="text-sm text-ink-light font-semibold mb-3">
                      {signMethodLabel[record.signMethod] || '—'}
                    </div>
                    {record.signMethod === 'handwrite' &&
                      record.handwriteData && (
                        <img
                          src={record.handwriteData}
                          alt="手写签名"
                          className="w-[120px] h-[60px] object-cover rounded-lg border border-ink-pale/20 bg-white"
                        />
                      )}
                    {record.signMethod === 'photo' && record.photoData && (
                      <img
                        src={record.photoData}
                        alt="拍照签名"
                        className="w-[120px] h-[60px] object-cover rounded-lg border border-ink-pale/20 bg-white"
                      />
                    )}
                    {record.signMethod === 'sms' && (
                      <div className="flex items-center gap-2">
                        <MessageSquare
                          className="w-5 h-5 text-sky-600"
                          strokeWidth={2}
                        />
                        <div>
                          <div className="text-sm text-ink font-medium">
                            {record.smsVerifiedPhone
                              ? maskPhone(record.smsVerifiedPhone)
                              : '-'}
                          </div>
                          {record.smsCode && (
                            <div className="text-xs text-ink-light">
                              验证码末6位：{record.smsCode.slice(-6)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-rose-light/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-light/40 text-ink text-xs font-bold">
                        语
                      </span>
                      <h4 className="text-sm font-bold text-ink">语音播放</h4>
                    </div>
                    {record.voiceCompleted ? (
                      <div className="flex items-center gap-2 text-mint-dark font-semibold">
                        <Volume2 className="w-5 h-5" strokeWidth={2.2} />
                        <span>✓ 已播放</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-dark font-semibold">
                        <VolumeX className="w-5 h-5" strokeWidth={2.2} />
                        <span>✗ 未播放</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function NurseRecordsPage() {
  const navigate = useNavigate();
  const consentRecords = useSignFlowStore((s) => s.consentRecords);
  const updateStatus = useSignFlowStore((s) => s.updateConsentRecordStatus);

  const [now, setNow] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<ConsentStatus>('pending_review');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const counts = useMemo(
    () => ({
      pending_review: consentRecords.filter(
        (r) => r.status === 'pending_review'
      ).length,
      called: consentRecords.filter((r) => r.status === 'called').length,
      completed: consentRecords.filter((r) => r.status === 'completed').length,
    }),
    [consentRecords]
  );

  const filteredRecords = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    let list = consentRecords.filter((r) => r.status === activeTab);
    if (kw) {
      list = list.filter(
        (r) =>
          r.phone.includes(searchText.trim()) ||
          r.patientName.toLowerCase().includes(kw)
      );
    }
    return list.sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    });
  }, [consentRecords, activeTab, searchText]);

  const handleMarkComplete = (id: string) => {
    updateStatus(id, 'completed');
  };

  const activeIdx = tabList.findIndex((t) => t.key === activeTab);
  const indicatorLeft = tabList
    .slice(0, activeIdx)
    .reduce((sum, t) => sum + t.width, 0);
  const indicatorWidth = tabList[activeIdx].width;

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-warmwhite via-white to-rose-light/10 flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="shrink-0 bg-white/85 backdrop-blur-sm border-b border-rose-light/30 px-6 xl:px-10 py-4 shadow-sm z-10"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-rose-light/50 text-ink font-semibold text-sm hover:bg-rose-light transition-all active:scale-[0.97]"
              >
                <ArrowLeft className="w-4.5 h-4.5" strokeWidth={2.2} />
                返回
              </button>
              <h1 className="text-lg xl:text-xl font-bold text-ink tracking-wide">
                护士工作站 · 今日签署记录
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-ink-light bg-warmwhite px-4 py-2 rounded-full border border-rose-light/30">
                {formatDateTime(now)}
              </div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold text-ink-light bg-white border border-ink-pale/30 hover:bg-warmwhite transition-all active:scale-[0.97]"
              >
                <Home className="w-4 h-4" strokeWidth={2} />
                返回首页
              </button>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-pale"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索手机号或姓名"
                className="w-full h-11 pl-11 pr-4 rounded-full bg-warmwhite border border-rose-light/40 text-ink placeholder:text-ink-pale placeholder:font-medium outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose/50 transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="shrink-0 px-6 xl:px-10 py-5"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="relative inline-flex p-1.5 rounded-full bg-warmwhite border border-rose-light/30 shadow-card">
            <motion.div
              layoutId="nurse-tab-indicator"
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-rose-dark via-rose to-rose-light shadow-soft pointer-events-none"
              animate={{
                width: indicatorWidth - 12,
                left: 6 + indicatorLeft,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
            {tabList.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ width: tab.width }}
                  className="relative z-10 inline-flex items-center justify-center gap-2 h-11 rounded-full font-bold text-sm transition-colors duration-200"
                >
                  <span
                    className={
                      isActive
                        ? 'text-white drop-shadow-sm'
                        : 'text-ink-light'
                    }
                  >
                    {tab.label}
                  </span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold',
                        isActive
                          ? 'bg-white/30 text-white'
                          : cn(statusConfig[tab.key].dotBg, 'text-white')
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <main className="flex-1 min-h-0 overflow-y-auto px-6 xl:px-10 pb-8">
        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            {filteredRecords.length > 0 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 xl:space-y-5"
              >
                {filteredRecords.map((record, i) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    index={i}
                    onMarkComplete={handleMarkComplete}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-center py-20"
              >
                <div className="flex flex-col items-center text-center px-10 py-14 bg-white rounded-[32px] shadow-card border border-rose-light/20 max-w-md w-full">
                  <div className="w-20 h-20 rounded-full bg-rose-light/40 flex items-center justify-center mb-6">
                    <ClipboardList
                      className="w-10 h-10 text-rose-dark"
                      strokeWidth={1.8}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">
                    今日暂无签署记录
                  </h3>
                  <p className="text-ink-light text-sm">
                    {searchText
                      ? '未找到匹配的签署记录，请尝试其他关键词'
                      : `${statusConfig[activeTab].label}状态下暂无数据`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
