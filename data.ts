import { Patient, OptometryStep } from "./types";

export const PATIENTS: Patient[] = [
  {
    id: "1",
    name: "张华 (Zhang Hua)",
    gender: "男 (Male)",
    age: 24,
    chiefComplaint: "双眼视力模糊，看远不清晰近半年，伴有轻度视疲劳。",
    odTrue: { sphere: -3.25, cylinder: -0.75, axis: 85 },
    osTrue: { sphere: -2.75, cylinder: -0.50, axis: 175 },
    odInitial: { sphere: -1.75, cylinder: 0.00, axis: 180 },
    osInitial: { sphere: -1.50, cylinder: 0.00, axis: 180 }
  },
  {
    id: "2",
    name: "李娜 (Li Na)",
    gender: "女 (Female)",
    age: 29,
    chiefComplaint: "长时间面对电脑，近视度数感觉加深，看东西有重影。",
    odTrue: { sphere: -5.00, cylinder: -1.25, axis: 120 },
    osTrue: { sphere: -4.50, cylinder: -1.00, axis: 30 },
    odInitial: { sphere: -3.50, cylinder: 0.00, axis: 90 },
    osInitial: { sphere: -3.00, cylinder: 0.00, axis: 90 }
  },
  {
    id: "3",
    name: "赵雷 (Zhao Lei)",
    gender: "男 (Male)",
    age: 16,
    chiefComplaint: "学校体检发现视力下降，看黑板眯眼，此前从未验配眼镜。",
    odTrue: { sphere: -1.75, cylinder: -0.50, axis: 95 },
    osTrue: { sphere: -2.00, cylinder: -0.25, axis: 85 },
    odInitial: { sphere: -0.50, cylinder: 0.00, axis: 180 },
    osInitial: { sphere: -0.75, cylinder: 0.00, axis: 180 }
  }
];

export const OPTOMETRY_STEPS: OptometryStep[] = [
  {
    id: 1,
    name: "准备阶段",
    description: "选择测试眼(默认右眼OD)，遮盖对侧眼(左眼OS)，设置初始度数。",
    standard: "右眼打开，左眼遮盖，无棱镜且未启用JCC。此步骤引导患者放松调节。",
    scoreWeight: 10
  },
  {
    id: 2,
    name: "初步单眼 MPMVA",
    description: "调整测试眼(右眼)球镜，达到最高正镜(或最低负镜)下的最佳视力。",
    standard: "球镜调节到让视力表达到约1.0，红绿测试时红区与绿区同样清晰或红区稍清晰。",
    scoreWeight: 15
  },
  {
    id: 3,
    name: "JCC 交叉柱镜散光测试",
    description: "使用JCC交叉柱镜，依次精密调整散光轴位(追轴)和散光度数(校度)。",
    standard: "开启JCC，先切至轴位模式做追轴调节，再切至度数模式调柱镜。注意：柱镜每调整0.50D，球镜需反向调节0.25D进行等效补偿！",
    scoreWeight: 30
  },
  {
    id: 4,
    name: "再次单眼 MPMVA",
    description: "散光精确校正后，再次微调右眼球镜度数，确定终点球镜度数。",
    standard: "关闭JCC，微调球镜。使视力达到最大(1.2或1.5)，且红绿背景文字完全等清。",
    scoreWeight: 15
  },
  {
    id: 5,
    name: "双眼调节平衡",
    description: "去除遮盖(双眼睁开)，加入分像棱镜(右眼3BU/左眼3BD)，对比微调双眼视力。",
    standard: "去遮盖。右眼置入3BU棱镜，左眼置入3BD棱镜，使视力表上下分像。询问患者上下是否一样清，微调较清晰眼的球镜（加+0.25D雾视）使之等清，完成后移出棱镜。",
    scoreWeight: 15
  },
  {
    id: 6,
    name: "双眼终点 MPMVA",
    description: "双眼同时调整球镜，获得双眼的最终最高正镜度数下的最佳视力。",
    standard: "双眼不遮盖，无棱镜，无JCC。同时等量增减双眼球镜，使双眼视力达到最佳(1.2+)，双眼红绿底色一样清。",
    scoreWeight: 15
  }
];

export const EYE_CHART_ROWS = [
  { version: "0.1", size: 80, items: ["E", "W", "3", "M"] },
  { version: "0.2", size: 55, items: ["3", "E", "M", "W"] },
  { version: "0.3", size: 42, items: ["W", "M", "E", "3"] },
  { version: "0.4", size: 34, items: ["M", "3", "W", "E"] },
  { version: "0.5", size: 28, items: ["E", "W", "M", "3"] },
  { version: "0.6", size: 23, items: ["3", "M", "E", "W"] },
  { version: "0.8", size: 18, items: ["W", "E", "3", "M"] },
  { version: "1.0", size: 14, items: ["M", "3", "W", "E"] },
  { version: "1.2", size: 11, items: ["E", "W", "M", "3"] },
  { version: "1.5", size: 8,  items: ["3", "M", "E", "W"] }
];

// Map a character code to rotation class
export const CHART_ROTATION_MAP: Record<string, string> = {
  "E": "rotate-90",   //开口朝右
  "3": "rotate-180",  //开口朝下
  "W": "rotate-270",  //开口朝左
  "M": "rotate-0",    //开口朝上（默认）
};
