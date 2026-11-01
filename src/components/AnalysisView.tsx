/**
 * AnalysisView - Recreates Page 5 of PDF with complete analytical breakdown,
 * mathematical steps, magnitude tables, current distribution bars, and export modal.
 */
import React from 'react';
import { CircuitAnalysis, CircuitTopology } from '../types/circuit';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AnalysisViewProps {
  topology: CircuitTopology;
  voltage: number;
  analysis: CircuitAnalysis;
  onBackToEditor: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  topology,
  voltage,
  analysis,
  onBackToEditor,
}) => {
  const topologyTitle =
    topology === 'series'
      ? 'Análisis del circuito en serie'
      : topology === 'parallel'
      ? 'Análisis del circuito en paralelo'
      : 'Análisis del circuito mixto';

  const practiceBadge =
    topology === 'series'
      ? 'Práctica 01'
      : topology === 'parallel'
      ? 'Práctica 02'
      : 'Práctica 03';

  const r1 = analysis.resistors[0];
  const r2 = analysis.resistors[1];
  const r3 = analysis.resistors[2];

  // Maximum current among resistors for the bar chart scale
  const maxBarCurrent = Math.max(
    ...analysis.resistors.map((r) => r.current_mA),
    analysis.totalCurrent_mA,
    10
  );

  return (
    <div className="min-h-full bg-[#F9FAF8] text-zinc-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb matching PDF */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mb-3">
          <span>Simulador</span>
          <span>›</span>
          <span className="capitalize">{topologyTitle.replace('Análisis del ', '')}</span>
          <span>›</span>
          <span className="text-zinc-600 font-semibold">Análisis</span>
        </div>

        {/* Title Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {topologyTitle}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700">
              {practiceBadge}
            </span>
          </div>

          <div>
            <button
              onClick={onBackToEditor}
              className="px-4 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al editor</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards matching top of PDF Page 5 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-xs">
            <div className="text-xs text-zinc-500 font-medium mb-1">Tensión de la fuente</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900">
              {voltage} V
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-xs">
            <div className="text-xs text-zinc-500 font-medium mb-1">Resistencia equivalente</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900">
              {analysis.equivalentResistance} Ω
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-xs">
            <div className="text-xs text-zinc-500 font-medium mb-1">Corriente total</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
              {analysis.totalCurrent_mA} mA
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-xs">
            <div className="text-xs text-zinc-500 font-medium mb-1">Potencia total disipada</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900">
              {analysis.totalPower_W} W
            </div>
          </div>
        </div>

        {/* Overload Warning Box if triggered */}
        {analysis.hasOverload && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-700 block text-sm">
                ¡Advertencia de sobrecarga térmica o de corriente en el circuito!
              </span>
              <span>
                Uno o más componentes están operando fuera de los parámetros de disipación recomendados.
                Componentes en riesgo: {analysis.overloadedResistors.join(', ')}.
                Reduce la tensión de la fuente o aumenta los valores de resistencia para mantener la temperatura segura.
              </span>
            </div>
          </div>
        )}

        {/* Middle Section: Schematic + Step-by-Step Resolution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left: "Tu circuito, resuelto" */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-900">Tu circuito, resuelto</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verificado
                </div>
              </div>

              {/* Schematic view rendered */}
              <div className="w-full bg-[#FAFBF9] rounded-xl border border-zinc-200 p-4 flex items-center justify-center my-2">
                <svg viewBox="0 0 320 180" className="w-full max-h-[170px]">
                  {topology === 'mixed' && (
                    <g>
                      <circle cx="40" cy="90" r="18" fill="#FFF" stroke="#1F2937" strokeWidth="2" />
                      <text x="40" y="86" textAnchor="middle" className="text-xs font-bold fill-zinc-800">+</text>
                      <text x="40" y="98" textAnchor="middle" className="text-xs font-bold fill-zinc-600">−</text>
                      <text x="14" y="85" className="text-[10px] font-semibold fill-zinc-700">V1</text>
                      <text x="14" y="97" className="text-[9px] font-mono fill-zinc-500">{voltage} V</text>

                      {/* Top rail */}
                      <line x1="40" y1="72" x2="40" y2="40" stroke="#1F2937" strokeWidth="2" />
                      <line x1="40" y1="40" x2="90" y2="40" stroke="#1F2937" strokeWidth="2" />

                      {/* R1 */}
                      <rect x="90" y="32" width="46" height="16" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="113" y="26" textAnchor="middle" className="text-[10px] font-bold fill-zinc-800">R1</text>
                      <text x="113" y="58" textAnchor="middle" className="text-[9px] font-mono fill-zinc-600">{r1?.resistance} Ω</text>

                      <line x1="136" y1="40" x2="260" y2="40" stroke="#1F2937" strokeWidth="2" />

                      {/* R2 branch */}
                      <circle cx="180" cy="40" r="4" fill="#047857" />
                      <line x1="180" y1="40" x2="180" y2="60" stroke="#1F2937" strokeWidth="2" />
                      <rect x="172" y="60" width="16" height="42" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="200" y="74" className="text-[10px] font-bold fill-zinc-800">R2</text>
                      <text x="200" y="88" className="text-[9px] font-mono fill-zinc-600">{r2?.resistance} Ω</text>
                      <line x1="180" y1="102" x2="180" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <circle cx="180" cy="140" r="4" fill="#047857" />

                      {/* R3 branch */}
                      <circle cx="260" cy="40" r="4" fill="#047857" />
                      <line x1="260" y1="40" x2="260" y2="60" stroke="#1F2937" strokeWidth="2" />
                      <rect x="252" y="60" width="16" height="42" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="280" y="74" className="text-[10px] font-bold fill-zinc-800">R3</text>
                      <text x="280" y="88" className="text-[9px] font-mono fill-zinc-600">{r3?.resistance} Ω</text>
                      <line x1="260" y1="102" x2="260" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <circle cx="260" cy="140" r="4" fill="#047857" />

                      {/* Bottom return */}
                      <line x1="260" y1="140" x2="40" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <line x1="40" y1="140" x2="40" y2="108" stroke="#1F2937" strokeWidth="2" />
                    </g>
                  )}

                  {topology === 'series' && (
                    <g>
                      <circle cx="50" cy="90" r="18" fill="#FFF" stroke="#1F2937" strokeWidth="2" />
                      <text x="50" y="86" textAnchor="middle" className="text-xs font-bold fill-zinc-800">+</text>
                      <text x="50" y="98" textAnchor="middle" className="text-xs font-bold fill-zinc-600">−</text>

                      <line x1="50" y1="72" x2="50" y2="40" stroke="#1F2937" strokeWidth="2" />
                      <line x1="50" y1="40" x2="110" y2="40" stroke="#1F2937" strokeWidth="2" />

                      <rect x="110" y="32" width="48" height="16" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="134" y="26" textAnchor="middle" className="text-[10px] font-bold fill-zinc-800">R1</text>
                      <text x="134" y="58" textAnchor="middle" className="text-[9px] font-mono fill-zinc-600">{r1?.resistance} Ω</text>

                      <line x1="158" y1="40" x2="200" y2="40" stroke="#1F2937" strokeWidth="2" />

                      <rect x="200" y="32" width="48" height="16" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="224" y="26" textAnchor="middle" className="text-[10px] font-bold fill-zinc-800">R2</text>
                      <text x="224" y="58" textAnchor="middle" className="text-[9px] font-mono fill-zinc-600">{r2?.resistance} Ω</text>

                      <line x1="248" y1="40" x2="280" y2="40" stroke="#1F2937" strokeWidth="2" />
                      <line x1="280" y1="40" x2="280" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <line x1="280" y1="140" x2="50" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <line x1="50" y1="140" x2="50" y2="108" stroke="#1F2937" strokeWidth="2" />
                    </g>
                  )}

                  {topology === 'parallel' && (
                    <g>
                      <circle cx="50" cy="90" r="18" fill="#FFF" stroke="#1F2937" strokeWidth="2" />
                      <text x="50" y="86" textAnchor="middle" className="text-xs font-bold fill-zinc-800">+</text>
                      <text x="50" y="98" textAnchor="middle" className="text-xs font-bold fill-zinc-600">−</text>

                      <line x1="50" y1="72" x2="50" y2="40" stroke="#1F2937" strokeWidth="2" />
                      <line x1="50" y1="40" x2="250" y2="40" stroke="#1F2937" strokeWidth="2" />

                      {/* R1 */}
                      <circle cx="140" cy="40" r="4" fill="#047857" />
                      <line x1="140" y1="40" x2="140" y2="60" stroke="#1F2937" strokeWidth="2" />
                      <rect x="132" y="60" width="16" height="42" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="160" y="74" className="text-[10px] font-bold fill-zinc-800">R1</text>
                      <text x="160" y="88" className="text-[9px] font-mono fill-zinc-600">{r1?.resistance} Ω</text>
                      <line x1="140" y1="102" x2="140" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <circle cx="140" cy="140" r="4" fill="#047857" />

                      {/* R2 */}
                      <circle cx="250" cy="40" r="4" fill="#047857" />
                      <line x1="250" y1="40" x2="250" y2="60" stroke="#1F2937" strokeWidth="2" />
                      <rect x="242" y="60" width="16" height="42" rx="4" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
                      <text x="270" y="74" className="text-[10px] font-bold fill-zinc-800">R2</text>
                      <text x="270" y="88" className="text-[9px] font-mono fill-zinc-600">{r2?.resistance} Ω</text>
                      <line x1="250" y1="102" x2="250" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <circle cx="250" cy="140" r="4" fill="#047857" />

                      <line x1="250" y1="140" x2="50" y2="140" stroke="#1F2937" strokeWidth="2" />
                      <line x1="50" y1="140" x2="50" y2="108" stroke="#1F2937" strokeWidth="2" />
                    </g>
                  )}
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-150 text-xs text-zinc-500">
              <span className="font-mono">
                {topology === 'mixed'
                  ? 'R1 + (R2 ∥ R3)'
                  : topology === 'series'
                  ? 'R1 + R2'
                  : 'R1 ∥ R2'}
              </span>
              <span>Fuente de {voltage} V · CC</span>
            </div>
          </div>

          {/* Right: "Del circuito a los números" matching Page 5 */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-900">Del circuito a los números</h3>
                <span className="text-xs font-mono font-bold text-zinc-400">V = I × R</span>
              </div>

              {/* 3 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Step 1 */}
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-zinc-150 pb-3 sm:pb-0 sm:pr-3">
                  <div className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight">
                    {analysis.stepByStep.step1Title}
                  </div>
                  <div className="bg-[#FAFBF9] p-2.5 rounded-lg border border-zinc-200 font-mono text-xs text-teal-900 font-semibold leading-relaxed">
                    {analysis.stepByStep.step1Formula}
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    {analysis.stepByStep.step1Explanation}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-zinc-150 pb-3 sm:pb-0 sm:pr-3">
                  <div className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight">
                    {analysis.stepByStep.step2Title}
                  </div>
                  <div className="bg-[#FAFBF9] p-2.5 rounded-lg border border-zinc-200 font-mono text-xs text-teal-900 font-semibold leading-relaxed">
                    {analysis.stepByStep.step2Formula}
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    {analysis.stepByStep.step2Explanation}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight">
                    {analysis.stepByStep.step3Title}
                  </div>
                  <div className="bg-[#FAFBF9] p-2.5 rounded-lg border border-zinc-200 font-mono text-xs text-emerald-700 font-semibold leading-relaxed">
                    {analysis.stepByStep.step3Formula}
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    {analysis.stepByStep.step3Explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Caidas summary line at bottom */}
            <div className="mt-4 pt-3 border-t border-zinc-150 text-xs font-mono text-zinc-600">
              {analysis.stepByStep.caidasSummary}
            </div>
          </div>
        </div>

        {/* Lower Section: Full Magnitudes Table + Current Distribution Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Table: "Todas las magnitudes, de un vistazo" */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-900">
                  Todas las magnitudes, de un vistazo
                </h3>
                <span className="text-xs text-zinc-400">Valores ideales de CC</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-mono font-semibold uppercase text-[10px]">
                      <th className="pb-2">COMPONENTE</th>
                      <th className="pb-2 text-right">R (Ω)</th>
                      <th className="pb-2 text-right">V (V)</th>
                      <th className="pb-2 text-right">I (mA)</th>
                      <th className="pb-2 text-right">P (W)</th>
                      <th className="pb-2 text-right">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono">
                    {analysis.resistors.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50/70 transition">
                        <td className="py-2.5 font-sans">
                          <span className="font-bold text-zinc-900">{r.name}</span>{' '}
                          <span className="text-zinc-500 text-[11px]">({r.label})</span>
                        </td>
                        <td className="py-2.5 text-right font-medium text-zinc-700">{r.resistance}</td>
                        <td className="py-2.5 text-right font-medium text-zinc-700">{r.voltageDrop}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">{r.current_mA}</td>
                        <td className="py-2.5 text-right font-medium text-zinc-700">{r.power_W}</td>
                        <td className="py-2.5 text-right font-sans">
                          {r.isOverloaded ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              SOBRECARGA
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              Seguro
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Equivalent Summary Row */}
                    <tr className="bg-zinc-50 font-semibold border-t-2 border-zinc-200">
                      <td className="py-2.5 font-sans">
                        <span className="font-bold text-zinc-900">Equivalente</span>{' '}
                        <span className="text-zinc-500 text-[11px]">(Circuito completo)</span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-zinc-900">
                        {analysis.equivalentResistance}
                      </td>
                      <td className="py-2.5 text-right font-bold text-zinc-900">{voltage}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-700">
                        {analysis.totalCurrent_mA}
                      </td>
                      <td className="py-2.5 text-right font-bold text-zinc-900">{analysis.totalPower_W}</td>
                      <td className="py-2.5 text-right font-sans">
                        <span className="text-[10px] text-zinc-500 font-medium">Req global</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Educational callout matching bottom of page 5 */}
            <div className="mt-5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {topology === 'mixed'
                    ? 'Misma tensión no significa misma corriente.'
                    : topology === 'series'
                    ? 'La corriente se conserva inmutable en cada punto de la serie.'
                    : 'La tensión es idéntica en cada ramal conectado a la fuente.'}
                </span>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">{analysis.takeaway}</p>
              </div>
            </div>
          </div>

          {/* Bar Chart: "¿Cómo se reparte la corriente?" */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-900">¿Cómo se reparte la corriente?</h3>
                <span className="text-xs font-mono text-zinc-400">mA</span>
              </div>

              {/* Chart Scale Header */}
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-2 px-1">
                <span>0</span>
                <span>{(maxBarCurrent / 2).toFixed(0)}</span>
                <span>{maxBarCurrent.toFixed(0)} mA</span>
              </div>

              {/* Bars for each resistor */}
              <div className="space-y-4 pt-1">
                {analysis.resistors.map((r, idx) => {
                  const percent = Math.min(100, Math.max(4, (r.current_mA / maxBarCurrent) * 100));
                  return (
                    <div key={r.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-zinc-800">{r.name}</span>
                        <span className="font-mono font-semibold text-zinc-900">{r.current_mA} mA</span>
                      </div>
                      <div className="w-full h-5 bg-zinc-100 rounded-lg overflow-hidden flex items-center p-0.5">
                        <div
                          className={`h-full rounded-md transition-all duration-500 ${
                            r.isOverloaded
                              ? 'bg-red-500'
                              : idx === 0
                              ? 'bg-teal-700'
                              : idx === 1
                              ? 'bg-teal-500'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kirchhoff Current Law node summary */}
            <div className="mt-5 pt-3 border-t border-zinc-150 text-xs font-mono text-zinc-600">
              {topology === 'mixed' && (
                <span>
                  I1 = I2 + I3: {analysis.totalCurrent_mA} mA = {r2?.current_mA || 0} mA + {r3?.current_mA || 0} mA. La corriente se conserva en el nodo.
                </span>
              )}
              {topology === 'parallel' && (
                <span>
                  Itotal = I1 + I2: {analysis.totalCurrent_mA} mA = {r1?.current_mA || 0} mA + {r2?.current_mA || 0} mA (Ley de Corrientes de Kirchhoff).
                </span>
              )}
              {topology === 'series' && (
                <span>
                  I total = I1 = I2 = {analysis.totalCurrent_mA} mA. En un único lazo la corriente no tiene bifurcaciones.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom footer credit matching PDF */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/60 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>
              Análisis del ejemplo · {voltage} V ·{' '}
              {analysis.resistors.map((r) => `${r.name} = ${r.resistance} Ω`).join(' · ')}
            </span>
          </div>
          <div className="mt-2 sm:mt-0 font-medium">Explora. Conecta. Comprende.</div>
        </div>
      </div>
    </div>
  );
};
