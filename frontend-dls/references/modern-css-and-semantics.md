# CSS Moderno y Semántica HTML

Características de CSS y HTML que simplifican el código, eliminan dependencias de JavaScript y mejoran la semántica. Todo lo de acá está disponible en los navegadores actuales (Baseline) salvo donde se indique.

---

## 0. Estructura semántica de una página

Antes de cualquier CSS: el esqueleto correcto. Los landmarks permiten a los lectores de pantalla saltar directo a una sección, que es como se navega de verdad cuando no se ve la pantalla.

```html
<body>
  <a href="#main" class="skip-link">Saltar al contenido principal</a>

  <header>
    <nav aria-label="Principal"> … </nav>
  </header>

  <main id="main">
    <h1>Título único de la página</h1>
    <article>
      <h2>Sección</h2>
      <section aria-labelledby="sub">
        <h3 id="sub">Subsección</h3>
      </section>
    </article>
    <aside aria-label="Contenido relacionado"> … </aside>
  </main>

  <footer> … </footer>
</body>
```

**Reglas que se rompen seguido:**
- Un solo `<h1>` por página; sin saltar niveles (`h2` → `h4` desorienta a quien navega por headings).
- Si hay más de un `<nav>`, cada uno con su `aria-label`.
- `<section>` necesita nombre accesible (`aria-labelledby` o un heading) para contar como landmark; si no, usá `<div>`.
- `<article>` = contenido autocontenido y redistribuible (un post, una card de producto), no "cualquier bloque".
- `<button>` para acciones, `<a href>` para navegación. Siempre.

### Elementos nativos que ahorran JavaScript

| Elemento | Reemplaza a | Qué te da gratis |
| :--- | :--- | :--- |
| `<dialog>` + `showModal()` | librería de modales | Focus trap, `::backdrop`, `Escape`, top layer |
| `<details>/<summary>` | acordeón con JS | Toggle, estado, accesibilidad, `Ctrl+F` encuentra el contenido cerrado |
| `[popover]` | dropdown con JS | Cierre al click afuera, top layer, sin `z-index` |
| `<datalist>` | autocomplete simple | Sugerencias nativas |
| `<progress>` / `<meter>` | barras con `div` | Semántica y anuncio correctos |
| `<output>` | `div` de resultado | Región viva implícita |

---

## 1. Container Queries (`@container`)

Un componente que responde al **ancho de su contenedor**, no al del viewport. Es la respuesta correcta al problema real: la misma card se ve distinta en un sidebar de 320px que en un main de 900px, y el viewport es idéntico en ambos casos.

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

.product-card { display: flex; flex-direction: column; gap: var(--space-md); }

@container card (min-width: 450px) {
  .product-card { flex-direction: row; align-items: center; }
}
```

Reservá las media queries para el layout de página (cuántas columnas tiene la grilla) y usá container queries para los componentes que van adentro. Así el componente es verdaderamente portátil: se puede mover a cualquier slot sin clases modificadoras.

**Unidades de contenedor**: `cqi` (inline size), `cqb`, `cqmin`, `cqmax` — útiles para tipografía que escala con el contenedor: `font-size: clamp(1rem, 5cqi, 2rem)`.

---

## 2. Subgrid

Resuelve el problema clásico de alinear títulos, cuerpos y botones entre cards adyacentes con texto de distinta longitud:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}
.card-grid .card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;   /* [título] [cuerpo] [acciones] */
}
```
Ahora los botones de todas las cards quedan alineados aunque los títulos ocupen una o dos líneas — sin alturas fijas ni JavaScript.

---

## 3. Propiedades lógicas

Reemplazan las físicas y se adaptan solas a la dirección de escritura (LTR/RTL) y al modo vertical. Adoptarlas de entrada cuesta lo mismo que las físicas; retrofittear un sitio entero a RTL después, no.

| Física | Lógica |
| :--- | :--- |
| `margin-left` / `margin-right` | `margin-inline-start` / `-end`, o `margin-inline` |
| `padding-top` / `padding-bottom` | `padding-block-start` / `-end`, o `padding-block` |
| `left: 0; right: 0; top: 0; bottom: 0` | `inset: 0` |
| `border-bottom` | `border-block-end` |
| `width` / `height` | `inline-size` / `block-size` |
| `text-align: left` | `text-align: start` |

---

## 4. `:has()` — el selector "padre"

Permite estilar un contenedor según su contenido o el estado de sus hijos. Elimina un montón de clases condicionales manejadas desde JS:

```css
/* Card con imagen: distinto padding en el cuerpo */
.article-card:has(img) .article-body { padding-block-start: var(--space-sm); }

/* Formulario con un inválido enfocado */
.form-card:has(input:invalid:focus) { border-color: var(--color-error); }

/* Label de un checkbox marcado */
.option:has(input:checked) { background: var(--color-primary-container); }

/* Ocultar un contenedor que quedó sin hijos visibles */
.toolbar:not(:has(> *:not([hidden]))) { display: none; }
```

---

## 5. Modales, popovers y transiciones nativas

