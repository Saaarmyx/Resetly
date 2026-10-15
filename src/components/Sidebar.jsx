import React from 'react';
import { Home, Sun, Dumbbell, Brain, Zap, Briefcase, Settings, LifeBuoy, LogOut } from 'lucide-react';

const NAV = [
  { id: 'inicio', etiqueta: 'Inicio', icono: Home },
  { id: 'dia', etiqueta: 'Mi día', icono: Sun },
  { id: 'fisico', etiqueta: 'Físico', icono: Dumbbell },
  { id: 'mente', etiqueta: 'Mente', icono: Brain },
  { id: 'metodos', etiqueta: 'Métodos', icono: Zap },
  { id: 'empresa', etiqueta: 'Empresa', icono: Briefcase },
];

export default function Sidebar({ pestana, go, onAyuda, onSalir }) {
  return (
    <aside className="w-64 shrink-0 h-full hidden md:flex flex-col justify-between border-r border-slate-800 bg-slate-900/50 p-5">
      <div>
        <div className="flex items-center gap-2 mb-8 px-1">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black text-xl">R</div>
          <div className="leading-tight">
            <span className="font-bold text-lg tracking-tight block">Resetly</span>
            <span className="text-[11px] text-slate-400">Personal OS</span>
          </div>
        </div>
        <nav className="space-y-1" aria-label="Navegación principal">
          {NAV.map((n) => {
            const Icono = n.icono;
            const activo = pestana === n.id;
            return (
              <button key={n.id} onClick={() => go(n.id)}
                aria-current={activo ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activo ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                <Icono className="w-[18px] h-[18px]" />{n.etiqueta}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="space-y-1 pt-4 border-t border-slate-800">
        <button onClick={() => go('ajustes')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${pestana === 'ajustes' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
          <Settings className="w-[18px] h-[18px]" />Ajustes
        </button>
        <button onClick={onAyuda} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200">
          <LifeBuoy className="w-[18px] h-[18px]" />Ayuda y soporte
        </button>
        <button onClick={onSalir} title="Detiene el temporizador y vuelve al inicio. Tus datos se conservan."
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200">
          <LogOut className="w-[18px] h-[18px]" />Salir
        </button>
      </div>
    </aside>
  );
}

export { NAV };
