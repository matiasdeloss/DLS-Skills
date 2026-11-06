# Enciclopedia de Componentes

Taxonomía, anatomía, matriz de estados y especificación de accesibilidad (ARIA + teclado) de los componentes de interfaz, siguiendo el criterio de **[The Component Gallery](https://component.gallery/)**.

---

## 0. Antes de crear un componente: investigá

Component Gallery cataloga cómo **+95 design systems reales** (Polaris, Atlassian, GOV.UK, Carbon, Primer, Fluent, Ariakit, Red Hat) resuelven el mismo componente. Antes de inventar la API de uno nuevo, buscalo ahí y mirá 5-10 implementaciones. Toma diez minutos y evita tres clases de error:

1. **Nomenclatura divergente.** Si el resto del mundo lo llama `Accordion`, llamarlo `CollapsiblePanel` obliga a cada persona nueva del equipo a aprender tu diccionario privado. Lo mismo con las props: `variant` y `size` son la convención; `kind` y `scale` no.
2. **Variantes y estados olvidados.** Ver varias implementaciones muestra rápido qué es estándar y qué te estás salteando: el estado `loading` de un botón, el `indeterminate` de un checkbox, el `destructive`, el multi-select de un combobox.
3. **Accesibilidad improvisada.** Los sistemas maduros documentan el patrón ARIA correcto y su manejo de teclado. Copiar eso es más confiable que deducirlo, sobre todo en componentes donde el patrón es contraintuitivo (combobox, tree, roving tabindex).

**Y la pregunta previa**: ¿hace falta un componente nuevo? Casi siempre existe uno parecido al que le falta una variante. Un componente nuevo cuesta documentación, tests, mantenimiento y una decisión más para todo el equipo cada vez que elige.

---

## 1. La matriz de los 8 estados

Ningún componente interactivo está completo sin definir estos ocho, visual y funcionalmente:

| # | Estado | Selector | Requisitos |
| :-- | :--- | :--- | :--- |
| 1 | **Default** | base | Contraste ≥ 4.5:1, área táctil ≥ 44×44px. |
| 2 | **Hover** | `:hover` dentro de `@media (hover: hover)` | Cambio tonal sutil; `cursor: pointer` solo en accionables. Envolvelo en la media query para que en táctil no quede el estilo "pegado" tras el tap. |
| 3 | **Focus-visible** | `:focus-visible` | Anillo visible con contraste ≥ 3:1 contra el fondo adyacente. Nunca `outline: none` sin reemplazo. |
| 4 | **Active / Pressed** | `:active` | Feedback < 100ms: `scale(0.98)` o fondo más oscuro. |
| 5 | **Disabled** | `:disabled`, `[aria-disabled="true"]` | Ver nota abajo sobre cuál usar. |
| 6 | **Loading / Busy** | `[aria-busy="true"]` | Spinner + bloqueo de doble submit + anuncio en región viva. Reservá el ancho para que el botón no cambie de tamaño (CLS). |
| 7 | **Error / Invalid** | `[aria-invalid="true"]` | Color de error **+ ícono + texto**, vinculado con `aria-describedby`. |
| 8 | **Empty** | contenedor sin datos | Ilustración o ícono, mensaje claro y acción de salida ("Crear el primero", "Limpiar filtros"). |

### `disabled` vs `aria-disabled`

Un elemento con `disabled` nativo **no recibe foco**, así que quien navega por teclado nunca se entera de que existe ni de por qué no puede usarlo. Para un botón de submit que está deshabilitado hasta completar el formulario, eso es una trampa: el usuario no encuentra el botón y no sabe qué le falta.

- `disabled` — cuando el control es realmente irrelevante en ese contexto.
- `aria-disabled="true"` + prevenir la acción en el handler — cuando querés que siga siendo enfocable y descubrible, y poder explicar por qué está bloqueado. Es la mejor opción por defecto en formularios.

### El estado vacío importa más de lo que parece
Es lo primero que ve un usuario nuevo. Un estado vacío que solo dice "No hay datos" desperdicia el mejor momento para enseñar qué hace el producto y cómo empezar. Distinguí tres casos, porque el mensaje correcto es distinto en cada uno: **primer uso** (no hay nada todavía), **sin resultados** (hay datos pero el filtro no matchea) y **error de carga** (falló la petición).

---

## 2. Acciones

### Button / Button Group / Split Button
- **Anatomía**: ícono inicial (opcional) + label + ícono final o chevron (opcional) + badge (opcional).
- **Jerarquía**:
  - `Primary / Filled` — la acción principal. Una por vista.
  - `Secondary / Tonal` — soporte, fondo de superficie.
  - `Outlined` — secundaria con borde.
  - `Ghost / Text` — contextual o cancelar.
  - `Destructive` — irreversible; color de error.
- **Teclado**: `Enter` y `Space` activan.
- **En JSX y en Blade poné siempre `type`.** El default de `<button>` dentro de un `<form>` es `submit`: un botón "Cancelar" sin `type="button"` envía el formulario. En un componente Blade (`<x-button>`) definí `type="button"` como default.
- **Botón destructivo**: pedí confirmación o, mejor, ofrecé deshacer. Un toast con "Deshacer" durante 5 segundos es menos fricción que un modal de confirmación y protege igual.
- **Botón de solo ícono**: nombre accesible con `aria-label` (o `<span class="sr-only">`); el SVG, `aria-hidden="true"`.
- **Estado `loading`**: texto cambiado ("Guardando…"), mismo ancho, `aria-disabled`/`disabled` contra el doble envío.

### Handlers en elementos no interactivos

Vale para React (`onClick`), Alpine (`@click`, `x-on:click`), Livewire (`wire:click`) y HTMX (`hx-get`, `hx-post`) **por igual**: un `<div>`, `<span>` o `<tr>` con handler de click no recibe foco, no responde a `Enter`/`Space` y no se anuncia como accionable.

- Si es una acción → `<button type="button">`.
- Si navega → `<a href>`.
- Con HTMX, poner `hx-get` sobre un `<button>` o un `<a>` real cuesta lo mismo y funciona para todos.
- Fila de tabla clickeable: el enlace va en la celda principal; el resto de la fila puede ampliar el área con CSS (`a::after { content:''; position:absolute; inset:0 }`) sin duplicar tabulaciones.
- Última salida (no recomendada): `role="button"` + `tabindex="0"` + handlers de `Enter` y `Space`. El auditor la marca como advertencia.

---

## 3. Formularios y entrada de datos

### Text Field / Input
- **Anatomía**: label + contenedor + prefijo/sufijo + texto de ayuda + mensaje de error + contador (opcional).
- **Regla crítica**: todo `<input>` necesita `<label for="id">`. El placeholder no es un label — desaparece al escribir, tiene contraste bajo por diseño y los lectores de pantalla no lo tratan como nombre accesible de forma consistente.
- **Errores accesibles**:
  ```html
  <label for="email-input">Correo electrónico</label>
  <input
    id="email-input"
    type="email"
    autocomplete="email"
    aria-invalid="true"
    aria-describedby="email-hint email-error"
  />
  <p id="email-hint">Te enviaremos la confirmación aquí.</p>
  <p id="email-error" role="alert">Ingresá un correo válido (ej. usuario@dominio.com)</p>
  ```
- **`type` y `autocomplete` correctos**: `type="email"`, `type="tel"`, `inputmode="numeric"` cambian el teclado en móvil, y `autocomplete` permite autocompletar. Es una de las mejoras de conversión más baratas que existen.
- **Momento de validar**: no valides mientras escribe (marcar en rojo un email a medio tipear es hostil). Validá al salir del campo (`blur`), y una vez que el campo ya tiene error, sí revalidá en cada tecla para que vea cuándo lo arregló.

### Checkbox vs Radio vs Switch
| Control | Cuándo | ARIA / teclado |
| :--- | :--- | :--- |
| **Checkbox** | Selección múltiple independiente; admite `indeterminate`. | Nativo; `Space` alterna. |
| **Radio group** | Una opción exclusiva entre 2-5 visibles. | `role="radiogroup"`; flechas navegan **y** seleccionan. |
| **Switch** | Estado on/off que se aplica al instante, sin "Guardar". | `role="switch"` + `aria-checked`. |

Si el cambio no se aplica al instante y requiere confirmar, es un **checkbox**, no un switch — el switch promete efecto inmediato.

### Combobox / Autocomplete
- **Anatomía**: input de texto + listbox filtrado en vivo.
- **ARIA**: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, y `aria-activedescendant` apuntando a la opción resaltada (el foco del DOM se queda en el input).
- **Teclado**: `↓` abre y navega, `↑` retrocede, `Enter` selecciona, `Escape` cierra y devuelve el foco al input, `Home`/`End` van a los extremos.
- Anunciá la cantidad de resultados en una región viva ("12 resultados") para quien no ve la lista.
- Receta completa en [accessible-components-recipes.md](../examples/accessible-components-recipes.md#3-combobox--autocomplete-accesible).

---

## 4. Navegación

### Tabs
- **ARIA**: contenedor `role="tablist"`; cada tab `role="tab"` + `aria-selected` + `aria-controls`; cada panel `role="tabpanel"` + `aria-labelledby`.
- **Roving tabindex**: solo la tab activa tiene `tabindex="0"`, el resto `-1`. `Tab` entra y sale del grupo; `←`/`→` navegan dentro. Sin esto, un tablist de 8 tabs obliga a tabular 8 veces para llegar al contenido.
- Usá tabs solo para vistas alternativas del mismo nivel. Si el contenido merece URL propia, es navegación, no tabs.

### Breadcrumbs
`<nav aria-label="Breadcrumb">` con `<ol>`; el último item lleva `aria-current="page"` y no es un enlace.

### Pagination
`<nav aria-label="Paginación">`; la página actual con `aria-current="page"`. Los links deben ser `<a href>` reales con la URL de cada página para que funcionen "abrir en pestaña nueva" y el botón atrás.

### Menu / Dropdown
`aria-haspopup="menu"` + `aria-expanded` en el disparador. Flechas navegan, `Escape` cierra y devuelve el foco al disparador. **Un menú de navegación no es un `role="menu"`**: ese rol es para menús de aplicación tipo escritorio y cambia el modo de los lectores de pantalla. Para navegación usá `<nav>` con una lista de enlaces.

---

## 5. Overlays y contenedores

### Modal / Dialog
Usá el `<dialog>` nativo con `showModal()`: el navegador te da focus trap, `::backdrop`, cierre con `Escape` y el top layer sin `z-index` peleado.

Reglas que igual tenés que cumplir:
- **Restaurar el foco** al elemento que abrió el modal al cerrar.
- **Bloquear el scroll del fondo** mientras está abierto.
- **Nombre accesible** con `aria-labelledby` apuntando al título.
- **No anides modales.** Si necesitás un modal sobre otro, el flujo está mal diseñado.
- **Bootstrap**: el contenedor `.modal` necesita `aria-labelledby` apuntando al `id` de `.modal-title` (el auditor lo marca: `markup/modal-without-label`) y el `.btn-close` necesita `aria-label` en tu idioma.
- **Acción destructiva**: el foco inicial va al botón seguro ("Cancelar"), no al destructivo.

### Popover / Tooltip
- **Popover API nativa** (`popover`, `popovertarget`) para dropdowns y paneles flotantes: maneja el cierre por click afuera y el top layer sin JS.
- **Tooltip ≠ Popover**: el tooltip solo describe (texto corto, sin elementos interactivos adentro, aparece en hover **y en focus**). Si adentro hay un botón o un link, es un popover.
- **Nunca pongas información esencial solo en un tooltip**: en táctil no hay hover.

### Toast / Snackbar
- Región viva: `aria-live="polite"` para mensajes normales, `role="alert"` para errores críticos.
- El temporizador **debe pausarse** en hover y en focus, y siempre tiene que haber un botón de cierre visible.
- No metas contenido crítico o irrecuperable en un toast: desaparece, y quien usa lector de pantalla o lee despacio se lo pierde.
- **Nunca uses `innerHTML` con texto que venga de datos** para armar el toast — es un vector de XSS. Ver la receta corregida en [examples](../examples/accessible-components-recipes.md#5-toast--notification-accesible).

### Drawer / Bottom sheet
Mismas reglas que el modal (focus trap, `Escape`, restauración de foco). En móvil preferí bottom sheet: queda dentro de la zona del pulgar.

---

## 6. Datos y feedback

### Data Table
- `<table>` real con `<th scope="col|row">`. Una grilla de `<div>` no le dice nada a un lector de pantalla.
- `<caption>` o `aria-label` describiendo la tabla.
- Ordenamiento: `aria-sort="ascending|descending|none"` en el `<th>`.
- En móvil, no encojas la tabla hasta hacerla ilegible: o scroll horizontal con el contenedor marcado como región enfocable (`tabindex="0"` + `role="region"` + `aria-label`), o cambio a formato de tarjetas.
- Con muchas filas, virtualizá — pero cuidado, la virtualización rompe `Ctrl+F` y a menudo la accesibilidad; usala solo cuando de verdad haga falta.

### Skeleton
- **Dimensiones idénticas** al contenido final (ancho, alto, radio, márgenes) para que el CLS sea 0.
- Shimmer animado solo con `transform`, nunca con `background-position`.
- Marcá el contenedor con `aria-busy="true"` y ocultá los skeletons con `aria-hidden="true"`: no tiene sentido anunciar cajas vacías.

```css
.skeleton {
  background-color: var(--color-surface-container);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.15), transparent);
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { to { transform: translateX(100%); } }
```

### Progress
- Determinado: `<progress>` o `role="progressbar"` con `aria-valuenow/min/max`.
- Indeterminado: sin `aria-valuenow`. Si va a durar más de unos segundos, agregá texto de estado — una animación infinita sin contexto se lee como "se colgó".

---

## 7. Más componentes

### Card
- **Anatomía**: media (opcional) + título + metadatos + cuerpo + acciones.
- Contenedor `<article>` (o `<li>` dentro de una lista); el título es un heading del nivel que corresponda al contexto, sin saltarse niveles.
- **Card clickeable**: un **único** enlace primario (en el título) con `::after { content:''; position:absolute; inset:0 }` para ampliar el área; las acciones secundarias son botones aparte por encima (`position: relative; z-index: 1`). **Nunca** envuelvas toda la card en un `<a>` si adentro hay más controles: genera enlaces/botones anidados.
- Estados: `hover` (elevación o borde, solo si es accionable), `focus-visible` sobre el enlace, `loading` (skeleton de las mismas dimensiones), `empty`/`error` (qué ve cada columna de una grilla si falla un ítem).
- La imagen informativa lleva `alt`; la decorativa, `alt=""`.

### Accordion / Disclosure
- **Nativo primero**: `<details><summary>…</summary>…</details>` da rol, estado y teclado gratis. El atributo `name` en varios `<details>` agrupa y deja abierto uno solo (acordeón exclusivo); es relativamente reciente, **verificá el soporte** de tus navegadores objetivo antes de depender de él.
- **Hecho a mano**: cada encabezado es un `<h3>` (nivel acorde) que contiene un `<button aria-expanded="false" aria-controls="panel-id">`; el panel puede llevar `role="region"` + `aria-labelledby` (conviene en pocos paneles; con muchos genera ruido de landmarks).
- **Teclado**: `Enter`/`Space` alterna. Flechas y `Home`/`End` entre encabezados son opcionales (mejoran, no son obligatorias).
- Animá la altura con `grid-template-rows: 0fr → 1fr` o `@starting-style`, no con `height` fijo en JS. Receta: [accordion](../examples/accessible-components-recipes.md#7-accordion--disclosure-accesible).

### Badge / Chip / Tag
| Tipo | Es | Notas |
| :--- | :--- | :--- |
| **Badge** (contador/estado) | Informativo, **no interactivo** | Un "3" suelto no dice nada al lector: añadí contexto oculto ("3 notificaciones sin leer"). El color no es el único portador (texto o ícono). |
| **Chip de filtro** | Botón toggle | `<button aria-pressed="true|false">`. |
| **Chip de entrada** (valor ingresado) | Elemento con botón de quitar | El botón: `aria-label="Quitar {nombre}"`. Anunciá la eliminación en una región viva. |
| **Tag/Etiqueta** | Texto de clasificación | Si enlaza a un filtro, es un `<a>`. |

### Avatar
- Imagen con `alt` = nombre de la persona; si el nombre ya está visible al lado, `alt=""` para no repetirlo.
- Fallback con **iniciales**: el texto de iniciales con `aria-hidden="true"` y el nombre completo accesible en otro lado.
- Avatar group: el "+3" necesita contexto ("y 3 personas más").
- Estado de la imagen: cargando (color de fondo) / error (iniciales).

### Alert / Banner
- **Tipos**: info, success, warning, error — cada uno con **ícono + texto** (no solo color) y tokens semánticos.
- **Anuncio**: `role="alert"` (asertivo, interrumpe) solo para errores/urgentes que aparecen dinámicamente; `role="status"` (cortés) para el resto. Un banner **presente al cargar la página** no necesita rol vivo: se lee en el orden normal.
- **Persistencia**: lo importante o accionable queda visible hasta que se resuelva; lo efímero va como toast.
- **Descartable**: botón de cerrar con nombre accesible; el foco no se pierde al cerrarlo (pasalo al siguiente elemento lógico).
- Cerca de lo que afecta: banner a nivel página para lo global, inline para lo local. Receta: [alert](../examples/accessible-components-recipes.md#8-alert--banner-accesible).

### Stepper / Wizard
- Lista ordenada `<ol>`, cada paso con su estado (completado / actual / pendiente) expresado **en texto** además del ícono; el actual lleva `aria-current="step"`.
- No es un `tablist` (los pasos no son vistas intercambiables libremente). Si se puede saltar entre pasos, los pasos completados son enlaces/botones.
- Al avanzar, mové el foco al título del paso nuevo (`tabindex="-1"` + `.focus()`) y actualizá el `document.title` si cada paso es una URL.
- Reglas completas de datos, validación por paso y guardado en [forms-and-validation §5](./forms-and-validation.md#5-formularios-de-varios-pasos-wizard). Receta: [stepper](../examples/accessible-components-recipes.md#10-stepper--wizard-accesible).

### Date picker
- **Nativo primero**: `<input type="date">` (y `min`/`max`). Excelente teclado y teclado móvil; el aspecto varía por navegador. Para rangos: dos inputs ("Desde", "Hasta").
- **Calendario propio** solo si lo necesitás: input de texto **tipeable** + botón que abre un `role="dialog"` con una grilla. Teclado de la grilla: flechas mueven por día/semana, `PageUp`/`PageDown` cambian el mes, `Shift`+`PageUp/Down` el año, `Home`/`End` inicio/fin de semana, `Enter` selecciona, `Esc` cierra y devuelve el foco.
- Mostrá el **formato esperado** como ayuda ("dd/mm/aaaa") y aceptá varios formatos al recibir (Postel); normalizá.
- Fechas inválidas o fuera de rango: error en el campo, no un calendario que no deja elegir sin explicar por qué.

### File upload
- **Nativo siempre**: un `<input type="file">` con `<label>`; el estilo se aplica al `label` o al botón visible, sin quitar el input del árbol de accesibilidad.
- `accept` y `multiple` orientan, pero **no validan**: el servidor valida tipo y tamaño. Decí los límites **antes** ("Imágenes JPG o PNG, hasta 5 MB").
- Drag & drop = **mejora**, nunca el único camino (WCAG 2.5.7: alternativa de un toque, ver *frontend-dls-investigacion*).
- Lista de archivos seleccionados con **botón de quitar** por ítem (`aria-label="Quitar {archivo}"`), tamaño y estado. Progreso con `<progress>`; resultado en región viva.
- Estados: vacío, arrastrando encima, cargando (con cancelar), error (por archivo, con motivo), completado.
- Receta: [file upload](../examples/accessible-components-recipes.md#9-file-upload-accesible).

### Navbar / Sidebar
- `<nav aria-label="Principal">` con una **lista de enlaces**; el actual con `aria-current="page"`. **No** `role="menu"`.
- Submenús: un `<button aria-expanded aria-controls>` que muestra/oculta una lista de enlaces (patrón *disclosure*), no un menú ARIA.
- Menú móvil (hamburguesa): `<button aria-expanded aria-controls aria-label="Abrir menú">`; si cubre la pantalla, tratalo como modal (foco atrapado, `Esc`, restaurar foco).
- Sidebar colapsable: el botón de colapsar tiene `aria-expanded` y los íconos del modo colapsado conservan nombre accesible (tooltip **y** texto oculto).
- Ver patrones de pantalla en [layout-and-navigation-patterns §3](./layout-and-navigation-patterns.md#3-navegación-responsive).

### Search
- `<form role="search">` con `<input type="search">` + `<label>` (puede estar visualmente oculto, pero existir) + botón "Buscar".
- Resultados con **conteo anunciado** en región viva ("12 resultados") y el término en la URL (`?q=`).
- Con sugerencias en vivo es un **combobox**: ver [combobox](#combobox--autocomplete) y su receta.
- Estados: sin resultados (sugerí alternativas), cargando, error. Conservá la consulta al volver.

---

## 8. Referencia rápida de teclado

| Componente | Teclas |
| :--- | :--- |
| Button | `Enter`, `Space` |
| Accordion (botón de encabezado) | `Enter`/`Space` alterna |
| Date picker (grilla) | flechas día/semana, `PageUp/Down` mes, `Home`/`End` semana |
| File upload (nativo) | `Enter`/`Space` abre el selector |
| Link | `Enter` |
| Checkbox / Switch | `Space` |
| Radio group | `←` `→` `↑` `↓` navegan y seleccionan |
| Select / Listbox | `↑` `↓`, `Home`/`End`, letra inicial salta |
| Combobox | `↓` abre, `Enter` selecciona, `Esc` cierra |
| Tabs | `←` `→`, `Home`/`End` |
| Menu | `↑` `↓`, `Esc` cierra y devuelve foco |
| Modal | `Esc` cierra, `Tab` circula dentro |
| Slider | `←` `→` paso, `Page Up/Down` salto, `Home`/`End` extremos |
| Tree | `↑` `↓` navegan, `←` colapsa, `→` expande |

---

## Apéndice A. Spec de handoff a desarrollo

Para cuando un diseño (Figma, mockup) pasa a quien lo implementa, o cuando vos mismo lo documentás para el equipo. Una spec buena evita la pregunta "¿y esto cómo se comporta?" antes de que aparezca.

**Cuatro principios:**

1. **Nada librado a la suposición.** Si un comportamiento no está escrito, cada persona va a implementar uno distinto.
2. **Tokens por referencia, no por valor.** Escribí `--space-lg` y `--color-surface`, no `16px` ni `#fff`: así la spec sobrevive a un cambio de marca o al modo oscuro.
3. **Todos los estados, no solo el feliz.** Usá la [matriz de los 8 estados](#1-la-matriz-de-los-8-estados) de este archivo como lista de control.
4. **El porqué de lo que no es obvio.** Una decisión sin motivo se "corrige" por error en la siguiente iteración.

**Dos defectos típicos de las plantillas genéricas, ya corregidos acá:**

- **Responsive:** no fijes puntos de quiebre por dispositivo ("Desktop > 1024, Tablet, Mobile"). El punto de quiebre es **donde el contenido deja de funcionar**, y los componentes se adaptan a su **contenedor** (`@container`), no al ancho del dispositivo. Describí qué cambia y cuándo.
- **Hover:** el estado `hover` solo existe donde hay un puntero. Especificalo bajo `@media (hover: hover)` y no definas "oscurecer 10 %" como regla universal: dá el token del estado.

```markdown
# Spec: {pantalla o componente}

## 1. Layout
Estructura, grilla, alineaciones, qué se ancla y qué fluye.

## 2. Tokens usados
Color, tipografía, espaciado, radio, elevación y motion, por nombre de token.

## 3. Componentes
| Componente | Variante | Props / opciones | Notas |
| :--- | :--- | :--- | :--- |

## 4. Estados
| Elemento | Estado | Apariencia y comportamiento |
| :--- | :--- | :--- |
| Botón "Guardar" | default · hover · focus-visible · active · disabled · loading · error · empty | Un renglón por estado que aplique, con el token que cambia |

## 5. Responsive
Qué cambia, en qué punto del contenido o del contenedor, y por qué.

## 6. Casos límite
Texto muy largo, sin datos, un solo ítem, miles de ítems, nombres sin apellido,
traducciones más largas, imágenes que no cargan, red lenta.

## 7. Movimiento
Qué se anima, con qué duración y curva (por token), y qué pasa con prefers-reduced-motion.

## 8. Accesibilidad
Orden de foco, nombres accesibles, roles, teclado, anuncios en región viva, contraste verificado.

## Decisiones y porqués
Lo no obvio, con el motivo.
```

**Cómo completarla:**

- La tabla de estados lleva una fila por **elemento y estado**, no una descripción general. Los estados que no aplican se dejan escritos como "no aplica" para que se vea que se pensaron.
- Los casos límite se piden a quien diseña, no se descubren en producción: ver también los tres vacíos de [la sección 1](#el-estado-vacío-importa-más-de-lo-que-parece).
- La nota de accesibilidad se completa con lo que se verificó; lo supuesto se marca como supuesto (formato en [testing-and-auditing-frontend](./testing-and-auditing-frontend.md#8-plantilla-de-informe-de-auditoría)).
