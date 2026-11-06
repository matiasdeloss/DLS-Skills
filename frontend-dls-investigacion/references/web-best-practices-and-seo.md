# Buenas prácticas web generales y SEO técnico

Las prácticas de calidad web que no encajan en accesibilidad, rendimiento o seguridad, más lo básico del SEO técnico. Absorbe y corrige el contenido de la antigua skill `frontend-best-practices`.

> Última verificación: 2026-11-04 contra Google Search Central (enlaces rastreables, canonical, robots.txt, sitemaps). Los puntos de buenas prácticas de web.dev (HTTPS, imágenes, minificado) son principios estables; no se re-comprobó cada cifra.

Referencias hermanas: [web-vitals-and-performance.md](./web-vitals-and-performance.md), [accessibility-wcag.md](./accessibility-wcag.md), [frontend-security-and-privacy.md](./frontend-security-and-privacy.md).

---

## 1. Buenas prácticas generales (web.dev)

Son estándares medibles, no opiniones: Lighthouse y las DevTools los reportan directamente (categoría *Best Practices*).

### Transporte y seguridad básica
- **HTTPS siempre**, sin contenido mixto (recursos `http://` dentro de una página `https://`). Redirigí HTTP → HTTPS y considerá HSTS.
- Sin librerías con vulnerabilidades conocidas: auditá dependencias periódicamente (`npm audit`, `composer audit`).

### Calidad del código en el navegador
- **Consola sin errores ni advertencias** en producción. Un error de consola suele ser un recurso roto, una API deprecada o un bug silencioso.
- Sin APIs deprecadas ni listeners bloqueantes en eventos de scroll/touch (usá `{ passive: true }`).
- `<!DOCTYPE html>` correcto y `<meta charset="utf-8">` temprano en el `<head>`.
- Meta `viewport` correcta, **sin** `user-scalable=no` ni `maximum-scale=1` (viola WCAG 1.4.4):
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ```

### Imágenes
- **Formatos modernos**: AVIF o WebP con fallback (`<picture>`); SVG para íconos y logos.
- **Responsive**: `srcset` + `sizes` para que cada pantalla descargue solo lo necesario.
- Dimensiones (`width`/`height`) siempre, para evitar CLS; `loading="lazy"` solo fuera del viewport inicial y **nunca** en el recurso LCP.
- Resolución acorde al tamaño real de render; comprimí antes de publicar.

### Recursos
- **Minificá** y comprimí (gzip/Brotli) CSS y JS; elimina el CSS y JS sin usar.
- **Code splitting** cuando el bundle crece: cargá por ruta lo que no hace falta en la primera pantalla.
- Cache con política explícita (`Cache-Control`) y nombres con hash para assets inmutables.
- `defer` para scripts propios; `preload` solo para lo crítico (el recurso LCP, la fuente principal).

### Formularios
- **`type` correcto** (`email`, `tel`, `number`, `url`, `date`) y `inputmode` para ajustar el teclado móvil.
- **`autocomplete` con el token adecuado** (`given-name`, `email`, `tel`, `street-address`, `postal-code`, `current-password`, `new-password`, `one-time-code`): reduce fricción y es requisito de WCAG 1.3.5 para datos del usuario.
- Un `<label>` por input; el `<button>` de envío con `type="submit"` explícito.

### Navegación y estado
- Que el botón **atrás** funcione (cuidado con SPAs que reescriben el historial) y que las URLs representen el estado (filtros, paginación, pestañas) para poder compartirlas.
- Páginas de error 404/500 útiles, con camino de vuelta.

---

## 2. Targets táctiles y tamaño de texto por plataforma

| Plataforma / fuente | Target mínimo recomendado | Nota |
| :--- | :--- | :--- |
| **WCAG 2.2 AA (2.5.8)** | 24×24 px CSS | Piso normativo, con excepciones de espaciado; no es objetivo de diseño |
| **Apple HIG** | 44×44 pt | Área de toque; puede lograrse con un área invisible mayor que el ícono |
| **Material 3 / Android** | 48×48 dp | Con unos 8 dp de separación entre targets |

**Tamaño de texto.** Apple documenta 11 pt como piso de legibilidad del texto en iOS (página *UI Design Dos and Don'ts*; es una guía antigua y no una exigencia). **Para web, usá 16 px como piso del texto de lectura**: por debajo, Safari en iOS hace zoom automático al enfocar un input. Se corrige así la afirmación de la antigua skill, que mezclaba "11 pt de iOS" como si aplicara al texto web.

---

## 3. Convenciones multiplataforma

Si el producto corre en web + iOS + Android, no calques 1:1 la navegación: respetá lo nativo de cada plataforma (Jakob aplicada al SO). Tab bar inferior y swipe-back en iOS; navigation bar/rail, back del sistema y FAB en Android; en web, header o sidebar y el botón atrás del navegador. Tabla comparativa y safe areas en [design-systems-and-tokens.md](./design-systems-and-tokens.md).

---

## 4. SEO técnico básico

El SEO técnico es **hacer que el contenido pueda ser descubierto, rastreado e interpretado**. Fuente: Google Search Central.

### Contenido que se rastrea
- **Enlaces rastreables:** Google solo puede seguir un enlace si es un elemento `<a>` con atributo `href`. `<div onclick>`, `<a>` sin `href` o navegación solo por JS no se siguen. Esto coincide con la regla de accesibilidad "navegar = `<a href>`".
- **URLs legibles y estables;** evitá fragmentos (`#`) para contenido distinto, y evitá cambiar URLs sin redirección 301.
- **Contenido crítico en el HTML inicial** o renderizado de forma que el rastreador lo vea. Si dependés de JS, probá con la inspección de URL de Search Console.

