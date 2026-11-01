/**
 * Navbar component for Ohm Lab (No Landing Page - Direct Lab Experience)
 */
import React from 'react';
import { Activity, BookOpen, HelpCircle, Sparkles, Wrench } from 'lucide-react';

export type ActiveTab = 'simulador' | 'analisis' | 'como-funciona';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenHelp }) => {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => onSelectTab('simulador')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Ohm Lab - Laboratorio y Banco de Pruebas de Circuitos"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-900 text-teal-100 flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-teal-800 transition">
            Ω
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-lg tracking-tight font-sans">
                Ohm Lab
              </span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-semibold">
                Simulador & Taller
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-zinc-600 font-semibold uppercase">
              Laboratorio de Circuitos de CC
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Direct to Simulator, Analysis, and Theory */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={() => onSelectTab('simulador')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === 'simulador'
                ? 'text-teal-900 bg-teal-50/70 border border-teal-200/60'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-teal-700" />
            <span>Simulador & Taller</span>
          </button>

          <button
            onClick={() => onSelectTab('analisis')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === 'analisis'
                ? 'text-teal-900 bg-teal-50/70 border border-teal-200/60'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Análisis Detallado</span>
          </button>

          <button
            onClick={() => onSelectTab('como-funciona')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === 'como-funciona'
                ? 'text-teal-900 bg-teal-50/70 border border-teal-200/60'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>Cómo funciona</span>
          </button>
        </nav>

        {/* Right contextual info & help */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-100/80 px-2.5 py-1 rounded-full border border-zinc-200">
            <span>Física · Ley de Ohm</span>
          </div>

          <button
            onClick={onOpenHelp}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
            title="Ayuda del simulador"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
