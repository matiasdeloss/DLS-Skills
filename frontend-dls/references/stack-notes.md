# Notas por stack

Las reglas de [SKILL.md](../SKILL.md) valen para cualquier stack. Acá están las **trampas e idiomas** de accesibilidad, estado y rendimiento de cada uno. Lo marcado como *versión-sensible* cambia entre versiones: confirmalo contra la documentación del proyecto antes de depender de ello (la skill *frontend-dls-investigacion* explica el método de verificación).

---

## HTML plano

- Es la mejor base: lo nativo (`<dialog>`, `<details>`, `[popover]`, `<input type="date">`, `<progress>`) trae teclado, foco y semántica sin JS.
- Progressive enhancement: lo esencial funciona sin JS; el JS mejora. Un formulario con `action` y `method` reales se envía aunque el script falle.
- Recetas de JavaScript vanilla en [accessible-components-recipes](../examples/accessible-components-recipes.md).

## React / JSX

| Tema | Qué hacer |
| :--- | :--- |
| Atributos | `className`, `htmlFor`, `tabIndex`; los `aria-*` van en kebab-case. |
| Ids de accesibilidad | `useId()` para vincular `label`/`aria-describedby` sin colisiones (también con SSR). |
| Botones | `type="button"` o `type="submit"` explícito siempre. |
| Handlers | `onClick` solo en `<button>`/`<a>`. En `<div>`/`<span>` el auditor lo marca como error (`a11y/clickable-non-interactive`). |
| Foco | Gestionalo con `ref` + `.focus()` tras abrir un modal, cambiar de paso o fallar un envío. Evitá `autoFocus` salvo en diálogos. |
| Modales | `<dialog>` con `ref` y `showModal()`; o un portal con focus trap y `Escape`. Restaurá el foco al disparador. |
| Listas | `key` estable (id del dato, no el índice si se reordena). |
| HTML de datos | `dangerouslySetInnerHTML` solo con HTML sanitizado (DOMPurify). |
| Anuncios | Una región `aria-live` montada **desde el inicio**; cambiá solo su texto. |
| Estado de carga | Distinguí `loading` inicial (skeleton) de `refetch` (indicador discreto sin vaciar la UI). |

## Laravel Blade

