import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home, CalendarDays, Dumbbell, Brain, Wallet, Settings,
  Search, Bell, Plus, Check, Trash2, Download, Upload, RefreshCw,
  Moon, Sun, Droplets, Zap, ChevronLeft, ChevronRight, Clock,
  BookOpen, FolderKanban, CreditCard, TrendingUp, TrendingDown,
  AlertTriangle, LifeBuoy, LogOut, Play, Pause, RotateCcw, Pencil,
  Timer, ListChecks, Star, LayoutGrid, Columns3, BellOff, Armchair,
  BatteryCharging, Rabbit, CalendarClock, Target
} from 'lucide-react';

// ---------- Utilidades ----------
const hoyISO = () => new Date().toISOString().split('T')[0];
const mesISO = () => new Date().toISOString().slice(0, 7);
const uid = (p) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
const horaAhora = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtMoneda = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`;
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const RUTINA_DEFAULT = {
  Lunes: { tipo: 'Fuerza empuje', detalle: '- Press banca 5x5\n- Press militar 4x8\n- Fondos 3x12' },
  Martes: { tipo: 'Acondicionamiento', detalle: '- 20 min trote suave\n- 6 rondas saco 3 min\n- Movilidad 10 min' },
  'Miércoles': { tipo: 'Fuerza pierna', detalle: '- Sentadilla 5x5\n- Peso muerto 3x5\n- Zancadas 3x12' },
  Jueves: { tipo: 'Técnica / movilidad', detalle: '- Movilidad cadera 15 min\n- Core 3 rondas\n- Caminata 30 min' },
  Viernes: { tipo: 'Fuerza tirón', detalle: '- Dominadas 5x5\n- Remo 4x8\n- Curl 3x12' },
  'Sábado': { tipo: 'Deporte / aire libre', detalle: '- Sesión larga a elegir\n- Estiramientos 15 min' },
  Domingo: { tipo: 'Recuperación', detalle: '- Caminata suave\n- Sueño 8h\n- Sin pantallas 1h antes de dormir' },
};

const ESTADO_INICIAL = {
  perfil: { alias: 'Operador Resetly', titulo: 'En reconstrucción', racha: 1 },
  habitos: [
    { id: 'h1', titulo: 'Entrenar según rutina del día', categoria: 'fisico', completado: false },
    { id: 'h2', titulo: '2 h de trabajo profundo', categoria: 'mente', completado: false },
    { id: 'h3', titulo: 'Dormir 7.5 h + sin móvil en cama', categoria: 'fisico', completado: true },
    { id: 'h4', titulo: 'Revisar ingresos y gastos', categoria: 'empresa', completado: false },
  ],
  registrosDiarios: [],
  rutinasSemanales: RUTINA_DEFAULT,
  entrenos: [],
  statsFisicos: { press: 100, sentadilla: 140, pesoMuerto: 180, vo2: 45, grasa: 15 },
  readiness: { suenoHrs: 7.5, hidratacionL: 2.5, proteina: 160, energia: 75 },
  proyectos: [
    { id: 'p1', nombre: 'Portafolio personal', estado: 'En curso', stack: 'React, Vite', prioridad: 'Alta', progreso: 40, notas: '# Objetivo\nLanzar portafolio antes de fin de mes.\n\n- [x] Estructura base\n- [ ] 3 proyectos documentados\n- [ ] Desplegar en hosting', actualizado: hoyISO() },
  ],
  cursos: [
    { id: 'c1', titulo: 'Inglés técnico', categoria: 'Idiomas', progreso: 30, notas: '# Vocabulario\n- ship / deploy / rollback\n\n## Frases\n- "Can you review this PR?"', actualizado: hoyISO() },
  ],
  finanzas: {
    mesActual: mesISO(),
    metaMensual: 50000,
    ingresos: [{ id: 'i1', fecha: hoyISO(), concepto: 'Salario / cliente base', monto: 30000 }],
    gastos: [{ id: 'g1', fecha: hoyISO(), concepto: 'Comida semanal', monto: 2500, categoria: 'Comida' }],
    suscripciones: [
      { id: 's1', nombre: 'Internet', monto: 600, diaPago: 5, activa: true },
      { id: 's2', nombre: 'Streaming', monto: 219, diaPago: 20, activa: true },
    ],
  },
  minutosFoco: 0,
  pomodoro: { hechos: 0, fecha: '' },
  bloques: [],
  rana: { texto: '', hecha: false, fecha: '' },
  mits: [],
  eisenhower: [],
  kanban: [],
  sinDistracciones: { notif: false, pestanas: false, archivos: false, fecha: '' },
  entorno: { limpio: false, luz: false, silla: false, agua: false, fecha: '' },
  tema: 'claro',
  ultimoRespaldo: '',
  logs: [{ id: 'l1', hora: '08:30', mensaje: 'Bienvenido a Resetly. Registra tu día para empezar tu racha.' }],
};

// Fusiona datos guardados/importados con los valores por defecto.
// Así un JSON incompleto o de una versión anterior nunca rompe la app.
function normalizar(p) {
  const base = JSON.parse(JSON.stringify(ESTADO_INICIAL));
  if (!p || typeof p !== 'object' || Array.isArray(p)) return base;
  const out = { ...base, ...p };
  out.perfil = { ...base.perfil, ...((p.perfil && typeof p.perfil === 'object') ? p.perfil : {}) };
  out.readiness = { ...base.readiness, ...((p.readiness && typeof p.readiness === 'object') ? p.readiness : {}) };
  out.statsFisicos = { ...base.statsFisicos, ...((p.statsFisicos && typeof p.statsFisicos === 'object') ? p.statsFisicos : {}) };
  out.finanzas = { ...base.finanzas, ...((p.finanzas && typeof p.finanzas === 'object') ? p.finanzas : {}) };
  if (!Array.isArray(out.finanzas.ingresos)) out.finanzas.ingresos = [];
  if (!Array.isArray(out.finanzas.gastos)) out.finanzas.gastos = [];
  if (!Array.isArray(out.finanzas.suscripciones)) out.finanzas.suscripciones = [];
  out.pomodoro = { ...base.pomodoro, ...((p.pomodoro && typeof p.pomodoro === 'object') ? p.pomodoro : {}) };
  out.rana = { ...base.rana, ...((p.rana && typeof p.rana === 'object') ? p.rana : {}) };
  out.sinDistracciones = { ...base.sinDistracciones, ...((p.sinDistracciones && typeof p.sinDistracciones === 'object') ? p.sinDistracciones : {}) };
  out.entorno = { ...base.entorno, ...((p.entorno && typeof p.entorno === 'object') ? p.entorno : {}) };
  out.rutinasSemanales = { ...base.rutinasSemanales };
  for (const d of DIAS_SEMANA) {
    const g = p.rutinasSemanales && typeof p.rutinasSemanales === 'object' ? p.rutinasSemanales[d] : null;
    out.rutinasSemanales[d] = { ...base.rutinasSemanales[d], ...((g && typeof g === 'object') ? g : {}) };
  }
  for (const k of ['habitos', 'registrosDiarios', 'entrenos', 'proyectos', 'cursos', 'bloques', 'mits', 'eisenhower', 'kanban', 'logs']) {
    if (!Array.isArray(p[k])) out[k] = base[k];
  }
  if (typeof out.minutosFoco !== 'number') out.minutosFoco = 0;
  if (!['claro', 'oscuro'].includes(out.tema)) out.tema = 'claro';
  if (typeof out.ultimoRespaldo !== 'string') out.ultimoRespaldo = '';
  return out;
}

function cargarEstado() {
  try {
    const nuevo = localStorage.getItem('RESETLY_DATA');
    if (nuevo) {
      return normalizar(JSON.parse(nuevo));
    }
    // Migrar datos del sistema anterior si existen
    const viejo = localStorage.getItem('STARK_WAYNE_OS_DATA');
    if (viejo) {
      const v = JSON.parse(viejo);
      return normalizar({
        habitos: (v.habits || []).map((h) => ({ id: h.id, titulo: h.title, categoria: h.category === 'batman' ? 'fisico' : h.category === 'stark' ? 'mente' : 'empresa', completado: !!h.completed })),
        entrenos: (v.workouts || []).map((w) => ({ id: w.id, fecha: w.date, tipo: w.type, duracionMin: parseInt(w.duration) || 45, notas: w.notes })),
        proyectos: (v.projects || []).map((p) => ({ id: p.id, nombre: p.name, estado: p.status, stack: p.stack, prioridad: p.priority, progreso: 50, notas: '', actualizado: hoyISO() })),
        cursos: (v.knowledgeItems || []).map((k) => ({ id: k.id, titulo: k.title, categoria: k.category, progreso: k.progress, notas: '', actualizado: hoyISO() })),
      });
    }
  } catch { /* ignorar */ }
  return ESTADO_INICIAL;
}

// Mini render markdown (seguro, sin dependencias)
function renderMarkdown(txt) {
  if (!txt) return <p className="text-sm text-neutral-400">Sin notas todavía. Escribe en formato Markdown a la izquierda.</p>;
  const esc = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lineas = esc.split('\n');
  const els = [];
  let lista = [];
  const flushLista = () => {
    if (lista.length) {
      els.push(<ul key={`ul-${els.length}`} className="list-disc pl-5 space-y-1 text-sm text-neutral-700 my-2">{lista.map((t, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(t) }} />)}</ul>);
      lista = [];
    }
  };
  const inline = (s) => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-neutral-100 px-1 rounded text-[12px]">$1</code>')
    .replace(/- \[x\]/g, '☑')
    .replace(/- \[ \]/g, '☐');
  lineas.forEach((ln, i) => {
    if (/^#{1,3}\s/.test(ln)) {
      flushLista();
      const nivel = ln.match(/^#+/)[0].length;
      const texto = inline(ln.replace(/^#+\s/, ''));
      els.push(nivel === 1
        ? <h3 key={i} className="font-bold text-base mt-2" dangerouslySetInnerHTML={{ __html: texto }} />
        : <h4 key={i} className="font-semibold text-sm mt-2" dangerouslySetInnerHTML={{ __html: texto }} />);
    } else if (/^-\s/.test(ln)) {
      lista.push(ln.replace(/^-\s/, ''));
    } else if (ln.trim() === '') {
      flushLista();
    } else {
      flushLista();
      els.push(<p key={i} className="text-sm text-neutral-700 my-1" dangerouslySetInnerHTML={{ __html: inline(ln) }} />);
    }
  });
  flushLista();
  return <div>{els}</div>;
}

export default function App() {
  const [datos, setDatos] = useState(cargarEstado);
  const [pestana, setPestana] = useState('inicio');
  const [busqueda, setBusqueda] = useState('');
  const [calMes, setCalMes] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  // Sonido de aviso al terminar (WebAudio, sin archivos)
  const beep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      [0, 0.28, 0.56].forEach((t, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = i === 2 ? 880 : 660;
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.22);
      });
    } catch { /* sin audio */ }
  };

  // Timer foco — Pomodoro completo: 25 enfoque / 5 descanso, cada 4 ciclos descanso largo 20 min
  const [seg, setSeg] = useState(25 * 60);
  const [corriendo, setCorriendo] = useState(false);
  const [modo, setModo] = useState('Enfoque');
  const corriendoRef = useRef(false);
  corriendoRef.current = corriendo;
  const pomodorosHoy = datos.pomodoro?.fecha === hoyISO() ? (datos.pomodoro.hechos || 0) : 0;
  const cicloActual = (pomodorosHoy % 4) + 1;
  useEffect(() => {
    if (!corriendo) return;
    if (seg <= 0) {
      setCorriendo(false);
      beep();
      if (modo === 'Enfoque') {
        const nuevos = pomodorosHoy + 1;
        const esCicloCompleto = nuevos % 4 === 0;
        setDatos((p) => ({ ...p, minutosFoco: (p.minutosFoco || 0) + 25, pomodoro: { hechos: nuevos, fecha: hoyISO() } }));
        agregarLog(`Pomodoro ${nuevos} terminado (${nuevos % 4 || 4}/4 del ciclo).`);
        if (esCicloCompleto) { setModo('Descanso largo'); setSeg(20 * 60); }
        else { setModo('Descanso'); setSeg(5 * 60); }
      } else {
        const largo = modo === 'Descanso largo' ? 20 : 5;
        agregarLog(`Descanso de ${largo} min terminado. Vuelve al enfoque.`);
        setModo('Enfoque'); setSeg(25 * 60);
      }
      return;
    }
    const t = setTimeout(() => setSeg((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [corriendo, seg]); // eslint-disable-line

  // Título de la pestaña con la cuenta atrás + pausa automática al ocultar la pestaña
  const fmtTiempo = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  useEffect(() => {
    document.title = corriendo ? `${fmtTiempo(seg)} · ${modo} — Resetly` : 'Resetly';
  }, [corriendo, seg, modo]);
  useEffect(() => {
    const alOcultar = () => {
      if (document.hidden && corriendoRef.current) {
        setCorriendo(false);
        agregarLog('Temporizador pausado automáticamente (cambiaste de pestaña).');
      }
    };
    document.addEventListener('visibilitychange', alOcultar);
    return () => document.removeEventListener('visibilitychange', alOcultar);
  }, []); // eslint-disable-line

  useEffect(() => {
    try { localStorage.setItem('RESETLY_DATA', JSON.stringify(datos)); } catch { /* lleno */ }
  }, [datos]);

  const agregarLog = (mensaje) => {
    setDatos((p) => ({ ...p, logs: [{ id: uid('l'), hora: horaAhora(), mensaje }, ...p.logs].slice(0, 30) }));
  };

  // Formularios locales
  const [habitoNuevo, setHabitoNuevo] = useState('');
  const [habitoCat, setHabitoCat] = useState('fisico');
  const [registroForm, setRegistroForm] = useState({ fecha: hoyISO(), suenoHrs: 7.5, energia: 75, animo: 'Bien', entrenamiento: '', nota: '' });
  const [entrenoForm, setEntrenoForm] = useState({ tipo: 'Fuerza', duracionMin: 45, notas: '' });
  const [proyForm, setProyForm] = useState({ nombre: '', estado: 'Idea', stack: '', prioridad: 'Media', progreso: 10 });
  const [cursoForm, setCursoForm] = useState({ titulo: '', categoria: 'General', progreso: 0 });
  const [ingForm, setIngForm] = useState({ fecha: hoyISO(), concepto: '', monto: '' });
  const [gasForm, setGasForm] = useState({ fecha: hoyISO(), concepto: '', monto: '', categoria: 'Comida' });
  const [subForm, setSubForm] = useState({ nombre: '', monto: '', diaPago: 1 });
  const [selProyecto, setSelProyecto] = useState(null);
  const [selCurso, setSelCurso] = useState(null);
  // Métodos de productividad
  const [bloqueForm, setBloqueForm] = useState({ titulo: '', inicio: '09:00', fin: '10:30', categoria: 'mente' });
  const [mitForm, setMitForm] = useState('');
  const [ranaTexto, setRanaTexto] = useState('');
  const [eisenForm, setEisenForm] = useState({ titulo: '', urgente: false, importante: true });
  const [kanbanForm, setKanbanForm] = useState({ titulo: '', categoria: 'mente' });

  // Derivados
  const habitosHechos = datos.habitos.filter((h) => h.completado).length;
  const pctHabitos = datos.habitos.length ? Math.round((habitosHechos / datos.habitos.length) * 100) : 0;

  const mesClave = datos.finanzas.mesActual;
  const ingresosMes = useMemo(() => datos.finanzas.ingresos.filter((i) => (i.fecha || '').slice(0, 7) === mesClave), [datos, mesClave]);
  const gastosMes = useMemo(() => datos.finanzas.gastos.filter((g) => (g.fecha || '').slice(0, 7) === mesClave), [datos, mesClave]);
  const totalIng = ingresosMes.reduce((a, b) => a + Number(b.monto || 0), 0);
  const totalGas = gastosMes.reduce((a, b) => a + Number(b.monto || 0), 0);
  const subsActivas = datos.finanzas.suscripciones.filter((s) => s.activa);
  const totalSubs = subsActivas.reduce((a, b) => a + Number(b.monto || 0), 0);
  const balance = totalIng - totalGas - totalSubs;

  const avisosSubs = useMemo(() => {
    const hoy = new Date();
    const diaHoy = hoy.getDate();
    return subsActivas.map((s) => {
      const d = Number(s.diaPago);
      let diff = d - diaHoy;
      if (diff < 0) diff += 30;
      return { ...s, diasRestantes: diff, urgente: diff <= 5 };
    }).filter((s) => s.urgente);
  }, [subsActivas]);

  const	diasDelMes = useMemo(() => {
    const primero = new Date(calMes.y, calMes.m, 1);
    const inicioSemana = (primero.getDay() + 6) % 7; // lunes=0
    const totalDias = new Date(calMes.y, calMes.m + 1, 0).getDate();
    const celdas = [];
    for (let i = 0; i < inicioSemana; i++) celdas.push(null);
    for (let d = 1; d <= totalDias; d++) celdas.push(d);
    return celdas;
  }, [calMes]);
  const nombreMes = new Date(calMes.y, calMes.m, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const fechasConRegistro = useMemo(() => new Set(datos.registrosDiarios.map((r) => r.fecha)), [datos.registrosDiarios]);

  // Series para gráficos: últimos 14 registros (sueño y energía) y balance de los últimos 6 meses
  const ultimosRegistros = useMemo(() => [...datos.registrosDiarios]
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).slice(-14), [datos.registrosDiarios]);
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
      const d = new Date(`${c}-01T00:00:00`);
      return { clave: c, etiqueta: d.toLocaleDateString('es-MX', { month: 'short' }), valor: ing - gas };
    });
  }, [datos.finanzas, mesClave]);

  const filtrar = (texto) => (busqueda ? texto.toLowerCase().includes(busqueda.toLowerCase()) : true);

  // Acciones hábitos
  const alternarHabito = (id) => setDatos((p) => ({ ...p, habitos: p.habitos.map((h) => (h.id === id ? { ...h, completado: !h.completado } : h)) }));
  const borrarHabito = (id) => setDatos((p) => ({ ...p, habitos: p.habitos.filter((h) => h.id !== id) }));
  const crearHabito = (e) => {
    e.preventDefault();
    if (!habitoNuevo.trim()) return;
    setDatos((p) => ({ ...p, habitos: [...p.habitos, { id: uid('h'), titulo: habitoNuevo.trim(), categoria: habitoCat, completado: false }] }));
    setHabitoNuevo('');
    agregarLog(`Hábito creado: ${habitoNuevo.trim()}`);
  };

  // Registro diario — racha: +1 si ayer tiene registro, se mantiene si se re-guarda el mismo día, si no se reinicia a 1
  const diaAnterior = (iso) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
  };
  const guardarRegistro = (e) => {
    e.preventDefault();
    const item = { id: uid('r'), ...registroForm, suenoHrs: Number(registroForm.suenoHrs), energia: Number(registroForm.energia), habitos: `${habitosHechos}/${datos.habitos.length}` };
    setDatos((p) => {
      const yaExistia = p.registrosDiarios.some((r) => r.fecha === item.fecha);
      const sinEseDia = p.registrosDiarios.filter((r) => r.fecha !== item.fecha);
      const tieneAyer = sinEseDia.some((r) => r.fecha === diaAnterior(item.fecha));
      const racha = yaExistia ? (p.perfil.racha || 1) : (tieneAyer ? (p.perfil.racha || 0) + 1 : 1);
      return { ...p, registrosDiarios: [item, ...sinEseDia].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)), perfil: { ...p.perfil, racha } };
    });
    agregarLog(`Registro diario guardado (${item.fecha}): ${item.suenoHrs} h de sueño.`);
    setRegistroForm({ fecha: hoyISO(), suenoHrs: 7.5, energia: 75, animo: 'Bien', entrenamiento: '', nota: '' });
  };
  const borrarRegistro = (id) => setDatos((p) => ({ ...p, registrosDiarios: p.registrosDiarios.filter((r) => r.id !== id) }));

  // Físico
  const guardarEntreno = (e) => {
    e.preventDefault();
    const item = { id: uid('w'), fecha: hoyISO(), tipo: entrenoForm.tipo, duracionMin: Number(entrenoForm.duracionMin), notas: entrenoForm.notas };
    setDatos((p) => ({ ...p, entrenos: [item, ...p.entrenos].slice(0, 60) }));
    agregarLog(`Entreno registrado: ${item.tipo} ${item.duracionMin} min.`);
    setEntrenoForm({ tipo: 'Fuerza', duracionMin: 45, notas: '' });
  };
  const actualizarRutina = (dia, campo, valor) => setDatos((p) => ({ ...p, rutinasSemanales: { ...p.rutinasSemanales, [dia]: { ...p.rutinasSemanales[dia], [campo]: valor } } }));

  // Mente
  const crearProyecto = (e) => {
    e.preventDefault();
    if (!proyForm.nombre.trim()) return;
    setDatos((p) => ({ ...p, proyectos: [{ id: uid('p'), ...proyForm, nombre: proyForm.nombre.trim(), progreso: Number(proyForm.progreso), notas: '# Notas\n', actualizado: hoyISO() }, ...p.proyectos] }));
    setProyForm({ nombre: '', estado: 'Idea', stack: '', prioridad: 'Media', progreso: 10 });
    agregarLog('Proyecto creado.');
  };
  const crearCurso = (e) => {
    e.preventDefault();
    if (!cursoForm.titulo.trim()) return;
    setDatos((p) => ({ ...p, cursos: [{ id: uid('c'), ...cursoForm, titulo: cursoForm.titulo.trim(), progreso: Number(cursoForm.progreso), notas: '# Apuntes\n', actualizado: hoyISO() }, ...p.cursos] }));
    setCursoForm({ titulo: '', categoria: 'General', progreso: 0 });
    agregarLog('Curso creado.');
  };
  const guardarNotasProyecto = (id, notas, progreso) => setDatos((p) => ({ ...p, proyectos: p.proyectos.map((x) => (x.id === id ? { ...x, notas, progreso: Number(progreso), actualizado: hoyISO() } : x)) }));
  const guardarNotasCurso = (id, notas, progreso) => setDatos((p) => ({ ...p, cursos: p.cursos.map((x) => (x.id === id ? { ...x, notas, progreso: Number(progreso), actualizado: hoyISO() } : x)) }));

  // Empresa
  const crearIngreso = (e) => {
    e.preventDefault();
    if (!ingForm.concepto.trim() || !ingForm.monto) return;
    setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, ingresos: [{ id: uid('i'), ...ingForm, monto: Number(ingForm.monto) }, ...p.finanzas.ingresos] } }));
    setIngForm({ fecha: hoyISO(), concepto: '', monto: '' });
    agregarLog('Ingreso registrado.');
  };
  const crearGasto = (e) => {
    e.preventDefault();
    if (!gasForm.concepto.trim() || !gasForm.monto) return;
    setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, gastos: [{ id: uid('g'), ...gasForm, monto: Number(gasForm.monto) }, ...p.finanzas.gastos] } }));
    setGasForm({ fecha: hoyISO(), concepto: '', monto: '', categoria: 'Comida' });
    agregarLog('Gasto registrado.');
  };
  const crearSub = (e) => {
    e.preventDefault();
    if (!subForm.nombre.trim() || !subForm.monto) return;
    setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, suscripciones: [...p.finanzas.suscripciones, { id: uid('s'), nombre: subForm.nombre.trim(), monto: Number(subForm.monto), diaPago: Number(subForm.diaPago), activa: true }] } }));
    setSubForm({ nombre: '', monto: '', diaPago: 1 });
  };

  const exportar = () => {
    const a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datos, null, 2));
    a.download = `resetly_${hoyISO()}.json`;
    a.click();
    setDatos((p) => ({ ...p, ultimoRespaldo: hoyISO() }));
    agregarLog('Respaldo exportado.');
  };
  const importar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const crudo = JSON.parse(ev.target.result);
        if (!crudo || typeof crudo !== 'object' || Array.isArray(crudo)) throw new Error('forma inválida');
        setDatos(normalizar(crudo));
        agregarLog('Respaldo importado y validado.');
      } catch { alert('Archivo inválido: no es un respaldo de Resetly.'); }
    };
    r.readAsText(f);
    e.target.value = '';
  };
  const diasDesdeRespaldo = (() => {
    if (!datos.ultimoRespaldo) return null;
    const ms = Date.now() - new Date(`${datos.ultimoRespaldo}T00:00:00`).getTime();
    return Math.floor(ms / 86400000);
  })();

  const diaSemanaHoy = DIAS_SEMANA[(new Date().getDay() + 6) % 7];
  const rutinaHoy = datos.rutinasSemanales[diaSemanaHoy];
  const esOscuro = datos.tema === 'oscuro';

  const NAV = [
    { id: 'inicio', etiqueta: 'Inicio', icono: Home },
    { id: 'dia', etiqueta: 'Mi día', icono: CalendarDays },
    { id: 'fisico', etiqueta: 'Físico', icono: Dumbbell },
    { id: 'mente', etiqueta: 'Mente', icono: Brain },
    { id: 'metodos', etiqueta: 'Métodos', icono: Timer },
    { id: 'empresa', etiqueta: 'Empresa', icono: Wallet },
    { id: 'ajustes', etiqueta: 'Ajustes', icono: Settings },
  ];

  return (
    <div className={`min-h-screen font-sans p-3 ${esOscuro ? 'resetly-oscuro bg-neutral-950 text-neutral-100' : 'bg-[#EFEFEF] text-neutral-900'}`}>
      <div className="max-w-[1280px] mx-auto flex gap-4">
        {/* BARRA LATERAL */}
        <aside className="w-[210px] shrink-0 bg-[#111111] text-white rounded-[22px] p-5 hidden md:flex flex-col min-h-[calc(100vh-24px)] sticky top-3">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black text-lg">R</div>
            <span className="font-bold text-lg tracking-tight">Resetly</span>
          </div>
          <nav className="space-y-1 flex-1" aria-label="Navegación principal">
            {NAV.map((n) => {
              const Icono = n.icono;
              const activo = pestana === n.id;
              return (
                <button key={n.id} onClick={() => setPestana(n.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activo ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}>
                  <Icono className="w-[18px] h-[18px]" />{n.etiqueta}
                </button>
              );
            })}
          </nav>
          <div className="space-y-1 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400"><LifeBuoy className="w-[18px] h-[18px]" />Ayuda</div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400"><LogOut className="w-[18px] h-[18px]" />Salir</div>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 min-w-0" aria-label="Contenido principal">
          {/* Barra superior móvil */}
          <div className="md:hidden flex gap-2 mb-3 overflow-x-auto">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setPestana(n.id)} className={`px-3 py-2 rounded-full text-xs whitespace-nowrap ${pestana === n.id ? 'bg-black text-white' : 'bg-white'}`}>{n.etiqueta}</button>
            ))}
          </div>

          {/* Encabezado */}
          <header className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-white rounded-2xl flex items-center gap-2 px-4 py-2.5 border border-neutral-200">
              <Search className="w-4 h-4 text-neutral-400" />
              <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar hábitos, proyectos, cursos, movimientos…" aria-label="Buscar en Resetly"
                className="w-full text-sm outline-none bg-transparent placeholder:text-neutral-400" />
            </div>
            <button onClick={() => setDatos((p) => ({ ...p, tema: esOscuro ? 'claro' : 'oscuro' }))} aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-10 h-10 bg-white rounded-2xl border border-neutral-200 flex items-center justify-center">
              {esOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button aria-label="Avisos de pagos próximos" onClick={() => setPestana('empresa')} className="w-10 h-10 bg-white rounded-2xl border border-neutral-200 flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {avisosSubs.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white rounded-2xl border border-neutral-200 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                {datos.perfil.alias.slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold">{datos.perfil.alias}</p>
                <p className="text-[11px] text-neutral-500">{datos.perfil.racha || 1} {(datos.perfil.racha || 1) === 1 ? 'día' : 'días'} de racha</p>
              </div>
            </div>
          </header>

          {/* ============ INICIO ============ */}
          {pestana === 'inicio' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#111111] text-white rounded-[20px] p-6 flex justify-between items-center overflow-hidden">
                  <div>
                    <h1 className="font-bold text-xl">Tu propio camino de reinicio</h1>
                    <p className="text-sm text-neutral-400 mt-1">Cuerpo, mente y empresa en un solo tablero. Hoy es {diaSemanaHoy}.</p>
                    <button onClick={() => setPestana('dia')} className="mt-3 bg-white text-black text-xs font-bold px-4 py-2 rounded-full">Registrar mi día</button>
                  </div>
                  <svg width="90" height="50" viewBox="0 0 90 50" className="hidden sm:block opacity-80"><path d="M5 40 Q15 40 15 28 Q15 15 25 22 Q35 30 35 18 Q35 6 45 12 Q55 18 55 28 Q55 40 65 30 Q75 20 85 10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { t: 'Físico', d: `${datos.entrenos.length} entrenos · ${datos.readiness.suenoHrs} h sueño`, icono: Dumbbell, ir: 'fisico' },
                    { t: 'Mente', d: `${datos.proyectos.length} proyectos · ${datos.cursos.length} cursos`, icono: Brain, ir: 'mente' },
                    { t: 'Empresa', d: `Balance ${fmtMoneda(balance)}`, icono: Wallet, ir: 'empresa' },
                  ].map((c) => (
                    <button key={c.t} onClick={() => setPestana(c.ir)} className="bg-white rounded-[18px] border border-neutral-200 p-4 text-left hover:shadow-md transition">
                      <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center mb-2"><c.icono className="w-4 h-4" /></div>
                      <p className="font-bold text-sm">{c.t}</p>
                      <p className="text-xs text-neutral-500">{c.d}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] border border-neutral-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold">Tareas de hoy</h2>
                    <span className="text-xs text-neutral-500">{habitosHechos}/{datos.habitos.length} · {pctHabitos}%</span>
                  </div>
                  <form onSubmit={crearHabito} className="flex gap-2 mb-3">
                    <input value={habitoNuevo} onChange={(e) => setHabitoNuevo(e.target.value)} placeholder="Nueva tarea…" aria-label="Nueva tarea" className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm outline-none" />
                    <select value={habitoCat} onChange={(e) => setHabitoCat(e.target.value)} className="bg-neutral-100 rounded-xl px-2 text-xs">
                      <option value="fisico">Físico</option><option value="mente">Mente</option><option value="empresa">Empresa</option>
                    </select>
                    <button className="bg-black text-white rounded-xl px-3 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /></button>
                  </form>
                  <div className="space-y-2">
                    {datos.habitos.filter((h) => filtrar(h.titulo)).map((h) => (
                      <div key={h.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-100">
                        <button onClick={() => alternarHabito(h.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center ${h.completado ? 'bg-black border-black text-white' : 'border-neutral-300'}`}>
                          {h.completado && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm ${h.completado ? 'line-through text-neutral-400' : 'font-medium'}`}>{h.titulo}</p>
                          <p className="text-[11px] text-neutral-400 capitalize">{h.categoria}</p>
                        </div>
                        <button onClick={() => borrarHabito(h.id)} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {datos.habitos.length === 0 && <p className="text-sm text-neutral-400">Sin tareas. Crea la primera arriba.</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-[20px] border border-neutral-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm">Calendario</h3>
                    <div className="flex gap-1">
                      <button aria-label="Mes anterior" onClick={() => setCalMes((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }))} className="p-1 rounded-full hover:bg-neutral-100"><ChevronLeft className="w-4 h-4" /></button>
                      <button aria-label="Mes siguiente" onClick={() => setCalMes((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }))} className="p-1 rounded-full hover:bg-neutral-100"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 uppercase mb-2">{nombreMes}</p>
                  <div className="grid grid-cols-7 text-[10px] text-neutral-400 text-center mb-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => <span key={d}>{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {diasDelMes.map((d, i) => {
                      if (!d) return <span key={i} />;
                      const iso = `${calMes.y}-${String(calMes.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const tiene = fechasConRegistro.has(iso);
                      const esHoy = iso === hoyISO();
                      return (
                        <span key={i} className={`py-1.5 rounded-full relative ${esHoy ? 'bg-black text-white font-bold' : tiene ? 'bg-neutral-900/10 font-bold' : 'text-neutral-600'}`}>
                          {d}{tiene && !esHoy && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#111111] text-white rounded-[20px] p-5">
                  <h3 className="font-bold text-sm mb-3">Tu progreso</h3>
                  <div className="bg-white text-black rounded-2xl p-4 mb-3">
                    <p className="text-2xl font-black">{habitosHechos * 10 + datos.registrosDiarios.length * 5}</p>
                    <p className="text-xs text-neutral-500">Puntos por constancia</p>
                  </div>
                  <div className="bg-white text-black rounded-2xl p-4 mb-3">
                    <p className="font-bold">{Math.floor((datos.minutosFoco || 0) / 60)} h {(datos.minutosFoco || 0) % 60} min</p>
                    <p className="text-xs text-neutral-500">Tiempo de enfoque acumulado</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniSerie titulo="Sueño" valores={ultimosRegistros.map((r) => Number(r.suenoHrs) || 0)} unidad=" h" formato={(v) => `${v} h`} />
                    <MiniSerie titulo="Energía" valores={ultimosRegistros.map((r) => Number(r.energia) || 0)} unidad="%" formato={(v) => `${v}%`} />
                  </div>
                </div>

                {avisosSubs.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-4">
                    <p className="text-xs font-bold flex items-center gap-1 text-amber-800"><AlertTriangle className="w-4 h-4" />Pagos próximos</p>
                    {avisosSubs.map((s) => <p key={s.id} className="text-xs text-amber-800 mt-1">{s.nombre} · {fmtMoneda(s.monto)} · en {s.diasRestantes} días</p>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ MI DÍA ============ */}
          {pestana === 'dia' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-[20px] border border-neutral-200 p-5">
                <h2 className="font-bold mb-1">Registro diario</h2>
                <p className="text-xs text-neutral-500 mb-4">Un registro por día. Si repites fecha, se actualiza. Rutina de hoy: <b>{rutinaHoy?.tipo}</b>.</p>
                <form onSubmit={guardarRegistro} className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-500">Fecha</label>
                    <input type="date" value={registroForm.fecha} onChange={(e) => setRegistroForm({ ...registroForm, fecha: e.target.value })} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500 flex items-center gap-1"><Moon className="w-3 h-3" />Sueño: {registroForm.suenoHrs} h</label>
                      <input type="range" min="3" max="12" step="0.5" value={registroForm.suenoHrs} onChange={(e) => setRegistroForm({ ...registroForm, suenoHrs: e.target.value })} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 flex items-center gap-1"><Zap className="w-3 h-3" />Energía: {registroForm.energia}%</label>
                      <input type="range" min="0" max="100" step="5" value={registroForm.energia} onChange={(e) => setRegistroForm({ ...registroForm, energia: e.target.value })} className="w-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Ánimo</label>
                      <select value={registroForm.animo} onChange={(e) => setRegistroForm({ ...registroForm, animo: e.target.value })} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm">
                        <option>Muy bien</option><option>Bien</option><option>Normal</option><option>Bajo</option><option>Muy bajo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Entreno de hoy</label>
                      <input value={registroForm.entrenamiento} onChange={(e) => setRegistroForm({ ...registroForm, entrenamiento: e.target.value })} placeholder="Ej. Fuerza 45 min" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">Nota del día (acepta Markdown)</label>
                    <textarea value={registroForm.nota} onChange={(e) => setRegistroForm({ ...registroForm, nota: e.target.value })} rows={4} placeholder="¿Qué salió bien? ¿Qué hay que ajustar mañana?" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <button className="w-full bg-black text-white font-bold py-2.5 rounded-xl text-sm">Guardar registro</button>
                </form>
              </div>
              <div className="bg-white rounded-[20px] border border-neutral-200 p-5">
                <h2 className="font-bold mb-3">Historial ({datos.registrosDiarios.length})</h2>
                <div className="space-y-2 max-h-[560px] overflow-y-auto">
                  {datos.registrosDiarios.map((r) => (
                    <div key={r.id} className="border border-neutral-100 bg-neutral-50 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold">{r.fecha} · {r.animo}</p>
                        <button onClick={() => borrarRegistro(r.id)} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Sueño {r.suenoHrs} h · Energía {r.energia}% · Hábitos {r.habitos} · {r.entrenamiento}</p>
                      {r.nota && <div className="mt-2">{renderMarkdown(r.nota)}</div>}
                    </div>
                  ))}
                  {datos.registrosDiarios.length === 0 && <p className="text-sm text-neutral-400">Aún no hay registros. Guarda el primero.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ============ FÍSICO ============ */}
          {pestana === 'fisico' && (
            <div className="space-y-4">
              <div className="bg-[#111111] text-white rounded-[20px] p-5 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg">Físico · plantilla diaria</h2>
                  <p className="text-sm text-neutral-400">Hoy ({diaSemanaHoy}): {rutinaHoy?.tipo}</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1"><Moon className="w-4 h-4" />{datos.readiness.suenoHrs} h</span>
                  <span className="flex items-center gap-1"><Droplets className="w-4 h-4" />{datos.readiness.hidratacionL} L</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4" />{datos.readiness.energia}%</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm mb-3">Rutina de cada día (editable)</h3>
                  <div className="space-y-2 max-h-[480px] overflow-y-auto">
                    {DIAS_SEMANA.map((d) => (
                      <div key={d} className={`border rounded-xl p-3 ${d === diaSemanaHoy ? 'border-black bg-neutral-50' : 'border-neutral-100'}`}>
                        <div className="flex gap-2 mb-2">
                          <span className="text-xs font-bold w-24 shrink-0 pt-2">{d}{d === diaSemanaHoy && ' · hoy'}</span>
                          <input value={datos.rutinasSemanales[d]?.tipo || ''} onChange={(e) => actualizarRutina(d, 'tipo', e.target.value)} className="flex-1 bg-neutral-100 rounded-lg px-2 py-1.5 text-xs font-semibold" />
                        </div>
                        <textarea value={datos.rutinasSemanales[d]?.detalle || ''} onChange={(e) => actualizarRutina(d, 'detalle', e.target.value)} rows={3} className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-2 py-1.5 text-xs font-mono" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-[20px] border p-5">
                    <h3 className="font-bold text-sm mb-3">Registrar entreno</h3>
                    <form onSubmit={guardarEntreno} className="grid grid-cols-2 gap-2">
                      <select value={entrenoForm.tipo} onChange={(e) => setEntrenoForm({ ...entrenoForm, tipo: e.target.value })} className="bg-neutral-100 rounded-xl px-3 py-2 text-sm">
                        <option>Fuerza</option><option>Condicionamiento</option><option>Hipertrofia</option><option>Cardio</option><option>Movilidad</option>
                      </select>
                      <input type="number" value={entrenoForm.duracionMin} onChange={(e) => setEntrenoForm({ ...entrenoForm, duracionMin: e.target.value })} className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" placeholder="Min" />
                      <input value={entrenoForm.notas} onChange={(e) => setEntrenoForm({ ...entrenoForm, notas: e.target.value })} placeholder="Notas: ejercicios, cargas…" className="col-span-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                      <button className="col-span-2 bg-black text-white font-bold py-2 rounded-xl text-sm">Guardar entreno</button>
                    </form>
                    <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto">
                      {datos.entrenos.map((w) => (
                        <div key={w.id} className="flex justify-between items-center gap-2 bg-neutral-50 border rounded-xl px-3 py-2 text-xs">
                          <div className="flex-1"><p className="font-bold">{w.tipo} · {w.duracionMin} min</p><p className="text-neutral-500">{w.notas}</p></div>
                          <span className="text-neutral-400">{w.fecha}</span>
                          <button aria-label="Eliminar entreno" onClick={() => setDatos((p) => ({ ...p, entrenos: p.entrenos.filter((x) => x.id !== w.id) }))} className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      {datos.entrenos.length === 0 && <p className="text-xs text-neutral-400">Sin entrenos registrados.</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded-[20px] border p-5">
                    <h3 className="font-bold text-sm mb-3">Marcas y recuperación</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[['press', 'Press (kg)'], ['sentadilla', 'Sentadilla (kg)'], ['pesoMuerto', 'Peso muerto (kg)'], ['vo2', 'VO2 est.'], ['grasa', 'Grasa %']].map(([k, label]) => (
                        <div key={k}>
                          <label className="text-neutral-500">{label}</label>
                          <input type="number" value={datos.statsFisicos[k]} onChange={(e) => setDatos((p) => ({ ...p, statsFisicos: { ...p.statsFisicos, [k]: Number(e.target.value) } }))} className="w-full bg-neutral-100 rounded-lg px-2 py-1.5 font-bold" />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="text-neutral-500">Sueño hoy: {datos.readiness.suenoHrs} h</label>
                        <input type="range" min="3" max="12" step="0.5" value={datos.readiness.suenoHrs} onChange={(e) => setDatos((p) => ({ ...p, readiness: { ...p.readiness, suenoHrs: Number(e.target.value) } }))} className="w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ MENTE ============ */}
          {pestana === 'mente' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[20px] border p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <h2 className="font-bold flex items-center gap-2"><Timer className="w-4 h-4" />Enfoque · Pomodoro</h2>
                  <p className="text-xs text-neutral-500">{modo} · Pomodoro {pomodorosHoy + (modo === 'Enfoque' ? 1 : 0)} (ciclo {cicloActual}/4) · Hoy llevas {pomodorosHoy} · {(datos.minutosFoco || 0)} min acumulados</p>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className={`w-6 h-1.5 rounded-full ${((pomodorosHoy % 4) >= i || (pomodorosHoy % 4 === 0 && pomodorosHoy > 0 && i <= 4 && modo !== 'Enfoque')) ? 'bg-black' : (pomodorosHoy % 4) >= i ? 'bg-black' : 'bg-neutral-200'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">25 min enfoque → 5 descanso · cada 4 ciclos, descanso largo de 20 min. <button onClick={() => setPestana('metodos')} className="underline font-bold">Ver todos los métodos</button></p>
                </div>
                <p className="text-4xl font-black tabular-nums">{fmtTiempo(seg)}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setModo('Enfoque'); setSeg(25 * 60); setCorriendo(false); }} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold">25</button>
                  <button onClick={() => { setModo('Descanso'); setSeg(5 * 60); setCorriendo(false); }} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold">5</button>
                  <button onClick={() => { setModo('Descanso largo'); setSeg(20 * 60); setCorriendo(false); }} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold">20</button>
                  <button onClick={() => setCorriendo(!corriendo)} aria-label={corriendo ? 'Pausar temporizador' : 'Iniciar temporizador'} className="bg-black text-white p-2.5 rounded-full">{corriendo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                  <button onClick={() => setCorriendo(false)} aria-label="Detener temporizador" className="bg-neutral-100 p-2.5 rounded-full"><RotateCcw className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><FolderKanban className="w-4 h-4" />Proyectos</h3>
                  <form onSubmit={crearProyecto} className="grid grid-cols-2 gap-2 mb-3">
                    <input value={proyForm.nombre} onChange={(e) => setProyForm({ ...proyForm, nombre: e.target.value })} placeholder="Nombre del proyecto" className="col-span-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <input value={proyForm.stack} onChange={(e) => setProyForm({ ...proyForm, stack: e.target.value })} placeholder="Stack" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <select value={proyForm.estado} onChange={(e) => setProyForm({ ...proyForm, estado: e.target.value })} className="bg-neutral-100 rounded-xl px-2 text-sm">
                      <option>Idea</option><option>En curso</option><option>En pausa</option><option>Terminado</option>
                    </select>
                    <button className="col-span-2 bg-black text-white text-sm font-bold py-2 rounded-xl">Crear proyecto</button>
                  </form>
                  <div className="space-y-2">
                    {datos.proyectos.filter((p) => filtrar(p.nombre)).map((p) => (
                      <div key={p.id} className={`border rounded-xl p-3 ${selProyecto === p.id ? 'border-black' : 'border-neutral-100'}`}>
                        <div className="flex justify-between items-center">
                          <button onClick={() => setSelProyecto(selProyecto === p.id ? null : p.id)} className="text-left flex items-center gap-1 font-bold text-sm"><Pencil className="w-3 h-3" />{p.nombre}</button>
                          <button onClick={() => setDatos((d) => ({ ...d, proyectos: d.proyectos.filter((x) => x.id !== p.id) }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-[11px] text-neutral-500">{p.estado} · {p.stack} · {p.progreso}%</p>
                        <div className="h-1.5 bg-neutral-100 rounded-full mt-2"><div className="h-full bg-black rounded-full" style={{ width: `${p.progreso}%` }} /></div>
                        {selProyecto === p.id && (
                          <ProyectoEditor proyecto={p} onGuardar={guardarNotasProyecto} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4" />Cursos y apuntes</h3>
                  <form onSubmit={crearCurso} className="grid grid-cols-2 gap-2 mb-3">
                    <input value={cursoForm.titulo} onChange={(e) => setCursoForm({ ...cursoForm, titulo: e.target.value })} placeholder="Título del curso o libro" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <input value={cursoForm.categoria} onChange={(e) => setCursoForm({ ...cursoForm, categoria: e.target.value })} placeholder="Categoría" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <button className="col-span-2 bg-black text-white text-sm font-bold py-2 rounded-xl">Crear curso</button>
                  </form>
                  <div className="space-y-2">
                    {datos.cursos.filter((c) => filtrar(c.titulo)).map((c) => (
                      <div key={c.id} className={`border rounded-xl p-3 ${selCurso === c.id ? 'border-black' : 'border-neutral-100'}`}>
                        <div className="flex justify-between items-center">
                          <button onClick={() => setSelCurso(selCurso === c.id ? null : c.id)} className="text-left font-bold text-sm flex items-center gap-1"><Pencil className="w-3 h-3" />{c.titulo}</button>
                          <button onClick={() => setDatos((d) => ({ ...d, cursos: d.cursos.filter((x) => x.id !== c.id) }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-[11px] text-neutral-500">{c.categoria} · {c.progreso}%</p>
                        <div className="h-1.5 bg-neutral-100 rounded-full mt-2"><div className="h-full bg-black rounded-full" style={{ width: `${c.progreso}%` }} /></div>
                        {selCurso === c.id && (
                          <CursoEditor curso={c} onGuardar={guardarNotasCurso} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-500">Cada proyecto y curso guarda su propio documento Markdown. Úsalo como cuaderno: ideas, pasos, enlaces y 체크리스트 con - [ ].</p>
            </div>
          )}

          {/* ============ EMPRESA ============ */}
          {pestana === 'empresa' && (
            <div className="space-y-4">
              <div className="bg-[#111111] text-white rounded-[20px] p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">Empresa · {mesClave}</h2>
                  <p className="text-sm text-neutral-400">Balance: <b className={balance >= 0 ? 'text-emerald-300' : 'text-red-300'}>{fmtMoneda(balance)}</b></p>
                </div>
                <input type="month" value={mesClave} onChange={(e) => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, mesActual: e.target.value } }))} className="bg-white text-black rounded-xl px-3 py-2 text-sm" />
              </div>

              <div className="grid sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl border p-4"><p className="text-[11px] text-neutral-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" />INGRESOS</p><p className="font-black text-lg text-emerald-600">{fmtMoneda(totalIng)}</p></div>
                <div className="bg-white rounded-2xl border p-4"><p className="text-[11px] text-neutral-500 flex items-center gap-1"><TrendingDown className="w-3 h-3" />GASTOS</p><p className="font-black text-lg text-red-500">{fmtMoneda(totalGas)}</p></div>
                <div className="bg-white rounded-2xl border p-4"><p className="text-[11px] text-neutral-500 flex items-center gap-1"><CreditCard className="w-3 h-3" />SUSCRIPCIONES</p><p className="font-black text-lg">{fmtMoneda(totalSubs)}</p></div>
                <div className="bg-white rounded-2xl border p-4">
                  <p className="text-[11px] text-neutral-500">META {fmtMoneda(datos.finanzas.metaMensual)}</p>
                  <input type="number" value={datos.finanzas.metaMensual} onChange={(e) => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, metaMensual: Number(e.target.value) } }))} className="w-full bg-neutral-100 rounded-lg px-2 py-1 text-sm font-bold" />
                  <div className="h-1.5 bg-neutral-100 rounded-full mt-2"><div className="h-full bg-black rounded-full" style={{ width: `${Math.min(100, (totalIng / (datos.finanzas.metaMensual || 1)) * 100)}%` }} /></div>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border p-5">
                <h3 className="font-bold text-sm">Balance de los últimos 6 meses</h3>
                <p className="text-[11px] text-neutral-500 mb-2">Ingresos menos gastos por mes (sin suscripciones).</p>
                <BarrasMes datos={balancePorMes} />
              </div>

              {avisosSubs.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Avisos de pago</p>
                  {avisosSubs.map((s) => <p key={s.id} className="text-xs text-amber-800">• {s.nombre} ({fmtMoneda(s.monto)}) se cobra el día {s.diaPago} — faltan {s.diasRestantes} días.</p>)}
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm mb-3">Ingresos del mes</h3>
                  <form onSubmit={crearIngreso} className="space-y-2 mb-3">
                    <input type="date" value={ingForm.fecha} onChange={(e) => setIngForm({ ...ingForm, fecha: e.target.value })} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <input value={ingForm.concepto} onChange={(e) => setIngForm({ ...ingForm, concepto: e.target.value })} placeholder="Concepto" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <input type="number" value={ingForm.monto} onChange={(e) => setIngForm({ ...ingForm, monto: e.target.value })} placeholder="Monto" className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                      <button className="bg-black text-white px-4 rounded-xl text-sm font-bold">+</button>
                    </div>
                  </form>
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                    {ingresosMes.map((i) => (
                      <div key={i.id} className="flex justify-between text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                        <span><b>{i.concepto}</b> · {i.fecha}</span>
                        <span className="flex items-center gap-2 font-bold text-emerald-700">{fmtMoneda(i.monto)}
                          <button onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, ingresos: p.finanzas.ingresos.filter((x) => x.id !== i.id) } }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm mb-3">Gastos del mes</h3>
                  <form onSubmit={crearGasto} className="space-y-2 mb-3">
                    <input type="date" value={gasForm.fecha} onChange={(e) => setGasForm({ ...gasForm, fecha: e.target.value })} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <input value={gasForm.concepto} onChange={(e) => setGasForm({ ...gasForm, concepto: e.target.value })} placeholder="Concepto" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <select value={gasForm.categoria} onChange={(e) => setGasForm({ ...gasForm, categoria: e.target.value })} className="bg-neutral-100 rounded-xl px-2 text-xs">
                        <option>Comida</option><option>Transporte</option><option>Vivienda</option><option>Negocio</option><option>Salud</option><option>Otros</option>
                      </select>
                      <input type="number" value={gasForm.monto} onChange={(e) => setGasForm({ ...gasForm, monto: e.target.value })} placeholder="Monto" className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                      <button className="bg-black text-white px-4 rounded-xl text-sm font-bold">+</button>
                    </div>
                  </form>
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                    {gastosMes.map((g) => (
                      <div key={g.id} className="flex justify-between text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        <span><b>{g.concepto}</b> · {g.categoria} · {g.fecha}</span>
                        <span className="flex items-center gap-2 font-bold text-red-600">{fmtMoneda(g.monto)}
                          <button onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, gastos: p.finanzas.gastos.filter((x) => x.id !== g.id) } }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-1"><Clock className="w-4 h-4" />Suscripciones</h3>
                  <form onSubmit={crearSub} className="space-y-2 mb-3">
                    <input value={subForm.nombre} onChange={(e) => setSubForm({ ...subForm, nombre: e.target.value })} placeholder="Nombre (ej. Internet)" className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <input type="number" value={subForm.monto} onChange={(e) => setSubForm({ ...subForm, monto: e.target.value })} placeholder="Monto" className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                      <input type="number" min="1" max="31" value={subForm.diaPago} onChange={(e) => setSubForm({ ...subForm, diaPago: e.target.value })} title="Día de pago" className="w-20 bg-neutral-100 rounded-xl px-2 py-2 text-sm" />
                      <button className="bg-black text-white px-4 rounded-xl text-sm font-bold">+</button>
                    </div>
                  </form>
                  <div className="space-y-1.5">
                    {datos.finanzas.suscripciones.map((s) => (
                      <div key={s.id} className="flex justify-between items-center text-xs border rounded-xl px-3 py-2">
                        <span><b>{s.nombre}</b> · día {s.diaPago} · {fmtMoneda(s.monto)}</span>
                        <span className="flex gap-1">
                          <button onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, suscripciones: p.finanzas.suscripciones.map((x) => (x.id === s.id ? { ...x, activa: !x.activa } : x)) } }))} className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${s.activa ? 'bg-black text-white' : 'bg-neutral-100'}`}>{s.activa ? 'Activa' : 'Pausada'}</button>
                          <button onClick={() => setDatos((p) => ({ ...p, finanzas: { ...p.finanzas, suscripciones: p.finanzas.suscripciones.filter((x) => x.id !== s.id) } }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ MÉTODOS ============ */}
          {pestana === 'metodos' && (
            <div className="space-y-4">
              <div className="bg-[#111111] text-white rounded-[20px] p-5 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg">Métodos de productividad</h2>
                  <p className="text-sm text-neutral-400">10 técnicas aplicadas a tu día: tiempo, prioridad, entorno y energía.</p>
                </div>
                <div className="flex gap-4 text-xs items-center">
                  <span className="flex items-center gap-1"><Timer className="w-4 h-4" />{pomodorosHoy} pomodoros hoy</span>
                  <span className="flex items-center gap-1"><Target className="w-4 h-4" />{(datos.mits || []).filter((m) => m.fecha === hoyISO() && m.hecha).length}/3 objetivos</span>
                </div>
              </div>

              {/* 1. Pomodoro + 2. Time blocking */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Timer className="w-4 h-4" />1 · Técnica Pomodoro</h3>
                  <p className="text-xs text-neutral-500 mt-1">25 min enfoque → 5 descanso. Cada 4 pomodoros, descanso largo de 20 min.</p>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-4xl font-black tabular-nums">{fmtTiempo(seg)}</p>
                    <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`w-8 h-2 rounded-full ${(pomodorosHoy % 4) >= i || (pomodorosHoy > 0 && pomodorosHoy % 4 === 0) ? 'bg-black' : 'bg-neutral-200'}`} />)}</div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Estado: <b>{modo}</b> · Hoy: <b>{pomodorosHoy}</b> pomodoros</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setModo('Enfoque'); setSeg(25 * 60); setCorriendo(false); }} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold">25 enfoque</button>
                    <button onClick={() => { setModo('Descanso'); setSeg(5 * 60); setCorriendo(false); }} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold">5 descanso</button>
                    <button onClick={() => { setModo('Descanso largo'); setSeg(20 * 60); setCorriendo(false); }} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 font-bold">20 largo</button>
                    <button onClick={() => setCorriendo(!corriendo)} className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">{corriendo ? <><Pause className="w-3 h-3" />Pausar</> : <><Play className="w-3 h-3" />Empezar</>}</button>
                  </div>
                </div>

                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><CalendarClock className="w-4 h-4" />2 · Bloqueo de tiempo</h3>
                  <p className="text-xs text-neutral-500 mt-1">Bloques de 1.5 a 3 h para una sola categoría. Sin mezclar.</p>
                  <form onSubmit={(e) => { e.preventDefault(); if (!bloqueForm.titulo.trim()) return; setDatos((p) => ({ ...p, bloques: [...(p.bloques || []), { id: uid('b'), ...bloqueForm, fecha: hoyISO(), hecho: false }] })); setBloqueForm({ titulo: '', inicio: '09:00', fin: '10:30', categoria: 'mente' }); agregarLog('Bloque de tiempo creado.'); }} className="grid grid-cols-2 gap-2 mt-3">
                    <input value={bloqueForm.titulo} onChange={(e) => setBloqueForm({ ...bloqueForm, titulo: e.target.value })} placeholder="Ej. Estudiar capítulo 4" className="col-span-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <input type="time" value={bloqueForm.inicio} onChange={(e) => setBloqueForm({ ...bloqueForm, inicio: e.target.value })} className="bg-neutral-100 rounded-xl px-2 py-2 text-sm" />
                    <input type="time" value={bloqueForm.fin} onChange={(e) => setBloqueForm({ ...bloqueForm, fin: e.target.value })} className="bg-neutral-100 rounded-xl px-2 py-2 text-sm" />
                    <select value={bloqueForm.categoria} onChange={(e) => setBloqueForm({ ...bloqueForm, categoria: e.target.value })} className="bg-neutral-100 rounded-xl px-2 text-sm"><option value="fisico">Físico</option><option value="mente">Mente</option><option value="empresa">Empresa</option></select>
                    <button className="bg-black text-white text-sm font-bold py-2 rounded-xl">Añadir bloque</button>
                  </form>
                  <div className="space-y-1.5 mt-3 max-h-[190px] overflow-y-auto">
                    {(datos.bloques || []).filter((b) => b.fecha === hoyISO()).map((b) => (
                      <div key={b.id} className="flex items-center gap-2 text-xs border rounded-xl px-3 py-2">
                        <button onClick={() => setDatos((p) => ({ ...p, bloques: p.bloques.map((x) => (x.id === b.id ? { ...x, hecho: !x.hecho } : x)) }))} className={`w-4 h-4 rounded border flex items-center justify-center ${b.hecho ? 'bg-black text-white border-black' : ''}`}>{b.hecho && <Check className="w-3 h-3" />}</button>
                        <span className={`flex-1 ${b.hecho ? 'line-through text-neutral-400' : 'font-medium'}`}>{b.inicio}–{b.fin} · {b.titulo} <span className="text-neutral-400">({b.categoria})</span></span>
                        <button onClick={() => setDatos((p) => ({ ...p, bloques: p.bloques.filter((x) => x.id !== b.id) }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    {(datos.bloques || []).filter((b) => b.fecha === hoyISO()).length === 0 && <p className="text-xs text-neutral-400">Sin bloques hoy. Crea el primero (ideal: 2 bloques de 2 h).</p>}
                  </div>
                </div>
              </div>

              {/* 3. Rana + 4. MITs + 5. Pareto */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-[#111111] text-white rounded-[20px] p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Rabbit className="w-4 h-4" />3 · Cómete la rana</h3>
                  <p className="text-xs text-neutral-400 mt-1">Haz primero lo más difícil o aburrido. El resto del día se vuelve fácil.</p>
                  {datos.rana?.fecha === hoyISO() && datos.rana?.texto ? (
                    <div className="mt-3 bg-white text-black rounded-xl p-3">
                      <p className={`text-sm font-bold ${datos.rana.hecha ? 'line-through text-neutral-400' : ''}`}>{datos.rana.texto}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setDatos((p) => ({ ...p, rana: { ...p.rana, hecha: !p.rana.hecha } })); if (!datos.rana.hecha) agregarLog('Rana del día completada. Día ganado.'); }} className="flex-1 bg-black text-white text-xs font-bold py-2 rounded-lg">{datos.rana.hecha ? 'Reabrir' : '¡Rana completada!'}</button>
                        <button onClick={() => setDatos((p) => ({ ...p, rana: { texto: '', hecha: false, fecha: '' } }))} className="text-xs px-3 bg-neutral-100 rounded-lg">Cambiar</button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if (!ranaTexto.trim()) return; setDatos((p) => ({ ...p, rana: { texto: ranaTexto.trim(), hecha: false, fecha: hoyISO() } })); setRanaTexto(''); agregarLog('Rana del día definida.'); }} className="mt-3 flex gap-2">
                      <input value={ranaTexto} onChange={(e) => setRanaTexto(e.target.value)} placeholder="Mi tarea más dura de hoy…" className="flex-1 text-black rounded-xl px-3 py-2 text-sm" />
                      <button className="bg-white text-black text-xs font-bold px-3 rounded-xl">Fijar</button>
                    </form>
                  )}
                </div>

                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><ListChecks className="w-4 h-4" />4 · 3 objetivos del día</h3>
                  <p className="text-xs text-neutral-500 mt-1">Escríbelos en la mañana o la noche anterior. Solo 3, sí o sí.</p>
                  <form onSubmit={(e) => { e.preventDefault(); const hoy = (datos.mits || []).filter((m) => m.fecha === hoyISO()); if (!mitForm.trim() || hoy.length >= 3) return; setDatos((p) => ({ ...p, mits: [...(p.mits || []), { id: uid('m'), titulo: mitForm.trim(), hecha: false, fecha: hoyISO() }] })); setMitForm(''); }} className="flex gap-2 mt-3">
                    <input value={mitForm} onChange={(e) => setMitForm(e.target.value)} placeholder="Objetivo 1, 2 o 3…" className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                    <button className="bg-black text-white px-3 rounded-xl text-sm font-bold">+</button>
                  </form>
                  <div className="space-y-1.5 mt-3">
                    {(datos.mits || []).filter((m) => m.fecha === hoyISO()).map((m, i) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs border rounded-xl px-3 py-2">
                        <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                        <button onClick={() => setDatos((p) => ({ ...p, mits: p.mits.map((x) => (x.id === m.id ? { ...x, hecha: !x.hecha } : x)) }))} className={`w-4 h-4 rounded border flex items-center justify-center ${m.hecha ? 'bg-black text-white border-black' : ''}`}>{m.hecha && <Check className="w-3 h-3" />}</button>
                        <span className={`flex-1 ${m.hecha ? 'line-through text-neutral-400' : 'font-medium'}`}>{m.titulo}</span>
                        <button onClick={() => setDatos((p) => ({ ...p, mits: p.mits.filter((x) => x.id !== m.id) }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Star className="w-4 h-4" />5 · Regla 80/20</h3>
                  <p className="text-xs text-neutral-500 mt-1">Marca con ★ el 20% que más resultados da. Hazlo primero.</p>
                  <div className="space-y-1.5 mt-3 max-h-[220px] overflow-y-auto">
                    {datos.habitos.map((h) => (
                      <div key={h.id} className="flex items-center gap-2 text-xs border rounded-xl px-3 py-2">
                        <button onClick={() => setDatos((p) => ({ ...p, habitos: p.habitos.map((x) => (x.id === h.id ? { ...x, impacto: !x.impacto } : x)) }))} title="Alto impacto">
                          <Star className={`w-4 h-4 ${h.impacto ? 'fill-black text-black' : 'text-neutral-300'}`} />
                        </button>
                        <span className="flex-1 font-medium">{h.titulo}</span>
                        {h.impacto && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">80/20</span>}
                      </div>
                    ))}
                    {datos.habitos.length === 0 && <p className="text-xs text-neutral-400">Crea hábitos en Inicio para priorizarlos aquí.</p>}
                  </div>
                </div>
              </div>

              {/* 6. Eisenhower */}
              <div className="bg-white rounded-[20px] border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2"><LayoutGrid className="w-4 h-4" />6 · Matriz de Eisenhower</h3>
                    <p className="text-xs text-neutral-500">Hacer → urgente+importante · Programar → importante · Delegar → urgente · Eliminar → resto.</p>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); if (!eisenForm.titulo.trim()) return; setDatos((p) => ({ ...p, eisenhower: [...(p.eisenhower || []), { id: uid('e'), titulo: eisenForm.titulo.trim(), urgente: eisenForm.urgente, importante: eisenForm.importante, hecha: false }] })); setEisenForm({ titulo: '', urgente: false, importante: true }); }} className="flex gap-2">
                    <input value={eisenForm.titulo} onChange={(e) => setEisenForm({ ...eisenForm, titulo: e.target.value })} placeholder="Nuevo pendiente…" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm w-48" />
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={eisenForm.urgente} onChange={(e) => setEisenForm({ ...eisenForm, urgente: e.target.checked })} />Urgente</label>
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={eisenForm.importante} onChange={(e) => setEisenForm({ ...eisenForm, importante: e.target.checked })} />Importante</label>
                    <button className="bg-black text-white px-3 rounded-xl text-xs font-bold">+</button>
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
                      <p className="text-xs font-bold mb-2">{q.t}</p>
                      <div className="space-y-1">
                        {(datos.eisenhower || []).filter((t) => !!t.urgente === q.u && !!t.importante === q.i).map((t) => (
                          <div key={t.id} className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1.5 text-xs">
                            <button onClick={() => setDatos((p) => ({ ...p, eisenhower: p.eisenhower.map((x) => (x.id === t.id ? { ...x, hecha: !x.hecha } : x)) }))} className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${t.hecha ? 'bg-black text-white border-black' : ''}`}>{t.hecha && <Check className="w-2.5 h-2.5" />}</button>
                            <span className={`flex-1 ${t.hecha ? 'line-through text-neutral-400' : ''}`}>{t.titulo}</span>
                            <button onClick={() => setDatos((p) => ({ ...p, eisenhower: p.eisenhower.filter((x) => x.id !== t.id) }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Kanban */}
              <div className="bg-white rounded-[20px] border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2"><Columns3 className="w-4 h-4" />7 · Tablero Kanban</h3>
                    <p className="text-xs text-neutral-500">Mueve cada tarjeta con las flechas: pendiente → en proceso → completada.</p>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); if (!kanbanForm.titulo.trim()) return; setDatos((p) => ({ ...p, kanban: [...(p.kanban || []), { id: uid('k'), titulo: kanbanForm.titulo.trim(), categoria: kanbanForm.categoria, estado: 'pendiente' }] })); setKanbanForm({ titulo: '', categoria: 'mente' }); }} className="flex gap-2">
                    <input value={kanbanForm.titulo} onChange={(e) => setKanbanForm({ ...kanbanForm, titulo: e.target.value })} placeholder="Nueva tarjeta…" className="bg-neutral-100 rounded-xl px-3 py-2 text-sm w-48" />
                    <select value={kanbanForm.categoria} onChange={(e) => setKanbanForm({ ...kanbanForm, categoria: e.target.value })} className="bg-neutral-100 rounded-xl px-2 text-xs"><option value="fisico">Físico</option><option value="mente">Mente</option><option value="empresa">Empresa</option></select>
                    <button className="bg-black text-white px-3 rounded-xl text-xs font-bold">+</button>
                  </form>
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pendiente', t: 'Pendientes' },
                    { id: 'proceso', t: 'En proceso' },
                    { id: 'hecha', t: 'Completadas' },
                  ].map((col) => (
                    <div key={col.id} className="bg-neutral-50 border rounded-xl p-3">
                      <p className="text-xs font-bold mb-2">{col.t} ({(datos.kanban || []).filter((k) => k.estado === col.id).length})</p>
                      <div className="space-y-1.5">
                        {(datos.kanban || []).filter((k) => k.estado === col.id && filtrar(k.titulo)).map((k) => (
                          <div key={k.id} className="bg-white border rounded-lg p-2 text-xs">
                            <p className="font-medium">{k.titulo}</p>
                            <p className="text-[10px] text-neutral-400 capitalize">{k.categoria}</p>
                            <div className="flex justify-between mt-1">
                              <button onClick={() => setDatos((p) => ({ ...p, kanban: p.kanban.map((x) => (x.id === k.id ? { ...x, estado: x.estado === 'proceso' ? 'pendiente' : 'proceso' } : x)) }))} disabled={k.estado === 'pendiente'} className="text-[11px] px-2 py-0.5 bg-neutral-100 rounded-full disabled:opacity-30" aria-label="Mover tarjeta atrás">←</button>
                              <button onClick={() => setDatos((p) => ({ ...p, kanban: p.kanban.filter((x) => x.id !== k.id) }))} aria-label="Eliminar" className="text-neutral-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                              <button onClick={() => setDatos((p) => ({ ...p, kanban: p.kanban.map((x) => (x.id === k.id ? { ...x, estado: x.estado === 'pendiente' ? 'proceso' : 'hecha' } : x)) }))} disabled={k.estado === 'hecha'} className="text-[11px] px-2 py-0.5 bg-black text-white rounded-full disabled:opacity-30" aria-label="Mover tarjeta adelante">→</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8-10. Entorno y hábitos */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><BellOff className="w-4 h-4" />8 · Cero distracciones</h3>
                  <p className="text-xs text-neutral-500 mt-1">Actívalas al empezar un bloque de enfoque.</p>
                  {[['notif', 'Notificaciones silenciadas'], ['pestanas', 'Pestañas innecesarias cerradas'], ['archivos', 'Archivos centralizados (Drive / notas)']].map(([k, label]) => (
                    <button key={k} onClick={() => setDatos((p) => ({ ...p, sinDistracciones: { ...p.sinDistracciones, [k]: !p.sinDistracciones[k], fecha: hoyISO() } }))} className="w-full flex items-center gap-2 text-xs border rounded-xl px-3 py-2 mt-2">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${datos.sinDistracciones?.[k] ? 'bg-black text-white border-black' : ''}`}>{datos.sinDistracciones?.[k] && <Check className="w-3 h-3" />}</span>
                      <span className={datos.sinDistracciones?.[k] ? 'line-through text-neutral-400' : 'font-medium'}>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-white rounded-[20px] border p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Armchair className="w-4 h-4" />9 · Espacio de trabajo</h3>
                  <p className="text-xs text-neutral-500 mt-1">Limpio, con luz natural y silla cómoda evitan fatiga.</p>
                  {[['limpio', 'Escritorio limpio y ordenado'], ['luz', 'Buena luz (natural si es posible)'], ['silla', 'Silla cómoda y postura recta'], ['agua', 'Agua a la mano']].map(([k, label]) => (
                    <button key={k} onClick={() => setDatos((p) => ({ ...p, entorno: { ...p.entorno, [k]: !p.entorno[k], fecha: hoyISO() } }))} className="w-full flex items-center gap-2 text-xs border rounded-xl px-3 py-2 mt-2">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${datos.entorno?.[k] ? 'bg-black text-white border-black' : ''}`}>{datos.entorno?.[k] && <Check className="w-3 h-3" />}</span>
                      <span className={datos.entorno?.[k] ? 'line-through text-neutral-400' : 'font-medium'}>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-[#111111] text-white rounded-[20px] p-5">
                  <h3 className="font-bold text-sm flex items-center gap-2"><BatteryCharging className="w-4 h-4" />10 · Descansos y energía</h3>
                  <p className="text-xs text-neutral-400 mt-1">El cerebro consolida memoria con pausas y sueño. No los sacrifiques.</p>
                  <div className="bg-white text-black rounded-xl p-3 mt-3 text-xs">
                    <p>Sueño anoche: <b>{datos.readiness.suenoHrs} h</b> {datos.readiness.suenoHrs < 7 ? '· bajo, prioriza dormir hoy' : '· bien'}</p>
                    <p>Energía: <b>{datos.readiness.energia}%</b> · Pomodoros hoy: <b>{pomodorosHoy}</b></p>
                  </div>
                  <button onClick={() => { setModo('Descanso'); setSeg(5 * 60); setCorriendo(true); agregarLog('Pausa activa de 5 min iniciada.'); }} className="w-full mt-3 bg-white text-black text-xs font-bold py-2 rounded-xl">Tomar pausa de 5 min ahora</button>
                  <button onClick={() => setPestana('dia')} className="w-full mt-2 border border-white/20 text-xs font-bold py-2 rounded-xl">Registrar sueño en Mi día</button>
                </div>
              </div>
            </div>
          )}

          {/* ============ AJUSTES ============ */}
          {pestana === 'ajustes' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-[20px] border p-5 space-y-3">
                <h2 className="font-bold">Perfil</h2>
                <div>
                  <label className="text-xs text-neutral-500">Nombre / alias</label>
                  <input value={datos.perfil.alias} onChange={(e) => setDatos((p) => ({ ...p, perfil: { ...p.perfil, alias: e.target.value } }))} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Enfoque actual</label>
                  <input value={datos.perfil.titulo} onChange={(e) => setDatos((p) => ({ ...p, perfil: { ...p.perfil, titulo: e.target.value } }))} className="w-full bg-neutral-100 rounded-xl px-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-neutral-500">Tus datos viven en este navegador (localStorage). Expórtalos para cambiar de dispositivo.</p>
              </div>
              <div className="bg-white rounded-[20px] border p-5 space-y-3">
                <h2 className="font-bold">Respaldo</h2>
                <p className="text-xs text-neutral-500">
                  Último respaldo: <b>{datos.ultimoRespaldo || 'nunca'}</b>
                  {diasDesdeRespaldo !== null && diasDesdeRespaldo > 7 && (
                    <span className="text-amber-600 font-bold"> · hace {diasDesdeRespaldo} días, exporta uno nuevo</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={exportar} className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"><Download className="w-4 h-4" />Exportar JSON</button>
                  <label className="bg-neutral-100 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"><Upload className="w-4 h-4" />Importar<input type="file" accept=".json" onChange={importar} className="hidden" /></label>
                  <button onClick={() => { if (confirm('¿Borrar todo y empezar de cero?')) { localStorage.removeItem('RESETLY_DATA'); setDatos(ESTADO_INICIAL); } }} className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"><RefreshCw className="w-4 h-4" />Reiniciar</button>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-bold mb-1">Actividad reciente</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-neutral-500">
                    {datos.logs.map((l) => <p key={l.id}>[{l.hora}] {l.mensaje}</p>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <footer className="text-center text-[11px] text-neutral-400 mt-6 pb-4">Resetly © {new Date().getFullYear()} — constancia diaria: cuerpo, mente y empresa.</footer>
        </main>
      </div>
    </div>
  );
}

function MiniSerie({ titulo, valores, unidad, formato }) {
  const fmt = formato || ((v) => `${v}${unidad || ''}`);
  if (!valores || valores.length === 0) {
    return (
      <div className="bg-white text-black rounded-2xl p-4">
        <p className="text-xs font-bold">{titulo}</p>
        <p className="text-[11px] text-neutral-500 mt-1">Registra tu día para ver tu evolución.</p>
      </div>
    );
  }
  const W = 120, H = 36, P = 4;
  const min = Math.min(...valores), max = Math.max(...valores);
  const rango = max - min || 1;
  const pts = valores.map((v, i) => {
    const x = P + (i * (W - P * 2)) / Math.max(valores.length - 1, 1);
    const y = H - P - ((v - min) / rango) * (H - P * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const ultimo = valores[valores.length - 1];
  return (
    <div className="bg-white text-black rounded-2xl p-4">
      <p className="text-xs font-bold">{titulo}</p>
      <p className="text-xl font-black">{fmt(ultimo)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="graf w-full h-9 mt-1" role="img" aria-label={`${titulo}: ${fmt(ultimo)}`}>
        <polyline points={pts} className="linea" />
        {valores.map((v, i) => {
          const x = P + (i * (W - P * 2)) / Math.max(valores.length - 1, 1);
          const y = H - P - ((v - min) / rango) * (H - P * 2);
          return <circle key={i} cx={x} cy={y} r="2" className="punto" />;
        })}
      </svg>
      <p className="text-[10px] text-neutral-500">Últimos {valores.length} registros</p>
    </div>
  );
}

function BarrasMes({ datos }) {
  const conDatos = datos.some((d) => d.valor !== 0);
  if (!conDatos) {
    return <p className="text-xs text-neutral-400">Registra ingresos y gastos para ver tu balance por mes.</p>;
  }
  const W = 300, H = 110, baseY = 78;
  const maxAbs = Math.max(...datos.map((d) => Math.abs(d.valor)), 1);
  const ancho = W / datos.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="graf w-full" role="img" aria-label="Balance de los últimos 6 meses">
      <line x1="0" y1={baseY} x2={W} y2={baseY} className="rejilla" />
      {datos.map((d, i) => {
        const h = Math.max(4, (Math.abs(d.valor) / maxAbs) * 52);
        const x = i * ancho + ancho * 0.22;
        const y = d.valor >= 0 ? baseY - h : baseY;
        return (
          <g key={d.clave}>
            <rect x={x} y={y} width={ancho * 0.56} height={h} rx="3" fill={d.valor >= 0 ? '#16a34a' : '#dc2626'} />
            <text x={i * ancho + ancho / 2} y={H - 6} textAnchor="middle">{d.etiqueta}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ProyectoEditor({ proyecto, onGuardar }) {
  const [notas, setNotas] = useState(proyecto.notas || '');
  const [progreso, setProgreso] = useState(proyecto.progreso || 0);
  return (
    <div className="mt-3 grid md:grid-cols-2 gap-2 border-t pt-3">
      <div>
        <label className="text-[11px] text-neutral-500 font-bold">Documento Markdown</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={8} className="w-full bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl p-3 mt-1" placeholder="# Plan&#10;- [ ] Paso 1" />
        <div className="flex gap-2 mt-2 items-center">
          <input type="range" min="0" max="100" value={progreso} onChange={(e) => setProgreso(e.target.value)} className="flex-1" />
          <span className="text-xs font-bold">{progreso}%</span>
          <button onClick={() => onGuardar(proyecto.id, notas, progreso)} className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar</button>
        </div>
      </div>
      <div className="bg-neutral-50 border rounded-xl p-3">
        <p className="text-[11px] font-bold text-neutral-500 mb-2">VISTA PREVIA</p>
        {renderMarkdown(notas)}
      </div>
    </div>
  );
}

function CursoEditor({ curso, onGuardar }) {
  const [notas, setNotas] = useState(curso.notas || '');
  const [progreso, setProgreso] = useState(curso.progreso || 0);
  return (
    <div className="mt-3 grid md:grid-cols-2 gap-2 border-t pt-3">
      <div>
        <label className="text-[11px] text-neutral-500 font-bold">Apuntes Markdown</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={8} className="w-full bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl p-3 mt-1" placeholder="# Apuntes&#10;- idea clave" />
        <div className="flex gap-2 mt-2 items-center">
          <input type="range" min="0" max="100" value={progreso} onChange={(e) => setProgreso(e.target.value)} className="flex-1" />
          <span className="text-xs font-bold">{progreso}%</span>
          <button onClick={() => onGuardar(curso.id, notas, progreso)} className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar</button>
        </div>
      </div>
      <div className="bg-neutral-50 border rounded-xl p-3">
        <p className="text-[11px] font-bold text-neutral-500 mb-2">VISTA PREVIA</p>
        {renderMarkdown(notas)}
      </div>
    </div>
  );
}
