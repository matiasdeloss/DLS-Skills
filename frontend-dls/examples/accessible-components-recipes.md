# Recetas de Componentes Accesibles

Implementaciones de referencia en HTML, CSS y JavaScript nativo, siguiendo WCAG 2.2 AA y los patrones documentados en [Component Gallery](https://component.gallery/). Usan los tokens de [design-tokens.css](./design-tokens.css).

Están en JS vanilla a propósito: el patrón se ve sin ruido de framework y se traduce a React, Vue o Svelte sin cambios conceptuales. Para las trampas propias de cada stack (Blade, HTMX, Alpine, Livewire, Bootstrap, Tailwind) ver [stack-notes](../references/stack-notes.md).

Índice: 1 Skip link · 2 Modal · 3 Combobox · 4 Tabs · 5 Toast · 6 Campo validado · 7 Accordion · 8 Alert · 9 File upload · 10 Stepper.

---

## 1. Skip link

Lo primero del `<body>`. Le ahorra a quien navega por teclado tabular todo el navbar en cada página.

```html
<a href="#main" class="skip-link">Saltar al contenido principal</a>
<!-- … header, nav … -->
<main id="main" tabindex="-1"> … </main>
```
```css
.skip-link {
  position: absolute;
  inset-block-start: -100px;
  inset-inline-start: var(--space-md);
  z-index: var(--z-tooltip);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: inset-block-start var(--motion-duration-fast) var(--motion-ease-standard);
}
.skip-link:focus-visible { inset-block-start: var(--space-md); }
```

El `tabindex="-1"` en `<main>` hace que reciba el foco al saltar; sin eso, algunos navegadores mueven el scroll pero no el foco, y la siguiente tabulación vuelve al navbar.

---

## 2. Modal accesible con `<dialog>` nativo

```html
<button type="button" id="open-dialog">Eliminar proyecto</button>

<dialog id="confirm-dialog" class="app-dialog" aria-labelledby="dialog-title">
  <header class="dialog-header">
    <h2 id="dialog-title">Confirmar eliminación</h2>
    <button type="button" class="btn-icon" aria-label="Cerrar" data-close>
      <svg aria-hidden="true" width="20" height="20"><use href="#icon-x"/></svg>
    </button>
  </header>

  <p>¿Seguro que querés eliminar este proyecto? Esta acción es irreversible.</p>

  <footer class="dialog-footer">
    <button type="button" class="btn-ghost" data-close>Cancelar</button>
    <button type="button" class="btn-destructive" data-confirm>Eliminar</button>
  </footer>
</dialog>
```

```js
const dialog = document.getElementById('confirm-dialog');
const openBtn = document.getElementById('open-dialog');
let lastFocused = null;

openBtn.addEventListener('click', () => {
  lastFocused = document.activeElement;
  dialog.showModal();                       // focus trap + backdrop + Escape, nativos
  document.body.style.overflow = 'hidden';  // bloquea el scroll del fondo
});

// `close` se dispara también al presionar Escape: un solo lugar para restaurar el foco
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  lastFocused?.focus();
});

dialog.querySelectorAll('[data-close]').forEach(btn =>
  btn.addEventListener('click', () => dialog.close('cancel'))
);

dialog.querySelector('[data-confirm]').addEventListener('click', () => {
  dialog.close('confirm');
});

// Cerrar al hacer click en el backdrop: el click en ::backdrop
// llega al <dialog> con el target siendo el propio dialog.
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close('cancel');
});
```

```css
.app-dialog {
  max-inline-size: min(32rem, calc(100vw - var(--space-xl)));
  padding: var(--space-lg);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
  box-shadow: var(--elevation-3);
}
.app-dialog::backdrop { background: var(--color-backdrop); }

/* Animación de entrada sin JavaScript */
.app-dialog[open] {
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--motion-duration-normal) var(--motion-ease-decelerate),
              transform var(--motion-duration-normal) var(--motion-ease-decelerate),
              overlay var(--motion-duration-normal) allow-discrete,
              display var(--motion-duration-normal) allow-discrete;
}
@starting-style {
  .app-dialog[open] { opacity: 0; transform: scale(0.96); }
}
```

**Por qué escuchar `close` en vez de manejar cada botón**: `Escape` cierra el diálogo sin pasar por ningún handler propio. Si restaurás el foco solo en el click de "Cancelar", quien cierra con teclado pierde la posición.

---

## 3. Combobox / Autocomplete accesible

El componente donde más se improvisa ARIA y más se rompe. La clave: **el foco del DOM nunca sale del input**; la opción resaltada se comunica con `aria-activedescendant`.

```html
<div class="combobox-wrapper">
  <label for="city-input">Ciudad</label>
  <input
    id="city-input"
    type="text"
    role="combobox"
    aria-expanded="false"
    aria-controls="city-listbox"
    aria-autocomplete="list"
    autocomplete="off"
  />
  <ul id="city-listbox" role="listbox" aria-label="Ciudades" hidden></ul>
  <p id="city-status" class="sr-only" aria-live="polite"></p>
</div>
```

```js
const input   = document.getElementById('city-input');
const listbox = document.getElementById('city-listbox');
const status  = document.getElementById('city-status');
const CITIES  = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata'];

let options = [];
let activeIndex = -1;

function render(matches) {
  listbox.textContent = '';                 // no innerHTML: los datos pueden traer HTML
  matches.forEach((city, i) => {
    const li = document.createElement('li');
    li.id = `city-option-${i}`;
    li.role = 'option';
    li.textContent = city;                  // textContent escapa por definición
    li.setAttribute('aria-selected', 'false');
    li.addEventListener('click', () => select(i));
    listbox.append(li);
  });

  options = [...listbox.children];
  activeIndex = -1;
  const isOpen = matches.length > 0;
  listbox.hidden = !isOpen;
  input.setAttribute('aria-expanded', String(isOpen));
  input.removeAttribute('aria-activedescendant');

  // Quien no ve la lista necesita saber cuántos resultados hay
  status.textContent = isOpen
    ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}`
    : 'Sin resultados';
}

