import { useState, useEffect, useMemo, useRef } from 'react';
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
  Clock,
  Filter,
  RotateCcw,
  X,
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

type TimeRangeKey = 'all' | 'today' | 'last1h' | 'morning' | 'afternoon';

const timeRangeOptions: { key: TimeRangeKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今天' },
  { key: 'last1h', label: '近1小时' },
  { key: 'morning', label: '上午' },
  { key: 'afternoon', label: '下午' },
];

const statusFilterOptions: { key: ConsentStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部状态' },
  { key: 'pending_review', label: '待复核' },
  { key: 'called', label: '已叫号' },
  { key: 'completed', label: '已完成' },
];

const nurseReviewRiskLabels = [
  '孕期或哺乳期',
  '瘢痕体质',
  '近期服药',
  '过敏史',
  '近期手术史',
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

function isInTimeRange(iso: string | null, range: TimeRangeKey, now: Date): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  switch (range) {
    case 'all':
      return true;
    case 'today':
      return d >= todayStart && d < todayEnd;
    case 'last1h':
      return d >= oneHourAgo && d <= now;
    case 'morning':
      return d >= todayStart && d < noon;
    case 'afternoon':
      return d >= noon && d <= now;
    default:
      return true;
  }
}

function isUrgent(r: ConsentRecord): boolean {
  if (r.status === 'pending_review') {
    const mins = (Date.now() - new Date(r.submittedAt || 0).getTime()) / 60000;
    if (mins > 30) return true;
  }
  const pregnancyLabels = ['孕期或哺乳期', '孕', '哺乳'];
  if (r.checkedConditions.some((c) => pregnancyLabels.some((p) => c.label.includes(p)))) {
    return true;
  }
  const needCount = r.checkedConditions.filter((c) => c.needNurseReview).length;
  if (needCount >= 2) return true;
  return false;
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

interface DropdownOption {
  key: string;
  label: string;
}

interface DropdownProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: DropdownOption[];
  onChange: (key: string) => void;
}

