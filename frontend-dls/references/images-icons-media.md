# Imágenes, íconos y media

Las imágenes son lo que más pesa y lo que más mueve el layout. Esta guía es práctica; los umbrales de LCP/CLS y su diagnóstico están en la skill *frontend-dls-investigacion*, referencia de Web Vitals.

---

## 1. Imágenes

### Siempre
- **`width` y `height`** (o `aspect-ratio` en CSS): no fijan el tamaño de render, dan la **relación de aspecto** para que el navegador reserve la caja y no haya salto (CLS).
- **`alt`**: informativa → descripción de lo que aporta, no "imagen de…"; decorativa → `alt=""` (vacío, **no** ausente: sin el atributo algunos lectores leen el nombre del archivo). Si lleva un enlace, el `alt` describe el **destino**.
- **Texto en imágenes**: evitalo; si es inevitable, repetilo en el `alt` o en el cuerpo.

### Cargar lo correcto, cuando corresponde

```html
<!-- Hero / elemento LCP: nunca lazy, con prioridad -->
<img src="hero-1200.avif" width="1200" height="600" alt="…"
     fetchpriority="high" decoding="async">

<!-- Resto de imágenes: lazy, responsive -->
<img src="card-400.webp" srcset="card-400.webp 400w, card-800.webp 800w"
     sizes="(min-width: 60rem) 25vw, 100vw"
     width="400" height="300" alt="…" loading="lazy" decoding="async">
```

- **`loading="lazy"` nunca en el hero** ni en nada visible al cargar: es el error más caro. El auditor lo marca (`perf/lazy-on-likely-hero`, `perf/lazy-with-high-priority`).
- **`srcset` + `sizes`**: `sizes` describe el ancho **de render**; si lo omitís o lo escribís mal, el navegador elige la imagen equivocada.
- **`<picture>`** cuando cambia la composición (recorte distinto en móvil) o para ofrecer formatos alternativos.
- **Formatos**: WebP/AVIF para fotografías; SVG para íconos e ilustraciones planas; PNG solo si necesitás transparencia sin otro formato. Dejá un fallback razonable.
- **Compresión**: exportá al tamaño real de render × densidad (2×), no el original de la cámara.
- **Fondo (`background-image`)** no se carga con `lazy` ni sirve para contenido informativo (no tiene `alt`); usá `<img>` para lo que importa.

### Estados de una imagen
Cargando (reservá el espacio con color/skeleton del tamaño final) · **error** (un `alt` útil y un fondo neutro, no el ícono roto del navegador) · vacío (avatar con iniciales o ícono).

## 2. Íconos

- **SVG inline o sprite** (`<use href="#id">`); evitá fuentes de íconos (no se pueden dimensionar bien, fallan al no cargar y los lectores pueden leerlas).
- **Decorativo** (acompaña texto visible): `aria-hidden="true"` y `focusable="false"`.
- **Informativo y solo** (botón de ícono): el nombre va en el **botón** (`aria-label` o `<span class="sr-only">`), no en el SVG. El auditor marca `a11y/icon-button-without-label`.
- **Color con `currentColor`** (`fill="currentColor"`) para heredar el color del texto, el estado y el modo oscuro.
- **Tamaños de una escala** (16/20/24); el área táctil de un ícono accionable sigue siendo ≥ 44×44 aunque el dibujo mida 24.
- **Un solo set** de íconos con el mismo trazo y estilo.
- El ícono **no es el único portador de significado**: acompañalo con texto o `title`/tooltip accesible según el caso.

## 3. Video y audio

- `<video controls>` con controles nativos (accesibles por teclado). Si hacés controles propios, cumplí el patrón de teclado completo.
- **Subtítulos** (`<track kind="captions">`) y, para contenido relevante, **transcripción**. El audio sin transcripción excluye a quien no oye.
- **Sin autoplay con sonido.** Un autoplay silencioso (`muted`, `playsinline`) para video decorativo debe poder **pausarse** y respetar `prefers-reduced-motion` (no arrancar solo).
- **`poster`** con las mismas dimensiones para evitar saltos; `preload="metadata"` por defecto, `none` si hay muchos.
- Para videos embebidos de terceros: `<iframe>` con `title` descriptivo, `loading="lazy"` y `width`/`height` (o `aspect-ratio`) reservados.

## 4. Gráficos y datos

- Un gráfico no debe depender solo del color: patrones, etiquetas directas, formas.
- Ofrecé el **dato en tabla** o resumen de texto junto al gráfico (accesibilidad y respaldo).
- Dale al contenedor un nombre (`role="img"` + `aria-label` con la conclusión, o un `<figure>` con `<figcaption>`).

## 5. Fuentes (resumen)

`font-display: swap`, `.woff2`, self-hosted, `preload` con `crossorigin`, y métricas del fallback alineadas para que el swap no reflowee. Detalle y justificación: *frontend-dls-investigacion*, referencia de rendimiento.

## Checklist

- [ ] Toda `<img>` con `alt` correcto y `width`/`height` (o `aspect-ratio`).
- [ ] Hero: sin `lazy`, `fetchpriority="high"`. Resto: `lazy` + `srcset`/`sizes`.
- [ ] Formatos modernos y tamaño real de render.
- [ ] Íconos: SVG, decorativos `aria-hidden`, botones de ícono con nombre accesible.
- [ ] Video con subtítulos, sin autoplay sonoro, pausable.
- [ ] Gráficos con alternativa en texto/tabla y sin depender solo del color.
