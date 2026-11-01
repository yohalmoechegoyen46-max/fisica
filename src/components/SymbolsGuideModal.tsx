/**
 * SymbolsGuideModal - Electric schematic symbol guide
 */
import React from 'react';

interface SymbolsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SymbolsGuideModal: React.FC<SymbolsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const symbols = [
    {
      name: 'Fuente de Tensión CC',
      desc: 'Proporciona una diferencia de potencial constante (voltaje) para impulsar electrones.',
      svg: (
        <svg viewBox="0 0 60 40" className="w-16 h-10">
          <circle cx="30" cy="20" r="14" fill="#FFF" stroke="#1F2937" strokeWidth="2" />
          <text x="30" y="18" textAnchor="middle" className="text-xs font-bold fill-zinc-800">+</text>
          <text x="30" y="27" textAnchor="middle" className="text-xs font-bold fill-zinc-600">−</text>
          <line x1="5" y1="20" x2="16" y2="20" stroke="#1F2937" strokeWidth="2" />
          <line x1="44" y1="20" x2="55" y2="20" stroke="#1F2937" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: 'Resistencia (Norma IEC)',
      desc: 'Elemento pasivo que disipa energía en calor y limita el paso de la corriente según la Ley de Ohm.',
      svg: (
        <svg viewBox="0 0 60 40" className="w-16 h-10">
          <rect x="15" y="14" width="30" height="12" rx="2" fill="#EFE9DE" stroke="#047857" strokeWidth="2" />
          <line x1="5" y1="20" x2="15" y2="20" stroke="#1F2937" strokeWidth="2" />
          <line x1="45" y1="20" x2="55" y2="20" stroke="#1F2937" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: 'Interruptor (Switch)',
      desc: 'Permite abrir (desconectar) o cerrar (conectar) el circuito eléctrico.',
      svg: (
        <svg viewBox="0 0 60 40" className="w-16 h-10">
          <circle cx="15" cy="20" r="3" fill="#1F2937" />
          <circle cx="45" cy="20" r="3" fill="#1F2937" />
          <line x1="15" y1="20" x2="40" y2="10" stroke="#DC2626" strokeWidth="2" />
          <line x1="5" y1="20" x2="15" y2="20" stroke="#1F2937" strokeWidth="2" />
          <line x1="45" y1="20" x2="55" y2="20" stroke="#1F2937" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: 'Nodo o Unión Eléctrica',
      desc: 'Punto de conexión física donde la corriente se divide o confluye según la 1ª Ley de Kirchhoff.',
      svg: (
        <svg viewBox="0 0 60 40" className="w-16 h-10">
          <line x1="5" y1="20" x2="55" y2="20" stroke="#1F2937" strokeWidth="2" />
          <line x1="30" y1="5" x2="30" y2="35" stroke="#1F2937" strokeWidth="2" />
          <circle cx="30" cy="20" r="4.5" fill="#047857" />
        </svg>
      ),
    },
    {
      name: 'Voltímetro',
      desc: 'Mide la diferencia de potencial entre dos puntos. Se conecta siempre en PARALELO.',
      svg: (
        <svg viewBox="0 0 60 40" className="w-16 h-10">
          <circle cx="30" cy="20" r="14" fill="#FFF" stroke="#2563EB" strokeWidth="2" />
          <text x="30" y="24" textAnchor="middle" className="text-xs font-bold fill-blue-700">V</text>
          <line x1="5" y1="20" x2="16" y2="20" stroke="#1F2937" strokeWidth="2" />
          <line x1="44" y1="20" x2="55" y2="20" stroke="#1F2937" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: 'Amperímetro',
      desc: 'Mide el flujo de corriente en amperios. Se conecta siempre en SERIE.',
      svg: (
        <svg viewBox="0 0 60 40" className="w-16 h-10">
          <circle cx="30" cy="20" r="14" fill="#FFF" stroke="#059669" strokeWidth="2" />
          <text x="30" y="24" textAnchor="middle" className="text-xs font-bold fill-emerald-700">A</text>
          <line x1="5" y1="20" x2="16" y2="20" stroke="#1F2937" strokeWidth="2" />
          <line x1="44" y1="20" x2="55" y2="20" stroke="#1F2937" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <h3 className="text-base font-bold text-zinc-900">Guía de Símbolos Eléctricos</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          {symbols.map((sym, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80"
            >
              <div className="shrink-0 bg-white p-1 rounded-lg border border-zinc-200">
                {sym.svg}
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">{sym.name}</h4>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{sym.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
