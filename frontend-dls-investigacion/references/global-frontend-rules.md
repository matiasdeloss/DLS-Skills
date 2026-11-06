# Reglas globales no negociables del frontend

Las reglas que valen en **cualquier stack**. Cada una trae su **porqué** y su **excepción legítima**: entender el motivo es lo que permite detectar cuándo una excepción es válida y cuándo es una excusa.

> Última verificación: 2026-11-04 (niveles WCAG 2.2 y umbrales de Core Web Vitals contra W3C y web.dev). El resto son principios de criterio, no datos volátiles.

Para las referencias de detalle: [accessibility-wcag.md](./accessibility-wcag.md), [web-vitals-and-performance.md](./web-vitals-and-performance.md), [design-systems-and-tokens.md](./design-systems-and-tokens.md), [ux-laws-and-heuristics.md](./ux-laws-and-heuristics.md), [frontend-security-and-privacy.md](./frontend-security-and-privacy.md), [i18n-and-localization.md](./i18n-and-localization.md).

---

## A. Estructura y semántica

**A1. Elemento nativo antes que `div` con handler.**
*Porqué:* el nativo trae rol accesible, foco, activación por teclado y comportamiento del SO; reimplementarlos a mano es un bug esperando aparecer.
*Excepción:* un componente sin equivalente nativo (por ejemplo un combobox complejo) puede ir con ARIA, siguiendo el patrón del APG de W3C.

**A2. Botón vs enlace.** Navega a otra URL → `<a href>`. Ejecuta una acción → `<button type="…">`. Siempre `type` en botones dentro de formularios: el default es `submit`.
*Porqué:* un `<div onClick>` no recibe foco, no responde a `Enter`/`Space`, no se anuncia y no ofrece "abrir en pestaña nueva".
*Excepción:* ninguna razonable; la apariencia se resuelve con CSS.

**A3. Una jerarquía de headings sin saltos, un `<h1>` por página, landmarks presentes.**
*Porqué:* es el índice con el que se navega sin ver, y también lo que usan los buscadores para entender la estructura.
*Excepción:* componentes embebidos donde el nivel depende del contexto: ajustá el nivel, no elijas por tamaño visual.

## B. Accesibilidad

**B1. Operable por teclado de punta a punta, sin trampas de foco.** (WCAG 2.1.1)
*Porqué:* es la base para usuarios de teclado, switch y lectores de pantalla.
*Excepción:* ninguna en funciones; los gestos de trazado libre necesitan alternativa.

**B2. `:focus-visible` siempre visible y con contraste ≥ 3:1; el foco no queda tapado.** (2.4.7, 2.4.11)
*Porqué:* sin foco visible no se sabe dónde se está.
*Excepción:* se puede personalizar el anillo, nunca quitarlo sin reemplazo.

**B3. Contraste 4.5:1 (texto normal) / 3:1 (texto grande, UI y anillo de foco).** (1.4.3, 1.4.11)
*Porqué:* legibilidad para baja visión, pantallas al sol, daltonismo.
*Excepción:* WCAG exime elementos `disabled` y texto puramente decorativo; igual conviene que sean legibles si hay que leerlos.

**B4. El color nunca es el único portador de significado.** (1.4.1)
*Porqué:* invisible con daltonismo, alto contraste o poca luz. Sumá ícono, texto o patrón.

**B5. Todo input con `<label for>`; el placeholder no es label.** (3.3.2, 1.3.1)
*Porqué:* el placeholder desaparece al escribir y suele tener bajo contraste.

**B6. Targets táctiles: piso WCAG 24×24px, objetivo de diseño 44×44pt (Apple) / 48×48dp (Material).** (2.5.8)
*Porqué:* el piso de WCAG es legal; el objetivo reduce errores de dedo.
*Excepción:* controles en línea dentro de texto, o con espaciado equivalente alrededor, según las excepciones de 2.5.8.

**B7. Alternativa de un toque para todo lo que se arrastra.** (2.5.7)
**B8. No bloquear pegar en contraseña ni códigos.** (3.3.8)
**B9. No pedir de nuevo datos ya ingresados en el mismo proceso.** (3.3.7)
**B10. Ayuda o contacto en el mismo lugar en todas las páginas.** (3.2.6)

## C. Diseño y sistema

**C1. Tokens semánticos, nunca valores mágicos ni primitivos dentro de componentes.**
*Porqué:* hace que modo oscuro, alto contraste y rebranding sean un cambio de capa, no una refactorización.
*Excepción:* prototipos descartables.

**C2. Verificá el contraste del par `on-` una vez, en el token.**
**C3. Grilla de espaciado de 4px; escala tipográfica limitada; texto de lectura ≥ 16px.**
*Porqué:* Safari en iOS hace zoom automático al enfocar inputs con fuente menor a 16px.

**C4. Matriz de 8 estados definida.** Los más olvidados, *loading* y *empty*, son los que el usuario ve en el peor momento.

**C5. Una sola acción primaria por vista.** (Von Restorff)
*Porqué:* si todo está destacado, nada lo está.
*Excepción:* pantallas con acciones paralelas de igual peso (por ejemplo "Aceptar / Rechazar" en una moderación).

## D. Rendimiento

**D1. Core Web Vitals en percentil 75 de campo: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.**
*Porqué:* es lo que mide Google y lo que sienten los usuarios reales; el laboratorio no mide INP ni CLS reales.

**D2. Nunca `loading="lazy"` en el recurso LCP; sí `fetchpriority="high"`.**
**D3. Reservá espacio para todo lo que carga después** (imágenes con `width`/`height`, `aspect-ratio`, `min-height`).
**D4. Animá solo `transform` y `opacity`.**
**D5. Presupuesto de JS < 150-200KB comprimidos en la ruta crítica; medí antes de optimizar.**

## E. Seguridad y privacidad

**E1. Datos no confiables jamás a `innerHTML`**; usá `textContent` o sanitizá con una librería probada.
**E2. Secretos jamás en el cliente.** Todo lo que llega al navegador es público.
**E3. CSRF en toda mutación**, incluidas peticiones `fetch` y HTMX.
**E4. Terceros con criterio**: cada script de terceros es superficie de ataque y de rendimiento.
Detalle en [frontend-security-and-privacy.md](./frontend-security-and-privacy.md).

## F. Internacionalización

**F1. `<html lang>` correcto y propiedades lógicas** (`margin-inline`, `inset`).
**F2. Nada de strings concatenadas ni formato manual** de fechas, números y plurales: usá `Intl`.
Detalle en [i18n-and-localization.md](./i18n-and-localization.md).

## G. Respeto por el usuario

**G1. Respetá `prefers-reduced-motion`** (con `0.01ms`, no `animation: none`), **`prefers-color-scheme`** y **`forced-colors`**.
**G2. Nunca desactives el zoom** (`user-scalable=no`, `maximum-scale=1`): viola WCAG 1.4.4.
**G3. Feedback < 100ms, resolución < 400ms** (Doherty); si va a tardar más, progreso real o UI optimista.
**G4. Complejidad absorbida por el sistema, no por el usuario** (Tesler).

---

## Cómo aplicar una excepción

Una excepción es legítima cuando se puede responder por escrito: **¿qué regla relajo, por qué es seguro acá, y qué compensa?** Si no se puede responder, no es una excepción: es un atajo. Registrala (en la bitácora del proyecto) junto a la fecha y el motivo.
