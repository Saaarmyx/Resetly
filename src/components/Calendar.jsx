import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { hoyISO, uid, fmtMoneda } from '../lib/datos';
import { renderMarkdown } from './ui';

const colorEnergia = (e) => {
  if (e == null) return '';
  if (e >= 75) return 'bg-emerald-100 font-bold';
  if (e >= 50) return 'bg-amber-100 font-bold';
  return 'bg-red-100 font-bold';
};

function DrawerDia({ fecha, datos, setDatos, log, onCerrar }) {
  const registro = datos.registrosDiarios.find((r) => r.fecha === fecha);
  const entrenos = datos.entrenos.filter((w) => w.fecha === fecha);
  const ings = datos.finanzas.ingresos.filter((i) => i.fecha === fecha);
  const gas = datos.finanzas.gastos.filter((g) => g.fecha === fecha);
  const [nota, setNota] = useState(datos.notasRapidas?.[fecha] || '');
  const [tarea, setTarea] = useState('');
  if (!fecha) return null;
  const esFutura = fecha > hoyISO();

  const guardarNota = () => {
    setDatos((p) => ({ ...p, notasRapidas: { ...(p.notasRapidas || {}), [fecha]: nota } }));
    log(`Nota rápida guardada (${fecha}).`);
  };

  const agregarTarea = (e) => {
    e.preventDefault();
    if (!tarea.trim()) return;
    setDatos((p) => ({ ...p, habitos: [...p.habitos, { id: uid('h'), titulo: tarea.trim(), categoria: 'mente', completado: false }] }));
    setTarea('');
    log('Tarea rápida agregada.');
  };

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={`Detalle del día ${fecha}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white text-neutral-900 border-l border-neutral-200 shadow-2xl overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg">{fecha}</h2>
            <p className="text-xs text-neutral-500">
              {esFutura ? 'Día futuro: planifica con notas y tareas.' : registro ? `Ánimo: ${registro.animo}` : 'Sin registro diario.'}
            </p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar detalle del día" className="p-2 rounded-full hover:bg-neutral-100"><X className="w-4 h-4" /></button>
        </div>

        {registro ? (
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-xs space-y-1 mb-3">
            <p><b>Sueño:</b> {registro.suenoHrs} h · <b>Energía:</b> {registro.energia}% · <b>Hábitos:</b> {registro.habitos}</p>
            {registro.entrenamiento && <p><b>Entreno:</b> {registro.entrenamiento}</p>}
            {registro.nota && <div className="pt-2 border-t border-neutral-200 mt-2">{renderMarkdown(registro.nota)}</div>}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 mb-3">No hay registro diario para esta fecha.</p>
        )}

        {(entrenos.length > 0 || ings.length > 0 || gas.length > 0) && (
          <div className="space-y-1.5 mb-3">
            {entrenos.map((w) => <p key={w.id} className="text-xs bg-neutral-50 border rounded-xl px-3 py-2">Entreno: <b>{w.tipo}</b> · {w.duracionMin} min</p>)}
            {ings.map((i) => <p key={i.id} className="text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">Ingreso: <b>{i.concepto}</b> · {fmtMoneda(i.monto)}</p>)}
            {gas.map((g) => <p key={g.id} className="text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2">Gasto: <b>{g.concepto}</b> · {fmtMoneda(g.monto)}</p>)}
          </div>
        )}

        <div className="border-t border-neutral-100 pt-3">
          <label className="text-xs font-bold" htmlFor={`nota-${fecha}`}>Nota rápida del día</label>
          <textarea id={`nota-${fecha}`} value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
            placeholder="Idea, pendiente o recordatorio…" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm mt-1" />
          <button onClick={guardarNota} className="mt-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl">Guardar nota</button>
        </div>

        <form onSubmit={agregarTarea} className="border-t border-neutral-100 pt-3 mt-3">
          <label className="text-xs font-bold" htmlFor={`tarea-${fecha}`}>Tarea rápida</label>
          <div className="flex gap-2 mt-1">
            <input id={`tarea-${fecha}`} value={tarea} onChange={(e) => setTarea(e.target.value)} placeholder="Añadir a la lista de tareas…" className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <button aria-label="Añadir tarea rápida" className="bg-black text-white px-3 rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default function Calendario({ datos, setDatos, log }) {
  const [cal, setCal] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [fechaSel, setFechaSel] = useState(null);

  const primero = new Date(cal.y, cal.m, 1);
  const inicioSemana = (primero.getDay() + 6) % 7;
  const totalDias = new Date(cal.y, cal.m + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < inicioSemana; i++) celdas.push(null);
  for (let d = 1; d <= totalDias; d++) celdas.push(d);
  const nombreMes = primero.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const porFecha = {};
  datos.registrosDiarios.forEach((r) => { porFecha[r.fecha] = r; });

  return (
    <div className="bg-white rounded-[20px] border border-neutral-200 p-5 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Calendario</h3>
        <div className="flex gap-1 items-center">
          <button aria-label="Mes anterior" onClick={() => setCal((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }))} className="p-1 rounded-full hover:bg-neutral-100"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => { const d = new Date(); setCal({ y: d.getFullYear(), m: d.getMonth() }); }} className="text-[11px] font-bold px-2 py-1 rounded-full bg-neutral-100">Hoy</button>
          <button aria-label="Mes siguiente" onClick={() => setCal((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }))} className="p-1 rounded-full hover:bg-neutral-100"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <p className="text-xs text-neutral-500 uppercase mb-2">{nombreMes} · clic para ver detalle</p>
      <div className="grid grid-cols-7 text-[10px] text-neutral-400 text-center mb-1">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {celdas.map((d, i) => {
          if (!d) return <span key={i} />;
          const iso = `${cal.y}-${String(cal.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const reg = porFecha[iso];
          const esHoy = iso === hoyISO();
          const tieneNota = datos.notasRapidas?.[iso];
          return (
            <button key={i} onClick={() => setFechaSel(iso)} aria-label={`Ver detalle del ${iso}`}
              className={`py-1.5 rounded-lg relative transition-all duration-150 hover:ring-2 hover:ring-black ${esHoy ? 'bg-black text-white font-bold' : `${colorEnergia(reg ? Number(reg.energia) : null)} text-neutral-700 hover:bg-neutral-100`}`}>
              {d}
              {(reg || tieneNota) && !esHoy && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-60" />}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-200 inline-block" />Energía alta</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-200 inline-block" />Media</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-200 inline-block" />Baja</span>
      </div>
      {fechaSel && <DrawerDia fecha={fechaSel} datos={datos} setDatos={setDatos} log={log} onCerrar={() => setFechaSel(null)} />}
    </div>
  );
}
