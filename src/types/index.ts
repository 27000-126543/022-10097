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

export type ConsentStatus = 'pending_review' | 'called' | 'completed';

export type TimelineNodeKey =
  | 'query_appointment'
  | 'read_risks'
  | 'answer_qa'
  | 'nurse_review'
  | 'submit_signature';

export interface ConsentTimelineNode {
  key: TimelineNodeKey;
  title: string;
  iconName: string;
  completedAt: string | null;
  skipped?: boolean;
}

export type TimelineNode = ConsentTimelineNode;

export interface ConsentRecord {
  id: string;
  createdAt: string;
  patientName: string;
  phone: string;
  projectName: string;
  projectCode: string;
  bodyPart: string;
  anesthesiaLabel: string;
  doctorName: string;
  queueNumber: string;
  status: ConsentStatus;

  understoodRisks: string[];

  checkedConditions: {
    id: string;
    label: string;
    needNurseReview: boolean;
  }[];

  nurseReview: NurseReview;

  signMethod: Exclude<SignMethod, null>;
  handwriteData?: string | null;
  photoData?: string | null;
  smsCode?: string | null;
  smsVerifiedPhone?: string | null;

  voiceCompleted: boolean;

  submittedAt: string | null;

  timeline: ConsentTimelineNode[];

  nurseNotes: NurseNote[];
}

export interface NurseReview {
  reviewed: boolean;
  reviewedAt: string | null;
  reviewedItems: string[];
}

export type NurseNoteType = 'review_pass' | 'review_pending' | 'general';

export interface NurseNote {
  id: string;
  content: string;
  createdAt: string;
  nurseId: string;
  type: NurseNoteType;
}

export interface SignFlowState {
  phone: string;
  appointment: Appointment | null;
  understoodRisks: string[];
  specialConditions: SpecialCondition[];
  voiceCompleted: boolean;
  signMethod: SignMethod;
  handwriteData: string | null;
  photoData: string | null;
  smsVerified: boolean;
  smsCode: string | null;
  smsExpiredAt: number | null;
  completed: boolean;
  queueNumber: string;
  nurseReview: NurseReview;
  confirmedSignMethod: SignMethod;
  consentRecords: ConsentRecord[];
  timelineDraft: {
    queryAt: string | null;
    allRisksReadAt: string | null;
    qaCompletedAt: string | null;
    nurseReviewedAt: string | null;
  };
}
