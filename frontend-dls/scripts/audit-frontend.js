#!/usr/bin/env node
/**
 * Frontend DLS — Auditor estático
 *
 * Escanea HTML / CSS / JSX / TSX / Vue / Svelte y reporta violaciones concretas
 * de las reglas de la skill, con archivo:línea y sugerencia de arreglo.
 *
 *   node scripts/audit-frontend.js ./src
 *   node scripts/audit-frontend.js ./a.blade.php ./estilos.css ./vistas   # varias rutas (archivos o carpetas)
 *   node scripts/audit-frontend.js ./src --json
 *   node scripts/audit-frontend.js ./src --only=a11y,perf
 *   node scripts/audit-frontend.js ./src --quiet     # solo errores
 *   node scripts/audit-frontend.js ./src --only=slop # heurísticas "genérico/IA" (opt-in, solo warn)
 *   node scripts/audit-frontend.js ./src --all       # corrida por defecto + slop
 *
 * Exit code 1 si hay errores → sirve como paso de CI.
 *
 * ALCANCE: es un análisis de texto, no un parser ni un navegador. Detecta los
 * patrones que se repiten en code review; NO reemplaza a axe, Lighthouse ni a
 * probar con teclado y lector de pantalla. Puede tener falsos positivos: cada
 * hallazgo es una pregunta para verificar, no una sentencia.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

const EXTENSIONS = new Set(['.html', '.htm', '.css', '.scss', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.php', '.twig', '.erb']);
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.cache', 'vendor', '.svelte-kit']);
// Archivos donde los valores crudos son legítimos (son la definición de los tokens)
const TOKEN_FILE_PATTERN = /(tokens|theme|variables|palette|primitives|_vars|globals)\.(css|scss|ts|js)$/i;

const SEVERITY = { ERROR: 'error', WARN: 'warn' };

// ---------------------------------------------------------------------------
// Reglas
//
// Cada regla: { id, category, severity, applies(ext), pattern, message, fix,
//               skip(match, content, filePath) }
// El pattern se ejecuta sobre el contenido completo (flag g) y la línea se
// deriva del índice del match.
// ---------------------------------------------------------------------------

// .php cubre plantillas Blade (.blade.php); .twig y .erb, sus equivalentes.
// Se tratan como markup porque el HTML vive ahí adentro.
const MARKUP = ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.php', '.twig', '.erb'];
const STYLES = ['.css', '.scss', '.vue', '.svelte', '.astro'];
const SCRIPTS = ['.jsx', '.tsx', '.vue', '.svelte', '.astro'];
// Plantillas de servidor: Blade, Twig, ERB
const TEMPLATES = ['.php', '.twig', '.erb'];

const RULES = [
  // ---------------------------------------------------------------- a11y ---
  {
    id: 'a11y/no-positive-tabindex',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: MARKUP,
    pattern: /tabindex\s*=\s*["'{]?\s*[1-9]\d*/gi,
    message: 'tabindex positivo',
    fix: 'Reordena el foco de toda la página y garantiza bugs. Usá solo 0 (orden natural) o -1 (foco por script) y arreglá el orden en el DOM.',
  },
  {
    id: 'a11y/img-missing-alt',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: MARKUP,
    pattern: /<img\b(?![^>]*\balt\s*=)[^>]*>/gi,
    message: '<img> sin atributo alt',
    fix: 'Informativa → alt descriptivo. Decorativa → alt="" (vacío, no ausente: sin el atributo algunos lectores leen el nombre del archivo).',
  },
  {
    id: 'a11y/clickable-non-interactive',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: SCRIPTS,
    pattern: /<(div|span|li|td)\b[^>]*\bonClick\s*=/gi,
    message: 'elemento no interactivo con onClick',
    fix: 'No recibe foco, no responde a Enter/Space y no se anuncia. Usá <button type="button">; si es navegación, <a href>.',
    skip: (m) => /\brole\s*=/.test(m[0]) && /\btabIndex\s*=/i.test(m[0]),
  },
  {
    // Alpine.js (@click / x-on:click), Livewire (wire:click), HTMX (hx-get/post) y
    // onclick inline sobre elementos que no son interactivos.
    id: 'a11y/handler-on-non-interactive',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: [...MARKUP],
    pattern: /<(div|span|li|td|tr|p|i|article|section)\b[^>]*\s(?:@click|x-on:click|wire:click|onclick|hx-(?:get|post|put|delete|patch))\s*=/gi,
    message: 'elemento no interactivo con handler de click',
    fix: 'No recibe foco, no responde a Enter/Space y no se anuncia como accionable. Usá <button type="button">; si navega, <a href>. Si no hay alternativa, necesita role, tabindex="0" y handler de teclado.',
    skip: (m) => /\brole\s*=/.test(m[0]) && /\btabindex\s*=/i.test(m[0]),
  },
  {
    id: 'a11y/role-button-without-tabindex',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<[a-z]+\b[^>]*\brole\s*=\s*["']button["'][^>]*>/gi,
    message: 'role="button" sin tabindex',
    fix: 'role solo describe, no agrega comportamiento. Necesita tabindex="0" y handlers de Enter/Space — o mejor, un <button> real.',
    skip: (m) => /\btabindex\s*=/i.test(m[0]),
  },
  {
    id: 'a11y/icon-button-without-label',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    // <button ...> cuyo contenido es solo un svg/i/img y nada de texto
    pattern: /<button\b(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>\s*(?:<(?:svg|i|img|Icon)\b[\s\S]{0,400}?<\/(?:svg|i|Icon)>|<img\b[^>]*\/?>|\{[^}]*[Ii]con[^}]*\})\s*<\/button>/g,
    message: 'botón de solo ícono sin nombre accesible',
    fix: 'Agregá aria-label="…" o un <span class="sr-only">. Sin eso el lector de pantalla anuncia "botón" y nada más.',
  },
  {
    id: 'a11y/input-without-label',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<input\b(?![^>]*\btype\s*=\s*["'](?:hidden|submit|button|reset|image)["'])[^>]*>/gi,
    message: 'input posiblemente sin label asociado',
    fix: 'Todo input necesita <label for="id">. El placeholder no es un label: desaparece al escribir y tiene contraste bajo por diseño.',
    // Solo reportar si no tiene id (para el for), ni aria-label/labelledby
    skip: (m) => /\bid\s*=/.test(m[0]) || /\baria-label(ledby)?\s*=/i.test(m[0]),
  },
  {
    id: 'a11y/placeholder-as-label',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<input\b(?![^>]*\baria-label)[^>]*\bplaceholder\s*=[^>]*>/gi,
    message: 'input con placeholder: verificá que tenga <label for>',
    fix: 'El placeholder no es un label: desaparece al escribir. Confirmá que exista un <label for="…"> apuntando a este id.',
    // Solo los que SÍ tienen id: los que no lo tienen ya los reporta input-without-label
    skip: (m) => !/\bid\s*=/.test(m[0]),
  },
  {
    id: 'a11y/viewport-blocks-zoom',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: MARKUP,
    pattern: /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["'][^"']*(user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?)[^"']*["']/gi,
    message: 'el viewport bloquea el zoom',
    fix: 'Incumple WCAG 1.4.4 (Resize Text). Quitá user-scalable=no y maximum-scale: hay gente que necesita ampliar para leer.',
  },
  {
    id: 'a11y/html-without-lang',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: ['.html', '.htm'],
    pattern: /<html\b(?![^>]*\blang\s*=)[^>]*>/gi,
    message: '<html> sin atributo lang',
    fix: 'Sin lang el lector de pantalla pronuncia el texto con la fonética del idioma equivocado. Poné <html lang="es">.',
  },
  {
    id: 'a11y/focus-outline-removed',
    category: 'a11y',
    severity: SEVERITY.ERROR,
    exts: STYLES,
    pattern: /outline\s*:\s*(none|0)\b/gi,
    message: 'outline eliminado',
    fix: 'Si no hay un :focus-visible con un anillo de reemplazo en este archivo, quien navega por teclado queda sin saber dónde está (WCAG 2.4.7).',
    // No reportar si el archivo define un anillo de foco en algún lado
    skip: (m, content) => /:focus-visible[^{]*\{[^}]*(outline|box-shadow)\s*:\s*(?!none|0)/i.test(content),
  },
  {
    id: 'a11y/reduced-motion-kills-events',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: STYLES,
    pattern: /@media[^{]*prefers-reduced-motion[^{]*\{[\s\S]{0,600}?\banimation\s*:\s*none/gi,
    message: 'animation: none dentro de prefers-reduced-motion',
    fix: 'Con `none` el evento animationend nunca se dispara y los toasts/modales que dependen de él quedan colgados en el DOM. Usá animation-duration: 0.01ms.',
  },
  {
    id: 'a11y/dialog-without-name',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<dialog\b(?![^>]*\baria-label(?:ledby)?\s*=)[^>]*>/gi,
    message: '<dialog> sin nombre accesible',
    fix: 'Sin aria-labelledby (apuntando al título) o aria-label, el lector de pantalla anuncia "diálogo" y nada más.',
  },
  {
    id: 'a11y/aria-hidden-on-focusable',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<(?:button|a|input|select|textarea|summary)\b[^>]*\baria-hidden\s*=\s*["']?true["']?[^>]*>/gi,
    message: 'aria-hidden="true" sobre un elemento enfocable',
    fix: 'El elemento sigue recibiendo foco pero queda invisible para el lector de pantalla: foco "fantasma". Quitá aria-hidden, o sacalo del orden de tabulación (tabindex="-1" / disabled / inert).',
    // Legítimo cuando también se quita del orden de tabulación
    skip: (m) => /\btabindex\s*=\s*["']?-1/i.test(m[0]) || /\bdisabled\b/i.test(m[0]) || /\binert\b/i.test(m[0]),
  },
  {
    // Tailwind: outline-none (v3) / outline-none (v4, outline-style: none) sin reemplazo de foco
    id: 'a11y/tailwind-outline-none',
    category: 'a11y',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<[a-z][a-z0-9-]*\b[^>]*\b(?:focus(?:-visible)?:)?outline-none\b[^>]*>/gi,
    message: 'outline-none de Tailwind sin indicador de foco de reemplazo',
    fix: 'Quitar el outline deja sin foco visible a quien navega por teclado (WCAG 2.4.7). Agregá focus-visible:ring-2 / focus-visible:outline-*; en Tailwind v4 usá outline-hidden si querés conservar el outline en forced-colors.',
    skip: (m) => /\b(?:focus(?:-visible)?:)(?:ring|outline-(?!none))|\bring-\d/.test(m[0]),
  },

  // ---------------------------------------------------------------- perf ---
  {
    id: 'perf/img-without-dimensions',
    category: 'perf',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<img\b(?![^>]*\bwidth\s*=)[^>]*>/gi,
    message: '<img> sin width/height',
    fix: 'Sin dimensiones el navegador no puede reservar la caja y la página salta al cargar (CLS). Poné width y height, o aspect-ratio en CSS.',
    skip: (m) => /aspect-ratio/i.test(m[0]) || /\bclassName?\s*=\s*["'][^"']*aspect-/i.test(m[0]),
  },
  {
    id: 'perf/lazy-with-high-priority',
    category: 'perf',
    severity: SEVERITY.ERROR,
    exts: MARKUP,
    pattern: /<img\b[^>]*\bloading\s*=\s*["']lazy["'][^>]*\bfetchpriority\s*=\s*["']high["'][^>]*>|<img\b[^>]*\bfetchpriority\s*=\s*["']high["'][^>]*\bloading\s*=\s*["']lazy["'][^>]*>/gi,
    message: 'loading="lazy" junto con fetchpriority="high"',
    fix: 'Se contradicen: le pedís prioridad alta a algo que postergaste. Si es el elemento LCP, quitá lazy.',
  },
  {
    id: 'perf/lazy-on-likely-hero',
    category: 'perf',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<img\b[^>]*\b(?:src|className|class|alt)\s*=\s*["'][^"']*(hero|banner|cover|jumbotron|above-fold|masthead)[^"']*["'][^>]*\bloading\s*=\s*["']lazy["'][^>]*>/gi,
    message: 'loading="lazy" en lo que parece la imagen del hero',
    fix: 'Nunca difieras el elemento LCP: es exactamente la métrica que estás midiendo. Usá loading="eager" + fetchpriority="high".',
  },
  {
    id: 'perf/animating-layout-properties',
    category: 'perf',
    severity: SEVERITY.WARN,
    exts: STYLES,
    pattern: /transition\s*:\s*[^;{}]*\b(width|height|top|left|right|bottom|margin(?:-\w+)?|padding(?:-\w+)?)\b[^;{}]*;/gi,
    message: 'transición sobre una propiedad de layout',
    fix: 'width/height/top/left/margin fuerzan reflow en cada frame: se ve entrecortado y ensucia el CLS. Animá transform y opacity.',
  },
  {
    id: 'perf/will-change-always-on',
    category: 'perf',
    severity: SEVERITY.WARN,
    exts: STYLES,
    pattern: /will-change\s*:\s*(?!auto)[a-z-]+/gi,
    message: 'will-change declarado de forma permanente',
    fix: 'Cada capa promovida consume memoria de GPU. Activalo por JS justo antes de animar y quitalo al terminar.',
  },
  {
    id: 'perf/transition-all',
    category: 'perf',
    severity: SEVERITY.WARN,
    exts: STYLES,
    pattern: /transition(?:-property)?\s*:\s*[^;{}]*\ball\b[^;{}]*/gi,
    message: 'transition sobre all',
    fix: 'Anima cualquier propiedad que cambie, incluidas las de layout, y dispara transiciones inesperadas al agregar estilos. Listá solo lo que cambia (transition: opacity .2s, transform .2s).',
  },

  // --------------------------------------------------------------- tokens --
  {
    id: 'tokens/hardcoded-color',
    category: 'tokens',
    severity: SEVERITY.WARN,
    exts: STYLES,
    pattern: /(?:color|background(?:-color)?|border(?:-\w+)?-color|fill|stroke|box-shadow)\s*:\s*[^;{}]*?(#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\))/gi,
    message: 'color hardcodeado en vez de token',
    fix: 'Un hex en un componente no cambia con el tema: el día que agregues modo oscuro hay que auditar archivo por archivo. Usá var(--color-*).',
    skipFile: (filePath) => TOKEN_FILE_PATTERN.test(path.basename(filePath)),
    // rgb(0 0 0 / .5) en sombras y currentColor son aceptables
    skip: (m) => /transparent|currentColor/i.test(m[0]),
  },
  {
    id: 'tokens/off-grid-spacing',
    category: 'tokens',
    severity: SEVERITY.WARN,
    exts: STYLES,
    pattern: /\b(?:margin|padding|gap|row-gap|column-gap|inset)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?\s*:\s*([^;{}]+);/gi,
    message: 'espaciado fuera de la grilla de 4px',
    fix: 'Los valores sueltos rompen la alineación con todo lo demás y nadie recuerda después por qué era 13px. Usá var(--space-*).',
    skipFile: (filePath) => TOKEN_FILE_PATTERN.test(path.basename(filePath)),
    skip: (m) => {
      const value = m[1];
      if (/var\(|calc\(|auto|inherit|%|em\b|rem\b|ch\b|vh\b|vw\b/.test(value)) return true;
      const pxValues = [...value.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map(x => parseFloat(x[1]));
      if (pxValues.length === 0) return true;
      return pxValues.every(v => v % 4 === 0);   // 0, 4, 8, 12… pasan
    },
  },

  // -------------------------------------------------------------- markup ---
  {
    id: 'markup/button-without-type',
    category: 'markup',
    severity: SEVERITY.WARN,
    exts: [...SCRIPTS, ...TEMPLATES],
    pattern: /<button\b(?![^>]*\btype\s*=)[^>]*>/gi,
    message: '<button> sin atributo type',
    fix: 'Dentro de un <form> el default es submit: un botón "Cancelar" sin type="button" envía el formulario.',
  },
  {
    // Bootstrap: un modal necesita nombre accesible o el lector anuncia solo "diálogo"
    id: 'markup/modal-without-label',
    category: 'markup',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<div\b[^>]*\bclass\s*=\s*["'][^"']*\bmodal\b[^"']*["'](?![^>]*aria-labelledby)(?![^>]*aria-label)[^>]*>/gi,
    message: 'modal sin aria-labelledby / aria-label',
    fix: 'Sin nombre accesible el lector de pantalla anuncia "diálogo" y nada más. Apuntá aria-labelledby al id del título.',
    // Solo el contenedor raíz: "modal" como clase suelta, no "modal-dialog"/"modal-content"/"modal-body"
    skip: (m) => {
      const classAttr = /\bclass\s*=\s*["']([^"']*)["']/i.exec(m[0]);
      if (!classAttr) return true;
      return !classAttr[1].split(/\s+/).includes('modal');
    },
  },
  {
    id: 'markup/anchor-as-button',
    category: 'markup',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    pattern: /<a\b[^>]*\bhref\s*=\s*["'](?:#|javascript:void\(0\))["'][^>]*>/gi,
    message: '<a href="#"> usado como botón',
    fix: 'Si ejecuta una acción es un <button>. Un link falso ensucia la lista de enlaces del lector de pantalla y ofrece "abrir en pestaña nueva" para nada.',
  },

  // ------------------------------------------------------------ security ---
  {
    id: 'security/innerhtml-interpolation',
    category: 'security',
    severity: SEVERITY.ERROR,
    exts: [...SCRIPTS, '.js', '.ts', '.html'],
    pattern: /\.innerHTML\s*=\s*[`'"][^`'"]*\$\{|\.innerHTML\s*=\s*[^;]*\+/g,
    message: 'innerHTML con interpolación de variables',
    fix: 'Vector de XSS si el dato viene del usuario o del backend. Usá textContent, o createElement + append para armar el nodo.',
  },
  {
    id: 'security/blade-unescaped-output',
    category: 'security',
    severity: SEVERITY.WARN,
    exts: ['.php'],
    pattern: /\{!!\s*(?!\s*\$?\w*[Ss]vg)[^!]{1,120}?!!\}/g,
    message: 'salida Blade sin escapar {!! !!}',
    fix: 'Solo para HTML que controlás vos. Si el valor viene de la base o del usuario, usá {{ }} — escapa por defecto.',
  },
  {
    id: 'security/dangerously-set-html',
    category: 'security',
    severity: SEVERITY.WARN,
    exts: SCRIPTS,
    pattern: /dangerouslySetInnerHTML/g,
    message: 'dangerouslySetInnerHTML',
    fix: 'Solo con HTML que hayas sanitizado vos (DOMPurify). Si el contenido es texto, renderizalo como texto.',
  },

  // ---------------------------------------------------------------- slop ---
  // Heurísticas "genérico / hecho en piloto automático". SIEMPRE warn, NUNCA error,
  // y NO corren por defecto: se activan con --only=slop o --all. Un hallazgo es una
  // pregunta para verificar (evidencia "inferida"), no una norma. Se analizan con
  // los comentarios y los bloques <pre>/<code> enmascarados (stripComments).
  {
    id: 'slop/dead-link',
    category: 'slop',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    stripComments: true,
    pattern: /\bhref\s*=\s*(?:\{\s*)?(?:"(?:#|javascript:\s*void\(0\);?)?"|'(?:#|javascript:\s*void\(0\);?)?')/gi,
    message: 'enlace muerto (href vacío, "#" o javascript:void(0)) — heurística a verificar, no una norma',
    fix: 'Suele ser un placeholder olvidado. Es legítimo si es un ancla temporal durante el prototipado o un href progresivo que el JS reemplaza; si dispara una acción, usá <button type="button">.',
  },
  {
    id: 'slop/gradient-text',
    category: 'slop',
    severity: SEVERITY.WARN,
    exts: STYLES,
    stripComments: true,
    pattern: /\{[^{}]*background-clip\s*:\s*text[^{}]*\}/gi,
    message: 'texto con gradiente (background-clip: text) — heurística a verificar, no una norma',
    fix: 'Es un recurso muy repetido en diseños genéricos. Es legítimo si es parte de la identidad de marca, se usa una sola vez (ej. un titular) y mantiene contraste suficiente en cada punto del gradiente.',
    skip: (m) => !/gradient\s*\(/i.test(m[0]),
  },
  {
    id: 'slop/placeholder-content',
    category: 'slop',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    stripComments: true,
    pattern: /\blorem ipsum\b|\bjohn doe\b|\bacme\b/gi,
    message: 'contenido de relleno (lorem ipsum / John Doe / Acme) — heurística a verificar, no una norma',
    fix: 'Reemplazalo por contenido real o realista antes de entregar. Es legítimo en fixtures, seeds, storybooks, documentación o maquetas explícitamente marcadas como tales.',
  },
  {
    id: 'slop/generic-copy',
    category: 'slop',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    stripComments: true,
    pattern: />\s*(?:get started|learn more)\s*<|\bseamless(?:ly)?\b|\brevolucionari[oa]s?\b|\bpotenci[aá]\s+tu\b/gi,
    message: 'copy genérico ("Get Started", "Learn More", "Seamless", "Revolucionario", "Potenciá tu…") — heurística a verificar, no una norma',
    fix: 'Un CTA debería decir qué pasa al hacer clic ("Crear mi cuenta", "Ver precios del plan"). Es legítimo si coincide con el lenguaje de marca o con la convención del producto, y si el contexto circundante lo vuelve específico.',
  },
  {
    id: 'slop/emoji-icon',
    category: 'slop',
    severity: SEVERITY.WARN,
    exts: MARKUP,
    stripComments: true,
    pattern: /<(button|a)\b(?![^>]*\baria-label)[^>]*>\s*(?:[\p{Extended_Pictographic}️‍]\s*)+<\/\1>/giu,
    message: 'emoji como único contenido de <button>/<a> sin aria-label — heurística a verificar, no una norma',
    fix: 'Los emoji se ven distinto según el sistema y el lector los lee de forma impredecible. Preferí un ícono SVG con aria-label. Es legítimo si el emoji es el contenido (reacciones) y tiene nombre accesible.',
  },
];

// Categorías que NO corren en la corrida por defecto: solo con --only=<cat> o --all.
const OPT_IN_CATEGORIES = new Set(['slop']);

// Reemplaza por espacios (conservando saltos de línea y longitud) los comentarios y
// los bloques <pre>/<code>, para que los índices y las líneas no se muevan.
function maskNonCode(content) {
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  return content
    .replace(/<!--[\s\S]*?-->|\{\{--[\s\S]*?--\}\}|\/\*[\s\S]*?\*\/|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>/gi, blank)
    .replace(/(^|[\s;{}])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
}

// ---------------------------------------------------------------------------
// Motor
// ---------------------------------------------------------------------------

function walk(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function lineAt(content, index) {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

function auditFile(filePath, categories, includeAll = false) {
  const ext = path.extname(filePath).toLowerCase();
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const findings = [];

  for (const rule of RULES) {
    if (!rule.exts.includes(ext)) continue;
    if (categories && !categories.has(rule.category)) continue;
    if (!categories && !includeAll && OPT_IN_CATEGORIES.has(rule.category)) continue;
    if (rule.skipFile && rule.skipFile(filePath)) continue;

    const text = rule.stripComments ? maskNonCode(content) : content;
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    let guard = 0;
    while ((match = re.exec(text)) !== null && guard++ < 500) {
      if (match[0].length === 0) { re.lastIndex++; continue; }
      if (rule.skip && rule.skip(match, text, filePath)) continue;

      const snippet = content.slice(match.index, match.index + match[0].length).replace(/\s+/g, ' ').trim();
      findings.push({
        file: filePath,
        line: lineAt(content, match.index),
        rule: rule.id,
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        fix: rule.fix,
        snippet: snippet.length > 100 ? snippet.slice(0, 97) + '…' : snippet,
      });
    }
  }

  return findings.sort((a, b) => a.line - b.line);
}

// ---------------------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = s => c('31', s), yellow = s => c('33', s), dim = s => c('2', s),
      bold = s => c('1', s), green = s => c('32', s), cyan = s => c('36', s);

function report(findings, fileCount, quiet) {
  const shown = quiet ? findings.filter(f => f.severity === SEVERITY.ERROR) : findings;

  console.log(bold('\n  Frontend DLS — auditoría'));
  console.log(dim(`  ${fileCount} archivo${fileCount === 1 ? '' : 's'} analizado${fileCount === 1 ? '' : 's'}\n`));

  if (shown.length === 0) {
    console.log(green('  ✔ Sin hallazgos.\n'));
    console.log(dim('  Recordá: esto es análisis de texto. No reemplaza a axe, Lighthouse,'));
    console.log(dim('  ni a recorrer la interfaz con el teclado y un lector de pantalla.\n'));
    return;
  }

  const byFile = new Map();
  for (const f of shown) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  for (const [file, items] of byFile) {
    console.log(cyan(`  ${path.relative(process.cwd(), file)}`));
    for (const f of items) {
      const tag = f.severity === SEVERITY.ERROR ? red('error') : yellow(' warn');
      console.log(`    ${dim(String(f.line).padStart(5))}  ${tag}  ${f.message}  ${dim(f.rule)}`);
      console.log(`           ${dim(f.snippet)}`);
      console.log(`           ${dim('→')} ${f.fix}`);
    }
    console.log('');
  }

  const errors = findings.filter(f => f.severity === SEVERITY.ERROR).length;
  const warns = findings.length - errors;

  const byCategory = {};
  for (const f of findings) byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  const summary = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${v}`)
    .join('  ·  ');

  console.log(bold('  ─────────────────────────────────────────'));
  console.log(`  ${red(errors + ' error' + (errors === 1 ? '' : 'es'))}   ${yellow(warns + ' advertencia' + (warns === 1 ? '' : 's'))}`);
  console.log(dim(`  ${summary}\n`));
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const targets = args.filter(a => !a.startsWith('--'));
  const roots = targets.length > 0 ? targets : ['.'];

  const asJson = flags.includes('--json');
  const quiet = flags.includes('--quiet');
  const onlyFlag = flags.find(f => f.startsWith('--only='));
  const categories = onlyFlag ? new Set(onlyFlag.slice(7).split(',').map(s => s.trim())) : null;

  const missing = roots.filter(r => !fs.existsSync(r));
  if (missing.length > 0) {
    console.error(`No existe la ruta: ${missing.join(', ')}`);
    process.exit(2);
  }

  const files = [...new Set(roots.flatMap(r => (fs.statSync(r).isDirectory() ? walk(r) : [r])))];

  const includeAll = flags.includes('--all');
  const findings = files.flatMap(f => auditFile(f, categories, includeAll));
  const errors = findings.filter(f => f.severity === SEVERITY.ERROR).length;

  if (asJson) {
    console.log(JSON.stringify({
      filesScanned: files.length,
      errors,
      warnings: findings.length - errors,
      findings,
    }, null, 2));
  } else {
    report(findings, files.length, quiet);
  }

  process.exit(errors > 0 ? 1 : 0);
}

if (require.main === module) main();

module.exports = { auditFile, RULES };
