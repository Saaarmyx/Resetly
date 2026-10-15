import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { NAV } from './Sidebar';

export default function Palette({ abierta, onCerrar, go, onPomodoro, corriendo, onTema, esOscuro, onExportar, onAyuda, onRegistrar }) {
  const [filtro, setFiltro] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const comandos = [
    ...NAV.map((n) => ({ grupo: 'Ir a', etiqueta: `Ir a ${n.etiqueta}`, accion: () => go(n.id) })),
    { grupo: 'Ir a', etiqueta: 'Ir a Ajustes', accion: () => go('ajustes') },
    { grupo: 'Enfoque', etiqueta: corriendo ? 'Pausar temporizador' : 'Iniciar temporizador', accion: onPomodoro },
    { grupo: 'Enfoque', etiqueta: 'Registrar mi día', accion: onRegistrar },
    { grupo: 'Sistema', etiqueta: esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro', accion: onTema },
    { grupo: 'Sistema', etiqueta: 'Exportar respaldo JSON', accion: onExportar },
    { grupo: 'Sistema', etiqueta: 'Abrir ayuda y atajos', accion: onAyuda },
  ];
  const lista = comandos.filter((c) => c.etiqueta.toLowerCase().includes(filtro.toLowerCase()));

  useEffect(() => {
    if (abierta) {
      setFiltro('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [abierta]);

  useEffect(() => {
    if (!abierta) return;
    const teclas = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, lista.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && lista[sel]) { e.preventDefault(); lista[sel].accion(); onCerrar(); }
    };
    window.addEventListener('keydown', teclas);
    return () => window.removeEventListener('keydown', teclas);
  });

  if (!abierta) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
      <div className="absolute inset-0 bg-black/60" onClick={onCerrar} />
      <div className="relative w-full max-w-lg bg-white text-neutral-900 rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
          <Search className="w-4 h-4 text-neutral-400" />
          <input ref={inputRef} value={filtro} onChange={(e) => { setFiltro(e.target.value); setSel(0); }}
            placeholder="Escribe un comando…" aria-label="Buscar comando"
            className="w-full text-sm outline-none bg-transparent" />
          <kbd className="text-[10px] bg-neutral-100 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {lista.map((c, i) => (
            <button key={c.etiqueta} onClick={() => { c.accion(); onCerrar(); }}
              onMouseEnter={() => setSel(i)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${i === sel ? 'bg-black text-white' : ''}`}>
              <span><span className={`text-[10px] uppercase font-bold mr-2 ${i === sel ? 'text-neutral-300' : 'text-neutral-400'}`}>{c.grupo}</span>{c.etiqueta}</span>
              {i === sel && <CornerDownLeft className="w-3.5 h-3.5" />}
            </button>
          ))}
          {lista.length === 0 && <p className="text-sm text-neutral-400 text-center py-6">Sin resultados.</p>}
        </div>
      </div>
    </div>
  );
}
