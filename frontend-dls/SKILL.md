---
name: frontend-dls
description: "Skill PRINCIPAL de frontend (sistema de diseño + ingeniería de UI). Se usa siempre que se crea, modifica, revisa o audita cualquier interfaz: componentes (botón, formulario, input, modal, tabs, combobox, tabla, toast, drawer, card, menú, navegación), pantallas y layouts, HTML/CSS/Blade/JSX, responsive, modo oscuro, design tokens, estados (loading, empty, error), accesibilidad, teclado, animaciones o rendimiento percibido. Se activa con pedidos como 'armá/diseñá esta pantalla', 'revisá este componente', 'hacelo accesible', 'mejorá este diseño', 'auditá el frontend', 'se ve mal', 'se siente lento', 'qué estados le faltan'. Aporta el modelo de 5 pasos, la matriz de 8 estados, enciclopedia de componentes, recetas accesibles, plantilla de tokens CSS, guía para evitar lo genérico y un auditor estático (audit-frontend.js). Cuando falte el porqué, un umbral exacto, un estándar o haya que investigar una duda, se apoya en la skill frontend-dls-investigacion."
---

# Frontend DLS — Sistema de diseño e ingeniería de UI

Skill **operativa**: dice *cómo construir y revisar* una interfaz. El *porqué* y el *estándar exacto* (leyes de UX, criterios WCAG, umbrales de Core Web Vitals, teoría de tokens, método de investigación) viven en la skill hermana **`frontend-dls-investigacion`**; acá se la invoca cuando hace falta ([cuándo](#cuándo-apoyarte-en-frontend-investigacion)).

## Cómo usar esta skill

**Modo construir** — creás un componente, pantalla o flujo. Recorré el [modelo de 5 pasos](#el-modelo-mental-en-5-pasos) en orden: cada paso previene una clase de defecto carísima de arreglar después (un `<div onClick>` que hay que reescribir, tokens que faltan, un layout shift que aparece recién en producción).

**Modo revisar** — ya existe algo. Andá al [checklist](#checklist-rápido-de-revisión) y corré `node scripts/audit-frontend.js <ruta>`. Al reportar, nombrá el principio o criterio incumplido, no solo el síntoma: "el foco no es visible (WCAG 2.4.7)" enseña el patrón; "falta un outline" solo parchea un caso. Los hallazgos del auditor son preguntas para verificar, no sentencias.

**Formatos listos:** [informe de auditoría](./references/testing-and-auditing-frontend.md#8-plantilla-de-informe-de-auditoría) y [crítica de diseño](./references/testing-and-auditing-frontend.md#9-formato-de-crítica-de-diseño); para entregar a desarrollo, la [spec de handoff](./references/component-encyclopedia.md#apéndice-a-spec-de-handoff-a-desarrollo).

Si lo que importa es que no se vea genérico, usá [anti-generic-ui](./references/anti-generic-ui.md): heurísticas con excepción, nunca por encima de accesibilidad ni del sistema del proyecto.

En ambos modos, explicá el *porqué*: las reglas tienen excepciones legítimas y solo quien entiende el motivo las detecta.

---

## El modelo mental en 5 pasos

1. **Semántica HTML nativa primero.** `<button>`, `<a href>`, `<dialog>`, `<details>`, `<nav>`, `<main>`, `<table>` antes que `<div>` con listeners: el nativo trae rol, foco y teclado gratis. → [modern-css-and-semantics](./references/modern-css-and-semantics.md).
2. **Accesibilidad desde el día 0.** Teclado de punta a punta, `:focus-visible` visible, contraste, `<label>` en todo input. No es una capa final. → [component-encyclopedia](./references/component-encyclopedia.md) (ARIA y teclado por componente) y, para el criterio exacto, *frontend-dls-investigacion*.
3. **Tokens y layout responsive.** Sin valores mágicos; mobile-first; `@container` para componentes. → plantilla [design-tokens.css](./examples/design-tokens.css) y [layout-and-navigation-patterns](./references/layout-and-navigation-patterns.md).
4. **Matriz de los 8 estados.** `Default`, `Hover`, `Focus-visible`, `Active`, `Disabled`, `Loading`, `Error`, `Empty`. Los más olvidados (loading y empty) son los que el usuario ve en el peor momento. → [component-encyclopedia §1](./references/component-encyclopedia.md#1-la-matriz-de-los-8-estados).
5. **Performance percibida.** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; hero sin `lazy`; dimensiones reservadas. → [images-icons-media](./references/images-icons-media.md); diagnóstico y umbrales completos en *frontend-dls-investigacion*.

---

## Cuándo apoyarte en frontend-dls-investigacion

Invocá la skill `frontend-dls-investigacion` (por nombre) en vez de improvisar cuando:

- Necesitás **justificar una decisión con una ley de UX** (Fitts, Hick, Jakob, Doherty, Tesler…) o explicar el porqué a otra persona.
- Hace falta el **criterio o umbral exacto**: un criterio WCAG 2.2 concreto, una relación de contraste, el tamaño de un target, un umbral de LCP/INP/CLS, cómo medir en campo.
- Entra en juego la **teoría de tokens o convenciones de plataforma** (Material 3, Fluent 2, Apple HIG): roles de color, elevación, motion, densidad, iOS vs Android vs web.
- La duda es de **seguridad en el cliente, i18n/RTL, SEO técnico o privacidad**.
- Hay que **investigar cómo lo resuelven otros** (Component Gallery, web.dev, MDN) o **verificar un dato volátil** (soporte de una API, versión de un framework) con fuente primaria.
- Dos reglas parecen **contradecirse** o no sabés cuál manda: la investigación desempata.

Regla de dueño único: si un dato está en las dos skills, el *estándar* manda desde `frontend-dls-investigacion` y los *valores de implementación* mandan desde [design-tokens.css](./examples/design-tokens.css).

**Desempate con otras skills de diseño.** Si otra skill (de estilo, de auditoría o de un plugin) contradice a esta, mandan estos mínimos: WCAG **2.2** AA y no 2.1; target táctil con piso de **24×24px (2.5.8)** y objetivo de 44×44px (el criterio 2.5.5 que exige 44px es nivel AAA, no AA); contraste 4.5:1 texto y 3:1 UI; `prefers-reduced-motion` respetado; animar solo `transform` y `opacity`. Una estética que pida el usuario (minimalista, editorial, etc.) puede cambiar la apariencia, nunca estos mínimos de accesibilidad.

---

## Referencias (leé solo la que corresponde)

| Tarea | Guía | Contenido |
| :--- | :--- | :--- |
| Componentes | [component-encyclopedia.md](./references/component-encyclopedia.md) | 8 estados, anatomía, ARIA y teclado de ~30 componentes, matices que se olvidan. |
| Formularios | [forms-and-validation.md](./references/forms-and-validation.md) | Cuándo y cómo validar, errores, wizard, autocompletado, Blade/HTMX/Livewire/React. |
| Pantallas | [layout-and-navigation-patterns.md](./references/layout-and-navigation-patterns.md) | Dashboard, lista-detalle, formulario; navbar/sidebar/tab bar; densidad. |
| CSS y HTML | [modern-css-and-semantics.md](./references/modern-css-and-semantics.md) | Landmarks, `@container`, subgrid, `:has()`, popover, `light-dark()`, `@layer`. |
| Tu stack | [stack-notes.md](./references/stack-notes.md) | HTML plano, React, Blade + HTMX + Alpine/Livewire, Bootstrap, Tailwind. |
| Imágenes y media | [images-icons-media.md](./references/images-icons-media.md) | `srcset`, formatos, íconos SVG, video, CLS. |
| Pulido visual | [visual-polish.md](./references/visual-polish.md) | Acabado final: radio concéntrico, superficies, `tabular-nums`, motion útil, íconos, cambio de tema sin barrido. Se usa después de estados y accesibilidad. |
| Anti-genérico | [anti-generic-ui.md](./references/anti-generic-ui.md) | Señales de UI "de plantilla" con su excepción, contenido y controles honestos, `DESIGN.md`, pasadas de revisión. |
| Textos | [ux-writing-and-microcopy.md](./references/ux-writing-and-microcopy.md) | Errores, vacíos, CTAs, confirmaciones. |
| Verificar | [testing-and-auditing-frontend.md](./references/testing-and-auditing-frontend.md) | axe, Lighthouse, Playwright, regresión visual, prueba manual, CI. |

## Recursos listos para usar

- **[examples/design-tokens.css](./examples/design-tokens.css)** — tokens completos light/dark, roles, elevación, tipografía, motion, densidad. **Fuente de verdad de valores.**
- **[examples/accessible-components-recipes.md](./examples/accessible-components-recipes.md)** — skip link, dialog, combobox, tabs, toast, campo validado, accordion, alert, file upload, stepper.
- **[scripts/audit-frontend.js](./scripts/audit-frontend.js)** — auditor estático sin dependencias; `--json`, `--only=a11y,perf,tokens,markup,security`, `--quiet`; exit 1 si hay errores (apto CI). La categoría `slop` (heurísticas "se ve genérico", siempre warn) es opt-in: `--only=slop` o `--all`.

---

## Reglas de oro

**Botón vs enlace.** Navega a otra URL → `<a href>`. Ejecuta una acción, envía un formulario o abre un modal → `<button type="…">`. Un `<div onClick>` no es ninguno: sin foco, sin `Enter`/`Space`, sin anuncio, sin "abrir en pestaña nueva". Vale igual para Alpine (`@click`), Livewire (`wire:click`) y HTMX (`hx-get`/`hx-post`) sobre un `<div>`.

**`type` explícito en cada `<button>`.** Dentro de un `<form>` el default es `submit`: un "Cancelar" sin `type="button"` envía el formulario.

**Animá solo `transform` y `opacity`.** El resto fuerza reflow por frame y ensucia el CLS.

**Feedback antes de 100ms, resolución antes de 400ms.** Si tarda más: UI optimista o skeleton del tamaño exacto del contenido final.

**Una sola acción primaria por vista.** Si todo está destacado, nada lo está.

**El color nunca es el único portador de significado.** Borde rojo **+** ícono **+** texto.

**`prefers-reduced-motion`: reducí, no elimines.** `animation-duration: 0.01ms`, nunca `animation: none` (cancela `animationend` y deja toasts y modales colgados).

**Nada de `innerHTML` con datos.** `textContent` o `createElement`; en Blade, `{{ }}` y no `{!! !!}` salvo HTML tuyo.

---

## Checklist rápido de revisión

Marcá lo que falla y citá el principio.

**Semántica y estructura**
- [ ] ¿Elementos nativos en vez de `<div>` con listeners? ¿Un solo `<h1>` y headings sin saltos? ¿Landmarks (`header`, `nav`, `main`, `footer`)?

**Interacción y accesibilidad**
- [ ] ¿Teclado completo sin trampas? ¿`:focus-visible` visible y con contraste?
- [ ] ¿Targets ≥ 44×44px (mínimo absoluto WCAG 2.2: 24×24)? ¿Contraste 4.5:1 texto / 3:1 UI?
- [ ] ¿Cada input con `<label for>`? ¿Botones de ícono con `aria-label`? ¿Errores con `aria-describedby`?
- [ ] ¿`<button>` con `type` explícito? ¿Modales con nombre accesible (`aria-labelledby`)?

**Diseño y sistema**
- [ ] ¿Agrupación por proximidad y una sola acción primaria?
- [ ] ¿Los 8 estados, incluidos loading y empty (con sus tres variantes)?
- [ ] ¿Espaciado en la grilla de 4px y colores vía tokens semánticos?
- [ ] ¿Funciona en modo oscuro y `forced-colors`? ¿Existe en Component Gallery y seguimos su nomenclatura?

**Rendimiento**
- [ ] ¿Imágenes con `width`/`height`? ¿Hero sin `lazy` y con `fetchpriority="high"`? ¿Fuentes con `swap`?
- [ ] ¿Sin tareas largas en handlers? ¿Solo `transform` y `opacity` animados?

**Seguridad y criterio**
- [ ] ¿Sin `innerHTML`/`{!! !!}` con datos no confiables?
- [ ] ¿Algo que quitar sin perder valor (Occam)? ¿La complejidad la absorbe el sistema y no el usuario (Tesler)?
