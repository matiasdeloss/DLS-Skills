# Plantilla de reporte de bug

Usala como estructura; el contenido lo escribe el usuario. Lo no informado se marca "no informado", nunca se inventa.

## Plantilla

```markdown
# [Comportamiento defectuoso] en [lugar]

- **Entorno:** local / staging / producción; commit o versión; PHP, Laravel, MySQL; navegador y SO si aplica
- **Precondiciones:** rol del usuario, datos existentes, estado previo

## Pasos para reproducir
1. ...
2. ...
3. ...

## Resultado esperado
Qué debería pasar y según qué criterio.

## Resultado actual
Qué pasa realmente, con mensajes de error textuales.

## Evidencia
Captura, log, respuesta HTTP, consulta SQL (sin secretos ni datos personales reales).

## Clasificación
- **Severidad:** Crítico / Mayor / Menor (impacto)
- **Prioridad:** Alta / Media / Baja (urgencia; la define quien gestiona)
- **Frecuencia:** siempre / a veces / una vez

## Notas
- Hipótesis: ... (marcada como hipótesis, no confirmada)
```

## Ejemplo bueno (SENDA-like, Laravel)

```markdown
# Error 500 al guardar un turno con fecha de hoy en el formulario de turnos

- **Entorno:** staging, commit a1b2c3d; PHP 8.3, Laravel 11, MySQL 8; Firefox 130 en Windows 11
- **Precondiciones:** usuario con rol "recepción"; existe el profesional "Test, Ana" con agenda habilitada

## Pasos para reproducir
1. Iniciar sesión como usuario de recepción.
2. Ir a Turnos > Nuevo turno.
3. Elegir profesional "Test, Ana".
4. En Fecha, elegir la fecha de hoy; dejar Hora vacía.
5. Presionar "Guardar".

## Resultado esperado
Validación en el campo Hora: "La hora es obligatoria". El turno no se crea.

## Resultado actual
Página "Server Error 500". No se crea el turno.

## Evidencia
- `storage/logs/laravel.log`: `SQLSTATE[23000]: Column 'hora' cannot be null` (insert en `turnos`).
- Respuesta de POST /turnos: status 500.
- Captura adjunta: turnos-500.png (sin datos reales de pacientes).

## Clasificación
- **Severidad:** Mayor (la recepción no puede cargar turnos sin hora; rodeo: completar la hora)
- **Prioridad:** Media (propuesta)
- **Frecuencia:** siempre (3 de 3 intentos); con la hora completa no falla

## Notas
- Hipótesis: falta la regla `required` para `hora` en el FormRequest; no verificado.
```

Por qué es bueno: título con comportamiento y lugar, pasos que cualquiera sigue, esperado y actual separados, evidencia concreta y enmascarada, hipótesis marcada como tal, severidad justificada.

## Ejemplo malo (comentado)

```markdown
# No anda lo de turnos
```
```markdown
Hola, cuando guardo un turno a veces me tira error, creo que es un problema de la
base de datos. Pasa seguido. Es urgente, arreglenlo ya. Adjunto mi login:
usuario@ejemplo.com / (contraseña real pegada acá)
```

Qué está mal:
- **Título:** no dice qué falla ni dónde ("lo de turnos").
- **Pasos:** no hay; nadie puede reproducirlo.
- **Esperado vs actual:** ausentes; "me tira error" no dice cuál.
- **Entorno y precondiciones:** no informados.
- **Hipótesis como hecho:** "problema de la base de datos" sin evidencia, y en el cuerpo en vez de en Notas.
- **Frecuencia vaga:** "a veces" y "seguido" sin condición que distinga fallo de acierto.
- **Severidad y prioridad mezcladas:** "urgente" es prioridad y no dice qué impacto hay.
- **Credenciales reales** en el reporte: nunca se incluyen.
- **Varias cosas posibles en una:** no se sabe si es un bug o más.

## Qué se puede quitar y sigue fallando (reproducción mínima)

En el ejemplo bueno, elegir profesional y fecha de hoy no era necesario si el fallo ocurre con cualquier fecha y la hora vacía. Antes de cerrar, probá quitar cada paso o dato y registrá si el bug persiste; el reporte queda con lo mínimo que lo dispara.
