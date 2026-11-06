---
name: frontend-dls-investigacion
description: "Skill de investigación y reglas globales de TODO el frontend: la fuente de criterio detrás de cualquier decisión de UI/UX, en cualquier stack. Se usa cuando hay que justificar, investigar o verificar algo: qué ley de UX aplica (Fitts, Hick, Jakob, Doherty, Gestalt…), qué exige WCAG 2.2 AA (contraste, foco, targets, ARIA), umbrales de Core Web Vitals (LCP, INP, CLS), cómo lo resuelven Material 3, Fluent 2, Apple HIG, Component Gallery o web.dev, convenciones por plataforma, seguridad y privacidad en el cliente, i18n/RTL, SEO técnico y buenas prácticas web. Se activa ante 'por qué', 'cuál es el estándar', 'qué dice la norma', 'es buena práctica', 'investigá cómo se hace', 'cómo lo hacen otros sistemas', o cuando frontend-dls necesite profundizar. Define el método de investigación con fuentes primarias, cómo citar el criterio incumplido y las reglas globales no negociables."
---

# Frontend — Investigación y reglas globales

Esta skill es el **criterio y la fuente de verdad** detrás de las decisiones de frontend: el *porqué*, el *estándar* y el *método para verificar*. Vale para cualquier stack (Blade, React, HTMX, Tailwind, Bootstrap, lo que sea): los estándares no dependen del framework.

## Reparto con `frontend-dls`

| Pregunta | Skill |
| :--- | :--- |
| "¿Cómo construyo / reviso este componente, pantalla o CSS?" | **`frontend-dls`** (flujo de 5 pasos, componentes, recetas, CSS moderno, plantilla de tokens, auditor) |
| "¿Por qué es así? ¿Qué dice la norma? ¿Cuál es el umbral exacto? ¿Cómo lo hacen otros?" | **`frontend-dls-investigacion`** (esta) |

`frontend-dls` trae lo necesario para el día a día y **delega acá** cuando hace falta profundizar. Un solo dueño por tema: los valores numéricos de los tokens viven en `design-tokens.css` de `frontend-dls`; los estándares, las leyes y los umbrales viven en las referencias de esta skill. Si una skill cita a la otra, lo hace **por nombre y tema**, nunca por ruta.

---

## Tres modos de uso

1. **Investigar** — hay una duda abierta ("¿es buena práctica X?", "¿cómo resuelven este componente otros sistemas?"). Seguí el método de abajo y leé [research-method-and-sources.md](references/research-method-and-sources.md).
2. **Consultar una regla** — se necesita el criterio exacto (umbral, criterio WCAG, ley de UX). Andá directo a la referencia del índice y citá la fuente.
3. **Auditar con criterio** — se revisa algo existente y hay que explicar *por qué* falla. Usá el checklist del final y, al reportar, **nombrá el criterio incumplido**: "el foco no es visible (WCAG 2.4.7)" enseña el patrón; "falta un outline" solo parchea un caso.

En los tres modos, explicá siempre el *porqué*. Estas reglas tienen excepciones legítimas y solo quien entiende el motivo puede detectarlas.

---

## Método de investigación (resumen)

Detalle y plantillas en [research-method-and-sources.md](references/research-method-and-sources.md).

**1. Escalera de fuentes** (de mayor a menor autoridad):
1. **Especificaciones y documentación primaria** — W3C/WAI (WCAG), WHATWG (HTML), MDN, web.dev, documentación oficial del framework.
2. **Documentación de design systems** — Material 3, Fluent 2, Apple HIG; Component Gallery para comparar implementaciones reales.
3. **Artículos, blogs, respuestas de foros** — solo para entender o encontrar el camino hacia (1) o (2); nunca como única prueba.

**2. Verificá lo volátil.** Umbrales de métricas, niveles de criterios WCAG, soporte de navegadores y cualquier dato que cambie con las versiones se confirma contra la fuente primaria en el momento, no de memoria. Anotá la fecha de verificación.

**3. Separá en el informe**: **hecho** (lo dice una especificación), **convención** (lo hacen los sistemas maduros, sin ser norma), **opinión** (criterio razonado del autor) y **suposición** (no verificado). Mezclarlos es lo que hace que una recomendación parezca más sólida de lo que es.

