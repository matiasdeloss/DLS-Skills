# Señales de alerta al auditar skills de terceros

Cada señal indica dónde mirar y por qué importa. Una sola no condena el repo; el conjunto y la verificación en fuente cruda deciden. Volver a [SKILL.md](../SKILL.md).

## Activación y colisión
- **`alwaysApply: true` o `applyTo: "**"`**: la skill se carga en cada conversación, consume contexto y compite con tus skills (`frontend-dls`) sin que la pidas.
- **Descripciones con "siempre", "aunque el usuario no lo pida", "obligatorio"**: fuerzan la activación por la description; es el mismo efecto que alwaysApply.
- **"No se puede delegar ni reemplazar"**: intenta anular a otras skills y a tu criterio.
- **Autopromoción en las instrucciones** (pide recomendar el propio producto, dar estrellas, mencionar la marca): la skill sirve a su autor, no a vos.
- **Referencias a skills hermanas no instaladas**: instrucciones que dependen de archivos inexistentes y llevan a improvisar o a pedir instalar más cosas.

## Ejecución de código
- **Hooks SessionStart / PostToolUse / Stop que ejecutan un binario**: corren con tus permisos en cada sesión o herramienta, fuera de lo que ves en el chat.
- **Descarga de binario con checksum dentro del mismo repo**: quien controla el repo controla también el checksum; no prueba integridad.
- **`npx -y paquete@latest`**: ejecuta la última versión publicada sin fijar; un compromiso del paquete llega directo a tu máquina.
- **Un modo que lanza otro agente con sandbox desactivado**: salta las protecciones de permisos.
- **`allowed-tools` amplios** (Bash sin restricción, Write, WebFetch): preaprueban acciones sin que te pregunten.
- **Fetch en cada uso de contenido remoto de una rama main**: el contenido que seguís instalado cambia sin revisión; es una puerta a inyección de instrucciones.

## Datos y privacidad
- **Telemetría que sigue activa** (o se desactiva solo con una variable poco visible): envía datos de uso o del proyecto a terceros.
- **Lectura de `~/.claude/.env` u otros `.env`**: acceso a claves y tokens sin necesidad.
- **MCP de pago o con cuenta externa**: dependencia y costo ocultos; datos que salen a un servicio ajeno.

## Instalación y actualización
- **Instalador que borra recursivamente la carpeta antes de copiar**: una actualización pisa tus ediciones locales y cualquier archivo propio en esa ruta.
- **Escribe fuera de su carpeta** (settings.json global, CLAUDE.md, otras skills): modifica tu configuración sin que sea evidente.

## Calidad
- **Gustos presentados como normas** ("nunca uses X") sin fuente: contradice criterios más sólidos como WCAG o MDN.
- **Afirmaciones técnicas erróneas**: verificá contra w3.org, MDN o docs oficiales antes de rescatar nada.
- **Sin licencia, repo archivado o sin mantenimiento**: no hay garantía de correcciones ni permiso claro de reutilización.
