# OG Stories — Generador de imágenes 1080×1920 (ultra pro edition)

Proyecto Next.js 14 (App Router) que genera imágenes dinámicas tamaño historia de Instagram (**1080×1920**) usando [`@vercel/og`](https://vercel.com/docs/functions/og-image-generation) sobre el **Edge Runtime**.

## Features

- ✅ **3 layouts** intercambiables: `center` · `split` · `minimal`
- ✅ **Twemoji** para emojis a color (no los cuadrados monocromos del default)
- ✅ **Inter** cargado dinámicamente desde Google Fonts (cacheado a nivel módulo)
- ✅ **Auto-fit del título y subtítulo** según largo (no se desborda nunca)
- ✅ **Auto-contraste** del texto si no se pasa `color` (luminancia WCAG)
- ✅ **Soporte de SVG inline** (base64) y URL de imagen remota con fallback al emoji
- ✅ **Watermark / marca** opcional
- ✅ **Cache-Control** de un año + SWR — Vercel CDN cachea por params idénticos
- ✅ **Endpoint dual GET + POST** (POST para SVGs/payloads que no entran en URL)
- ✅ **Firma HMAC opcional** (`OG_SIGNING_SECRET`) para uso público sin abuso
- ✅ **Rate limit opcional** vía Upstash Redis (REST) en el middleware
- ✅ **Tests con vitest** (helpers puros: color, typography, validators, sign)
- ✅ **OG metadata** del propio sitio servida por el endpoint (eats own dog food)

## Correr local

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. Endpoint en `/api/og`.

```bash
npm test            # corre los tests una vez
npm run test:watch  # watch mode
```

## Desplegar a Vercel

```bash
npx vercel
# o producción:
npx vercel --prod
```

Sin configuración extra. Variables de entorno opcionales (todas):

| Var                       | Descripción                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | URL absoluta del sitio (para `metadataBase` y OG tags)                       |
| `OG_SIGNING_SECRET`       | Si está, cualquier request cross-origin a `/api/og` requiere `?sig=...`      |
| `UPSTASH_REDIS_REST_URL`  | Activa rate limit en el middleware (junto con el token)                      |
| `UPSTASH_REDIS_REST_TOKEN`| Token para Upstash Redis REST                                                |
| `OG_RATE_LIMIT`           | Requests por ventana (default `60`)                                          |
| `OG_RATE_WINDOW`          | Ventana en segundos (default `60`)                                           |

## Endpoint `/api/og`

Métodos:

- `GET /api/og?titulo=...&...`
- `POST /api/og` con JSON body `{ titulo, subtitulo, ... }` (usá esto para SVGs grandes)

### Parámetros

| Param       | Tipo               | Default                                            |
| ----------- | ------------------ | -------------------------------------------------- |
| `titulo`    | string (≤200)      | `Tu título acá`                                    |
| `subtitulo` | string (≤280)      | `Un subtítulo corto…`                              |
| `emoji`     | string (≤8)        | `✨`                                               |
| `imagen`    | URL `http(s)://`   | (none — reemplaza al `emoji` si fetch ok)          |
| `svg`       | base64 de un SVG   | (none — gana sobre `imagen` y `emoji`)             |
| `bg`        | hex sin `#` (3/6)  | `1a1a2e`                                           |
| `color`     | hex sin `#` (3/6)  | autocontraste según `bg`                           |
| `marca`     | string (≤40)       | (none)                                             |
| `layout`    | `center`/`split`/`minimal` | `center`                                   |
| `sig`       | hex HMAC-SHA256    | requerido sólo si `OG_SIGNING_SECRET` está activo  |

Prioridad del hero: **`svg` > `imagen` > `emoji`**.
Si `imagen` falla (timeout, 404, content-type no es `image/*`) cae al `emoji` automáticamente.

### Ejemplos

```
/api/og?titulo=Lanzamos%20hoy&subtitulo=Probalo%20gratis&emoji=🚀&bg=0f172a
```

```
/api/og?titulo=Black%20Friday&subtitulo=Hasta%2050%25%20OFF&emoji=🛍️&bg=ff003c&layout=split
```

```
/api/og?titulo=Charla%20técnica&subtitulo=Jueves%2019hs&emoji=🎤&bg=1e1b4b&layout=minimal&marca=@yo
```

```
/api/og?titulo=Buen%20finde&emoji=🌴&bg=fef3c7
# (color del texto se elige solo: oscuro porque el bg es claro)
```

```
/api/og?titulo=Nuevo%20producto&imagen=https://images.unsplash.com/photo-1542291026-7eec264c27ff&bg=0f172a
```

## SVG inline

Satori (el motor de `@vercel/og`) **sólo renderiza SVG cuando viene como data URI**. URLs remotas a `.svg` en `imagen` no funcionan.

- El param `svg` espera el markup completo encodeado en base64 (estándar o url-safe).
- En el server se valida que decodee a algo que arranque con `<svg`, y se inyecta como `data:image/svg+xml;base64,…` en un `<img>` 520×520.
- Tamaño práctico recomendado: **≤ 8 KB** de SVG crudo (Vercel acepta URLs hasta ~16 KB).
- Para SVGs más grandes, usá `POST`:

```bash
curl -X POST https://tu-app.vercel.app/api/og \
  -H 'Content-Type: application/json' \
  -d '{
    "titulo": "Hola",
    "subtitulo": "SVG arbitrariamente grande",
    "svg": "PHN2ZyB...base64..."
  }' --output story.png
```

Soporte de Satori para features SVG: paths, rect, circle, polygon, gradientes lineales/radiales, `<defs>`, `<g>`. Filters, masks y `<foreignObject>` no soportados o inconsistentes.

## Firma HMAC (uso público sin abuso)

Si exponés el endpoint a terceros y querés evitar que cualquiera te use el servicio gratis:

```bash
# .env.local o env vars en Vercel
OG_SIGNING_SECRET=algo-largo-y-secreto
```

Con esto activo:

- **Requests same-origin** (la landing del sitio, donde `Referer` matchea el host) **siguen funcionando sin firma**.
- **Requests externos** deben incluir `?sig=<hmac>` o reciben `401`.

Generación del sig (server-side):

```ts
import { signParams } from "@/lib/og/sign";

const params = new URLSearchParams({ titulo: "Hola", bg: "0f172a" });
const sig = await signParams(params, process.env.OG_SIGNING_SECRET!);
const url = `https://tu-app.vercel.app/api/og?${params}&sig=${sig}`;
```

La firma cubre los params `titulo, subtitulo, emoji, imagen, svg, bg, color, marca, layout` ordenados alfabéticamente. Params extra (ej. `utm_*`) son ignorados.

## Rate limit

Opt-in. Si `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` están seteados, el middleware aplica un sliding window por IP (default 60 req / 60 s). Headers de respuesta:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `Retry-After` (sólo cuando se devuelve `429`)

## Edge bundle (1 MB)

El Edge Runtime de Vercel impone ~1 MB para el bundle. Notas:

- **Inter** se descarga en runtime desde Google Fonts y se cachea a nivel módulo (la primera invocación post-cold-start agrega ~100ms).
- **Twemoji** lo resuelve `@vercel/og` por su cuenta a un CDN — sin costo de bundle.
- No hay assets binarios embebidos. El bundle queda muy holgado bajo el límite.
- Si reemplazás Inter por una fuente local (`.ttf` en `public/`), tené en cuenta que cada KB cuenta.

## Estructura

```
app/
  api/og/route.tsx        # GET + POST. Orquesta validación, fetch, firma, render
  layout.tsx              # OG metadata + html/body
  page.tsx                # Landing con form, preview, copy, download
lib/og/
  color.ts                # parseHex, darken, withAlpha, luminance, pickContrast
  typography.ts           # fitTitle, fitSubtitle, clampStyle
  validators.ts           # sanitize hex/svg/url/layout, safeFetchImage
  fonts.ts                # loadGoogleFont con cache módulo + UA legacy
  sign.ts                 # HMAC-SHA256 con Web Crypto, isSameOrigin
  layouts.tsx             # LayoutCenter, LayoutSplit, LayoutMinimal, HeroBlock, Marca
middleware.ts             # Rate limit opt-in (Upstash REST)
tests/helpers.test.ts     # Unit tests con vitest
vitest.config.ts
next.config.js
package.json
tsconfig.json
```

## Stack

- Next.js 14 (App Router) + TypeScript
- `@vercel/og` (Satori + Resvg en Edge)
- Inter (Google Fonts, runtime)
- Twemoji (vía `@vercel/og`)
- Upstash Redis REST (opcional)
- Vitest
