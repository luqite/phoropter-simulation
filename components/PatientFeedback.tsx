import React from "react";
import { EyeState, Patient, Prescription } from "../types";
import { analyzeEyeRefraction } from "../utils";
import { MessageSquare, User, HelpCircle } from "lucide-react";

interface PatientFeedbackProps {
  patient: Patient;
  od: EyeState;
  os: EyeState;
  duochromeEnabled: boolean;
  activeStepId: number;
}

export const PatientFeedback: React.FC<PatientFeedbackProps> = ({
  patient,
  od,
  os,
  duochromeEnabled,
  activeStepId,
}) => {
  // Compute active eye and feedback strings
  const getSubjectiveRefractionFeedback = () => {
    // Case 1: All eyes occluded (blind)
    if (od.occluded && os.occluded) {
      return "（视窗中一片漆黑）“医生，我现在眼前漆黑一片，什么也看不见。两个遮盖片都还没拉开呢。”";
    }

    // Capture states
    const odAnalysis = analyzeEyeRefraction(od, patient.odTrue);
    const osAnalysis = analyzeEyeRefraction(os, patient.osTrue);

    // Case 2: Vertical Prism Split (Step 5 Binocular Balance)
    const isPrismSplit =
      !od.occluded &&
      !os.occluded &&
      (od.prism === "3BU" || os.prism === "3BD");

    if (isPrismSplit) {
      if (duochromeEnabled) {
        // Red-Green Prism Split
        const odDiff = odAnalysis.M_err;
        const osDiff = osAnalysis.M_err;
        
        let odSide = "等清";
        if (odDiff >= 0.3) odSide = "红色更亮";
        else if (odDiff >= 0.125) odSide = "红字稍清";
        else if (odDiff <= -0.3) odSide = "绿色更清";
        else if (odDiff <= -0.125) odSide = "绿字稍清";

        let osSide = "等清";
        if (osDiff >= 0.3) osSide = "红色更亮";
        else if (osDiff >= 0.125) osSide = "红字稍清";
        else if (osDiff <= -0.3) osSide = "绿色更清";
        else if (osDiff <= -0.125) osSide = "绿字稍清";

        return `“医生，我看到上下两个视力表。上方视标（右眼）好像【${odSide}】，下方视标（左眼）好像【${osSide}】。都有些重阴。”`;
      } else {
        // Normal split comparison (standard Black/White prism check)
        const blurDiff = odAnalysis.blurPower - osAnalysis.blurPower;
        
        if (Math.abs(blurDiff) < 0.15) {
          return "“我看到上下两个视力表。看了一下，上面这行和下面这行清晰度基本一模一样，眼睛比较放松了。”";
        } else if (blurDiff < 0) {
          // OD (top) is sharper because its error blur is smaller
          return "“我看到上下两个视力表垂直排开。仔细看的话，上方的视力表（代表右眼）比下方视力表（代表左眼）要清晰。”";
        } else {
          // OS (bottom) is sharper because its error blur is smaller
          return "“我看到两个视力表了。感觉下方的视力表（代表左眼）更清楚，上面的（代表右眼）稍微有点发虚和毛边。”";
        }
      }
    }

    // Default: Identify the single tested/open eye
    const testedEyeSide = !od.occluded && os.occluded ? "OD" : od.occluded && !os.occluded ? "OS" : "OU";
    const activeAnalysis = testedEyeSide === "OS" ? osAnalysis : odAnalysis;
    const activeEyeState = testedEyeSide === "OS" ? os : od;

    // Case 3: JCC Astigmatism Cross-Cylinder is ACTIVE
    if (activeEyeState.jccActive && activeEyeState.jccFace) {
      const isPowerMode = activeEyeState.jccMode === "power";
      
      // We calculate JCC face 1 blur and face 2 blur
      const truePresc = testedEyeSide === "OS" ? patient.osTrue : patient.odTrue;
      const face1Analysis = analyzeEyeRefraction({ ...activeEyeState, jccFace: "face1" }, truePresc);
      const face2Analysis = analyzeEyeRefraction({ ...activeEyeState, jccFace: "face2" }, truePresc);

      const faceDiff = face1Analysis.blurPower - face2Analysis.blurPower; // if negative, face1 is sharper

      if (isPowerMode) {
        // Power refinement mode
        if (Math.abs(faceDiff) < 0.06) {
          return "“两面翻转对比了一下，感觉两面的字清晰度差不多，线条同样粗细，没有太明显的差别。”";
        } else if (faceDiff < 0) {
          return "“第一面更清，字符重叠少一些！翻到第二面的时候，文字边缘发胀，看着有些刺眼变形。”";
        } else {
          return "“第二面相比之下字更黑、更圆润清晰！第一面看起来重影比较严重，看着不太舒服。”";
        }
      } else {
        // Axis refinement mode
        if (Math.abs(faceDiff) < 0.06) {
          return "“两个面的E开口基本一样模糊度，重叠影程度是一样的，说明当前轴位方向很平衡了。”";
        } else if (faceDiff < 0) {
          return "“第一面更扎实，模糊圈稍小一点；第二面毛刺变长了，方向发生了抖动歪斜。”";
        } else {
          return "“第二面更完整一些，散光感觉减弱了；第一面倒是由单影变成了双股影线。”";
        }
      }
    }

    // Case 4: Red-Green Duochrome Test Background is ENABLED
    if (duochromeEnabled) {
      const dM = activeAnalysis.M_err; // sphere error

      if (dM >= 0.35) {
        return "“红色背景那边的黑色字母边缘非常黑、非常锐利，而绿色背景那边的字母明显发虚重叠了，红色更清楚。”";
      } else if (dM >= 0.125) {
        return "“红色背景上的字母看着稍微清楚、更浓黑一点点，绿色那边稍微差一点，但已经很接近了。”";
      } else if (dM <= -0.35) {
        return "“绿色背景里面的字符颜色非常翠绿鲜明、非常清楚！红色这边的字好像被罩了一层灰，有些淡和发虚。”";
      } else if (dM <= -0.125) {
        return "“绿色背景的边缘更锐、稍微清晰一些，但红色那边的字也还不错。”";
      } else {
        return "“红、绿背景上的黑色字清晰度感觉完全等清了！黑度和边缘锐利度一模一样，看起来最舒服。试镜很棒！”";
      }
    }

    // Case 5: Standard Black/White Chart Vision Level
    const va = activeAnalysis.visualAcuity;
    
    if (va < 0.15) {
      return `“一片白花花的什么也看不清，最多能看到视力表中间偏上超大的模糊影子，不知道开口朝哪里。（当前估值视力: 0.1左右）”`;
    } else if (va < 0.35) {
      return `“眼前就像隔了一层毛玻璃，也就勉强对齐看出0.2、0.3那一两行的开口，再往下就全是叠影重影的大黑块了。”`;
    } else if (va < 0.65) {
      return `“看得到0.5那一行，边缘还是挺多毛壳的。更底下的0.6或0.8那几行字太近了，缩在一起，看得眼睛疼也认不出方向来。”`;
    } else if (va < 0.95) {
      return `“差不多能看清楚0.8这一排的开口！医生，1.0那一排勉勉强强还能认两三个，但我很费劲，不敢确定，好像稍微有点散光叠影。”`;
    } else if (va < 1.25) {
      return `“非常清楚！1.0那一行我能百分之百肯定看明白！1.2那一排也能轻松辨别方向！看远处的实物感觉非常通透、高对比度。”`;
    } else {
      return `“老天爷，极佳的视力！我竟然连最底部1.5那一行的细小E符号都能毫不费力得认出来！极其清晰，神了，谢谢医生！”`;
    }
  };

  return (
    <div className="w-full bg-white border border-[#d2d2d7] rounded-xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e5e5ea]">
        <MessageSquare className="w-4 h-4 text-[#0055ff]" />
        <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
          患者主观陈述与感知 (Patient Subjective Response)
        </h3>
      </div>

      {/* Patient Card info */}
      <div className="flex gap-4 items-start bg-[#f5f5f7] p-3.5 rounded-lg border border-[#e5e5ea]">
        {/* Avatar badge */}
        <div className="w-12 h-12 rounded-lg bg-white border border-[#d2d2d7] flex items-center justify-center shrink-0 shadow-xs">
          <User className="w-6 h-6 text-[#0055ff]" />
        </div>

        {/* Name and complaint */}
        <div className="flex-grow space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1d1d1f]">{patient.name}</span>
            <span className="text-[10px] text-[#666] bg-white border border-[#e5e5ea] px-1.5 py-0.2 rounded font-mono">
              {patient.gender} | {patient.age}岁
            </span>
          </div>
          <div className="text-[11px] text-[#666]">
            <span className="text-[#86868b] font-semibold font-sans">主诉:</span> {patient.chiefComplaint}
          </div>
        </div>
      </div>

      {/* Subjective dialog feedback */}
      <div className="mt-4 relative bg-[#fff9e6] border border-[#ffe58f] p-4 rounded-lg text-[#1d1d1f] font-sans text-xs md:text-sm leading-relaxed tracking-wide min-h-[70px] flex items-center shadow-xs">
        {/* Quote graphic */}
        <span className="absolute -top-2 left-4 bg-[#fff9e6] border border-[#ffe58f] px-2 py-0.5 rounded-md font-mono text-[9px] font-bold text-[#b78103] uppercase tracking-wider">
          患者实时口授
        </span>
        <div className="w-full pl-1 select-text text-amber-950 font-medium">
          {getSubjectiveRefractionFeedback()}
        </div>
      </div>
    </div>
  );
};
