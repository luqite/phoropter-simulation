import React from "react";
import { EyeState } from "../types";
import { normalizeAxis, roundTo025 } from "../utils";
import { Eye, EyeOff, RotateCcw, HelpCircle, RefreshCw } from "lucide-react";

interface OpticalControllerProps {
  od: EyeState;
  os: EyeState;
  targetEye: "OD" | "OS" | "OU";
  setTargetEye: (eye: "OD" | "OS" | "OU") => void;
  updateEyeState: (eye: "OD" | "OS", updates: Partial<EyeState>) => void;
  duochromeEnabled: boolean;
  setDuochromeEnabled: (val: boolean) => void;
  onActionCompensate: (eye: "OD" | "OS", cylinderChange: number) => void;
}

export const OpticalController: React.FC<OpticalControllerProps> = ({
  od,
  os,
  targetEye,
  setTargetEye,
  updateEyeState,
  duochromeEnabled,
  setDuochromeEnabled,
  onActionCompensate,
}) => {
  // Determine which eye(s) are active for adjustments
  const activeEyes: ("OD" | "OS")[] =
    targetEye === "OU" ? ["OD", "OS"] : [targetEye];

  // Helper to adjust values
  const adjustSphere = (amount: number) => {
    activeEyes.forEach((eye) => {
      const currentEye = eye === "OD" ? od : os;
      const newSphere = roundTo025(currentEye.sphere + amount);
      updateEyeState(eye, { sphere: newSphere });
    });
  };

  const adjustCylinder = (amount: number) => {
    activeEyes.forEach((eye) => {
      const currentEye = eye === "OD" ? od : os;
      // Cylinder in standard prescribing is negative. Keep it <= 0 for realistic simulation
      const newCylinder = roundTo025(currentEye.cylinder + amount);
      const clampedCylinder = Math.min(0, newCylinder);
      
      // Trigger compensation detection logic in parent
      onActionCompensate(eye, amount);
      
      updateEyeState(eye, { cylinder: clampedCylinder });
    });
  };

  const adjustAxis = (amount: number) => {
    activeEyes.forEach((eye) => {
      const currentEye = eye === "OD" ? od : os;
      const newAxis = normalizeAxis(currentEye.axis + amount);
      updateEyeState(eye, { axis: newAxis });
    });
  };

  // Turn JCC ON/OFF
  const toggleJcc = () => {
    activeEyes.forEach((eye) => {
      const currentEye = eye === "OD" ? od : os;
      const isCurrentlyActive = currentEye.jccActive;
      updateEyeState(eye, {
        jccActive: !isCurrentlyActive,
        jccFace: !isCurrentlyActive ? "face1" : null, // Set face1 when opening
      });
    });
  };

  // Cycle JCC Modes
  const setJccMode = (mode: "axis" | "power") => {
    activeEyes.forEach((eye) => {
      updateEyeState(eye, { jccMode: mode });
    });
  };

  // Flip JCC Faces
  const flipJcc = () => {
    activeEyes.forEach((eye) => {
      const currentEye = eye === "OD" ? od : os;
      if (currentEye.jccActive) {
        const nextFace = currentEye.jccFace === "face1" ? "face2" : "face1";
        updateEyeState(eye, { jccFace: nextFace });
      }
    });
  };

  // Set occlusion
  const toggleOccluded = (eye: "OD" | "OS") => {
    const currentEye = eye === "OD" ? od : os;
    updateEyeState(eye, { occluded: !currentEye.occluded });
  };

  // Toggle Prism Base-Up / Base-Down
  const setPrismState = (eye: "OD" | "OS", prism: "none" | "3BU" | "3BD") => {
    updateEyeState(eye, { prism });
  };

  const currentActiveEyeState = targetEye === "OD" ? od : os;

  return (
    <div className="w-full bg-white border border-[#d2d2d7] rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-6">
      {/* 1. Target Eye Selection & Status bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#e5e5ea]">
        <div>
          <span className="text-xs text-[#86868b] font-mono uppercase tracking-wider block mb-1">
            操作目标眼 (Target Selection)
          </span>
          <div className="flex bg-[#f5f5f7] p-1 rounded-lg border border-[#e5e5ea]">
            <button
              id="target-od-btn"
              onClick={() => setTargetEye("OD")}
              className={`px-4 py-2 font-sans font-semibold text-xs rounded-md transition-all ${
                targetEye === "OD"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-[#666] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]"
              }`}
            >
              右眼 (OD)
            </button>
            <button
              id="target-os-btn"
              onClick={() => setTargetEye("OS")}
              className={`px-4 py-2 font-sans font-semibold text-xs rounded-md transition-all ${
                targetEye === "OS"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-[#666] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]"
              }`}
            >
              左眼 (OS)
            </button>
            <button
              id="target-ou-btn"
              onClick={() => setTargetEye("OU")}
              className={`px-4 py-2 font-sans font-semibold text-xs rounded-md transition-all ${
                targetEye === "OU"
                  ? "bg-[#1d1d1f] text-white shadow-xs"
                  : "text-[#666] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]"
              }`}
            >
              双眼同步联调 (OU)
            </button>
          </div>
        </div>

        {/* Display lens summary at a glance */}
        <div className="grid grid-cols-2 gap-3 text-xs w-full md:w-auto">
          <div className={`p-2.5 rounded-lg border ${od.occluded ? "bg-[#f5f5f7] border-[#e5e5ea] text-[#86868b]" : "bg-white border-[#d2d2d7] text-[#1d1d1f]"}`}>
            <div className="flex justify-between items-center mb-1 gap-4">
              <span className="font-semibold text-[10px] text-[#0055ff]">右眼 (OD)</span>
              {od.occluded ? (
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-150 px-1 py-0.2 rounded font-mono">已遮盖</span>
              ) : (
                <span className="text-[10px] bg-[rgba(0,85,255,0.05)] text-[#0055ff] px-1 py-0.2 rounded font-mono">开启</span>
              )}
            </div>
            <div className="font-mono text-[11px] leading-relaxed">
              S: {od.sphere > 0 ? `+${od.sphere.toFixed(2)}` : od.sphere.toFixed(2)} D<br />
              C: {od.cylinder.toFixed(2)} D<br />
              A: {od.axis}°{od.prism !== "none" ? ` | P: ${od.prism}` : ""}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border ${os.occluded ? "bg-[#f5f5f7] border-[#e5e5ea] text-[#86868b]" : "bg-white border-[#d2d2d7] text-[#1d1d1f]"}`}>
            <div className="flex justify-between items-center mb-1 gap-4">
              <span className="font-semibold text-[10px] text-[#0055ff]">左眼 (OS)</span>
              {os.occluded ? (
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-150 px-1 py-0.2 rounded font-mono">已遮盖</span>
              ) : (
                <span className="text-[10px] bg-[rgba(0,85,255,0.05)] text-[#0055ff] px-1 py-0.2 rounded font-mono">开启</span>
              )}
            </div>
            <div className="font-mono text-[11px] leading-relaxed">
              S: {os.sphere > 0 ? `+${os.sphere.toFixed(2)}` : os.sphere.toFixed(2)} D<br />
              C: {os.cylinder.toFixed(2)} D<br />
              A: {os.axis}°{os.prism !== "none" ? ` | P: ${os.prism}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Phoropter Physical Head Simulator (综合验光仪仿生机械与度数同步仿真盘) */}
      <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-6 mb-2 flex flex-col items-center relative overflow-hidden shadow-2xl">
        {/* Dark clinic testing room backdrop Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        
        {/* Forehead Rest Indicator & PD Calibration Bracket */}
        <div className="relative flex flex-col items-center w-full max-w-lg mb-6 pt-5">
          {/* Top bracket mount */}
          <div className="w-16 h-4 bg-gradient-to-b from-zinc-700 via-zinc-400 to-zinc-650 rounded-t-md shadow-inner border border-zinc-500"></div>
          
          {/* Millimeter PD scale ruler slider */}
          <div className="h-6 w-48 bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700 rounded-md flex justify-between items-end px-3 pb-0.5 select-none relative font-mono text-[8px] text-zinc-400 shadow-md z-15">
            <span className="text-[6px] text-teal-400 font-sans absolute top-0.5 left-1/2 -translate-x-1/2 uppercase tracking-widest font-black scale-[0.8]">
              瞳距标尺 PD SLIDER
            </span>
            <span className="text-zinc-500">55</span>
            <span>|</span>
            <span className="text-zinc-500">60</span>
            <span className="text-white font-bold">|</span>
            <span className="text-zinc-500">65</span>
            <span>|</span>
            <span className="text-zinc-500">70</span>
            <span className="text-zinc-500">75</span>
            {/* Red slider pointer needle */}
            <div className="absolute left-[calc(50%-1px)] bottom-0 w-0.5 h-3 bg-red-500 shadow-sm z-20"></div>
          </div>

          {/* Core horizontal chrome balance bar */}
          <div className="w-full h-4 bg-gradient-to-r from-zinc-700 via-zinc-200 to-zinc-700 mt-1 rounded-full shadow-md border-t border-b border-zinc-100 flex items-center justify-between px-6 z-10 relative">
            {/* Mechanical screws and turning knobs at the ends */}
            <div className="w-2.5 h-6 rounded-sm bg-zinc-800 border border-zinc-600 -ml-1 flex flex-col justify-between">
              <div className="h-0.5 bg-zinc-500"></div>
              <div className="h-0.5 bg-zinc-500"></div>
            </div>
            
            {/* Centered Clinical Level bubble vial */}
            <div className="h-4 w-18 bg-zinc-950 rounded-full flex items-center justify-center relative border border-zinc-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" title="水平泡 (Level Vial)">
              <div className="w-2 h-2 rounded-full bg-emerald-400 absolute left-[calc(50%-4px)] shadow-xs flex items-center justify-center">
                <span className="w-0.5 h-0.5 rounded-full bg-white animate-ping"></span>
              </div>
              <span className="w-full text-[5px] text-zinc-600 absolute text-center font-mono tracking-widest leading-none select-none">| |</span>
            </div>

            <div className="w-2.5 h-6 rounded-sm bg-zinc-800 border border-zinc-600 -mr-1 flex flex-col justify-between">
              <div className="h-0.5 bg-zinc-500"></div>
              <div className="h-0.5 bg-zinc-500"></div>
            </div>
          </div>

          {/* Hanging patient breath shield */}
          <div className="absolute left-1/2 top-11 -translate-x-1/2 w-44 h-24 bg-white/5 border border-white/10 rounded-b-3xl backdrop-blur-xs flex flex-col items-center justify-end pb-2 opacity-55 z-0">
            <span className="text-[6px] font-sans text-white/30 tracking-widest uppercase scale-75 select-none">
              BREATH SHIELD 呼吸防雾板
            </span>
            <div className="w-14 h-8 bg-zinc-900/40 rounded-t-full border-t border-white/5 mt-1"></div>
          </div>
        </div>

        {/* Double mechanical battery turrets panel layout */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center justify-center py-2 w-full max-w-3xl z-10">
          
          {/* Heavy metal linking bar behind */}
          <div className="hidden md:block absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-64 h-3 bg-gradient-to-b from-zinc-800 via-zinc-400 to-zinc-900 border border-zinc-700 z-0 rounded-full pointer-events-none"></div>

          {/* ----------------- LEFT BATTERY POD (右眼 OD) ----------------- */}
          <div 
            id="phoropter-od-eyepiece"
            onClick={() => setTargetEye("OD")}
            className={`relative p-5 bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 border border-zinc-500 rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-2xl ${
              targetEye === "OD"
                ? "ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-[1.02]"
                : targetEye === "OU"
                  ? "ring-2 ring-slate-400/80 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.01]"
                  : "opacity-85 grayscale-[15%] hover:opacity-100 hover:scale-[1.005]"
            }`}
          >
            {/* Mechanical cast line ornament */}
            <div className="absolute inset-2 border border-zinc-400/60 rounded-[34px] pointer-events-none"></div>
            
            {/* OD Battery Ident label & screws */}
            <div className="flex justify-between items-center w-full mb-3 px-1.5 z-10">
              <span className="text-[10px] bg-gradient-to-r from-zinc-900 to-zinc-800 text-teal-400 font-mono tracking-tight font-black px-2 py-0.5 rounded border border-zinc-700 shadow-md">
                OD / 右眼
              </span>
              {/* Decorative machine screw heads */}
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-650 border border-zinc-500 flex items-center justify-center">
                  <div className="w-1.5 h-0.25 bg-zinc-700"></div>
                </div>
                {od.occluded ? (
                  <span className="text-[8px] bg-red-950 text-red-400 border border-red-800 font-bold px-1.5 rounded leading-none py-0.5 shadow-inner">
                    CLOSED 遮盖
                  </span>
                ) : (
                  <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-1.5 rounded leading-none py-0.5 shadow-inner">
                    ACTIVE 开放
                  </span>
                )}
              </div>
            </div>

            {/* INTEGRATED SPHERE QUICK-SHUTTLE THUMBWHEEL (右眼球镜大滑轮) */}
            <div 
              className="absolute left-[-22px] top-1/4 h-28 w-6 bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-950 rounded-l-lg border-t border-b border-l border-zinc-700 shadow-lg flex flex-col justify-between items-center py-1 z-20 group"
              title="外侧球镜DS粗调主轮 (Sphere Quick Wheel)"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustSphere(0.25); }}
                className="w-full text-zinc-400 hover:text-white text-[8px] font-black font-mono transition-colors text-center cursor-pointer select-none leading-none py-1 border-b border-zinc-800"
                title="增加 0.25 DS"
              >
                +
              </button>
              {/* knurled vertical metal ridges */}
              <div className="flex flex-col gap-1 w-full px-[3px]">
                <div className="h-[2px] bg-zinc-700 w-full rounded"></div>
                <div className="h-[2px] bg-zinc-600 w-full rounded"></div>
                <div className="h-[2px] bg-zinc-500 w-full rounded animate-pulse"></div>
                <div className="h-[2px] bg-zinc-600 w-full rounded"></div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustSphere(-0.25); }}
                className="w-full text-zinc-405 hover:text-white text-[8px] font-black font-mono transition-colors text-center cursor-pointer select-none leading-none py-1 border-t border-zinc-800"
                title="减少 0.25 DS"
              >
                -
              </button>
            </div>

            {/* Turrets rotation dial circle */}
            <div className="relative w-44 h-44 rounded-full bg-slate-900 border-4 border-zinc-700 shadow-2xl flex flex-col items-center justify-center p-2">
              
              {/* Internal brushed accent */}
              <div className="absolute inset-1 rounded-full border border-zinc-850 pointer-events-none"></div>

              {/* Physical Degree ticks markings (180 to 0) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none p-1 block text-zinc-650 opacity-65" viewBox="0 0 100 100">
                <line x1="50" y1="4" x2="50" y2="9" stroke="currentColor" strokeWidth="0.6" />
                <line x1="50" y1="91" x2="50" y2="96" stroke="currentColor" strokeWidth="0.6" />
                <line x1="4" y1="50" x2="9" y2="50" stroke="currentColor" strokeWidth="0.6" />
                <line x1="91" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,1" fill="none" />
                {/* Scale measurements */}
                <text x="50" y="15" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">90</text>
                <text x="50" y="89" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">90</text>
                <text x="14" y="52" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">180</text>
                <text x="86" y="52" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">0</text>
              </svg>

              {/* Degree indicator angle metal needle */}
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${od.axis}deg)` }}
              >
                {/* Physical thin red pointer line */}
                <div className="absolute w-[1.5px] h-1/2 bg-rose-500 top-0 origin-bottom shadow-xs">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rotate-45 border-r border-[#6f1d1d] border-b"></div>
                </div>
                <div className="absolute w-[2px] h-1/5 bg-zinc-600 bottom-0 origin-top"></div>
              </div>

              {/* INTEGRATED CORE PARAMETER METERS */}
              {/* Sphere meter */}
              <div className="absolute top-4 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">SPHERE 球</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-tight">
                  {od.sphere > 0 ? `+${od.sphere.toFixed(2)}` : od.sphere.toFixed(2)} DS
                </span>
              </div>

              {/* Cylinder meter */}
              <div className="absolute bottom-4 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">CYLINDER 柱</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-tight">
                  {od.cylinder.toFixed(2)} DC
                </span>
              </div>

              {/* Axis angle meter */}
              <div className="absolute left-3 bg-zinc-950 border border-zinc-800 rounded px-1 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">AXIS 轴</span>
                <span className="text-[9px] font-mono text-amber-500 font-bold">
                  {od.axis}°
                </span>
              </div>

              {/* Auxiliary state meter */}
              <div className="absolute right-3 bg-zinc-950 border border-zinc-800 rounded px-1 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">AUX 辅</span>
                <span className="text-[8px] font-mono text-blue-400 font-bold leading-none">
                  {od.occluded ? "OCC" : od.prism !== "none" ? od.prism : "LENS"}
                </span>
              </div>

              {/* Optical Lens viewport slot */}
              <div className={`relative w-22 h-22 rounded-full border-4 flex items-center justify-center transition-all duration-300 z-10 overflow-hidden ${
                od.occluded
                  ? "bg-zinc-850 border-red-650"
                  : "bg-slate-905 border-zinc-650 shadow-[inset_0_0_15px_rgba(59,130,246,0.25)]"
              }`}>
                {/* Real-time reflection gloss */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-12 pointer-events-none"></div>

                {od.occluded ? (
                  <div className="absolute inset-0 bg-zinc-850 p-1 flex flex-col items-center justify-center border border-red-950 animate-in fade-in duration-200">
                    <span className="text-[7px] text-red-500 font-sans font-black tracking-widest leading-none">遮盖中</span>
                    <span className="text-[5px] text-red-500/80 font-mono scale-[0.8] tracking-tighter">OCCLUDED</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleOccluded("OD"); }}
                      className="mt-1 px-1.5 py-0.5 bg-red-900 hover:bg-red-800 text-white rounded font-bold text-[7px] border border-red-700 cursor-pointer pointer-events-auto shadow-2xs"
                    >
                      开启
                    </button>
                  </div>
                ) : (
                  <>
                    {/* JCC Swing glass frame */}
                    {od.jccActive && (
                      <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-full animate-pulse flex flex-col items-center justify-center">
                        <span className="text-[7px] bg-red-650 text-white px-1 leading-none font-extrabold rounded select-none scale-[0.8] absolute top-1 uppercase">
                          {od.jccFace === "face1" ? "Face 1" : "Face 2"}
                        </span>
                        <div className="absolute w-full h-0.25 bg-red-500/60"></div>
                        <div className="absolute h-full w-0.25 bg-white/60"></div>
                        {/* Dot markers */}
                        <div className="absolute w-2 h-2 rounded-full bg-red-650 border border-zinc-900 left-0.5"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-red-650 border border-zinc-900 right-0.5"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-white border border-zinc-900 top-0.5"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-white border border-zinc-900 bottom-0.5"></div>
                      </div>
                    )}

                    {/* Prism 3▲BU filter glass */}
                    {od.prism !== "none" && (
                      <div className="absolute inset-1 bg-blue-500/10 flex flex-col items-center justify-center pointer-events-none border border-blue-400/30 rounded-sm">
                        <span className="text-[6px] font-black text-blue-400 tracking-tight leading-none uppercase">
                          {od.prism} PLACED
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Physical JCC swing arm base connector details */}
            <div className="absolute right-0 bottom-4 w-12 h-12 flex items-center justify-center pointer-events-none">
              <div 
                className="w-1.5 h-16 bg-gradient-to-b from-zinc-400 to-zinc-650 border border-zinc-500 rounded-full origin-top transition-transform duration-500"
                style={{ transform: od.jccActive ? "rotate(-45deg) translate(-5px, 5px)" : "rotate(-110deg)" }}
              >
                {/* Joint screw and circular ring on end */}
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-zinc-350 to-zinc-500 border border-zinc-500 absolute -bottom-1 -left-1 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-850"></div>
                </div>
              </div>
            </div>

            {/* Direct Dial manual quick microadjust wheels */}
            <div className="flex flex-col items-center w-full mt-3 pt-2 border-t border-zinc-400/60 z-10">
              <span className="text-[8px] text-zinc-705 uppercase font-mono tracking-widest font-black mb-1">
                OD 旋钮直调微调轮
              </span>
              <div className="grid grid-cols-3 gap-2.5 w-full text-center">
                
                {/* DS dial button */}
                <div className="bg-zinc-100 p-1 rounded border border-zinc-400/80 flex flex-col items-center shadow-inner">
                  <span className="text-[7px] font-bold text-zinc-650 block leading-tight">球镜(DS)</span>
                  <div className="flex gap-1 w-full justify-between mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustSphere(-0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-rose-700 font-bold rounded cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustSphere(0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-[#14532d] font-bold rounded cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* DC dial button */}
                <div className="bg-zinc-100 p-1 rounded border border-zinc-400/80 flex flex-col items-center shadow-inner">
                  <span className="text-[7px] font-bold text-zinc-650 block leading-tight">柱镜(DC)</span>
                  <div className="flex gap-1 w-full justify-between mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustCylinder(-0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-rose-700 font-bold rounded cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustCylinder(0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-[#14532d] font-bold rounded cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Axis dial buttons */}
                <div className="bg-zinc-100 p-1 rounded border border-zinc-400/80 flex flex-col items-center shadow-inner">
                  <span className="text-[7px] font-bold text-zinc-650 block leading-tight">轴向(Ax)</span>
                  <div className="flex gap-1.5 w-full justify-between mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustAxis(-5); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-zinc-800 font-bold rounded cursor-pointer text-[10px]"
                      title="逆旋5°"
                    >
                      ↺
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OD"); adjustAxis(5); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-zinc-800 font-bold rounded cursor-pointer text-[10px]"
                      title="顺旋5°"
                    >
                      ↻
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ----------------- LEFT BATTERY POD (左眼 OS) ----------------- */}
          <div 
            id="phoropter-os-eyepiece"
            onClick={() => setTargetEye("OS")}
            className={`relative p-5 bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 border border-zinc-500 rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-2xl ${
              targetEye === "OS"
                ? "ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-[1.02]"
                : targetEye === "OU"
                  ? "ring-2 ring-slate-400/80 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.01]"
                  : "opacity-85 grayscale-[15%] hover:opacity-100 hover:scale-[1.005]"
            }`}
          >
            {/* Mechanical cast line ornament */}
            <div className="absolute inset-2 border border-zinc-400/60 rounded-[34px] pointer-events-none"></div>

            {/* OS Battery Ident label & screws */}
            <div className="flex justify-between items-center w-full mb-3 px-1.5 z-10">
              <span className="text-[10px] bg-gradient-to-r from-zinc-900 to-zinc-800 text-teal-400 font-mono tracking-tight font-black px-2 py-0.5 rounded border border-zinc-700 shadow-md">
                OS / 左眼
              </span>
              {/* Decorative machine screw heads */}
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-650 border border-zinc-500 flex items-center justify-center">
                  <div className="w-1.5 h-0.25 bg-zinc-700"></div>
                </div>
                {os.occluded ? (
                  <span className="text-[8px] bg-red-950 text-red-400 border border-red-800 font-bold px-1.5 rounded leading-none py-0.5 shadow-inner">
                    CLOSED 遮盖
                  </span>
                ) : (
                  <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-1.5 rounded leading-none py-0.5 shadow-inner">
                    ACTIVE 开启
                  </span>
                )}
              </div>
            </div>

            {/* INTEGRATED SPHERE QUICK-SHUTTLE THUMBWHEEL (左眼球镜大滑轮) */}
            <div 
              className="absolute right-[-22px] top-1/4 h-28 w-6 bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-950 rounded-r-lg border-t border-b border-r border-zinc-700 shadow-lg flex flex-col justify-between items-center py-1 z-20 group"
              title="外侧球镜DS粗调主轮 (Sphere Quick Wheel)"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustSphere(0.25); }}
                className="w-full text-zinc-400 hover:text-white text-[8px] font-black font-mono transition-colors text-center cursor-pointer select-none leading-none py-1 border-b border-zinc-800"
                title="增加 0.25 DS"
              >
                +
              </button>
              {/* knurled vertical metal ridges */}
              <div className="flex flex-col gap-1 w-full px-[3px]">
                <div className="h-[2px] bg-zinc-700 w-full rounded"></div>
                <div className="h-[2px] bg-zinc-600 w-full rounded"></div>
                <div className="h-[2px] bg-zinc-500 w-full rounded animate-pulse"></div>
                <div className="h-[2px] bg-zinc-600 w-full rounded"></div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustSphere(-0.25); }}
                className="w-full text-zinc-405 hover:text-white text-[8px] font-black font-mono transition-colors text-center cursor-pointer select-none leading-none py-1 border-t border-zinc-800"
                title="减少 0.25 DS"
              >
                -
              </button>
            </div>

            {/* Turrets rotation dial circle */}
            <div className="relative w-44 h-44 rounded-full bg-slate-900 border-4 border-zinc-700 shadow-2xl flex flex-col items-center justify-center p-2">
              
              {/* Internal brushed accent */}
              <div className="absolute inset-1 rounded-full border border-zinc-850 pointer-events-none"></div>

              {/* Physical Degree ticks markings (180 to 0) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none p-1 block text-zinc-655 opacity-65" viewBox="0 0 100 100">
                <line x1="50" y1="4" x2="50" y2="9" stroke="currentColor" strokeWidth="0.6" />
                <line x1="50" y1="91" x2="50" y2="96" stroke="currentColor" strokeWidth="0.6" />
                <line x1="4" y1="50" x2="9" y2="50" stroke="currentColor" strokeWidth="0.6" />
                <line x1="91" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,1" fill="none" />
                {/* Scale measurements */}
                <text x="50" y="15" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">90</text>
                <text x="50" y="89" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">90</text>
                <text x="14" y="52" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">180</text>
                <text x="86" y="52" textAnchor="middle" fontSize="4.5" fill="currentColor" fontWeight="bold">0</text>
              </svg>

              {/* Degree indicator angle metal needle */}
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${os.axis}deg)` }}
              >
                {/* Physical thin red pointer line */}
                <div className="absolute w-[1.5px] h-1/2 bg-rose-500 top-0 origin-bottom shadow-xs">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rotate-45 border-r border-[#6f1d1d] border-b"></div>
                </div>
                <div className="absolute w-[2px] h-1/5 bg-zinc-600 bottom-0 origin-top"></div>
              </div>

              {/* INTEGRATED CORE PARAMETER METERS */}
              {/* Sphere meter */}
              <div className="absolute top-4 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">SPHERE 球</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-tight">
                  {os.sphere > 0 ? `+${os.sphere.toFixed(2)}` : os.sphere.toFixed(2)} DS
                </span>
              </div>

              {/* Cylinder meter */}
              <div className="absolute bottom-4 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">CYLINDER 柱</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-tight">
                  {os.cylinder.toFixed(2)} DC
                </span>
              </div>

              {/* Axis angle meter */}
              <div className="absolute left-3 bg-zinc-950 border border-zinc-800 rounded px-1 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">AXIS 轴</span>
                <span className="text-[9px] font-mono text-amber-500 font-bold">
                  {os.axis}°
                </span>
              </div>

              {/* Auxiliary state meter */}
              <div className="absolute right-3 bg-zinc-950 border border-zinc-800 rounded px-1 py-0.2 select-none z-10 flex flex-col items-center shadow-md">
                <span className="text-[5px] text-zinc-550 uppercase leading-none font-bold">AUX 辅</span>
                <span className="text-[8px] font-mono text-blue-400 font-bold leading-none">
                  {os.occluded ? "OCC" : os.prism !== "none" ? os.prism : "LENS"}
                </span>
              </div>

              {/* Optical Lens viewport slot */}
              <div className={`relative w-22 h-22 rounded-full border-4 flex items-center justify-center transition-all duration-300 z-10 overflow-hidden ${
                os.occluded
                  ? "bg-zinc-850 border-red-650"
                  : "bg-slate-905 border-zinc-650 shadow-[inset_0_0_15px_rgba(59,130,246,0.25)]"
              }`}>
                {/* Real-time reflection gloss */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-12 pointer-events-none"></div>

                {os.occluded ? (
                  <div className="absolute inset-0 bg-zinc-850 p-1 flex flex-col items-center justify-center border border-red-950 animate-in fade-in duration-200">
                    <span className="text-[7px] text-red-500 font-sans font-black tracking-widest leading-none">遮盖中</span>
                    <span className="text-[5px] text-red-500/80 font-mono scale-[0.8] tracking-tighter">OCCLUDED</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleOccluded("OS"); }}
                      className="mt-1 px-1.5 py-0.5 bg-red-900 hover:bg-red-800 text-white rounded font-bold text-[7px] border border-red-700 cursor-pointer pointer-events-auto shadow-2xs"
                    >
                      开启
                    </button>
                  </div>
                ) : (
                  <>
                    {/* JCC Swing glass frame */}
                    {os.jccActive && (
                      <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-full animate-pulse flex flex-col items-center justify-center">
                        <span className="text-[7px] bg-red-650 text-white px-1 leading-none font-extrabold rounded select-none scale-[0.8] absolute top-1 uppercase">
                          {os.jccFace === "face1" ? "Face 1" : "Face 2"}
                        </span>
                        <div className="absolute w-full h-0.25 bg-red-500/60"></div>
                        <div className="absolute h-full w-0.25 bg-white/60"></div>
                        {/* Dot markers */}
                        <div className="absolute w-2 h-2 rounded-full bg-red-650 border border-zinc-900 left-0.5"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-red-650 border border-zinc-900 right-0.5"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-white border border-zinc-900 top-0.5"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-white border border-zinc-900 bottom-0.5"></div>
                      </div>
                    )}

                    {/* Prism 3▲BD filter glass */}
                    {os.prism !== "none" && (
                      <div className="absolute inset-1 bg-blue-500/10 flex flex-col items-center justify-center pointer-events-none border border-blue-400/30 rounded-sm">
                        <span className="text-[6px] font-black text-blue-400 tracking-tight leading-none uppercase">
                          {os.prism} PLACED
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Physical JCC swing arm base connector details */}
            <div className="absolute left-0 bottom-4 w-12 h-12 flex items-center justify-center pointer-events-none">
              <div 
                className="w-1.5 h-16 bg-gradient-to-b from-zinc-400 to-zinc-650 border border-zinc-500 rounded-full origin-top transition-transform duration-500"
                style={{ transform: os.jccActive ? "rotate(45deg) translate(5px, 5px)" : "rotate(110deg)" }}
              >
                {/* Joint screw and circular ring on end */}
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-zinc-350 to-zinc-500 border border-zinc-500 absolute -bottom-1 -left-1 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-850"></div>
                </div>
              </div>
            </div>

            {/* Direct Dial manual quick microadjust wheels */}
            <div className="flex flex-col items-center w-full mt-3 pt-2 border-t border-zinc-400/60 z-10">
              <span className="text-[8px] text-zinc-705 uppercase font-mono tracking-widest font-black mb-1">
                OS 旋钮直调微调轮
              </span>
              <div className="grid grid-cols-3 gap-2.5 w-full text-center">
                
                {/* DS dial button */}
                <div className="bg-zinc-100 p-1 rounded border border-zinc-400/80 flex flex-col items-center shadow-inner">
                  <span className="text-[7px] font-bold text-zinc-650 block leading-tight">球镜(DS)</span>
                  <div className="flex gap-1 w-full justify-between mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustSphere(-0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-rose-700 font-bold rounded cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustSphere(0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-[#14532d] font-bold rounded cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* DC dial button */}
                <div className="bg-zinc-100 p-1 rounded border border-zinc-400/80 flex flex-col items-center shadow-inner">
                  <span className="text-[7px] font-bold text-zinc-650 block leading-tight">柱镜(DC)</span>
                  <div className="flex gap-1 w-full justify-between mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustCylinder(-0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-rose-700 font-bold rounded cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustCylinder(0.25); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-[#14532d] font-bold rounded cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Axis dial buttons */}
                <div className="bg-zinc-100 p-1 rounded border border-zinc-400/80 flex flex-col items-center shadow-inner">
                  <span className="text-[7px] font-bold text-zinc-650 block leading-tight">轴向(Ax)</span>
                  <div className="flex gap-1.5 w-full justify-between mt-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustAxis(-5); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-zinc-800 font-bold rounded cursor-pointer text-[10px]"
                      title="逆旋5°"
                    >
                      ↺
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTargetEye("OS"); adjustAxis(5); }}
                      className="w-5 py-0.5 bg-zinc-300 hover:bg-zinc-450 text-zinc-800 font-bold rounded cursor-pointer text-[10px]"
                      title="顺旋5°"
                    >
                      ↻
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Primary Optometric Knobs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sphere (球镜) Control Block */}
        <div className="bg-[#f5f5f7] p-4 rounded-lg border border-[#e5e5ea] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#1d1d1f]">球镜调节 (Sphere)</span>
              <span className="text-[10px] font-mono text-[#86868b]">步长: 0.25D</span>
            </div>
            <p className="text-[11px] text-[#666] mb-4 h-8 leading-normal">
              调整光线前后焦点。近视增加负球镜度，远视增加正球镜度。
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Standard display */}
            <div className="text-xl md:text-2xl font-mono py-1 px-4 bg-white border border-[#d2d2d7] rounded-lg text-[#0055ff] font-bold w-full text-center tracking-tight shadow-2xs">
              {targetEye === "OU"
                ? `OD:${od.sphere.toFixed(2)} / OS:${os.sphere.toFixed(2)}`
                : `${currentActiveEyeState.sphere.toFixed(2)} DS`}
            </div>

            {/* Tuning buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                id="sphere-down-btn"
                onClick={() => adjustSphere(-0.25)}
                className="py-2 px-3 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded font-mono text-xs font-semibold text-rose-600 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                -0.25 DS
              </button>
              <button
                id="sphere-up-btn"
                onClick={() => adjustSphere(0.25)}
                className="py-2 px-3 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded font-mono text-xs font-semibold text-[#14532d] active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                +0.25 DS
              </button>
            </div>
            
            {/* Quick Large steps */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={() => adjustSphere(-1.00)}
                className="py-1 bg-[#e8e8ed] hover:bg-[#d2d2d7] rounded font-mono text-[10px] text-[#555] cursor-pointer"
              >
                -1.00 DS (快)
              </button>
              <button
                onClick={() => adjustSphere(1.00)}
                className="py-1 bg-[#e8e8ed] hover:bg-[#d2d2d7] rounded font-mono text-[10px] text-[#555] cursor-pointer"
              >
                +1.00 DS (快)
              </button>
            </div>
          </div>
        </div>

        {/* Cylinder (柱镜) Control Block */}
        <div className="bg-[#f5f5f7] p-4 rounded-lg border border-[#e5e5ea] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#1d1d1f]">柱镜调节 (Cylinder)</span>
              <span className="text-[10px] font-mono text-[#86868b]">步长: 0.25D</span>
            </div>
            <p className="text-[11px] text-[#666] mb-4 h-8 leading-normal">
              校正散光度数。使用负柱镜。增减柱镜需注意等效球镜规则补偿。
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Standard display */}
            <div className="text-xl md:text-2xl font-mono py-1 px-4 bg-white border border-[#d2d2d7] rounded-lg text-[#0055ff] font-bold w-full text-center tracking-tight shadow-2xs">
              {targetEye === "OU"
                ? `OD:${od.cylinder.toFixed(2)} / OS:${os.cylinder.toFixed(2)}`
                : `${currentActiveEyeState.cylinder.toFixed(2)} DC`}
            </div>

            {/* Tuning buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                id="cylinder-down-btn"
                onClick={() => adjustCylinder(-0.25)}
                className="py-2 px-3 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded font-mono text-xs font-semibold text-rose-600 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                -0.25 DC
              </button>
              <button
                id="cylinder-up-btn"
                onClick={() => adjustCylinder(0.25)}
                className="py-2 px-3 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded font-mono text-xs font-semibold text-[#14532d] active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                +0.25 DC
              </button>
            </div>

            <div className="text-[10px] text-[#666] leading-normal text-center bg-white p-1.5 rounded border border-[#e5e5ea] font-mono w-full shadow-2xs">
              等效球镜规则: 调整 -0.50DC，需补 +0.25DS
            </div>
          </div>
        </div>

        {/* Axis (轴位) Control Block */}
        <div className="bg-[#f5f5f7] p-4 rounded-lg border border-[#e5e5ea] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#1d1d1f]">轴向调节 (Axis)</span>
              <span className="text-[10px] font-mono text-[#86868b]">范围: 1°-180°</span>
            </div>
            <p className="text-[11px] text-[#666] mb-4 h-8 leading-normal">
              散光光片子午线方向。通过JCC红白点翻转比对确定精准轴位。
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Standard display */}
            <div className="text-xl md:text-2xl font-mono py-1 px-4 bg-white border border-[#d2d2d7] rounded-lg text-[#0055ff] font-bold w-full text-center tracking-tight shadow-2xs">
              {targetEye === "OU"
                ? `OD:${od.axis}° / OS:${os.axis}°`
                : `${currentActiveEyeState.axis}°`}
            </div>

            {/* Tuning buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                id="axis-down-btn"
                onClick={() => adjustAxis(-5)}
                className="py-2 px-3 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded font-mono text-xs font-semibold text-[#1d1d1f] active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                -5° 逆旋
              </button>
              <button
                id="axis-up-btn"
                onClick={() => adjustAxis(5)}
                className="py-2 px-3 bg-white hover:bg-[#e8e8ed] border border-[#d2d2d7] rounded font-mono text-xs font-semibold text-[#1d1d1f] active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                +5° 顺旋
              </button>
            </div>

            {/* JCC "进15退10" Quick Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full border-t border-[#e5e5ea] pt-2">
              <button
                id="fast-axis-add15"
                onClick={() => adjustAxis(15)}
                className="py-1 px-1 bg-white hover:bg-[#f5f5f7] border border-[#d2d2d7] rounded text-[10px] font-mono text-[#555] cursor-pointer"
                title="进15位（增加15度）"
              >
                +15° 快捷
              </button>
              <button
                id="fast-axis-sub10"
                onClick={() => adjustAxis(-10)}
                className="py-1 px-1 bg-white hover:bg-[#f5f5f7] border border-[#d2d2d7] rounded text-[10px] font-mono text-[#555] cursor-pointer"
                title="退10位（减少10度）"
              >
                -10° 快捷
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. JCC Jackson Cross-Cylinder Operator Console */}
      <div className="bg-white p-4 border border-[#d2d2d7] rounded-lg flex flex-col gap-4 shadow-2xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h4 className="text-xs font-bold text-[#1d1d1f] flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 text-[#0055ff] ${currentActiveEyeState.jccActive ? "animate-spin" : ""}`} />
              JCC 交叉柱镜控制终端 (Jackson Cross-Cylinder)
            </h4>
            <span className="text-[10px] text-[#666]">
              主要进行散光精细调节。先追轴（红移至清晰面），再校度（散光大小校验）。
            </span>
          </div>

          <button
            id="jcc-toggle-btn"
            onClick={toggleJcc}
            className={`px-4 py-1.5 font-bold rounded-lg text-xs tracking-wider uppercase border active:scale-95 transition-all cursor-pointer ${
              currentActiveEyeState.jccActive
                ? "bg-red-600 text-white border-red-700 shadow-sm"
                : "bg-[#f5f5f7] text-[#666] border-[#d2d2d7] hover:bg-[#e8e8ed]"
            }`}
          >
            {currentActiveEyeState.jccActive ? "● 正在使用 JCC" : "启用 JCC 交叉柱镜"}
          </button>
        </div>

        {currentActiveEyeState.jccActive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#e5e5ea] pt-3">
            {/* Mode Toggle */}
            <div className="flex flex-col justify-center gap-1.5 bg-[#f5f5f7] p-3 rounded-lg border border-[#e5e5ea]">
              <span className="text-[10px] font-bold text-[#86868b] block mb-0.5">JCC 校验模式</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="jcc-mode-axis"
                  onClick={() => setJccMode("axis")}
                  className={`py-1.5 px-2 text-[11px] rounded transition-all font-bold cursor-pointer ${
                    currentActiveEyeState.jccMode === "axis"
                      ? "bg-[#0055ff] text-white shadow-xs"
                      : "bg-white text-[#666] border border-[#d2d2d7] hover:bg-[#e8e8ed]"
                  }`}
                >
                  1. 追轴 (Axis)
                </button>
                <button
                  id="jcc-mode-power"
                  onClick={() => setJccMode("power")}
                  className={`py-1.5 px-2 text-[11px] rounded transition-all font-bold cursor-pointer ${
                    currentActiveEyeState.jccMode === "power"
                      ? "bg-[#0055ff] text-white shadow-xs"
                      : "bg-white text-[#666] border border-[#d2d2d7] hover:bg-[#e8e8ed]"
                  }`}
                >
                  2. 校度 (Power)
                </button>
              </div>
            </div>

            {/* Flip control */}
            <div className="flex flex-col justify-center gap-1.5 bg-[#f5f5f7] p-3 rounded-lg border border-[#e5e5ea]">
              <span className="text-[10px] font-bold text-[#86868b] block">JCC 翻转两面</span>
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      currentActiveEyeState.jccFace === "face1" ? "bg-amber-500" : "bg-purple-600"
                    }`}
                  ></span>
                  <span className="text-xs text-[#1d1d1f] font-mono font-bold">
                    {currentActiveEyeState.jccFace === "face1" ? "第一面 (Face 1)" : "第二面 (Face 2)"}
                  </span>
                </div>
                <button
                  id="jcc-flip-btn"
                  onClick={flipJcc}
                  className="px-3 py-1 bg-[#0055ff] hover:bg-blue-600 text-white font-bold rounded text-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3 animate-spin duration-1000" />
                  切换
                </button>
              </div>
            </div>

            {/* Hint Box for Student */}
            <div className="bg-[#fff9e6] p-3 rounded-lg border border-[#ffe58f] text-[10px] text-amber-950 flex flex-col justify-center leading-normal">
              {currentActiveEyeState.jccMode === "axis" ? (
                <span>
                  <strong>“追轴”指引:</strong> 翻转比对：若某一面更清晰，将试镜轴向朝其<strong>负轴红点</strong>方向旋进。二面等清即为准确轴向。
                </span>
              ) : (
                <span>
                  <strong>“校度”指引:</strong> 若负度数面清，追加负散；若翻转感觉相反，减负散。注意<strong>散光增减0.50D时对应的0.25D球镜反向补偿</strong>。
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Secondary/Helper Terminal (棱镜、遮盖、红绿切换) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#e5e5ea] pt-4">
        {/* Occlusion (遮盖状态管理) */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-[#86868b] font-mono uppercase tracking-wider">
            遮盖控制眼 (Occlude Single Eye)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="occlude-od-btn"
              onClick={() => toggleOccluded("OD")}
              className={`py-2 px-3 border rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                od.occluded
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-white text-[#1d1d1f] border-[#d2d2d7] hover:bg-[#f5f5f7]"
              }`}
            >
              {od.occluded ? <EyeOff className="w-3.5 h-3.5 text-red-600" /> : <Eye className="w-3.5 h-3.5 text-[#0055ff]" />}
              右眼 OD {od.occluded ? "已遮盖" : "光通"}
            </button>
            <button
              id="occlude-os-btn"
              onClick={() => toggleOccluded("OS")}
              className={`py-2 px-3 border rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                os.occluded
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-white text-[#1d1d1f] border-[#d2d2d7] hover:bg-[#f5f5f7]"
              }`}
            >
              {os.occluded ? <EyeOff className="w-3.5 h-3.5 text-red-600" /> : <Eye className="w-3.5 h-3.5 text-[#0055ff]" />}
              左眼 OS {os.occluded ? "已遮盖" : "光通"}
            </button>
          </div>
        </div>

        {/* Vertical Prisms (棱镜设置 - 专用于双眼平衡分像) */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-[#86868b] font-mono uppercase tracking-wider">
            双眼分像棱镜 (Prisms Separation)
          </span>
          <div className="grid grid-cols-3 gap-1 bg-[#f5f5f7] p-1 rounded-lg border border-[#e5e5ea]">
            <button
              id="prism-od-3bu-btn"
              onClick={() => {
                setPrismState("OD", "3BU");
                setPrismState("OS", "3BD");
              }}
              className={`py-1.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                od.prism === "3BU" && os.prism === "3BD"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-[#666] hover:text-[#1d1d1f]"
              }`}
              title="OD 3BU 与 OS 3BD 同时移入"
            >
              置入平衡镜
            </button>
            <button
              id="prism-reset-btn"
              onClick={() => {
                setPrismState("OD", "none");
                setPrismState("OS", "none");
              }}
              className={`py-1.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                od.prism === "none" && os.prism === "none"
                  ? "bg-white border border-[#d2d2d7] text-[#1d1d1f]"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              移出棱镜 (None)
            </button>
            <div className="text-[9px] text-[#0055ff] flex items-center justify-center font-mono select-none px-1 text-center bg-white border border-[#e5e5ea] rounded">
              {od.prism === "3BU" ? "OD:3BU/OS:3BD" : "状态: 无棱镜"}
            </div>
          </div>
        </div>

        {/* Duochrome Background control */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-[#86868b] font-mono uppercase tracking-wider">
            视力表背景切换 (Duochrome Test)
          </span>
          <button
            id="duochrome-toggle-btn"
            onClick={() => setDuochromeEnabled(!duochromeEnabled)}
            className={`py-2 px-3 border rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              duochromeEnabled
                ? "bg-[rgba(0,85,255,0.05)] border-[#0055ff] text-[#0055ff] font-bold shadow-xs animate-pulse"
                : "bg-white text-[#666] border-[#d2d2d7] hover:border-[#1d1d1f]"
            }`}
          >
            <div className="flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            </div>
            红绿比对测试: {duochromeEnabled ? "已开启" : "已关闭"}
          </button>
        </div>
      </div>
    </div>
  );
};
