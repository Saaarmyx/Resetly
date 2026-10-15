import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  cargarEstado, normalizar, hoyISO, horaAhora, fmtTiempo, beep,
} from './lib/datos';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Palette from './components/Palette';
import HelpModal from './components/HelpModal';
import Inicio from './views/Inicio';
import MiDia from './views/MiDia';
import Fisico from './views/Fisico';
import Mente from './views/Mente';
import Metodos from './views/Metodos';
import Empresa from './views/Empresa';
import Ajustes from './views/Ajustes';

export default function App() {
  const [datos, setDatos] = useState(cargarEstado);
  const [pestana, setPestana] = useState('inicio');
  const [busqueda, setBusqueda] = useState('');
  const [paletteAbierta, setPaletteAbierta] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);

  // ---- Temporizador Pomodoro (25/5, largo de 20 cada 4 ciclos) ----
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
        const hoy = hoyISO();
        setDatos((p) => ({
          ...p,
          minutosFoco: (p.minutosFoco || 0) + 25,
          pomodoro: { hechos: nuevos, fecha: hoy },
          focoPorDia: { ...(p.focoPorDia || {}), [hoy]: ((p.focoPorDia || {})[hoy] || 0) + 25 },
        }));
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

  // ---- Persistencia ----
  useEffect(() => {
    try { localStorage.setItem('RESETLY_DATA', JSON.stringify(datos)); } catch { /* lleno */ }
  }, [datos]);

  const agregarLog = (mensaje) => {
    setDatos((p) => ({ ...p, logs: [{ id: `l_${Date.now()}`, hora: horaAhora(), mensaje }, ...p.logs].slice(0, 30) }));
  };

  // ---- Paleta de comandos global (Ctrl+K / Cmd+K) ----
  useEffect(() => {
    const teclas = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteAbierta((v) => !v);
      }
      if (e.key === 'Escape') {
        setPaletteAbierta(false);
        setAyudaAbierta(false);
      }
    };
    window.addEventListener('keydown', teclas);
    return () => window.removeEventListener('keydown', teclas);
  }, []);

  // ---- Derivados compartidos ----
  const subsActivas = datos.finanzas.suscripciones.filter((s) => s.activa);
  const avisosSubs = useMemo(() => {
    const diaHoy = new Date().getDate();
    return subsActivas.map((s) => {
      let diff = Number(s.diaPago) - diaHoy;
      if (diff < 0) diff += 30;
      return { ...s, diasRestantes: diff, urgente: diff <= 5 };
    }).filter((s) => s.urgente);
  }, [subsActivas]);
  const diasDesdeRespaldo = (() => {
    if (!datos.ultimoRespaldo) return null;
    return Math.floor((Date.now() - new Date(`${datos.ultimoRespaldo}T00:00:00`).getTime()) / 86400000);
  })();

  const buscar = (texto) => (busqueda ? texto.toLowerCase().includes(busqueda.toLowerCase()) : true);
  const esOscuro = datos.tema === 'oscuro';

  // ---- Acciones ----
  const iniciar = (m, min) => { setModo(m); setSeg(min * 60); setCorriendo(false); };
  const empezar = (m, min) => { setModo(m); setSeg(min * 60); setCorriendo(true); };
  const timer = {
    seg, corriendo, modo, pomodorosHoy, cicloActual, fmt: fmtTiempo,
    toggle: () => setCorriendo((c) => !c),
    detener: () => setCorriendo(false),
    iniciar, empezar,
    iniciar25: () => { if (corriendoRef.current) setCorriendo(false); else { setModo('Enfoque'); setSeg(25 * 60); setCorriendo(true); } },
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

  const salir = () => {
    if (!confirm('¿Terminar la sesión? Se detendrá el temporizador y volverás al inicio. Tus datos se conservan.')) return;
    setCorriendo(false);
    setPaletteAbierta(false);
    setAyudaAbierta(false);
    setBusqueda('');
    setPestana('inicio');
    agregarLog('Sesión terminada. Datos conservados.');
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex transition-colors duration-200 ${esOscuro ? 'resetly-oscuro bg-slate-950 text-slate-100' : 'bg-[#EFEFEF] text-neutral-900'}`}>
      <Sidebar pestana={pestana} go={setPestana} onAyuda={() => setAyudaAbierta(true)} onSalir={salir} />

      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8" aria-label="Contenido principal">
        <div className="max-w-[1200px] mx-auto space-y-4 pb-8">
          <Topbar
            pestana={pestana} go={setPestana}
            busqueda={busqueda} setBusqueda={setBusqueda}
            esOscuro={esOscuro} onTema={() => setDatos((p) => ({ ...p, tema: esOscuro ? 'claro' : 'oscuro' }))}
            onPalette={() => setPaletteAbierta(true)}
            nAvisos={avisosSubs.length} perfil={datos.perfil}
          />

          {pestana === 'inicio' && (
            <Inicio datos={datos} setDatos={setDatos} log={agregarLog} timer={timer} go={setPestana}
              avisosSubs={avisosSubs} diasDesdeRespaldo={diasDesdeRespaldo} />
          )}
          {pestana === 'dia' && <MiDia datos={datos} setDatos={setDatos} log={agregarLog} />}
          {pestana === 'fisico' && <Fisico datos={datos} setDatos={setDatos} log={agregarLog} />}
          {pestana === 'mente' && <Mente datos={datos} setDatos={setDatos} log={agregarLog} timer={timer} go={setPestana} buscar={buscar} />}
          {pestana === 'metodos' && <Metodos datos={datos} setDatos={setDatos} log={agregarLog} timer={timer} buscar={buscar} />}
          {pestana === 'empresa' && <Empresa datos={datos} setDatos={setDatos} log={agregarLog} avisosSubs={avisosSubs} />}
          {pestana === 'ajustes' && (
            <Ajustes datos={datos} setDatos={setDatos} exportar={exportar} importar={importar} diasDesdeRespaldo={diasDesdeRespaldo} />
          )}

          <footer className="text-center text-[11px] opacity-50 pt-2">
            Resetly © {new Date().getFullYear()} — constancia diaria: cuerpo, mente y empresa.
          </footer>
        </div>
      </main>

      <Palette
        abierta={paletteAbierta} onCerrar={() => setPaletteAbierta(false)} go={setPestana}
        onPomodoro={() => timer.toggle()} corriendo={corriendo}
        onTema={() => setDatos((p) => ({ ...p, tema: esOscuro ? 'claro' : 'oscuro' }))} esOscuro={esOscuro}
        onExportar={exportar} onAyuda={() => setAyudaAbierta(true)} onRegistrar={() => setPestana('dia')}
      />
      <HelpModal abierta={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} />
    </div>
  );
}
