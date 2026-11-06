# Formularios y validación

Un formulario es donde la interfaz cobra o pierde dinero y confianza. Esta guía dice **cómo se construye y valida**; el criterio WCAG exacto de cada punto (3.3.x, 4.1.3) está en la skill *frontend-dls-investigacion*, referencia de accesibilidad.

Recetas de código: [campo validado](../examples/accessible-components-recipes.md#6-campo-de-formulario-con-validación-accesible) y [stepper](../examples/accessible-components-recipes.md#10-stepper--wizard-accesible).

---

## 1. Anatomía de un campo

```text
Label (siempre visible)  ·  [*] / "(opcional)"
[ prefijo | input | sufijo ]
Texto de ayuda            ← antes del error; explica el formato
Mensaje de error          ← reemplaza/acompaña a la ayuda; ícono + texto
```

- **Label arriba del input**, alineado a la izquierda: se escanea más rápido y funciona en móvil y con zoom. Labels a la izquierda solo en formularios densos de escritorio.
- **El placeholder es un ejemplo, no un label.** Desaparece al escribir y tiene contraste bajo por diseño.
- **Marcá lo opcional, no lo obligatorio**, cuando la mayoría es obligatoria ("(opcional)" en pocos campos). Si marcás con `*`, explicá la convención arriba del formulario.
- **Una columna.** Los formularios en dos columnas se leen en zigzag y se llenan peor; las únicas excepciones razonables son pares cortos y obvios (nombre / apellido, ciudad / código postal).
- **Agrupá con `<fieldset>` + `<legend>`** los conjuntos relacionados (radios, checkboxes, dirección). El `<legend>` es el nombre accesible del grupo.

## 2. `type`, `inputmode` y `autocomplete`

Son la mejora de conversión más barata. Cambian el teclado en móvil y habilitan el autocompletado del navegador.

| Dato | Atributos |
| :--- | :--- |
| Email | `type="email" autocomplete="email"` |
| Teléfono | `type="tel" autocomplete="tel"` |
| Nombre / apellido | `autocomplete="given-name"` / `"family-name"` |
| Usuario | `autocomplete="username"` |
| Contraseña (login) | `type="password" autocomplete="current-password"` |
| Contraseña nueva | `autocomplete="new-password"` |
| Código por SMS/email | `inputmode="numeric" autocomplete="one-time-code"` |
| Dirección | `autocomplete="street-address"`, `"postal-code"` |
| Número que **no** es cantidad (DNI, tarjeta) | `type="text" inputmode="numeric"` — `type="number"` agrega flechitas y pierde ceros a la izquierda |

- **Permití pegar** en contraseñas y códigos: bloquear el pegado rompe los gestores de contraseñas (WCAG 3.3.8, ver *frontend-dls-investigacion*).
- **No pidas de nuevo** lo que el usuario ya ingresó en el mismo flujo (WCAG 3.3.7): prellenar o reutilizar.

## 3. Cuándo validar

| Momento | Qué hacer |
| :--- | :--- |
| Mientras escribe | **Nada**, salvo ayudas positivas (contador, fuerza de contraseña). Marcar rojo un email a medio tipear es hostil. |
| Al salir del campo (`blur`) | Validá formato. Mostrá el error. |
| Con error visible | Revalidá **en cada tecla** para que vea cuándo lo arregló. |
| Al enviar | Validá todo. Mové el foco al **primer campo inválido** o a un **resumen** con enlaces a cada campo. |

**Tres niveles, siempre.** (1) Atributos HTML nativos (`required`, `type`, `pattern`, `min`/`max`) como primera red; (2) JavaScript para mensajes claros y momento correcto; (3) **servidor siempre**: el cliente se puede saltear. El servidor es la autoridad; el cliente es cortesía.

Si usás `novalidate` en el `<form>` para controlar los mensajes, la validación del servidor pasa a ser obligatoria, no opcional.

## 4. Mensajes de error

Un buen error responde tres cosas: **qué pasó**, **por qué** y **cómo se arregla**. Ver [ux-writing-and-microcopy](./ux-writing-and-microcopy.md#2-errores).

Accesibilidad mínima de un error:
- Vinculado al campo con `aria-describedby` (apuntando al id del error **y** de la ayuda) y `aria-invalid="true"` mientras sea inválido.
- **Ícono + texto**, no solo color rojo.
- Anunciado: el mensaje que aparece dinámicamente va en una región viva (`role="alert"` o `aria-live`) que **ya existía** en el DOM antes de recibir el texto; si la región nace con el contenido, muchos lectores no la anuncian.
- **Resumen de errores** arriba al enviar (con foco) si el formulario es largo, con enlaces `<a href="#campo">` a cada campo inválido.

`aria-errormessage` tiene soporte irregular entre lectores de pantalla; `aria-describedby` es la opción segura.

## 5. Formularios de varios pasos (wizard)

Usalos cuando el formulario supera lo que una persona completa de una sola vez (aprox. más de 7-9 campos o secciones conceptualmente distintas). No los uses para esconder la longitud: ahí un formulario largo bien agrupado rinde igual.

- **Mostrá el progreso**: "Paso 2 de 4" + los nombres de los pasos (Goal-Gradient; ver *frontend-dls-investigacion*, leyes de UX).
- **Un propósito por paso**, con título propio (`<h2>`) que recibe el foco al cambiar de paso.
- **Guardá lo ingresado** al ir atrás y adelante; nunca pierdas datos al volver.
- **Validá por paso** antes de avanzar, con las mismas reglas del punto 3.
- **Resumen final** antes de confirmar, con enlace "Editar" a cada sección.
- **Cada paso es una URL** cuando sea posible (botón atrás del navegador funciona).
- "Continuar", no "Siguiente >>" ambiguo; el botón primario es el avance, "Volver" es secundario.

Receta: [stepper accesible](../examples/accessible-components-recipes.md#10-stepper--wizard-accesible).

## 6. Estado de envío

- Al enviar: deshabilitá el submit (o `aria-disabled`), mostrá **loading** en el botón sin cambiar su ancho, y evitá el doble submit.
- Si falla por red: conservá todo lo escrito y ofrecé reintentar. Nunca vacíes el formulario.
- Éxito: confirmación **visible y persistente** cerca de lo enviado (o redirección con mensaje); un toast efímero solo para acciones de bajo riesgo.
- Acciones destructivas: preferí **deshacer** a un modal de confirmación; si hay confirmación, que el botón diga la acción ("Eliminar proyecto"), no "Aceptar".

---

## 7. Por stack

### HTML plano / JavaScript
Receta lista en [accessible-components-recipes §6](../examples/accessible-components-recipes.md#6-campo-de-formulario-con-validación-accesible).

### Laravel Blade (servidor autoritativo)

```blade
<div class="field">
  <label for="email">Correo electrónico</label>
  <input id="email" name="email" type="email" autocomplete="email"
         value="{{ old('email') }}"
         @error('email') aria-invalid="true" aria-describedby="email-error" @enderror
         @class(['is-invalid' => $errors->has('email')])>
  @error('email')
    <p id="email-error" class="field__error">{{ $message }}</p>
  @enderror
</div>
```

- `old('campo')` repuebla tras un fallo; `@error` y `$errors` leen el bag de validación.
- Con Bootstrap: `.is-invalid` + `.invalid-feedback`; ver [stack-notes](./stack-notes.md#bootstrap-53).
- `{{ }}` escapa; no uses `{!! !!}` para mensajes que vengan de datos.

### HTMX

HTMX **no intercambia por defecto las respuestas 4xx/5xx** (solo 2xx/3xx). Si el servidor responde **422** con el formulario re-renderizado y los errores, tenés que habilitar ese swap, por ejemplo con `htmx.config.responseHandling` (agregando `{"code":"422","swap":true}`) o escuchando `htmx:beforeSwap` y poniendo `evt.detail.shouldSwap = true`. Si no, el usuario envía y "no pasa nada".

Para el estado de envío: `hx-disabled-elt="this"` deshabilita el control durante la petición, e `hx-indicator` aplica la clase `htmx-request` a un indicador. Una región `aria-live` existente puede recibir el mensaje de resultado (por ejemplo con `hx-swap-oob`). Después de un swap, el foco se pierde si reemplazaste el elemento enfocado: devolvelo (al primer campo inválido) con un `htmx:afterSwap`.

### Livewire (v3)

`wire:model` es **diferido por defecto**: envía el valor al servidor en la próxima acción (por ejemplo, el submit). `wire:model.live` sincroniza en cada tecla (cuidado: una petición por tecla); `wire:model.blur` al salir del campo, que es el equivalente al momento de validación recomendado en el punto 3. Para estado de carga usá `wire:loading`. En listas, `wire:key` único por ítem.

### React / JSX

- `<label htmlFor>` + `useId()` para generar ids estables sin colisiones.
- Controlado vs no controlado: para formularios grandes, preferí no controlado + validación al enviar/`blur` antes que re-renderizar en cada tecla.
- Mové el foco con `ref` al primer campo inválido tras un envío fallido.
- `type` explícito en cada `<button>`.

---

## Checklist de formularios

- [ ] Cada campo tiene `<label for>` visible; el placeholder no hace de label.
- [ ] `type`, `inputmode` y `autocomplete` correctos; se puede pegar en contraseñas.
- [ ] Se valida al salir del campo y se revalida en cada tecla solo si ya hay error.
- [ ] Errores: ícono + texto + `aria-describedby`; foco al primer inválido o a un resumen.
- [ ] El servidor valida siempre; con HTMX, el 422 se intercambia.
- [ ] El envío bloquea el doble submit y conserva los datos si falla.
- [ ] Wizard: progreso visible, datos persistentes, resumen final.
