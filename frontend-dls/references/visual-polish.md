# Pulido visual

Técnicas de acabado que separan una interfaz correcta de una cuidada. Se aplican **después** de que estados, accesibilidad y tokens ya funcionan: el pulido no arregla una base rota, solo la afina.

**Cómo usar este archivo.** Si una técnica choca con los tokens del proyecto, manda el proyecto. Si choca con los mínimos de accesibilidad (contraste, targets, `prefers-reduced-motion`), mandan los mínimos: ver la regla de desempate del `SKILL.md` y la [tabla de tensiones](#11-tabla-de-tensiones) al final. Los valores numéricos son **puntos de partida para ajustar a ojo**, no estándares.

Reúne prácticas de uso común, reescritas con criterio propio. Lo que no pudo verificarse contra una fuente primaria está marcado en [Pendiente de verificar](#12-pendiente-de-verificar).

---

## 1. Superficies y forma

### Radio concéntrico
Cuando un elemento redondeado vive dentro de otro con padding, el radio interior debe ser el exterior menos ese padding. Si ambos tienen el mismo radio, la esquina interna se ve "gorda" porque las curvas dejan de ser paralelas.

```css
.card {
  --pad: 12px;
  --radius-inner: 8px;
  padding: var(--pad);
  border-radius: calc(var(--radius-inner) + var(--pad)); /* exterior = interior + padding */
}
.card > .thumb { border-radius: var(--radius-inner); }
```

Con paddings grandes (aprox. > 24px) la superficie interior se lee como un elemento independiente y la regla deja de aplicar. Es una heurística visual, no una norma.

### Sombra como borde (solo en cards)
Un anillo fino semitransparente más una o dos sombras suaves da un borde que se funde con cualquier fondo. Valores de partida:

```css
.card {
  border: 1px solid transparent; /* en forced-colors el box-shadow se anula: este borde es el respaldo */
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.06),
    0 1px 2px -1px rgb(0 0 0 / 0.08),
    0 2px 4px rgb(0 0 0 / 0.04);
}
```

Dos límites que no se negocian:
- **No lo uses en inputs, botones ni controles.** El borde de un control debe tener contraste 3:1 con el fondo (WCAG 1.4.11) y un anillo al 6% no llega. Para controles, borde real.
- **`forced-colors`**: el navegador pone `box-shadow` en `none`; sin el borde transparente de arriba, la card desaparece.

### Una sola estrategia de profundidad
Elegí **una** por producto y mantenela: bordes, sombras sutiles, sombras en capas o diferencia de tono entre superficies. Mezclarlas hace que algunas cards parezcan de otra aplicación.

### Jerarquía de superficies
- Sidebar con el **mismo tono que el canvas**, separada por un borde fino: no compite con el contenido.
- Inputs **un paso más hundidos** que su contenedor: dicen "acá se escribe".
- Popovers y menús **un nivel por encima** de lo que los abre.
- En modo oscuro, la elevación la da el **tono de la superficie** más que la sombra. Desaturá los colores semánticos y mantené un solo matiz de marca.

---

## 2. Imágenes

Un contorno neutro de 1px al 10% evita que una imagen clara se disuelva contra un fondo claro. Va **hacia adentro** (`outline-offset` negativo) para no alterar el layout, y **sin tintes**: negro o blanco puros con transparencia, nunca un gris azulado.

```css
img {
  outline: 1px solid oklch(0 0 0 / 0.1);
  outline-offset: -1px;
}
@media (prefers-color-scheme: dark) {
  img { outline-color: oklch(1 0 0 / 0.1); }
}
```

`outline` toma la forma de `border-radius` en los navegadores actuales (ver [pendiente de verificar](#12-pendiente-de-verificar) por versiones).

---

## 3. Tipografía de datos y escala

- **`font-variant-numeric: tabular-nums`** en todo número que cambie o se alinee en columna: contadores, precios, temporizadores, tablas. Sin esto, los dígitos de ancho variable hacen que el texto "baile". Solo funciona si la fuente trae esa característica.
- **Escala por ratio, no por intuición.** Elegí 1.2 (denso y calmo), 1.25 (producto) o 1.333 (expresivo), partí del cuerpo de 14-16px y redondeá a píxeles enteros. Declará el ratio en el sistema: una escala sin ratio declarado se deforma con cada parche.
- **Jerarquía con tres ejes**, no solo tamaño: tamaño + peso + color. A 14px funcionan tres niveles: 600 primario, 500 secundario, 400 atenuado.
- **El texto atenuado sigue cumpliendo contraste 4.5:1.** Es el error más común del pulido: un gris elegante a 4.1:1.
- **Tracking ligeramente negativo** en títulos grandes; neutro en cuerpo.
- **Detalles tipográficos:** puntos suspensivos reales (`…` y no `...`), comillas tipográficas según el idioma y espacio de no separación entre número y unidad (`10&nbsp;MB`, `⌘&nbsp;K`) para que no se partan en dos líneas.

---

## 4. Alineación óptica

Lo geométricamente centrado no siempre se ve centrado. Heurísticas:
- Un botón con ícono a un lado: restá ~2px del padding **de ese lado** para compensar el peso visual del ícono.
- El triángulo de "play" parece desplazado a la izquierda: corrigelo en el propio SVG, no con márgenes en el contenedor.
- Usá propiedades lógicas (`padding-inline-start`) para que la corrección también funcione en RTL.

Son ajustes de ojo: cambialos si el diseño real pide otra cosa.

---

## 5. Íconos

- **Un solo set por superficie.** Mezclar trazos de grosor distinto se nota aunque nadie sepa decir por qué.
- **El trazo acompaña el peso del texto vecino:** más fino junto a texto regular, más grueso junto a semibold o bold. Aplica a sets de trazo, no a sets rellenos.
- `currentColor` siempre, para que hereden color, estado y modo oscuro.
- **Outline por defecto, relleno para el estado activo** (el par outline/fill comunica "seleccionado" sin color).
- Tamaño de 1em a 1.25em junto al texto; probalos al **tamaño real** (16, 20, 24), no ampliados.
- **RTL:** espejá flechas y chevrons. No espejes logos, checks ni el "play".
- Un ícono que es el único contenido de un botón necesita nombre accesible (`aria-label`). Ver `references/images-icons-media.md`.

---

## 6. Motion útil

- **Transitions para estados, keyframes para secuencias.** Una `transition` se puede interrumpir y reorientar a mitad de camino; un keyframe sigue hasta el final. Hover, focus y toggles son transitions.
- **Press feedback:** `transform: scale(.96)` en `:active` (150ms), nunca por debajo de .95. Excluí `:disabled`. Elegí **un** valor para todo el producto y guardalo como token: no mezcles .96 y .97.
- **Nombrá las propiedades.** `transition: all` está prohibido: anima cosas que no pensaste (incluido layout) y rompe cuando alguien agrega una propiedad después.
- **Nunca partas de `scale(0)`.** Un elemento no nace de la nada: entrá desde `scale(.95)` con `opacity: 0`.
- **Origen coherente:** un popover crece desde su disparador; un modal, desde el centro.
- **Entrada y salida asimétricas:** la salida más corta que la entrada (aprox. 150ms contra 250-300ms) y sin recorrido largo; lo que se va no merece protagonismo.
- **Stagger acotado:** 40 a 100ms entre bloques semánticos, solo en momentos poco frecuentes (llegada a una pantalla, vacío que se llena). No escalonés cada fila de una tabla.
- **Lo que se repite cien veces al día no se anima.** Abrir un comando de uso constante con una animación de 300ms se vuelve una molestia.
- **Todo cambio animado necesita una pista estática** para quien pidió menos movimiento: el estado final se entiende sin ver la animación.
- Probá al **10% de velocidad** (panel de animaciones de DevTools): los defectos que a velocidad real se sienten "raros" se ven a simple vista.

Los tokens de duración y curvas ya existen en `examples/design-tokens.css`: usalos en lugar de números sueltos.

---

## 7. Cambio de ícono animado

Dos íconos en el DOM, uno absoluto sobre el otro, cruzando escala y opacidad:

```css
.icon-swap { position: relative; display: inline-grid; }
.icon-swap > svg {
  grid-area: 1 / 1;
  transition: transform 300ms cubic-bezier(0.2, 0, 0, 1), opacity 300ms cubic-bezier(0.2, 0, 0, 1);
}
.icon-swap > .is-hidden { transform: scale(0.25); opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .icon-swap > svg { transition-duration: 0.01ms; }
}
```

Solo `transform` y `opacity`. Algunas recetas suman un `filter: blur()` breve al cruce: **no está entre las dos propiedades que se garantizan sin recalcular layout**, así que, si lo usás, hacelo solo en íconos de 24px o menos y medilo. Con librerías de animación en JS, el `0.01ms` del CSS no las alcanza: usá el hook de reduced-motion de la propia librería.

---

## 8. Cambio de tema sin barrido

Al alternar claro/oscuro, cada elemento con `transition` en color o fondo se anima a su ritmo y la pantalla "barre". Se evita suspendiendo las transiciones un instante:

```js
function withoutTransitions(applyTheme) {
  const style = document.createElement('style');
  style.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.appendChild(style);
  applyTheme();
  void getComputedStyle(document.body).opacity; // fuerza el reflow antes de quitar el bloqueo
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
}
```

Alternativa moderna: la View Transitions API, que anima el cambio de tema como un cruce controlado. Verificá el soporte antes de depender de ella.

---

## 9. Táctil, safe areas y tema del sistema

- `touch-action: manipulation` en controles: evita el zoom por doble toque y reduce la latencia percibida.
- `overscroll-behavior: contain` en modales y drawers: el scroll de adentro no arrastra la página de atrás.
- Pantallas con muesca o barra de gestos: `viewport-fit=cover` y `env(safe-area-inset-*)` en los bordes fijos.
- `color-scheme` en `:root` y `<meta name="theme-color">` para que la barra del navegador y los controles nativos (`<select>`, scrollbars) acompañen al tema.
- En `<select>` nativo en oscuro, definí color de fondo y texto explícitos: algunos navegadores no los heredan.

---

## 10. Autorrevisión

Tres pruebas baratas antes de dar algo por terminado:
1. **Entrecerrar los ojos.** Si desenfocás la pantalla, ¿todavía se distingue qué es lo primero, lo segundo y lo tercero? Si no, la jerarquía depende de detalles.
2. **Prueba del reemplazo.** Si cambiás la fuente y los colores por los de otro producto, ¿sigue pareciendo este producto? Si no cambia nada, no hay identidad propia, solo plantilla.
3. **Animaciones al 10%.** Ver sección 6.

Señales de diseño genérico, con su excepción legítima: ver [anti-generic-ui.md](./anti-generic-ui.md) (heurística, no norma).

---

## 11. Tabla de tensiones

Qué manda cuando una técnica de pulido choca con otra regla:

| Técnica | Choca con | Qué manda |
| :--- | :--- | :--- |
| Anillo de sombra como borde | Contraste de controles (WCAG 1.4.11, 3:1) | El contraste: en controles, borde real |
| Anillo de sombra como borde | `forced-colors` (anula `box-shadow`) | Agregar `border: 1px solid transparent` |
| Texto atenuado elegante | Contraste 4.5:1 | El contraste |
| Animación de entrada | `prefers-reduced-motion` | La preferencia: duración casi nula y pista estática |
| `filter: blur` en íconos | "Solo `transform` y `opacity`" | La regla, salvo íconos ≤ 24px medidos |
| Press `scale(.96)` y `.97` en fuentes distintas | Consistencia del producto | Elegir uno y tokenizarlo |
| Corrección óptica de 2px | Diseño real del componente | El diseño: es una heurística |

---

## 12. Pendiente de verificar

Lo siguiente **no se confirmó** contra una fuente primaria y conviene chequearlo antes de depender de ello:
- Desde qué versión de cada navegador `outline` respeta `border-radius` (MDN confirma el comportamiento, no las versiones).
- Si `filter: blur` se compone en el hilo del compositor en todos los motores.
- Los valores concretos de las sombras de la sección 1 (son un punto de partida visual).
- El soporte de la View Transitions API para el cambio de tema.

Verificado: en modo de colores forzados el navegador anula `box-shadow` (MDN, `forced-colors`).

Related: la skill `frontend-dls-investigacion` (criterios WCAG exactos, contraste, `prefers-reduced-motion`), `references/component-encyclopedia.md`, `references/images-icons-media.md`, `examples/design-tokens.css`.
