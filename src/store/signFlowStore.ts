import { create } from "zustand";
import type {
  Appointment,
  SignFlowState,
  SpecialCondition,
  SignMethod,
  ConsentRecord,
  ConsentStatus,
  TimelineNode,
} from "@/types";
import { specialConditions as defaultConditions } from "@/data/mockFAQs";
import { findAppointmentByPhone } from "@/data/mockAppointments";

interface SignFlowStore extends SignFlowState {
  setPhone: (phone: string) => void;
  queryAppointment: () => Appointment | null;
  setAppointment: (apt: Appointment | null) => void;
  markRiskUnderstood: (riskId: string) => void;
  isRiskUnderstood: (riskId: string) => boolean;
  toggleSpecialCondition: (id: string) => void;
  hasCheckedSpecialCondition: () => boolean;
  resetSpecialConditions: () => void;
  setVoiceCompleted: (v: boolean) => void;
  setSignMethod: (method: SignMethod) => void;
  setHandwriteData: (data: string | null) => void;
  setPhotoData: (data: string | null) => void;
  setSmsCode: (code: string | null) => void;
  setSmsExpiredAt: (ts: number | null) => void;
  setSmsVerified: (v: boolean) => void;
  setNurseReview: (items: string[]) => void;
  completeFlow: () => void;
  resetFlow: () => void;
  fullReset: () => void;
  canProceedToSign: () => boolean;
  addConsentRecord: (rec: ConsentRecord) => void;
  updateConsentRecordStatus: (id: string, status: ConsentStatus) => void;
  findConsentRecordById: (id: string) => ConsentRecord | undefined;
  resetNurseReview: () => void;
  checkSmsValidNow: () => boolean;
}

const CONSENT_RECORDS_KEY = "yuemei_consent_records";

function loadConsentRecords(): ConsentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONSENT_RECORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ConsentRecord[];
  } catch {
    return [];
  }
}

function saveConsentRecords(records: ConsentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_RECORDS_KEY, JSON.stringify(records));
  } catch {
  }
}

function generateQueueNumber(): string {
  const n = Math.floor(Math.random() * 90) + 10;
  return `A${n}`;
}

const initialTimelineDraft = {
  queryAt: null,
  allRisksReadAt: null,
  qaCompletedAt: null,
  nurseReviewedAt: null,
};

const initialState: SignFlowState = {
  phone: "",
  appointment: null,
  understoodRisks: [],
  specialConditions: defaultConditions.map((c) => ({ ...c })),
  voiceCompleted: false,
  signMethod: null,
  handwriteData: null,
  photoData: null,
  smsVerified: false,
  smsCode: null,
  smsExpiredAt: null,
  completed: false,
  queueNumber: "",
  nurseReview: {
    reviewed: false,
    reviewedAt: null,
    reviewedItems: [],
  },
  confirmedSignMethod: null,
  consentRecords: loadConsentRecords(),
  timelineDraft: { ...initialTimelineDraft },
};

