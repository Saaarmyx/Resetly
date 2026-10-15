// Utilidades, estado inicial, migración y métricas de Resetly.
// La persistencia sigue en localStorage bajo RESETLY_DATA.

export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const mesISO = () => hoyISO().slice(0, 7);
export const uid = (p) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
export const horaAhora = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const fmtMoneda = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`;
export const fmtTiempo = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const diaAnterior = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
};

export const ultimosNDias = (n) => {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    out.push(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
  }
  return out;
};

export const saludoSegunHora = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

export const RUTINA_DEFAULT = {
  Lunes: { tipo: '', detalle: '' },
  Martes: { tipo: '', detalle: '' },
  'Miércoles': { tipo: '', detalle: '' },
  Jueves: { tipo: '', detalle: '' },
  Viernes: { tipo: '', detalle: '' },
  'Sábado': { tipo: '', detalle: '' },
  Domingo: { tipo: '', detalle: '' },
};

export const ESTADO_INICIAL = {
  perfil: { alias: '', titulo: '', racha: 0 },
  habitos: [],
  registrosDiarios: [],
  rutinasSemanales: RUTINA_DEFAULT,
  entrenos: [],
  statsFisicos: { press: 0, sentadilla: 0, pesoMuerto: 0, vo2: 0, grasa: 0 },
  readiness: { suenoHrs: 0, hidratacionL: 0, proteina: 0, energia: 0 },
  proyectos: [],
  cursos: [],
  finanzas: {
    mesActual: mesISO(),
    metaMensual: 0,
    ingresos: [],
    gastos: [],
    suscripciones: [],
  },
  minutosFoco: 0,
  focoPorDia: {},
  notasRapidas: {},
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
  logs: [],
};

// Fusiona datos guardados/importados con los valores por defecto.
// Así un JSON incompleto o de una versión anterior nunca rompe la app.
export function normalizar(p) {
  const base = JSON.parse(JSON.stringify(ESTADO_INICIAL));
  if (!p || typeof p !== 'object' || Array.isArray(p)) return base;
  const out = { ...base, ...p };
  for (const k of ['perfil', 'readiness', 'statsFisicos', 'pomodoro', 'rana', 'sinDistracciones', 'entorno']) {
    out[k] = { ...base[k], ...((p[k] && typeof p[k] === 'object') ? p[k] : {}) };
  }
  out.finanzas = { ...base.finanzas, ...((p.finanzas && typeof p.finanzas === 'object') ? p.finanzas : {}) };
  if (!Array.isArray(out.finanzas.ingresos)) out.finanzas.ingresos = [];
  if (!Array.isArray(out.finanzas.gastos)) out.finanzas.gastos = [];
  if (!Array.isArray(out.finanzas.suscripciones)) out.finanzas.suscripciones = [];
  out.focoPorDia = p.focoPorDia && typeof p.focoPorDia === 'object' ? p.focoPorDia : {};
  out.notasRapidas = p.notasRapidas && typeof p.notasRapidas === 'object' ? p.notasRapidas : {};
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

export function cargarEstado() {
  try {
    const nuevo = localStorage.getItem('RESETLY_DATA');
    if (nuevo) return normalizar(JSON.parse(nuevo));
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
  return normalizar(null);
}

// Puntos del día: hábitos hechos + registro + entreno + enfoque
export function puntosDia(datos, fecha) {
  let p = 0;
  const r = datos.registrosDiarios.find((x) => x.fecha === fecha);
  if (r) {
    const m = /(\d+)\/(\d+)/.exec(r.habitos || '');
    p += (m ? Number(m[1]) * 10 : 0) + 5;
  }
  if (datos.entrenos.some((e) => e.fecha === fecha)) p += 15;
  p += Math.round((datos.focoPorDia?.[fecha] || 0) / 5);
  return p;
}

// Score Resetly 1–100: sueño 30%, entreno 25%, enfoque 25%, tareas 20%
export function scoreResetly(datos) {
  const dias = ultimosNDias(7);
  const regs = dias.map((f) => datos.registrosDiarios.find((r) => r.fecha === f)).filter(Boolean);
  const suenoAvg = regs.length ? regs.reduce((a, r) => a + (Number(r.suenoHrs) || 0), 0) / regs.length : 0;
  const sSueno = suenoAvg <= 0 ? 0 : (suenoAvg >= 7 && suenoAvg <= 9 ? 100 : Math.max(0, Math.round(100 - Math.abs(suenoAvg - 8) * 30)));
  const diasEntreno = new Set(datos.entrenos.map((e) => e.fecha));
  const sEntreno = Math.min(100, Math.round((dias.filter((f) => diasEntreno.has(f)).length / 4) * 100));
  const focoAvg = dias.reduce((a, f) => a + (datos.focoPorDia?.[f] || 0), 0) / 7;
  const sFoco = Math.min(100, Math.round((focoAvg / 100) * 100));
  const hab = datos.habitos || [];
  const sTar = hab.length ? Math.round((hab.filter((h) => h.completado).length / hab.length) * 100) : 0;
  const total = Math.round(sSueno * 0.3 + sEntreno * 0.25 + sFoco * 0.25 + sTar * 0.2);
  return {
    total,
    factores: [
      ['Sueño', sSueno],
      ['Entreno', sEntreno],
      ['Enfoque', sFoco],
      ['Tareas', sTar],
    ],
  };
}

// Sonido de aviso al terminar (WebAudio, sin archivos)
export function beep() {
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
}
