# Imágenes de jugadores

Las fotos de cara se descargan de FBref y se alojan en Cloudinary.
Este proceso solo hay que repetirlo cuando se añadan jugadores nuevos a la DB.

---

## Requisitos previos

- R instalado (`C:\Program Files\R\R-4.5.3\bin\Rscript.exe`)
- Paquetes R: `dplyr`, `stringr`, `stringdist`
- Node.js con paquete `cloudinary` instalado (`npm install cloudinary`)
- Credenciales de Cloudinary en `.env` (ver sección de variables)

### Instalar paquetes R (solo la primera vez)
```powershell
& "C:\Program Files\R\R-4.5.3\bin\Rscript.exe" -e "install.packages(c('dplyr', 'stringr', 'stringdist'), repos='https://cran.rstudio.com/')"
```

---

## Paso 1 — Exportar jugadores de la DB

Ejecutar en Railway (o cliente MySQL):
```sql
SELECT idJugador, Nombre FROM Jugador
```
Guardar como `r-scripts/jugadores_db.csv`.

---

## Paso 2 — Descargar fotos de FBref

Desde la raíz del proyecto:
```powershell
cd r-scripts
& "C:\Program Files\R\R-4.5.3\bin\Rscript.exe" descargarImagenes.r ../data/partidos2223AdvanceSummaryExcelFull2.csv jugadores_db.csv ../public/images/jugadores
```

El script:
- Extrae el ID de FBref de la columna `Player_Href` del CSV de estadísticas
- Cruza con los jugadores de la DB por nombre (exacto + fuzzy Jaro-Winkler)
- Descarga cada foto como `{idJugador}.jpg` en `public/images/jugadores/`
- Salta las que ya existen

---

## Paso 3 — Subir a Cloudinary

Desde la raíz del proyecto:
```bash
node --env-file=.env scripts/subirImagenesCloudinary.mjs
```

Las imágenes se suben a la carpeta `estadio-fantasy/jugadores/` en Cloudinary
con `public_id` = `idJugador`. No sobreescribe las que ya existen.

---

## Variables de entorno necesarias

En `.env` (local) y en Railway (solo `NEXT_PUBLIC_`):

```env
CLOUDINARY_CLOUD_NAME=diwnmaiuq
CLOUDINARY_API_KEY=655512688864869
CLOUDINARY_API_SECRET=zOggv64UneAc5o0WomofI4uVsKA
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diwnmaiuq
```

> `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` solo se necesitan para subir imágenes (local).
> En Railway solo hace falta `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

---

## URL de las imágenes

```
https://res.cloudinary.com/diwnmaiuq/image/upload/estadio-fantasy/jugadores/{idJugador}.jpg
```

El componente `AlbumPlayerCard` construye esta URL automáticamente si
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` está definida. Si no, usa el fallback local
`/images/jugadores/{idJugador}.jpg`.
