export interface Doctor {
  name: string;
  title: string;
  avatar: string;
}

export interface Precaution {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "before" | "after";
}

export interface Appointment {
  id: string;
  phone: string;
  patientName: string;
  projectName: string;
  projectCode: string;
  bodyPart: string;
  anesthesiaType: "none" | "surface" | "local" | "general";
  anesthesiaLabel: string;
  recoveryDays: number;
  appointmentTime: string;
  doctor: Doctor;
  precautions: Precaution[];
}

export interface RiskPoint {
  id: string;
  title: string;
  description: string;
  probability: "高" | "中" | "低";
  duration: string;
  solution: string;
  illustration: string;
  color: string;
}

export interface SpecialCondition {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  needNurseReview: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type SignMethod = "handwrite" | "photo" | "sms" | null;

export interface SignFlowState {
  phone: string;
  appointment: Appointment | null;
  understoodRisks: string[];
  specialConditions: SpecialCondition[];
  voiceCompleted: boolean;
  signMethod: SignMethod;
  signData: string | null;
  smsVerified: boolean;
  completed: boolean;
  queueNumber: string;
}
