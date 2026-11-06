# Frontend DLS

Skill **principal** de frontend (sistema de diseño + ingeniería de UI): cómo construir y revisar interfaces accesibles, rápidas y consistentes. Funciona en **Claude** y en **Antigravity** (la estructura `SKILL.md` + `references/` es el formato estándar de skills en ambos).

Forma un **sistema de dos skills** con su hermana de investigación:

| Skill | Rol | Responde |
| :--- | :--- | :--- |
| **`frontend-dls`** (esta) | Principal, operativa | *¿Cómo lo construyo / lo reviso?* Modelo de 5 pasos, componentes, formularios, patrones de pantalla, recetas, tokens, auditor. |
| **`frontend-dls-investigacion`** | Apoyo: investigación + reglas globales | *¿Por qué? ¿Cuál es el estándar exacto? ¿Cómo lo verifico?* Leyes de UX, WCAG 2.2, Core Web Vitals, sistemas de diseño, seguridad, método de investigación. |

`frontend-dls` se **apoya** en `frontend-dls-investigacion` cuando falta el porqué, un umbral exacto o hay que investigar una duda (la sección "Cuándo apoyarte en frontend-dls-investigacion" de `SKILL.md` lista los disparadores). Las referencias entre las dos skills son **por nombre de skill**, no por ruta, para que se puedan desplegar por separado.

**Un solo dueño por tema**: leyes de UX, criterios WCAG, umbrales de Web Vitals y teoría de tokens viven en `frontend-dls-investigacion`; los *valores de implementación* viven en `examples/design-tokens.css` de esta skill.

---

## Fuentes