export const useSignFlowStore = create<SignFlowStore>((set, get) => ({
  ...initialState,

  setPhone: (phone) =>
    set({
      phone,
      timelineDraft: { ...initialTimelineDraft },
    }),

  queryAppointment: () => {
    const { phone } = get();
    const apt = findAppointmentByPhone(phone);
    if (apt) {
      set({
        appointment: apt,
        timelineDraft: {
          ...get().timelineDraft,
          queryAt: new Date().toISOString(),
        },
      });
    }
    return apt;
  },

  setAppointment: (apt) => set({ appointment: apt }),

  markRiskUnderstood: (riskId) =>
    set((s) => {
      const nextUnderstood = s.understoodRisks.includes(riskId)
        ? s.understoodRisks
        : [...s.understoodRisks, riskId];
      const nextTimelineDraft = { ...s.timelineDraft };
      if (
        nextUnderstood.length === 4 &&
        !nextTimelineDraft.allRisksReadAt
      ) {
        nextTimelineDraft.allRisksReadAt = new Date().toISOString();
      }
      return {
        understoodRisks: nextUnderstood,
        timelineDraft: nextTimelineDraft,
      };
    }),

  isRiskUnderstood: (riskId) =>
    get().understoodRisks.includes(riskId),

  toggleSpecialCondition: (id) =>
    set((s) => {
      const target = s.specialConditions.find((c) => c.id === id);
      if (!target) return {};
      const isNone = id === "sc-6";
      const next = s.specialConditions.map((c) => {
        if (c.id === id) return { ...c, checked: !c.checked };
        if (isNone && !c.checked) return { ...c, checked: false };
        if (!isNone && id !== "sc-6" && c.id === "sc-6" && c.checked)
          return { ...c, checked: false };
        return c;
      }) as SpecialCondition[];
      if (isNone) {
        next.forEach((c) => {
          if (c.id !== "sc-6") c.checked = false;
        });
      }
      let nurseReview = s.nurseReview;
      if (s.nurseReview.reviewed) {
        const oldSet = new Set(
          s.specialConditions
            .filter((c) => c.checked && c.needNurseReview)
            .map((c) => c.id)
        );
        const newSet = new Set(
          next.filter((c) => c.checked && c.needNurseReview).map((c) => c.id)
        );
        const setsEqual =
          oldSet.size === newSet.size &&
          [...oldSet].every((x) => newSet.has(x));
        if (!setsEqual) {
          nurseReview = {
            reviewed: false,
            reviewedAt: null,
            reviewedItems: [],
          };
        }
      }
      const nextTimelineDraft = { ...s.timelineDraft };
      const hasAnyChecked = next.some((c) => c.checked);
      if (hasAnyChecked && !nextTimelineDraft.qaCompletedAt) {
        nextTimelineDraft.qaCompletedAt = new Date().toISOString();
      }
      return {
        specialConditions: next,
        nurseReview,
        timelineDraft: nextTimelineDraft,
      };
    }),

  hasCheckedSpecialCondition: () =>
    get().specialConditions.some(
      (c) => c.checked && c.needNurseReview
    ),

  resetSpecialConditions: () =>
    set({
      specialConditions: defaultConditions.map((c) => ({ ...c })),
    }),

  setVoiceCompleted: (v) => set({ voiceCompleted: v }),
  setSignMethod: (method) => set({ signMethod: method }),
  setHandwriteData: (data) => set({ handwriteData: data }),
  setPhotoData: (data) => set({ photoData: data }),
  setSmsCode: (code) => set({ smsCode: code }),
  setSmsExpiredAt: (ts) => set({ smsExpiredAt: ts }),
  setSmsVerified: (v) => set({ smsVerified: v }),

  setNurseReview: (reviewedItems) =>
    set({
      nurseReview: {
        reviewed: reviewedItems.length > 0,
        reviewedAt: reviewedItems.length > 0 ? new Date().toISOString() : null,
        reviewedItems,
      },
      timelineDraft: {
        ...get().timelineDraft,
        nurseReviewedAt:
          reviewedItems.length > 0 ? new Date().toISOString() : null,
      },
    }),

  completeFlow: () => {
    const state = get();
    const qn = generateQueueNumber();
    const finalSignMethod = (state.confirmedSignMethod || state.signMethod)!;
    const hasNeedNurseReview = state.specialConditions.some(
      (c) => c.checked && c.needNurseReview
    );
    let status: ConsentStatus;
    if (state.nurseReview.reviewed) {
      status = "completed";
    } else if (hasNeedNurseReview) {
      status = "pending_review";
    } else {
      status = "called";
    }
    const timelineDraft = state.timelineDraft;
    const nurseReview = state.nurseReview;
    const riskCount = state.understoodRisks.length;
    const timeline: TimelineNode[] = [
      {
        key: "query_appointment",
        title: "查询预约",
        iconName: "Search",
        completedAt: timelineDraft.queryAt,
      },
      {
        key: "read_risks",
        title: `阅读风险（${riskCount}/${riskCount}）`,
        iconName: "ClipboardCheck",
        completedAt: timelineDraft.allRisksReadAt,
      },
      {
        key: "answer_qa",
        title: "勾选问答",
        iconName: "ListChecks",
        completedAt: timelineDraft.qaCompletedAt,
      },
      {
        key: "nurse_review",
        title: "护士复核（如适用）",
        iconName: "Stethoscope",
        completedAt:
          timelineDraft.nurseReviewedAt ||
          (nurseReview.reviewed ? nurseReview.reviewedAt : null),
        skipped: !hasNeedNurseReview,
      },
      {
        key: "submit_signature",
        title: "提交签名",
        iconName: "PenLine",
        completedAt: new Date().toISOString(),
      },
    ];
    const rec: ConsentRecord = {
      id: `CR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      patientName: state.appointment?.patientName || "",
      phone: state.phone,
      projectName: state.appointment?.projectName || "",
      projectCode: state.appointment?.projectCode || "",
      bodyPart: state.appointment?.bodyPart || "",
      anesthesiaLabel: state.appointment?.anesthesiaLabel || "",
      doctorName: state.appointment?.doctor.name || "",
      queueNumber: qn,
      status,
      understoodRisks: [...state.understoodRisks],
      checkedConditions: state.specialConditions
        .filter((c) => c.checked)
        .map((c) => ({
          id: c.id,
          label: c.label,
          needNurseReview: c.needNurseReview,
        })),
      nurseReview: { ...state.nurseReview },
      signMethod: finalSignMethod,
      handwriteData:
        finalSignMethod === "handwrite" ? state.handwriteData : undefined,
      photoData: finalSignMethod === "photo" ? state.photoData : undefined,
      smsCode: finalSignMethod === "sms" ? state.smsCode : undefined,
      smsVerifiedPhone:
        finalSignMethod === "sms" && state.smsVerified ? state.phone : undefined,
      voiceCompleted: state.voiceCompleted,
      submittedAt: new Date().toISOString(),
      timeline,
    };
    const nextRecords = [rec, ...state.consentRecords];
    saveConsentRecords(nextRecords);
    set({
      completed: true,
      queueNumber: qn,
      confirmedSignMethod: finalSignMethod,
      consentRecords: nextRecords,
    });
  },

  resetFlow: () =>
    set({
      phone: initialState.phone,
      appointment: initialState.appointment,
      understoodRisks: initialState.understoodRisks,
      specialConditions: initialState.specialConditions.map((c) => ({ ...c })),
      voiceCompleted: initialState.voiceCompleted,
      signMethod: initialState.signMethod,
      handwriteData: initialState.handwriteData,
      photoData: initialState.photoData,
      smsVerified: initialState.smsVerified,
      smsCode: initialState.smsCode,
      smsExpiredAt: initialState.smsExpiredAt,
      completed: initialState.completed,
      queueNumber: initialState.queueNumber,
      nurseReview: {
        ...initialState.nurseReview,
      },
      confirmedSignMethod: initialState.confirmedSignMethod,
      timelineDraft: { ...initialTimelineDraft },
    }),

  fullReset: () => set({ ...initialState }),

  canProceedToSign: () => {
    const {
      voiceCompleted,
      signMethod,
      handwriteData,
      photoData,
      smsVerified,
    } = get();
    if (!voiceCompleted) return false;
    if (!signMethod) return false;
    if (signMethod === "handwrite") return !!handwriteData;
    if (signMethod === "photo") return !!photoData;
    if (signMethod === "sms") {
      if (!smsVerified) return false;
      if (!get().checkSmsValidNow()) {
        set({
          smsVerified: false,
          smsCode: null,
          smsExpiredAt: null,
        });
        return false;
      }
      return true;
    }
    return false;
  },

  addConsentRecord: (rec) => {
    const nextRecords = [rec, ...get().consentRecords];
    saveConsentRecords(nextRecords);
    set({
      consentRecords: nextRecords,
    });
  },

  updateConsentRecordStatus: (id, status) => {
    const nextRecords = get().consentRecords.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    saveConsentRecords(nextRecords);
    set({
      consentRecords: nextRecords,
    });
  },

  findConsentRecordById: (id) =>
    get().consentRecords.find((r) => r.id === id),

  resetNurseReview: () =>
    set({
      nurseReview: {
        reviewed: false,
        reviewedAt: null,
        reviewedItems: [],
      },
    }),

  checkSmsValidNow: () => {
    const { smsVerified, smsExpiredAt } = get();
    if (!smsVerified) return false;
    if (!smsExpiredAt) return false;
    return Date.now() < smsExpiredAt;
  },
}));
