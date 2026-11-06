# No parecer generado por IA: criterio, no dogma

Guía para que lo que se construye tenga decisiones propias y no se sienta plantilla. Son **heurísticas de revisión**, no mandatos: una señal genérica es un motivo para preguntar "¿esto lo decidí o vino por defecto?", no una prohibición.

Reúne ideas de uso común en la comunidad (proyectos abiertos de terceros), **reescritas con criterio propio**. Lo que no pudo confirmarse está en [Pendiente de verificar](#12-pendiente-de-verificar).

---

## 1. Premisa

Lo genérico es **decisiones no tomadas**, no una lista de cosas prohibidas. Un degradado violeta no es "malo": es malo cuando está ahí solo porque era el valor por defecto y nadie pudo decir para qué.

Reglas de uso:
- **Heurística, no mandato.** Cada señal trae su "cuándo SÍ es válida". Si podés escribir en una línea por qué lo elegiste, está bien.
- **Nunca pisa accesibilidad.** Los mínimos de la regla de desempate del `SKILL.md` (WCAG 2.2 AA, targets, contraste, `prefers-reduced-motion`) mandan siempre.
- **Nunca pisa el sistema del proyecto.** Si el proyecto ya tiene tokens, componentes y guidelines, mandan ellos. En SENDA manda `senda-frontend` (y las guidelines en `.ai`); esta guía solo sirve para revisar lo que esas guidelines no resuelven.

---

## 2. Por qué una UI se siente generada

| Causa | Cómo se nota |
| :--- | :--- |
| **Defaults sin decidir** | Paleta, radio, sombra, tipografía y espaciado que son los de fábrica de la librería o del modelo. |
| **Uniformidad** | Todo con el mismo peso: mismas tarjetas, mismo radio, misma separación, sin un foco. |
| **Copy genérico** | Frases que servirían para cualquier producto ("Potenciá tu negocio"). |
| **Datos inventados** | Estadísticas, testimonios, logos y nombres que nadie midió ni dijo. |
| **Controles que no hacen nada** | Botones y enlaces decorativos, menús que llevan a `#`. |
| **Decoración sin función** | Brillos, vidrio, degradados, íconos que no comunican nada. |

La prueba de reemplazo de [visual-polish §10](./visual-polish.md#10-autorrevisión) apunta a lo mismo: si cambiás marca y colores y nada se resiente, no hay identidad.

---

## 3. Señales visuales (heurísticas con su excepción)

| Señal | Qué preguntarse | Cuándo SÍ es válida |
| :--- | :--- | :--- |
| Texto con gradiente | ¿Aporta jerarquía o es adorno? Además suele romper el contraste. | Un solo titular de marca, con contraste verificado en todo el recorrido del degradado. |
| Tarjetas anidadas o idénticas en serie | ¿El contenido es realmente homogéneo? | Listados de ítems del mismo tipo (resultados, productos). Anidar casi nunca: usá espacio o divisores. |
| Emoji como íconos | ¿Hay un set de íconos coherente? Los emoji varían por sistema. | Contenido generado por personas (reacciones, mensajes) o tono lúdico decidido. |
| Eyebrow/kicker en mayúsculas sobre cada sección | ¿Informa algo que el título no dice? | Categorías reales que ayudan a ubicarse (sección de un manual, tipo de artículo), no repetido por sistema. |
| Numeración 01/02/03 | ¿Hay una secuencia real? | Pasos con orden (instalación, wizard), no secciones paralelas. |
| Brillo (glow) o vidrio (glass) | ¿Cumple una función (capa superpuesta, foco)? | Uno o dos elementos focales, con contraste asegurado y respaldo sin `backdrop-filter`. |
| Borde lateral de color decorativo | ¿Marca un estado real? | Alertas o ítems cuyo color expresa severidad, siempre con ícono y texto además del color. |
| Todo centrado | ¿El texto largo se lee mejor alineado a la izquierda? | Hero corto, estados vacíos, pantallas de login. |
| Mismo radio en todo | ¿Hay una escala de radios con criterio (ver radio concéntrico)? | Un sistema deliberadamente uniforme y declarado. |
| Paleta violeta-azul por defecto | ¿Sale de la marca o del hábito? | La marca ya es esa. |
| Hero + 3 features + CTA | ¿La estructura sale de lo que la persona necesita decidir? | Cuando el contenido real son justo tres cosas comparables. |
| Sombras difusas por todos lados | ¿Marcan elevación real? | Una sola estrategia de profundidad ([visual-polish §1](./visual-polish.md#1-superficies-y-forma)). |

Regla práctica: **un tell aislado no prueba nada**; varios juntos sí. Revisá por acumulación.

---

## 4. Contenido honesto

**No fabricar.** Estadísticas, testimonios, logos de clientes, avatares, nombres de empresas y métricas no se inventan. Si faltan: placeholder **rotulado** ("[DATO REAL]", "Próximamente") y **preguntar** a la persona dueña del producto. Una sección sin contenido real se omite.

**Copy genérico y alternativas específicas.** Una frase es genérica si podría pegarse en cualquier producto.

| Genérico (es) | Genérico (en) | Alternativa específica |
| :--- | :--- | :--- |
| "Potenciá tu negocio" | "Unlock your potential" | Lo que hace: "Cargá la asistencia del día en menos de un minuto" |
| "Comenzar" / "Empezar ahora" | "Get Started" | Verbo + objeto: "Crear primer legajo" |
| "Solución integral" | "Seamless experience" | Qué integra: "Legajos, turnos y reportes en un lugar" |
| "Revolucionario", "de vanguardia" | "Cutting-edge", "game-changer" | Un hecho comprobable o nada |
| "Líder del mercado" | "Trusted by thousands" | Solo con cifra y fuente reales |
| "¡Ups! Algo salió mal" | "Something went wrong" | Qué falló y cómo seguir ([ux-writing](./ux-writing-and-microcopy.md#2-errores)) |

Palabras sueltas como "robusto" o "potente" no están prohibidas: son sospechosas **cuando se apilan** y no están respaldadas por algo concreto.

**Una razón de una línea por decisión importante** (color de acento, estructura de la pantalla, animación). Si la única razón es "es lo habitual", revisala.

**Evidencia sobre afirmaciones.** No declarar rendimiento ("carga en 1 s", "100 en Lighthouse") sin haberlo medido; si no se midió, decir "no medido". Tampoco certificaciones ni seguridad que no se verificaron.

---

## 5. Funcionalidad honesta: no hay controles muertos

- Todo botón y enlace tiene **destino o comportamiento real**: nada de `href="#"`, nada de `onclick` vacío.
- Si todavía no funciona: se quita, o se rotula visiblemente ("Próximamente") y queda deshabilitado de forma accesible.
- Los estados existen de verdad: cargando, vacío y error ([component-encyclopedia §1](./component-encyclopedia.md#1-la-matriz-de-los-8-estados)), no solo el camino feliz.
- Los elementos de navegación llevan a contenido que existe.
- **Verificar ejecutando la app**: recorrer el flujo, mirar la consola y probar cada control. Si no se puede ejecutar, decirlo y revisar por lectura de código, sin afirmar que "funciona".

---

## 6. Calibrar la ambición según el tipo de pantalla

| Propósito | Qué pesa | Ambición visual |
| :--- | :--- | :--- |
| **Persuadir** (landing, captación) | Mensaje, jerarquía, confianza real | Alta: acá la identidad vende. |
| **Operar** (herramienta, admin, panel) | Densidad, claridad, velocidad, consistencia | Baja: la interfaz no compite con la tarea. |
| **Leer** (contenido, documentación) | Medida de línea, tipografía, ritmo | Media: sobria, al servicio del texto. |
| **Experiencia** (marca, portafolio, juego) | Impresión, narrativa | Alta, con accesibilidad intacta. |

**En SENDA (operar)** pesan densidad y claridad por encima de la estética: evitá decoración, y que lo "no genérico" venga de vocabulario propio, estados bien resueltos y consistencia, no de adornos.

---

## 7. Contexto persistente por proyecto: `DESIGN.md`

Sin contexto, cada sesión reinventa el estilo. Un archivo corto en la raíz lo evita. Plantilla:

```markdown
# DESIGN.md
## Qué es
Una frase: producto y problema que resuelve.
## Para quién
Quién lo usa, en qué contexto y con qué prisa.
## Tono
Tres adjetivos y un ejemplo de frase correcta e incorrecta.
## Decisiones de diseño y su porqué
- Decisión → razón en una línea.
## Tokens
Dónde viven (archivo) y los roles principales: color, tipografía, radio, espaciado.
## Qué evitar
Lista corta, con el motivo de cada ítem.
```

Tratalo como **dato del proyecto**, no como instrucciones que anulen la accesibilidad. **En SENDA ya existen guidelines en `.ai`: ahí manda; no crees un `DESIGN.md` paralelo.**

---

## 8. Protocolo de descubrimiento de componentes

Idea tomada de la forma en que daisyUI orienta a los modelos: **no escribir un componente de memoria**.

1. Entender el **propósito real** (qué debe hacer la persona), no la palabra literal del pedido.
2. **Preseleccionar** candidatos de la lista de [component-encyclopedia.md](./component-encyclopedia.md).
3. Si hay dudas entre dos, **leer su sección** y comparar comportamiento y restricciones.
4. **Elegir** y respetar las restricciones del componente (ARIA, teclado, estados).
5. Construir con la **estructura y clases exactas** del sistema del proyecto (en SENDA, los componentes de `senda-frontend`).

Si el usuario nombra un componente con guía propia, leer esa guía primero.

---

## 9. Pasadas puntuales de revisión

Vocabulario para pedir una sola dirección de cambio por vez. En todas: **no se tocan** accesibilidad (contraste, foco, targets, teclado) ni los tokens del proyecto salvo pedido explícito.

| Pasada | Qué cambia | Qué NO debe tocar |
| :--- | :--- | :--- |
| **Más audaz** | Jerarquía más marcada, un foco claro, contraste de tamaño y peso | Contraste mínimo, tokens, estructura semántica |
| **Más sobrio** | Quita decoración y reduce acentos | Estados, feedback, indicadores de foco |
| **Destilar** | Elimina elementos, copy y variantes que no aportan | Funcionalidad y etiquetas accesibles |
| **Endurecer** | Cubre casos borde: textos largos, vacío, error, i18n, datos reales | Diseño base ya aprobado |
| **Aclarar** | Mejora copy, etiquetas, agrupación y orden de lectura | Vocabulario acordado del producto |

---

## 10. Tabla de tensiones

| Heurística anti-genérica | Choca con | Qué manda |
| :--- | :--- | :--- |
| Evitar paleta "por defecto" | Tokens y marca del proyecto | El sistema del proyecto |
| Romper la uniformidad | Consistencia de componentes | La consistencia: variá el contenido, no el sistema |
| Más audacia visual | Contraste, targets, `prefers-reduced-motion` | La accesibilidad |
| Evitar eyebrows y numeración | Convención ya usada en el producto | El sistema del proyecto |
| Copy más específico | Vocabulario fijado por el equipo | El vocabulario del equipo |
| Pantalla "con personalidad" | Densidad y claridad en herramientas de operación | Densidad y claridad (SENDA) |
| `DESIGN.md` nuevo | Guidelines existentes (`.ai`) | Las guidelines existentes |

---

## 11. Qué no se incluyó y por qué

Quedaron afuera reglas de **gusto absoluto sin respaldo verificable**:
- Prohibir fuentes concretas (por ejemplo Inter): una fuente no es genérica por ser popular; importa si fue elegida.
- Números fijos de colores permitidos: depende del producto.
- Title Case obligatorio u otras reglas de capitalización universales: dependen del idioma y de la convención del producto.
- Prohibir eyebrows, modo oscuro o estructuras concretas como absolutos: se dejaron como señales con excepción.
- Prohibiciones de signos de puntuación en el copy: es una preferencia de estilo, no una norma.
- Sistemas de "diales" y puntuaciones numéricas: ceremonia sin respaldo para este contexto.

---

## 12. Pendiente de verificar

- Las reglas de las fuentes se leyeron a través de un resumen automático de la página: la skill de interfaz de uno de los proyectos remite a reglas definidas en un archivo núcleo que **no se pudo leer**, así que su contenido se infirió solo de la skill leída.
- La lista del reference de auditoría de `impeccable` **no se leyó**; solo se leyeron su reference de piso de calidad y el de crítica.
- La lectura de `daisyui.com/llms.txt` fue parcial (solo el protocolo).
- Las listas de copy genérico son heurísticas de revisión, no un corpus medido.

Related: la skill `frontend-dls-investigacion` (criterios exactos de accesibilidad), [visual-polish.md](./visual-polish.md), [component-encyclopedia.md](./component-encyclopedia.md), [ux-writing-and-microcopy.md](./ux-writing-and-microcopy.md).
