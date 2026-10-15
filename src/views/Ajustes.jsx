import React from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { ESTADO_INICIAL } from '../lib/datos';
import { Tarjeta } from '../components/ui';

export default function Ajustes({ datos, setDatos, exportar, importar, diasDesdeRespaldo }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Tarjeta>
        <h2 className="font-bold mb-3">Perfil</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-500" htmlFor="perfil-alias">Nombre / alias</label>
            <input id="perfil-alias" value={datos.perfil.alias} onChange={(e) => setDatos((p) => ({ ...p, perfil: { ...p.perfil, alias: e.target.value } }))} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm font-bold" />
          </div>
          <div>
            <label className="text-xs text-neutral-500" htmlFor="perfil-titulo">Enfoque actual</label>
            <input id="perfil-titulo" value={datos.perfil.titulo} onChange={(e) => setDatos((p) => ({ ...p, perfil: { ...p.perfil, titulo: e.target.value } }))} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <p className="text-xs text-neutral-500">Tus datos viven en este navegador (localStorage, clave <code className="bg-neutral-100 px-1 rounded">RESETLY_DATA</code>). Expórtalos para cambiar de dispositivo.</p>
        </div>
      </Tarjeta>
      <Tarjeta>
        <h2 className="font-bold mb-3">Respaldo</h2>
        <p className="text-xs text-neutral-500 mb-3">
          Último respaldo: <b>{datos.ultimoRespaldo || 'nunca'}</b>
          {diasDesdeRespaldo !== null && diasDesdeRespaldo > 7 && (
            <span className="text-amber-600 font-bold"> · hace {diasDesdeRespaldo} días, exporta uno nuevo</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportar} className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"><Download className="w-4 h-4" />Exportar JSON</button>
          <label className="bg-neutral-100 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-200"><Upload className="w-4 h-4" />Importar<input type="file" accept=".json" onChange={importar} className="hidden" /></label>
          <button onClick={() => { if (confirm('¿Borrar todo y empezar de cero?')) { localStorage.removeItem('RESETLY_DATA'); setDatos(JSON.parse(JSON.stringify(ESTADO_INICIAL))); } }} className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"><RefreshCw className="w-4 h-4" />Reiniciar</button>
        </div>
        <div className="border-t border-neutral-100 pt-3 mt-3">
          <p className="text-xs font-bold mb-1">Actividad reciente</p>
          <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-neutral-500">
            {datos.logs.map((l) => <p key={l.id}>[{l.hora}] {l.mensaje}</p>)}
          </div>
        </div>
      </Tarjeta>
    </div>
  );
}
