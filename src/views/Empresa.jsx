import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, CreditCard, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { hoyISO, uid, fmtMoneda } from '../lib/datos';
import { Tarjeta, BarrasMes } from '../components/ui';

export default function Empresa({ datos, setDatos, log, avisosSubs }) {
  const [ingForm, setIngForm] = useState({ fecha: hoyISO(), concepto: '', monto: '' });
  const [gasForm, setGasForm] = useState({ fecha: hoyISO(), concepto: '', monto: '', categoria: 'Comida' });
  const [subForm, setSubForm] = useState({ nombre: '', monto: '', diaPago: 1 });

  const mesClave = datos.finanzas.mesActual;
  const ingresosMes = useMemo(() => datos.finanzas.ingresos.filter((i) => (i.fecha || '').slice(0, 7) === mesClave), [datos, mesClave]);
  const gastosMes = useMemo(() => datos.finanzas.gastos.filter((g) => (g.fecha || '').slice(0, 7) === mesClave), [datos, mesClave]);
  const totalIng = ingresosMes.reduce((a, b) => a + Number(b.monto || 0), 0);
  const totalGas = gastosMes.reduce((a, b) => a + Number(b.monto || 0), 0);
  const subsActivas = datos.finanzas.suscripciones.filter((s) => s.activa);
  const totalSubs = subsActivas.reduce((a, b) => a + Number(b.monto || 0), 0);
  const balance = totalIng - totalGas - totalSubs;

  const balancePorMes = useMemo(() => {
    const claves = [];
    const base = new Date(`${mesClave}-01T00:00:00`);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      claves.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return claves.map((c) => {
      const ing = datos.finanzas.ingresos.filter((x) => (x.fecha || '').slice(0, 7) === c).reduce((a, b) => a + Number(b.monto || 0), 0);
      const gas = datos.finanzas.gastos.filter((x) => (x.fecha || '').slice(0, 7) === c).reduce((a, b) => a + Number(b.monto || 0), 0);
      return { clave: c, etiqueta: new Date(`${c}-01T00:00:00`).toLocaleDateString('es-MX', { month: 'short' }), valor: ing - gas };
    });
  }, [datos.finanzas, mesClave]);

  const crearIngreso = (e) => {
    e.preventDefault();
    if (!ingForm.concepto.trim() || !ingForm.monto) return;
    setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, ingresos: [{ id: uid('i'), ...ingForm, monto: Number(ingForm.monto) }, ...p.finanzas.ingresos] } }));
    setIngForm({ fecha: hoyISO(), concepto: '', monto: '' });
    log('Ingreso registrado.');
  };
  const crearGasto = (e) => {
    e.preventDefault();
    if (!gasForm.concepto.trim() || !gasForm.monto) return;
    setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, gastos: [{ id: uid('g'), ...gasForm, monto: Number(gasForm.monto) }, ...p.finanzas.gastos] } }));
    setGasForm({ fecha: hoyISO(), concepto: '', monto: '', categoria: 'Comida' });
    log('Gasto registrado.');
  };
  const crearSub = (e) => {
    e.preventDefault();
    if (!subForm.nombre.trim() || !subForm.monto) return;
    setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, suscripciones: [...p.finanzas.suscripciones, { id: uid('s'), nombre: subForm.nombre.trim(), monto: Number(subForm.monto), diaPago: Number(subForm.diaPago), activa: true }] } }));
    setSubForm({ nombre: '', monto: '', diaPago: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#111111] text-white rounded-[20px] p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Empresa · {mesClave}</h2>
          <p className="text-sm text-neutral-400">Balance: <b className={balance >= 0 ? 'text-emerald-300' : 'text-red-300'}>{fmtMoneda(balance)}</b></p>
        </div>
        <input type="month" value={mesClave} onChange={(e) => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, mesActual: e.target.value } }))} aria-label="Mes a consultar" className="bg-white text-black rounded-xl px-3 py-2 text-sm" />
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 transition-all duration-200"><p className="text-[11px] text-neutral-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" />INGRESOS</p><p className="font-black text-lg text-emerald-600">{fmtMoneda(totalIng)}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 transition-all duration-200"><p className="text-[11px] text-neutral-500 flex items-center gap-1"><TrendingDown className="w-3 h-3" />GASTOS</p><p className="font-black text-lg text-red-500">{fmtMoneda(totalGas)}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 transition-all duration-200"><p className="text-[11px] text-neutral-500 flex items-center gap-1"><CreditCard className="w-3 h-3" />SUSCRIPCIONES</p><p className="font-black text-lg">{fmtMoneda(totalSubs)}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 transition-all duration-200">
          <p className="text-[11px] text-neutral-500">META {fmtMoneda(datos.finanzas.metaMensual)}</p>
          <input type="number" value={datos.finanzas.metaMensual} onChange={(e) => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, metaMensual: Number(e.target.value) } }))} aria-label="Meta mensual" className="w-full bg-neutral-100 rounded-lg px-2 py-1 text-sm font-bold" />
          <div className="h-1.5 bg-neutral-100 rounded-full mt-2"><div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalIng / (datos.finanzas.metaMensual || 1)) * 100)}%` }} /></div>
        </div>
      </div>

      <Tarjeta>
        <h3 className="font-bold text-sm">Balance de los últimos 6 meses</h3>
        <p className="text-[11px] text-neutral-500 mb-2">Ingresos menos gastos por mes (sin suscripciones).</p>
        <BarrasMes datos={balancePorMes} />
      </Tarjeta>

      {avisosSubs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 transition-all duration-200">
          <p className="text-sm font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Avisos de pago</p>
          {avisosSubs.map((s) => <p key={s.id} className="text-xs text-amber-800">• {s.nombre} ({fmtMoneda(s.monto)}) se cobra el día {s.diaPago} — faltan {s.diasRestantes} días.</p>)}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Tarjeta>
          <h3 className="font-bold text-sm mb-3">Ingresos del mes</h3>
          <form onSubmit={crearIngreso} className="space-y-2 mb-3">
            <input type="date" value={ingForm.fecha} onChange={(e) => setIngForm({ ...ingForm, fecha: e.target.value })} aria-label="Fecha del ingreso" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <input value={ingForm.concepto} onChange={(e) => setIngForm({ ...ingForm, concepto: e.target.value })} placeholder="Concepto" aria-label="Concepto del ingreso" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="number" value={ingForm.monto} onChange={(e) => setIngForm({ ...ingForm, monto: e.target.value })} placeholder="Monto" aria-label="Monto del ingreso" className="flex-1 min-w-0 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
              <button aria-label="Añadir ingreso" className="bg-black text-white px-4 rounded-xl text-sm font-bold transition-all duration-200">+</button>
            </div>
          </form>
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
            {ingresosMes.map((i) => (
              <div key={i.id} className="flex justify-between text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <span className="text-neutral-900"><b>{i.concepto}</b> · {i.fecha}</span>
                <span className="flex items-center gap-2 font-bold text-emerald-700">{fmtMoneda(i.monto)}
                  <button aria-label="Eliminar ingreso" onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, ingresos: p.finanzas.ingresos.filter((x) => x.id !== i.id) } }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </span>
              </div>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta>
          <h3 className="font-bold text-sm mb-3">Gastos del mes</h3>
          <form onSubmit={crearGasto} className="space-y-2 mb-3">
            <input type="date" value={gasForm.fecha} onChange={(e) => setGasForm({ ...gasForm, fecha: e.target.value })} aria-label="Fecha del gasto" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <input value={gasForm.concepto} onChange={(e) => setGasForm({ ...gasForm, concepto: e.target.value })} placeholder="Concepto" aria-label="Concepto del gasto" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <select value={gasForm.categoria} onChange={(e) => setGasForm({ ...gasForm, categoria: e.target.value })} aria-label="Categoría del gasto" className="bg-neutral-100 rounded-xl px-2 text-xs">
                <option>Comida</option><option>Transporte</option><option>Vivienda</option><option>Negocio</option><option>Salud</option><option>Otros</option>
              </select>
              <input type="number" value={gasForm.monto} onChange={(e) => setGasForm({ ...gasForm, monto: e.target.value })} placeholder="Monto" aria-label="Monto del gasto" className="flex-1 min-w-0 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
              <button aria-label="Añadir gasto" className="bg-black text-white px-4 rounded-xl text-sm font-bold transition-all duration-200">+</button>
            </div>
          </form>
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
            {gastosMes.map((g) => (
              <div key={g.id} className="flex justify-between text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <span className="text-neutral-900"><b>{g.concepto}</b> · {g.categoria} · {g.fecha}</span>
                <span className="flex items-center gap-2 font-bold text-red-600">{fmtMoneda(g.monto)}
                  <button aria-label="Eliminar gasto" onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, gastos: p.finanzas.gastos.filter((x) => x.id !== g.id) } }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </span>
              </div>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-1"><Clock className="w-4 h-4" />Suscripciones</h3>
          <form onSubmit={crearSub} className="space-y-2 mb-3">
            <input value={subForm.nombre} onChange={(e) => setSubForm({ ...subForm, nombre: e.target.value })} placeholder="Nombre (ej. Internet)" aria-label="Nombre de la suscripción" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="number" value={subForm.monto} onChange={(e) => setSubForm({ ...subForm, monto: e.target.value })} placeholder="Monto" aria-label="Monto de la suscripción" className="flex-1 min-w-0 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
              <input type="number" min="1" max="31" value={subForm.diaPago} onChange={(e) => setSubForm({ ...subForm, diaPago: e.target.value })} title="Día de pago" aria-label="Día de pago" className="w-20 bg-neutral-100 rounded-xl px-2 py-2 text-sm" />
              <button aria-label="Añadir suscripción" className="bg-black text-white px-4 rounded-xl text-sm font-bold transition-all duration-200">+</button>
            </div>
          </form>
          <div className="space-y-1.5">
            {datos.finanzas.suscripciones.map((s) => (
              <div key={s.id} className="flex justify-between items-center text-xs border border-neutral-100 rounded-xl px-3 py-2">
                <span><b>{s.nombre}</b> · día {s.diaPago} · {fmtMoneda(s.monto)}</span>
                <span className="flex gap-1 items-center">
                  <button onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, suscripciones: p.finanzas.suscripciones.map((x) => (x.id === s.id ? { ...x, activa: !x.activa } : x)) } }))} aria-pressed={s.activa} className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${s.activa ? 'bg-black text-white' : 'bg-neutral-100'}`}>{s.activa ? 'Activa' : 'Pausada'}</button>
                  <button aria-label="Eliminar suscripción" onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, suscripciones: p.finanzas.suscripciones.filter((x) => x.id !== s.id) } }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </span>
              </div>
            ))}
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
