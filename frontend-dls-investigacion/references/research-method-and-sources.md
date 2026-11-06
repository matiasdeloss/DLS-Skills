# Método de investigación y mapa de fuentes

Cómo investigar una duda de frontend sin quedarse con la primera respuesta que aparece, y qué autoridad tiene cada fuente para qué.

> Última verificación: 2026-11-04 (cifras de Component Gallery, Baseline y breakpoints M3 contra sus sitios oficiales).

---

## 1. Escalera de fuentes

| Nivel | Qué es | Ejemplos | Para qué sirve |
| :--- | :--- | :--- | :--- |
| **1. Norma / especificación** | Lo que define el comportamiento o el criterio | W3C/WAI (WCAG 2.2), WHATWG HTML, TC39/ECMA-402 (Intl), RFCs | Responder "¿qué exige / qué garantiza?" |
| **1. Documentación primaria** | Lo que dicen quienes mantienen la plataforma | MDN, web.dev, docs de Laravel/React/htmx | Responder "¿cómo se usa y qué soporte tiene?" |
| **2. Design systems** | Convenciones maduras, no normas | Material 3, Fluent 2, Apple HIG, GOV.UK | Responder "¿cómo lo hacen los que más lo estudiaron?" |
| **2. Comparativas** | Muchas implementaciones reales lado a lado | Component Gallery | Responder "¿qué nombres, variantes y estados son estándar?" |
| **3. Artículos y foros** | Interpretación de terceros | Blogs, Stack Overflow, hilos | Encontrar el camino hacia el nivel 1 o 2; **nunca** como única prueba |

Regla: si una afirmación importante solo tiene respaldo de nivel 3, está **sin verificar**.

---

## 2. Mapa de las seis fuentes

### Laws of UX — https://lawsofux.com/
- **Autoridad:** síntesis de psicología cognitiva aplicada a UI. Es marco de razonamiento, no norma.
- **Úsala para:** justificar una decisión de interacción ("por qué demasiadas opciones frenan"), nombrar un fenómeno.
- **Cuidado:** las leyes predicen tendencias, no garantías. Un número como "7±2" es orientativo.
- **Cómo buscar adentro:** cada ley tiene su página con definición, origen y ejemplos; el índice lista las leyes por nombre.

### Material Design 3 — https://m3.material.io/
- **Autoridad:** convención de Google para Android y web. Muy detallada en componentes, color, layout.
- **Úsala para:** roles de color, tipografía, motion, estados de componentes, breakpoints.
- **Cuidado:** los tokens y valores exactos cambian con las versiones. Confirmá en la página del componente antes de copiar un número.
- **Cómo buscar adentro:** Foundations (layout, color, accesibilidad) y Components (cada componente con pestañas Specs / Guidelines / Accessibility).

### Fluent 2 — https://fluent2.microsoft.design/
- **Autoridad:** convención de Microsoft. Fuerte en arquitectura de tokens, densidad y temas.
- **Úsala para:** apps de productividad y tablas densas, tokens multinivel.
- **Cómo buscar adentro:** secciones Design Tokens, Layout, Accessibility y cada componente.

### Apple Human Interface Guidelines — https://developer.apple.com/design/human-interface-guidelines/
- **Autoridad:** convención de Apple para sus plataformas. Obligatoria de hecho en el ecosistema, orientativa en web.
- **Úsala para:** targets táctiles, safe areas, navegación en iOS, Dynamic Type.
- **Cuidado:** son *guidelines*, no requisitos estrictos; y el sitio se reestructura con cada versión del SO. Verificá la sección vigente.

### Component Gallery — https://component.gallery/
- **Autoridad:** comparativa curada, no norma. A 2026-11-04 el sitio informa 60 componentes, 95 design systems y 2.671 ejemplos (cifra variable: citala como "snapshot").
- **Úsala para:** antes de inventar un componente, mirar 5-10 implementaciones y ver nombres, variantes, estados y patrón ARIA.
- **Cómo investigar un componente ahí:**
  1. Entrá a `component.gallery/components/<nombre>/` (por ejemplo `/components/table/`, `/components/card/`).
  2. Leé la lista de **nombres alternativos** (cómo lo llaman otros sistemas): tu nombre debería ser el más común.
  3. Abrí 5-10 implementaciones de sistemas maduros y anotá **props y variantes** que se repiten (tamaño, destructivo, loading, indeterminate…).
  4. Fijate qué **patrón ARIA y de teclado** documentan; para el contrato oficial, contrastá con el patrón de ARIA Authoring Practices (W3C APG).
  5. Registrá qué es **consenso** (la mayoría lo hace) y qué es **decisión propia**.