**4. Citá el criterio incumplido**, no solo el síntoma: número y nombre del criterio (WCAG 2.4.7 Focus Visible), métrica con su umbral (LCP > 2.5s), ley con su consecuencia (Hick: demasiadas opciones).

**5. Declará los límites.** Si no pudiste verificar algo, decilo. Un "no verificado" honesto vale más que una certeza inventada.

---

## Reglas globales no negociables

Resumen. Cada una, con su porqué y su excepción legítima, está en [global-frontend-rules.md](references/global-frontend-rules.md).

1. **Semántica nativa primero**: `<button>`, `<a href>`, `<dialog>`, `<details>`, `<nav>`, `<main>`, `<table>` antes que `<div>` con handlers.
2. **Accesibilidad desde el día 0**: teclado de punta a punta, `:focus-visible` visible, contraste 4.5:1 / 3:1, todo input con `<label for>`. → [accessibility-wcag.md](references/accessibility-wcag.md)
3. **El color nunca es el único portador de significado** (WCAG 1.4.1).
4. **Tokens semánticos, no valores mágicos**; el par `on-` verificado en el token. → [design-systems-and-tokens.md](references/design-systems-and-tokens.md)
5. **Todos los estados**: default, hover, focus-visible, active, disabled, loading, error, empty.
6. **Core Web Vitals en el percentil 75 de campo**: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. → [web-vitals-and-performance.md](references/web-vitals-and-performance.md)
7. **Nunca datos no confiables en `innerHTML`**; secretos jamás en el cliente. → [frontend-security-and-privacy.md](references/frontend-security-and-privacy.md)
8. **Texto siempre localizable**: `lang` correcto, sin strings concatenadas, propiedades lógicas. → [i18n-and-localization.md](references/i18n-and-localization.md)
9. **Una sola acción primaria por vista**; feedback < 100ms, resolución < 400ms (Doherty). → [ux-laws-and-heuristics.md](references/ux-laws-and-heuristics.md)
10. **Respetar las preferencias del sistema**: `prefers-reduced-motion`, `prefers-color-scheme`, `forced-colors`, zoom (nunca `user-scalable=no`).

---

## Leyes de UX aplicadas

Tabla corta; el detalle y el código están en [ux-laws-and-heuristics.md](references/ux-laws-and-heuristics.md).

| Ley | Qué predice | Consecuencia técnica |
| :--- | :--- | :--- |
| **Fitts** | El tiempo de alcance depende de tamaño y distancia | Targets ≥ 44×44; acciones frecuentes en la zona del pulgar; bordes como "objetivos infinitos" |
| **Hick** | El tiempo de decisión crece con las opciones | Progressive disclosure, wizards, combobox sobre ~7-10 opciones, una sola acción primaria |
| **Jakob** | Esperan que funcione como los otros sitios | Convenciones estándar; `Escape` cierra; el botón atrás funciona; respetar lo nativo de cada plataforma |
| **Miller** | ~7±2 elementos en memoria de trabajo | Chunking; nunca pedir que recuerde algo de un paso anterior |
| **Doherty** | Bajo 400ms se siente conversación, no espera | Feedback < 100ms, UI optimista, skeletons del tamaño exacto del contenido |
| **Postel** | Liberal al recibir, estricto al emitir | Aceptar formatos varios y normalizar; errores que digan cómo arreglarlos |
| **Von Restorff** | Lo que difiere se recuerda y se acciona | Una primaria destacada; el efecto se gasta si destacás cinco cosas |
| **Zeigarnik / Goal-Gradient** | Lo incompleto se recuerda; el esfuerzo acelera cerca de la meta | Barras de progreso, "paso 2 de 3", progreso que arranca sobre cero |
| **Gestalt** | Proximidad, similitud y región común agrupan | La herramienta más barata contra la carga cognitiva: solo espaciado y agrupación |
| **Occam / Pareto** | Cada elemento cuesta atención | El 20% de funciones que cubre el 80% del uso, visible; el resto a un clic |
| **Peak-End** | Se recuerda el pico y el final | Invertir de más en el último paso de un flujo |
| **Tesler** | La complejidad no desaparece, se mueve | Que la absorba el sistema (normalizar, detectar zona horaria), no el usuario |
| **Paradox of the Active User** | Nadie lee el manual, todos exploran | Tiene que entenderse sin instrucciones |

