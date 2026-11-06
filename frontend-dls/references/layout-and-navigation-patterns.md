# Patrones de pantalla y navegación

Plantillas para armar una pantalla sin empezar de cero. Los tokens salen de [design-tokens.css](../examples/design-tokens.css); los componentes, de la [enciclopedia](./component-encyclopedia.md). Las convenciones por plataforma (iOS, Android, web) y la teoría de densidad están en la skill *frontend-dls-investigacion*, referencia de sistemas de diseño.

**Antes de maquetar**: respondé tres preguntas. ¿Cuál es la **tarea principal** de la pantalla? ¿Cuál es la **única acción primaria**? ¿Qué ve alguien que llega por primera vez (estado vacío)?

---

## 1. Esqueleto de página

```html
<body>
  <a href="#main" class="skip-link">Saltar al contenido principal</a>
  <header>… marca, navegación global, cuenta …</header>
  <nav aria-label="Principal">…</nav>
  <main id="main" tabindex="-1">
    <h1>Título de la pantalla</h1>
    …
  </main>
  <footer>…</footer>
</body>
```

- Un solo `<h1>`; headings sin saltar niveles.
- Varios `<nav>` en la misma página → cada uno con `aria-label` distinto ("Principal", "Migas", "Paginación").
- Marcá el enlace de la página actual con `aria-current="page"`.

## 2. Plantillas de pantalla

### Dashboard
**Tarea**: ver el estado de un vistazo y llegar al detalle.
- Arriba: 3-5 **KPIs** (número grande + etiqueta + variación). Nunca más de lo que se lee de un golpe de vista.
- Debajo: los widgets por orden de importancia, no por orden de desarrollo. Cada uno con título, el dato y **un** enlace "Ver todo".
- Cada widget necesita sus **8 estados**: especialmente `loading` (skeleton del tamaño final), `empty` y `error` con reintento **por widget** (una falla no debe romper el dashboard entero).
- Grilla: `repeat(auto-fit, minmax(min(18rem, 100%), 1fr))` evita media queries.
- Si hay gráficos: el dato debe estar disponible también como tabla o texto (no solo color).

