import React, { useState, useMemo } from 'react';
import { Play, Pause, Check, Plus, Trash2, AlertTriangle, Flame, Rabbit } from 'lucide-react';
import { hoyISO, uid, saludoSegunHora, ultimosNDias, puntosDia, scoreResetly } from '../lib/datos';
import { Tarjeta, MiniSerie, AreaDoble, BarrasDoble, Donut } from '../components/ui';
import Calendario from '../components/Calendar';

export default function Inicio({ datos, setDatos, log, timer, go, avisosSubs, diasDesdeRespaldo }) {
  const [habitoNuevo, setHabitoNuevo] = useState('');
  const [ranaTexto, setRanaTexto] = useState('');
  const [rango, setRango] = useState(7);

  const habitosHechos = datos.habitos.filter((h) => h.completado).length;
  const racha = datos.perfil.racha || 1;
  const ranaHoy = datos.rana?.fecha === hoyISO() ? datos.rana : null;
  const score = useMemo(() => scoreResetly(datos), [datos]);
  const ultimosRegistros = useMemo(() => [...datos.registrosDiarios]
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).slice(-14), [datos.registrosDiarios]);

  const dias = useMemo(() => ultimosNDias(rango), [rango]);
  const focoSerie = dias.map((f) => datos.focoPorDia?.[f] || 0);
  const puntosSerie = dias.map((f) => puntosDia(datos, f));
  const regsPorFecha = useMemo(() => {
    const m = {};
    datos.registrosDiarios.forEach((r) => { m[r.fecha] = r; });
    return m;
  }, [datos.registrosDiarios]);
  const diasConReg = dias.filter((f) => regsPorFecha[f]);
  const suenoSerie = diasConReg.map((f) => Number(regsPorFecha[f].suenoHrs) || 0);
  const energiaSerie = diasConReg.map((f) => Number(regsPorFecha[f].energia) || 0);

  const crearHabito = (e) => {
    e.preventDefault();
    if (!habitoNuevo.trim()) return;
    setDatos((p) => ({ ...p, habitos: [...p.habitos, { id: uid('h'), titulo: habitoNuevo.trim(), categoria: 'mente', completado: false }] }));
    setHabitoNuevo('');
    log(`Hábito creado: ${habitoNuevo.trim()}`);
  };

  const fijarRana = (e) => {
    e.preventDefault();
    if (!ranaTexto.trim()) return;
    setDatos((p) => ({ ...p, rana: { texto: ranaTexto.trim(), hecha: false, fecha: hoyISO() } }));
    setRanaTexto('');
    log('Rana del día definida.');
  };

  const sinRegistroHoy = !datos.registrosDiarios.some((r) => r.fecha === hoyISO());

  return (
    <div className="space-y-4">
      {/* Header: saludo + rana + pomodoro rápido */}
      <div className="bg-[#111111] text-white rounded-[20px] p-6 grid lg:grid-cols-3 gap-5 items-center overflow-hidden">
        <div className="lg:col-span-1">
          <p className="text-xs text-neutral-400">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="font-bold text-2xl mt-1">{saludoSegunHora()}, {datos.perfil.alias}</h1>
          <p className="text-sm text-neutral-400 mt-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />{racha} {racha === 1 ? 'día consecutivo' : 'días consecutivos'} · {timer.pomodorosHoy} pomodoros hoy
          </p>
          <button onClick={timer.iniciar25}
            className="mt-4 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 hover:opacity-90 transition-all duration-200">
            {timer.corriendo && timer.modo === 'Enfoque' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {timer.corriendo ? `Pausar (${timer.fmt(timer.seg)})` : 'Pomodoro rápido · 25 min'}
          </button>
        </div>
        <div className="lg:col-span-2 bg-white text-black rounded-2xl p-4">
          <p className="text-xs font-bold flex items-center gap-1.5 text-neutral-500"><Rabbit className="w-4 h-4" />LA RANA DEL DÍA</p>
          {ranaHoy ? (
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { setDatos((p) => ({ ...p, rana: { ...p.rana, hecha: !p.rana.hecha } })); if (!ranaHoy.hecha) log('Rana del día completada.'); }}
                aria-label={ranaHoy.hecha ? 'Reabrir rana del día' : 'Completar rana del día'}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${ranaHoy.hecha ? 'bg-black border-black text-white' : 'border-neutral-300'}`}>
                {ranaHoy.hecha && <Check className="w-4 h-4" />}
              </button>
              <p className={`flex-1 font-bold ${ranaHoy.hecha ? 'line-through text-neutral-400' : ''}`}>{ranaHoy.texto}</p>
              <button onClick={() => go('metodos')} className="text-xs font-bold underline">Gestionar</button>
            </div>
          ) : (
            <form onSubmit={fijarRana} className="flex gap-2 mt-2">
              <input value={ranaTexto} onChange={(e) => setRanaTexto(e.target.value)} placeholder="Tu tarea más dura de hoy…" aria-label="Rana del día"
                className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
              <button className="bg-black text-white text-xs font-bold px-4 rounded-xl">Fijar</button>
            </form>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Score + tendencia */}
          <Tarjeta>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Score Resetly · vitalidad</h3>
              <span className="text-[11px] text-neutral-400">Sueño 30 · Entreno 25 · Enfoque 25 · Tareas 20</span>
            </div>
            <Donut total={score.total} factores={score.factores} />
          </Tarjeta>

          <Tarjeta>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Enfoque vs puntos</h3>
              <div className="flex gap-1">
                {[7, 30].map((n) => (
                  <button key={n} onClick={() => setRango(n)} aria-label={`Ver últimos ${n} días`}
                    className={`text-xs px-3 py-1 rounded-full font-bold transition-all duration-200 ${rango === n ? 'bg-black text-white' : 'bg-neutral-100'}`}>{n}D</button>
                ))}
              </div>
            </div>
            <AreaDoble dias={dias} foco={focoSerie} puntos={puntosSerie} />
          </Tarjeta>

          <Tarjeta>
            <h3 className="font-bold text-sm mb-3">Sueño vs energía</h3>
            <BarrasDoble dias={diasConReg} sueno={suenoSerie} energia={energiaSerie} />
          </Tarjeta>

          <div className="grid sm:grid-cols-2 gap-4">
            <MiniSerie titulo="Sueño (último)" valores={ultimosRegistros.map((r) => Number(r.suenoHrs) || 0)} formato={(v) => `${v} h`} />
            <MiniSerie titulo="Energía (última)" valores={ultimosRegistros.map((r) => Number(r.energia) || 0)} formato={(v) => `${v}%`} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Alertas */}
          <div className="bg-white rounded-[20px] border border-neutral-200 p-5 transition-all duration-200">
            <h3 className="font-bold text-sm mb-3">Alertas</h3>
            <div className="space-y-2 text-xs">
              {sinRegistroHoy && (
                <button onClick={() => go('dia')} className="w-full text-left bg-neutral-900 text-white rounded-xl px-3 py-2.5 font-medium hover:opacity-90 transition-all duration-200">
                  Aún no registras tu día. Toca para hacerlo en 1 minuto.
                </button>
              )}
              {avisosSubs.map((s) => (
                <p key={s.id} className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{s.nombre} · {s.diasRestantes} días para el cobro
                </p>
              ))}
              {diasDesdeRespaldo !== null && diasDesdeRespaldo > 7 && (
                <button onClick={() => go('ajustes')} className="w-full text-left bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2 font-medium">
                  Último respaldo hace {diasDesdeRespaldo} días. Exporta tu JSON.
                </button>
              )}
              {diasDesdeRespaldo === null && (
                <button onClick={() => go('ajustes')} className="w-full text-left bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-600">
                  Nunca has exportado respaldo. Haz el primero en Ajustes.
                </button>
              )}
              {!sinRegistroHoy && avisosSubs.length === 0 && diasDesdeRespaldo !== null && diasDesdeRespaldo <= 7 && (
                <p className="text-neutral-400">Todo en orden. Sin avisos.</p>
              )}
            </div>
          </div>

          {/* Tareas compactas */}
          <div className="bg-white rounded-[20px] border border-neutral-200 p-5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Tareas de hoy</h3>
              <span className="text-xs text-neutral-500">{habitosHechos}/{datos.habitos.length}</span>
            </div>
            <form onSubmit={crearHabito} className="flex gap-2 mb-3">
              <input value={habitoNuevo} onChange={(e) => setHabitoNuevo(e.target.value)} placeholder="Nueva tarea…" aria-label="Nueva tarea"
                className="flex-1 min-w-0 bg-neutral-100 rounded-xl px-3 py-2 text-sm outline-none" />
              <button aria-label="Añadir tarea" className="bg-black text-white rounded-xl px-3 text-sm font-bold"><Plus className="w-4 h-4" /></button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {datos.habitos.slice(0, 8).map((h) => (
                <div key={h.id} className="flex items-center gap-2 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2">
                  <button onClick={() => setDatos((p) => ({ ...p, habitos: p.habitos.map((x) => (x.id === h.id ? { ...x, completado: !x.completado } : x)) }))}
                    aria-label={h.completado ? `Reabrir ${h.titulo}` : `Completar ${h.titulo}`}
                    className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-all duration-200 ${h.completado ? 'bg-black border-black text-white' : 'border-neutral-300'}`}>
                    {h.completado && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <p className={`flex-1 text-xs ${h.completado ? 'line-through text-neutral-400' : 'font-medium'}`}>{h.titulo}</p>
                  <button aria-label="Eliminar" onClick={() => setDatos((p) => ({ ...p, habitos: p.habitos.filter((x) => x.id !== h.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {datos.habitos.length === 0 && <p className="text-xs text-neutral-400">Sin tareas.</p>}
            </div>
          </div>

          <Calendario datos={datos} setDatos={setDatos} log={log} />
        </div>
      </div>
    </div>
  );
}
