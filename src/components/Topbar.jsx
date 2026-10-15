import React from 'react';
import { Search, Bell, Moon, Sun, Command } from 'lucide-react';
import { NAV } from './Sidebar';

export default function Topbar({ pestana, go, busqueda, setBusqueda, esOscuro, onTema, onPalette, nAvisos, perfil }) {
  const racha = perfil.racha ?? 1;
  return (
    <div className="space-y-3">
      {/* Nav móvil */}
      <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar" role="navigation" aria-label="Navegación móvil">
        {[...NAV, { id: 'ajustes', etiqueta: 'Ajustes' }].map((n) => (
          <button key={n.id} onClick={() => go(n.id)}
            className={`px-3 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-200 ${pestana === n.id ? 'bg-black text-white' : 'bg-white border border-neutral-200'}`}>
            {n.etiqueta}
          </button>
        ))}
      </div>
      {/* Encabezado */}
      <header className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 bg-white rounded-2xl flex items-center gap-2 px-4 py-2.5 border border-neutral-200">
          <Search className="w-4 h-4 text-neutral-400" />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar…"
            aria-label="Buscar en Resetly"
            className="w-full text-sm outline-none bg-transparent placeholder:text-neutral-400" />
        </div>
        <button onClick={onPalette} aria-label="Abrir paleta de comandos (Ctrl+K)"
          title="Paleta de comandos (Ctrl+K)"
          className="h-10 hidden sm:flex items-center gap-2 bg-white rounded-2xl border border-neutral-200 px-3 text-xs text-neutral-500 hover:text-black transition-all duration-200">
          <Command className="w-4 h-4" />
          <span className="font-mono bg-neutral-100 rounded px-1.5 py-0.5">Ctrl K</span>
        </button>
        <button onClick={onTema} aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="w-10 h-10 shrink-0 bg-white rounded-2xl border border-neutral-200 flex items-center justify-center transition-all duration-200">
          {esOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button aria-label="Avisos de pagos próximos" title="Ver avisos en Empresa" onClick={() => go('empresa')}
          className="w-10 h-10 shrink-0 bg-white rounded-2xl border border-neutral-200 flex items-center justify-center relative transition-all duration-200">
          <Bell className="w-4 h-4" />
          {nAvisos > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
        <div className="hidden lg:flex items-center gap-2 bg-white rounded-2xl border border-neutral-200 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
            {(perfil.alias || 'R').slice(0, 1).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold max-w-[140px] truncate">{perfil.alias}</p>
            <p className="text-[11px] text-neutral-500">{racha} {racha === 1 ? 'día' : 'días'} de racha</p>
          </div>
        </div>
      </header>
    </div>
  );
}