function Dropdown({ label, icon, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.key === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold',
          'bg-white border border-rose-light/40 text-ink hover:bg-warmwhite transition-all shadow-card'
        )}
      >
        {icon}
        <span className="text-ink-pale font-medium">{label}</span>
        <span className="text-ink">{selected?.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-ink-pale" strokeWidth={2} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
            className="absolute top-full left-0 mt-2 min-w-[160px] bg-white rounded-2xl shadow-soft border border-rose-light/30 py-2 z-50 overflow-hidden"
          >
            {options.map((opt) => {
              const active = opt.key === value;
              return (
                <motion.button
                  key={opt.key}
                  whileHover={{ backgroundColor: 'rgba(243, 209, 212, 0.3)' }}
                  onClick={() => {
                    onChange(opt.key);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm font-medium transition-colors flex items-center justify-between gap-3',
                    active ? 'text-rose-dark bg-rose-light/20' : 'text-ink-light hover:text-ink'
                  )}
                >
                  <span>{opt.label}</span>
                  {active && <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NurseRecordsPage() {
  const navigate = useNavigate();
  const consentRecords = useSignFlowStore((s) => s.consentRecords);
  const updateStatus = useSignFlowStore((s) => s.updateConsentRecordStatus);

  const [now, setNow] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<ConsentStatus>('pending_review');

  const [timeRange, setTimeRange] = useState<TimeRangeKey>('today');
  const [statusFilter, setStatusFilter] = useState<ConsentStatus | 'all'>('all');
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());

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

  const effectiveStatusFilter = statusFilter === 'all' ? activeTab : statusFilter;

  const filteredRecords = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    let list = consentRecords.filter((r) => r.status === effectiveStatusFilter);

    list = list.filter((r) => isInTimeRange(r.submittedAt, timeRange, now));

    if (selectedRisks.size > 0) {
      list = list.filter((r) => {
        const nurseRisks = r.checkedConditions.filter((c) => c.needNurseReview);
        return nurseRisks.some((c) =>
          Array.from(selectedRisks).some((sel) => c.label.includes(sel) || sel.includes(c.label))
        );
      });
    }

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
  }, [consentRecords, effectiveStatusFilter, timeRange, selectedRisks, searchText, now]);

  const urgentRecords = useMemo(
    () => filteredRecords.filter(isUrgent),
    [filteredRecords]
  );
  const laterRecords = useMemo(
    () => filteredRecords.filter((r) => !isUrgent(r)),
    [filteredRecords]
  );

  const handleMarkComplete = (id: string) => {
    updateStatus(id, 'completed');
  };

  const handleResetFilters = () => {
    setTimeRange('today');
    setStatusFilter('all');
    setSelectedRisks(new Set());
  };

  const toggleRisk = (label: string) => {
    setSelectedRisks((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const activeIdx = tabList.findIndex((t) => t.key === activeTab);
  const indicatorLeft = tabList
    .slice(0, activeIdx)
    .reduce((sum, t) => sum + t.width, 0);
  const indicatorWidth = tabList[activeIdx].width;

  const shouldGroup = activeTab === 'pending_review' || activeTab === 'called';

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
        className="shrink-0 px-6 xl:px-10 pt-5"
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="shrink-0 px-6 xl:px-10 pt-4 pb-3"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-sm rounded-[28px] p-3 border border-rose-light/30 shadow-card">
            <div className="flex items-center gap-2 px-2">
              <Filter className="w-4 h-4 text-rose-dark" strokeWidth={2} />
              <span className="text-sm font-semibold text-ink">筛选</span>
            </div>

            <Dropdown
              label="时间段"
              icon={<Clock className="w-4 h-4 text-amber-dark" strokeWidth={2} />}
              value={timeRange}
              options={timeRangeOptions}
              onChange={(v) => setTimeRange(v as TimeRangeKey)}
            />

            <Dropdown
              label="状态"
              value={statusFilter}
              options={statusFilterOptions}
              onChange={(v) => setStatusFilter(v as ConsentStatus | 'all')}
            />

            <div className="h-6 w-px bg-ink-pale/20 mx-1" />

            <div className="flex flex-wrap items-center gap-2">
              <AnimatePresence mode="popLayout">
                {nurseReviewRiskLabels.map((label) => {
                  const active = selectedRisks.has(label);
                  return (
                    <motion.button
                      key={label}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggleRisk(label)}
                      className={cn(
                        'relative inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold transition-all duration-200',
                        active
                          ? 'bg-amber text-white shadow-soft shadow-amber/30'
                          : 'bg-warmwhite text-ink-pale border border-ink-pale/15 hover:border-rose-light/50 hover:text-ink-light'
                      )}
                    >
                      <span>{label}</span>
                      {active && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0, rotate: 90 }}
                          className="inline-flex items-center justify-center"
                        >
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ x: -2 }}
              onClick={handleResetFilters}
              className={cn(
                'inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-bold transition-all',
                'bg-warmwhite border border-rose-light/40 text-ink-light hover:bg-rose-light/40 hover:text-rose-dark shadow-card'
              )}
            >
              <motion.div
                animate={{ rotate: selectedRisks.size > 0 || timeRange !== 'today' || statusFilter !== 'all' ? 360 : 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                key={`${selectedRisks.size}-${timeRange}-${statusFilter}`}
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
              </motion.div>
              重置筛选
            </motion.button>
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
                className="space-y-5"
              >
                {shouldGroup ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="overflow-hidden rounded-[20px] bg-gradient-to-br from-rose via-rose-dark to-rose-light/80 shadow-card"
                    >
                      <div className="px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm">
                            <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.2} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-wide">
                              🔴 马上处理
                            </h2>
                            <p className="text-white/80 text-xs mt-0.5 font-medium">
                              pending超过30分钟 · 孕期/哺乳期 · 2项以上风险叠加
                            </p>
                          </div>
                        </div>
                        <motion.div
                          key={urgentRecords.length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className="flex items-center justify-center min-w-[60px] h-[60px] rounded-full bg-white text-rose-dark shadow-soft"
                        >
                          <span className="text-3xl font-black">{urgentRecords.length}</span>
                          <span className="text-xs font-bold ml-0.5 -mt-2">位</span>
                        </motion.div>
                      </div>
                      {urgentRecords.length > 0 ? (
                        <div className="bg-white/95 backdrop-blur-sm px-5 pb-5 pt-2 border-t border-white/30">
                          <div className="space-y-4">
                            {urgentRecords.map((record, i) => (
                              <RecordCard
                                key={record.id}
                                record={record}
                                index={i}
                                onMarkComplete={handleMarkComplete}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/95 backdrop-blur-sm px-5 py-6 border-t border-white/30">
                          <div className="flex items-center justify-center gap-2 text-ink-pale py-4">
                            <CheckCircle2 className="w-5 h-5 text-mint-dark" strokeWidth={2.2} />
                            <span className="text-sm font-semibold">暂无紧急处理项，状态良好</span>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
                      className="overflow-hidden rounded-[20px] bg-gradient-to-br from-amber via-amber-dark to-amber/80 shadow-card"
                    >
                      <div className="px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm">
                            <Clock className="w-6 h-6 text-white" strokeWidth={2.2} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-wide">
                              🟡 可稍后处理
                            </h2>
                            <p className="text-white/80 text-xs mt-0.5 font-medium">
                              其余待复核 / 已叫号记录
                            </p>
                          </div>
                        </div>
                        <motion.div
                          key={laterRecords.length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.05 }}
                          className="flex items-center justify-center min-w-[60px] h-[60px] rounded-full bg-white text-amber-dark shadow-soft"
                        >
                          <span className="text-3xl font-black">{laterRecords.length}</span>
                          <span className="text-xs font-bold ml-0.5 -mt-2">位</span>
                        </motion.div>
                      </div>
                      {laterRecords.length > 0 ? (
                        <div className="bg-white/95 backdrop-blur-sm px-5 pb-5 pt-2 border-t border-white/30">
                          <div className="space-y-4">
                            {laterRecords.map((record, i) => (
                              <RecordCard
                                key={record.id}
                                record={record}
                                index={i}
                                onMarkComplete={handleMarkComplete}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/95 backdrop-blur-sm px-5 py-6 border-t border-white/30">
                          <div className="flex items-center justify-center gap-2 text-ink-pale py-4">
                            <CheckCircle2 className="w-5 h-5 text-mint-dark" strokeWidth={2.2} />
                            <span className="text-sm font-semibold">暂无待处理项</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </>
                ) : (
                  <div className="space-y-4 xl:space-y-5">
                    {filteredRecords.map((record, i) => (
                      <RecordCard
                        key={record.id}
                        record={record}
                        index={i}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))}
                  </div>
                )}
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
                    暂无匹配的签署记录
                  </h3>
                  <p className="text-ink-light text-sm">
                    {searchText
                      ? '未找到匹配的签署记录，请尝试其他关键词'
                      : selectedRisks.size > 0 || timeRange !== 'today' || statusFilter !== 'all'
                      ? '当前筛选条件下无数据，试试重置筛选'
                      : `${statusConfig[effectiveStatusFilter as ConsentStatus].label}状态下暂无数据`}
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
