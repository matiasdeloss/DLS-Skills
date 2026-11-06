# Testing y auditoría del frontend

Ninguna herramienta automática prueba la accesibilidad completa. La regla: **automático para lo barato y repetible, manual para lo que importa**. Esta guía ordena ambos.

---

## 1. Qué detecta cada capa

| Capa | Herramienta | Encuentra | No encuentra |
| :--- | :--- | :--- | :--- |
| Análisis estático de texto | `scripts/audit-frontend.js` | Patrones repetidos: `tabindex` positivo, `<img>` sin `alt`, `div onClick`, `outline: none`, `innerHTML` con datos | Nada que dependa del DOM renderizado o del contraste real |
| Linter de framework | `eslint-plugin-jsx-a11y` (React) y equivalentes | Errores de a11y en JSX/plantillas mientras escribís | Estado dinámico |
| Automático en el DOM | **axe-core** / extensión axe / Lighthouse | Contraste, nombres faltantes, ARIA inválido, roles incorrectos | Aprox. 30-40 % de los problemas reales de accesibilidad (orden de foco, claridad de los textos, flujo con lector) |
| Automatizado en CI | Playwright + `@axe-core/playwright` | Regresiones de a11y en flujos reales | Lo mismo que el anterior |
| Regresión visual | Playwright `toHaveScreenshot` o servicios de capturas | Cambios no intencionales de aspecto | Si el cambio es correcto o no (lo decide una persona) |
| **Manual** | Teclado, zoom, lector de pantalla | Trampas de foco, orden, anuncios, estados | — |

## 2. El auditor estático (`audit-frontend.js`)

```bash
node scripts/audit-frontend.js ./resources/views          # reporte legible
node scripts/audit-frontend.js ./src --json               # salida procesable
node scripts/audit-frontend.js ./src --only=a11y,security # por categoría
node scripts/audit-frontend.js ./src --quiet              # solo errores
node scripts/audit-frontend.js ./src --only=slop          # heurísticas "genérico/IA" (opt-in)
node scripts/audit-frontend.js ./src --all                # corrida por defecto + slop
```

- **Categorías**: `a11y`, `perf`, `tokens`, `markup`, `security` (activas por defecto) y `slop` (opt-in, ver abajo).
- **Severidad**: `error` hace fallar el comando (exit 1; apto para CI y pre-commit); `warn` no. Exit 2 = ruta inexistente.
- **Cómo leer un hallazgo**: `archivo:línea`, mensaje, regla (`a11y/img-missing-alt`), el fragmento y el arreglo sugerido. Es una **pregunta para verificar**, no una sentencia: puede haber falsos positivos (por ejemplo un `<input>` con `id` y el label en otro archivo).
- **Qué escanea**: `.html`, `.css`, `.scss`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, `.php` (Blade), `.twig`, `.erb`. Ignora `node_modules`, `vendor`, `dist`, `build`, etc.
- **Archivos de tokens** (`*tokens.css`, `*theme.css`, `*variables.css`…) quedan exentos de las reglas de valores crudos.
- Para un proyecto Laravel: `node scripts/audit-frontend.js resources/views` y `resources/css`.

**Regla `perf/transition-all`** (warn, activa por defecto): marca `transition: all` y `transition-property: all`, que animan propiedades de layout y disparan transiciones inesperadas; listá solo lo que cambia. Un `will-change: all` ya lo cubre `perf/will-change-always-on`, junto con cualquier `will-change` declarado de forma permanente.

### Categoría `slop` (opt-in)

Heurísticas de "se ve genérico / hecho en piloto automático". **No corren en la corrida por defecto**: solo con `--only=slop` o con `--all` (por defecto + `slop`). Son **siempre `warn`, nunca `error`**: no hacen fallar el comando ni deben bloquear un PR ni un CI. Son una pista de criterio, **no una norma**: cada mensaje lo aclara y dice cuándo el patrón es legítimo. Un hallazgo `slop` es **inferido** (ver la plantilla de informe, punto 8) y requiere juicio humano antes de actuar.

