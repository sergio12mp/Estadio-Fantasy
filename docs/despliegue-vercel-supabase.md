# Guía de Despliegue — Vercel + Base de datos en la nube

> **Proyecto:** Estadio Fantasy · Next.js 14 · TypeScript
> **Fecha:** Marzo 2026

---

## Índice

1. [Antes de empezar — lectura obligatoria](#1-antes-de-empezar--lectura-obligatoria)
2. [Opción A — Railway (MySQL, sin cambios en el código)](#2-opción-a--railway-mysql-sin-cambios-en-el-código)
3. [Opción B — Supabase (PostgreSQL, requiere migración)](#3-opción-b--supabase-postgresql-requiere-migración)
4. [Despliegue en Vercel](#4-despliegue-en-vercel)
5. [Configurar Google OAuth para producción](#5-configurar-google-oauth-para-producción)
6. [Variables de entorno completas](#6-variables-de-entorno-completas)
7. [Verificación post-despliegue](#7-verificación-post-despliegue)
8. [Problemas frecuentes](#8-problemas-frecuentes)

---

## 1. Antes de empezar — lectura obligatoria

### Compatibilidad de bases de datos

| Característica        | Este proyecto          | Supabase          | Railway           |
|-----------------------|------------------------|-------------------|-------------------|
| Motor de BD           | **MySQL** (mysql2)     | PostgreSQL        | **MySQL** ✅      |
| Driver en `src/lib/mysql.ts` | `mysql2/promise` | necesita `pg`  | `mysql2/promise` ✅ |
| Sintaxis SQL          | MySQL (backticks, etc.)| PostgreSQL        | MySQL ✅          |
| Cambios en el código  | —                      | **Sí, requiere**  | **No, cero**      |

**Conclusión:** Si quieres el despliegue más rápido y sin tocar código, usa **Railway (Opción A)**. Si tienes preferencia por Supabase, usa **Opción B** y sigue los pasos de migración del driver.

---

## 2. Opción A — Railway (MySQL, sin cambios en el código)

Railway ofrece MySQL gestionado con una capa gratuita suficiente para un TFG.

### 2.1 Crear el proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub.
2. Haz clic en **New Project → Provision MySQL**.
3. Railway crea la instancia en segundos. En el panel del servicio ve a la pestaña **Connect** y copia las variables:
   ```
   MYSQLHOST
   MYSQLUSER
   MYSQLPASSWORD
   MYSQLDATABASE
   MYSQLPORT
   ```

### 2.2 Inicializar la base de datos

Railway proporciona una URL de conexión externa que puedes usar desde tu equipo local con cualquier cliente MySQL.

**Con MySQL Workbench:**
1. Nueva conexión → Tipo: Standard TCP/IP.
2. Rellena con los valores de Railway (host, puerto, usuario, contraseña).
3. Conecta y abre una nueva pestaña SQL.

**Con la terminal (si tienes el cliente MySQL instalado):**
```bash
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE>
```

**Ejecutar el esquema completo:**
```bash
# Desde la raíz del proyecto
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/generarDB2.sql
```

Si el archivo ya incluye `CREATE SCHEMA` y `USE mydb`, puede que necesites quitar o adaptar esas líneas porque Railway ya te da la base de datos creada. En ese caso lanza sólo las sentencias `CREATE TABLE`:

```bash
# Alternativa: importa sección por sección desde Workbench
# O edita temporalmente generarDB2.sql quitando las líneas:
#   CREATE SCHEMA IF NOT EXISTS `mydb`...
#   USE `mydb`;
```

**Ejecutar las migraciones en orden:**
```bash
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/001_add_manager_columns.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/002_scoring_columns.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/003_club_leagues.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/004_cartajugador_autoincrement.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/005_fix_schema_sobres.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/006_objetos_redesign.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/007_add_config_table.sql
mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DATABASE> < data/migrations/008_goalkeeper_stats.sql
```

> **Nota:** Si usas `generarDB2.sql` desde cero ya incluye todas las columnas hasta la migración 008. Las migraciones sólo son necesarias si ya tienes datos en una BD previa.

### 2.3 Actualizar `src/lib/mysql.ts`

Cambia la conexión para leer las variables de entorno (no valores hardcodeados):

```typescript
// src/lib/mysql.ts
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host:     process.env.MYSQL_HOST!,
  user:     process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  port:     parseInt(process.env.MYSQL_PORT ?? "3306"),
  database: process.env.MYSQL_DB!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }, // Railway requiere SSL
});
```

### 2.4 Variables de entorno para Railway

En Vercel (ver sección 4) añade estas variables usando los valores de Railway:

```
MYSQL_HOST     = <MYSQLHOST de Railway>
MYSQL_USER     = <MYSQLUSER de Railway>
MYSQL_PASSWORD = <MYSQLPASSWORD de Railway>
MYSQL_DB       = <MYSQLDATABASE de Railway>
MYSQL_PORT     = <MYSQLPORT de Railway>
```

---

## 3. Opción B — Supabase (PostgreSQL, requiere migración)

Supabase es una plataforma PostgreSQL. Usarla requiere cambiar el driver de BD del proyecto de `mysql2` a `pg`.

### 3.1 Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión con GitHub.
2. **New project** → elige un nombre (ej. `estadio-fantasy`) y una contraseña fuerte para la BD. Guárdala ahora.
3. Selecciona la región más cercana (ej. `West EU`).
4. Espera ~2 minutos a que el proyecto se aprovisione.
5. Ve a **Project Settings → Database** y copia la **Connection string** (modo `Transaction` para Vercel Serverless):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```

### 3.2 Inicializar el esquema en Supabase

Supabase tiene un editor SQL integrado en el panel. Sin embargo, el esquema actual usa sintaxis MySQL. Necesitas convertirlo a PostgreSQL.

**Diferencias principales MySQL → PostgreSQL:**

| MySQL                          | PostgreSQL equivalente          |
|--------------------------------|---------------------------------|
| `` `nombre_columna` ``         | `"nombre_columna"` o sin comillas |
| `INT AUTO_INCREMENT`           | `SERIAL` o `INT GENERATED ALWAYS AS IDENTITY` |
| `TINYINT(1)`                   | `BOOLEAN` o `SMALLINT`         |
| `ENGINE = InnoDB`              | Se elimina (no existe en PG)   |
| `CREATE SCHEMA IF NOT EXISTS`  | `CREATE SCHEMA IF NOT EXISTS` (igual) |
| `USE mydb`                     | No existe; las tablas van en schema `public` |
| `FLOAT`                        | `REAL` o `DOUBLE PRECISION`    |

**Pasos para importar el esquema:**
1. En el panel de Supabase ve a **SQL Editor → New query**.
2. Pega y adapta el contenido de `data/generarDB2.sql` con las conversiones anteriores.
3. Ejecuta. Si hay errores de sintaxis, corrígelos uno a uno.

**Alternativa rápida con pgloader (desde terminal):**
```bash
# Instala pgloader (Linux/Mac)
sudo apt install pgloader  # o brew install pgloader

# Convierte y carga desde tu MySQL local a Supabase
pgloader mysql://root:root@localhost/mydb \
          postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

### 3.3 Cambiar el driver de BD en el proyecto

**Instalar el driver de PostgreSQL:**
```bash
npm install pg
npm install --save-dev @types/pg
npm uninstall mysql2 serverless-mysql mysql
```

**Reemplazar `src/lib/mysql.ts`:**
```typescript
// src/lib/mysql.ts — versión PostgreSQL
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // requerido por Supabase
  max: 10,
});

// Wrapper para mantener la misma API de llamadas en el resto del código
export const db = {
  async query(sql: string, params?: any[]) {
    // mysql2 devuelve [rows, fields]; pg devuelve { rows }
    // Convertimos a [rows] para no cambiar el resto del código
    const result = await pool.query(sql, params);
    return [result.rows, result.fields];
  },
};
```

> **Importante:** Las queries en el resto del proyecto usan `?` como placeholder (estilo MySQL). PostgreSQL usa `$1, $2, $3, ...`. Tendrás que hacer un find & replace global en todos los archivos de `src/app/api/`. Esto es el mayor esfuerzo de la migración.

**Script de conversión automática de placeholders (bash):**
```bash
# Convierte todos los ? de las queries a $1,$2,... dentro de los archivos .ts de api
# ATENCIÓN: revisa manualmente después, algunos ? pueden estar en strings literales
find src/app/api -name "*.ts" -exec sed -i 's/?/$1/g' {} \;
```

> Ese script es aproximado. Cada query con múltiples `?` requiere reemplazarlos manualmente con `$1, $2, $3...` en orden. Evalúa si el esfuerzo compensa frente a usar Railway (Opción A).

### 3.4 Variable de entorno para Supabase

```
DATABASE_URL = postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

---

## 4. Despliegue en Vercel

### 4.1 Preparar el repositorio

Asegúrate de que:
- `.env` **NO** está en el repositorio (añádelo a `.gitignore` si no lo está).
- El código está commiteado y pusheado a GitHub.

```bash
# Verificar que .env está ignorado
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env is gitignored"
git push origin main
```

### 4.2 Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **Add New → Project**.
3. Selecciona el repositorio `Estadio-Fantasy`.
4. Vercel detecta automáticamente que es un proyecto Next.js.
5. **No pulses Deploy todavía** — primero configura las variables de entorno.

### 4.3 Configurar variables de entorno en Vercel

En la sección **Environment Variables** del proyecto (antes de desplegar):

| Variable               | Valor                                      |
|------------------------|--------------------------------------------|
| `NEXTAUTH_URL`         | `https://tu-proyecto.vercel.app`           |
| `NEXTAUTH_SECRET`      | Un string aleatorio seguro (ver abajo)     |
| `GOOGLE_CLIENT_ID`     | ID de tu OAuth App de Google               |
| `GOOGLE_CLIENT_SECRET` | Secret de tu OAuth App de Google           |
| `MYSQL_HOST`           | Host de Railway (Opción A)                 |
| `MYSQL_USER`           | Usuario de Railway                         |
| `MYSQL_PASSWORD`       | Contraseña de Railway                      |
| `MYSQL_DB`             | Nombre de la BD en Railway                 |
| `MYSQL_PORT`           | Puerto de Railway (normalmente 3306)       |
| `DATABASE_URL`         | String de Supabase (solo Opción B)         |

**Generar un NEXTAUTH_SECRET seguro:**
```bash
# En terminal (Linux/Mac/WSL)
openssl rand -base64 32

# O en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4.4 Primer despliegue

1. Haz clic en **Deploy**.
2. Vercel clona el repo, ejecuta `npm run build` y despliega.
3. El build tarda entre 1-3 minutos.
4. Si el build falla, revisa los logs en la pestaña **Deployments → Build Logs**.

### 4.5 Errores de build frecuentes

**Error: Cannot find module 'mysql2'**
```
# El módulo debe estar en dependencies, no en devDependencies
npm install mysql2 --save
```

**Error: TypeScript type errors**
```bash
# Comprueba localmente antes de pushear
npx tsc --noEmit --skipLibCheck
```

**Error: `NEXTAUTH_URL` no definida en build**
- Asegúrate de haber añadido `NEXTAUTH_URL` en las variables de entorno de Vercel antes del deploy.

---

## 5. Configurar Google OAuth para producción

Las credenciales de Google OAuth tienen una lista de dominios autorizados. En producción debes añadir el dominio de Vercel.

### 5.1 Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com).
2. Selecciona el proyecto que tiene las credenciales OAuth.
3. Ve a **APIs y servicios → Credenciales → OAuth 2.0 Client IDs**.
4. Haz clic en el client ID que usa la aplicación.
5. En **URIs de redireccionamiento autorizados**, añade:
   ```
   https://tu-proyecto.vercel.app/api/auth/callback/google
   ```
6. En **Orígenes de JavaScript autorizados**, añade:
   ```
   https://tu-proyecto.vercel.app
   ```
7. Guarda los cambios.

### 5.2 Verificar la configuración

Una vez desplegado, intenta hacer login con Google. Si aparece el error `redirect_uri_mismatch`, revisa que la URI de redirección en Google Cloud coincide exactamente con la URL de Vercel (incluyendo el protocolo `https://`).

---

## 6. Variables de entorno completas

### Para Opción A (Railway + MySQL)

```env
# NextAuth
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=<string_aleatorio_32_chars>

# Base de datos Railway (MySQL)
MYSQL_HOST=<host.railway.app>
MYSQL_USER=root
MYSQL_PASSWORD=<password_railway>
MYSQL_DB=railway
MYSQL_PORT=3306

# Google OAuth
GOOGLE_CLIENT_ID=<tu_client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu_client_secret>
```

### Para Opción B (Supabase + PostgreSQL)

```env
# NextAuth
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=<string_aleatorio_32_chars>

# Base de datos Supabase (PostgreSQL)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# Google OAuth
GOOGLE_CLIENT_ID=<tu_client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu_client_secret>
```

---

## 7. Verificación post-despliegue

Una vez desplegado, comprueba en orden:

### 7.1 Conectividad con la BD

Accede a `https://tu-proyecto.vercel.app/api/equipo` en el navegador. Deberías ver un JSON con los equipos. Si ves un error 500, revisa los logs de Vercel (Dashboard → tu proyecto → Deployments → Functions).

### 7.2 Autenticación

1. Ve a la página principal → pulsa "Iniciar sesión con Google".
2. Completa el flujo OAuth.
3. Verifica en el panel de la BD que se ha creado un registro en la tabla `Manager`.

### 7.3 Funcionalidades clave

- `/home` — dashboard del manager (requiere sesión).
- `/sobres` — apertura de sobres.
- `/mi-equipo` — gestión de plantilla.
- `/ligas` — ligas y clasificación.
- `/admin` — panel de administración (requiere `esAdmin = 1` en la BD).

### 7.4 Marcar el primer usuario como admin

Tras registrarte, ejecuta en la BD:
```sql
UPDATE Manager SET esAdmin = 1 WHERE Email = 'tu_email@gmail.com';
```

---

## 8. Problemas frecuentes

### `ECONNREFUSED` o `ETIMEDOUT` al conectar con la BD

- Vercel corre en servidores de AWS. Verifica que la BD permite conexiones desde IPs externas (Railway y Supabase lo permiten por defecto).
- Comprueba que `MYSQL_HOST`, `MYSQL_PASSWORD` y `MYSQL_PORT` están bien escritos en las variables de entorno de Vercel.

### `Too many connections`

El pool de mysql2 con `connectionLimit: 10` puede saturar el plan gratuito de Railway. Reduce a `connectionLimit: 3` en `src/lib/mysql.ts` para el plan gratuito.

### Login con Google redirige a `localhost:3000`

`NEXTAUTH_URL` está mal configurado. En Vercel debe ser `https://tu-proyecto.vercel.app`, sin barra final.

### Build falla con `Module not found: r-integration`

Las dependencias `r-integration`, `r-script` y `rscript` son para el script R local y no son compatibles con el entorno serverless de Vercel. Verifica que ningún archivo importado en el build las usa directamente. El endpoint `/api/procesarCSV` no las usa — sólo procesa el CSV ya generado.

### Error `SSL connection required` con Railway

Añade `ssl: { rejectUnauthorized: false }` al objeto de configuración del pool en `src/lib/mysql.ts` (ver sección 2.3).

---

## Resumen visual del flujo de despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                     MÁQUINA LOCAL                           │
│                                                             │
│  1. git push → GitHub repo                                  │
│  2. Genera NEXTAUTH_SECRET (openssl rand -base64 32)        │
│  3. Importa generarDB2.sql → BD cloud (Railway/Supabase)    │
│  4. Importa migraciones 001..008 → BD cloud                 │
└────────────────────────┬────────────────────────────────────┘
                         │
           ┌─────────────▼─────────────┐
           │         VERCEL            │
           │                           │
           │  Conecta repo GitHub      │
           │  Añade variables .env     │
           │  Despliega (npm build)    │
           │  URL: *.vercel.app        │
           └─────────────┬─────────────┘
                         │
     ┌───────────────────┼─────────────────────┐
     │                   │                     │
┌────▼────┐        ┌─────▼─────┐        ┌──────▼──────┐
│ Railway │        │ Supabase  │        │  Google     │
│ (MySQL) │        │(PostgreSQL│        │  OAuth      │
│ Opción A│        │) Opción B │        │  Consola    │
└─────────┘        └───────────┘        └─────────────┘
```
