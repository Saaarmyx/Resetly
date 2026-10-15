import React, { useState } from 'react';
import { renderMarkdown } from './ui';

export function ProyectoEditor({ proyecto, onGuardar }) {
  const [notas, setNotas] = useState(proyecto.notas || '');
  const [progreso, setProgreso] = useState(proyecto.progreso || 0);
  return (
    <div className="mt-3 grid md:grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
      <div>
        <label className="text-[11px] text-neutral-500 font-bold">Documento Markdown</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={8} className="w-full bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl p-3 mt-1" placeholder="# Plan&#10;- [ ] Paso 1" />
        <div className="flex gap-2 mt-2 items-center">
          <input type="range" min="0" max="100" value={progreso} onChange={(e) => setProgreso(e.target.value)} className="flex-1" aria-label="Progreso del proyecto" />
          <span className="text-xs font-bold">{progreso}%</span>
          <button onClick={() => onGuardar(proyecto.id, notas, progreso)} className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar</button>
        </div>
      </div>
      <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
        <p className="text-[11px] font-bold text-neutral-500 mb-2">VISTA PREVIA</p>
        {renderMarkdown(notas)}
      </div>
    </div>
  );
}

export function CursoEditor({ curso, onGuardar }) {
  const [notas, setNotas] = useState(curso.notas || '');
  const [progreso, setProgreso] = useState(curso.progreso || 0);
  return (
    <div className="mt-3 grid md:grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
      <div>
        <label className="text-[11px] text-neutral-500 font-bold">Apuntes Markdown</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={8} className="w-full bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl p-3 mt-1" placeholder="# Apuntes&#10;- idea clave" />
        <div className="flex gap-2 mt-2 items-center">
          <input type="range" min="0" max="100" value={progreso} onChange={(e) => setProgreso(e.target.value)} className="flex-1" aria-label="Progreso del curso" />
          <span className="text-xs font-bold">{progreso}%</span>
          <button onClick={() => onGuardar(curso.id, notas, progreso)} className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar</button>
        </div>
      </div>
      <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
        <p className="text-[11px] font-bold text-neutral-500 mb-2">VISTA PREVIA</p>
        {renderMarkdown(notas)}
      </div>
    </div>
  );
}
