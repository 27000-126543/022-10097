import type { Appointment } from "@/types";

export const mockAppointments: Record<string, Appointment> = {
  "13800138000": {
    id: "APT001",
    phone: "13800138000",
    patientName: "张女士",
    projectName: "玻尿酸面部填充",
    projectCode: "HA-FILL-001",
    bodyPart: "苹果肌、太阳穴",
    anesthesiaType: "surface",
    anesthesiaLabel: "表面麻醉（敷麻药）",
    recoveryDays: 7,
    appointmentTime: "今日 14:30",
    doctor: {
      name: "李雯",
      title: "主治医师 · 10年经验",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces",
    },
    precautions: [
      {
        id: "p1",
        icon: "Wine",
        title: "避免饮酒",
        description: "术前3天、术后1周避免饮酒",
        type: "before",
      },
      {
        id: "p2",
        icon: "Pill",
        title: "停用抗凝药",
        description: "阿司匹林、维生素E等提前1周停用",
        type: "before",
      },
      {
        id: "p3",
        icon: "Ban",
        title: "避免按摩",
        description: "术后2周内不可按摩注射部位",
        type: "after",
      },
      {
        id: "p4",
        icon: "Sun",
        title: "避免暴晒",
        description: "术后1周避免高温环境与暴晒",
        type: "after",
      },
      {
        id: "p5",
        icon: "Droplets",
        title: "保持清洁",
        description: "6小时内针眼不可碰水，24小时不化妆",
        type: "after",
      },
      {
        id: "p6",
        icon: "UtensilsCrossed",
        title: "清淡饮食",
        description: "1周内忌辛辣刺激、海鲜、牛羊肉",
        type: "after",
      },
    ],
  },
};

export function findAppointmentByPhone(phone: string): Appointment | null {
  return mockAppointments[phone] || null;
}
