import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function HelpModal({ abierta, onCerrar }) {
  if (!abierta) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Ayuda y soporte">
      <div className="absolute inset-0 bg-black/60" onClick={onCerrar} />
      <div className="relative w-full max-w-lg bg-white text-neutral-900 rounded-[20px] border border-neutral-200 shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><Keyboard className="w-5 h-5" />Ayuda y atajos</h2>
          <button onClick={onCerrar} aria-label="Cerrar ayuda" className="p-2 rounded-full hover:bg-neutral-100"><X className="w-4 h-4" /></button>
        </div>
        <h3 className="text-xs font-bold uppercase text-neutral-500 mb-2">Atajos de teclado</h3>
        <div className="space-y-1.5 text-sm mb-5">
          {[['Ctrl + K / Cmd + K', 'Abrir paleta de comandos'], ['↑ / ↓ + Enter', 'Navegar y ejecutar comando'], ['Esc', 'Cerrar diálogos']].map(([k, d]) => (
            <div key={k} className="flex justify-between bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2">
              <span className="font-mono text-xs font-bold">{k}</span><span className="text-neutral-600">{d}</span>
            </div>
          ))}
        </div>
        <h3 className="text-xs font-bold uppercase text-neutral-500 mb-2">Guía rápida</h3>
        <div className="space-y-2 text-sm text-neutral-700">
          <p><b>Inicio:</b> tu centro de comando. Saludo, rana del día, alertas, score, gráficos y calendario con detalle por día.</p>
          <p><b>Mi día:</b> un registro por fecha con sueño, energía, ánimo y nota. La racha sube si registras días consecutivos.</p>
          <p><b>Físico:</b> rutina semanal editable, entrenos y marcas.</p>
          <p><b>Mente:</b> Pomodoro por ciclos y cuadernos Markdown por proyecto y curso.</p>
          <p><b>Métodos:</b> las 10 técnicas: Pomodoro, bloques, rana, 3 objetivos, 80/20, Eisenhower, Kanban, entorno y energía.</p>
          <p><b>Empresa:</b> ingresos, gastos y suscripciones por mes con avisos de pago.</p>
          <p><b>Tus datos</b> viven solo en este navegador (<code className="bg-neutral-100 px-1 rounded text-xs">RESETLY_DATA</code>). Exporta tu JSON cada semana desde Ajustes.</p>
        </div>
      </div>
    </div>
  );
}