function setActive(index) {
  options.forEach(o => o.setAttribute('aria-selected', 'false'));
  activeIndex = index;
  const option = options[index];
  option.setAttribute('aria-selected', 'true');
  option.scrollIntoView({ block: 'nearest' });
  input.setAttribute('aria-activedescendant', option.id);  // el foco sigue en el input
}

function select(index) {
  input.value = options[index].textContent;
  close();
}

function close() {
  listbox.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
  activeIndex = -1;
}

input.addEventListener('input', () => {
  const q = input.value.trim().toLowerCase();
  render(q ? CITIES.filter(c => c.toLowerCase().includes(q)) : []);
});

input.addEventListener('keydown', (e) => {
  const isOpen = !listbox.hidden;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen) { render(CITIES); return; }
      setActive((activeIndex + 1) % options.length);
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (!isOpen) return;
      setActive((activeIndex - 1 + options.length) % options.length);
      break;
    case 'Enter':
      if (isOpen && activeIndex >= 0) { e.preventDefault(); select(activeIndex); }
      break;
    case 'Escape':
      close();
      break;
    case 'Home':
      if (isOpen) { e.preventDefault(); setActive(0); }
      break;
    case 'End':
      if (isOpen) { e.preventDefault(); setActive(options.length - 1); }
      break;
  }
});

// Cerrar al perder el foco, pero no cuando el foco pasa a una opción
input.addEventListener('blur', (e) => {
  if (!listbox.contains(e.relatedTarget)) close();
});
```

---

## 4. Tabs con roving tabindex

```html
<div class="tabs">
  <div role="tablist" aria-label="Ajustes de cuenta">
    <button role="tab" id="tab-perfil"   aria-selected="true"  aria-controls="panel-perfil"   tabindex="0">Perfil</button>
    <button role="tab" id="tab-seguridad" aria-selected="false" aria-controls="panel-seguridad" tabindex="-1">Seguridad</button>
    <button role="tab" id="tab-facturacion" aria-selected="false" aria-controls="panel-facturacion" tabindex="-1">Facturación</button>
  </div>

  <div role="tabpanel" id="panel-perfil"      aria-labelledby="tab-perfil"      tabindex="0">…</div>
  <div role="tabpanel" id="panel-seguridad"   aria-labelledby="tab-seguridad"   tabindex="0" hidden>…</div>
  <div role="tabpanel" id="panel-facturacion" aria-labelledby="tab-facturacion" tabindex="0" hidden>…</div>
