/**
 * Ohm Lab - Laboratorio y Simulador de la Ley de Ohm
 * Directly launches into the interactive circuit workspace (No landing page),
 * enabling custom circuit assembly, dynamic real-time sliders, visual electron flow,
 * overload protection, and step-by-step mathematical analysis.
 */
import React, { useMemo, useState } from 'react';
import { ActiveTab, Navbar } from './components/Navbar';
import { SimulatorView } from './components/SimulatorView';
import { AnalysisView } from './components/AnalysisView';
import { HowItWorksView } from './components/HowItWorksView';
import { SymbolsGuideModal } from './components/SymbolsGuideModal';
import { CircuitTopology, Resistor, SafetyLimits } from './types/circuit';
import { solveCircuit } from './utils/circuitCalculations';
import { setSoundEnabled } from './utils/audio';
import { BookOpen, Wrench, X, Zap } from 'lucide-react';

const DEFAULT_SERIES_RESISTORS: Resistor[] = [
  { id: 'r1', name: 'R1', label: 'En serie', resistance: 100, maxPowerRating: 0.5, kind: 'resistor' },
  { id: 'r2', name: 'R2', label: 'En serie', resistance: 200, maxPowerRating: 0.5, kind: 'resistor' },
];

const DEFAULT_PARALLEL_RESISTORS: Resistor[] = [
  { id: 'r1', name: 'R1', label: 'Rama 1', resistance: 100, maxPowerRating: 0.5, kind: 'resistor' },
  { id: 'r2', name: 'R2', label: 'Rama 2', resistance: 200, maxPowerRating: 0.5, kind: 'resistor' },
];

const DEFAULT_MIXED_RESISTORS: Resistor[] = [
  { id: 'r1', name: 'R1', label: 'En serie', resistance: 100, maxPowerRating: 0.5, kind: 'resistor' },
  { id: 'r2', name: 'R2', label: 'Rama 1', resistance: 200, maxPowerRating: 0.5, kind: 'resistor' },
  { id: 'r3', name: 'R3', label: 'Rama 2', resistance: 200, maxPowerRating: 0.5, kind: 'resistor' },
];

export default function App() {
  // Directly opens into the interactive simulator workspace!
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulador');
  const [topology, setTopology] = useState<CircuitTopology>('series');
  const [voltage, setVoltage] = useState<number>(12);
  const [resistors, setResistors] = useState<Resistor[]>(DEFAULT_SERIES_RESISTORS);
  const [isClosed, setIsClosed] = useState<boolean>(true);
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Safety limits and overload configuration
  const [safety, setSafety] = useState<SafetyLimits>({
    enabled: true,
    maxCurrent_mA: 300,
    maxPowerPerResistor_W: 0.5,
    fuseEnabled: false,
    fuseTripped: false,
  });

  // Modals
  const [isSymbolsGuideOpen, setIsSymbolsGuideOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Change topology helper
  const handleSelectTopology = (newTop: CircuitTopology) => {
    setTopology(newTop);
    if (newTop === 'series') {
      setResistors(DEFAULT_SERIES_RESISTORS);
    } else if (newTop === 'parallel') {
      setResistors(DEFAULT_PARALLEL_RESISTORS);
    } else {
      setResistors(DEFAULT_MIXED_RESISTORS);
    }
    setSafety((prev) => ({ ...prev, fuseTripped: false }));
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  // Real-time circuit analysis solver
  const analysis = useMemo(() => {
    return solveCircuit(topology, voltage, resistors, isClosed, safety);
  }, [topology, voltage, resistors, isClosed, safety]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF8] font-sans text-zinc-900 antialiased selection:bg-teal-200">
      {/* Navbar with direct access to Simulator, Analysis, and Theory */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'simulador' && (
          <SimulatorView
            topology={topology}
            onChangeTopology={handleSelectTopology}
            voltage={voltage}
            onChangeVoltage={setVoltage}
            resistors={resistors}
            onChangeResistors={setResistors}
            analysis={analysis}
            isClosed={isClosed}
            onToggleSwitch={() => setIsClosed(!isClosed)}
            safety={safety}
            onChangeSafety={setSafety}
            onNavigateToAnalysis={() => setActiveTab('analisis')}
            onOpenSymbolsGuide={() => setIsSymbolsGuideOpen(true)}
            soundEnabled={soundActive}
            onToggleSound={handleToggleSound}
          />
        )}

        {activeTab === 'analisis' && (
          <AnalysisView
            topology={topology}
            voltage={voltage}
            analysis={analysis}
            onBackToEditor={() => setActiveTab('simulador')}
          />
        )}

        {activeTab === 'como-funciona' && (
          <HowItWorksView onBackToSimulator={() => setActiveTab('simulador')} />
        )}
      </main>

      {/* Electrical Symbols Guide Modal */}
      <SymbolsGuideModal
        isOpen={isSymbolsGuideOpen}
        onClose={() => setIsSymbolsGuideOpen(false)}
      />

      {/* Help & Quick Tour Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  Ω
                </div>
                <h3 className="text-base font-bold text-zinc-900">
                  Ayuda del Taller Ohm Lab
                </h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              <p>
                Tu <strong>mesa de experimentación digital</strong> está lista para armar circuitos y simular en tiempo real la <strong>Ley de Ohm (V = I × R)</strong>.
              </p>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-teal-700" />
                  Cómo armar y probar circuitos:
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-600">
                  <li><strong>+ Añadir componentes:</strong> Usa los botones del panel izquierdo para añadir resistencias o bombillas de prueba (hasta 5 componentes).</li>
                  <li><strong>Alternar tipo de carga:</strong> Haz clic en el botón de cada componente en el panel lateral para convertirlo en resistencia pura o en bombilla incandescente.</li>
                  <li><strong>Eliminar componentes:</strong> Haz clic en el icono de papelera para retirar elementos del circuito.</li>
                  <li><strong>Ajuste en vivo:</strong> Mueve los deslizadores de tensión o resistencia para observar el cambio de corriente instantáneo y el flujo de electrones.</li>
                  <li><strong>Protección y sobrecarga:</strong> Si la potencia supera el límite admisible, verás la advertencia de sobrecarga y el halo incandescente.</li>
                </ul>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setIsHelpOpen(false);
                    setIsSymbolsGuideOpen(true);
                  }}
                  className="text-teal-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Simbología eléctrica</span>
                </button>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-1.5 bg-teal-800 text-white rounded-xl font-semibold hover:bg-teal-900 transition cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
