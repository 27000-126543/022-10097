import { create } from "zustand";
import type {
  Appointment,
  SignFlowState,
  SpecialCondition,
  SignMethod,
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
  setSignData: (data: string | null) => void;
  setSmsVerified: (v: boolean) => void;
  completeFlow: () => void;
  resetFlow: () => void;
  canProceedToSign: () => boolean;
}

function generateQueueNumber(): string {
  const n = Math.floor(Math.random() * 90) + 10;
  return `A${n}`;
}

const initialState: SignFlowState = {
  phone: "",
  appointment: null,
  understoodRisks: [],
  specialConditions: defaultConditions.map((c) => ({ ...c })),
  voiceCompleted: false,
  signMethod: null,
  signData: null,
  smsVerified: false,
  completed: false,
  queueNumber: "",
};

export const useSignFlowStore = create<SignFlowStore>((set, get) => ({
  ...initialState,

  setPhone: (phone) => set({ phone }),

  queryAppointment: () => {
    const { phone } = get();
    const apt = findAppointmentByPhone(phone);
    if (apt) set({ appointment: apt });
    return apt;
  },

  setAppointment: (apt) => set({ appointment: apt }),

  markRiskUnderstood: (riskId) =>
    set((s) => ({
      understoodRisks: s.understoodRisks.includes(riskId)
        ? s.understoodRisks
        : [...s.understoodRisks, riskId],
    })),

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
      return { specialConditions: next };
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
  setSignData: (data) => set({ signData: data }),
  setSmsVerified: (v) => set({ smsVerified: v }),

  completeFlow: () =>
    set({
      completed: true,
      queueNumber: generateQueueNumber(),
    }),

  resetFlow: () => set({ ...initialState, queueNumber: "" }),

  canProceedToSign: () => {
    const {
      voiceCompleted,
      signMethod,
      signData,
      smsVerified,
    } = get();
    if (!voiceCompleted) return false;
    if (!signMethod) return false;
    if (signMethod === "handwrite") return !!signData;
    if (signMethod === "photo") return !!signData;
    if (signMethod === "sms") return smsVerified;
    return false;
  },
}));
