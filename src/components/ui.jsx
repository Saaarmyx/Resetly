import React from 'react';

// Mini render Markdown (seguro, sin dependencias)
export function renderMarkdown(txt) {
  if (!txt) return <p className="text-sm text-neutral-400">Sin notas todavía.</p>;
  const esc = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lineas = esc.split('\n');
  const els = [];
  let lista = [];
  const inline = (s) => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-neutral-100 px-1 rounded text-[12px]">$1</code>')
    .replace(/- \[x\]/g, '☑')
    .replace(/- \[ \]/g, '☐');
  const flushLista = () => {
    if (lista.length) {
      els.push(<ul key={`ul-${els.length}`} className="list-disc pl-5 space-y-1 text-sm text-neutral-700 my-2">{lista.map((t, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(t) }} />)}</ul>);
      lista = [];
    }
  };
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

export function Tarjeta({ className = '', children }) {
  return (
    <div className={`bg-white rounded-[20px] border border-neutral-200 p-5 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function TituloSeccion({ children, extra }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-sm flex items-center gap-2">{children}</h3>
      {extra}
    </div>
  );
}

// Serie simple con último valor destacado
export function MiniSerie({ titulo, valores, formato }) {
  const fmt = formato || ((v) => `${v}`);
  if (!valores || valores.length === 0) {
    return (
      <div className="bg-white text-black rounded-2xl p-4 border border-neutral-200">
        <p className="text-xs font-bold">{titulo}</p>
        <p className="text-[11px] text-neutral-500 mt-1">Registra tu día para ver tu evolución.</p>
      </div>
    );
  }
  const W = 120, H = 36, P = 4;
  const min = Math.min(...valores), max = Math.max(...valores);
  const rango = max - min || 1;
  const xy = (v, i) => {
    const x = P + (i * (W - P * 2)) / Math.max(valores.length - 1, 1);
    const y = H - P - ((v - min) / rango) * (H - P * 2);
    return [x, y];
  };
  const ultimo = valores[valores.length - 1];
  return (
    <div className="bg-white text-black rounded-2xl p-4 border border-neutral-200">
      <p className="text-xs font-bold">{titulo}</p>
      <p className="text-xl font-black">{fmt(ultimo)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="graf w-full h-9 mt-1" role="img" aria-label={`${titulo}: ${fmt(ultimo)}`}>
        <polyline points={valores.map((v, i) => xy(v, i).join(',')).join(' ')} className="linea" />
        {valores.map((v, i) => {
          const [x, y] = xy(v, i);
          return <circle key={i} cx={x} cy={y} r="2" className="punto" />;
        })}
      </svg>
      <p className="text-[10px] text-neutral-500">Últimos {valores.length} registros</p>
    </div>
  );
}

// Barras de balance mensual
export function BarrasMes({ datos }) {
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

// Gráfico de área doble: enfoque (min) vs puntos del día
export function AreaDoble({ dias, foco, puntos }) {
  const hayDatos = foco.some((v) => v > 0) || puntos.some((v) => v > 0);
  const W = 320, H = 130, P = 8;
  if (!hayDatos) return <p className="text-xs text-neutral-400">Completa pomodoros y registra tus días para ver la tendencia.</p>;
  const maxF = Math.max(...foco, 1), maxP = Math.max(...puntos, 1);
  const xyF = (v, i) => [P + (i * (W - P * 2)) / Math.max(foco.length - 1, 1), H - 22 - (v / maxF) * (H - 44)];
  const xyP = (v, i) => [P + (i * (W - P * 2)) / Math.max(puntos.length - 1, 1), H - 22 - (v / maxP) * (H - 44)];
  const lineaF = foco.map((v, i) => xyF(v, i).join(',')).join(' ');
  const lineaP = puntos.map((v, i) => xyP(v, i).join(',')).join(' ');
  const areaF = `${P},${H - 22} ${lineaF} ${W - P},${H - 22}`;
  return (
    <div>
      <div className="flex gap-4 text-[11px] text-neutral-500 mb-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#111111' }} />Enfoque (min)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#16a34a' }} />Puntos</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="graf w-full" role="img" aria-label="Tendencia de enfoque y puntos">
        <polygon points={areaF} fill="#111111" opacity="0.08" />
        <polyline points={lineaP} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        <polyline points={lineaF} className="linea" />
        {dias.map((d, i) => {
          if (dias.length > 10 && i % 2 === 1) return null;
          const x = P + (i * (W - P * 2)) / Math.max(dias.length - 1, 1);
          return <text key={d} x={x} y={H - 6} textAnchor="middle">{d.slice(8)}</text>;
        })}
      </svg>
    </div>
  );
}

// Barras dobles: sueño (h) vs energía (%) por día
export function BarrasDoble({ dias, sueno, energia }) {
  const hayDatos = sueno.length > 0;
  const W = 320, H = 130;
  if (!hayDatos) return <p className="text-xs text-neutral-400">Registra tu día para comparar sueño y energía.</p>;
  const maxS = 12, maxE = 100;
  const ancho = W / sueno.length;
  return (
    <div>
      <div className="flex gap-4 text-[11px] text-neutral-500 mb-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block graf-barra-a" />Sueño (h)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block graf-barra-b" />Energía (%)</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="graf w-full" role="img" aria-label="Sueño contra energía por día">
        {sueno.map((s, i) => {
          const e = energia[i] || 0;
          const hS = Math.max(3, (s / maxS) * (H - 30));
          const hE = Math.max(3, (e / maxE) * (H - 30));
          const x = i * ancho + ancho * 0.2;
          return (
            <g key={i}>
              <rect x={x} y={H - 18 - hS} width={ancho * 0.26} height={hS} rx="2" className="graf-barra-a" />
              <rect x={x + ancho * 0.3} y={H - 18 - hE} width={ancho * 0.26} height={hE} rx="2" className="graf-barra-b" />
              <text x={i * ancho + ancho / 2} y={H - 4} textAnchor="middle">{dias[i].slice(8)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Donut de Score 1–100 con desglose
export function Donut({ total, factores }) {
  const R = 44, C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative shrink-0">
        <svg width="130" height="130" viewBox="0 0 120 120" className="graf" role="img" aria-label={`Score Resetly ${total} de 100`}>
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="12" className="rejilla" opacity="0.35" />
          <circle cx="60" cy="60" r={R} fill="none" className="linea" strokeWidth="12"
            strokeDasharray={C} strokeDashoffset={C - (C * Math.min(100, Math.max(0, total))) / 100}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
          <text x="60" y="58" textAnchor="middle" style={{ fontSize: 26, fontWeight: 900 }} className="graf-num">{total}</text>
          <text x="60" y="74" textAnchor="middle">/ 100</text>
        </svg>
      </div>
      <div className="flex-1 w-full space-y-2">
        {factores.map(([nombre, valor]) => (
          <div key={nombre}>
            <div className="flex justify-between text-xs"><span className="font-medium">{nombre}</span><span className="font-bold">{valor}</span></div>
            <div className="h-1.5 bg-neutral-100 rounded-full mt-1"><div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${valor}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