---

## Índice de referencias

Cargá solo la que corresponde; están escritas para leerse sueltas.

| Referencia | Cuándo leerla |
| :--- | :--- |
| [research-method-and-sources.md](references/research-method-and-sources.md) | Hay que investigar, verificar un dato o comparar cómo lo resuelven otros sistemas. Mapa de las 6 fuentes, cómo buscar adentro de cada una, soporte de navegadores y plantilla para citar. |
| [global-frontend-rules.md](references/global-frontend-rules.md) | Necesitás la regla global exacta con su porqué y su excepción legítima. |
| [ux-laws-and-heuristics.md](references/ux-laws-and-heuristics.md) | Hay que justificar una decisión de interacción con una ley de UX. |
| [accessibility-wcag.md](references/accessibility-wcag.md) | Criterios WCAG 2.2 AA, foco, ARIA, formularios, preferencias del sistema, cómo testear. |
| [web-vitals-and-performance.md](references/web-vitals-and-performance.md) | Umbrales de LCP/INP/CLS, diagnóstico, fuentes, imágenes, presupuesto de JS. |
| [design-systems-and-tokens.md](references/design-systems-and-tokens.md) | Arquitectura de tokens, roles de color M3, tipografía, motion, densidad, convenciones por plataforma. |
| [frontend-security-and-privacy.md](references/frontend-security-and-privacy.md) | XSS, CSP, CSRF, scripts de terceros, cookies, datos sensibles en formularios. |
| [i18n-and-localization.md](references/i18n-and-localization.md) | Idioma, RTL, expansión de texto, formatos de fecha/número, plurales. |
| [web-best-practices-and-seo.md](references/web-best-practices-and-seo.md) | Buenas prácticas generales de web.dev y SEO técnico básico. |

Para implementación concreta (componentes, recetas accesibles, CSS moderno, plantilla `design-tokens.css`, auditor `audit-frontend.js`), usá la skill **`frontend-dls`**.

---

## Checklist rápido de revisión

Marcá lo que falla y **citá el criterio**.

**Semántica y estructura** — ¿elementos nativos en vez de `div` con listeners? ¿un solo `<h1>` y headings sin saltos? ¿landmarks presentes? ¿`lang` correcto?

**Accesibilidad** — ¿teclado de punta a punta sin trampas (2.1.1)? ¿`:focus-visible` con contraste y no tapado (2.4.7, 2.4.11)? ¿targets ≥ 24px de piso y 44-48px de objetivo (2.5.8)? ¿contraste 4.5:1 / 3:1 (1.4.3, 1.4.11)? ¿`<label for>` en cada input (3.3.2)? ¿`aria-label` en botones de ícono? ¿errores con `aria-describedby`? ¿alternativa a arrastrar (2.5.7)? ¿se puede pegar en contraseña (3.3.8)?

**Diseño y sistema** — ¿agrupación por proximidad? ¿una sola primaria? ¿los 8 estados? ¿tokens y no hex? ¿funciona en dark y en `forced-colors`?

**Rendimiento** — ¿LCP/INP/CLS en umbral **medidos en campo**? ¿imágenes con dimensiones? ¿hero sin `lazy` y con `fetchpriority="high"`? ¿solo `transform` y `opacity` animados? ¿JS crítico < 150-200KB comprimido?

**Seguridad y privacidad** — ¿sin `innerHTML` con datos? ¿CSRF en formularios y peticiones HTMX/fetch? ¿terceros con SRI o justificados? ¿sin secretos en el bundle?

**i18n y SEO** — ¿strings externalizadas y sin concatenar? ¿propiedades lógicas? ¿`<title>` único, enlaces rastreables con `<a href>`?

**Criterio** — ¿hay algo que se pueda quitar (Occam)? ¿la complejidad la absorbe el sistema o el usuario (Tesler)?

---

## Fuentes primarias

[Laws of UX](https://lawsofux.com/) · [Material Design 3](https://m3.material.io/) · [Fluent 2](https://fluent2.microsoft.design/) · [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) · [Component Gallery](https://component.gallery/) · [web.dev](https://web.dev/) · [WCAG 2.2 (W3C)](https://www.w3.org/TR/WCAG22/) · [MDN](https://developer.mozilla.org/)
