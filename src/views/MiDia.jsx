import React, { useState } from 'react';
import { Moon, Zap, Trash2 } from 'lucide-react';
import { hoyISO, uid, DIAS_SEMANA } from '../lib/datos';
import { Tarjeta, renderMarkdown } from '../components/ui';

export default function MiDia({ datos, setDatos, log }) {
  const [form, setForm] = useState({ fecha: hoyISO(), suenoHrs: 7.5, energia: 75, animo: 'Bien', entrenamiento: '', nota: '' });
  const habitosHechos = datos.habitos.filter((h) => h.completado).length;
  const diaSemanaHoy = DIAS_SEMANA[(new Date().getDay() + 6) % 7];
  const rutinaHoy = datos.rutinasSemanales[diaSemanaHoy];

  const guardar = (e) => {
    e.preventDefault();
    const item = { id: uid('r'), ...form, suenoHrs: Number(form.suenoHrs), energia: Number(form.energia), habitos: `${habitosHechos}/${datos.habitos.length}` };
    setDatos((p) => {
      const yaExistia = p.registrosDiarios.some((r) => r.fecha === item.fecha);
      const sinEseDia = p.registrosDiarios.filter((r) => r.fecha !== item.fecha);
      const d = new Date(`${item.fecha}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      const tieneAyer = sinEseDia.some((r) => r.fecha === d.toISOString().split('T')[0]);
      const racha = yaExistia ? (p.perfil.racha || 1) : (tieneAyer ? (p.perfil.racha || 0) + 1 : 1);
      return { ...p, registrosDiarios: [item, ...sinEseDia].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)), perfil: { ...p.perfil, racha } };
    });
    log(`Registro diario guardado (${item.fecha}): ${item.suenoHrs} h de sueño.`);
    setForm({ fecha: hoyISO(), suenoHrs: 7.5, energia: 75, animo: 'Bien', entrenamiento: '', nota: '' });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Tarjeta>
        <h2 className="font-bold mb-1">Registro diario</h2>
        <p className="text-xs text-neutral-500 mb-4">Un registro por día. Si repites fecha, se actualiza. Rutina de hoy: <b>{rutinaHoy?.tipo}</b>.</p>
        <form onSubmit={guardar} className="space-y-3">
          <div>
            <label className="text-xs text-neutral-500" htmlFor="reg-fecha">Fecha</label>
            <input id="reg-fecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500 flex items-center gap-1" htmlFor="reg-sueno"><Moon className="w-3 h-3" />Sueño: {form.suenoHrs} h</label>
              <input id="reg-sueno" type="range" min="3" max="12" step="0.5" value={form.suenoHrs} onChange={(e) => setForm({ ...form, suenoHrs: e.target.value })} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 flex items-center gap-1" htmlFor="reg-energia"><Zap className="w-3 h-3" />Energía: {form.energia}%</label>
              <input id="reg-energia" type="range" min="0" max="100" step="5" value={form.energia} onChange={(e) => setForm({ ...form, energia: e.target.value })} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500" htmlFor="reg-animo">Ánimo</label>
              <select id="reg-animo" value={form.animo} onChange={(e) => setForm({ ...form, animo: e.target.value })} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm">
                <option>Muy bien</option><option>Bien</option><option>Normal</option><option>Bajo</option><option>Muy bajo</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500" htmlFor="reg-entreno">Entreno de hoy</label>
              <input id="reg-entreno" value={form.entrenamiento} onChange={(e) => setForm({ ...form, entrenamiento: e.target.value })} placeholder="Ej. Fuerza 45 min" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-neutral-500" htmlFor="reg-nota">Nota del día (acepta Markdown)</label>
            <textarea id="reg-nota" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} rows={4} placeholder="¿Qué salió bien? ¿Qué hay que ajustar mañana?" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <button className="w-full bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-200">Guardar registro</button>
        </form>
      </Tarjeta>
      <Tarjeta>
        <h2 className="font-bold mb-3">Historial ({datos.registrosDiarios.length})</h2>
        <div className="space-y-2 max-h-[560px] overflow-y-auto">
          {datos.registrosDiarios.map((r) => (
            <div key={r.id} className="border border-neutral-100 bg-neutral-50 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold">{r.fecha} · {r.animo}</p>
                <button aria-label="Eliminar registro" onClick={() => setDatos((p) => ({ ...p, registrosDiarios: p.registrosDiarios.filter((x) => x.id !== r.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-neutral-500 mt-1">Sueño {r.suenoHrs} h · Energía {r.energia}% · Hábitos {r.habitos} · {r.entrenamiento}</p>
              {r.nota && <div className="mt-2">{renderMarkdown(r.nota)}</div>}
            </div>
          ))}
          {datos.registrosDiarios.length === 0 && <p className="text-sm text-neutral-400">Aún no hay registros. Guarda el primero.</p>}
        </div>
      </Tarjeta>
    </div>
  );
}