### Lista y detalle
**Tarea**: encontrar un ítem y actuar sobre él.
- Barra superior de la lista: búsqueda, filtros, orden, acción primaria ("Nuevo …"), cantidad de resultados.
- Filtros activos visibles como chips removibles; botón "Limpiar filtros".
- **El estado vive en la URL** (filtros, orden, página): permite volver, compartir y recargar.
- Detalle: en escritorio, panel lateral o página propia; en móvil, **página propia** (no un panel que tape todo).
- Tabla vs tarjetas: tabla si se comparan atributos entre filas; tarjetas si cada ítem es una unidad con imagen o acciones.
- Tres vacíos distintos: primer uso, sin resultados, error de carga (ver [enciclopedia §1](./component-encyclopedia.md#1-la-matriz-de-los-8-estados)).

### Página de formulario
**Tarea**: ingresar datos sin errores. Todo en [forms-and-validation](./forms-and-validation.md).
- Una columna, ancho de lectura (`max-inline-size: 40rem` aprox.).
- Acción primaria abajo a la izquierda del grupo de botones (o alineada con el flujo de lectura); secundaria "Cancelar" a su lado como ghost/outline.
- Barra de acciones **sticky** solo si el formulario es largo; recordá que no puede tapar el foco (scroll-margin).

### Página de lectura (detalle de solo lectura)
- Título, metadatos, acciones contextuales arriba a la derecha.
- Datos agrupados en secciones con `<h2>` y listas de definición (`<dl>`) para pares etiqueta/valor.
- Acciones destructivas apartadas visualmente de las primarias.

---

## 3. Navegación responsive

Elegí por **cantidad de destinos** y **frecuencia de uso**:

| Destinos | Patrón | Notas |
| :--- | :--- | :--- |
| 2-5, de uso frecuente | **Tab bar** inferior (móvil) / navbar superior (escritorio) | Etiqueta siempre visible junto al ícono. |
| 5-9 | **Navbar** horizontal (escritorio) o **sidebar** | En móvil, colapsa a menú o a tab bar con "Más". |
| Muchos / jerárquicos | **Sidebar** con grupos | Secciones con encabezado, colapsables, máximo 2 niveles. |
| Aplicación de trabajo (admin) | Sidebar fija + migas | La sidebar es el mapa; las migas, la ubicación. |

Reglas comunes:
- **Un menú de navegación es `<nav>` con una lista de enlaces**, no `role="menu"`.
- El **botón hamburguesa** es un `<button>` con `aria-expanded`, `aria-controls` y nombre accesible ("Abrir menú"); al abrir un menú que tapa la pantalla, tratalo como modal (foco atrapado, `Escape` cierra, foco vuelve al botón).
- El ítem activo se distingue por más que el color (peso, indicador, `aria-current="page"`).
- Los **destinos** son enlaces (`<a href>`); las **acciones** son botones. Un menú de usuario con "Perfil" (enlace) y "Cerrar sesión" (botón/form) mezcla ambos y está bien.
- **Targets** ≥ 44×44px en las barras táctiles; zona del pulgar para lo frecuente.
- **Migas** (`<nav aria-label="Migas">` + `<ol>`) a partir de 3 niveles de profundidad.

## 4. Responsive: puntos de quiebre y reflujo

Breakpoints de referencia (Material 3): compact < 600px, medium 600-839px, expanded ≥ 840px. Más detalle en *frontend-dls-investigacion*.

- **Mobile-first**: la base es móvil; `min-width` agrega complejidad.
- Media queries para el **layout de página**; `@container` para **componentes** (ver [modern-css-and-semantics](./modern-css-and-semantics.md)).
- Qué cambia entre tamaños: cantidad de columnas, navegación (tab bar ↔ sidebar), detalle (panel ↔ página), tablas (scroll horizontal o tarjetas). Qué **no** cambia: el orden lógico del DOM, que debe coincidir con el orden visual y de tabulación.
- Probá a **320px de ancho** y con **zoom 200%**: nada debe requerir scroll en dos dimensiones (salvo tablas y mapas).
- Respetá las safe areas de iOS (`env(safe-area-inset-*)`) en barras fijas.

## 5. Densidad

- **Cómoda** (por defecto): público general, móvil, tareas poco frecuentes.
- **Compacta**: herramientas de trabajo con muchos datos (tablas, admin). Se logra con tokens de espaciado menores (ver el modo compacto de [design-tokens.css](../examples/design-tokens.css)), **sin** bajar el target táctil por debajo del mínimo en pantallas táctiles.
- Densidad no es achicar la tipografía: es reducir el espacio *entre* grupos y filas, no el cuerpo de lectura (≥ 16px).

## 6. Jerarquía visual y espaciado

- **Proximidad**: el espacio entre un label y su input es menor que entre dos campos distintos; el espacio entre grupos, mayor que entre ítems de un grupo.
- **Una primaria por vista.** El resto, secundario/outline/ghost.
- Alineá a una grilla y a una escala de espaciado (4/8px); los valores sueltos rompen el ritmo.
- Contraste de **tamaño y peso** para jerarquía antes que color.

## Checklist de pantalla

- [ ] La tarea principal y la acción primaria son obvias en 5 segundos.
- [ ] Esqueleto con landmarks, un `<h1>` y skip link.
- [ ] Navegación acorde a la cantidad de destinos; ítem actual con `aria-current`.
- [ ] Los 8 estados resueltos por widget/sección, con los 3 vacíos.
- [ ] Estado de filtros/orden/página en la URL.
- [ ] Probado a 320px y a 200% de zoom; el orden del DOM coincide con el visual.
