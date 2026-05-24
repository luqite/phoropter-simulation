import React from "react";
import { EyeState, Prescription } from "../types";
import { EYE_CHART_ROWS, CHART_ROTATION_MAP } from "../data";
import { analyzeEyeRefraction } from "../utils";
import { Eye } from "lucide-react";

interface VisualChartProps {
  od: EyeState;
  os: EyeState;
  odTrue: Prescription;
  osTrue: Prescription;
  duochromeEnabled: boolean;
  activeStepId: number;
}

export const VisualChart: React.FC<VisualChartProps> = ({
  od,
  os,
  odTrue,
  osTrue,
  duochromeEnabled,
  activeStepId,
}) => {
  // Check if both eyes are unoccluded and vertical split prism is added
  const isPrismSplit =
    !od.occluded &&
    !os.occluded &&
    (od.prism === "3BU" || os.prism === "3BD");

  // Helper to render a single chart based on an eye state and true prescription
  const renderSingleChart = (
    eyeLabel: string,
    eyeState: EyeState,
    truePrescription: Prescription,
    sideLabel: string = ""
  ) => {
    // Standard visual analysis
    const analysis = analyzeEyeRefraction(eyeState, truePrescription);

    return (
      <div className="relative flex flex-col items-center bg-white p-4 rounded-lg border border-[#d2d2d7] shadow-sm h-full select-none">
        {/* Eye Indicator tag */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-[#f5f5f7] border border-[#e5e5ea] text-[#0055ff] font-bold">
          <Eye className="w-3.5 h-3.5" />
          <span>{eyeLabel}</span>
          {sideLabel && <span className="opacity-60">| {sideLabel}</span>}
        </div>

        {/* VA metrics indicator for training help */}
        <div className="absolute top-2 right-2 text-[10px] font-mono text-[#666] bg-[#f5f5f7] px-2 py-0.5 rounded border border-[#e5e5ea]">
          参考视力: {(analysis.visualAcuity).toFixed(2)} (约 {formatDecimalToSnellen(analysis.visualAcuity)})
        </div>

        <div className="w-full mt-6 flex flex-col justify-between flex-grow min-h-[360px]">
          {duochromeEnabled ? (
            // Red-Green Split Chart (Duochrome Test)
            <div className="flex w-full h-full flex-grow gap-1 items-stretch rounded-lg overflow-hidden border border-[#d2d2d7]">
              {/* Left Side: RED Background (Focus shifted +0.22D Myopic defocus) */}
              <div className="flex-1 bg-red-100/90 relative flex flex-col items-center justify-center p-3">
                <div className="absolute top-1 text-[9px] font-mono font-bold text-red-700 tracking-wider">RED MERIDIAN (+0.22D)</div>
                <div 
                  className="w-full flex flex-col justify-around transition-all duration-300 flex-grow"
                  style={{
                    filter: `blur(${calculateRedGreenBlur(eyeState, truePrescription, +0.22)}px)`
                  }}
                >
                  {EYE_CHART_ROWS.slice(0, 8).map((row) => (
                    <div key={`red-${row.version}`} className="flex items-center justify-between w-full px-2">
                       <span className="text-[10px] font-mono text-red-700/80 w-8">{row.version}</span>
                      <div className="flex gap-4 justify-center items-center flex-grow">
                        {row.items.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            style={{ fontSize: `${row.size}px` }}
                            className={`inline-block font-sans font-black text-[#1d1d1f] transition-transform ${CHART_ROTATION_MAP[item]}`}
                          >
                            E
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: GREEN Background (Focus shifted -0.22D Hyperopic defocus) */}
              <div className="flex-1 bg-emerald-100/90 relative flex flex-col items-center justify-center p-3">
                <div className="absolute top-1 text-[9px] font-mono font-bold text-[#14532d] tracking-wider">GREEN MERIDIAN (-0.22D)</div>
                <div 
                  className="w-full flex flex-col justify-around transition-all duration-300 flex-grow"
                  style={{
                    filter: `blur(${calculateRedGreenBlur(eyeState, truePrescription, -0.22)}px)`
                  }}
                >
                  {EYE_CHART_ROWS.slice(0, 8).map((row) => (
                    <div key={`green-${row.version}`} className="flex items-center justify-between w-full px-2">
                      <span className="text-[10px] font-mono text-emerald-800/80 w-8">{row.version}</span>
                      <div className="flex gap-4 justify-center items-center flex-grow">
                        {row.items.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            style={{ fontSize: `${row.size}px` }}
                            className={`inline-block font-sans font-black text-[#1d1d1f] transition-transform ${CHART_ROTATION_MAP[item]}`}
                          >
                            E
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Standard Black/White Lightbox Chart
            <div 
              className="w-full flex-grow flex flex-col justify-around py-2 px-1 transition-all duration-200 bg-white rounded-lg p-3 border border-[#e5e5ea]"
              style={{ filter: `blur(${analysis.blurPx}px)` }}
            >
              {EYE_CHART_ROWS.map((row) => (
                <div
                  key={row.version}
                  className="flex items-center justify-between w-full md:px-4"
                >
                  <span className="text-[10px] md:text-xs font-mono text-gray-400 w-10 text-left">
                    {row.version}
                  </span>
                  
                  <div className="flex gap-4 md:gap-7 justify-center items-center flex-grow">
                    {row.items.map((item, idx) => (
                      <span
                        key={idx}
                        style={{ fontSize: `${row.size}px` }}
                        className={`inline-block font-sans font-black text-[#1d1d1f] transition-transform select-none ${CHART_ROTATION_MAP[item]}`}
                      >
                        E
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] md:text-xs font-mono text-gray-400 w-10 text-right font-medium">
                    {formatDecimalToSnellen(parseFloat(row.version))}
                  </span>
                </div>
              ))}
            </div>
          )}
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-mono text-center w-full">
            {duochromeEnabled ? "红绿双色视野比对 (红色更清说明近视初矫不足，绿色更清说明过矫)" : "标准对数视力表 (E字开口朝向检查)"}
          </div>
      </div>
    );
  };

  // Calculate specific chromatic aberration blur for duochrome
  const calculateRedGreenBlur = (eyeState: EyeState, bestPrescription: Prescription, sphereOffset: number) => {
    // Create a virtual eye state with shifted sphere to simulate the chromatic offset
    const shiftedState: EyeState = {
      ...eyeState,
      sphere: eyeState.sphere + sphereOffset,
    };
    const analysis = analyzeEyeRefraction(shiftedState, bestPrescription);
    return analysis.blurPx;
  };

  // Convert decimal visual acuity to Snellen representation (e.g. 1.0 -> 20/20)
  const formatDecimalToSnellen = (decimal: number): string => {
    if (decimal >= 1.5) return "20/12";
    if (decimal >= 1.2) return "20/15";
    if (decimal >= 1.0) return "20/20";
    if (decimal >= 0.8) return "20/25";
    if (decimal >= 0.6) return "20/30";
    if (decimal >= 0.5) return "20/40";
    if (decimal >= 0.4) return "20/50";
    if (decimal >= 0.3) return "20/70";
    if (decimal >= 0.25) return "20/80";
    if (decimal >= 0.2) return "20/100";
    if (decimal >= 0.15) return "20/130";
    if (decimal >= 0.12) return "20/160";
    return "20/200";
  };

  // 1. If both eyes are occluded -> show clean lightbox shaded screen (High Density standard)
  if (od.occluded && os.occluded) {
    return (
      <div id="visual-chart-box" className="w-full bg-white p-6 rounded-xl border border-[#d2d2d7] shadow-sm h-full flex flex-col items-center justify-center min-h-[420px]">
        <div className="text-[#86868b] font-sans text-center text-sm">
          <Eye className="w-12 h-12 stroke-[#86868b] mx-auto mb-3" />
          双眼已全部遮盖
          <p className="text-xs text-[#86868b]/80 mt-1.5">请在右侧控制面板点击“遮盖/去遮盖”或切换单眼以恢复视力测试表</p>
        </div>
      </div>
    );
  }

  // 2. Prism Split View (Step 5 Binocular Balance)
  if (isPrismSplit) {
    return (
      <div id="visual-chart-box" className="w-full flex flex-col md:flex-row gap-4 h-full">
        <div className="flex-1">
          {renderSingleChart("右眼视角 (OD)", od, odTrue, "上方视标/3BU")}
        </div>
        <div className="flex-1">
          {renderSingleChart("左眼视角 (OS)", os, osTrue, "下方视标/3BD")}
        </div>
      </div>
    );
  }

  // 3. Fused Monocular or standard binocular view
  // Choose which eye to render, or render fused image if both are open
  if (!od.occluded && os.occluded) {
    return renderSingleChart("右眼 (OD)", od, odTrue);
  } else if (od.occluded && !os.occluded) {
    return renderSingleChart("左眼 (OS)", os, osTrue);
  } else {
    // Both eyes open, no splitting prism -> show fused vision!
    // Fused vision is modeled as a virtual combined eye taking the better vision of the two (brain accommodation dominance)
    // Create a unified eye state for rendering using the dominant one
    const odAnalysis = analyzeEyeRefraction(od, odTrue);
    const osAnalysis = analyzeEyeRefraction(os, osTrue);

    const dominantEye = odAnalysis.visualAcuity >= osAnalysis.visualAcuity ? od : os;
    const dominantTrue = odAnalysis.visualAcuity >= osAnalysis.visualAcuity ? odTrue : osTrue;
    const dominantLabel = odAnalysis.visualAcuity >= osAnalysis.visualAcuity ? "双眼融合 (OD主导)" : "双眼融合 (OS主导)";

    return renderSingleChart(dominantLabel, dominantEye, dominantTrue);
  }
};
