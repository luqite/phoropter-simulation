import React, { useState, useEffect, useRef } from "react";
import { EyeState, Patient, ScoringDetail } from "./types";
import { PATIENTS, OPTOMETRY_STEPS } from "./data";
import { analyzeEyeRefraction } from "./utils";
import { VisualChart } from "./components/VisualChart";
import { OpticalController } from "./components/OpticalController";
import { StepList } from "./components/StepList";
import { PatientFeedback } from "./components/PatientFeedback";
import { InstructionManual } from "./components/InstructionManual";
import {
  Clock,
  Award,
  RotateCcw,
  BookOpen,
  ClipboardCheck,
  Check,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function App() {
  // 1. Choose Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>("1");
  const currentPatient =
    PATIENTS.find((p) => p.id === selectedPatientId) || PATIENTS[0];

  // 2. Active Step Id
  const [activeStepId, setActiveStepId] = useState<number>(1);

  // 3. Eye states
  const [od, setOd] = useState<EyeState>({
    sphere: currentPatient.odInitial.sphere,
    cylinder: currentPatient.odInitial.cylinder,
    axis: currentPatient.odInitial.axis,
    occluded: false, // OD is open in step 1
    prism: "none",
    jccActive: false,
    jccMode: "axis",
    jccFace: null,
  });

  const [os, setOs] = useState<EyeState>({
    sphere: currentPatient.osInitial.sphere,
    cylinder: currentPatient.osInitial.cylinder,
    axis: currentPatient.osInitial.axis,
    occluded: true, // OS is occluded in step 1
    prism: "none",
    jccActive: false,
    jccMode: "axis",
    jccFace: null,
  });

  const [targetEye, setTargetEye] = useState<"OD" | "OS" | "OU">("OD");
  const [duochromeEnabled, setDuochromeEnabled] = useState<boolean>(false);

  // 4. Timer state
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes = 900 seconds
  const [timerActive, setTimerActive] = useState<boolean>(true);

  // 5. Submit Modal Report State
  const [isSubmitReportOpen, setIsSubmitReportOpen] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string>("");
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  // Track if they adjusted cylinder/sphere during JCC to alert them if compensation rule is breached
  const jccSphereCompViolation = useRef<boolean>(false);

  // Reset eye states when changing patients
  useEffect(() => {
    setOd({
      sphere: currentPatient.odInitial.sphere,
      cylinder: currentPatient.odInitial.cylinder,
      axis: currentPatient.odInitial.axis,
      occluded: false,
      prism: "none",
      jccActive: false,
      jccMode: "axis",
      jccFace: null,
    });
    setOs({
      sphere: currentPatient.osInitial.sphere,
      cylinder: currentPatient.osInitial.cylinder,
      axis: currentPatient.osInitial.axis,
      occluded: true,
      prism: "none",
      jccActive: false,
      jccMode: "axis",
      jccFace: null,
    });
    setTargetEye("OD");
    setDuochromeEnabled(false);
    setActiveStepId(1);
    setTimeLeft(900);
    setTimerActive(true);
    jccSphereCompViolation.current = false;
  }, [selectedPatientId]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleExamSubmission(); // Automatically submit exam when time ends
    }
    return () => clearInterval(interval);
  }, [timeLeft, timerActive]);

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 6. Update eye state helper
  const updateEyeState = (eye: "OD" | "OS", updates: Partial<EyeState>) => {
    if (eye === "OD") {
      setOd((prev) => ({ ...prev, ...updates }));
    } else {
      setOs((prev) => ({ ...prev, ...updates }));
    }
  };

  // Cylinder change compensation audit helper
  const handleActionCompensate = (eye: "OD" | "OS", cylinderChange: number) => {
    // Audit JCC Sphere Compensation
    // When cylinder is changed by -0.50D (e.g. from -0.50 to -1.00), sphere must increase (+0.25D).
    // This is managed by the math scoring, but let's log any abrupt violation
  };

  // 7. Core Optics and Grading Matrix Engine
  const calculateLiveGradeBreakdown = (): {
    total: number;
    details: ScoringDetail[];
  } => {
    const details: ScoringDetail[] = [];

    // Analyze optical refractive outcomes
    const odAnalysis = analyzeEyeRefraction(od, currentPatient.odTrue, true);
    const osAnalysis = analyzeEyeRefraction(os, currentPatient.osTrue, true);

    // --- STEP 1: 准备阶段 (Max 10 points) ---
    // Rule: OD open, OS occluded; no prisms; no JCC.
    let s1Score = 0;
    let s1Feedback = "";
    if (
      !od.occluded &&
      os.occluded &&
      od.prism === "none" &&
      os.prism === "none" &&
      !od.jccActive &&
      !os.jccActive
    ) {
      s1Score = 10;
    } else {
      const s1Errors = [];
      if (od.occluded) s1Errors.push("右眼不应遮盖");
      if (!os.occluded) s1Errors.push("左眼应当遮盖");
      if (od.prism !== "none" || os.prism !== "none")
        s1Errors.push("准备阶段存在棱镜度数");
      if (od.jccActive || os.jccActive) s1Errors.push("不应在准备阶段启用JCC");
      s1Feedback = s1Errors.join("、");
      s1Score = Math.max(0, 10 - s1Errors.length * 3);
    }
    details.push({
      stepId: 1,
      name: "准备阶段",
      score: Math.round(s1Score),
      maxScore: 10,
      feedback: s1Feedback,
    });

    // --- STEP 2: 初步单眼 MPMVA (Max 15 points) ---
    // Rule: OD open, OS occluded; no JCC; Sphere should cover spherical equivalence
    let s2Score = 0;
    let s2Feedback = "";
    if (od.occluded) {
      s2Feedback = "右眼关闭";
    } else if (!os.occluded) {
      s2Feedback = "混淆干扰（左眼未遮盖）";
    } else if (od.jccActive) {
      s2Feedback = "不应在此步骤启用JCC镜片";
    } else {
      // Estimated best sphere with astigmatism uncorrected is Sphere equivalent best
      // True best equivalent M = DS + DC/2
      const targetSE = currentPatient.odTrue.sphere + currentPatient.odTrue.cylinder / 2;
      const currentOD_SE = od.sphere + od.cylinder / 2;
      const seDiff = Math.abs(currentOD_SE - targetSE);

      if (seDiff <= 0.125) {
        s2Score = 15;
      } else if (seDiff <= 0.25) {
        s2Score = 12;
      } else if (seDiff <= 0.5) {
        s2Score = 8;
      } else if (seDiff <= 1.0) {
        s2Score = 4;
      } else {
        s2Feedback = `球镜等效屈光度偏离目标多于1.00D`;
      }

      // Check overcorrection (reducing negative sphere too much stimulating accommodation spasm)
      if (od.sphere < currentPatient.odTrue.sphere) {
        s2Feedback += (s2Feedback ? " | " : "") + "球镜给予过负（近视过矫）";
        s2Score = Math.max(0, s2Score - 3);
      }
    }
    details.push({
      stepId: 2,
      name: "初步单眼 MPMVA",
      score: Math.round(s2Score),
      maxScore: 15,
      feedback: s2Feedback,
    });

    // --- STEP 3: JCC 交叉柱镜 (Max 30 points) ---
    // Rule: Right open, Left occluded; JCC must be active. Cylinder and axis should align to true prescr.
    let s3Score = 0;
    let s3Feedback = "";
    if (od.occluded) {
      s3Feedback = "右眼未通光";
    } else if (!os.occluded) {
      s3Feedback = "左眼未遮盖";
    } else if (!od.jccActive) {
      s3Feedback = "未启用 JCC 交叉柱盘";
    } else {
      // Cylinder error check (10 pts)
      const cylErr = Math.abs(od.cylinder - currentPatient.odTrue.cylinder);
      let cylPts = 0;
      if (cylErr === 0) cylPts = 10;
      else if (cylErr <= 0.25) cylPts = 7;
      else if (cylErr <= 0.5) cylPts = 4;
      else {
        s3Feedback = "散光柱镜偏差偏大";
      }

      // Axis error check (10 pts)
      const axErr = Math.min(
        Math.abs(od.axis - currentPatient.odTrue.axis),
        180 - Math.abs(od.axis - currentPatient.odTrue.axis)
      );
      let axPts = 0;
      if (axErr === 0) axPts = 10;
      else if (axErr <= 5) axPts = 7;
      else if (axErr <= 10) axPts = 4;
      else {
        s3Feedback += (s3Feedback ? "、" : "") + "散光轴向偏斜过大";
      }

      // Compensation rule check (10 pts)
      // Check if spherical equivalent of current OD is maintained correctly
      const initialOD_SE = currentPatient.odInitial.sphere + currentPatient.odInitial.cylinder / 2;
      const targetSE = currentPatient.odTrue.sphere + currentPatient.odTrue.cylinder / 2;
      const currentOD_SE = od.sphere + od.cylinder / 2;
      const seDiff = Math.abs(currentOD_SE - targetSE);

      let compPts = 0;
      if (seDiff <= 0.125) {
        compPts = 10;
      } else if (seDiff <= 0.25) {
        compPts = 6;
        s3Feedback += (s3Feedback ? "、" : "") + "等效球镜补偿不精准";
      } else {
        compPts = 0;
        s3Feedback +=
          (s3Feedback ? "、" : "") + "违背散光等效球镜轴补偿规则(柱镜每变0.50D补0.25D球镜)";
      }

      s3Score = cylPts + axPts + compPts;
    }
    details.push({
      stepId: 3,
      name: "JCC 散光测试",
      score: Math.round(s3Score),
      maxScore: 30,
      feedback: s3Feedback,
    });

    // --- STEP 4: 再次单眼 MPMVA (Max 15 points) ---
    // Rule: OD open, OS occluded; JCC is OFF; Sphere must match truth precisely
    let s4Score = 0;
    let s4Feedback = "";
    if (od.occluded) {
      s4Feedback = "右眼关闭";
    } else if (!os.occluded) {
      s4Feedback = "双眼并开，未做单眼验光";
    } else if (od.jccActive) {
      s4Feedback = "未移出 JCC 镜片";
    } else {
      const sphereErr = Math.abs(od.sphere - currentPatient.odTrue.sphere);
      if (sphereErr === 0) {
        s4Score = 15;
      } else if (sphereErr <= 0.25) {
        s4Score = 11;
      } else if (sphereErr <= 0.5) {
        s4Score = 7;
      } else {
        s4Feedback = `球镜偏离真度数过多`;
      }

      if (od.sphere < currentPatient.odTrue.sphere) {
        s4Feedback += (s4Feedback ? " | " : "") + "近视过矫（负镜超量）";
        s4Score = Math.max(0, s4Score - 3);
      }
    }
    details.push({
      stepId: 4,
      name: "再次单眼 MPMVA",
      score: Math.round(s4Score),
      maxScore: 15,
      feedback: s4Feedback,
    });

    // --- STEP 5: 双眼调节平衡 (Max 15 points) ---
    // Rule: OD and OS open; OD 3BU, OS 3BD vertical prism added. Absolute accommodation balanced.
    let s5Score = 0;
    let s5Feedback = "";
    if (od.occluded || os.occluded) {
      s5Feedback = "对侧眼仍处于遮盖状态，未进行双眼平衡";
    } else if (od.prism !== "3BU" || os.prism !== "3BD") {
      s5Feedback = "未移入平衡分像副棱镜 (OD 3BU / OS 3BD)";
    } else {
      // Balance difference between eyes
      const odBlur = odAnalysis.blurPower;
      const osBlur = osAnalysis.blurPower;
      const balanceDiff = Math.abs(odBlur - osBlur);

      if (balanceDiff <= 0.15) {
        s5Score = 15;
      } else if (balanceDiff <= 0.38) {
        s5Score = 10;
        s5Feedback = "双眼清晰度不对等，调节未充分平衡";
      } else {
        s5Score = 4;
        s5Feedback = "双眼调节存在严重偏盛（清晰度差异过大）";
      }
    }
    details.push({
      stepId: 5,
      name: "双眼调节平衡",
      score: Math.round(s5Score),
      maxScore: 15,
      feedback: s5Feedback,
    });

    // --- STEP 6: 双眼最高正镜 MPMVA (Max 15 points) ---
    // Rule: Both open, no prisms, no JCC. Both spheres aligned perfect to target
    let s6Score = 0;
    let s6Feedback = "";
    if (od.occluded || os.occluded) {
      s6Feedback = "仍有某眼被遮盖";
    } else if (od.prism !== "none" || os.prism !== "none") {
      s6Feedback = "未移开双眼分像棱镜";
    } else {
      const odErr = Math.abs(od.sphere - currentPatient.odTrue.sphere);
      const osErr = Math.abs(os.sphere - currentPatient.osTrue.sphere);
      const sumErr = odErr + osErr;

      if (sumErr === 0) {
        s6Score = 15;
      } else if (sumErr <= 0.25) {
        s6Score = 12;
      } else if (sumErr <= 0.5) {
        s6Score = 8;
      } else if (sumErr <= 1.0) {
        s6Score = 4;
      } else {
        s6Feedback = "两眼屈光设定偏远靶向度数较深";
      }

      // Overcorrection double check
      if (od.sphere < currentPatient.odTrue.sphere || os.sphere < currentPatient.osTrue.sphere) {
        s6Feedback += (s6Feedback ? " | " : "") + "双眼存在过矫欠矫";
        s6Score = Math.max(0, s6Score - 2);
      }
    }
    details.push({
      stepId: 6,
      name: "双眼终点 MPMVA",
      score: Math.round(s6Score),
      maxScore: 15,
      feedback: s6Feedback,
    });

    const total = details.reduce((sum, item) => sum + item.score, 0);
    return { total, details };
  };

  const { total: currentTotalScore, details: scoresBreakdown } =
    calculateLiveGradeBreakdown();

  // Reset current patient task
  const handleReset = () => {
    setOd({
      sphere: currentPatient.odInitial.sphere,
      cylinder: currentPatient.odInitial.cylinder,
      axis: currentPatient.odInitial.axis,
      occluded: false,
      prism: "none",
      jccActive: false,
      jccMode: "axis",
      jccFace: null,
    });
    setOs({
      sphere: currentPatient.osInitial.sphere,
      cylinder: currentPatient.osInitial.cylinder,
      axis: currentPatient.osInitial.axis,
      occluded: true,
      prism: "none",
      jccActive: false,
      jccMode: "axis",
      jccFace: null,
    });
    setTargetEye("OD");
    setDuochromeEnabled(false);
    setActiveStepId(1);
    setTimeLeft(900);
    setTimerActive(true);
    jccSphereCompViolation.current = false;
  };

  // Exam Submission handler
  const handleExamSubmission = () => {
    setTimerActive(false);
    
    // Generate diagnostic feedback text
    let ratingStr = "不合格 (Needs Re-training)";
    let tip = "建议仔细对照六步法考核指引重新练习。";
    
    if (currentTotalScore >= 90) {
      ratingStr = "卓越 (Exemplary Clinical Skills!)";
      tip = "恭喜你！主觉验光步骤及参数微调堪称完美，具备了极其坚实的专业技术素养。";
    } else if (currentTotalScore >= 80) {
      ratingStr = "优秀 (Highly Proficient Optometrist)";
      tip = "非常出色的测试！在球散等效、轴向及双眼平度校准上思路非常清晰。";
    } else if (currentTotalScore >= 60) {
      ratingStr = "及格 (Qualified Optometrist)";
      tip = "已经基本掌握了主觉验光步骤，注意散光极密调整时的‘等效球镜规则补偿’和近视‘防过矫控调节’技巧。";
    }

    setSubmissionFeedback(`考核评定: ${ratingStr}\n\n${tip}`);
    setIsSubmitReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1d1d1f] flex flex-col font-sans selection:bg-[#0055ff] selection:text-white">
      {/* 1. Header Navigation HUD - Dark Console Style as Ophthalmic Device Panel */}
      <header className="border-b border-black bg-[#1d1d1f] sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0055ff] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                主觉验光虚拟实训仿真系统
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 text-teal-300 rounded border border-zinc-700 select-none font-bold">
                  V1.2
                </span>
              </h1>
              <span className="text-[10px] text-zinc-400 font-mono block">
                OphthalmicRefraction™ Subjective Optometry Simulation & Certification System
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Choose Patient */}
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono">
                选择仿真病历:
              </span>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer pr-1"
              >
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-300">
                    {p.name} ({p.gender === "男 (Male)" ? "男" : "女"}, {p.age}岁)
                  </option>
                ))}
              </select>
            </div>

            {/* Live Countdowns */}
            <div className="flex items-center gap-2 bg-zinc-850 p-1 rounded-lg border border-zinc-755">
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded font-mono text-xs font-bold transition-colors ${
                timerActive
                  ? timeLeft < 180
                    ? "bg-rose-950 text-rose-300 border-rose-800 animate-pulse"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300"
                  : "bg-zinc-950 border-zinc-900 text-zinc-500"
              }`}>
                <Clock className={`w-3.5 h-3.5 ${timerActive ? "text-rose-500 animate-spin" : "text-zinc-600 animate-none"}`} style={{ animationDuration: "12s" }} />
                <span>剩: {formatTime(timeLeft)}</span>
              </div>
              <button
                id="timer-toggle-btn"
                onClick={() => setTimerActive(!timerActive)}
                className={`px-2 py-1 text-[11px] rounded font-bold cursor-pointer transition-all ${
                  timerActive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 shadow-inner"
                    : "bg-amber-600 hover:bg-amber-500 text-white border border-amber-700 shadow-inner"
                }`}
                title={timerActive ? "点击暂停计时" : "点击继续恢复计时"}
              >
                {timerActive ? "暂停计时" : "启用计时"}
              </button>
            </div>

            {/* Actions */}
            <button
              id="open-manual-btn"
              onClick={() => setIsManualOpen(true)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-teal-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="打开系统实操与医学说明手册"
            >
              <BookOpen className="w-3.5 h-3.5" />
              使用说明书
            </button>

            <button
              id="restart-practice"
              onClick={handleReset}
              className="px-3 py-1.5 border border-zinc-705 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="复位操作"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新练习
            </button>

            <button
              id="submit-exam-btn"
              onClick={handleExamSubmission}
              className="px-4 py-1.5 bg-[#0055ff] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              提交评卷
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
        {/* Left Side: Step Guide Sidebar (Span 4) */}
        <section className="lg:col-span-4 flex flex-col h-full gap-4">
          <StepList
            steps={OPTOMETRY_STEPS}
            activeStepId={activeStepId}
            setActiveStepId={setActiveStepId}
            scoresBreakdown={scoresBreakdown}
            totalScore={currentTotalScore}
          />
        </section>

        {/* Middle/Right: Interactive Optometry Core (Span 8) */}
        <section className="lg:col-span-8 flex flex-col gap-5 h-full">
          {/* Virtual acuity chart container (top half) */}
          <VisualChart
            od={od}
            os={os}
            odTrue={currentPatient.odTrue}
            osTrue={currentPatient.osTrue}
            duochromeEnabled={duochromeEnabled}
            activeStepId={activeStepId}
          />

          {/* Interactive verbal feedback area */}
          <PatientFeedback
            patient={currentPatient}
            od={od}
            os={os}
            duochromeEnabled={duochromeEnabled}
            activeStepId={activeStepId}
          />

          {/* Core dials automated control array */}
          <OpticalController
            od={od}
            os={os}
            targetEye={targetEye}
            setTargetEye={setTargetEye}
            updateEyeState={updateEyeState}
            duochromeEnabled={duochromeEnabled}
            setDuochromeEnabled={setDuochromeEnabled}
            onActionCompensate={handleActionCompensate}
          />
        </section>
      </main>

      {/* 3. Footer credits */}
      <footer className="border-t border-zinc-200 py-4 bg-white text-center text-[11px] text-[#86868b] font-mono tracking-wide">
        OPTOM-SIM CO. © 2026-MED • STATE-AUTHORITATIVE SUBJECTIVE REFRACTOMETER SIMULATOR MODEL
      </footer>

      {/* 4. Submission Grade Report Modal Overlay */}
      {isSubmitReportOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#d2d2d7] rounded-xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-[#f5f5f7] p-5 border-b border-[#e5e5ea] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="text-[#0055ff] w-5 h-5 animate-bounce" />
                <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
                  主觉验光实操技能仿真考核评定报告
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-white text-[#0055ff] border border-[#d2d2d7] px-2 py-0.5 rounded font-bold">
                EXAM REPORT
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-5 items-center bg-[#f5f5f7] p-4 rounded-lg border border-[#e5e5ea]">
                <div className="w-16 h-16 rounded-full bg-[#0055ff] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="text-2xl font-black font-mono">{currentTotalScore}</span>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <div className="text-xs text-[#1d1d1f] whitespace-pre-line font-medium leading-relaxed">
                    {submissionFeedback}
                  </div>
                </div>
              </div>

              {/* Patient metrics vs dial comparison */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1d1d1f]">🎯 验配度数参数比对 (Prescription Metrics Feedback):</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#f5f5f7] border border-[#e5e5ea]">
                    <span className="text-[10px] text-[#0055ff] font-bold block mb-1">右眼 (OD)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#1d1d1f]">
                      <div>
                        <span className="text-[#86868b] block">临床诊断值:</span>
                        S: {currentPatient.odTrue.sphere.toFixed(2)} D<br />
                        C: {currentPatient.odTrue.cylinder.toFixed(2)} D<br />
                        A: {currentPatient.odTrue.axis}°
                      </div>
                      <div>
                        <span className="text-[#86868b] block">你的调试值:</span>
                        S: {od.sphere.toFixed(2)} D<br />
                        C: {od.cylinder.toFixed(2)} D<br />
                        A: {od.axis}°
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#f5f5f7] border border-[#e5e5ea]">
                    <span className="text-[10px] text-[#0055ff] font-bold block mb-1">左眼 (OS)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#1d1d1f]">
                      <div>
                        <span className="text-[#86868b] block">临床诊断值:</span>
                        S: {currentPatient.osTrue.sphere.toFixed(2)} D<br />
                        C: {currentPatient.osTrue.cylinder.toFixed(2)} D<br />
                        A: {currentPatient.osTrue.axis}°
                      </div>
                      <div>
                        <span className="text-[#86868b] block">你的调试值:</span>
                        S: {os.sphere.toFixed(2)} D<br />
                        C: {os.cylinder.toFixed(2)} D<br />
                        A: {os.axis}°
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail list table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1d1d1f]">📊 六大步骤考核得分分解:</h4>
                <div className="border border-[#e5e5ea] rounded-lg overflow-hidden bg-white text-xs font-mono">
                  <div className="grid grid-cols-12 bg-[#f5f5f7] py-2 px-3 text-[10px] font-bold border-b border-[#e5e5ea] text-[#86868b] uppercase">
                    <span className="col-span-1">排</span>
                    <span className="col-span-4">考评步骤核心指标</span>
                    <span className="col-span-2 text-center">得分</span>
                    <span className="col-span-5">扣分细则及临床依据</span>
                  </div>
                  {scoresBreakdown.map((item) => (
                     <div
                      key={item.stepId}
                      className="grid grid-cols-12 py-2 px-3 items-center border-b border-[#e5e5ea] last:border-0 hover:bg-[#f5f5f7] text-[11px]"
                    >
                      <span className="col-span-1 text-[#86868b] font-bold">0{item.stepId}</span>
                      <span className="col-span-4 text-[#1d1d1f] truncate font-sans">{item.name}</span>
                      <span className="col-span-2 text-center font-bold text-[#0055ff]">
                        {item.score} <span className="text-[#86868b] text-[9px]">/ {item.maxScore}</span>
                      </span>
                      <span className="col-span-5 text-[#666] text-[10px] leading-relaxed font-sans">
                        {item.feedback ? item.feedback : "✅ 完全符合规范"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-[#e5e5ea] bg-[#f5f5f7] flex justify-end gap-3">
              <button
                onClick={() => setIsSubmitReportOpen(false)}
                className="px-4 py-2 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded-lg text-xs font-bold text-[#1d1d1f] transition-colors cursor-pointer"
              >
                返回继续实操
              </button>
              <button
                onClick={() => {
                  setIsSubmitReportOpen(false);
                  handleReset();
                }}
                className="px-5 py-2 bg-[#0055ff] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                重新开始实操
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 5. Interactive Instruction Manual Modal */}
      <InstructionManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  );
}
