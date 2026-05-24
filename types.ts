export interface EyeState {
  sphere: number; // 球镜 度数, e.g. -3.00
  cylinder: number; // 柱镜 度数, e.g. -1.00 (负柱镜)
  axis: number; // 轴向 0-180
  occluded: boolean; // 是否遮盖
  prism: "none" | "3BU" | "3BD"; // 棱镜
  jccActive: boolean; // JCC散光十字交叉镜是否启用
  jccMode: "axis" | "power"; // JCC是处于 追轴 还是 校度 模式
  jccFace: "face1" | "face2" | null; // JCC翻转面: 面1, 面2 或 未翻转
}

export interface Prescription {
  sphere: number; // 真实球镜
  cylinder: number; // 真实柱镜
  axis: number; // 真实轴向
}

export interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  chiefComplaint: string; // 主诉
  odTrue: Prescription; // 右眼真实度数
  osTrue: Prescription; // 左眼真实度数
  odInitial: { sphere: number; cylinder: number; axis: number }; // 右眼初始不正度数 (配镜前初始度数)
  osInitial: { sphere: number; cylinder: number; axis: number }; // 左眼初始不正度数
}

export interface OptometryStep {
  id: number;
  name: string;
  description: string;
  standard: string; // 评分标准
  scoreWeight: number; // 步骤权重分数
}

export interface ScoringDetail {
  stepId: number;
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}
