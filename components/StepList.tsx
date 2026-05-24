import React from "react";
import { OptometryStep, ScoringDetail } from "../types";
import { Award } from "lucide-react";

interface StepListProps {
  steps: OptometryStep[];
  activeStepId: number;
  setActiveStepId: (id: number) => void;
  scoresBreakdown: ScoringDetail[];
  totalScore: number;
}

export const StepList: React.FC<StepListProps> = ({
  steps,
  activeStepId,
  setActiveStepId,
  scoresBreakdown,
  totalScore,
}) => {
  return (
    <div className="w-full bg-white border border-[#d2d2d7] rounded-xl p-4 md:p-5 shadow-sm flex flex-col gap-4">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center pb-3 border-b border-[#e5e5ea]">
        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#0055ff]" />
            主觉验光步骤及评分规范
          </h3>
          <span className="text-[10px] text-[#86868b] font-mono block">
            Subjective Optometry Protocol Progress
          </span>
        </div>
        <div className="bg-[#f5f5f7] px-3 py-1 border border-[#e5e5ea] rounded-lg text-right">
          <span className="text-[10px] text-[#86868b] block leading-none mb-0.5">即时评估</span>
          <span className="text-base font-black font-mono text-[#0055ff] leading-none">
            {totalScore} <span className="text-[#86868b] text-xs font-normal">/ 100</span>
          </span>
        </div>
      </div>

      {/* Step workflow */}
      <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto pr-1">
        {steps.map((step) => {
          const isActive = step.id === activeStepId;
          const scoreDetail = scoresBreakdown.find((s) => s.stepId === step.id);
          const score = scoreDetail ? scoreDetail.score : 0;
          const maxScore = scoreDetail ? scoreDetail.maxScore : step.scoreWeight;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer select-none group relative ${
                isActive
                  ? "bg-[rgba(0,85,255,0.05)] border-[#0055ff] shadow-sm"
                  : "bg-white border-[#e5e5ea] hover:border-[#d2d2d7] hover:bg-[#f5f5f7]"
              }`}
            >
              {/* Highlight bar for active step */}
              {isActive && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#0055ff] rounded-l-lg"></div>
              )}

              <div className="flex items-start justify-between gap-2 pl-1">
                {/* Step number and name */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                      isActive
                        ? "bg-[#0055ff] text-white"
                        : "bg-[#f5f5f7] text-[#666] border border-[#e5e5ea] group-hover:bg-[#e8e8ed]"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold leading-normal transition-colors ${
                        isActive ? "text-[#0055ff]" : "text-[#1d1d1f] group-hover:text-[#0055ff]"
                      }`}
                    >
                      {step.name}
                    </h4>
                  </div>
                </div>

                {/* Score Pill badge */}
                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border inline-block ${
                      score === maxScore
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : score > 0
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-[#f5f5f7] text-[#86868b] border-[#e5e5ea]"
                    }`}
                  >
                    {score} / {maxScore} 分
                  </span>
                </div>
              </div>

              {/* Subtitles & Descriptions */}
              <div className="mt-2 text-[11px] text-[#666] line-clamp-2 leading-relaxed pl-1">
                {step.description}
              </div>

              {/* Expand Standard criteria on active card */}
              {isActive && (
                <div className="mt-2.5 pt-2.5 border-t border-[#e5e5ea] text-[10px] text-[#666] bg-white p-2.5 rounded-lg leading-relaxed font-sans space-y-1 pl-1">
                  <span className="font-semibold text-[#1d1d1f] block mb-0.5">📌 考核及操作指引:</span>
                  <div className="text-[#666]">{step.standard}</div>
                  
                  {scoreDetail && scoreDetail.feedback && (
                    <div className="mt-2 block border-t border-[#f5f5f7] pt-1.5 font-mono text-[10px] text-red-500 leading-normal">
                      ⚠️ 扣分机制提示: {scoreDetail.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-[#f5f5f7] p-3 rounded-lg border border-[#e5e5ea] text-[11px] leading-relaxed text-[#666]">
        <span className="font-semibold text-[#1d1d1f] block mb-1">🎓 主觉验光小贴士 (Tips):</span>
        双色法与散光微度调节时，应严格遵循等效球镜规则（1/2规则），避免强行给予过度负镜片。
      </div>
    </div>
  );
};
