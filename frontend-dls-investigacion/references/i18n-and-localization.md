# Internacionalización y localización (i18n / l10n)

Preparar la interfaz para más de un idioma y región **aunque hoy tengas uno solo**. Retrofittear i18n sobre strings pegadas en el código cuesta mucho más que externalizarlas desde el principio.

> Última verificación: 2026-11-04 contra MDN (`Intl.PluralRules`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat`). Comportamiento de `Intl.DateTimeFormat`, propiedades lógicas, `dir` y `<bdi>`: según la guía general de MDN/W3C, sin comparar versiones puntuales.

**Vocabulario:** *i18n* = hacer posible la adaptación (diseñar el código); *l10n* = adaptar a una región concreta (traducir, formatos). *Locale* = idioma + región (`es-AR`, `es-ES`, `en-US`).

---

## 1. Declarar el idioma

```html
<html lang="es-AR">
```

- `lang` en `<html>` es obligatorio (WCAG 3.1.1): el lector de pantalla elige fonética y los navegadores eligen fuentes, corrección ortográfica y comillas.
- Contenido en otro idioma dentro de la página: `lang` en ese elemento (`<span lang="en">pull request</span>`) (WCAG 3.1.2).
- Usá etiquetas BCP 47 (`es`, `es-AR`, `pt-BR`, `zh-Hant`).

## 2. No concatenar strings

```js
// ❌ El orden de las palabras no es universal
`Hola ${nombre}, tenés ${n} mensajes nuevos`

// ✅ Mensaje completo con placeholders, traducible como unidad
t('saludo.mensajes', { nombre, n })   // "Hola {nombre}, tenés {n} mensajes nuevos"
```

- Un traductor necesita ver la **frase entera** para poder reordenarla.
- No armes plurales con `if (n === 1)`: cada idioma tiene reglas distintas (ver sección 5).
- No incluyas HTML dentro de las traducciones salvo con un mecanismo de marcado explícito de la librería.
- Dale contexto al traductor: la misma palabra ("Cerrar") puede ser verbo o adjetivo según el lugar.
- **Externalizá** todo texto visible (incluye `aria-label`, `alt`, `title`, placeholders y mensajes de error) a archivos de traducción (en Laravel `lang/`, en JS librerías como i18next, FormatJS o vue-i18n).

## 3. Expansión de texto

El mismo mensaje ocupa distinto espacio según el idioma; el inglés suele ser de los más cortos. Orientación común (varía por contexto): textos cortos pueden crecer bastante más que los largos.

- Nada de anchos fijos en botones, tabs o etiquetas: `min-inline-size`, `padding` y wrap.
- Probá con **pseudo-localización** (texto alargado con acentos, p. ej. `[Ĝûàŕdàŕ ñûéṽô]`) para encontrar desbordes antes de traducir.
- Evitá texto dentro de imágenes; evitá abreviaturas que no se traducen.
- Alemán y finlandés (palabras largas) y chino/japonés (más compacto, otra altura de línea) son buenos casos de prueba.

## 4. Formatos: usá `Intl`, no formatees a mano

`Intl` es la API estándar de ECMAScript para formato dependiente del idioma.

```js
const loc = 'es-AR';

new Intl.NumberFormat(loc).format(1234567.891);
// "1.234.567,891"

new Intl.NumberFormat(loc, { style: 'currency', currency: 'ARS' }).format(1500);

new Intl.DateTimeFormat(loc, { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' })
  .format(new Date());

new Intl.RelativeTimeFormat(loc, { numeric: 'auto' }).format(-1, 'day');
// "ayer"  (con numeric:'auto' MDN indica fraseo idiomático en vez de "hace 1 día")

new Intl.ListFormat(loc, { type: 'conjunction' }).format(['A', 'B', 'C']);
// "A, B y C"
```

- **Fechas:** guardá y transmití en **ISO 8601 / UTC**; formateá solo al mostrar, en la zona horaria del usuario (Tesler: que lo absorba el sistema).
- **Números y monedas:** la separación de miles y decimales cambia por región (`1.234,56` vs `1,234.56`). Al **leer** entradas del usuario, normalizá antes de enviar (Postel).
- La moneda no es el idioma: un usuario `es-AR` puede ver precios en USD.
- **Orden y comparación de texto:** `Intl.Collator` / `localeCompare` en vez de `<` sobre strings.

## 5. Plurales

`Intl.PluralRules` **no pluraliza palabras**: devuelve la *categoría* de plural (`zero`, `one`, `two`, `few`, `many`, `other`) que corresponde a un número en un idioma; vos elegís el texto de cada categoría. También soporta `type: 'ordinal'` (1º, 2º…).

```js
const pr = new Intl.PluralRules('es');
const forms = { one: 'mensaje', other: 'mensajes' };
`${n} ${forms[pr.select(n)]}`;
```

- En español basta `one`/`other`, pero otros idiomas (árabe, ruso, polaco) tienen más categorías: diseñá las claves de traducción para que admitan todas.
- Las librerías de i18n (formato ICU: `{n, plural, one {# mensaje} other {# mensajes}}`) resuelven esto por vos.

## 6. Escritura de derecha a izquierda (RTL)

Árabe, hebreo, persa y urdu se leen de derecha a izquierda.

```html
<html lang="ar" dir="rtl">
```

- **Propiedades lógicas** en vez de físicas: `margin-inline-start`, `padding-inline`, `inset-inline-end`, `inline-size`, `border-inline-start`, `text-align: start`. Cuestan lo mismo que las físicas y evitan reescribir el CSS al agregar RTL. (Detalle del cookbook CSS en la skill `frontend-dls`).
- **Se espejan:** el layout, la navegación, íconos direccionales (flechas, "atrás/adelante"), barras de progreso, deslizadores.
- **No se espejan:** logos, íconos de acción universal (lupa, reproducir en algunos contextos), números, código, notación matemática.
- Texto mixto (RTL con fragmentos LTR, o datos de usuario de dirección desconocida): usá `<bdi>` (aísla la dirección de un fragmento) o `dir="auto"`.
- Flexbox y grid ya respetan `dir`; evitá `left`/`right` fijos y transformaciones `translateX` sin invertir.

## 7. Otros detalles que rompen en otro idioma

- **Mayúsculas:** `text-transform: uppercase` no es correcto en todos los idiomas (turco `i/İ`, alemán `ß`); preferí texto ya en mayúsculas desde la traducción si importa.
- **Tipografía:** que la fuente cubra los caracteres necesarios (acentos, cirílico, CJK); definí `font-family` con fallbacks por escritura.
- **Nombres y direcciones:** no asumas nombre + apellido, ni un único campo de código postal, ni teléfonos con un formato fijo.
- **Colores e imágenes** pueden tener connotaciones culturales distintas.
- **Atributos de accesibilidad** (`aria-label`, `alt`) también se traducen.
- **Imágenes con texto**, **audio y video**: subtítulos y transcripciones en cada idioma.

## 8. Checklist

- [ ] `<html lang>` correcto; `lang` en fragmentos de otro idioma.
- [ ] Ningún texto visible o accesible hardcodeado en componentes.
- [ ] Sin strings concatenadas ni plurales con `if`.
- [ ] Fechas, números, monedas y listas con `Intl`; fechas almacenadas en ISO/UTC.
- [ ] Contenedores sin anchos fijos; probado con texto alargado.
- [ ] Propiedades lógicas en el CSS; íconos direccionales preparados para espejar.
- [ ] Datos de usuario de dirección incierta con `<bdi>` o `dir="auto"`.
- [ ] Selector de idioma visible, con cada idioma escrito en su propio nombre ("Español", "English").
