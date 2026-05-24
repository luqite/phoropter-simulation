import React, { useState } from "react";
import { BookOpen, Sliders, Award, Eye, RotateCcw, Clock, Target, AlertCircle, RefreshCw } from "lucide-react";

interface InstructionManualProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionManual({ isOpen, onClose }: InstructionManualProps) {
  const [activeTab, setActiveTab] = useState<"protocol" | "phoropter" | "scoring">("protocol");

  if (!isOpen) return null;

  return (
    <div id="instruction-manual-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        id="instruction-manual-container"
        className="bg-white border border-[#d2d2d7] rounded-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header containing system and name info */}
        <div className="bg-[#1d1d1f] text-white p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0055ff] flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                主觉验光系统医学与实操说明书
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-850 text-teal-300 rounded border border-zinc-700">
                  CLINICAL HANDBOOK
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Phoropter Subjective Refraction Protocol & Interactive Training Guide
              </p>
            </div>
          </div>
          <button
            id="close-manual-btn"
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg text-xs border border-zinc-700 cursor-pointer transition-colors"
          >
            关闭说明书
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="bg-zinc-50 border-b border-[#e5e5ea] p-2 flex gap-1 shrink-0">
          <button
            id="manual-tab-protocol"
            onClick={() => setActiveTab("protocol")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "protocol"
                ? "bg-white text-[#0055ff] shadow-sm border border-[#e5e5ea]"
                : "text-[#48484a] hover:bg-zinc-100"
            }`}
          >
            <Eye className="w-4 h-4" />
            主觉验光标准六步法
          </button>
          
          <button
            id="manual-tab-phoropter"
            onClick={() => setActiveTab("phoropter")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "phoropter"
                ? "bg-white text-[#0055ff] shadow-sm border border-[#e5e5ea]"
                : "text-[#48484a] hover:bg-zinc-100"
            }`}
          >
            <Sliders className="w-4 h-4" />
            综合验光仪盘面与控制
          </button>

