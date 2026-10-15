import React, { useState } from 'react';
import { Timer, Play, Pause, RotateCcw, FolderKanban, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { hoyISO, uid } from '../lib/datos';
import { Tarjeta } from '../components/ui';
import { ProyectoEditor, CursoEditor } from '../components/Editors';

export default function Mente({ datos, setDatos, log, timer, go, buscar }) {
  const [proyForm, setProyForm] = useState({ nombre: '', estado: 'Idea', stack: '', prioridad: 'Media', progreso: 10 });
  const [cursoForm, setCursoForm] = useState({ titulo: '', categoria: 'General', progreso: 0 });
  const [selProyecto, setSelProyecto] = useState(null);
  const [selCurso, setSelCurso] = useState(null);

  const crearProyecto = (e) => {
    e.preventDefault();
    if (!proyForm.nombre.trim()) return;
    setDatos((p) => ({ ...p, proyectos: [{ id: uid('p'), ...proyForm, nombre: proyForm.nombre.trim(), progreso: Number(proyForm.progreso), notas: '# Notas\n', actualizado: hoyISO() }, ...p.proyectos] }));
    setProyForm({ nombre: '', estado: 'Idea', stack: '', prioridad: 'Media', progreso: 10 });
    log('Proyecto creado.');
  };
  const crearCurso = (e) => {
    e.preventDefault();
    if (!cursoForm.titulo.trim()) return;
    setDatos((p) => ({ ...p, cursos: [{ id: uid('c'), ...cursoForm, titulo: cursoForm.titulo.trim(), progreso: Number(cursoForm.progreso), notas: '# Apuntes\n', actualizado: hoyISO() }, ...p.cursos] }));
    setCursoForm({ titulo: '', categoria: 'General', progreso: 0 });
    log('Curso creado.');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[20px] border border-neutral-200 p-5 flex flex-col sm:flex-row items-center gap-4 transition-all duration-200">
        <div className="flex-1">
          <h2 className="font-bold flex items-center gap-2"><Timer className="w-4 h-4" />Enfoque · Pomodoro</h2>
          <p className="text-xs text-neutral-500">{timer.modo} · Pomodoro {timer.pomodorosHoy + (timer.modo === 'Enfoque' ? 1 : 0)} (ciclo {timer.cicloActual}/4) · Hoy llevas {timer.pomodorosHoy} · {(datos.minutosFoco || 0)} min acumulados</p>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={`w-6 h-1.5 rounded-full ${(timer.pomodorosHoy % 4) >= i ? 'bg-black' : 'bg-neutral-200'}`} />
            ))}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">25 min enfoque → 5 descanso · cada 4 ciclos, descanso largo de 20 min. <button onClick={() => go('metodos')} className="underline font-bold">Ver todos los métodos</button></p>
        </div>
        <p className="text-4xl font-black tabular-nums">{timer.fmt(timer.seg)}</p>
        <div className="flex gap-2">
          <button onClick={() => timer.iniciar('Enfoque', 25)} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold transition-all duration-200">25</button>
          <button onClick={() => timer.iniciar('Descanso', 5)} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold transition-all duration-200">5</button>
          <button onClick={() => timer.iniciar('Descanso largo', 20)} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold transition-all duration-200">20</button>
          <button onClick={timer.toggle} aria-label={timer.corriendo ? 'Pausar temporizador' : 'Iniciar temporizador'} className="bg-black text-white p-2.5 rounded-full transition-all duration-200">{timer.corriendo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
          <button onClick={timer.detener} aria-label="Detener temporizador" className="bg-neutral-100 p-2.5 rounded-full transition-all duration-200"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><FolderKanban className="w-4 h-4" />Proyectos</h3>
          <form onSubmit={crearProyecto} className="grid grid-cols-2 gap-2 mb-3">
            <input value={proyForm.nombre} onChange={(e) => setProyForm({ ...proyForm, nombre: e.target.value })} placeholder="Nombre del proyecto" aria-label="Nombre del proyecto" className="col-span-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <input value={proyForm.stack} onChange={(e) => setProyForm({ ...proyForm, stack: e.target.value })} placeholder="Stack" aria-label="Stack del proyecto" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <select value={proyForm.estado} onChange={(e) => setProyForm({ ...proyForm, estado: e.target.value })} aria-label="Estado del proyecto" className="bg-neutral-100 rounded-xl px-2 text-sm">
              <option>Idea</option><option>En curso</option><option>En pausa</option><option>Terminado</option>
            </select>
            <button className="col-span-2 bg-black text-white text-sm font-bold py-2 rounded-xl transition-all duration-200">Crear proyecto</button>
          </form>
          <div className="space-y-2">
            {datos.proyectos.filter((p) => buscar(p.nombre)).map((p) => (
              <div key={p.id} className={`border rounded-xl p-3 transition-all duration-200 ${selProyecto === p.id ? 'border-black' : 'border-neutral-100'}`}>
                <div className="flex justify-between items-center">
                  <button onClick={() => setSelProyecto(selProyecto === p.id ? null : p.id)} className="text-left flex items-center gap-1 font-bold text-sm"><Pencil className="w-3 h-3" />{p.nombre}</button>
                  <button aria-label="Eliminar proyecto" onClick={() => setDatos((d) => ({ ...d, proyectos: d.proyectos.filter((x) => x.id !== p.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-[11px] text-neutral-500">{p.estado} · {p.stack} · {p.progreso}%</p>
                <div className="h-1.5 bg-neutral-100 rounded-full mt-2"><div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${p.progreso}%` }} /></div>
                {selProyecto === p.id && (
                  <ProyectoEditor proyecto={p} onGuardar={(id, notas, progreso) => setDatos((d) => ({ ...d, proyectos: d.proyectos.map((x) => (x.id === id ? { ...x, notas, progreso: Number(progreso), actualizado: hoyISO() } : x)) }))} />
                )}
              </div>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta>
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4" />Cursos y apuntes</h3>
          <form onSubmit={crearCurso} className="grid grid-cols-2 gap-2 mb-3">
            <input value={cursoForm.titulo} onChange={(e) => setCursoForm({ ...cursoForm, titulo: e.target.value })} placeholder="Título del curso o libro" aria-label="Título del curso" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <input value={cursoForm.categoria} onChange={(e) => setCursoForm({ ...cursoForm, categoria: e.target.value })} placeholder="Categoría" aria-label="Categoría del curso" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
            <button className="col-span-2 bg-black text-white text-sm font-bold py-2 rounded-xl transition-all duration-200">Crear curso</button>
          </form>
          <div className="space-y-2">
            {datos.cursos.filter((c) => buscar(c.titulo)).map((c) => (
              <div key={c.id} className={`border rounded-xl p-3 transition-all duration-200 ${selCurso === c.id ? 'border-black' : 'border-neutral-100'}`}>
                <div className="flex justify-between items-center">
                  <button onClick={() => setSelCurso(selCurso === c.id ? null : c.id)} className="text-left font-bold text-sm flex items-center gap-1"><Pencil className="w-3 h-3" />{c.titulo}</button>
                  <button aria-label="Eliminar curso" onClick={() => setDatos((d) => ({ ...d, cursos: d.cursos.filter((x) => x.id !== c.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-[11px] text-neutral-500">{c.categoria} · {c.progreso}%</p>
                <div className="h-1.5 bg-neutral-100 rounded-full mt-2"><div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${c.progreso}%` }} /></div>
                {selCurso === c.id && (
                  <CursoEditor curso={c} onGuardar={(id, notas, progreso) => setDatos((d) => ({ ...d, cursos: d.cursos.map((x) => (x.id === id ? { ...x, notas, progreso: Number(progreso), actualizado: hoyISO() } : x)) }))} />
                )}
              </div>
            ))}
          </div>
        </Tarjeta>
      </div>
      <p className="text-xs text-neutral-500">Cada proyecto y curso guarda su propio documento Markdown. Úsalo como cuaderno: ideas, pasos y enlaces.</p>
    </div>
  );
}