| Regla | Detecta | Legítimo cuando |
| :--- | :--- | :--- |
| `slop/dead-link` | `href="#"`, `href=""`, `javascript:void(0)` (HTML, Blade, JSX) | Prototipo con ancla temporal, o href progresivo que el JS reemplaza |
| `slop/gradient-text` | `background-clip: text` (con o sin `-webkit-`) junto a un gradiente en la misma regla | Identidad de marca, un solo titular y contraste suficiente |
| `slop/placeholder-content` | "Lorem ipsum", "John Doe", "Acme" | Fixtures, seeds, storybooks, documentación o maquetas marcadas como tales |
| `slop/generic-copy` | CTAs "Get Started" / "Learn More" solitarios, "seamless", "revolucionario/a", "Potenciá tu…" | Es el lenguaje de marca o el contexto lo vuelve específico |
| `slop/emoji-icon` | Emoji como único contenido de `<button>` o `<a>` sin `aria-label` | El emoji es el contenido (reacciones) y tiene nombre accesible |

Las reglas `slop` ignoran comentarios (`<!-- -->`, `{{-- --}}`, `/* */`, `//`) y bloques `<pre>` / `<code>`. Los hallazgos `slop` van al informe como **Inferido**, con severidad **Menor** salvo que una persona confirme un impacto mayor.

Cuando una regla da falsos positivos sistemáticos en tu proyecto, mejor ajustá la regla (o la excepción) en el script que ignorar el reporte.

## 3. axe y Lighthouse

- **Lighthouse** (DevTools → Lighthouse): sirve para una foto de accesibilidad y rendimiento de **una** página en laboratorio. Un 100 no significa "accesible".
- **axe DevTools / extensión**: analizá cada **estado** relevante (modal abierto, error visible, menú desplegado), no solo la carga inicial.
- Lighthouse **no mide INP ni CLS reales** (no hay usuario interactuando): usalo para diagnosticar y mirá datos de campo (CrUX, `web-vitals`) para decidir. Ver *frontend-dls-investigacion*, referencia de Web Vitals.

