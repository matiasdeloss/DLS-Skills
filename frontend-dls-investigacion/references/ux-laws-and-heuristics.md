# Leyes de UX y Heurísticas aplicadas al Frontend

Traduce los principios de psicología cognitiva de **[Laws of UX](https://lawsofux.com/)** en decisiones concretas de código y maquetación. No es teoría decorativa: cada ley acá abajo predice un comportamiento real de usuario y tiene una consecuencia técnica.

## Índice rápido

| Si el problema es… | Mirá |
| :--- | :--- |
| Botones difíciles de acertar, acciones mal ubicadas | [Fitts](#1-fittss-law) |
| Menú/formulario abrumador, demasiadas opciones | [Hick](#2-hicks-law), [Choice Overload](#11-choice-overload-y-serial-position-effect) |
| Usuarios que "no encuentran" cosas obvias | [Jakob](#3-jakobs-law), [Mental Model](#12-mental-model-y-paradox-of-the-active-user) |
| Datos largos, listas inabarcables | [Miller / Chunking](#4-millers-law) |
| Se siente lento aunque no lo sea | [Doherty](#5-doherty-threshold) |
| Formularios que rechazan entradas válidas | [Postel](#6-postels-law) |
| Nada destaca, o todo destaca | [Von Restorff](#7-von-restorff-effect) |
| Abandono a mitad de un flujo | [Zeigarnik / Goal-Gradient](#8-zeigarnik-effect--goal-gradient-effect) |
| Layout desordenado, no se entiende qué va con qué | [Gestalt](#9-leyes-gestalt-de-organización-visual) |
| Feature creep, pantallas sobrecargadas | [Occam / Cognitive Load](#10-cognitive-load-prägnanz-y-occams-razor) |
| Interfaz correcta pero que "cae mal" | [Peak-End](#13-peak-end-rule-y-aesthetic-usability-effect) |
| Complejidad que se le tira encima al usuario | [Tesler](#14-teslers-law) |

---

## 1. Fitts's Law
> *El tiempo para alcanzar un objetivo depende de su distancia y su tamaño.*

- **Áreas táctiles mínimas**: `48×48px` (Material / web.dev) o `44×44pt` (Apple HIG). El mínimo absoluto de WCAG 2.2 AA es `24×24px`, pero apuntar a 44-48 evita el *fat-finger error*.
- Si el ícono visual mide `20×20px`, expandí el área de clic sin alterar el layout:
  ```css
  .icon-button {
    position: relative;
    inline-size: 24px;
    block-size: 24px;
  }
  .icon-button::before {
    content: '';
    position: absolute;
    inset: -12px; /* área efectiva de 48×48 */
  }
  ```
- **Thumb zone**: en móvil, las acciones frecuentes van abajo (bottom nav, FAB, bottom sheets), donde llega el pulgar sin recolocar la mano.
- **Bordes y esquinas son objetivos infinitos**: un botón `position: sticky; bottom: 0` es rapidísimo de acertar porque el dedo o el cursor no se pueden pasar del límite físico de la pantalla.
- **Separación entre targets**: dejá al menos `8px` entre elementos accionables adyacentes; targets pegados convierten un error de 2px en la acción equivocada (peor todavía si una de las dos es destructiva).

---

## 2. Hick's Law
> *El tiempo de decisión crece logarítmicamente con el número y la complejidad de las opciones.*

- **Progressive disclosure**: no muestres 30 campos de una. Dividí en pasos (`Stepper`/`Wizard`) y escondé lo avanzado detrás de `<details>/<summary>` o secciones colapsables.
- **Búsqueda por encima de ~7-10 opciones**: un `<select>` largo se convierte en un `Combobox` con filtrado en vivo.
- **Jerarquía de acciones**: una primaria (`filled`), el resto secundarias (`outlined`/`tonal`) y las de cancelar o contextuales en `ghost`/`text`.
- **Cuidado con la trampa**: reducir opciones no es esconderlas en submenús infinitos. Mover una decisión de 8 opciones a 3 menús de 3 opciones puede empeorar el tiempo total. Agrupá por significado, no por cantidad.

---

## 3. Jakob's Law
> *Los usuarios pasan la mayor parte del tiempo en otros sitios; esperan que el tuyo funcione igual.*

Convenciones que casi nunca conviene romper:
- Logo arriba a la izquierda, enlazando al home.
- Carrito y avatar de perfil arriba a la derecha.
- Búsqueda con ícono de lupa.
- Enlaces dentro de texto: subrayados o con color claramente diferenciado.
- `Escape` cierra modales, dropdowns y drawers.
- `Tab` / `Shift+Tab` recorren en orden de lectura natural.
- El botón "atrás" del navegador funciona (ojo con SPAs que rompen el historial).

**Aplicado a plataformas**: si el producto corre en web, iOS y Android, no calques la misma navegación en las tres. La convención nativa *es* lo familiar para ese usuario: tab bar inferior y gesto de swipe-back en iOS, back de sistema y navigation drawer en Android. Ver [design-systems-and-tokens.md](./design-systems-and-tokens.md#9-convenciones-por-plataforma).

---

## 4. Miller's Law
> *La memoria de trabajo retiene ~7 (±2) elementos a la vez.*

- **Chunking**: formateá datos largos automáticamente — tarjeta `4532 •••• •••• 8821`, teléfono `+54 (11) 4567-8900`, IBAN en bloques de 4.
- Agrupá listas largas en categorías, tarjetas o acordeones.
- Máximo 5-7 items en navegación principal.
- **Corolario práctico**: nunca obligues al usuario a recordar un dato de un paso anterior. Si en el paso 3 tiene que confirmar la dirección que puso en el paso 1, mostrale la dirección — no le pidas que la recuerde ni que vuelva atrás.

---

## 5. Doherty Threshold
> *La productividad se dispara cuando la interacción ocurre por debajo de 400ms.*

- **Respuesta visual < 100ms**: estado `:active`, ripple o cambio de fondo inmediato al presionar. Esto es independiente de la red: es feedback local.
- **UI optimista**: en "me gusta", "guardar" o un switch, actualizá la UI al instante y revertí con un toast de error + reintento si el servidor falla.
- **Skeletons > spinners** para carga de contenido: si el skeleton tiene la forma y el tamaño exactos del contenido final, la transición no genera layout shift (CLS) y la espera se percibe más corta.
- **Spinners > skeletons** para acciones puntuales dentro de un botón, donde no hay una forma que anticipar.
- Si la operación va a tardar más de ~1s, mostrá progreso real o al menos texto de estado ("Procesando 3 de 12…"); una animación indefinida de 10 segundos se lee como "se colgó".

---

## 6. Postel's Law
> *Sé liberal en lo que aceptás, conservador en lo que emitís.*

- Aceptá teléfonos con o sin espacios, guiones o paréntesis y normalizá en JS antes de enviar.
- Aceptá URLs pegadas sin `https://`.
- Permití pegar texto con saltos de línea, espacios de sobra o formato, y sanitizalo vos.
- Aceptá fechas en más de un formato si el contexto lo permite, y mostrá siempre cómo la interpretaste.
- **Errores reparables**: no digas "Entrada inválida". Decí qué se espera: *"Ingresá un correo con formato nombre@dominio.com"*. Un error que no dice cómo arreglarlo es un callejón sin salida.

---

## 7. Von Restorff Effect
> *Entre elementos similares, el que difiere se recuerda y se acciona.*

- En pricing cards, destacá el plan recomendado con badge, borde de acento y una escala apenas mayor (`transform: scale(1.03)`).
- No compitas con dos botones primarios del mismo peso en la misma vista.
- El efecto se gasta: si destacás cinco cosas, no destacaste ninguna.

---

## 8. Zeigarnik Effect & Goal-Gradient Effect
> *Las tareas incompletas se recuerdan mejor, y el esfuerzo acelera cerca de la meta.*

- Indicadores de completitud: *"Tu perfil está al 75%"*.
- Pasos explícitos: *"Paso 2 de 3: Datos de envío"*.
- El efecto goal-gradient es más fuerte si el progreso arranca por encima de cero: una barra de onboarding que empieza en 20% ("ya creaste tu cuenta") genera más finalización que una que empieza en 0%.

---

## 9. Leyes Gestalt de organización visual

Son la herramienta más barata que existe para bajar carga cognitiva: no requieren copy nuevo ni features, solo espaciado y agrupación.

| Principio | Regla | Implementación |
| :--- | :--- | :--- |
| **Proximidad** | Lo relacionado, más cerca entre sí que de lo no relacionado. | `gap: var(--space-sm)` dentro del grupo vs `margin-block-end: var(--space-2xl)` entre secciones. |
| **Región común** | Lo que comparte contenedor se percibe como grupo. | `Card`, borde sutil (`1px solid var(--color-border)`) o fondo diferenciado. |
| **Similitud** | Misma apariencia = misma función. | Todos los links iguales; todos los primarios iguales. |
| **Conectividad uniforme** | Elementos conectados visualmente se leen como unidad. | Líneas de un stepper, agrupación de un `ButtonGroup` sin gaps. |
| **Prägnanz** | El ojo prefiere la interpretación más simple. | Formas regulares y alineación consistente antes que decoración. |

**El error más común**: espaciado uniforme en todos lados. Si el gap entre el label y su input es igual al gap entre dos campos distintos, el ojo no puede agrupar y el formulario se lee como una lista plana de elementos sueltos.

---

## 10. Cognitive Load, Prägnanz y Occam's Razor
> *Cada elemento en pantalla cuesta atención.*

- Antes de agregar una opción, preguntá qué se puede sacar.
- **Pareto**: el 20% de las funciones cubre el 80% del uso. Ese 20% va visible y accesible; el resto puede estar a un clic de distancia.
- Distinguí carga **intrínseca** (la tarea es compleja de verdad) de carga **extrínseca** (la interfaz la hace más compleja de lo necesario). Solo la segunda es tu culpa y solo esa se puede eliminar.

---

## 11. Choice Overload y Serial Position Effect

- **Choice overload**: más opciones no es más libertad; a partir de cierto punto reduce la satisfacción y aumenta el abandono. Ofrecé un default recomendado.
- **Serial position**: en una lista, se recuerdan mejor el primero y el último. Poné las opciones más importantes en los extremos, y en navegación reservá el primer y último slot para lo crítico.

---

## 12. Mental Model y Paradox of the Active User

- **Mental model**: el usuario llega con un modelo de cómo debería funcionar esto, formado en otros productos. Cuando tu interfaz contradice ese modelo, la culpa la percibe como tuya. Si tenés que explicar por qué tu carrito funciona distinto, ya perdiste.
- **Paradox of the active user**: nadie lee el manual ni el tour de onboarding; la gente explora y aprende haciendo. Diseñá para que se entienda sin instrucciones, y usá el onboarding para lo que no se puede inferir, no para explicar lo obvio.

---

## 13. Peak-End Rule y Aesthetic-Usability Effect

- **Peak-End**: la percepción global de una experiencia la determinan su momento más intenso y su final. Invertí desproporcionadamente en el último paso de un flujo — confirmación de compra, pantalla de éxito, el mensaje después de cancelar una suscripción.
- **Aesthetic-Usability**: lo que se ve bien se percibe como más fácil de usar y perdona más los errores. No es excusa para maquillar una interfaz rota, pero sí razón para no tratar el pulido visual como opcional.
- **Selective attention**: la gente ignora activamente lo que parece publicidad ("banner blindness"). Un mensaje importante con forma de banner promocional no se lee.

---

## 14. Tesler's Law
> *Ley de conservación de la complejidad: toda aplicación tiene una complejidad irreductible; la única pregunta es quién la absorbe.*

Es la ley más útil para decidir arquitectura, porque casi siempre hay una opción "fácil" que consiste en pasarle el problema al usuario:

| Complejidad | Se la damos al usuario ❌ | La absorbe el sistema ✅ |
| :--- | :--- | :--- |
| Formato de teléfono | "Ingresá sin espacios ni guiones" | Normalizamos en el submit |
| Zona horaria | "Ingresá la hora en UTC" | Detectamos y mostramos en su TZ |
| Tamaño de imagen | "Subí una imagen de máximo 2MB" | Comprimimos del lado del cliente |
| Campos obligatorios | Error genérico al final | Validación inline y foco en el primer error |

La complejidad que absorbe el sistema cuesta más código una vez; la que absorbe el usuario cuesta un poco cada vez que alguien usa el producto.
