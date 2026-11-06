# Accesibilidad Web — Checklist WCAG 2.2 AA

Requisitos indispensables de **WCAG 2.2 nivel AA**, más las guías de accesibilidad de Apple HIG y Material Design, en formato de verificación técnica.

> La accesibilidad no es una capa que se agrega al final. Retrofittearla sobre un árbol de `<div>` con listeners suele costar más que haber usado los elementos correctos desde el principio, y en muchos países además es una obligación legal.

> Última verificación: 2026-11-04 contra W3C/WAI (WCAG 2.2 y "What's New in WCAG 2.2").

## 0. Qué cambió en WCAG 2.2 (con su nivel)

WCAG 2.2 agregó nueve criterios. Estos seis son los que más aparecen en el día a día (nivel verificado en la norma):

| Criterio | Nivel | Qué exige |
| :--- | :--- | :--- |
| **2.4.11 Focus Not Obscured (Minimum)** | AA | El elemento enfocado queda al menos parcialmente visible (no lo tapan headers sticky, banners ni footers fijos). La versión *Enhanced* (2.4.12) es AAA |
| **2.5.7 Dragging Movements** | AA | Toda función que usa arrastre se puede hacer también con un único puntero sin arrastrar |
| **2.5.8 Target Size (Minimum)** | AA | Targets de al menos 24×24 px CSS, o cumplir una excepción (por ejemplo, espaciado suficiente alrededor) |
| **3.2.6 Consistent Help** | **A** | La ayuda o el contacto, si se repite en varias páginas, aparece en el mismo orden relativo |
| **3.3.7 Redundant Entry** | **A** | Lo ya ingresado en el mismo proceso se autocompleta o se puede elegir, no se vuelve a pedir |
| **3.3.8 Accessible Authentication (Minimum)** | AA | No se exige una prueba cognitiva (recordar una contraseña, resolver un puzzle) sin alternativa; permitir pegar y gestores de contraseñas cuenta como mecanismo válido |

