# UX writing y microcopy

El texto de la interfaz **es** la interfaz: un botón mal rotulado o un error vago cuestan más que un bug visual. Esta guía cubre errores, estados vacíos, llamadas a la acción y confirmaciones. Los fundamentos (Postel, Tesler, carga cognitiva) están en la skill *frontend-dls-investigacion*, leyes de UX.

---

## 1. Principios

1. **Claro antes que ingenioso.** Quien está en medio de una tarea no quiere humor ni jerga.
2. **Lenguaje del usuario**, no del sistema ("No pudimos guardar tus cambios", no "Error 500: excepción de persistencia").
3. **Breve, pero completo**: lo mínimo que permite decidir y actuar.
4. **Consistente**: un concepto, una palabra. Si es "Proyecto", nunca "Tarea" ni "Espacio" en otro lado. Elegí el vocabulario y listalo.
5. **Voz activa y tono estable**: cercano y respetuoso. En errores, empatía sin dramatismo; jamás culpar al usuario.
6. **Sin mayúsculas gritadas ni signos de admiración** como relleno. Los `!` quedan para celebraciones reales.
7. **Ortografía del idioma de la interfaz**: si es español rioplatense (voseo), sostenelo en todos los textos o elegí neutro y sostenelo.

## 2. Errores

Fórmula: **qué pasó + por qué (si ayuda) + cómo se arregla.**

| Mal | Bien |
| :--- | :--- |
| "Error" | "No pudimos guardar el proyecto. Revisá tu conexión e intentá de nuevo." |
| "Campo inválido" | "Ingresá un correo con el formato usuario@dominio.com" |
| "Contraseña incorrecta" (login) | "El correo o la contraseña no coinciden." (no reveles cuál falló) |
| "¡Ups! Algo salió mal :(" | "No pudimos cargar tus pedidos. Reintentar" |

