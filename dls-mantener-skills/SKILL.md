---
name: dls-mantener-skills
description: "Flujo manual para modificar una skill personal sin romper nada: edita solo la copia de la bóveda, valida el frontmatter y la descripción (conteo real de caracteres, tercera persona, sin corchetes angulares), corre el lint, despliega con deploy-skills.sh (primero --dry-run y con confirmación), verifica con diff que la copia instalada quedó idéntica y actualiza el INDEX. Se invoca solo a mano: /dls-mantener-skills [skill] [cambio]."
disable-model-invocation: true
argument-hint: "[skill] [cambio]"
---

# Mantener skills personales

Flujo para cambiar una skill propia. Se invoca a mano: `/dls-mantener-skills [skill] [cambio]`.

## Hechos que no se discuten

- **Fuente de verdad:** la bóveda, `C:\Users\matia\OneDrive\Documentos\Obsidian Vault\Skills Personales\`.
- **Única copia instalada:** `~/.claude/skills/<nombre>`. Solo se usa Claude Code; no se suben a la cuenta.
- **Nunca se edita la copia instalada.** Es salida regenerable.
- **`deploy-skills.sh`** se corre desde la carpeta de la bóveda, en Git Bash. Reemplaza solo las carpetas de skills de esa carpeta y rechaza una cuya `name` no coincida con el nombre de la carpeta.
- **`INDEX.md`** lleva el estado y los pendientes.

## Reglas de alcance (antes de empezar)

- **Skill de terceros** (instalada por una herramienta externa): advertí que una actualización puede pisar el cambio y sugerí respaldar el original antes de tocarla.
- **Skill de un repo del equipo** (por ejemplo las de SENDA en `.ai/skills`): no la toques. Son del equipo y tienen su propio flujo (`php artisan boost:update`).
- **Borrar una skill:** nunca sin respaldo. Mové la carpeta a una carpeta de respaldo fechada (por ejemplo `~/.claude/skills-backup/AAAA-MM-DD/`), no la elimines.
- **Renombrar una skill:** cambiá a la vez la carpeta de la bóveda y el `name` del frontmatter (deben coincidir), reemplazá el nombre viejo en el resto de las skills y en el `INDEX.md` buscando con `rg` (solo coincidencias de palabra completa, para no duplicar el prefijo) y recordá que `deploy-skills.sh` no limpia lo viejo: mové la copia instalada con el nombre anterior a la carpeta de respaldo, o quedan dos versiones. La familia lleva el prefijo `dls` (por ejemplo `dls-skill-auditor`).

## Pasos

1. **Identificar.** Determiná la skill y el cambio a partir de los argumentos (si falta alguno, preguntá una sola cosa y esperá). Leé su `SKILL.md` y el `INDEX.md`. Si existe `Skills Personales\Bitácora de mejoras.md`, leela también; si no existe, ofrecé crearla, pero no la crees sin preguntar.
2. **Editar solo la copia de la bóveda.** Nunca `~/.claude/skills`.
3. **Validar la skill** con el checklist (versión tildable en [references/checklist.md](references/checklist.md)):
   - `name` igual al nombre de la carpeta.
   - `description` entre comillas dobles. Si tiene `: ` adentro, el YAML se rompe sin comillas.
   - Máximo 1024 caracteres, con conteo REAL (calculado, no a ojo).
   - En tercera persona.
   - Sin los caracteres angulares de apertura y cierre (la doc oficial dice que se muestran escapados): usá corchetes.
   - Lo clave primero: Claude Code corta `description` + `when_to_use` a 1.536 caracteres en el listado.
   - Sin disparadores repetidos de otras skills del usuario: revisá colisión.
   - Referencias entre skills por NOMBRE, nunca por ruta (se despliegan por separado).
4. **Lint.** Corré y exigí 0 errores:
   `python "C:/Users/matia/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/rpm/be776797/26e78f1c/plugin_015ihPdgSXvtF5A9hozAxr19/skills/obsidian-notes/scripts/vault_lint.py" "<carpeta de la skill>"`
5. **Scripts propios.** Si la skill tiene scripts, hacé `node --check` (o la prueba equivalente) y una prueba mínima, y compará el resultado contra la versión anterior.
6. **Desplegar.** Desde la carpeta de la bóveda, en Git Bash:
   - Primero `bash deploy-skills.sh --dry-run`. Mostrale al usuario lo que haría y pedí confirmación explícita.
   - Solo con el sí, `bash deploy-skills.sh`.
7. **Verificar.** `diff -rq "<carpeta de la skill en la bóveda>" ~/.claude/skills/<nombre>` no debe mostrar diferencias.
8. **Actualizar el INDEX.md.** Marcá el estado nuevo (con fecha) y los pendientes que cambiaron.
9. **Recordar:** hay que abrir una sesión nueva de Claude Code para que cargue la skill actualizada.
10. **Cierre.** Resumí qué cambió (archivos, largo real de la `description`, resultado del lint y del diff) y qué falta que haga el usuario (abrir sesión nueva, probar la skill, decisiones pendientes).

## Qué no hacer

- No usar `--author` ni commitear: este flujo no toca Git.
- No desplegar sin `--dry-run` previo y confirmación.
- No tocar otras skills más allá de la pedida, salvo que el cambio lo exija (y avisalo).