Además, el criterio **4.1.1 Parsing se eliminó** en WCAG 2.2. Y **3.3.9 Accessible Authentication (Enhanced)** es AAA. Fuente: [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) y la [norma](https://www.w3.org/TR/WCAG22/).

---

## 1. Contraste de color (1.4.3, 1.4.11)

```
Texto normal (< 18pt / 24px):          ≥ 4.5 : 1
Texto grande (≥ 18pt, o 14pt bold):    ≥ 3.0 : 1
Componentes UI (bordes, íconos,
  indicadores de estado, anillo de foco): ≥ 3.0 : 1
```

**No se redondea el ratio antes de comparar**: 4.498:1 no cumple 4.5:1 (Understanding SC 1.4.3, W3C).

**El color nunca es el único portador de significado (1.4.1).** Si un input tiene error, no alcanza con pintar el borde de rojo: agregá ícono y texto explicativo. Lo mismo vale para gráficos (usá patrones o etiquetas además del color), estados en tablas y links dentro de párrafos (subrayado, no solo color).

**Trampas frecuentes:**
- Texto sobre imagen o gradiente: el contraste cambia según el píxel. Poné una capa semitransparente o un contenedor sólido detrás.
- Placeholder gris claro: suele quedar en 2.5:1. Si es información necesaria, no va como placeholder.
- Estados `disabled`: WCAG los exime formalmente, pero si el usuario tiene que leer qué está deshabilitado, hacelo legible igual.
- `opacity` sobre un color de marca: el resultado a menudo cae por debajo del mínimo. Usá un token dedicado con contraste verificado.

---

## 2. Foco y navegación por teclado (2.1.1, 2.4.3, 2.4.7, 2.4.11)

### Foco visible
```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

`:focus-visible` ya distingue solo entre teclado y mouse — **no agregues `:focus:not(:focus-visible) { outline: none }`**. Esa regla circulaba cuando el soporte era parcial; hoy es redundante y puede suprimir el foco en casos legítimos (por ejemplo, cuando un script mueve el foco programáticamente y el usuario necesita verlo).

Requisitos del anillo: contraste ≥ 3:1 contra el fondo adyacente, y grosor suficiente para verse. Un `outline-offset` positivo ayuda a que se distinga sobre bordes del mismo color.

**Foco no obscurecido (2.4.11, nivel AA, nuevo en WCAG 2.2)**: el elemento enfocado no puede quedar **completamente** tapado por headers sticky, barras de cookies o footers fijos (el nivel AA exige que quede al menos parcialmente visible; el 2.4.12, AAA, pide que se vea entero). Es un problema clásico: se tabula, el elemento recibe foco, la página scrollea… y queda justo debajo del header pegado. Apuntá a que se vea entero: se arregla con `scroll-margin-block-start` igual a la altura del header.

### Orden de foco
- Debe seguir el orden de lectura. Cuidado con `order` de flexbox y `grid-area`: cambian el orden visual pero no el del DOM, y eso desincroniza el tabulado.
- **Nunca uses `tabindex` positivo.** Un `tabindex="3"` reordena el foco de toda la página y garantiza un bug. Solo `0` (enfocable en orden natural) y `-1` (enfocable solo por script).

### Skip link
Para que quien navega por teclado no tenga que tabular 40 enlaces del navbar en cada página:

```html
<a href="#main" class="skip-link">Saltar al contenido principal</a>
```
```css
.skip-link {
  position: absolute;
  inset-block-start: -100px;
  inset-inline-start: var(--space-lg);
  z-index: 9999;
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: inset-block-start var(--motion-duration-fast);
}
.skip-link:focus-visible { inset-block-start: var(--space-lg); }
```

### Roving tabindex
En grupos de elementos relacionados (tabs, toolbars, menús), solo uno debe ser alcanzable con `Tab`; adentro se navega con flechas. Sin esto, un toolbar de 15 botones son 15 tabulaciones antes de llegar al contenido.

```js
function handleKeyDown(event, items, currentIndex) {
  let next = currentIndex;
  switch (event.key) {
    case 'ArrowRight': case 'ArrowDown': next = (currentIndex + 1) % items.length; break;
    case 'ArrowLeft':  case 'ArrowUp':   next = (currentIndex - 1 + items.length) % items.length; break;
    case 'Home': next = 0; break;
    case 'End':  next = items.length - 1; break;
    default: return;
  }
  event.preventDefault();
  items[currentIndex].setAttribute('tabindex', '-1');
  items[next].setAttribute('tabindex', '0');
  items[next].focus();
}
```

### Gestión del foco en overlays
- Al abrir un modal, el foco entra al modal (al primer elemento interactivo o al contenedor).
- Mientras está abierto, `Tab` circula solo dentro (el `<dialog>` nativo ya lo hace).
- Al cerrar, el foco **vuelve al elemento que lo abrió**. Si no, quien navega por teclado queda al principio del documento sin referencia de dónde estaba.

---

## 3. Nombres accesibles y ARIA

**La primera regla de ARIA es no usar ARIA.** `<button>` es mejor que `<div role="button" tabindex="0">` con handlers de `Enter` y `Space`. ARIA solo describe; no agrega comportamiento.

### Botones de solo ícono
```html
<button type="button" aria-label="Cerrar modal">
  <svg aria-hidden="true" width="20" height="20">…</svg>
</button>

<!-- o con texto oculto visualmente -->
<button type="button">
  <svg aria-hidden="true" width="20" height="20">…</svg>
  <span class="sr-only">Cerrar modal</span>
</button>
```
```css
.sr-only {
  position: absolute;
  inline-size: 1px; block-size: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
```
Los SVG decorativos siempre `aria-hidden="true"`, o se anuncian como ruido.

### Regiones vivas
- `aria-live="polite"` — anuncia cuando el lector termina lo que está diciendo: resultados de filtrado, "agregado al carrito", autoguardado.
- `aria-live="assertive"` / `role="alert"` — interrumpe: errores críticos, pérdida de conexión. Usalo poco; interrumpir constantemente es hostil.
- El contenedor debe existir en el DOM **antes** de insertarle contenido. Si creás el div y le ponés el texto en el mismo tick, muchos lectores no lo anuncian.

### Imágenes
- Informativa → `alt` que transmita la información, no que describa píxeles.
- Decorativa → `alt=""` (vacío, no ausente: sin el atributo, algunos lectores leen el nombre del archivo).
- Compleja (gráfico, diagrama) → descripción larga cerca o vía `aria-describedby`.
- Imagen dentro de un link sin texto → el `alt` es el nombre accesible del link, así que describí el destino, no la imagen.

---

## 4. Formularios (1.3.1, 3.3.1, 3.3.2, 4.1.3)

- Todo input con `<label for>`. El placeholder no es label.
- Agrupá radios y checkboxes relacionados en `<fieldset>` con `<legend>`.
- El mensaje de error vinculado con `aria-describedby` y el campo marcado con `aria-invalid="true"`.
- Al enviar con errores, movés el foco al primer campo con error (o a un resumen de errores arriba, enlazado a cada campo).
- **`autocomplete` con el token correcto** en los campos que recogen datos del usuario (`given-name`, `email`, `tel`, `current-password`, `one-time-code`…): es el criterio **1.3.5 Identify Input Purpose** (WCAG 2.1, nivel AA), no el 3.3.7. Con el atributo, navegadores y tecnologías asistivas saben para qué es cada campo.
- **Redundant Entry (3.3.7, nivel A, nuevo en 2.2)**: no le pidas al usuario información que ya dio antes en el mismo proceso; autocompletala o dejala elegir.
- **Accessible Authentication (3.3.8, nivel AA, nuevo en 2.2)**: no exijas resolver un puzzle cognitivo para iniciar sesión. Si hay CAPTCHA, ofrecé alternativa; permití pegar en el campo de contraseña y en el de código de verificación (bloquear el pegado rompe a los gestores de contraseñas).

---

## 5. Objetivos táctiles y gestos

- **Mínimo WCAG 2.2 AA (2.5.8 Target Size Minimum)**: `24×24px`, con excepciones si hay espaciado equivalente alrededor.
- **Recomendado Apple HIG / Material 3**: `44×44px` / `48×48dp`. Es el valor al que conviene apuntar: el mínimo de WCAG es un piso legal, no un objetivo de diseño.
- **Dragging Movements (2.5.7, nuevo en 2.2)**: toda acción que requiera arrastrar necesita una alternativa de un solo toque. Una lista reordenable por drag debe tener también botones de subir/bajar.
- **Sin gestos multipunto o de trazado obligatorios (2.5.1)**: si hay pinch-to-zoom o swipe, tiene que existir un control equivalente.

---

## 6. Preferencias del sistema

```css
/* Movimiento reducido — reducir, no eliminar (ver nota) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Alto contraste / forced colors (Windows) */
@media (forced-colors: active) {
  .btn-primary { border: 1px solid ButtonText; }
  .card        { border: 1px solid CanvasText; }
}
```

**Por qué `0.01ms` y no `animation: none`**: con `none` el evento `animationend` nunca se dispara, y la lógica de cierre de toasts y modales suele depender de él — el elemento queda colgado en el DOM justo para quien pidió menos movimiento. Con `0.01ms` la animación ocurre, termina de inmediato y el evento se dispara igual.

**En `forced-colors`**, el sistema reemplaza tus colores por la paleta del usuario. Las sombras y los fondos se descartan, así que un botón que se distinguía solo por su fondo desaparece: hace falta un borde explícito con colores de sistema (`ButtonText`, `CanvasText`, `Highlight`).

---

## 7. Contenido y estructura (1.3.1, 2.4.2, 3.1.1)

- `<html lang="es">` — sin esto el lector de pantalla pronuncia el español con fonética inglesa.
- `<title>` único y descriptivo por página, con lo específico primero: *"Carrito — Tienda"*, no *"Tienda — Carrito"*.
- Jerarquía de headings sin saltos; los headings son el índice con el que se navega sin ver.
- Texto de link con sentido fuera de contexto: "Leé más" repetido 20 veces no dice nada en la lista de enlaces de un lector de pantalla.
- Tablas de datos con `<th scope>` y `<caption>`.
- **Consistent Help (3.2.6, nuevo en 2.2)**: si hay ayuda o contacto, que esté en el mismo lugar en todas las páginas.

---

## 8. Cómo testear

**Automático** (detecta ~30-40% de los problemas — necesario, nunca suficiente):
```bash
npx @axe-core/cli https://tu-sitio.com
npx lighthouse https://tu-sitio.com --only-categories=accessibility --view
```
Extensión axe DevTools o WAVE en el navegador. Para React, `eslint-plugin-jsx-a11y` atrapa mucho en tiempo de escritura.

**Manual** (donde aparecen los problemas de verdad):
1. **Guardá el mouse** y recorré toda la página con `Tab`. ¿Se ve siempre dónde está el foco? ¿Se puede llegar a todo? ¿Se puede salir de todo?
2. **Zoom al 200%** (WCAG 1.4.4) y ancho de 320px: ¿se puede usar sin scroll horizontal?
3. **Lector de pantalla**: NVDA en Windows (gratis), VoiceOver en Mac (`Cmd+F5`). No hace falta ser experto: navegá por headings y por landmarks y fijate si la página se entiende.
4. **Simulá daltonismo** con las DevTools (Rendering › Emulate vision deficiencies).
5. **Modo alto contraste** de Windows.

Un patrón útil para revisar rápido: si podés completar la tarea principal del sitio solo con el teclado y sin mirar la pantalla más que de reojo, estás bastante bien.