- **Cerca del problema**: el error de un campo, debajo del campo; el error global, arriba, con foco.
- **Con acción**: botón "Reintentar", enlace a la solución, contacto de soporte si no hay salida.
- **No uses solo color**: ícono + texto ([forms-and-validation](./forms-and-validation.md#4-mensajes-de-error)).
- **Errores del servidor**: nunca muestres trazas ni mensajes crudos de la base. Mostrá un texto humano y un identificador de referencia si soporte lo necesita.
- **Conservá lo que el usuario escribió.**

## 3. Estados vacíos

Tres casos con mensajes distintos ([enciclopedia §1](./component-encyclopedia.md#1-la-matriz-de-los-8-estados)):

| Caso | Estructura | Ejemplo |
| :--- | :--- | :--- |
| **Primer uso** | Qué es + para qué sirve + acción de arranque | "Todavía no hay estudiantes. Cargá el primero para empezar a hacer seguimiento." [**Agregar estudiante**] |
| **Sin resultados** | Qué buscó + cómo ampliar | "No encontramos resultados para «Gómez». Probá con otro nombre o limpiá los filtros." [Limpiar filtros] |
| **Error de carga** | Qué falló + reintento | "No pudimos cargar la lista." [Reintentar] |

Un vacío que solo dice "No hay datos" desperdicia el mejor momento para enseñar.

## 4. Llamadas a la acción (CTA) y botones

- **Verbo + objeto**: "Guardar cambios", "Eliminar proyecto", "Crear cuenta". Evitá "Aceptar", "OK", "Enviar" a secas.
- El botón **dice lo que hace**, no lo que es: "Descargar reporte" > "Reporte".
- **La acción primaria nombra el resultado**; la cancelación es corta ("Cancelar", "Volver").
- Mismo verbo para la misma acción en toda la app ("Eliminar" o "Borrar", no ambos).
- Enlaces: texto que tenga sentido **fuera de contexto** (los lectores listan los enlaces): "Ver detalles de la factura", no "Click acá".
- Estados de carga en el botón: "Guardando…" (el estado cambia el texto y se anuncia).

## 5. Confirmaciones y acciones destructivas

- **Preferí deshacer** a pedir confirmación: "Proyecto eliminado. [Deshacer]" (5 s o más).
- Si confirmás, **sé específico**: título "¿Eliminar «Plan 2025»?", cuerpo "Se borrarán sus 12 tareas. No se puede deshacer.", botones "**Eliminar plan**" / "Cancelar". Nunca "¿Estás seguro?" con "Sí/No".
- El botón destructivo usa el color/estilo destructivo y **no** es el foco inicial por defecto.
- Para acciones de alto riesgo, pedí escribir el nombre del recurso.

## 6. Confirmaciones de éxito

- Cerca de lo que se hizo: "Cambios guardados" junto al botón o toast efímero para lo menor.
- Para lo importante (pago, envío), **mensaje persistente** con el siguiente paso y un comprobante; no un toast que desaparece.

## 7. Etiquetas, ayudas y placeholders

- **Label**: sustantivo corto ("Correo electrónico"). Sin dos puntos obligatorios.
- **Ayuda**: formato y restricciones **antes** de equivocarse ("Mínimo 8 caracteres").
- **Placeholder**: solo ejemplo del formato ("ana@correo.com"); nunca instrucciones imprescindibles.
- **Opcional** marcado con "(opcional)".

## 8. Estados de carga y progreso

- Carga corta: skeleton, sin texto.
- Carga > 3-5 s: texto de estado ("Importando 120 filas…") y, si se puede, progreso.
- Operación larga en segundo plano: avisá cuándo estará lista y ofrecé continuar ("Te avisamos por correo").

## 9. Números, fechas y unidades

- Formateá según la **localización** del usuario (`Intl.NumberFormat`, `Intl.DateTimeFormat`): separadores, orden de la fecha, moneda.
- Fechas relativas ("hace 3 días") con la fecha absoluta accesible (`<time datetime>` / `title`).
- Siempre la unidad ("12 kg", "30 min").

## 10. Accesibilidad del texto

- **Nivel de lectura sencillo**; frases cortas.
- **No dependas de la posición ni del color** ("el botón verde de la derecha"): nombralo ("el botón Guardar").
- **Texto alternativo** y nombres accesibles también son microcopy: revisalos como el resto.
- Idioma declarado (`<html lang>`) y `lang` en los fragmentos en otro idioma.

## 11. Tono según el momento

El tono estable de la sección 1 no significa el mismo registro siempre: la voz se mantiene, la intensidad se ajusta al momento. La regla de fondo es que **la gravedad del tono coincida con la gravedad del hecho**.

| Momento | Tono | Cómo suena | Evitar |
| :--- | :--- | :--- | :--- |
| **Éxito** | Celebratorio sin exagerar | "Cambios guardados." · "Listo, tu pedido está en camino." | Festejar de más una acción menor |
| **Error** | Empático y útil | "No pudimos guardar el proyecto. Revisá tu conexión e intentá de nuevo." | Culpar al usuario, dramatizar, hacer humor |
| **Advertencia** | Claro y accionable | "Si cambiás el plan, perdés los 12 turnos cargados. Exportalos antes." | Alarmismo sin salida; un aviso que no dice qué hacer |
| **Neutro / informativo** | Llano y breve | "Última actualización: hoy, 14:32." | Adornos y personalidad donde no hace falta |

## 12. Alternativas para copy importante

Para el texto que más pesa (la acción principal de un alta, un error crítico, el primer estado vacío), escribí **dos o tres versiones** con intención distinta y elegí con criterio, no con la primera que sale. Ejemplo para el botón principal de un alta:

| Opción | Tono | Cuándo usarla |
| :--- | :--- | :--- |
| "Crear cuenta" | Directo y neutro | Por defecto; productos de trabajo o administrativos. |
| "Empezar gratis" | Comercial, centrado en el beneficio | Solo si de verdad existe un plan gratuito; si no, es engañoso. |
| "Crear mi cuenta" | Cercano, en primera persona | Productos de consumo; probalo, no supongas que convierte más. |

Cómo elegir:

1. Escribí dos o tres versiones con tonos distintos.
2. Descartá las que prometen algo que el producto no cumple.
3. Elegí según el contexto y el público.
4. Anotá cuál elegiste y por qué en tu lista de vocabulario (principio 4 de la sección 1), para no decidir lo mismo dos veces.
5. Si hay tráfico real, medilo con usuarios: ninguna tabla reemplaza eso.

## 13. Tooltips

- Aportan lo que **no** está a la vista. Un tooltip "Guardar" sobre un botón que dice "Guardar" no dice nada; sirven para explicar un ícono, una abreviatura o una restricción.
- **Una frase corta.**
- **Nunca información imprescindible.** En táctil no hay hover y no todos los lectores lo anuncian (ver [Popover / Tooltip](./component-encyclopedia.md#popover--tooltip)). Si hace falta para completar la tarea, va visible como ayuda del campo (sección 7).
- En un botón de solo ícono, el **nombre accesible va aparte** (`aria-label`); el tooltip no lo reemplaza.
- Mismo vocabulario que el resto de la interfaz.

## 14. Notas de localización

Si el producto se traduce o ya se ofrece en más de un idioma o variante:

- **Evitá modismos y juegos de palabras** que no sobreviven a la traducción. Si ofrecés más de una variante del español, decidí el registro (voseo o neutro) como en el principio 7 de la sección 1.
- **Prevé que el texto crezca.** Una traducción suele ocupar más que el original, pero **cuánto más depende del idioma y de la longitud del texto**: no uses un porcentaje fijo, medilo con texto real o con pseudolocalización (alargar las cadenas a propósito para probar el layout). Nada de anchos fijos en botones, tabs o columnas: el texto tiene que poder envolver, o truncarse con el texto completo disponible.
- **No armes frases pegando fragmentos.** "Tenés " + n + " mensajes" se rompe donde cambian el orden de las palabras, el género o el plural. Usá cadenas completas con marcadores de posición y las reglas de plural del sistema (`Intl.PluralRules` en JavaScript o el pluralizador de tu framework, como `trans_choice` en Laravel).
- **Evitá texto dentro de imágenes:** no se traduce ni lo lee un lector de pantalla.
- Formatos de números, fechas y monedas: sección 9. Dirección de escritura (RTL), `lang` y propiedades lógicas: skill `frontend-dls-investigacion`, referencia de i18n y localización.

## Checklist

- [ ] El tono de cada mensaje coincide con la gravedad del hecho (éxito, error, advertencia, neutro).
- [ ] Ninguna frase se arma concatenando fragmentos y ningún ancho fijo asume el largo del texto original.
- [ ] Todo error dice qué pasó y cómo seguir; ninguno culpa al usuario ni muestra detalles técnicos.
- [ ] Los tres vacíos tienen mensaje propio y acción.
- [ ] Los botones son verbo + objeto, coherentes en toda la app.
- [ ] Las confirmaciones destructivas nombran el recurso y la acción, o hay "Deshacer".
- [ ] Un concepto = una palabra, en un solo registro (voseo o neutro).
- [ ] Los enlaces tienen sentido fuera de contexto.