### `<dialog>`
```html
<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">¿Confirmar acción?</h2>
  <p>Esta acción no se puede deshacer.</p>
  <form method="dialog">
    <button value="cancel">Cancelar</button>
    <button value="confirm" class="btn-primary">Aceptar</button>
  </form>
</dialog>
```
```js
document.getElementById('confirm').showModal();
```
`method="dialog"` cierra el diálogo al enviar y deja el `value` del botón en `dialog.returnValue`.

### Popover API
```html
<button popovertarget="options">Opciones</button>
<div id="options" popover>Contenido flotante gestionado por el navegador.</div>
```
Sin JavaScript: el navegador maneja apertura, cierre al hacer click afuera, `Escape` y el apilado en el top layer.

### `@starting-style` — animar desde `display: none`
Históricamente había que hacer malabares con `setTimeout` para animar la entrada de algo que empieza oculto. Ya no:

```css
dialog[open] {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.25s, transform 0.25s, overlay 0.25s allow-discrete, display 0.25s allow-discrete;

  @starting-style {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
}

dialog::backdrop {
  background-color: rgb(0 0 0 / 0.5);
  transition: background-color 0.25s, overlay 0.25s allow-discrete, display 0.25s allow-discrete;
  @starting-style { background-color: rgb(0 0 0 / 0); }
}
```
`allow-discrete` es lo que permite que `display` y `overlay` participen de la transición en vez de cambiar de golpe.

---

## 6. Color moderno

### `light-dark()`
Define ambos temas en una sola declaración; requiere `color-scheme`:

```css
:root {
  color-scheme: light dark;
  --color-surface: light-dark(#ffffff, #0f172a);
  --color-on-surface: light-dark(#0f172a, #f8fafc);
}
```
Reduce a la mitad el archivo de tokens. La contra: para un toggle manual seguís necesitando cambiar `color-scheme` en el elemento raíz (`[data-theme="dark"] { color-scheme: dark; }`). La plantilla de [design-tokens.css](../examples/design-tokens.css) usa el enfoque de bloques duplicados por máxima compatibilidad y explica cómo migrar a este.

### `oklch()`
Luminosidad perceptualmente uniforme: bajar 7% de L da el mismo salto visual en cualquier tono, cosa que con HSL no pasa (un amarillo y un azul al mismo `L` de HSL se ven con brillos completamente distintos). Eso hace que generar escalas accesibles sea aritmética en vez de prueba y error.

```css
:root {
  --brand-primary:       oklch(55% 0.22 250);
  --brand-primary-hover: oklch(48% 0.22 250);
  --brand-surface:       oklch(98% 0.01 250);
}
```

### `color-mix()`
```css
.btn:hover { background: color-mix(in oklab, var(--color-primary) 85%, black); }
.overlay   { background: color-mix(in srgb, var(--color-surface) 80%, transparent); }
```
Deriva estados a partir de un token en vez de definir un token nuevo por cada variación.

---

## 7. Tipografía y layout fluidos

```css
/* Escala fluida sin breakpoints: mínimo, preferido, máximo */
h1 { font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem); }

/* Ancho de lectura cómodo */
.prose { max-inline-size: 65ch; }

/* Evita títulos con una palabra huérfana en la última línea */
h1, h2, h3 { text-wrap: balance; }
.prose p   { text-wrap: pretty; }

/* Grilla responsive sin una sola media query */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--space-lg);
}
```

El `min(280px, 100%)` es importante: sin él, en pantallas más angostas que 280px la grilla desborda horizontalmente.

---

## 8. Organización del CSS

### `@layer`
Controla la cascada por orden de capa en vez de por especificidad, lo que elimina la guerra de `!important` y de selectores cada vez más largos:

```css
@layer reset, base, components, utilities;

@layer components { .btn { padding: var(--space-sm) var(--space-lg); } }
@layer utilities  { .p-0 { padding: 0; } }   /* gana aunque tenga menos especificidad */
```

### Nesting nativo
```css
.card {
  padding: var(--space-lg);

  & .title { font-size: var(--font-size-title-md); }

  &:hover { box-shadow: var(--elevation-2); }

  @media (min-width: 768px) { padding: var(--space-xl); }
}
```
Anidá hasta 2-3 niveles como máximo: más profundo genera selectores frágiles y difíciles de sobreescribir, el mismo problema que traía Sass.

---

## 9. Otras APIs útiles

- **View Transitions** (`document.startViewTransition`) — transiciones entre estados o páginas con animación de los elementos compartidos. Degradan solo: si el navegador no la soporta, el cambio ocurre sin animar.
- **Scroll-driven animations** (`animation-timeline: scroll()` / `view()`) — barras de progreso de lectura y efectos de aparición sin listeners de scroll (y por lo tanto sin castigo de INP).
- **Anchor positioning** (`anchor-name` / `position-anchor`) — posicionar tooltips y popovers respecto a su disparador sin Floating UI. Soporte todavía parcial: mantené un fallback.
- **`field-sizing: content`** — textareas que crecen con el contenido sin JavaScript.
- **`scrollbar-gutter: stable`** — reserva el espacio de la barra de scroll y evita el salto horizontal al aparecer un modal que bloquea el scroll.
- **`@media (scripting: none)`** — estilos para cuando el JS no cargó o falló.