</div>
```

```js
const tabList = document.querySelector('[role="tablist"]');
const tabs    = [...tabList.querySelectorAll('[role="tab"]')];
const panels  = [...document.querySelectorAll('[role="tabpanel"]')];

function activateTab(tab, setFocus = true) {
  tabs.forEach(t => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.setAttribute('tabindex', selected ? '0' : '-1');   // roving tabindex
  });
  panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
  if (setFocus) tab.focus();
}

tabList.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab) activateTab(tab);
});

tabList.addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  if (i === -1) return;

  const next = {
    ArrowRight: (i + 1) % tabs.length,
    ArrowLeft:  (i - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  }[e.key];

  if (next === undefined) return;
  e.preventDefault();
  activateTab(tabs[next]);
});
```

El `tabindex="0"` en cada panel permite que quien navega por teclado llegue al contenido del panel con un solo `Tab` después de la tab activa, incluso si el panel no tiene elementos interactivos.

---

## 5. Toast / Notification accesible

```html
<div id="toast-region" class="toast-region" aria-live="polite" aria-label="Notificaciones"></div>
```

```js
function showToast({ title, message, type = 'info', duration = 5000 }) {
  const region = document.getElementById('toast-region');

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  // Un error interrumpe; el resto espera su turno.
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  // Construcción con createElement/textContent, NUNCA innerHTML:
  // `title` y `message` suelen venir de datos y podrían inyectar HTML (XSS).
  const content = document.createElement('div');
  content.className = 'toast__content';

  const strong = document.createElement('strong');
  strong.textContent = title;

  const p = document.createElement('p');
  p.textContent = message;

  content.append(strong, p);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast__close';
  closeBtn.setAttribute('aria-label', 'Cerrar notificación');
  closeBtn.textContent = '✕';

  toast.append(content, closeBtn);
  region.append(toast);

  let timer = setTimeout(dismiss, duration);
  const pause  = () => clearTimeout(timer);
  const resume = () => { timer = setTimeout(dismiss, 2000); };

  // El temporizador debe pausarse mientras el usuario lee o navega dentro
  toast.addEventListener('mouseenter', pause);
  toast.addEventListener('mouseleave', resume);
  toast.addEventListener('focusin',  pause);
  toast.addEventListener('focusout', resume);
  closeBtn.addEventListener('click', dismiss);

  function dismiss() {
    clearTimeout(timer);
    toast.classList.add('toast--exit');
    // Fallback: con prefers-reduced-motion la animación dura 0.01ms y
    // animationend igual se dispara, pero si alguien la desactivara por
    // completo el toast quedaría colgado. El timeout lo cubre.
    const remove = () => toast.remove();
    toast.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 500);
  }

  return dismiss;
}
```

**Qué no meter en un toast**: información crítica o irrecuperable. Desaparece sola, y quien usa lector de pantalla o lee despacio se la pierde. Errores que requieren acción van inline, cerca de lo que falló.

---

## 6. Campo de formulario con validación accesible

```html
<div class="field">
  <label for="username">
    Nombre de usuario
    <span aria-hidden="true" class="field__required">*</span>
  </label>

  <input
    type="text"
    id="username"
    name="username"
    required
    autocomplete="username"
    aria-describedby="username-hint username-error"
    aria-invalid="false"
  />

  <p id="username-hint" class="field__hint">Mínimo 4 caracteres alfanuméricos.</p>
  <p id="username-error" class="field__error" hidden>
    <svg aria-hidden="true" width="16" height="16"><use href="#icon-alert"/></svg>
    El nombre debe tener al menos 4 caracteres y no contener símbolos.
  </p>
</div>
```

```js
const input = document.getElementById('username');
const error = document.getElementById('username-error');
let hasBeenValidated = false;

function validate() {
  const valid = /^[a-zA-Z0-9]{4,}$/.test(input.value);
  input.setAttribute('aria-invalid', String(!valid));
  error.hidden = valid;
  return valid;
}

// Validar al salir del campo, no mientras escribe:
// marcar en rojo un valor a medio tipear es hostil.
input.addEventListener('blur', () => { hasBeenValidated = true; validate(); });

