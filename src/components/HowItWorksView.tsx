/**
 * HowItWorksView - Comprehensive educational theory guide on Ohm's Law,
 * circuit rules, Joule effect, overload physics, and resistor color codes.
 */
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Flame, Lightbulb, ShieldAlert, Sparkles, Zap } from 'lucide-react';

interface HowItWorksViewProps {
  onBackToSimulator: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onBackToSimulator }) => {
  const [triangleTarget, setTriangleTarget] = useState<'V' | 'I' | 'R'>('I');

  return (
    <div className="min-h-full bg-[#F9FAF8] text-zinc-900 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mb-3">
          <span>Inicio</span>
          <span>›</span>
          <span className="text-zinc-600 font-semibold">Cómo funciona</span>
        </div>

        {/* Title & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Fundamentos de la Ley de Ohm y Circuitos Eléctricos
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Guía teórica interactiva sobre tensión, corriente, potencia y seguridad.
            </p>
          </div>

          <button
            onClick={onBackToSimulator}
            className="px-4 py-2 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <span>Ir al Simulador</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: The Interactive Triangle of Ohm's Law */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          <div className="md:col-span-5 bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs flex flex-col items-center justify-center text-center">
            <h3 className="text-base font-bold text-zinc-900 mb-2">
              Triángulo Mnemotécnico de Ohm
            </h3>
            <p className="text-xs text-zinc-500 mb-6 max-w-xs">
              Toca una letra para despejar automáticamente su fórmula matemática:
            </p>

            {/* Interactive SVG Triangle */}
            <div className="relative w-64 h-56">
              <svg viewBox="0 0 200 170" className="w-full h-full">
                {/* Triangle Base Shape */}
                <polygon
                  points="100,10 10,160 190,160"
                  fill="#F8FAFC"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                />

                {/* Horizontal dividing line */}
                <line x1="45" y1="90" x2="155" y2="90" stroke="#94A3B8" strokeWidth="2" />
                {/* Vertical bottom dividing line */}
                <line x1="100" y1="90" x2="100" y2="160" stroke="#94A3B8" strokeWidth="2" />

                {/* Top Section: V */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setTriangleTarget('V')}
                >
                  <polygon
                    points="100,10 45,90 155,90"
                    fill={triangleTarget === 'V' ? '#0F766E' : '#E2E8F0'}
                    className="transition-colors hover:opacity-90"
                  />
                  <text
                    x="100"
                    y="65"
                    textAnchor="middle"
                    className={`text-2xl font-bold font-mono ${
                      triangleTarget === 'V' ? 'fill-white' : 'fill-zinc-800'
                    }`}
                  >
                    V
                  </text>
                </g>

                {/* Bottom-Left Section: I */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setTriangleTarget('I')}
                >
                  <polygon
                    points="45,90 10,160 100,160 100,90"
                    fill={triangleTarget === 'I' ? '#0F766E' : '#E2E8F0'}
                    className="transition-colors hover:opacity-90"
                  />
                  <text
                    x="65"
                    y="135"
                    textAnchor="middle"
                    className={`text-2xl font-bold font-mono ${
                      triangleTarget === 'I' ? 'fill-white' : 'fill-zinc-800'
                    }`}
                  >
                    I
                  </text>
                </g>

                {/* Bottom-Right Section: R */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setTriangleTarget('R')}
                >
                  <polygon
                    points="100,90 100,160 190,160 155,90"
                    fill={triangleTarget === 'R' ? '#0F766E' : '#E2E8F0'}
                    className="transition-colors hover:opacity-90"
                  />
                  <text
                    x="135"
                    y="135"
                    textAnchor="middle"
                    className={`text-2xl font-bold font-mono ${
                      triangleTarget === 'R' ? 'fill-white' : 'fill-zinc-800'
                    }`}
                  >
                    R
                  </text>
                </g>
              </svg>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-zinc-500">Seleccionado:</span>
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-mono font-bold text-xs">
                {triangleTarget === 'V' ? 'Tensión (V)' : triangleTarget === 'I' ? 'Corriente (I)' : 'Resistencia (R)'}
              </span>
            </div>
          </div>

          <div className="md:col-span-7 bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Fórmula Despejada
              </div>

              {triangleTarget === 'V' && (
                <div className="space-y-4">
                  <div className="text-4xl font-extrabold font-mono text-teal-900">
                    V = I × R
                  </div>
                  <h4 className="text-base font-bold text-zinc-900">
                    Cálculo del Voltaje o Diferencia de Potencial
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    El voltaje (en voltios) es la fuerza o "presión" impulsora requerida para desplazar una corriente determinada a través de una resistencia.
                  </p>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-700">
                    Ejemplo: Con una corriente I = 0,04 A atravesando R = 300 Ω:<br />
                    V = 0,04 A × 300 Ω = <strong className="text-emerald-700">12 Voltios</strong>.
                  </div>
                </div>
              )}

              {triangleTarget === 'I' && (
                <div className="space-y-4">
                  <div className="text-4xl font-extrabold font-mono text-teal-900">
                    I = V / R
                  </div>
                  <h4 className="text-base font-bold text-zinc-900">
                    Cálculo de la Intensidad de Corriente Eléctrica
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    La corriente (en amperios) es directamente proporcional a la tensión aplicada e inversamente proporcional a la resistencia del circuito.
                  </p>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-700">
                    Ejemplo: Con una tensión de 12 V y una resistencia total de 200 Ω:<br />
                    I = 12 V / 200 Ω = <strong className="text-emerald-700">0,06 A (60 mA)</strong>.
                  </div>
                </div>
              )}

              {triangleTarget === 'R' && (
                <div className="space-y-4">
                  <div className="text-4xl font-extrabold font-mono text-teal-900">
                    R = V / I
                  </div>
                  <h4 className="text-base font-bold text-zinc-900">
                    Cálculo de la Resistencia Eléctrica
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    La resistencia (en ohmios) representa la oposición física que ofrecen los materiales conductores al flujo libre de electrones.
                  </p>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-700">
                    Ejemplo: Si una fuente de 12 V produce una corriente de 40 mA (0,04 A):<br />
                    R = 12 V / 0,04 A = <strong className="text-emerald-700">300 Ω</strong>.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-150 flex items-center justify-between text-xs text-zinc-500">
              <span>Ley formulada por Georg Simon Ohm en 1827</span>
              <span className="font-semibold text-teal-800">Unidades SI: V, A, Ω</span>
            </div>
          </div>
        </div>

        {/* Section 2: Circuit Rules Comparison: Serie vs Paralelo */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs mt-8">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">
            Comparativa: Circuitos en Serie vs. Circuitos en Paralelo
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Comprende cómo se comportan las magnitudes según la topología de conexión.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-mono font-semibold uppercase text-[10px]">
                  <th className="pb-2.5">PROPIEDAD</th>
                  <th className="pb-2.5">CIRCUITO EN SERIE</th>
                  <th className="pb-2.5">CIRCUITO EN PARALELO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-3 font-semibold text-zinc-900">Trayectoria de corriente</td>
                  <td className="py-3 text-zinc-600">Único camino cerrado sin bifurcaciones.</td>
                  <td className="py-3 text-zinc-600">Múltiples ramales independientes conectados a los mismos nodos.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-900">Intensidad de corriente (I)</td>
                  <td className="py-3 text-teal-800 font-mono font-medium">Constante: I_total = I1 = I2 = ...</td>
                  <td className="py-3 text-teal-800 font-mono font-medium">Se divide en nodos: I_total = I1 + I2 + ...</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-900">Tensión / Caída de voltaje (V)</td>
                  <td className="py-3 text-zinc-600 font-mono">Se reparte: V_total = V1 + V2 + ...</td>
                  <td className="py-3 text-zinc-600 font-mono">Común en cada rama: V_fuente = V1 = V2 = ...</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-900">Resistencia equivalente (Req)</td>
                  <td className="py-3 text-zinc-900 font-mono font-bold">Req = R1 + R2 + ... (Aumenta)</td>
                  <td className="py-3 text-zinc-900 font-mono font-bold">1/Req = 1/R1 + 1/R2 + ... (Disminuye)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-900">Interrupción de un componente</td>
                  <td className="py-3 text-amber-700">Se interrumpe todo el circuito (se apaga todo).</td>
                  <td className="py-3 text-emerald-700">Las demás ramas siguen operando normalmente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Potencia Eléctrica, Efecto Joule y Peligro de Sobrecarga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Efecto Joule & Potencia Disipada
            </div>

            <h3 className="text-base font-bold text-zinc-900">
              ¿Por qué se calientan las resistencias?
            </h3>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Cuando los electrones atraviesan un conductor resistivo, colisionan constantemente con la red atómica del material.
              Esta fricción a escala cuántica convierte la energía eléctrica en energía calorífica (calor), gobernada por la Ley de Joule:
            </p>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-sm text-center font-bold text-zinc-900">
              P = V × I = I² × R = V² / R
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              <strong>Efecto Cuadrático:</strong> Nota que la disipación crece con el <em>cuadrado</em> de la corriente.
              Si duplicas la corriente que fluye por una resistencia, ¡el calor disipado se multiplica por 4!
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-800 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Sobrecarga y Protección con Disyuntor
            </div>

            <h3 className="text-base font-bold text-zinc-900">
              Límites de Seguridad Térmica
            </h3>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Cada componente físico tiene una potencia nominal máxima admisible (típicamente 1/4 W = 0,25 W, 1/2 W = 0,5 W, o 1 W).
              Si se excede este valor, el componente sufre degradación térmica acelerada o se quema:
            </p>

            <ul className="text-xs text-zinc-600 space-y-1.5 list-disc pl-4">
              <li><strong>Cortocircuito (R → 0 Ω):</strong> La corriente tiende a infinito, disparando la temperatura instantáneamente.</li>
              <li><strong>Alarma del Simulador:</strong> El simulador te alerta visualmente con halo incandescente cuando se sobrepasa la potencia o corriente segura configurada.</li>
              <li><strong>Disyuntor / Fusible:</strong> Corta automáticamente el lazo conductor para proteger la integridad del circuito.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
