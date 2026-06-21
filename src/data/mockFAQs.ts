import type { FAQItem, SpecialCondition } from "@/types";

export const faqItems: FAQItem[] = [
  {
    id: "faq-1",
    question: "做完后可以化妆吗？",
    answer:
      "建议术后24小时内不要化妆，让针眼有足够时间愈合。24小时后可使用温和的保湿类护肤品，48小时后可正常化妆，但请避免在针眼处用力揉搓。卸妆时动作要轻柔，建议使用卸妆乳而非卸妆水。",
  },
  {
    id: "faq-2",
    question: "多久可以碰水洗脸？",
    answer:
      "术后6小时内针眼绝对不可碰水。6小时后可用温水轻轻冲洗面部，注意不要用力揉搓注射部位。建议术后3天内只用清水洁面，3天后恢复正常清洁程序。洗澡时注意水温不要过高，避免长时间桑拿或汗蒸。",
  },
  {
    id: "faq-3",
    question: "会影响第二天上班吗？",
    answer:
      "一般不影响正常工作和社交。大部分人术后只有轻微肿胀，戴口罩即可遮盖。如工作需要出镜或面对客户，建议安排在周五做，周末有两天恢复时间。淤青概率约30%，如出现可用遮瑕膏遮盖，一般7天左右消退。",
  },
  {
    id: "faq-4",
    question: "饮食上需要注意什么？",
    answer:
      "术后1周内避免饮酒、辛辣刺激食物、海鲜、牛羊肉等发物。避免食用过热过硬的食物（尤其苹果肌、太阳穴填充后）。建议多饮水，多吃新鲜蔬菜水果补充维生素C，有助于恢复。",
  },
  {
    id: "faq-5",
    question: "什么时候可以运动？",
    answer:
      "术后3天内避免剧烈运动、弯腰负重、用力憋气等动作。3天后可恢复轻度运动，如散步、瑜伽。1周后可恢复正常健身，但需避免球类等可能碰撞面部的运动。2周后完全不受限制。",
  },
  {
    id: "faq-6",
    question: "需要回医院复查吗？",
    answer:
      "建议术后2周回院复查一次，医生会评估恢复情况和效果，必要时可进行微调。如期间出现明显不对称、持续加重的肿胀、发热疼痛等异常情况，请立即联系医院，不要自行处理。",
  },
];

export const specialConditions: SpecialCondition[] = [
  {
    id: "sc-1",
    label: "孕期或哺乳期",
    description: "目前正在怀孕或处于产后哺乳阶段",
    checked: false,
    needNurseReview: true,
  },
  {
    id: "sc-2",
    label: "瘢痕体质",
    description: "受伤后容易留增生性疤痕或瘢痕疙瘩",
    checked: false,
    needNurseReview: true,
  },
  {
    id: "sc-3",
    label: "近期服药",
    description: "近2周内持续服用药物（包括保健品、中药）",
    checked: false,
    needNurseReview: true,
  },
  {
    id: "sc-4",
    label: "药物或食物过敏史",
    description: "已知对麻醉药、抗生素或其他药物过敏",
    checked: false,
    needNurseReview: true,
  },
  {
    id: "sc-5",
    label: "近期注射或手术史",
    description: "近6个月内做过其他医美注射或手术",
    checked: false,
    needNurseReview: true,
  },
  {
    id: "sc-6",
    label: "以上情况都没有",
    description: "确认无以上任何特殊情况",
    checked: false,
    needNurseReview: false,
  },
];