// Una vez que ya hay error, sí revalidar en cada tecla,
// para que vea el momento exacto en que lo corrigió.
input.addEventListener('input', () => { if (hasBeenValidated) validate(); });
```

El ícono además del color cumple 1.4.1 (el color no es el único portador de significado), y `aria-describedby` hace que el lector de pantalla lea la ayuda y el error como parte del campo.

**Al enviar con errores**: movés el foco al primer campo inválido, o a un resumen arriba del formulario con enlaces a cada campo. Sin eso, quien envía un formulario largo y falla no tiene forma de saber qué pasó ni dónde.

---

## 7. Accordion / Disclosure accesible

**Primera opción: nativo.** `<details>` da rol, estado y teclado sin una línea de JavaScript.

```html
<details class="disclosure">
  <summary>¿Cómo cancelo mi suscripción?</summary>
  <div class="disclosure__body">
    <p>Desde Ajustes → Facturación → Cancelar. El acceso sigue hasta el fin del período pagado.</p>
  </div>
</details>
```

**Si necesitás control total** (animación, un solo panel abierto, estado externo): botón dentro del heading.

```html
<div class="accordion">
  <h3>
    <button type="button" class="accordion__trigger" id="acc-1-btn"
            aria-expanded="false" aria-controls="acc-1-panel">
      Envíos y devoluciones
    </button>
  </h3>
  <div class="accordion__panel" id="acc-1-panel" role="region"
       aria-labelledby="acc-1-btn" hidden>
    <p>Los envíos demoran de 3 a 5 días hábiles.</p>
  </div>
</div>
```

```js
document.querySelectorAll('.accordion__trigger').forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
  });
});
```

```css
.accordion__trigger {
  inline-size: 100%;
  text-align: start;
  padding: var(--space-md);
  min-block-size: 44px;                 /* target táctil */
}
.accordion__trigger::after {            /* indicador; el estado lo comunica aria-expanded */
  content: '+';
  float: inline-end;
}
.accordion__trigger[aria-expanded='true']::after { content: '−'; }
```

**Por qué `type="button"`**: dentro de un `<form>` el default es `submit`. **Por qué `<h3>` alrededor del botón**: el lector puede saltar entre encabezados, y el botón dentro conserva su rol. Con muchos paneles, quitá `role="region"` para no llenar la lista de landmarks.

---

## 8. Alert / Banner accesible

```html
<!-- Presente al cargar la página: NO lleva rol vivo, se lee en orden -->
<div class="alert alert--warning">
  <svg aria-hidden="true" width="20" height="20"><use href="#icon-alert"/></svg>
  <p><strong>Mantenimiento programado.</strong> El sistema no estará disponible el sábado de 2 a 4 h.</p>
</div>

<!-- Para mensajes dinámicos: una región que YA existe en el DOM -->
<div id="alert-region" class="alert-region"></div>
```

```js
// La región existe desde el inicio; solo se agrega contenido (así los lectores lo anuncian).
function showAlert({ message, type = 'info' }) {
  const region = document.getElementById('alert-region');

  const alert = document.createElement('div');
  alert.className = `alert alert--${type}`;
  // Errores interrumpen (alert); el resto espera su turno (status).
  alert.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const text = document.createElement('p');
  text.textContent = message;          // datos → textContent, nunca innerHTML

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'alert__close';
  close.setAttribute('aria-label', 'Cerrar aviso');
  close.textContent = '✕';
  close.addEventListener('click', () => {
    // No pierdas el foco: pasalo a un destino lógico antes de quitarlo.
    (document.getElementById('main') ?? document.body).focus?.();
    alert.remove();
  });

  alert.append(text, close);
  region.append(alert);
}
```

```css
.alert {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-inline-start: 4px solid var(--alert-accent);   /* color + ícono + texto */
  background: var(--color-surface-container);
  color: var(--color-on-surface);
}
.alert--error   { --alert-accent: var(--color-error); }
.alert--warning { --alert-accent: var(--color-warning); }
.alert--success { --alert-accent: var(--color-success); }
.alert--info    { --alert-accent: var(--color-primary); }
```

**Qué no hacer**: poner `role="alert"` a todo — cada alerta asertiva interrumpe lo que el lector estaba leyendo. Reservala para errores. Lo importante e irrecuperable va **persistente** y cerca de lo afectado, no en un toast.

---

## 9. File upload accesible

```html
<div class="field">
  <label for="docs">Documentos</label>
  <p id="docs-hint">PDF o imagen, hasta 5 MB cada uno.</p>
  <input id="docs" name="docs[]" type="file" multiple
         accept=".pdf,image/*" aria-describedby="docs-hint docs-error">
  <p id="docs-error" class="field__error" role="alert" hidden></p>
  <ul id="docs-list" class="file-list" aria-label="Archivos seleccionados"></ul>
  <p id="docs-status" class="sr-only" aria-live="polite"></p>