          <button
            id="manual-tab-scoring"
            onClick={() => setActiveTab("scoring")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "scoring"
                ? "bg-white text-[#0055ff] shadow-sm border border-[#e5e5ea]"
                : "text-[#48484a] hover:bg-zinc-100"
            }`}
          >
            <Award className="w-4 h-4" />
            实训考核扣分机制
          </button>
        </div>

        {/* Dynamic scrollable manual description content */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6 text-[#1d1d1f] text-xs">
          
          {/* TAB 1: 主觉验光标准六步法 */}
          {activeTab === "protocol" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-blue-50 border-l-4 border-[#0055ff] p-4 rounded-r-lg space-y-1">
                <h4 className="font-bold text-[#0055ff] flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  临床标准主觉验光（Subjective Refraction）概述
                </h4>
                <p className="text-[11px] text-[#48484a] leading-relaxed">
                  标准主觉验光六步法是眼视光学最核心的检查规程，旨在控制患者眼肌的自发性调节（Accommodation Control），
                  通过球散精密组合调整，使物像最清晰部位聚焦于视网膜凹，提供最舒适、持久、清晰的光学解决方案。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#e5e5ea] rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <h5 className="font-extrabold text-[#1d1d1f] border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-mono text-[10px]">1</span>
                    第一步：准备阶段 (Setup)
                  </h5>
                  <p className="text-[#48484a] leading-relaxed">
                    在仿真系统中，此步要求设置开始测试。
                    <strong className="text-[#1d1d1f]">医学规范指标：</strong>确认右眼为开放模式（OD Active）、左眼为遮盖关闭模式（OS Occluded）。度数轴位置于初始输入点，无红绿偏色背景且移开JCC。
                  </p>
                </div>

                <div className="border border-[#e5e5ea] rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <h5 className="font-extrabold text-[#1d1d1f] border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-mono text-[10px]">2</span>
                    第二步：初步单眼 MPMVA (Maximum Plus to Maximum Visual Acuity)
                  </h5>
                  <p className="text-[#48484a] leading-relaxed">
                    通过调整测试眼旧镜度数（首选右眼OD），控制屈光力，让视力表清晰度达约 <strong className="text-[#1d1d1f]">1.0</strong> 视标。
                    在此步骤中，开启 <strong className="text-emerald-700">红绿视野功能</strong> 进行红绿比对，若“红区文字字迹更黑更深更清晰”，表明调节初矫不足，应增加负度数球镜（或减少正镜）；若“绿区文字字迹极深极为清析”，则说明过矫控，应往调节正镜调整。直至达到等清状态。
                  </p>
                </div>

                <div className="border border-[#e5e5ea] rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <h5 className="font-extrabold text-[#1d1d1f] border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-mono text-[10px]">3</span>
                    第三步：JCC 交叉柱镜轴位比对与精准定位
                  </h5>
                  <p className="text-[#48484a] leading-relaxed">
                    使用杰克逊交叉柱镜（Jackson Cross Cylinder）定位散光主轴。
                    <strong className="text-rose-600 block my-1">💡 追轴核心操作法则：</strong>
                    开启 <strong className="text-zinc-800">JCC 模式</strong>，选定为 <strong className="text-zinc-800">轴位调节面 (JCC Axis)</strong>。切换 Face & 对比患者视标。
                    当患者点击说明“Face 1 比 Face 2 清晰”时，观察红色手柄偏斜。遵循 <strong className="font-bold text-red-600">“红入白出”或“进红退白”</strong> 原则：朝着红点（负轴）偏角逆旋转增加轴向角度，或顺角减轴。反复旋转定位直至正反双面患者主诉“看视标两面清晰度一样”。
                  </p>
                </div>

                <div className="border border-[#e5e5ea] rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <h5 className="font-extrabold text-[#1d1d1f] border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-mono text-[10px]">4</span>
                    第四步：JCC 散光散光度数精准校准
                  </h5>
                  <p className="text-[#48484a] leading-relaxed">
                    精准计算视网膜散光焦量。JCC 调整为 <strong className="text-zinc-800">度数调节面 (JCC Power)</strong>。
                    患者阅读并比照 Face 1 和 Face 2。
                    <strong className="text-red-700 font-extrabold block my-1">🛑 极其严格的【球散等效规则补偿】：</strong>
                    当由于柱镜（Cylinder）增加导致散光度数改变 <strong className="text-[#05f] font-mono font-bold">-0.50D</strong> 时，球镜（Sphere）必须朝相反方向逆补偿调整 <strong className="text-emerald-700 font-mono font-bold">+0.25D</strong>。否则，散光环的“最小弥散圆（Circle of Least Confusion）”将被带离视网膜，引发眼睛酸痛或痉挛性调节，测试结果失效！
                  </p>
                </div>

                <div className="border border-[#e5e5ea] rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <h5 className="font-extrabold text-[#1d1d1f] border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-mono text-[10px]">5</span>
                    第五步：双眼调节平衡测定 (Binocular Balance)
                  </h5>
                  <p className="text-[#48484a] leading-relaxed">
                    由于左右两眼可能存在调节拉扯，必须进行双眼平衡。
                    <strong className="text-[#1d1d1f] block my-1">🏥 棱镜分像原理（Prism Separation Rule）：</strong>
                    去除遮盖（双眼均开启 OU Active）。
                    在右眼镜前置入 <strong className="font-bold text-blue-600">3 Base Up (3▲BU)</strong> 的下折射棱镜，在左眼镜前置入 <strong className="font-bold text-indigo-600">3 Base Down (3▲BD)</strong> 的上折射棱镜。患者将会在视标表盘看到上下分成不相交的两个相同视标（右眼看下方行，左眼看上方行）。
                    询问患者上下哪排更清晰，若某排更清晰，对其添加 <strong className="font-bold text-amber-700">+0.25D</strong> 的微雾视（放松眼肌调节），使其与另外一排达到完全一模一样清晰，即可移除分像棱镜。
                  </p>
                </div>

                <div className="border border-[#e5e5ea] rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <h5 className="font-extrabold text-[#1d1d1f] border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 text-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-mono text-[10px]">6</span>
                    第六步：双眼最高正镜 MPMVA 终点
                  </h5>
                  <p className="text-[#48484a] leading-relaxed">
                    在无任何分像斜视棱镜且双眼睁开、移开JCC的完全自然放松状态下，等量微调双眼球镜，使视力表现完美，文字轮廓毫无毛刺。最终让双眼在红绿等比对下等清达到测试完毕节点，点击 <strong className="text-[#05f]">“提交评卷”</strong> 获取国家实训报告。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 综合验光仪盘面与控制 */}
          {activeTab === "phoropter" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <h4 className="font-bold text-[#1d1d1f] mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-zinc-700" />
                  综合验光仪机械外观仿真（Phoropter Physical Turrets）
                </h4>
                <p className="text-[11px] text-[#48484a] leading-relaxed mb-4">
                  我们在盘面上方设计了行业标准的 <strong className="text-zinc-900">双轮大转盘物理仿真头（Interactive Phoropter Simulator）</strong>，可以非常直觉、实时、跨组件同步进行高精微调：
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-start bg-white p-3 rounded-lg border border-zinc-200 shadow-3xs">
                    <div className="w-full md:w-32 py-1 bg-zinc-800 text-cyan-400 font-mono text-center font-black rounded text-[10px] uppercase">
                      SPHERE DS
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1d1d1f] text-[11px]">球镜度数液晶与手动微调轮:</h5>
                      <p className="text-[#48484a] text-[11px] leading-normal">
                        您可以直接在物理模拟盘面的 <strong className="text-cyan-600">“球镜(DS)”</strong> 微调轮上点击 “-” 或 “+”；也可以使用下方主控台的快速微调轮、或者通过手动输入特定数值进行大幅度跃级变更。此数值改变将同步反应在物理镜片反射和诊断输出。
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-start bg-white p-3 rounded-lg border border-zinc-200 shadow-3xs">
                    <div className="w-full md:w-32 py-1 bg-zinc-800 text-emerald-400 font-mono text-center font-black rounded text-[10px] uppercase">
                      CYLINDER DC
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1d1d1f] text-[11px]">柱镜度数的物理旋钮:</h5>
                      <p className="text-[#48484a] text-[11px] leading-normal">
                        柱镜调节改变的是患者的“散光度数”。双转盘上的 <strong className="text-emerald-600">“柱镜(DC)”</strong> 手动微调轮能以 0.25D步长 进行调节。在主觉验光中使用时，必须记住【球散等效规则：散光柱镜调整1.00D时，球镜需往反方向调节0.50D; 散光调整0.50D时，球镜反方向0.25D】。
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-start bg-white p-3 rounded-lg border border-zinc-200 shadow-3xs">
                    <div className="w-full md:w-32 py-1 bg-zinc-800 text-amber-500 font-mono text-center font-black rounded text-[10px] uppercase">
                      AXIS DEG
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1d1d1f] text-[11px]">散光轴向红色旋转指正针:</h5>
                      <p className="text-[#48484a] text-[11px] leading-normal">
                        圆周表面绘制了 0° 到 180° 的细密角度刻度圈。红色的 <strong className="text-amber-600">旋转钢针</strong> 会根据当前度数进行实时的精确角度偏斜旋转。您可以通过点击微调轮的 ↺ 或 ↻ 顺逆旋转 5°，亦可在下面滑块组中快速拖拽。
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-start bg-white p-3 rounded-lg border border-zinc-200 shadow-3xs">
                    <div className="w-full md:w-32 py-1 bg-zinc-800 text-blue-500 font-mono text-center font-black rounded text-[10px] uppercase">
                      AUX / GLASS SIGHT
                    </div>
                    <div>
                      <h5 className="font-bold text-[#1d1d1f] text-[11px]">透镜观察窗 (Visual Glimmer Reflection Windows):</h5>
                      <p className="text-[#48484a] text-[11px] leading-normal">
                        中央视孔内置了机械光学遮盖片和交叉柱镜的动态模拟。
                        当眼处于遮盖（Occluded）状态，会显示 <strong className="text-red-500 font-bold">‘遮盖中 (CLOSED)’</strong> 的红遮盖盖，光路彻底切断，患者视力反馈直接锁死。
                        当启用 JCC 交叉柱镜并切换 Face 1/Face 2 时，视孔中央也会动态浮现 <strong className="text-red-500 font-bold">手柄、旋转红白刻度标记轴线</strong>，极其直观。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-amber-800 text-[11px]">快捷操作提示（Fast Workflow Tips）</h5>
                  <p className="text-amber-900 text-[11px] leading-relaxed">
                    您可以直接点击右眼（OD）或左眼（OS）的那个大圆转盘包围卡片，系统将 <strong className="underline font-sans font-bold">自动将当前焦点锁定为操控眼</strong>，并在高亮颜色蓝色边框上提供微调反馈。在做双眼视平衡时（第5步），可随时在下方辅件层进行分像棱镜的快速拔插。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 实训考核扣分机制 */}
          {activeTab === "scoring" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg space-y-1">
                <h4 className="font-bold text-rose-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  自动化多维临床诊断评卷规则 (Clinical Scoring Standard Details)
                </h4>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  系统采用严格的国家医学视光标准计算评卷分值。不当操作、违反安全逻辑或粗心大意的调校均有明确记录，并在提交评卷后生成扣分分析和解释。
                </p>
              </div>

              <div className="border border-[#e5e5ea] rounded-xl overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-12 bg-zinc-800 text-white py-2.5 px-4 text-[10px] font-black font-sans uppercase">
                  <span className="col-span-1 text-center">NO</span>
                  <span className="col-span-3">核心考核步骤</span>
                  <span className="col-span-2 text-center">满分</span>
                  <span className="col-span-6">严格扣分逻辑与医学判定依据</span>
                </div>

                <div className="divide-y divide-[#e5e5ea]">
                  <div className="grid grid-cols-12 py-3 px-4 items-start">
                    <span className="col-span-1 text-center font-mono font-bold text-zinc-400">01</span>
                    <span className="col-span-3 font-bold text-zinc-800">准备阶段指标确认</span>
                    <span className="col-span-2 text-center font-bold text-[#0055ff]">10 分</span>
                    <div className="col-span-6 text-zinc-600 leading-relaxed text-[11px]">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>右眼(OD)未打开，直接扣 <strong className="text-rose-600">5 分</strong>。</li>
                        <li>左眼(OS)未处于完全遮盖关闭状态，直接扣 <strong className="text-rose-600">5 分</strong>。</li>
                        <li>在此步就开启了分像三棱镜或JCC，直接扣 <strong className="text-rose-600">3 分</strong>。</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-3 px-4 items-start">
                    <span className="col-span-1 text-center font-mono font-bold text-zinc-400">02</span>
                    <span className="col-span-3 font-bold text-zinc-800">初步单眼 MPMVA</span>
                    <span className="col-span-2 text-center font-bold text-[#0055ff]">15 分</span>
                    <div className="col-span-6 text-zinc-600 leading-relaxed text-[11px]">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>目标是寻找放松调节下的【最佳球镜】。球镜调试值距离病理最佳视力诊断偏离多于 ±0.50D 时开始梯度扣分。（最多扣 <strong className="text-rose-600">12分</strong>）。</li>
                        <li>如果在此步不小心开启JCC产生模糊度混淆，扣 <strong className="text-rose-600">3 分</strong>。</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-3 px-4 items-start">
                    <span className="col-span-1 text-center font-mono font-bold text-zinc-400">03</span>
                    <span className="col-span-3 font-bold text-zinc-800">JCC 交叉柱镜散光精密调整</span>
                    <span className="col-span-2 text-center font-bold text-[#0055ff]">30 分</span>
                    <div className="col-span-6 text-zinc-600 leading-relaxed text-[11px]">
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong className="text-rose-600">散光值与真实值差的平方级梯度扣分规律：</strong>柱镜偏离超过0.50D，扣5-15分；轴向（Axis）精密度多偏斜 15°以上，扣10分。</li>
                        <li><strong className="text-red-700 font-bold">🚨 致命违规：</strong>在精密柱镜增减 0.50D 过程中，没有相应同时间进行反向 0.25D 球镜等效补偿。只要监测发生不补偿操作，一次在最终评卷中直接重扣 <strong className="text-rose-600">15 分</strong>！</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-3 px-4 items-start">
                    <span className="col-span-1 text-center font-mono font-bold text-zinc-400">04</span>
                    <span className="col-span-3 font-bold text-zinc-800">散光后单眼 MPMVA 终点</span>
                    <span className="col-span-2 text-center font-bold text-[#0055ff]">15 分</span>
                    <div className="col-span-6 text-zinc-600 leading-relaxed text-[11px]">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>调整散光后，必须通过红绿等清检测再次微调右眼，确定在1.0-1.2最佳视标时的球镜度。如果球镜偏斜多于0.25D，扣 <strong className="text-rose-600">5-10分</strong>。</li>
                        <li>如果在该步结束仍遗留JCC折返交叉，直接扣 <strong className="text-rose-600">5 分</strong>。</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-3 px-4 items-start">
                    <span className="col-span-1 text-center font-mono font-bold text-zinc-400">05</span>
                    <span className="col-span-3 font-bold text-zinc-800">双眼视调节平衡</span>
                    <span className="col-span-2 text-center font-bold text-[#0055ff]">15 分</span>
                    <div className="col-span-6 text-zinc-600 leading-relaxed text-[11px]">
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong className="text-rose-600 text-[10.5px]">双眼必须处于同时开启状态 (OU Active)</strong>。如果依然有人工遮盖，完全无法作上下对比，此步计 <strong className="text-rose-600 font-bold">0分</strong>。</li>
                        <li>右眼镜片必须置入 <strong className="font-bold text-zinc-800">3▲BU</strong> 棱镜，左眼置入 <strong className="font-bold text-zinc-800">3▲BD</strong>。置入不符合或插反（例如左上右下），扣 <strong className="text-rose-600">8 分</strong>。</li>
                        <li>没有正确调节到上下等清状态，扣 <strong className="text-rose-600 font-bold">5 分</strong>。</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 py-3 px-4 items-start">
                    <span className="col-span-1 text-center font-mono font-bold text-zinc-400">06</span>
                    <span className="col-span-3 font-bold text-zinc-800">双眼终点最佳视力 MPMVA</span>
                    <span className="col-span-2 text-center font-bold text-[#0055ff]">15 分</span>
                    <div className="col-span-6 text-zinc-600 leading-relaxed text-[11px]">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>双侧没有均等移去棱镜即急于交卷，扣 <strong className="text-rose-600">5 分</strong>。</li>
                        <li>最终调校球镜偏出病理学等清点 0.25D 以上，扣 <strong className="text-rose-600">5-10分</strong>。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0 animate-spin" style={{ animationDuration: "12s" }} />
                <div>
                  <span className="font-bold text-emerald-800 text-[11px] block">说明书实时同步设计理念</span>
                  <p className="text-emerald-950 text-[11px] leading-relaxed">
                    本仿真系统集成了“人机物理回环同步”。您在盘面上进行的所有点击调整均会计入历史，并会触发患者模拟眼底成像光斑的拉伸。请结合真实的医学实地临床经验，把控每一个刻度的进退。祝您取得100分优秀成绩！
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom control panel */}
        <div className="bg-zinc-50 p-4 border-t border-[#e2e2e7] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <span>操作提示: 点击</span>
            <span className="px-1 py-0.2 bg-white border rounded">Esc</span>
            <span>或点击右上角可快速关闭此说明书</span>
          </div>
          <button
            id="manual-confirm-btn"
            onClick={onClose}
            className="px-6 py-2 bg-[#0055ff] hover:bg-blue-605 text-white font-bold rounded-lg text-xs shadow-md cursor-pointer transition-colors"
          >
            我已知晓，继续实操测试
          </button>
        </div>
      </div>
    </div>
  );
}