### web.dev — https://web.dev/
- **Autoridad:** guía oficial de Google/Chrome sobre rendimiento, accesibilidad, buenas prácticas y estado de la plataforma (Baseline).
- **Úsala para:** Core Web Vitals, optimización, qué es Baseline, patrones modernos.
- **Cuidado:** las métricas se evalúan en campo; los umbrales los define Google y cambian con aviso previo.

### Fuentes de nivel 1 que completan el mapa
- **WCAG 2.2** — https://www.w3.org/TR/WCAG22/ (norma). "What's new in 2.2": https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/. Para entender cada criterio: páginas *Understanding* y *Techniques* de W3C/WAI.
- **MDN** — https://developer.mozilla.org/ (APIs, HTML, CSS, HTTP, seguridad, tablas de compatibilidad).
- **Google Search Central** — https://developers.google.com/search (SEO técnico).

---

## 3. Verificar soporte de navegadores

1. **MDN → tabla "Browser compatibility"** al final de cada página de API o propiedad CSS: es la primera parada.
2. **Baseline** (web.dev / MDN): resume el soporte entre los navegadores principales. **Newly available** = funciona en todos los navegadores centrales; **Widely available** = 30 meses después de eso, generalmente seguro de usar. Baseline **no reemplaza** probar con tecnologías asistivas, rendimiento ni seguridad, y puede no cubrir dispositivos viejos o webviews del SO.
3. **Web Platform Status** (webstatus.dev) para consultar por estado Baseline; el paquete npm `web-features` expone el estado de cada característica para tooling, y Lighthouse incluye una auditoría de características Baseline.
4. **caniuse.com** para el porcentaje de uso real por navegador y versión, útil cuando hay que decidir con datos de audiencia.
5. Decidí con el **público objetivo**: una app interna en navegadores evergreen admite más que un sitio público.

**Mejora progresiva:** si una característica no es Widely available, usala solo si degrada bien sin ella (por ejemplo `:has()` o `@starting-style` como refuerzo, no como único camino).

---

## 4. Cómo separar lo que sabés

| Etiqueta | Significa | Ejemplo |
| :--- | :--- | :--- |
| **Hecho** | Lo dice una norma o doc primaria; podés citar sección | "Foco no obscurecido (mínimo) es nivel AA (WCAG 2.4.11)" |
| **Convención** | Lo hacen los sistemas maduros, sin ser norma | "Los modales cierran con `Escape`" |
| **Opinión** | Criterio razonado del autor | "Preferimos deshacer a confirmar" |
| **Suposición** | No verificado | "Seguramente Safari lo soporta" → verificar |

---

## 5. Plantilla para citar y registrar hallazgos

```markdown
### <Pregunta investigada>
- **Respuesta corta:** <una frase>
- **Tipo:** hecho | convención | opinión | suposición
- **Fuente:** <título> — <URL> — sección <x>
- **Verificado el:** AAAA-MM-DD
- **Cómo se verificó:** <doc primaria / tabla de compatibilidad / prueba manual>
- **Excepción o límite:** <cuándo no aplica>
- **Impacto en el código:** <qué hay que hacer>
```

Al reportar una violación: **criterio + síntoma + arreglo**. Ejemplo: "WCAG 2.4.11 Focus Not Obscured (AA): el header sticky tapa el elemento enfocado al tabular. Arreglo: `scroll-margin-block-start` igual a la altura del header."

---

## 6. Señales de alerta al investigar

- La respuesta se apoya en un solo artículo o en un hilo sin fuente primaria.
- Un número exacto sin su origen (umbral, tamaño, porcentaje) y sin fecha.
- Un criterio "AA" o "AAA" citado sin haber visto el nivel en la norma.
- Soporte de navegador afirmado de memoria.
- Guía anterior a 2024 sobre temas que cambian rápido (Core Web Vitals, WCAG 2.2, APIs de CSS nuevas).