### Elementos de la página
```html
<title>Carrito — Tienda</title>
<meta name="description" content="Resumen breve y específico de la página, pensado para humanos.">
<link rel="canonical" href="https://ejemplo.com/carrito">
```
- **`<title>`** único y descriptivo por página, lo específico primero.
- **`<meta name="description">`**: resumen que Google puede usar como fragmento; no garantiza que lo use ni afecta directamente el ranking.
- **Un `<h1>`** y jerarquía de headings coherente (también es accesibilidad).
- **`rel="canonical"`**: indica la URL preferida cuando hay duplicados o variantes (parámetros, filtros). Mejor en el HTML inicial; si lo cambia JS, debe coincidir con el del HTML.
- **Imágenes:** `alt` descriptivo y nombres de archivo con sentido; formatos modernos; dimensiones.
- **Idioma:** `<html lang>` y, si hay versiones por idioma, `hreflang`.

### Control de rastreo
- **`robots.txt`**: indica qué rutas puede o no solicitar un rastreador. **No es un mecanismo de privacidad ni de seguridad** y no asegura que una URL no se indexe; para evitar la indexación usá `noindex` (meta robots o cabecera `X-Robots-Tag`) en una página accesible al rastreador.
- **Sitemap XML**: lista las URLs que querés que se rastreen; ayuda al descubrimiento, no es garantía de indexación.
- Respuestas HTTP correctas: `200` para contenido, `301` para movidos, `404`/`410` para inexistentes. Evitá "soft 404" (página de error con código 200).

### Datos estructurados
- Marcado **JSON-LD** de schema.org (artículos, productos, preguntas frecuentes, migas de pan) para que el buscador entienda el contenido y pueda mostrar resultados enriquecidos. Validá con la herramienta de pruebas de resultados enriquecidos de Google.
- Describí solo lo que está visible en la página; el marcado engañoso puede penalizarse.

### Rendimiento y SEO
Los Core Web Vitals forman parte de la experiencia de página que Google tiene en cuenta; mejorarlos no sustituye un buen contenido, pero un sitio lento o inestable perjudica a las dos cosas.

### Lo que NO es SEO técnico
Palabras clave repetidas, texto oculto o comprar enlaces: son prácticas que las políticas de Google desaconsejan. Escribí para personas y estructurá para máquinas.

---

## 5. Checklist

**Calidad web**
- [ ] HTTPS en todo, sin contenido mixto.
- [ ] Consola sin errores en producción.
- [ ] Imágenes AVIF/WebP con `srcset`/`sizes` y dimensiones; hero sin `lazy`.
- [ ] CSS/JS minificados y comprimidos; code splitting si el bundle crece.
- [ ] Inputs con `type`, `inputmode` y `autocomplete` correctos.
- [ ] `viewport` sin bloqueo de zoom; botón atrás funcional.

**SEO técnico**
- [ ] `<title>` y `<meta description>` únicos por página.
- [ ] Un `<h1>`; headings jerárquicos.
- [ ] Navegación con `<a href>`, no con `div` + JS.
- [ ] `canonical` donde hay duplicados; códigos HTTP correctos.
- [ ] `robots.txt` y sitemap sin bloquear lo que debe indexarse; `noindex` para lo que no.
- [ ] JSON-LD válido y fiel al contenido visible.
