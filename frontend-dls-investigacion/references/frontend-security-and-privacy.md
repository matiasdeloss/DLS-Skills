# Seguridad y privacidad en el cliente

Lo que el frontend puede y no puede garantizar. La regla de fondo: **el cliente es territorio hostil**. Todo lo que está en el navegador lo puede leer y modificar el usuario; la seguridad real vive en el servidor, y el frontend solo evita abrirle puertas.

> Última verificación: 2026-11-04 contra MDN (`target=_blank`/`noopener`, CSP, SRI) y la documentación de Laravel (CSRF) y htmx. Los puntos marcados **(verificar en tu versión)** dependen de la versión del framework.

---

## 1. XSS: nunca datos no confiables como HTML

**El problema.** Si un dato que controla otra persona (un nombre, un comentario, un parámetro de URL) termina interpretado como HTML o JS, esa persona ejecuta código en el navegador de tus usuarios.

| Sumidero | Riesgo | Alternativa |
| :--- | :--- | :--- |
| `el.innerHTML = dato` | Interpreta HTML y atributos de evento | `el.textContent = dato` |
| `document.write`, `insertAdjacentHTML` con datos | Igual | Crear nodos con `createElement` + `textContent` |
| `eval`, `new Function`, `setTimeout("string")` | Ejecuta código | No usar |
| `href`/`src` con `javascript:` | Ejecuta código al hacer clic | Validar esquema (`http:`/`https:`/`mailto:`) |
| Plantillas sin escapar | Igual | Usar el escape por defecto del motor (Blade `{{ }}`, JSX) |

```js
// ❌ El nombre lo controla el usuario
toast.innerHTML = `<strong>${nombre}</strong> guardado`;

// ✅ Nodos y texto
const strong = document.createElement('strong');
strong.textContent = nombre;
toast.replaceChildren(strong, ' guardado');
```

- **Blade:** `{{ $x }}` escapa; `{!! $x !!}` no. Cada `{!! !!}` es una decisión de seguridad que merece un comentario.
- **React:** escapa por defecto; `dangerouslySetInnerHTML` es la excepción y requiere sanitizar.
- **Cuando hay que renderizar HTML ajeno** (editor enriquecido, markdown): sanitizá con una librería probada y mantenida (por ejemplo DOMPurify) y con lista de permitidos; **no** escribas un sanitizador a mano con regex.
- **HTMX:** el HTML que devuelve el servidor se inserta tal cual; escapá en el servidor todo dato de usuario dentro de los fragmentos.

## 2. Content Security Policy (CSP)

Cabecera HTTP que limita de dónde puede cargar y ejecutar recursos la página; reduce el daño de un XSS que se escape.

- **Nonces:** MDN recomienda un valor aleatorio, distinto en cada respuesta, enviado en `script-src` y puesto en cada `<script nonce="…">` permitido. Nunca predecible; solo se inserta en tus propios scripts.
- **Hashes** para contenido estático; los scripts externos permitidos por hash necesitan `integrity` (ver SRI).
- Empezá en modo **`Content-Security-Policy-Report-Only`** para ver qué rompería antes de aplicarla.
- Evitá `'unsafe-inline'` y `'unsafe-eval'` en `script-src`: anulan buena parte de la protección.
- Los handlers inline (`onclick="…"`) chocan con una CSP estricta: usá `addEventListener`. Con Alpine u otros motores que evalúan expresiones, confirmá si existe una build compatible con CSP.

## 3. CSRF: toda mutación lleva prueba de origen

**El problema.** Otro sitio hace que el navegador del usuario envíe una petición con sus cookies de sesión.

- **Formularios Laravel:** `@csrf` agrega el campo `_token`.
- **Peticiones `fetch`/XHR/HTMX:** Laravel también acepta el token en el header `X-CSRF-TOKEN` (valor tomado de un `<meta name="csrf-token">`) o en `X-XSRF-TOKEN` (valor de la cookie `XSRF-TOKEN`). Las versiones recientes además contemplan la verificación por `Sec-Fetch-Site` **(verificar en tu versión)**.
- **HTMX:** el token se puede enviar en cada petición con el atributo `hx-headers` puesto en `<body>` (o un ancestro), p. ej. `<body hx-headers='{"X-CSRF-TOKEN": "{{ csrf_token() }}"}'>`; también existe el evento de configuración de petición (`htmx:configRequest` en htmx 2.x; el nombre cambia en versiones nuevas) **(verificar en tu versión)**.
- Las mutaciones nunca con `GET`. Cookies de sesión con `SameSite` (`Lax` o `Strict`) y `HttpOnly`.

