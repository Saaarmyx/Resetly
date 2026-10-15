# Resetly — tu sistema personal

Dashboard personal en español: **cuerpo, mente y empresa**. 100% local, sin cuentas ni servidores.

## Pestañas

- **Inicio:** centro de comando. Saludo dinámico, rana del día, pomodoro rápido, alertas, Score Resetly, tendencia 7–30 días, sueño vs energía, tareas y calendario con drawer por día.
- **Mi día:** registro diario (fecha, sueño, energía, ánimo, entreno, nota Markdown) con historial y racha real.
- **Físico:** plantilla de rutina Lun–Dom editable, registro de entrenos (con borrado), marcas y recuperación.
- **Mente:** temporizador Pomodoro por ciclos (25/5, largo de 20 cada 4, con sonido, título en pestaña y pausa automática), proyectos y cursos con documento Markdown propio.
- **Métodos:** las 10 técnicas aplicadas — Pomodoro, bloqueo de tiempo, rana del día, 3 objetivos, 80/20, Eisenhower, Kanban, cero distracciones, espacio de trabajo, descansos y energía.
- **Empresa:** mes seleccionable, ingresos/gastos del mes, suscripciones con avisos de pago, meta mensual y gráfico de balance de 6 meses.
- **Ajustes:** perfil, modo oscuro, respaldo JSON (con aviso si pasa >7 días) e historial de actividad.

## Uso

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # vista previa del build
```

## Datos

- Todo vive en `localStorage` clave `RESETLY_DATA` (incluye tema y fecha de último respaldo).
- **Importante:** es un solo navegador/dispositivo. Exporta tu JSON cada semana desde Ajustes.
- Importar valida la forma del archivo: un JSON ajeno no rompe la app.
- Migra automáticamente datos del formato anterior (`STARK_WAYNE_OS_DATA`).

## Publicar

Cualquier hosting estático (raíz del dominio):

- **Vercel:** importa el repo, framework `Vite`, listo.
- **Netlify:** build `npm run build`, publish `dist`.
- **Cloudflare Pages:** igual que Netlify.

## Estructura

```
index.html          # entrada (título, favicon, theme-color)
public/favicon.svg  # icono
src/main.jsx        # montaje + límite de errores
src/App.jsx               # layout full-screen, timer, paleta, estado global
src/lib/datos.js          # utils, estado inicial, normalizar, métricas
src/components/           # Sidebar, Topbar, Palette, HelpModal, Calendar, Editors, ui
src/views/                # Inicio, MiDia, Fisico, Mente, Metodos, Empresa, Ajustes
src/index.css             # Tailwind + foco visible + modo oscuro slate + gráficos
tailwind.config.js
vite.config.js
```

## Atajos y detalles

- **Ctrl+K / Cmd+K:** paleta de comandos (pestañas, temporizador, tema, exportar, ayuda). **Esc** cierra diálogos.
- El temporizador suena al terminar, muestra la cuenta en el título y se pausa si cambias de pestaña. Cada pomodoro suma a tu serie de enfoque para los gráficos.
- Modo oscuro: botón luna/sol en el encabezado, se guarda con tus datos.
- Accesibilidad: landmarks (`nav`/`main`), etiquetas en botones de icono y foco visible con teclado.
