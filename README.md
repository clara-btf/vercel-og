# OG Stories — Generador de imágenes 1080×1920

Proyecto mínimo de **Next.js 14 (App Router)** que genera imágenes dinámicas tamaño historia de Instagram (**1080×1920**) usando [`@vercel/og`](https://vercel.com/docs/functions/og-image-generation) sobre el **Edge Runtime**.

## Correr local

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000> para usar el formulario con vista previa en vivo, copiar la URL generada y descargar la imagen como PNG.

El endpoint queda en <http://localhost:3000/api/og>.

## Desplegar a Vercel

Con un solo comando, desde la raíz del proyecto:

```bash
npx vercel
```

Seguí los prompts (link/create project, scope, etc.). Vercel detecta automáticamente que es Next.js, no necesita configuración extra. Para producción:

```bash
npx vercel --prod
```

## Endpoint `/api/og`

Todos los parámetros son opcionales y tienen defaults sensatos.

| Param       | Tipo               | Default                                                 |
| ----------- | ------------------ | ------------------------------------------------------- |
| `titulo`    | string (≤140)      | `Tu título acá`                                         |
| `subtitulo` | string (≤220)      | `Un subtítulo corto que acompaña la idea principal`     |
| `emoji`     | string (≤8)        | `✨`                                                    |
| `imagen`    | URL `http(s)://`   | (none — si está, reemplaza al `emoji`)                  |
| `bg`        | hex sin `#` (3/6)  | `1a1a2e`                                                |
| `color`     | hex sin `#` (3/6)  | `ffffff`                                                |

### Ejemplos

```
/api/og?titulo=Lanzamos%20hoy&subtitulo=Probalo%20gratis&emoji=🚀&bg=0f172a&color=f8fafc
```

```
/api/og?titulo=Black%20Friday&subtitulo=Hasta%2050%25%20OFF&emoji=🛍️&bg=ff003c&color=fff8e7
```

```
/api/og?titulo=Charla%20técnica&subtitulo=Jueves%2019hs%20—%20Online&emoji=🎤&bg=1e1b4b&color=e0e7ff
```

```
/api/og?titulo=Buen%20finde&emoji=🌴&bg=fef3c7&color=78350f
```

```
/api/og?titulo=Nuevo%20producto&subtitulo=Disponible%20ahora&imagen=https://images.unsplash.com/photo-1542291026-7eec264c27ff&bg=0f172a&color=f8fafc
```

### Sobre `imagen`

- Tiene que ser una URL `http(s)://` accesible públicamente (el Edge Runtime hace fetch del lado del servidor).
- Formatos soportados por Satori/Resvg: PNG, JPEG, GIF estático, WebP.
- Si está presente, reemplaza al `emoji` como hero (cuadrado redondeado de 520×520 con `object-fit: cover`).
- Si la URL falla, devuelve mal el contenido o no es una imagen válida, la generación de la imagen falla con error 500. Asegurate que la URL esté viva y devuelva el `Content-Type` correcto.

## Nota sobre el límite del Edge Runtime

El Edge Runtime de Vercel impone un **límite de ~1 MB** para el bundle de la función (código + assets como fuentes). Esto importa si en algún momento querés:

- Cargar fuentes custom (`.ttf` / `.woff`) — pesan rápido. Subset las fuentes a sólo los caracteres que necesitás.
- Importar imágenes de fondo embebidas como base64 — se comen el presupuesto enseguida.
- Agregar muchas dependencias en la ruta del Edge.

Si te pasás del límite, Vercel falla el deploy. Mantené el endpoint magro: este proyecto usa fuentes del sistema (provistas por Satori internamente) y no embebe assets.

## Stack

- Next.js 14 (App Router)
- TypeScript
- `@vercel/og` (Satori + Resvg corriendo en Edge)

## Estructura

```
app/
  api/og/route.tsx   # Endpoint que devuelve la imagen
  layout.tsx         # Layout raíz
  page.tsx           # Landing con form, preview, copiar URL, descargar PNG
next.config.js
package.json
tsconfig.json
```