</div>
```

```js
const input  = document.getElementById('docs');
const list   = document.getElementById('docs-list');
const error  = document.getElementById('docs-error');
const status = document.getElementById('docs-status');
const MAX = 5 * 1024 * 1024;

// Cortesía para el usuario: el SERVIDOR siempre vuelve a validar tipo y tamaño.
function render(files) {
  list.textContent = '';
  [...files].forEach((file, i) => {
    const li = document.createElement('li');

    const name = document.createElement('span');
    name.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Quitar ${file.name}`);
    remove.textContent = 'Quitar';
    remove.addEventListener('click', () => removeAt(i));

    li.append(name, remove);
    list.append(li);
  });
  status.textContent = `${files.length} ${files.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}`;
}

function removeAt(index) {
  const dt = new DataTransfer();                 // un FileList no se modifica: se reconstruye
  [...input.files].forEach((f, i) => { if (i !== index) dt.items.add(f); });
  input.files = dt.files;
  render(input.files);
  input.focus();                                 // el botón desapareció: devolvé el foco
}

input.addEventListener('change', () => {
  const tooBig = [...input.files].filter((f) => f.size > MAX);
  error.hidden = tooBig.length === 0;
  error.textContent = tooBig.length
    ? `Estos archivos superan 5 MB: ${tooBig.map((f) => f.name).join(', ')}.`
    : '';
  input.setAttribute('aria-invalid', String(tooBig.length > 0));
  render(input.files);
});
```

**Por qué nativo**: el `<input type="file">` ya es operable por teclado y lector. Una zona de arrastre es una **mejora** (agregala encima), nunca el único camino. **Por qué devolver el foco**: al quitar un archivo, el botón enfocado se elimina del DOM y el foco se pierde.

---

## 10. Stepper / Wizard accesible

```html
<nav aria-label="Progreso del alta">
  <ol class="stepper">
    <li class="stepper__step is-complete">
      <span class="stepper__name">Datos personales</span>
      <span class="sr-only">(completado)</span>
    </li>
    <li class="stepper__step is-current" aria-current="step">
      <span class="stepper__name">Contacto</span>
      <span class="sr-only">(paso actual)</span>
    </li>
    <li class="stepper__step">
      <span class="stepper__name">Confirmación</span>
      <span class="sr-only">(pendiente)</span>
    </li>
  </ol>
</nav>

<form id="wizard" novalidate>
  <section data-step="1" hidden> <h2 tabindex="-1">Datos personales</h2> … </section>
  <section data-step="2">        <h2 tabindex="-1">Contacto</h2>         … </section>
  <section data-step="3" hidden> <h2 tabindex="-1">Confirmación</h2>     … </section>
  <button type="button" data-prev>Volver</button>
  <button type="button" data-next>Continuar</button>
</form>
```

```js
const steps = [...document.querySelectorAll('#wizard [data-step]')];
let current = 1;

function goTo(n) {
  current = Math.min(Math.max(n, 1), steps.length);
  steps.forEach((s, i) => { s.hidden = i + 1 !== current; });

  // Actualizá el progreso (texto + aria-current) y mové el foco al título del paso.
  document.querySelectorAll('.stepper__step').forEach((li, i) => {
    li.classList.toggle('is-current', i + 1 === current);
    li.classList.toggle('is-complete', i + 1 < current);
    if (i + 1 === current) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
  steps[current - 1].querySelector('h2').focus();
}

document.querySelector('[data-next]').addEventListener('click', () => {
  // Validá el paso actual antes de avanzar (ver forms-and-validation.md §5).
  goTo(current + 1);
});
document.querySelector('[data-prev]').addEventListener('click', () => goTo(current - 1));
```

**Por qué el estado en texto**: un ícono de "check" o el color no llegan al lector de pantalla; el texto oculto (`sr-only`) sí. **Por qué el foco al `<h2>`**: tras cambiar de paso, el foco quedaría en un botón que ya no es relevante; llevarlo al título orienta a quien navega por teclado o lector. Guardá lo ingresado al ir y volver.
