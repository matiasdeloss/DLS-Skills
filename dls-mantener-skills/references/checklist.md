---
title: Checklist de dls-mantener-skills
tags: [skills, checklist]
---

# Checklist de dls-mantener-skills

Copiá y tildá por cada cambio.

## Alcance
- [ ] La skill es mía (no de terceros ni de un repo del equipo como `.ai/skills` de SENDA).
- [ ] Si es de terceros: avisé que una actualización puede pisar el cambio y respaldé el original.
- [ ] Si borro algo: lo moví a una carpeta de respaldo fechada.

## Edición
- [ ] Leí el `SKILL.md`, el `INDEX.md` y la bitácora (si existe).
- [ ] Edité solo la copia de la bóveda.

## Frontmatter y descripción
- [ ] `name` igual al nombre de la carpeta.
- [ ] `description` entre comillas dobles (con `: ` adentro, el YAML se rompe sin comillas).
- [ ] Largo de `description` medido de verdad: ___ / 1024.
- [ ] Tercera persona.
- [ ] Sin los caracteres angulares de apertura y cierre (usar corchetes).
- [ ] Lo clave primero (el listado corta `description` + `when_to_use` a 1.536 caracteres).
- [ ] Sin colisión de disparadores con otras skills mías.
- [ ] Referencias a otras skills por nombre, no por ruta.

## Verificación
- [ ] Lint de `vault_lint.py` sobre la carpeta: 0 errores.
- [ ] Scripts: `node --check` y prueba mínima, comparados con la versión anterior.

## Despliegue
- [ ] `bash deploy-skills.sh --dry-run` revisado y confirmado por el usuario.
- [ ] `bash deploy-skills.sh` ejecutado.
- [ ] `diff -rq` entre bóveda y `~/.claude/skills/<nombre>` sin diferencias.

## Cierre
- [ ] Estado actualizado en `INDEX.md`.
- [ ] Recordé abrir una sesión nueva.
- [ ] Informé qué cambió y qué falta que haga el usuario.
