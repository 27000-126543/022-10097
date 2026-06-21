import type { RiskPoint } from "@/types";

export const riskPoints: RiskPoint[] = [
  {
    id: "risk-bruise",
    title: "淤青",
    description:
      "注射后可能在针眼周围出现青紫瘀斑，这是针头触碰毛细血管导致的皮下少量出血，属于正常反应，不影响最终效果。",
    probability: "中",
    duration: "7-10天",
    solution:
      "术后前3天可冷敷减轻淤青，3天后可温敷促进吸收。淤青会随时间自然消退，无需特殊处理。如淤青面积较大，请及时联系医生。",
    illustration: "Hand",
    color: "#9B7EDE",
  },
  {
    id: "risk-swelling",
    title: "肿胀",
    description:
      "注射部位会出现不同程度的肿胀，尤其在术后24-48小时最为明显，可能伴随轻微的胀痛感和紧绷感。",
    probability: "高",
    duration: "3-5天",
    solution:
      "术后即刻开始间歇性冷敷（每次15分钟，间隔1小时）。睡觉时垫高头部，避免低头弯腰动作。肿胀会在一周内逐步自然消退。",
    illustration: "Wind",
    color: "#E8B4B8",
  },
  {
    id: "risk-pigment",
    title: "色素沉着",
    description:
      "少数人在针眼愈合后可能出现局部色素变深的情况，尤其在日晒后更明显，这是皮肤的炎症后色素反应。",
    probability: "低",
    duration: "2-8周",
    solution:
      "严格做好防晒，可使用SPF30以上防晒霜并配合遮阳。避免在恢复期间使用含有果酸、A醇的刺激性护肤品。色素会随新陈代谢逐渐淡化。",
    illustration: "Palette",
    color: "#F5C77E",
  },
  {
    id: "risk-asymmetry",
    title: "效果不对称",
    description:
      "由于两侧吸收速度、面部肌肉运动、肿胀消退速度存在差异，短期内可能出现视觉上的不对称，这在早期很常见。",
    probability: "中",
    duration: "持续观察",
    solution:
      "术后2周内为肿胀消退期，不对称多为暂时现象。如2周后仍明显不对称，可返回医院进行免费微调。请避免自行按摩或挤压。",
    illustration: "SplitSquareHorizontal",
    color: "#A8D5BA",
  },
];
