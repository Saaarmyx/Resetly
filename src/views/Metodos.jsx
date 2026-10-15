import React, { useState } from 'react';
import { Timer, Play, Pause, CalendarClock, Rabbit, ListChecks, Star, LayoutGrid, Columns3, BellOff, Armchair, BatteryCharging, Check, Trash2, Target } from 'lucide-react';
import { hoyISO, uid } from '../lib/datos';
import { Tarjeta } from '../components/ui';

export default function Metodos({ datos, setDatos, log, timer, buscar }) {
  const [bloqueForm, setBloqueForm] = useState({ titulo: '', inicio: '09:00', fin: '10:30', categoria: 'mente' });
  const [mitForm, setMitForm] = useState('');
  const [ranaTexto, setRanaTexto] = useState('');
  const [eisenForm, setEisenForm] = useState({ titulo: '', urgente: false, importante: true });
  const [kanbanForm, setKanbanForm] = useState({ titulo: '', categoria: 'mente' });
  const pomodorosHoy = timer.pomodorosHoy;
  const mitsHoy = (datos.mits || []).filter((m) => m.fecha === hoyISO());

  return (
    <div className="space-y-4">
      <div className="bg-[#111111] text-white rounded-[20px] p-5 flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg">Métodos de productividad</h2>
          <p className="text-sm text-neutral-400">10 técnicas aplicadas a tu día: tiempo, prioridad, entorno y energía.</p>
        </div>
        <div className="flex gap-4 text-xs items-center">
          <span className="flex items-center gap-1"><Timer className="w-4 h-4" />{pomodorosHoy} pomodoros hoy</span>
          <span className="flex items-center gap-1"><Target className="w-4 h-4" />{mitsHoy.filter((m) => m.hecha).length}/3 objetivos</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2"><Timer className="w-4 h-4" />1 · Técnica Pomodoro</h3>
          <p className="text-xs text-neutral-500 mt-1">25 min enfoque → 5 descanso. Cada 4 pomodoros, descanso largo de 20 min.</p>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-4xl font-black tabular-nums">{timer.fmt(timer.seg)}</p>
            <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`w-8 h-2 rounded-full ${(pomodorosHoy % 4) >= i || (pomodorosHoy > 0 && pomodorosHoy % 4 === 0) ? 'bg-black' : 'bg-neutral-200'}`} />)}</div>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Estado: <b>{timer.modo}</b> · Hoy: <b>{pomodorosHoy}</b> pomodoros</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => timer.iniciar('Enfoque', 25)} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold transition-all duration-200">25 enfoque</button>
            <button onClick={() => timer.iniciar('Descanso', 5)} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold transition-all duration-200">5 descanso</button>
            <button onClick={() => timer.iniciar('Descanso largo', 20)} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold transition-all duration-200">20 largo</button>
            <button onClick={timer.toggle} className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all duration-200">{timer.corriendo ? <><Pause className="w-3 h-3" />Pausar</> : <><Play className="w-3 h-3" />Empezar</>}</button>
          </div>
        </Tarjeta>

        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2"><CalendarClock className="w-4 h-4" />2 · Bloqueo de tiempo</h3>
          <p className="text-xs text-neutral-500 mt-1">Bloques de 1.5 a 3 h para una sola categoría. Sin mezclar.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (!bloqueForm.titulo.trim()) return; setDatos((p) => ({ ...p, bloques: [...(p.bloques || []), { id: uid('b'), ...bloqueForm, fecha: hoyISO(), hecho: false }] })); setBloqueForm({ titulo: '', inicio: '09:00', fin: '10:30', categoria: 'mente' }); log('Bloque de tiempo creado.'); }} className="grid grid-cols-2 gap-2 mt-3">
            <input value={bloqueForm.titulo} onChange={(e) => setBloqueForm({ ...bloqueForm, titulo: e.target.value })} placeholder="Ej. Estudiar capítulo 4" aria-label="Título del bloque" className="col-span-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <input type="time" value={bloqueForm.inicio} onChange={(e) => setBloqueForm({ ...bloqueForm, inicio: e.target.value })} aria-label="Hora de inicio" className="bg-neutral-100 rounded-xl px-2 py-2 text-sm" />
            <input type="time" value={bloqueForm.fin} onChange={(e) => setBloqueForm({ ...bloqueForm, fin: e.target.value })} aria-label="Hora de fin" className="bg-neutral-100 rounded-xl px-2 py-2 text-sm" />
            <select value={bloqueForm.categoria} onChange={(e) => setBloqueForm({ ...bloqueForm, categoria: e.target.value })} aria-label="Categoría del bloque" className="bg-neutral-100 rounded-xl px-2 text-sm"><option value="fisico">Físico</option><option value="mente">Mente</option><option value="empresa">Empresa</option></select>
            <button className="bg-black text-white text-sm font-bold py-2 rounded-xl transition-all duration-200">Añadir bloque</button>
          </form>
          <div className="space-y-1.5 mt-3 max-h-[190px] overflow-y-auto">
            {(datos.bloques || []).filter((b) => b.fecha === hoyISO()).map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-xs border border-neutral-100 rounded-xl px-3 py-2">
                <button onClick={() => setDatos((p) => ({ ...p, bloques: p.bloques.map((x) => (x.id === b.id ? { ...x, hecho: !x.hecho } : x)) }))} aria-label={b.hecho ? 'Reabrir bloque' : 'Completar bloque'} className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${b.hecho ? 'bg-black text-white border-black' : ''}`}>{b.hecho && <Check className="w-3 h-3" />}</button>
                <span className={`flex-1 ${b.hecho ? 'line-through text-neutral-400' : 'font-medium'}`}>{b.inicio}–{b.fin} · {b.titulo} <span className="text-neutral-400">({b.categoria})</span></span>
                <button aria-label="Eliminar bloque" onClick={() => setDatos((p) => ({ ...p, bloques: p.bloques.filter((x) => x.id !== b.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {(datos.bloques || []).filter((b) => b.fecha === hoyISO()).length === 0 && <p className="text-xs text-neutral-400">Sin bloques hoy. Crea el primero (ideal: 2 bloques de 2 h).</p>}
          </div>
        </Tarjeta>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-[#111111] text-white rounded-[20px] p-5">
          <h3 className="font-bold text-sm flex items-center gap-2"><Rabbit className="w-4 h-4" />3 · Cómete la rana</h3>
          <p className="text-xs text-neutral-400 mt-1">Haz primero lo más difícil o aburrido. El resto del día se vuelve fácil.</p>
          {datos.rana?.fecha === hoyISO() && datos.rana?.texto ? (
            <div className="mt-3 bg-white text-black rounded-xl p-3">
              <p className={`text-sm font-bold ${datos.rana.hecha ? 'line-through text-neutral-400' : ''}`}>{datos.rana.texto}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setDatos((p) => ({ ...p, rana: { ...p.rana, hecha: !p.rana.hecha } })); if (!datos.rana.hecha) log('Rana del día completada. Día ganado.'); }} className="flex-1 bg-black text-white text-xs font-bold py-2 rounded-lg transition-all duration-200">{datos.rana.hecha ? 'Reabrir' : '¡Rana completada!'}</button>
                <button onClick={() => setDatos((p) => ({ ...p, rana: { texto: '', hecha: false, fecha: '' } }))} className="text-xs px-3 bg-neutral-100 text-neutral-900 rounded-lg">Cambiar</button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!ranaTexto.trim()) return; setDatos((p) => ({ ...p, rana: { texto: ranaTexto.trim(), hecha: false, fecha: hoyISO() } })); setRanaTexto(''); log('Rana del día definida.'); }} className="mt-3 flex gap-2">
              <input value={ranaTexto} onChange={(e) => setRanaTexto(e.target.value)} placeholder="Mi tarea más dura de hoy…" aria-label="Rana del día" className="flex-1 min-w-0 text-black rounded-xl px-3 py-2 text-sm" />
              <button className="bg-white text-black text-xs font-bold px-3 rounded-xl">Fijar</button>
            </form>
          )}
        </div>

        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2"><ListChecks className="w-4 h-4" />4 · 3 objetivos del día</h3>
          <p className="text-xs text-neutral-500 mt-1">Escríbelos en la mañana o la noche anterior. Solo 3, sí o sí.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (!mitForm.trim() || mitsHoy.length >= 3) return; setDatos((p) => ({ ...p, mits: [...(p.mits || []), { id: uid('m'), titulo: mitForm.trim(), hecha: false, fecha: hoyISO() }] })); setMitForm(''); }} className="flex gap-2 mt-3">
            <input value={mitForm} onChange={(e) => setMitForm(e.target.value)} placeholder="Objetivo 1, 2 o 3…" aria-label="Nuevo objetivo del día" className="flex-1 min-w-0 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <button aria-label="Añadir objetivo" className="bg-black text-white px-3 rounded-xl text-sm font-bold">+</button>
          </form>
          <div className="space-y-1.5 mt-3">
            {mitsHoy.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2 text-xs border border-neutral-100 rounded-xl px-3 py-2">
                <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                <button onClick={() => setDatos((p) => ({ ...p, mits: p.mits.map((x) => (x.id === m.id ? { ...x, hecha: !x.hecha } : x)) }))} aria-label={m.hecha ? 'Reabrir objetivo' : 'Completar objetivo'} className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${m.hecha ? 'bg-black text-white border-black' : ''}`}>{m.hecha && <Check className="w-3 h-3" />}</button>
                <span className={`flex-1 ${m.hecha ? 'line-through text-neutral-400' : 'font-medium'}`}>{m.titulo}</span>
                <button aria-label="Eliminar objetivo" onClick={() => setDatos((p) => ({ ...p, mits: p.mits.filter((x) => x.id !== m.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2"><Star className="w-4 h-4" />5 · Regla 80/20</h3>
          <p className="text-xs text-neutral-500 mt-1">Marca con ★ el 20% que más resultados da. Hazlo primero.</p>
          <div className="space-y-1.5 mt-3 max-h-[220px] overflow-y-auto">
            {datos.habitos.map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-xs border border-neutral-100 rounded-xl px-3 py-2">
                <button onClick={() => setDatos((p) => ({ ...p, habitos: p.habitos.map((x) => (x.id === h.id ? { ...x, impacto: !x.impacto } : x)) }))} title="Alto impacto" aria-label={`Marcar alto impacto: ${h.titulo}`} aria-pressed={!!h.impacto}>
                  <Star className={`w-4 h-4 ${h.impacto ? 'fill-black text-black' : 'text-neutral-300'}`} />
                </button>
                <span className="flex-1 font-medium">{h.titulo}</span>
                {h.impacto && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">80/20</span>}
              </div>
            ))}
            {datos.habitos.length === 0 && <p className="text-xs text-neutral-400">Crea hábitos en Inicio para priorizarlos aquí.</p>}
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2"><LayoutGrid className="w-4 h-4" />6 · Matriz de Eisenhower</h3>
            <p className="text-xs text-neutral-500">Hacer → urgente+importante · Programar → importante · Delegar → urgente · Eliminar → resto.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!eisenForm.titulo.trim()) return; setDatos((p) => ({ ...p, eisenhower: [...(p.eisenhower || []), { id: uid('e'), titulo: eisenForm.titulo.trim(), urgente: eisenForm.urgente, importante: eisenForm.importante, hecha: false }] })); setEisenForm({ titulo: '', urgente: false, importante: true }); }} className="flex flex-wrap gap-2">
            <input value={eisenForm.titulo} onChange={(e) => setEisenForm({ ...eisenForm, titulo: e.target.value })} placeholder="Nuevo pendiente…" aria-label="Nuevo pendiente" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm w-48" />
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={eisenForm.urgente} onChange={(e) => setEisenForm({ ...eisenForm, urgente: e.target.checked })} />Urgente</label>
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={eisenForm.importante} onChange={(e) => setEisenForm({ ...eisenForm, importante: e.target.checked })} />Importante</label>
            <button aria-label="Añadir pendiente" className="bg-black text-white px-3 rounded-xl text-xs font-bold">+</button>
          </form>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { u: true, i: true, t: 'Hacer ahora', c: 'bg-red-50 border-red-200' },
            { u: false, i: true, t: 'Programar', c: 'bg-blue-50 border-blue-200' },
            { u: true, i: false, t: 'Delegar', c: 'bg-amber-50 border-amber-200' },
            { u: false, i: false, t: 'Eliminar', c: 'bg-neutral-50 border-neutral-200' },
          ].map((q) => (
            <div key={q.t} className={`border rounded-xl p-3 ${q.c}`}>
              <p className="text-xs font-bold mb-2 text-neutral-900">{q.t}</p>
              <div className="space-y-1">
                {(datos.eisenhower || []).filter((t) => !!t.urgente === q.u && !!t.importante === q.i).map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1.5 text-xs text-neutral-900">
                    <button onClick={() => setDatos((p) => ({ ...p, eisenhower: p.eisenhower.map((x) => (x.id === t.id ? { ...x, hecha: !x.hecha } : x)) }))} aria-label={t.hecha ? 'Reabrir' : 'Completar'} className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${t.hecha ? 'bg-black text-white border-black' : ''}`}>{t.hecha && <Check className="w-2.5 h-2.5" />}</button>
                    <span className={`flex-1 ${t.hecha ? 'line-through text-neutral-400' : ''}`}>{t.titulo}</span>
                    <button aria-label="Eliminar" onClick={() => setDatos((p) => ({ ...p, eisenhower: p.eisenhower.filter((x) => x.id !== t.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2"><Columns3 className="w-4 h-4" />7 · Tablero Kanban</h3>
            <p className="text-xs text-neutral-500">Mueve cada tarjeta con las flechas: pendiente → en proceso → completada.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!kanbanForm.titulo.trim()) return; setDatos((p) => ({ ...p, kanban: [...(p.kanban || []), { id: uid('k'), titulo: kanbanForm.titulo.trim(), categoria: kanbanForm.categoria, estado: 'pendiente' }] })); setKanbanForm({ titulo: '', categoria: 'mente' }); }} className="flex gap-2">
            <input value={kanbanForm.titulo} onChange={(e) => setKanbanForm({ ...kanbanForm, titulo: e.target.value })} placeholder="Nueva tarjeta…" aria-label="Nueva tarjeta Kanban" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm w-48" />
            <select value={kanbanForm.categoria} onChange={(e) => setKanbanForm({ ...kanbanForm, categoria: e.target.value })} aria-label="Categoría de la tarjeta" className="bg-neutral-100 rounded-xl px-2 text-xs"><option value="fisico">Físico</option><option value="mente">Mente</option><option value="empresa">Empresa</option></select>
            <button aria-label="Añadir tarjeta" className="bg-black text-white px-3 rounded-xl text-xs font-bold">+</button>
          </form>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {[
            { id: 'pendiente', t: 'Pendientes' },
            { id: 'proceso', t: 'En proceso' },
            { id: 'hecha', t: 'Completadas' },
          ].map((col) => (
            <div key={col.id} className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
              <p className="text-xs font-bold mb-2">{col.t} ({(datos.kanban || []).filter((k) => k.estado === col.id).length})</p>
              <div className="space-y-1.5">
                {(datos.kanban || []).filter((k) => k.estado === col.id && buscar(k.titulo)).map((k) => (
                  <div key={k.id} className="bg-white border border-neutral-100 rounded-lg p-2 text-xs">
                    <p className="font-medium">{k.titulo}</p>
                    <p className="text-[10px] text-neutral-400 capitalize">{k.categoria}</p>
                    <div className="flex justify-between mt-1">
                      <button onClick={() => setDatos((p) => ({ ...p, kanban: p.kanban.map((x) => (x.id === k.id ? { ...x, estado: x.estado === 'proceso' ? 'pendiente' : 'proceso' } : x)) }))} disabled={k.estado === 'pendiente'} aria-label="Mover tarjeta atrás" className="text-[11px] px-2 py-0.5 bg-neutral-100 rounded-full disabled:opacity-30 transition-all duration-200">←</button>
                      <button aria-label="Eliminar tarjeta" onClick={() => setDatos((p) => ({ ...p, kanban: p.kanban.filter((x) => x.id !== k.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      <button onClick={() => setDatos((p) => ({ ...p, kanban: p.kanban.map((x) => (x.id === k.id ? { ...x, estado: x.estado === 'pendiente' ? 'proceso' : 'hecha' } : x)) }))} disabled={k.estado === 'hecha'} aria-label="Mover tarjeta adelante" className="text-[11px] px-2 py-0.5 bg-black text-white rounded-full disabled:opacity-30 transition-all duration-200">→</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <div className="grid lg:grid-cols-3 gap-4">
        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2"><BellOff className="w-4 h-4" />8 · Cero distracciones</h3>
          <p className="text-xs text-neutral-500 mt-1">Actívalas al empezar un bloque de enfoque.</p>
          {[['notif', 'Notificaciones silenciadas'], ['pestanas', 'Pestañas innecesarias cerradas'], ['archivos', 'Archivos centralizados (Drive / notas)']].map(([k, label]) => (
            <button key={k} onClick={() => setDatos((p) => ({ ...p, sinDistracciones: { ...p.sinDistracciones, [k]: !p.sinDistracciones[k], fecha: hoyISO() } }))} aria-pressed={!!datos.sinDistracciones?.[k]} className="w-full flex items-center gap-2 text-xs border border-neutral-100 rounded-xl px-3 py-2 mt-2 transition-all duration-200">
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${datos.sinDistracciones?.[k] ? 'bg-black text-white border-black' : ''}`}>{datos.sinDistracciones?.[k] && <Check className="w-3 h-3" />}</span>
              <span className={datos.sinDistracciones?.[k] ? 'line-through text-neutral-400' : 'font-medium'}>{label}</span>
            </button>
          ))}
        </Tarjeta>
        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2"><Armchair className="w-4 h-4" />9 · Espacio de trabajo</h3>
          <p className="text-xs text-neutral-500 mt-1">Limpio, con luz natural y silla cómoda evitan fatiga.</p>
          {[['limpio', 'Escritorio limpio y ordenado'], ['luz', 'Buena luz (natural si es posible)'], ['silla', 'Silla cómoda y postura recta'], ['agua', 'Agua a la mano']].map(([k, label]) => (
            <button key={k} onClick={() => setDatos((p) => ({ ...p, entorno: { ...p.entorno, [k]: !p.entorno[k], fecha: hoyISO() } }))} aria-pressed={!!datos.entorno?.[k]} className="w-full flex items-center gap-2 text-xs border border-neutral-100 rounded-xl px-3 py-2 mt-2 transition-all duration-200">
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${datos.entorno?.[k] ? 'bg-black text-white border-black' : ''}`}>{datos.entorno?.[k] && <Check className="w-3 h-3" />}</span>
              <span className={datos.entorno?.[k] ? 'line-through text-neutral-400' : 'font-medium'}>{label}</span>
            </button>
          ))}
        </Tarjeta>
        <div className="bg-[#111111] text-white rounded-[20px] p-5">
          <h3 className="font-bold text-sm flex items-center gap-2"><BatteryCharging className="w-4 h-4" />10 · Descansos y energía</h3>
          <p className="text-xs text-neutral-400 mt-1">El cerebro consolida memoria con pausas y sueño. No los sacrifiques.</p>
          <div className="bg-white text-black rounded-xl p-3 mt-3 text-xs">
            <p>Sueño anoche: <b>{datos.readiness.suenoHrs} h</b> {datos.readiness.suenoHrs < 7 ? '· bajo, prioriza dormir hoy' : '· bien'}</p>
            <p>Energía: <b>{datos.readiness.energia}%</b> · Pomodoros hoy: <b>{pomodorosHoy}</b></p>
          </div>
          <button onClick={() => { timer.empezar('Descanso', 5); log('Pausa activa de 5 min iniciada.'); }} className="w-full mt-3 bg-white text-black text-xs font-bold py-2 rounded-xl transition-all duration-200">Tomar pausa de 5 min ahora</button>
        </div>
      </div>
    </div>
  );
}
