import React, { useState } from 'react';
import { Moon, Droplets, Zap, Trash2 } from 'lucide-react';
import { hoyISO, uid, DIAS_SEMANA } from '../lib/datos';
import { Tarjeta } from '../components/ui';

export default function Fisico({ datos, setDatos, log }) {
  const [form, setForm] = useState({ tipo: 'Fuerza', duracionMin: 45, notas: '' });
  const diaSemanaHoy = DIAS_SEMANA[(new Date().getDay() + 6) % 7];

  const guardarEntreno = (e) => {
    e.preventDefault();
    const item = { id: uid('w'), fecha: hoyISO(), tipo: form.tipo, duracionMin: Number(form.duracionMin), notas: form.notas };
    setDatos((p) => ({ ...p, entrenos: [item, ...p.entrenos].slice(0, 60) }));
    log(`Entreno registrado: ${item.tipo} ${item.duracionMin} min.`);
    setForm({ tipo: 'Fuerza', duracionMin: 45, notas: '' });
  };

  const actualizarRutina = (dia, campo, valor) => setDatos((p) => ({ ...p, rutinasSemanales: { ...p.rutinasSemanales, [dia]: { ...p.rutinasSemanales[dia], [campo]: valor } } }));

  return (
    <div className="space-y-4">
      <div className="bg-[#111111] text-white rounded-[20px] p-5 flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg">Físico · plantilla diaria</h2>
          <p className="text-sm text-neutral-400">Hoy ({diaSemanaHoy}): {datos.rutinasSemanales[diaSemanaHoy]?.tipo}</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1"><Moon className="w-4 h-4" />{datos.readiness.suenoHrs} h</span>
          <span className="flex items-center gap-1"><Droplets className="w-4 h-4" />{datos.readiness.hidratacionL} L</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4" />{datos.readiness.energia}%</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Tarjeta>
          <h3 className="font-bold text-sm mb-3">Rutina de cada día (editable)</h3>
          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className={`border rounded-xl p-3 ${d === diaSemanaHoy ? 'border-black bg-neutral-50' : 'border-neutral-100'}`}>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs font-bold w-24 shrink-0 pt-2">{d}{d === diaSemanaHoy && ' · hoy'}</span>
                  <input value={datos.rutinasSemanales[d]?.tipo || ''} onChange={(e) => actualizarRutina(d, 'tipo', e.target.value)} aria-label={`Rutina del ${d}`} className="flex-1 min-w-0 bg-neutral-100 rounded-lg px-2 py-1.5 text-xs font-semibold" />
                </div>
                <textarea value={datos.rutinasSemanales[d]?.detalle || ''} onChange={(e) => actualizarRutina(d, 'detalle', e.target.value)} rows={3} aria-label={`Detalle del ${d}`} className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-2 py-1.5 text-xs font-mono" />
              </div>
            ))}
          </div>
        </Tarjeta>

        <div className="space-y-4">
          <Tarjeta>
            <h3 className="font-bold text-sm mb-3">Registrar entreno</h3>
            <form onSubmit={guardarEntreno} className="grid grid-cols-2 gap-2">
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} aria-label="Tipo de entreno" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm">
                <option>Fuerza</option><option>Condicionamiento</option><option>Hipertrofia</option><option>Cardio</option><option>Movilidad</option>
              </select>
              <input type="number" value={form.duracionMin} onChange={(e) => setForm({ ...form, duracionMin: e.target.value })} aria-label="Duración en minutos" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" placeholder="Min" />
              <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Notas: ejercicios, cargas…" aria-label="Notas del entreno" className="col-span-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
              <button className="col-span-2 bg-black text-white font-bold py-2 rounded-xl text-sm transition-all duration-200">Guardar entreno</button>
            </form>
            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto">
              {datos.entrenos.map((w) => (
                <div key={w.id} className="flex justify-between items-center gap-2 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2 text-xs">
                  <div className="flex-1"><p className="font-bold">{w.tipo} · {w.duracionMin} min</p><p className="text-neutral-500">{w.notas}</p></div>
                  <span className="text-neutral-400">{w.fecha}</span>
                  <button aria-label="Eliminar entreno" onClick={() => setDatos((p) => ({ ...p, entrenos: p.entrenos.filter((x) => x.id !== w.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {datos.entrenos.length === 0 && <p className="text-xs text-neutral-400">Sin entrenos registrados.</p>}
            </div>
          </Tarjeta>

          <Tarjeta>
            <h3 className="font-bold text-sm mb-3">Marcas y recuperación</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['press', 'Press (kg)'], ['sentadilla', 'Sentadilla (kg)'], ['pesoMuerto', 'Peso muerto (kg)'], ['vo2', 'VO2 est.'], ['grasa', 'Grasa %']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-neutral-500" htmlFor={`stat-${k}`}>{label}</label>
                  <input id={`stat-${k}`} type="number" value={datos.statsFisicos[k]} onChange={(e) => setDatos((p) => ({ ...p, statsFisicos: { ...p.statsFisicos, [k]: Number(e.target.value) } }))} className="w-full bg-neutral-100 rounded-lg px-2 py-1.5 font-bold" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-neutral-500" htmlFor="sueno-hoy">Sueño hoy: {datos.readiness.suenoHrs} h</label>
                <input id="sueno-hoy" type="range" min="3" max="12" step="0.5" value={datos.readiness.suenoHrs} onChange={(e) => setDatos((p) => ({ ...p, readiness: { ...p.readiness, suenoHrs: Number(e.target.value) } }))} className="w-full" />
              </div>
            </div>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
