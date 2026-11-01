/**
 * SimulatorView - Circuit simulator and custom testbench builder
 * Enables testing Series, Parallel, and Mixed circuits as well as
 * assembling and testing custom circuit configurations (adding/removing resistors and test lamps).
 */
import React, { useState } from 'react';
import { CircuitAnalysis, CircuitTopology, Resistor, SafetyLimits } from '../types/circuit';
import { CircuitCanvas } from './CircuitCanvas';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Flame,
  HelpCircle,
  Lightbulb,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';
import { playFuseTripSound, playOverloadWarning, playSliderTick } from '../utils/audio';

interface SimulatorViewProps {
  topology: CircuitTopology;
  onChangeTopology: (newTopology: CircuitTopology) => void;
  voltage: number;
  onChangeVoltage: (v: number) => void;
  resistors: Resistor[];
  onChangeResistors: (resistors: Resistor[]) => void;
  analysis: CircuitAnalysis;
  isClosed: boolean;
  onToggleSwitch: () => void;
  safety: SafetyLimits;
  onChangeSafety: (safety: SafetyLimits) => void;
  onNavigateToAnalysis: () => void;
  onOpenSymbolsGuide: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  topology,
  onChangeTopology,
  voltage,
  onChangeVoltage,
  resistors,
  onChangeResistors,
  analysis,
  isClosed,
  onToggleSwitch,
  safety,
  onChangeSafety,
  onNavigateToAnalysis,
  onOpenSymbolsGuide,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedResistorId, setSelectedResistorId] = useState<string | null>(null);
  const [flowType, setFlowType] = useState<'conventional' | 'electrons'>('conventional');
  const [isPaused, setIsPaused] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [showSafetyPanel, setShowSafetyPanel] = useState(true);

  // Monitor overload and trigger alarm if needed
  React.useEffect(() => {
    if (analysis.hasOverload && isClosed && !isPaused) {
      playOverloadWarning();
      if (safety.fuseEnabled && !safety.fuseTripped) {
        playFuseTripSound();
        onChangeSafety({ ...safety, fuseTripped: true });
      }
    }
  }, [analysis.hasOverload, isClosed, isPaused, safety, onChangeSafety]);

  const handleVoltageChange = (newV: number) => {
    playSliderTick();
    onChangeVoltage(Math.max(0, Math.min(48, Math.round(newV))));
  };

  const handleResistorChange = (id: string, newResistance: number) => {
    playSliderTick();
    const updated = resistors.map((r) =>
      r.id === id ? { ...r, resistance: Math.max(1, Math.min(1000, Math.round(newResistance))) } : r
    );
    onChangeResistors(updated);
  };

  // Add a new resistor to circuit
  const handleAddResistor = (kind: 'resistor' | 'lamp' = 'resistor') => {
    playSliderTick();
    if (resistors.length >= 5) {
      return; // Max 5 components for optimal visual layout
    }
    const nextIndex = resistors.length + 1;
    const newId = `r_${Date.now()}`;
    const newName = kind === 'lamp' ? `L${nextIndex}` : `R${nextIndex}`;
    const newLabel =
      topology === 'series'
        ? 'En serie'
        : topology === 'parallel'
        ? `Rama ${nextIndex}`
        : nextIndex === 1
        ? 'En serie'
        : `Rama ${nextIndex - 1}`;

    const newResistor: Resistor = {
      id: newId,
      name: newName,
      label: newLabel,
      resistance: kind === 'lamp' ? 120 : 150,
      maxPowerRating: safety.maxPowerPerResistor_W,
      kind,
      branch: topology === 'series' ? 'main' : nextIndex === 1 ? 'main' : `branch${nextIndex - 1}`,
    };

    onChangeResistors([...resistors, newResistor]);
    setSelectedResistorId(newId);
  };

  // Remove a resistor from circuit
  const handleRemoveResistor = (id: string) => {
    playSliderTick();
    if (resistors.length <= 1) return; // Keep at least 1
    const updated = resistors.filter((r) => r.id !== id);
    onChangeResistors(updated);
    if (selectedResistorId === id) {
      setSelectedResistorId(updated[0]?.id || null);
    }
  };

  // Toggle component kind (resistor <-> lamp)
  const handleToggleKind = (id: string) => {
    playSliderTick();
    const updated = resistors.map((r) => {
      if (r.id === id) {
        const nextKind = r.kind === 'lamp' ? 'resistor' : 'lamp';
        return {
          ...r,
          kind: nextKind as 'resistor' | 'lamp',
          name: nextKind === 'lamp' ? r.name.replace('R', 'L') : r.name.replace('L', 'R'),
        };
      }
      return r;
    });
    onChangeResistors(updated);
  };

  const handleResetExample = () => {
    playSliderTick();
    onChangeVoltage(12);
    if (topology === 'series') {
      onChangeResistors([
        { id: 'r1', name: 'R1', label: 'En serie', resistance: 100, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
        { id: 'r2', name: 'R2', label: 'En serie', resistance: 200, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
      ]);
    } else if (topology === 'parallel') {
      onChangeResistors([
        { id: 'r1', name: 'R1', label: 'Rama 1', resistance: 100, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
        { id: 'r2', name: 'R2', label: 'Rama 2', resistance: 200, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
      ]);
    } else {
      onChangeResistors([
        { id: 'r1', name: 'R1', label: 'En serie', resistance: 100, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
        { id: 'r2', name: 'R2', label: 'Rama 1', resistance: 200, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
        { id: 'r3', name: 'R3', label: 'Rama 2', resistance: 200, maxPowerRating: safety.maxPowerPerResistor_W, kind: 'resistor' },
      ]);
    }
    onChangeSafety({ ...safety, fuseTripped: false });
  };

  const practiceNum =
    topology === 'series' ? '01' : topology === 'parallel' ? '02' : '03';

  const titleText =
    topology === 'series'
      ? 'Circuito en serie'
      : topology === 'parallel'
      ? 'Circuito en paralelo'
      : 'Circuito mixto';

  const subtitleText =
    topology === 'series'
      ? 'Una trayectoria continua. Mismo flujo de corriente a través de cada elemento.'
      : topology === 'parallel'
      ? 'Múltiples ramas paralelas conectadas a la misma tensión.'
      : 'Combinación serie-paralelo. Resuelve y experimenta de forma modular.';

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAF8] overflow-hidden select-none">
      {/* Top Breadcrumb & Title Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <span>Simulador & Banco de Pruebas</span>
            <span>/</span>
            <span className="text-zinc-600 font-semibold">Práctica {practiceNum}</span>
            <span>/</span>
            <span className="text-teal-800 font-bold">{resistors.length} componentes</span>
          </div>

          <div className="flex items-baseline gap-3 mt-0.5">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
              {titleText}
            </h1>
            <span className="text-xs text-zinc-500 hidden sm:inline">{subtitleText}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Topology Selector Switcher */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
            <button
              onClick={() => onChangeTopology('series')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                topology === 'series'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Serie
            </button>
            <button
              onClick={() => onChangeTopology('parallel')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                topology === 'parallel'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Paralelo
            </button>
            <button
              onClick={() => onChangeTopology('mixed')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                topology === 'mixed'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Mixto
            </button>
          </div>

          {/* Simulation Active Pill */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className={`w-2 h-2 rounded-full ${!isPaused && isClosed ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
            <span>{!isPaused && isClosed ? 'Simulación activa' : 'Simulación pausada'}</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>

          {/* "Ver análisis" Button */}
          <button
            onClick={onNavigateToAnalysis}
            className="px-4 py-1.5 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ver análisis</span>
          </button>
        </div>
      </div>

      {/* Main Workspace 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Component Palette & Circuit Assembler */}
        <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-teal-700" />
                <span>Armar Circuito</span>
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">Taller</span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-tight">
              Añade componentes a tu mesa de pruebas para experimentar libremente.
            </p>

            {/* Component Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar componente..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-teal-600"
              />
            </div>

            {/* Quick Actions to Add Components to Circuit */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                AÑADIR A TU CIRCUITO
              </div>

              {/* Add Resistor Button */}
              <button
                onClick={() => handleAddResistor('resistor')}
                disabled={resistors.length >= 5}
                className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 transition flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    Ω
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">+ Resistencia</h4>
                    <p className="text-[10px] text-emerald-700">Añadir resistor de prueba</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-emerald-700" />
              </button>

              {/* Add Lamp / Bulb Button */}
              <button
                onClick={() => handleAddResistor('lamp')}
                disabled={resistors.length >= 5}
                className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 transition flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">+ Bombilla de carga</h4>
                    <p className="text-[10px] text-amber-700">Lámpara con brillo dinámico</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-amber-700" />
              </button>
            </div>

            {/* BÁSICOS Category */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-150">
              <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                COMPONENTES ACTIVOS
              </div>

              {/* DC Power Supply */}
              <div
                onClick={() => setSelectedResistorId(null)}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-teal-600 hover:bg-teal-50/40 transition cursor-pointer flex items-center gap-3 bg-white"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
                  <BatteryCharging className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Fuente de CC (V1)</h4>
                  <p className="text-[10px] text-zinc-500">{voltage} V continua</p>
                </div>
              </div>

              {/* Switch Component */}
              <div
                onClick={onToggleSwitch}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-teal-600 hover:bg-teal-50/40 transition cursor-pointer flex items-center gap-3 bg-white"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Interruptor</h4>
                  <p className="text-[10px] text-zinc-500">
                    {isClosed ? 'Cerrado (ON)' : 'Abierto (OFF)'}
                  </p>
                </div>
              </div>
            </div>

            {/* MEDICIÓN Category */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-150">
              <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                INSTRUMENTOS DE MEDIDA
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col items-center text-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    V
                  </div>
                  <span className="text-[11px] font-bold text-blue-900 mt-1">Voltímetro</span>
                  <span className="text-[9px] text-blue-700">Mide tensión</span>
                </div>

                <div className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col items-center text-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    A
                  </div>
                  <span className="text-[11px] font-bold text-emerald-900 mt-1">Amperímetro</span>
                  <span className="text-[9px] text-emerald-700">Mide corriente</span>
                </div>
              </div>
            </div>

            {/* Educational Prompt Card */}
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <Lightbulb className="w-3.5 h-3.5 text-teal-700" />
                <span>Consejo de armado</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-snug">
                Puedes sumar hasta 5 resistencias o bombillas para comparar caídas de potencial y verificar la conservación de energía.
              </p>
            </div>
          </div>

          {/* Guide link at bottom of left sidebar */}
          <div className="p-4 border-t border-zinc-200">
            <button
              onClick={onOpenSymbolsGuide}
              className="w-full py-2 px-3 rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium text-xs flex items-center justify-between transition cursor-pointer hover:bg-zinc-50"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Guía de símbolos</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </aside>

        {/* CENTER COLUMN: Canvas + Bottom Metrics Cards */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Virtual Circuit Breaker Tripped Alert */}
          {safety.fuseTripped && (
            <div className="bg-red-700 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>
                  ¡DISYUNTOR DE SEGURIDAD DISPARADO! El circuito se ha abierto para evitar daños por sobrecalentamiento.
                </span>
              </div>
              <button
                onClick={() => onChangeSafety({ ...safety, fuseTripped: false })}
                className="px-3 py-1 bg-white text-red-700 rounded-lg text-xs font-bold hover:bg-zinc-100 transition cursor-pointer"
              >
                Rearmar disyuntor
              </button>
            </div>
          )}

          {/* Canvas Component */}
          <CircuitCanvas
            topology={topology}
            voltage={voltage}
            resistors={resistors}
            analysis={analysis}
            isClosed={isClosed && !safety.fuseTripped}
            onToggleSwitch={onToggleSwitch}
            selectedResistorId={selectedResistorId}
            onSelectResistor={(id) => setSelectedResistorId(id)}
            flowType={flowType}
            onToggleFlowType={() =>
              setFlowType((prev) => (prev === 'conventional' ? 'electrons' : 'conventional'))
            }
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            onZoomOut={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            onResetZoom={() => setZoom(1)}
          />

          {/* BOTTOM METRICS PANEL */}
          <div className="bg-white border-t border-zinc-200 p-5 space-y-4 shrink-0">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1: Resistencia equivalente */}
              <div className="bg-[#FAFBF9] border border-zinc-200/90 rounded-2xl p-4">
                <div className="text-xs text-zinc-500 font-medium mb-1">
                  Resistencia equivalente
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 tracking-tight">
                  {topology === 'parallel' && !Number.isInteger(analysis.equivalentResistance) ? '≈ ' : ''}
                  {analysis.equivalentResistance} Ω
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  Req · Vista desde la fuente
                </div>
              </div>

              {/* Metric 2: Corriente total */}
              <div className="bg-[#FAFBF9] border border-zinc-200/90 rounded-2xl p-4">
                <div className="text-xs text-zinc-500 font-medium mb-1">Corriente total</div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 tracking-tight">
                  {analysis.totalCurrent_mA} mA
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  I = V / Req ({analysis.totalCurrent_A} A)
                </div>
              </div>

              {/* Metric 3: Potencia total */}
              <div className="bg-[#FAFBF9] border border-zinc-200/90 rounded-2xl p-4">
                <div className="text-xs text-zinc-500 font-medium mb-1">Potencia total</div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 tracking-tight">
                  {analysis.totalPower_W} W
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  P = V × I (Efecto Joule)
                </div>
              </div>
            </div>

            {/* Pedagogical Note Card */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-950 leading-relaxed">
                  {analysis.pedagogicalNote}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Parameters & Overload Safety Controls */}
        <aside className="w-80 bg-white border-l border-zinc-200 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Parámetros del circuito
                </h2>
                <Sliders className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Ajusta los valores y observa las mediciones al instante.
              </p>
            </div>

            {/* Section 1: FUENTE DE ALIMENTACIÓN V1 */}
            <div className="space-y-3 pt-1 border-t border-zinc-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                  FUENTE DE ALIMENTACIÓN
                </span>
                <span className="font-mono text-zinc-400 text-[11px]">V1</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600">Tensión</span>
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                  <button
                    onClick={() => handleVoltageChange(voltage - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-700 font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-xs px-2 text-zinc-900 min-w-[48px] text-center">
                    {voltage} V
                  </span>
                  <button
                    onClick={() => handleVoltageChange(voltage + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-700 font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Slider for Voltage */}
              <input
                type="range"
                min="0"
                max="24"
                value={voltage}
                onChange={(e) => handleVoltageChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>0 V</span>
                <span>24 V</span>
              </div>
            </div>

            {/* Section 2: RESISTENCIAS Y COMPONENTES DEL CIRCUITO */}
            <div className="space-y-4 pt-2 border-t border-zinc-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                <span>COMPONENTES ({resistors.length})</span>
                <button
                  onClick={() => handleAddResistor('resistor')}
                  disabled={resistors.length >= 5}
                  className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer disabled:opacity-40"
                  title="Añadir otro componente"
                >
                  + Añadir
                </button>
              </div>

              {resistors.map((r, idx) => {
                const isSelected = selectedResistorId === r.id;
                const rAnalysis = analysis.resistors.find((item) => item.id === r.id);
                const isOver = rAnalysis?.isOverloaded;

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResistorId(r.id)}
                    className={`space-y-2.5 p-3 rounded-xl border transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/20 shadow-xs'
                        : isOver
                        ? 'border-red-300 bg-red-50/30'
                        : 'border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-bold text-[11px] text-zinc-800">
                          {r.name}
                        </span>
                        {/* Switch kind button (Resistor vs Lamp) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleKind(r.id);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 cursor-pointer font-medium"
                          title="Alternar entre Resistencia y Bombilla"
                        >
                          {r.kind === 'lamp' ? '💡 Lámpara' : '⚡ Resistor'}
                        </button>
                        {isOver && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            Sobrecarga
                          </span>
                        )}
                      </div>

                      {/* Controls and delete button */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg p-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResistorChange(r.id, r.resistance - 10);
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-mono font-bold text-xs px-1.5 min-w-[50px] text-center text-zinc-900">
                            {r.resistance} Ω
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResistorChange(r.id, r.resistance + 10);
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {resistors.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveResistor(r.id);
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Quitar este componente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resistor slider */}
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={r.resistance}
                      onChange={(e) => handleResistorChange(r.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                    />

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>0 Ω</span>
                      {/* Mini color band pills preview */}
                      <div className="flex gap-1 items-center">
                        {rAnalysis?.colorBands.map((band, bIdx) => (
                          <span
                            key={bIdx}
                            className="w-2.5 h-2 rounded-xs border border-zinc-300"
                            style={{ backgroundColor: band.hex }}
                            title={`${band.name}`}
                          />
                        ))}
                      </div>
                      <span>500 Ω</span>
                    </div>

                    {/* Resistor measurements summary */}
                    {rAnalysis && (
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-100">
                        <span>V: {rAnalysis.voltageDrop} V</span>
                        <span>I: {rAnalysis.current_mA} mA</span>
                        <span className={isOver ? 'text-red-600 font-bold' : ''}>
                          P: {rAnalysis.power_W} W
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Section 3: CONFIGURACIÓN DE SEGURIDAD / SOBRECARGA */}
            <div className="space-y-3 pt-2 border-t border-zinc-150">
              <div
                onClick={() => setShowSafetyPanel(!showSafetyPanel)}
                className="flex items-center justify-between text-[11px] font-bold text-zinc-700 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-700" />
                  <span>PROTECCIÓN Y SOBRECARGA</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {safety.enabled ? 'Activa' : 'Desactivada'}
                </span>
              </div>

              {showSafetyPanel && (
                <div className="space-y-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
                  {/* Enable safety toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Alarma de sobrecarga</span>
                    <button
                      onClick={() => onChangeSafety({ ...safety, enabled: !safety.enabled })}
                      className="cursor-pointer"
                    >
                      {safety.enabled ? (
                        <ToggleRight className="w-6 h-6 text-teal-700" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-400" />
                      )}
                    </button>
                  </div>

                  {/* Max Power Limit */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-600 text-[11px]">
                      <span>Potencia máx admisible:</span>
                      <span className="font-mono font-bold text-zinc-800">
                        {safety.maxPowerPerResistor_W} W
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[0.25, 0.5, 1.0, 2.0].map((val) => (
                        <button
                          key={val}
                          onClick={() => onChangeSafety({ ...safety, maxPowerPerResistor_W: val })}
                          className={`flex-1 py-1 rounded text-[10px] font-mono font-semibold transition cursor-pointer ${
                            safety.maxPowerPerResistor_W === val
                              ? 'bg-teal-800 text-white'
                              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          {val} W
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Current Limit */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-zinc-600 text-[11px]">
                      <span>Límite de corriente máxima:</span>
                      <span className="font-mono font-bold text-zinc-800">
                        {safety.maxCurrent_mA} mA
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={safety.maxCurrent_mA}
                      onChange={(e) =>
                        onChangeSafety({ ...safety, maxCurrent_mA: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                    />
                  </div>

                  {/* Automatic Breaker fuse */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200">
                    <span className="text-[11px] text-zinc-600">Disyuntor térmico automático</span>
                    <button
                      onClick={() =>
                        onChangeSafety({ ...safety, fuseEnabled: !safety.fuseEnabled })
                      }
                      className="cursor-pointer"
                    >
                      {safety.fuseEnabled ? (
                        <ToggleRight className="w-5 h-5 text-teal-700" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: LEY DE OHM info box */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                LEY DE OHM
              </div>
              <div className="text-xl font-mono font-bold text-zinc-900 tracking-wider">
                V = I × R
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">
                V en voltios · I en amperios · R en ohmios
              </p>
            </div>

            {/* Reset Example Button */}
            <button
              onClick={handleResetExample}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 text-zinc-700 font-semibold text-xs hover:bg-zinc-50 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Restablecer valores iniciales</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