- **Escape**: `{{ $x }}` escapa; `{!! $x !!}` no. El segundo solo para HTML que controlás (por ejemplo un SVG propio). El auditor marca `security/blade-unescaped-output`.
- **Validación**: `@error('campo')`, `$errors->first('campo')`, `old('campo')`. Mirá el ejemplo en [forms-and-validation](./forms-and-validation.md#laravel-blade-servidor-autoritativo). `@csrf` en todo formulario que no sea GET.
- **Atributos condicionales**: `@class([...])`, `@checked()`, `@selected()`, `@disabled()`, `@required()`, `@readonly()`. Para `aria-invalid` usá `@error` o `@if`.
- **Componentes**: `<x-button type="button" variant="ghost">`. Declará en `@props` los atributos con default y dejá pasar el resto con `$attributes->merge([...])` para que `aria-*` y `type` lleguen al elemento real.
- **Botones**: `<button>` sin `type` es el hallazgo más repetido; definí `type="button"` como default del componente.
- **Íconos**: SVG inline con `aria-hidden="true"` y, si el ícono es el único contenido de un botón, `aria-label`.

## HTMX

- **Semántica**: poné `hx-get`/`hx-post` sobre `<button>` o `<a>`, no sobre `<div>`/`<tr>`. El auditor lo marca (`a11y/handler-on-non-interactive`). Para una fila clickeable, el enlace va dentro de la celda del nombre.
- **Regiones que se refrescan solas**: un contenedor con `hx-get` y `hx-trigger="load"`, `revealed` o un evento (`refreshTable from:body`) no es un control: nadie lo clickea, así que no necesita foco ni rol de botón, y el auditor no lo marca. Lo que sí necesita es un estado de carga y, si el cambio importa, un anuncio (ver «Anuncios»).
- **Respuestas 4xx/5xx**: por defecto **no se intercambian**. Para el patrón "422 → re-renderizar el formulario con errores", habilitá el swap del 422 (`htmx.config.responseHandling` o `htmx:beforeSwap` con `shouldSwap = true`). Es la causa nº 1 de "envío y no pasa nada".
- **Errores 422 inyectados por JavaScript**: si el servidor devuelve los errores como datos y un script los pinta, ese script es el único lugar donde se puede cumplir la accesibilidad del error. Tiene que poner `aria-invalid="true"` en el campo, darle `id` al mensaje y sumarlo al `aria-describedby`, y mover el foco al primer campo inválido. Al limpiar los errores, quitá los tres.
- **Selects propios con `<input type="hidden">`**: el campo que viaja en el formulario no se ve, así que un error "por campo" no tiene dónde mostrarse. Marcá el control visible (el botón que abre la lista) y poné el mensaje junto a él; si varios campos comparten el mismo mensaje, mostralo una sola vez.
- **Estado en el servidor** (acordeones, pestañas, pasos): cuando el proyecto decide el estado en el backend, el patrón válido es un `<a href>` real con el estado en la URL y la respuesta parcial por HTMX, no la receta con `<button>` y JavaScript de [accessible-components-recipes](../examples/accessible-components-recipes.md). Indicá el elemento activo con `aria-current`, poné `aria-expanded`/`aria-controls` solo si el panel existe en el DOM y usá `hx-sync` para que dos clics rápidos no muestren la respuesta equivocada.
- **Estado de envío**: `hx-disabled-elt="this"` deshabilita el control durante la petición; `hx-indicator` aplica la clase `htmx-request` a un indicador. Mantené el tamaño del botón (CLS).
- **Anuncios**: una región `aria-live` que ya exista en el DOM; actualizala con `hx-swap-oob` para que los lectores anuncien el resultado.
- **Foco tras un swap**: si reemplazaste el elemento enfocado, el foco se pierde. Devolvelo (primer campo inválido, o el título nuevo con `tabindex="-1"`) en `htmx:afterSwap`. HTMX conserva por su cuenta el foco de los campos (`input`) que tienen `id` y vuelven en la respuesta; para botones y enlaces no hay garantía, así que dales un `id` estable y devolvé el foco vos. Lo mismo vale fuera de HTMX: antes de ocultar el control enfocado (`d-none`, `hidden`), mové el foco a su reemplazo.
- **URL**: `hx-push-url` para que filtros/paginación sean enlaces compartibles y el botón atrás funcione.
- **Mejora progresiva**: formularios con `action`/`method` reales y `hx-boost` o `hx-post` encima: funcionan sin JS.

## Alpine.js

- `@click`/`x-on:click` solo sobre `<button>`/`<a>` (mismo criterio que React/HTMX).
- `x-cloak` + regla CSS `[x-cloak] { display: none }` evita el parpadeo de contenido sin inicializar.
- **Focus trap** en modales/drawers: el plugin Focus aporta `x-trap` (requiere cargar el plugin).
- Cerrar al clickear afuera: `@click.outside`; cerrar con teclado: `@keydown.escape`. Devolvé el foco al disparador.
- `x-transition` respeta `prefers-reduced-motion` solo si lo manejás con CSS; reducí las duraciones en esa media query.
- Es estado local de UI (abrir/cerrar). La fuente de verdad de los datos sigue siendo el servidor.

## Livewire (v3) — *versión-sensible*

- `wire:model` es **diferido** por defecto; `wire:model.live` sincroniza en cada tecla (una petición por tecla, usalo con `.debounce`); `wire:model.blur` al salir del campo.
- `wire:loading` para estados de carga; ubicalos sin que muevan el layout.
- `wire:click` en `<button>`/`<a>`, no en `<div>`.
- `wire:key` único en cada ítem de un `@foreach`, o el DOM se reutiliza mal.
- Los re-renders pueden **perder el foco**: si un campo lo pierde tras actualizar, revisá `wire:key` y los límites del componente.

## Bootstrap 5.3

- **Modal**: el contenedor `.modal` necesita `aria-labelledby` apuntando al id del título (`.modal-title`); el auditor lo marca (`markup/modal-without-label`). El botón de cierre `.btn-close` necesita `aria-label="Cerrar"` (en inglés por defecto en la documentación: traducilo).
- **Solo-lectores**: la clase es `.visually-hidden` (y `.visually-hidden-focusable`). `.sr-only` es de Bootstrap 4 y de Tailwind.
- **Validación**: `.needs-validation` + `novalidate` en el form, `.was-validated`/`.is-invalid` en los campos y `.invalid-feedback` para el mensaje. La clase pinta; **vos** tenés que agregar `aria-describedby`/`aria-invalid` para el lector de pantalla.
- **Toasts**: contenedor con `aria-live` y cada toast con `role="alert"` (errores) o `role="status"`, más `aria-atomic="true"`; tienen temporizador, así que pausalo con el foco.
- **Modo oscuro**: `data-bs-theme="dark"` en `<html>` o en un contenedor. Verificá el contraste de los componentes personalizados que usen colores propios.
- **Tabs/accordion/dropdown** de Bootstrap ya traen la mayoría de los roles ARIA; **no** los dupliques a mano.
- Tus estilos propios van en una capa/archivo aparte que sobrescriba variables (`--bs-*`), no editando el CSS de Bootstrap.

## Tailwind CSS — *versión-sensible*

- **Foco**: `focus-visible:ring-2 focus-visible:ring-offset-2` (o `outline`). En **v4**, `outline-none` pasó a significar `outline-style: none`; el comportamiento viejo (outline invisible pero visible en `forced-colors`) ahora se llama **`outline-hidden`**. Nunca quites el indicador de foco sin reemplazo.
- **Movimiento**: `motion-safe:` aplica la animación solo si el usuario no pidió menos movimiento; `motion-reduce:` la desactiva. Preferí `motion-safe:` (menos "deshacer").
- **Solo-lectores**: `sr-only`.
- **Modo oscuro por clase**: en v4 se redefine la variante con `@custom-variant dark (&:where(.dark, .dark *));` y se agrega la clase `dark` al `<html>`.
- **Estados**: variantes `aria-*:` y `data-*:` (por ejemplo `aria-invalid:border-red-600`) mantienen el estilo atado al estado accesible real.
- **Tokens**: definí los semánticos como variables (en v4, en `@theme`) y usalos desde las utilidades; evitá colores crudos (`bg-blue-600`) repetidos por todos lados si hace falta tematizar.
- **Clases largas ≠ componente**: extraé a un componente (Blade, JSX) en vez de repetir 15 utilidades; ahí viven las reglas de `type`, `aria-*` y foco una sola vez.

---

## Qué comparten todos

1. Lo interactivo es un `<button>` o un `<a>` real.
2. El estado (cargando, error, vacío) tiene representación visual **y** accesible.
3. Tras un cambio dinámico, el foco va a un lugar sensato y el cambio se anuncia en una región viva preexistente.
4. Los datos se escapan; el HTML sin escapar es la excepción justificada.
5. Se prueba con teclado antes de dar nada por terminado ([testing-and-auditing-frontend](./testing-and-auditing-frontend.md)).