## 4. Playwright con accesibilidad

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('el formulario de alta no tiene violaciones de a11y', async ({ page }) => {
  await page.goto('/estudiantes/crear');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('se puede completar y enviar solo con teclado', async ({ page }) => {
  await page.goto('/estudiantes/crear');
  await page.getByLabel('Nombre').fill('Ana');
  await page.keyboard.press('Tab');
  // … recorrer con Tab y enviar con Enter
});
```

- Preferí **selectores por rol y nombre** (`getByRole('button', { name: 'Guardar' })`, `getByLabel`): si el test no encuentra el elemento por rol y nombre accesible, un lector de pantalla tampoco.
- Cubrí los **estados**: error de validación, vacío, cargando, modal abierto.
- Un test de teclado por flujo crítico (login, alta, compra).
- El tag `wcag22aa` existe solo en versiones recientes de axe-core: confirmá en la documentación de tu versión qué tags están disponibles antes de depender de él.

## 5. Regresión visual

- Sirve para detectar **cambios no intencionales** (un token que cambió, una clase que se pisó).
- Estabilizá antes de capturar: fuentes cargadas, animaciones desactivadas (`reducedMotion: 'reduce'`), datos fijos (semillas), reloj congelado.
- Capturá a 2-3 anchos (320, 768, 1280) y en claro/oscuro.
- Una diferencia **no es un bug por sí misma**: una persona decide si se acepta como nueva referencia.

## 6. Pruebas manuales (cada vez, antes de dar por terminado)

1. **Teclado**: guardá el mouse. Recorré todo con `Tab`/`Shift+Tab`/`Enter`/`Space`/flechas/`Esc`. ¿El foco siempre se ve? ¿El orden es lógico? ¿Hay trampas? ¿Los modales atrapan y devuelven el foco?
2. **Zoom 200 % y ancho 320px**: sin scroll en dos dimensiones, sin texto cortado ni superpuesto.
3. **Lector de pantalla** (NVDA en Windows, VoiceOver en macOS/iOS): navegá por **headings** y **landmarks**; recorré un formulario con un error; abrí un modal; disparar un toast. ¿Se anuncia lo importante, una vez, en orden?
4. **Daltonismo y contraste**: emulación en DevTools; ¿se entiende sin color?
5. **`prefers-reduced-motion` y `forced-colors`**: activalos en DevTools (Rendering).
6. **Red lenta y sin datos**: throttling a "Slow 4G"; ¿loading y empty están resueltos?

## 7. Qué correr y cuándo

| Momento | Qué |
| :--- | :--- |
| Mientras escribís | Linter del framework + extensión axe en el navegador |
| Antes de cada commit/PR | `audit-frontend.js` sobre lo cambiado; prueba de teclado de lo tocado |
| En CI | `audit-frontend.js --quiet` (falla con errores) + Playwright/axe sobre flujos críticos |
| Antes de un release | Pasada manual (punto 6) + Lighthouse en las páginas clave |

Ejemplo de paso de CI (GitHub Actions):

```yaml
- name: Auditoría frontend
  run: node .ai/skills/frontend-dls/scripts/audit-frontend.js resources --quiet
```

(Ajustá la ruta a donde viva la skill en tu repositorio.)

## 8. Plantilla de informe de auditoría

Un informe sirve si otra persona puede ejecutar los arreglos sin volver a preguntarte nada. Dos decisiones lo vuelven confiable: qué significa cada severidad y de dónde sale cada hallazgo.

### Severidad

| Severidad | Definición | Ejemplo |
| :--- | :--- | :--- |
| **Crítico** | Bloquea que alguien complete una tarea. | El formulario no se puede enviar con teclado. |
| **Mayor** | La tarea se completa, pero con mucho esfuerzo, confusión o solo con un rodeo. | El foco no se ve en ningún control. |
| **Menor** | Pulido: no impide ni dificulta seriamente la tarea. | Un ícono decorativo anunciado por el lector porque le falta `aria-hidden`. |

### Evidencia: verificado o inferido

| Marca | Significa | Qué guardar |
| :--- | :--- | :--- |
| **Verificado** | Se comprobó con una herramienta o ejecutando la interacción: axe, Lighthouse, medición de contraste, recorrido real con teclado o lector de pantalla. | La evidencia: captura, salida de la herramienta o descripción de lo que se anunció. |
| **Inferido** | Surge de leer el código o el diseño, sin ejecutarlo. | El lugar: `archivo:línea`. |

- Todo hallazgo lleva una de las dos marcas; uno sin marca no se acepta.
- Un hallazgo de `audit-frontend.js` es **inferido** hasta confirmarlo en el DOM renderizado.
- No escribas lo que "diría" un lector de pantalla si no lo ejecutaste: es la forma más común de inventar un hallazgo.
- El resumen declara cuánto quedó sin verificar ("3 de 7 hallazgos inferidos").

### La plantilla

```markdown
# Informe de auditoría: {pantalla o módulo}

- **Objetivo:** qué se audita y para quién se usa
- **Norma:** WCAG 2.2 AA
- **Fecha:** AAAA-MM-DD
- **Alcance y método:** estados revisados, herramientas usadas, qué quedó fuera

## Resumen

| Crítico | Mayor | Menor | Inferidos sin verificar |
| :--- | :--- | :--- | :--- |
| 0 | 0 | 0 | 0 |

Una frase de conclusión: ¿se puede completar la tarea principal solo con teclado, sin distinguir colores y con zoom al 200 %?

## Hallazgos

| # | Qué falla | Criterio (número y nombre) | Severidad | Evidencia | Arreglo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | El foco no se ve en "Guardar" | 2.4.7 Focus Visible | Mayor | Verificado: captura 1 | Restaurar `:focus-visible` con contraste 3:1 |

## Contraste

| Elemento | Colores (texto / fondo) | Ratio | Mínimo | ¿Aprueba? |
| :--- | :--- | :--- | :--- | :--- |

## Teclado

| Elemento | Tab | Enter / Espacio | Esc | Flechas |
| :--- | :--- | :--- | :--- | :--- |

## Arreglos prioritarios

1. {arreglo}: afecta a {quién}; le impide {qué}.
```

### Cómo completarla

- **Criterio:** número y nombre del criterio WCAG, para que el equipo aprenda el patrón y no solo el parche. El detalle exacto de cada criterio está en la skill `frontend-dls-investigacion`, referencia de accesibilidad.
- **Orden de los arreglos:** primero lo que bloquea tareas, después por cuántas personas afecta. Cada uno dice **a quién** afecta (teclado, lector de pantalla, baja visión, daltonismo, táctil) y **qué le impide hacer**.
- **Alcance:** auditá estados (modal abierto, error visible, menú desplegado), no solo la carga inicial.
- Las tablas de contraste y de teclado se completan solo con lo que se midió o se ejecutó; las filas sin evidencia se dejan vacías, no se rellenan por suposición.

## 9. Formato de crítica de diseño

Para cuando lo que se revisa es una captura, un mockup o un archivo de Figma y no hay código. La crítica evalúa si el diseño **funciona**, no solo si se ve bien.

**Orden fijo:**

1. **Primera impresión.** Todavía sin analizar: qué atrae la vista primero, si es lo que debería y qué tono transmite.
2. **Uso.** ¿Alguien puede cumplir el objetivo de la pantalla? ¿El camino principal es evidente? ¿Qué pasos o elementos sobran?
3. **Jerarquía y consistencia.** ¿Se distingue qué es lo primero, lo segundo y lo tercero? ¿Lo relacionado está agrupado? ¿Coincide con los componentes y tokens del sistema o inventa excepciones?
4. **Accesibilidad.** Contraste, tamaño de targets, estados visibles (incluido el foco) y color como único portador de significado, con criterio y umbral, no con "parece poco contraste".

**Reglas de redacción:**

- **Concreto:** nombrá el elemento y el problema ("el botón principal compite con la navegación"), no "el layout confunde".
- **Con porqué:** apoyá cada observación en un principio o un criterio.
- **Con alternativa:** cada problema trae una propuesta para probar.
- **Nombrá también lo que funciona:** dice qué conservar al iterar.
- **Detalle según el estadio:** en exploración, dirección general y riesgos; en pulido, espaciados, estados y casos límite.
- **Misma escala de severidad** que el informe de la sección 8, para no manejar dos vocabularios.

**Límite del material:** desde una captura no se puede verificar el foco, el orden del teclado ni los anuncios del lector. Marcalos como *no verificables en este material* en lugar de suponerlos.

```markdown
## Crítica: {pantalla}

**Primera impresión:** …
**Lo que funciona:** …
**Uso:** …
**Jerarquía y consistencia:** …
**Accesibilidad:** … (no verificable desde captura: foco, teclado, anuncios)
**Qué cambiaría primero:** 1) … (Mayor)  2) … (Menor)
```

## Checklist

- [ ] `audit-frontend.js` sin errores en lo que tocaste.
- [ ] Si hay informe: cada hallazgo marcado como verificado o inferido, con la evidencia de lo verificado guardada.
- [ ] axe sobre los estados relevantes (no solo la carga inicial).
- [ ] Recorrido completo por teclado, sin trampas.
- [ ] Zoom 200 % y 320px sin scroll bidireccional.
- [ ] Lector de pantalla: headings, formulario con error, modal.
- [ ] Un test automatizado de teclado/a11y por flujo crítico.