[Laws of UX](https://lawsofux.com/) · [Material Design 3](https://m3.material.io/) · [Fluent 2](https://fluent2.microsoft.design/) · [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) · [The Component Gallery](https://component.gallery/) · [web.dev](https://web.dev/)

---

## Estructura

```text
frontend-dls/
├── SKILL.md                               # Núcleo: modelo de 5 pasos, cuándo apoyarse en investigacion,
│                                          #   índice de referencias, reglas de oro y checklist
├── README.md
├── references/                            # Guías operativas (progressive disclosure)
│   ├── component-encyclopedia.md          # 8 estados, anatomía, ARIA y teclado de ~30 componentes
│   ├── forms-and-validation.md            # Validación, errores, wizard, autocompletado, por stack
│   ├── layout-and-navigation-patterns.md  # Dashboard, lista-detalle, navegación responsive, densidad
│   ├── modern-css-and-semantics.md        # Landmarks, @container, subgrid, :has(), popover, @layer
│   ├── stack-notes.md                     # HTML plano, React, Blade + HTMX + Alpine/Livewire, Bootstrap, Tailwind
│   ├── images-icons-media.md              # srcset, formatos, íconos SVG, video, gráficos
│   ├── visual-polish.md                   # Acabado: radio concéntrico, superficies, motion útil, íconos, tema
│   ├── anti-generic-ui.md                 # Señales de UI genérica con excepción, contenido honesto, DESIGN.md
│   ├── ux-writing-and-microcopy.md        # Errores, vacíos, CTAs, confirmaciones
│   └── testing-and-auditing-frontend.md   # axe, Lighthouse, Playwright, regresión visual, prueba manual, CI
├── examples/
│   ├── design-tokens.css                  # Tokens de producción (light/dark, densidad, safe areas)
│   └── accessible-components-recipes.md   # Skip link, Dialog, Combobox, Tabs, Toast, Campo,
│                                          #   Accordion, Alert, File upload, Stepper
└── scripts/
    └── audit-frontend.js                  # Auditor estático real (sin dependencias)
```

**Por qué esta estructura y no un archivo único**: solo `SKILL.md` se carga en contexto cuando la skill se activa. Las referencias se leen bajo demanda, según la tarea. El costo de tener la skill activa es bajo y el detalle sigue disponible cuando hace falta.

---

## El auditor

```bash
node scripts/audit-frontend.js ./src              # auditar un proyecto
node scripts/audit-frontend.js ./src --json       # salida procesable
node scripts/audit-frontend.js ./src --only=a11y  # una categoría: a11y, perf, tokens, markup, security
node scripts/audit-frontend.js ./src --only=slop  # heurísticas "se ve genérico" (opt-in, siempre warn); --all = todo + slop
node scripts/audit-frontend.js ./src --quiet      # solo errores
```

Sin dependencias — solo Node. Exit code 1 si hay errores (apto para CI o pre-commit), 2 si la ruta no existe.

Detecta, entre otras cosas: `tabindex` positivo, `<img>` sin `alt` o sin dimensiones, handlers de click (React, Alpine, Livewire, HTMX) en elementos no interactivos, botones de solo ícono sin nombre accesible, `<button>` sin `type`, modales y `<dialog>` sin nombre accesible, `aria-hidden` en elementos enfocables, `outline: none` (CSS y Tailwind) sin reemplazo, viewport que bloquea el zoom, `loading="lazy"` en el hero, transiciones sobre propiedades de layout, colores hardcodeados, espaciado fuera de la grilla de 4px, `innerHTML` con interpolación, `{!! !!}` de Blade y `animation: none` dentro de `prefers-reduced-motion`.

**Qué NO es**: un parser ni un navegador. Es análisis de texto sobre los patrones que se repiten en code review. No reemplaza a axe, Lighthouse ni a recorrer la interfaz con el teclado y un lector de pantalla — cada hallazgo es una pregunta para verificar, no una sentencia. Cómo integrarlo: [testing-and-auditing-frontend](./references/testing-and-auditing-frontend.md).

Escanea `.html`, `.css`, `.scss`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, `.php` (Blade), `.twig`, `.erb`, e ignora `node_modules`, `vendor`, `dist`, `build` y similares. Los archivos de tokens (`*tokens.css`, `*theme.css`, `*variables.css`…) quedan exentos de las reglas de valores hardcodeados.

---

## Instalación (las dos skills juntas)

Las dos carpetas se instalan **lado a lado** en el mismo directorio de skills.

### Antigravity — skills de proyecto
```bash
mkdir -p .agents/skills/frontend-dls .agents/skills/frontend-dls-investigacion
cp -r /ruta/a/frontend-dls/*          .agents/skills/frontend-dls/
cp -r /ruta/a/frontend-dls-investigacion/* .agents/skills/frontend-dls-investigacion/
```

### Claude (Claude Code / proyecto)
```bash
mkdir -p .claude/skills/frontend-dls .claude/skills/frontend-dls-investigacion
cp -r /ruta/a/frontend-dls/*          .claude/skills/frontend-dls/
cp -r /ruta/a/frontend-dls-investigacion/* .claude/skills/frontend-dls-investigacion/
```
Para disponibilidad global: `~/.claude/skills/` en lugar de `.claude/skills/`.

### Claude (cuenta)
Subí cada carpeta como una skill propia. Ambas deben estar activas para que `frontend-dls` pueda apoyarse en `frontend-dls-investigacion`.

---

## Cuándo se activa

La descripción de `SKILL.md` está escrita para dispararse en pedidos como:

- *"Armá la pantalla de listado de estudiantes con filtros"*
- *"Creá un modal accesible para confirmar una eliminación"*
- *"Revisá este formulario: contraste, teclado y mensajes de error"*
- *"Armá un sistema de tokens con modo oscuro"*
- *"Esta página se siente lenta / salta al cargar"*
- *"Auditá el frontend"* · *"¿Qué estados le faltan a este componente?"*

Y deriva a `frontend-dls-investigacion` ante preguntas del tipo *"¿por qué?"*, *"¿qué dice el estándar?"* o *"investigá cómo lo hace X"*.

---

## Adoptar los tokens

`examples/design-tokens.css` es la fuente de verdad de valores:

1. Reemplazá la escala `--primitive-brand-*` por la de tu marca.
2. No cambies los nombres semánticos (`--color-primary`, `--color-surface`…): son el contrato con los componentes.
3. En los componentes usá **solo** tokens semánticos, nunca primitivos.

El archivo trae light/dark (por preferencia del sistema y por toggle manual), modo compacto, safe areas de iOS, escala de z-index, y las bases de `prefers-reduced-motion` y `forced-colors`.