## 4. Enlaces que abren otra pestaña

`target="_blank"` sin protección dejaba que la página abierta accediera a `window.opener`. MDN indica que los navegadores nuevos aplican implícitamente el equivalente a `rel="noopener"`, pero los viejos no: seguí poniendo `rel="noopener noreferrer"` en enlaces externos (`noreferrer` además oculta la cabecera `Referer`). Y avisá al usuario cuando un enlace abre una pestaña nueva (WCAG técnica G201).

## 5. Scripts y recursos de terceros

- Cada tag de analytics, chat, A/B testing o widget corre con los mismos privilegios que tu código: puede leer formularios, cookies no `HttpOnly` y el DOM.
- **Subresource Integrity (SRI):** atributo `integrity="sha384-…"` con el hash del archivo; el navegador verifica antes de ejecutar. Requiere CORS: poné `crossorigin="anonymous"`.
  ```html
  <script src="https://cdn.ejemplo.com/lib.min.js"
          integrity="sha384-BASE64DEL-HASH"
          crossorigin="anonymous"></script>
  ```
- Fijá la **versión exacta** del recurso (no `latest`); un hash no sirve si el archivo cambia.
- **Self-hosting** de librerías y fuentes: mejor rendimiento (una conexión menos), control de versión y privacidad (no enviás la IP del usuario a un tercero).
- Cargalos `defer` o después de `load`, y revisá periódicamente cuáles siguen aportando valor.

## 6. Secretos y datos sensibles

- **Nada secreto en el bundle**: claves de API privadas, tokens de servicio, credenciales. Variables `VITE_*`, `NEXT_PUBLIC_*` o similares quedan **públicas** por diseño. Las llamadas con secretos pasan por tu backend.
- No guardes tokens de sesión ni datos personales en `localStorage`/`sessionStorage` si un XSS podría leerlos: preferí cookies `HttpOnly`. Es válido guardar preferencias de UI no sensibles.
- **No pongas datos personales en la URL** (query string): quedan en historial, logs y cabecera `Referer`.
- **Errores:** no muestres trazas, rutas internas ni mensajes del servidor al usuario.

## 7. Cookies, consentimiento y autocompletado

- **Consentimiento:** las cookies y almacenamiento no esenciales (analítica, publicidad) requieren consentimiento previo en muchas jurisdicciones (RGPD/ePrivacy en la UE; leyes de protección de datos en otros países). El banner debe permitir **rechazar con la misma facilidad que aceptar**, preseleccionar solo lo esencial y no empujar el layout (CLS). Consultá la normativa aplicable al público objetivo: esto es criterio técnico, no asesoría legal.
- **Cookies:** `Secure` (solo HTTPS), `HttpOnly` (inaccesible desde JS), `SameSite`.
- **`autocomplete` en campos sensibles:** usá los tokens correctos (`current-password`, `new-password`, `one-time-code`, `email`, `username`) para que los gestores de contraseñas funcionen (WCAG 1.3.5 y 3.3.8). Para campos que **no** deben guardarse (códigos de un solo uso, datos que no son del usuario) existe `autocomplete="off"`, pero **no** lo uses en login: bloquea gestores de contraseñas.
- **Pegar:** nunca bloquees pegar en contraseña o códigos (WCAG 3.3.8).

## 8. Checklist

- [ ] Ningún dato no confiable llega a `innerHTML`, `{!! !!}` o `dangerouslySetInnerHTML` sin sanitizar.
- [ ] Toda mutación (formulario, `fetch`, HTMX) envía token CSRF; sin mutaciones por `GET`.
- [ ] Enlaces `target="_blank"` externos con `rel="noopener noreferrer"`.
- [ ] Scripts de terceros: justificados, con versión fija y SRI cuando sea posible.
- [ ] CSP definida (al menos en `Report-Only`) sin `'unsafe-inline'` de scripts.
- [ ] Sin secretos en el bundle ni datos personales en URLs.
- [ ] Cookies con `Secure`, `HttpOnly` y `SameSite`.
- [ ] Banner de consentimiento con opción de rechazar equivalente a aceptar.
- [ ] Campos de login con `autocomplete` correcto y pegado permitido.

Para auditar estos puntos en código concreto, la skill `frontend-dls` tiene el auditor estático (`audit-frontend.js`).
