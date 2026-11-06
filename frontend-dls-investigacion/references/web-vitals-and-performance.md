# Core Web Vitals & Rendimiento Frontend

Guía accionable basada en los estándares de **[web.dev](https://web.dev/)** para optimizar las tres métricas de Core Web Vitals y mantener interfaces fluidas.

> Última verificación: 2026-11-04 contra web.dev (umbrales de LCP, INP y CLS, y percentil 75). **INP reemplazó a FID** como Core Web Vital estable en 2024; web.dev indica que las definiciones y umbrales se mantienen estables y que los cambios se avisan con anticipación y en un ciclo anual. Los umbrales de TTFB, FCP y TBT de la tabla de diagnóstico son valores de referencia habituales que **no** se reverificaron en esta revisión: confirmalos en web.dev si los vas a citar.

---

## 1. Los umbrales

Se miden en el **percentil 75** de las cargas reales de usuarios, segmentado entre móvil y escritorio. Que te dé bien en tu máquina no significa nada: tu notebook y tu fibra no son el percentil 75.

| Métrica | Qué mide | Bueno | Necesita mejora | Malo |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | Velocidad de carga percibida | ≤ 2.5s | 2.5s – 4s | > 4s |
| **INP** (Interaction to Next Paint) | Capacidad de respuesta | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Estabilidad visual | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

**Métricas de diagnóstico** (no son Core Web Vitals, pero explican *por qué* falla una que sí lo es):

| Métrica | Para qué sirve | Referencia |
| :--- | :--- | :--- |
| **TTFB** | Latencia de servidor y red; techo del LCP. | ≤ 800ms |
| **FCP** | Primer píxel de contenido; detecta bloqueo de render. | ≤ 1.8s |
| **TBT** | Proxy de INP en laboratorio (Lighthouse). | ≤ 200ms |

### Laboratorio vs campo
- **Lab** (Lighthouse, DevTools): reproducible, sirve para iterar. **No puede medir INP ni CLS reales**, porque no hay usuario interactuando ni scrolleando.
- **Campo / RUM** (CrUX, `web-vitals` JS): lo que de verdad cuenta. Es la fuente que usa Google.

Optimizar solo contra Lighthouse lleva a ganar puntos sin mejorar la experiencia. Usá el lab para diagnosticar y el campo para decidir.

---

## 2. LCP ≤ 2.5s

El elemento LCP suele ser la imagen del hero, un `<h1>` grande o un video de cabecera. Empezá identificándolo — DevTools › Performance lo marca — porque optimizar cualquier otra cosa no mueve la métrica.

### Las 4 subpartes del LCP
Descomponer el LCP dice dónde está el tiempo, y en la mayoría de los sitios el cuello no es la imagen:

1. **TTFB** — respuesta del servidor.
2. **Load delay** — cuánto tarda el navegador en *descubrir* el recurso LCP.
3. **Load time** — descarga del recurso.
4. **Render delay** — desde que llegó hasta que se pinta.

El *load delay* suele ser el culpable oculto: si la imagen del hero la inyecta JavaScript después de hidratar, el navegador ni se entera de que existe hasta muy tarde. Que esté en el HTML inicial vale más que cualquier compresión.

### Imágenes LCP
```html
<!-- En el <head>, si el navegador no puede descubrirla temprano -->
<link rel="preload" as="image" href="/hero.avif" type="image/avif" fetchpriority="high">
```
```html
<picture>
  <source type="image/avif"
          srcset="/hero-640.avif 640w, /hero-1280.avif 1280w"
          sizes="(max-width: 768px) 100vw, 1200px">
  <source type="image/webp"
          srcset="/hero-640.webp 640w, /hero-1280.webp 1280w"
          sizes="(max-width: 768px) 100vw, 1200px">
  <img src="/hero-fallback.jpg"
       alt="Descripción del producto principal"
       width="1280" height="720"
       fetchpriority="high"
       decoding="async">
</picture>
```

**Nunca `loading="lazy"` en el hero.** Es el error más común y el más caro: le decís al navegador que postergue justo el recurso que define la métrica. `lazy` va únicamente en lo que está fuera del viewport inicial.

### Fuentes
- Self-hosting: evita una resolución DNS y una conexión TLS extra a otro dominio.
- `.woff2` con subsetting por `unicode-range` (cargar solo latín básico puede recortar el archivo a la mitad).
- `font-display: swap` para que el texto se vea desde el primer frame con la fuente del sistema.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` solo para la fuente del texto crítico. `crossorigin` es obligatorio incluso en el mismo origen; sin él, el navegador descarga la fuente dos veces.

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC;
}
```

---

## 3. INP ≤ 200ms

INP mide desde que el usuario interactúa hasta que el navegador pinta el siguiente frame. Tiene tres partes: **input delay** (el hilo estaba ocupado), **processing time** (tu handler) y **presentation delay** (render y pintado).

### Ceder el hilo en tareas largas
Cualquier tarea de más de 50ms bloquea la respuesta. Cortala y cedé el control:

```js
function yieldToMain() {
  if ('scheduler' in window && 'yield' in scheduler) return scheduler.yield();
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function handleFilterChange(items) {
  setIsFiltering(true);        // 1. feedback visual inmediato
  await yieldToMain();         //    dejá que el navegador lo pinte

  const processed = processLargeDataset(items);  // 2. trabajo pesado
  await yieldToMain();

  setFilteredItems(processed); // 3. resultado
  setIsFiltering(false);
}
```

El orden importa: pintar el feedback **antes** del trabajo pesado es lo que baja el INP, aunque el tiempo total sea el mismo.

### Evitar layout thrashing
Leer una propiedad geométrica después de escribir estilos fuerza un reflow sincrónico. En un bucle, uno por iteración:

```js
// ❌ Reflow forzado en cada vuelta
elements.forEach(el => {
  const width = el.offsetWidth;         // LECTURA (fuerza layout)
  el.style.width = width * 2 + 'px';    // ESCRITURA (lo invalida)
});

// ✅ Todas las lecturas, después todas las escrituras
const widths = elements.map(el => el.offsetWidth);
elements.forEach((el, i) => { el.style.width = widths[i] * 2 + 'px'; });
```
Disparan reflow: `offsetWidth/Height/Top`, `clientWidth/Height`, `scrollTop`, `getBoundingClientRect()`, `getComputedStyle()`.

### Otras causas frecuentes
- **Handlers en eventos de alta frecuencia** (`scroll`, `resize`, `input`, `mousemove`): usá debounce/throttle, o `IntersectionObserver`/`ResizeObserver` en vez de escuchar `scroll`.
- **Re-renders masivos en React**: memoizá, y para listas largas mostrá el feedback antes de recalcular (o usá `useTransition`).
- **Listeners de scroll bloqueantes**: marcalos `{ passive: true }`.
- **Trabajo de terceros**: analytics y chats suelen ser la causa real. Cargalos con `defer` o después del `load`.

---

## 4. CLS ≤ 0.1

Se acumula cuando un elemento visible se mueve sin que el usuario lo haya provocado.

### Reservar espacio siempre
```html
<img src="foto.jpg" width="800" height="600" alt="…">
```
Los atributos `width`/`height` no fijan el tamaño de render: le dan al navegador la relación de aspecto para reservar la caja antes de que la imagen llegue. Con CSS responsive (`width: 100%; height: auto`) siguen funcionando.

```css
.video-container { aspect-ratio: 16 / 9; inline-size: 100%; }
.ad-slot         { min-block-size: 250px; }  /* reservá antes de inyectar */
```

### Fuentes que mueven el texto
El *swap* de fuente de fallback a fuente web reflowea el texto si las métricas difieren. Alinealas:

```css
@font-face {
  font-family: 'Inter-Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}
body { font-family: 'Inter', 'Inter-Fallback', sans-serif; }
```

### Otras causas
- **Contenido inyectado arriba del fold**: banners de cookies, avisos, barras de promo. Reservá el espacio o mostralos como overlay sin empujar el layout.
- **Skeletons de tamaño distinto al contenido final** — el skeleton evita el shift solo si mide exactamente igual.
- **Animar `height`/`top`/`margin`**: cuenta como layout shift. Animá `transform`.
- **Fuentes de terceros o widgets** que se insertan al cargar.

---

## 5. Rendimiento de render y CSS

### `content-visibility`
Saltea el cálculo de layout y pintado de secciones fuera del viewport. Muy efectivo en páginas largas y feeds:

```css
.long-feed-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px; /* altura estimada: sin esto la barra de scroll salta */
}
```
No lo pongas en contenido que deba ser buscable con `Ctrl+F` en todo momento, ni en el contenido above-the-fold.

### Animaciones compuestas por GPU
- ✅ `transform` (translate, scale, rotate) y `opacity` — no disparan layout ni paint.
- ❌ En animaciones continuas: `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, `border-radius`, `filter` (costoso).
- Para simular sombra animada sin repintar, animá la `opacity` de un pseudo-elemento que ya tiene la sombra.
- `will-change` solo justo antes de animar y quitalo después: cada capa promovida consume memoria de GPU.

---

## 6. Presupuesto de JavaScript

En la mayoría de los sitios, el JS es el problema — no las imágenes.

- **Objetivo razonable**: < 150-200KB comprimidos de JS en la ruta crítica.
- **Code splitting por ruta** y `import()` dinámico para lo que no se usa en la primera pantalla (editores de texto, gráficos, date pickers, mapas).
- **Auditá el bundle** (`webpack-bundle-analyzer`, `vite-bundle-visualizer`) antes de optimizar a ciegas. Casi siempre aparece una librería de fechas entera importada para formatear un timestamp.
- `defer` para scripts propios; `async` solo si de verdad son independientes.
- **Terceros**: son el peor delincuente y el que menos se audita. Cada tag de analytics, chat o A/B testing suma bloqueo del hilo. Cargalos después del `load` y medí qué aporta cada uno.

---

## 7. Cómo medir

```bash
npx lighthouse https://tu-sitio.com --view          # lab
npx unlighthouse --site https://tu-sitio.com        # todo el sitio
```

En campo, con la librería oficial:
```js
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log); onINP(console.log); onCLS(console.log);
```

**Orden de trabajo**: medí en campo → identificá qué métrica falla → diagnosticá en lab qué subparte la causa → arreglá esa → volvé a medir. Optimizar sin medir primero suele mover la métrica equivocada.
