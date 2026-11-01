/**
 * CircuitCanvas - Real-time animated schematic with electron flow,
 * dynamic component rendering (resistors, incandescent test lamps),
 * interactive switch, and overload alerts.
 */
import React, { useEffect, useRef, useState } from 'react';
import { CircuitAnalysis, CircuitTopology, Resistor } from '../types/circuit';
import { AlertTriangle, Flame, Lightbulb, RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react';
import { playSwitchSound } from '../utils/audio';

interface CircuitCanvasProps {
  topology: CircuitTopology;
  voltage: number;
  resistors: Resistor[];
  analysis: CircuitAnalysis;
  isClosed: boolean;
  onToggleSwitch: () => void;
  selectedResistorId: string | null;
  onSelectResistor: (id: string) => void;
  flowType: 'conventional' | 'electrons';
  onToggleFlowType: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showProbes?: boolean;
}

interface Particle {
  id: number;
  branchIdx: number; // 0 = main/series, 1..N = parallel branches
  progress: number;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  topology,
  voltage,
  resistors,
  analysis,
  isClosed,
  onToggleSwitch,
  selectedResistorId,
  onSelectResistor,
  flowType,
  onToggleFlowType,
  isPaused,
  onToggleSound,
  soundEnabled,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles based on number of branches
  useEffect(() => {
    const list: Particle[] = [];
    // Main loop particles
    for (let i = 0; i < 35; i++) {
      list.push({
        id: i,
        branchIdx: 0,
        progress: (i / 35) + Math.random() * 0.01,
      });
    }
    // Branch particles
    for (let b = 1; b <= 4; b++) {
      for (let i = 0; i < 15; i++) {
        list.push({
          id: 35 + (b - 1) * 15 + i,
          branchIdx: b,
          progress: (i / 15) + Math.random() * 0.01,
        });
      }
    }
    particlesRef.current = list;
  }, [topology, resistors.length]);

  // Animation Loop for electron / charge particles
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(50, time - lastTime);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const active = isClosed && !isPaused && analysis.totalCurrent_mA > 0.1;
      const speedMultiplier = flowType === 'conventional' ? 1 : -1;
      const mainSpeed = active ? Math.min(0.008, Math.max(0.0006, (analysis.totalCurrent_mA / 300) * 0.003)) : 0;

      // Update positions
      if (active) {
        particlesRef.current.forEach((p) => {
          let spd = mainSpeed;
          if (p.branchIdx > 0) {
            const branchRes = analysis.resistors[p.branchIdx - 1];
            const iBranch = branchRes?.current_mA || 10;
            const maxI = Math.max(...analysis.resistors.map((r) => r.current_mA), 1);
            spd = Math.min(0.008, Math.max(0.0005, (iBranch / maxI) * mainSpeed));
          }
          p.progress += spd * (delta / 16.6) * speedMultiplier;
          if (p.progress > 1) p.progress -= 1;
          if (p.progress < 0) p.progress += 1;
        });
      }

      // Coordinates mapping
      const leftX = 120;
      const rightX = 740;
      const topY = 130;
      const botY = 330;

      // Draw particle dots
      particlesRef.current.forEach((p) => {
        let pt = { x: 0, y: 0 };

        if (topology === 'series') {
          // Single closed rectangular loop: (leftX, botY) -> (leftX, topY) -> (rightX, topY) -> (rightX, botY) -> (leftX, botY)
          const l1 = botY - topY;
          const l2 = rightX - leftX;
          const l3 = botY - topY;
          const l4 = rightX - leftX;
          const tot = l1 + l2 + l3 + l4;
          let d = p.progress * tot;
          if (d < l1) pt = { x: leftX, y: botY - d };
          else if (d < l1 + l2) pt = { x: leftX + (d - l1), y: topY };
          else if (d < l1 + l2 + l3) pt = { x: rightX, y: topY + (d - l1 - l2) };
          else pt = { x: rightX - (d - l1 - l2 - l3), y: botY };
        } else if (topology === 'parallel') {
          // Bus bars from leftX to last branch X
          const branchCount = Math.max(2, resistors.length);
          const startX = 380;
          const spacing = Math.min(180, (rightX - startX) / (branchCount - 1 || 1));
          const targetBranch = Math.min(branchCount, Math.max(1, p.branchIdx));
          const branchX = startX + (targetBranch - 1) * spacing;

          if (p.branchIdx === 0) {
            // Main loop before branches
            const l1 = botY - topY;
            const l2 = startX - leftX;
            const l3 = startX - leftX;
            const tot = l1 + l2 + l3;
            let d = p.progress * tot;
            if (d < l1) pt = { x: leftX, y: botY - d };
            else if (d < l1 + l2) pt = { x: leftX + (d - l1), y: topY };
            else pt = { x: startX - (d - l1 - l2), y: botY };
          } else {
            // Into branch
            const l1 = branchX - startX;
            const l2 = botY - topY;
            const l3 = branchX - startX;
            const tot = l1 + l2 + l3;
            let d = p.progress * tot;
            if (d < l1) pt = { x: startX + d, y: topY };
            else if (d < l1 + l2) pt = { x: branchX, y: topY + (d - l1) };
            else pt = { x: branchX - (d - l1 - l2), y: botY };
          }
        } else {
          // Mixed
          const midX = 460;
          if (p.branchIdx === 0) {
            // Supply through main series resistor up to midX
            const l1 = botY - topY;
            const l2 = midX - leftX;
            const l3 = midX - leftX;
            const tot = l1 + l2 + l3;
            let d = p.progress * tot;
            if (d < l1) pt = { x: leftX, y: botY - d };
            else if (d < l1 + l2) pt = { x: leftX + (d - l1), y: topY };
            else pt = { x: midX - (d - l1 - l2), y: botY };
          } else {
            // Branch 1 or Branch 2
            const bX = p.branchIdx === 1 ? 520 : 710;
            const l1 = bX - midX;
            const l2 = botY - topY;
            const l3 = bX - midX;
            const tot = l1 + l2 + l3;
            let d = p.progress * tot;
            if (d < l1) pt = { x: midX + d, y: topY };
            else if (d < l1 + l2) pt = { x: bX, y: topY + (d - l1) };
            else pt = { x: bX - (d - l1 - l2), y: botY };
          }
        }

        if (pt.x > 0 && pt.y > 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, active ? 3.5 : 2.5, 0, Math.PI * 2);

          if (flowType === 'electrons') {
            ctx.fillStyle = active ? '#06B6D4' : '#94A3B8';
            ctx.shadowColor = active ? '#38BDF8' : 'transparent';
            ctx.shadowBlur = active ? 6 : 0;
          } else {
            ctx.fillStyle = active ? '#10B981' : '#94A3B8';
            ctx.shadowColor = active ? '#34D399' : 'transparent';
            ctx.shadowBlur = active ? 6 : 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [analysis, isClosed, isPaused, flowType, topology, resistors]);

  return (
    <div className="relative flex-1 bg-[#F9FAF8] flex flex-col overflow-hidden select-none border-b border-zinc-200">
      {/* Top canvas status bar */}
      <div className="h-11 px-5 bg-white/80 backdrop-blur border-b border-zinc-200/80 flex items-center justify-between text-xs text-zinc-600 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSwitchSound(!isClosed);
              onToggleSwitch();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
              isClosed
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-zinc-100 text-zinc-600 border border-zinc-300 hover:bg-zinc-200'
            }`}
            title="Haz clic para abrir o cerrar el interruptor del circuito"
          >
            <span className={`w-2 h-2 rounded-full ${isClosed ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
            {isClosed ? 'Circuito cerrado' : 'Circuito abierto'}
          </button>

          <span className="text-zinc-300">|</span>
          <span className="text-zinc-500 font-mono">Fuente ideal · CC</span>
          <span className="text-zinc-300">|</span>

          {/* Flow mode toggle */}
          <button
            onClick={onToggleFlowType}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-emerald-700 transition font-medium cursor-pointer"
            title="Alternar entre sentido convencional (+ a -) o flujo físico de electrones (- a +)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            {flowType === 'conventional' ? 'Corriente convencional (+ → −)' : 'Flujo de electrones (− → +)'}
          </button>
        </div>

        {/* Canvas controls: pause, sound, zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded hover:bg-zinc-100 transition cursor-pointer ${
              soundEnabled ? 'text-zinc-700' : 'text-zinc-400'
            }`}
            title={soundEnabled ? 'Silenciar efectos' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          <button
            onClick={onZoomOut}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 font-mono text-zinc-700 font-bold"
            title="Reducir zoom"
          >
            −
          </button>
          <button
            onClick={onResetZoom}
            className="px-1.5 py-0.5 text-[11px] font-mono rounded hover:bg-zinc-100 text-zinc-600 font-medium"
            title="Restablecer zoom al 100%"
          >
            {Math.round(zoom * 100)} %
          </button>
          <button
            onClick={onZoomIn}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 font-mono text-zinc-700 font-bold"
            title="Aumentar zoom"
          >
            +
          </button>
        </div>
      </div>

      {/* Main Canvas view area */}
      <div className="relative flex-1 w-full h-full min-h-[380px] overflow-hidden flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Overload Alert Banner */}
        {analysis.hasOverload && (
          <div className="absolute top-4 z-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-red-700">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              ¡ADVERTENCIA DE SOBRECARGA! {analysis.overloadedResistors.length > 0 ? `Componentes afectados: ${analysis.overloadedResistors.join(', ')}` : 'Corriente excede el umbral seguro'}
            </span>
          </div>
        )}

        <div
          className="relative w-full max-w-4xl h-full flex items-center justify-center transition-transform duration-150"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Background Canvas for electron particles */}
          <canvas
            ref={canvasRef}
            width={860}
            height={460}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          {/* SVG Circuit Schematic Layer */}
          <svg
            viewBox="0 0 860 460"
            className="w-full h-full select-none z-10"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.03))' }}
          >
            <defs>
              <linearGradient id="resistorBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FAF7F2" />
                <stop offset="50%" stopColor="#EFE9DE" />
                <stop offset="100%" stopColor="#DDD5C6" />
              </linearGradient>
              <linearGradient id="resistorOverload" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>

            {/* -------------------- DYNAMIC SERIES TOPOLOGY -------------------- */}
            {topology === 'series' && (
              <g>
                {/* Left wire for battery */}
                <line x1="120" y1="130" x2="120" y2="190" stroke="#1F2937" strokeWidth="2.5" />
                <line x1="120" y1="270" x2="120" y2="330" stroke="#1F2937" strokeWidth="2.5" />

                {/* Top wire with switch */}
                <line x1="120" y1="130" x2="210" y2="130" stroke="#1F2937" strokeWidth="2.5" />
                {isClosed ? (
                  <line x1="210" y1="130" x2="255" y2="130" stroke="#1F2937" strokeWidth="2.5" />
                ) : (
                  <line x1="210" y1="130" x2="250" y2="105" stroke="#DC2626" strokeWidth="2.5" />
                )}
                <circle cx="210" cy="130" r="3.5" fill="#1F2937" />
                <circle cx="255" cy="130" r="3.5" fill="#1F2937" />

                {/* Current indicator */}
                {isClosed && analysis.totalCurrent_mA > 0 && (
                  <g transform="translate(265, 118)">
                    <path d="M 0 8 L 12 8 L 8 4 M 12 8 L 8 12" stroke="#047857" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <text x="18" y="11" className="text-[11px] font-mono fill-emerald-800 font-semibold">
                      {analysis.totalCurrent_mA.toFixed(0)} mA
                    </text>
                  </g>
                )}

                {/* Evenly distributed components along top line */}
                {(() => {
                  const compCount = resistors.length;
                  const startX = 340;
                  const endX = 740;
                  const availableWidth = endX - startX;
                  const step = compCount > 1 ? availableWidth / compCount : 0;

                  return (
                    <>
                      {/* Connecting line to first resistor */}
                      <line x1="255" y1="130" x2={startX} y2="130" stroke="#1F2937" strokeWidth="2.5" />

                      {resistors.map((r, idx) => {
                        const posX = startX + idx * step + 10;
                        const rAnalysis = analysis.resistors.find((item) => item.id === r.id);
                        const nextX = idx < compCount - 1 ? startX + (idx + 1) * step + 10 : endX;

                        return (
                          <g key={r.id}>
                            {/* Component itself */}
                            {r.kind === 'lamp' ? (
                              <LampSVG
                                x={posX}
                                y={108}
                                resistor={rAnalysis}
                                isSelected={selectedResistorId === r.id}
                                onClick={() => onSelectResistor(r.id)}
                              />
                            ) : (
                              <ResistorHorizontalSVG
                                x={posX}
                                y={118}
                                width={75}
                                height={24}
                                resistor={rAnalysis}
                                isSelected={selectedResistorId === r.id}
                                onClick={() => onSelectResistor(r.id)}
                              />
                            )}

                            {/* Line connecting to next component */}
                            <line
                              x1={posX + (r.kind === 'lamp' ? 44 : 75)}
                              y1="130"
                              x2={nextX}
                              y2="130"
                              stroke="#1F2937"
                              strokeWidth="2.5"
                            />
                          </g>
                        );
                      })}

                      {/* Right vertical wire */}
                      <line x1={endX} y1="130" x2={endX} y2="330" stroke="#1F2937" strokeWidth="2.5" />
                      {/* Bottom return wire */}
                      <line x1={endX} y1="330" x2="120" y2="330" stroke="#1F2937" strokeWidth="2.5" />
                    </>
                  );
                })()}

                <text x="430" y="348" textAnchor="middle" className="text-[11px] fill-zinc-500 font-sans">
                  Retorno · 0 V
                </text>
              </g>
            )}

            {/* -------------------- DYNAMIC PARALLEL TOPOLOGY -------------------- */}
            {topology === 'parallel' && (
              <g>
                {/* Left wire for battery */}
                <line x1="120" y1="130" x2="120" y2="190" stroke="#1F2937" strokeWidth="2.5" />
                <line x1="120" y1="270" x2="120" y2="330" stroke="#1F2937" strokeWidth="2.5" />

                {/* Switch section */}
                <line x1="120" y1="130" x2="210" y2="130" stroke="#1F2937" strokeWidth="2.5" />
                {isClosed ? (
                  <line x1="210" y1="130" x2="255" y2="130" stroke="#1F2937" strokeWidth="2.5" />
                ) : (
                  <line x1="210" y1="130" x2="250" y2="105" stroke="#DC2626" strokeWidth="2.5" />
                )}
                <circle cx="210" cy="130" r="3.5" fill="#1F2937" />
                <circle cx="255" cy="130" r="3.5" fill="#1F2937" />

                {/* Current indicator */}
                {isClosed && analysis.totalCurrent_mA > 0 && (
                  <g transform="translate(265, 118)">
                    <path d="M 0 8 L 12 8 L 8 4 M 12 8 L 8 12" stroke="#047857" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <text x="18" y="11" className="text-[11px] font-mono fill-emerald-800 font-semibold">
                      {analysis.totalCurrent_mA.toFixed(0)} mA
                    </text>
                  </g>
                )}

                {/* Bus bars and branches */}
                {(() => {
                  const branchCount = Math.max(1, resistors.length);
                  const startX = 400;
                  const endX = 730;
                  const spacing = branchCount > 1 ? (endX - startX) / (branchCount - 1) : 0;
                  const lastX = branchCount > 1 ? endX : startX;

                  return (
                    <>
                      {/* Top bus bar */}
                      <line x1="255" y1="130" x2={lastX} y2="130" stroke="#1F2937" strokeWidth="2.5" />
                      {/* Bottom return bar */}
                      <line x1={lastX} y1="330" x2="120" y2="330" stroke="#1F2937" strokeWidth="2.5" />

                      {/* Render each branch */}
                      {resistors.map((r, idx) => {
                        const branchX = branchCount > 1 ? startX + idx * spacing : startX;
                        const rAnalysis = analysis.resistors.find((item) => item.id === r.id);

                        return (
                          <g key={r.id}>
                            <circle cx={branchX} cy="130" r="4.5" fill="#047857" />
                            <line x1={branchX} y1="130" x2={branchX} y2="185" stroke="#1F2937" strokeWidth="2.5" />
                            <line x1={branchX} y1="265" x2={branchX} y2="330" stroke="#1F2937" strokeWidth="2.5" />
                            <circle cx={branchX} cy="330" r="4.5" fill="#047857" />

                            {r.kind === 'lamp' ? (
                              <LampVerticalSVG
                                x={branchX - 22}
                                y={195}
                                resistor={rAnalysis}
                                isSelected={selectedResistorId === r.id}
                                onClick={() => onSelectResistor(r.id)}
                              />
                            ) : (
                              <ResistorVerticalSVG
                                x={branchX - 12}
                                y={185}
                                width={24}
                                height={80}
                                resistor={rAnalysis}
                                isSelected={selectedResistorId === r.id}
                                onClick={() => onSelectResistor(r.id)}
                              />
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}

                <text x="360" y="348" textAnchor="middle" className="text-[11px] fill-zinc-500 font-sans">
                  Retorno · 0 V
                </text>
              </g>
            )}

            {/* -------------------- DYNAMIC MIXED TOPOLOGY -------------------- */}
            {topology === 'mixed' && (
              <g>
                {/* Left wire for battery */}
                <line x1="120" y1="130" x2="120" y2="190" stroke="#1F2937" strokeWidth="2.5" />
                <line x1="120" y1="270" x2="120" y2="330" stroke="#1F2937" strokeWidth="2.5" />

                {/* Switch section */}
                <line x1="120" y1="130" x2="195" y2="130" stroke="#1F2937" strokeWidth="2.5" />
                {isClosed ? (
                  <line x1="195" y1="130" x2="235" y2="130" stroke="#1F2937" strokeWidth="2.5" />
                ) : (
                  <line x1="195" y1="130" x2="230" y2="105" stroke="#DC2626" strokeWidth="2.5" />
                )}
                <circle cx="195" cy="130" r="3.5" fill="#1F2937" />
                <circle cx="235" cy="130" r="3.5" fill="#1F2937" />

                {/* Current indicator */}
                {isClosed && analysis.totalCurrent_mA > 0 && (
                  <g transform="translate(240, 118)">
                    <path d="M 0 8 L 12 8 L 8 4 M 12 8 L 8 12" stroke="#047857" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <text x="18" y="11" className="text-[11px] font-mono fill-emerald-800 font-semibold">
                      {analysis.totalCurrent_mA.toFixed(0)} mA
                    </text>
                  </g>
                )}

                {/* Main Series Component (R1) */}
                {(() => {
                  const mainResistor = resistors[0];
                  const mainAnalysis = analysis.resistors.find((r) => r.id === mainResistor?.id);
                  const branchResistors = resistors.slice(1);

                  return (
                    <>
                      <line x1="235" y1="130" x2="310" y2="130" stroke="#1F2937" strokeWidth="2.5" />

                      {mainResistor?.kind === 'lamp' ? (
                        <LampSVG
                          x={310}
                          y={108}
                          resistor={mainAnalysis}
                          isSelected={selectedResistorId === mainResistor?.id}
                          onClick={() => mainResistor && onSelectResistor(mainResistor.id)}
                        />
                      ) : (
                        <ResistorHorizontalSVG
                          x={310}
                          y={118}
                          width={75}
                          height={24}
                          resistor={mainAnalysis}
                          isSelected={selectedResistorId === mainResistor?.id}
                          onClick={() => mainResistor && onSelectResistor(mainResistor.id)}
                        />
                      )}

                      <line x1="385" y1="130" x2="480" y2="130" stroke="#1F2937" strokeWidth="2.5" />

                      {/* Parallel bank bus rails */}
                      {(() => {
                        const bCount = Math.max(1, branchResistors.length);
                        const bStartX = 480;
                        const bEndX = 720;
                        const bSpacing = bCount > 1 ? (bEndX - bStartX) / (bCount - 1) : 0;
                        const bLastX = bCount > 1 ? bEndX : bStartX;

                        return (
                          <>
                            <line x1="480" y1="130" x2={bLastX} y2="130" stroke="#1F2937" strokeWidth="2.5" />
                            <line x1={bLastX} y1="330" x2="120" y2="330" stroke="#1F2937" strokeWidth="2.5" />

                            {branchResistors.map((r, idx) => {
                              const branchX = bCount > 1 ? bStartX + idx * bSpacing : bStartX;
                              const rAnalysis = analysis.resistors.find((item) => item.id === r.id);

                              return (
                                <g key={r.id}>
                                  <circle cx={branchX} cy="130" r="4.5" fill="#047857" />
                                  <line x1={branchX} y1="130" x2={branchX} y2="185" stroke="#1F2937" strokeWidth="2.5" />
                                  <line x1={branchX} y1="265" x2={branchX} y2="330" stroke="#1F2937" strokeWidth="2.5" />
                                  <circle cx={branchX} cy="330" r="4.5" fill="#047857" />

                                  {r.kind === 'lamp' ? (
                                    <LampVerticalSVG
                                      x={branchX - 22}
                                      y={195}
                                      resistor={rAnalysis}
                                      isSelected={selectedResistorId === r.id}
                                      onClick={() => onSelectResistor(r.id)}
                                    />
                                  ) : (
                                    <ResistorVerticalSVG
                                      x={branchX - 12}
                                      y={185}
                                      width={24}
                                      height={80}
                                      resistor={rAnalysis}
                                      isSelected={selectedResistorId === r.id}
                                      onClick={() => onSelectResistor(r.id)}
                                    />
                                  )}
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </>
                  );
                })()}

                <text x="360" y="348" textAnchor="middle" className="text-[11px] fill-zinc-500 font-sans">
                  Retorno · 0 V
                </text>
              </g>
            )}

            {/* DC Power Supply (V1) Common Component */}
            <g transform="translate(120, 230)" className="cursor-pointer">
              <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.5" />
              <text x="0" y="-8" textAnchor="middle" className="text-[18px] font-bold fill-zinc-800 select-none">+</text>
              <text x="0" y="14" textAnchor="middle" className="text-[20px] font-bold fill-zinc-600 select-none">−</text>
              <text x="-40" y="-5" textAnchor="end" className="text-xs font-semibold fill-zinc-900 font-sans">V1</text>
              <text x="-40" y="12" textAnchor="end" className="text-sm font-bold font-mono fill-zinc-900">{voltage} V</text>
            </g>

            {/* Switch Interactive Label */}
            <g
              transform={`translate(${topology === 'mixed' ? 215 : 232}, 100)`}
              onClick={() => {
                playSwitchSound(!isClosed);
                onToggleSwitch();
              }}
              className="cursor-pointer"
            >
              <rect x="-18" y="-12" width="36" height="20" rx="4" fill="white" stroke="#D1D5DB" strokeWidth="1" />
              <text x="0" y="2" textAnchor="middle" className="text-[9px] font-semibold fill-zinc-700 font-sans">
                {isClosed ? 'ON' : 'OFF'}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Resistor Horizontal Component
 */
function ResistorHorizontalSVG({
  x,
  y,
  width,
  height,
  resistor,
  isSelected,
  onClick,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  resistor?: {
    name: string;
    resistance: number;
    voltageDrop: number;
    current_mA: number;
    power_W: number;
    isOverloaded: boolean;
    colorBands: { name: string; hex: string }[];
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!resistor) return null;

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group" onClick={onClick}>
      <text x={width / 2} y={-10} textAnchor="middle" className="text-xs font-bold fill-zinc-800 font-sans">
        {resistor.name}
      </text>

      {resistor.isOverloaded && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          rx={8}
          fill="none"
          stroke="#EF4444"
          strokeWidth="3"
          strokeDasharray="4 2"
        />
      )}

      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill={resistor.isOverloaded ? 'url(#resistorOverload)' : 'url(#resistorBody)'}
        stroke={isSelected ? '#0D9488' : resistor.isOverloaded ? '#DC2626' : '#047857'}
        strokeWidth={isSelected ? 3 : 2}
      />

      {resistor.colorBands.map((band, idx) => (
        <rect
          key={idx}
          x={14 + idx * 13}
          y={1}
          width={idx === 3 ? 4 : 5}
          height={height - 2}
          fill={band.hex}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
      ))}

      <text x={width / 2} y={height + 18} textAnchor="middle" className="text-xs font-bold fill-zinc-900 font-mono">
        {resistor.resistance} Ω
      </text>
      <text x={width / 2} y={height + 32} textAnchor="middle" className="text-[11px] font-medium fill-zinc-600 font-mono">
        {resistor.voltageDrop} V · {resistor.current_mA.toFixed(0)} mA
      </text>

      {resistor.isOverloaded && (
        <text x={width / 2} y={height + 46} textAnchor="middle" className="text-[10px] font-bold fill-red-600 font-sans">
          🔥 {resistor.power_W.toFixed(2)} W
        </text>
      )}
    </g>
  );
}

/**
 * Resistor Vertical Component
 */
function ResistorVerticalSVG({
  x,
  y,
  width,
  height,
  resistor,
  isSelected,
  onClick,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  resistor?: {
    name: string;
    resistance: number;
    voltageDrop: number;
    current_mA: number;
    power_W: number;
    isOverloaded: boolean;
    colorBands: { name: string; hex: string }[];
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!resistor) return null;

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group" onClick={onClick}>
      <text x={width + 16} y={14} className="text-xs font-bold fill-zinc-800 font-sans">
        {resistor.name}
      </text>

      {resistor.isOverloaded && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          rx={8}
          fill="none"
          stroke="#EF4444"
          strokeWidth="3"
          strokeDasharray="4 2"
        />
      )}

      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill={resistor.isOverloaded ? 'url(#resistorOverload)' : 'url(#resistorBody)'}
        stroke={isSelected ? '#0D9488' : resistor.isOverloaded ? '#DC2626' : '#047857'}
        strokeWidth={isSelected ? 3 : 2}
      />

      {resistor.colorBands.map((band, idx) => (
        <rect
          key={idx}
          x={1}
          y={14 + idx * 13}
          width={width - 2}
          height={idx === 3 ? 4 : 5}
          fill={band.hex}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
      ))}

      <text x={width + 16} y={32} className="text-xs font-bold fill-zinc-900 font-mono">
        {resistor.resistance} Ω
      </text>
      <text x={width + 16} y={48} className="text-[11px] font-medium fill-zinc-600 font-mono">
        {resistor.voltageDrop} V · {resistor.current_mA.toFixed(0)} mA
      </text>

      {resistor.isOverloaded && (
        <text x={width + 16} y={64} className="text-[10px] font-bold fill-red-600 font-sans">
          🔥 {resistor.power_W.toFixed(2)} W
        </text>
      )}
    </g>
  );
}

/**
 * Incandescent Lamp Component (Horiz)
 */
function LampSVG({
  x,
  y,
  resistor,
  isSelected,
  onClick,
}: {
  x: number;
  y: number;
  resistor?: {
    name: string;
    resistance: number;
    voltageDrop: number;
    current_mA: number;
    power_W: number;
    isOverloaded: boolean;
    brightness?: number;
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!resistor) return null;
  const glow = resistor.brightness || 0;
  const isLit = resistor.current_mA > 0.5 && !resistor.isOverloaded;

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group" onClick={onClick}>
      <text x={22} y={-4} textAnchor="middle" className="text-xs font-bold fill-zinc-800 font-sans">
        {resistor.name} (Lámpara)
      </text>

      {/* Glow aura */}
      {isLit && (
        <circle
          cx={22}
          cy={22}
          r={26}
          fill="#FDE047"
          opacity={Math.min(0.8, 0.2 + glow * 0.6)}
          filter="blur(4px)"
        />
      )}

      {/* Glass bulb circle */}
      <circle
        cx={22}
        cy={22}
        r={20}
        fill={isLit ? '#FEF08A' : '#F1F5F9'}
        stroke={isSelected ? '#0D9488' : resistor.isOverloaded ? '#DC2626' : '#64748B'}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      {/* Filament cross inside bulb */}
      <line x1={14} y1={14} x2={30} y2={30} stroke={isLit ? '#CA8A04' : '#94A3B8'} strokeWidth="1.5" />
      <line x1={30} y1={14} x2={14} y2={30} stroke={isLit ? '#CA8A04' : '#94A3B8'} strokeWidth="1.5" />

      <text x={22} y={54} textAnchor="middle" className="text-xs font-bold fill-zinc-900 font-mono">
        {resistor.resistance} Ω
      </text>
      <text x={22} y={68} textAnchor="middle" className="text-[11px] font-medium fill-zinc-600 font-mono">
        {resistor.voltageDrop} V · {resistor.current_mA.toFixed(0)} mA
      </text>

      {resistor.isOverloaded && (
        <text x={22} y={82} textAnchor="middle" className="text-[10px] font-bold fill-red-600 font-sans">
          💥 Fundida ({resistor.power_W.toFixed(2)} W)
        </text>
      )}
    </g>
  );
}

/**
 * Incandescent Lamp Component (Vertical)
 */
function LampVerticalSVG({
  x,
  y,
  resistor,
  isSelected,
  onClick,
}: {
  x: number;
  y: number;
  resistor?: {
    name: string;
    resistance: number;
    voltageDrop: number;
    current_mA: number;
    power_W: number;
    isOverloaded: boolean;
    brightness?: number;
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!resistor) return null;
  const glow = resistor.brightness || 0;
  const isLit = resistor.current_mA > 0.5 && !resistor.isOverloaded;

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group" onClick={onClick}>
      <text x={44} y={16} className="text-xs font-bold fill-zinc-800 font-sans">
        {resistor.name} (Lámpara)
      </text>

      {isLit && (
        <circle
          cx={22}
          cy={22}
          r={26}
          fill="#FDE047"
          opacity={Math.min(0.8, 0.2 + glow * 0.6)}
          filter="blur(4px)"
        />
      )}

      <circle
        cx={22}
        cy={22}
        r={20}
        fill={isLit ? '#FEF08A' : '#F1F5F9'}
        stroke={isSelected ? '#0D9488' : resistor.isOverloaded ? '#DC2626' : '#64748B'}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      <line x1={14} y1={14} x2={30} y2={30} stroke={isLit ? '#CA8A04' : '#94A3B8'} strokeWidth="1.5" />
      <line x1={30} y1={14} x2={14} y2={30} stroke={isLit ? '#CA8A04' : '#94A3B8'} strokeWidth="1.5" />

      <text x={44} y={32} className="text-xs font-bold fill-zinc-900 font-mono">
        {resistor.resistance} Ω
      </text>
      <text x={44} y={48} className="text-[11px] font-medium fill-zinc-600 font-mono">
        {resistor.voltageDrop} V · {resistor.current_mA.toFixed(0)} mA
      </text>

      {resistor.isOverloaded && (
        <text x={44} y={64} className="text-[10px] font-bold fill-red-600 font-sans">
          💥 Fundida ({resistor.power_W.toFixed(2)} W)
        </text>
      )}
    </g>
  );
}
