# Estadio Fantasy — Documentación Técnica

> Trabajo de Fin de Grado — Aplicación web de Fantasy Football
> Tecnología: Next.js 14 · TypeScript · MySQL · NextAuth · Tailwind CSS

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Tecnologías utilizadas](#3-tecnologías-utilizadas)
4. [Estructura de la base de datos](#4-estructura-de-la-base-de-datos)
5. [Estructura del proyecto](#5-estructura-del-proyecto)
6. [Módulos y funcionalidades](#6-módulos-y-funcionalidades)
7. [API REST — Referencia de endpoints](#7-api-rest--referencia-de-endpoints)
8. [Sistema de puntuación](#8-sistema-de-puntuación)
9. [Sistema de sobres y rareza](#9-sistema-de-sobres-y-rareza)
10. [Autenticación y roles](#10-autenticación-y-roles)
11. [Instalación y despliegue](#11-instalación-y-despliegue)
12. [Variables de entorno](#12-variables-de-entorno)
13. [Pipeline de datos (scraping)](#13-pipeline-de-datos-scraping)
14. [Migraciones de base de datos](#14-migraciones-de-base-de-datos)

---

## 1. Descripción del proyecto

**Estadio Fantasy** es una aplicación web de tipo *fantasy football* en la que los usuarios actúan como managers de un equipo virtual. El objetivo del juego es construir una plantilla de jugadores reales a través de un sistema de sobres (cartas coleccionables), equipar objetos con efectos especiales, y acumular puntos en función del rendimiento real de esos jugadores en los partidos de La Liga española.

### Flujo principal del juego

```
Registro / Login  →  Obtención de cartas (sobres / tienda)  →  Selección de plantilla  →  Jornada de liga  →  Cálculo de puntos  →  Clasificación
```

1. El usuario se registra con Google OAuth y recibe moneda inicial (oro y balones).
2. Usa esa moneda para abrir sobres o comprar cartas directamente en la tienda.
3. Selecciona una alineación de hasta 11 jugadores y equipa objetos a cada carta.
4. Tras cada jornada real, el sistema calcula los puntos de cada jugador según sus estadísticas reales.
5. Los puntos se acumulan en ligas (general, privadas y de club) mostrando una clasificación.

---

## 2. Arquitectura del sistema

La aplicación sigue el patrón **full-stack monolítico** de Next.js, donde el frontend y el backend coexisten en el mismo repositorio:

```
┌─────────────────────────────────────────────────┐
│                  Cliente (browser)               │
│  React 18 + Tailwind CSS + Context API          │
└───────────────────┬─────────────────────────────┘
                    │  HTTP (fetch / SWR)
┌───────────────────▼─────────────────────────────┐
│             Next.js 14 App Router                │
│  ┌──────────────┐   ┌──────────────────────────┐│
│  │  Pages/UI    │   │  API Routes (Route.ts)   ││
│  │  /app/*      │   │  /app/api/*              ││
│  └──────────────┘   └──────────────┬───────────┘│
│                                    │             │
│  ┌─────────────────────────────────▼───────────┐│
│  │           NextAuth (JWT + Google OAuth)      ││
│  └──────────────────────────────────────────────┘│
└───────────────────┬─────────────────────────────┘
                    │  serverless-mysql
┌───────────────────▼─────────────────────────────┐
│                MySQL Database                    │
│  mydb (tablas: Manager, Jugador, Carta,          │
│  Plantilla, Estadisticas, Ligas, Objetos…)       │
└─────────────────────────────────────────────────┘
```

**Decisiones de diseño relevantes:**

- **App Router de Next.js 14**: todas las páginas son Server Components por defecto; las que necesitan interactividad llevan la directiva `"use client"`.
- **API Routes como backend**: cada endpoint es una función `GET`/`POST`/`PUT`/`DELETE` exportada desde un archivo `route.ts`. No hay servidor Express separado.
- **Conexión a base de datos**: se usa `serverless-mysql` para reutilizar conexiones de forma eficiente en entornos sin servidor.
- **Estado global**: un `AuthContext` (React Context API) mantiene los datos del manager (nombre, oro, balones, puntuación) accesibles en toda la aplicación sin necesidad de prop drilling.

---

## 3. Tecnologías utilizadas

| Categoría | Tecnología | Versión | Uso |
|-----------|-----------|---------|-----|
| Framework | Next.js | 14.2.3 | SSR, routing, API Routes |
| Lenguaje | TypeScript | ^5 | Tipado estático |
| UI | React | 18 | Componentes de interfaz |
| Estilos | Tailwind CSS | ^3.4 | Diseño responsive |
| Autenticación | NextAuth.js | ^4.24 | OAuth Google, JWT sessions |
| Base de datos | MySQL | 8+ | Persistencia de datos |
| Driver BD | serverless-mysql + mysql2 | ^1.5 / ^3.14 | Conexión eficiente a MySQL |
| Scraping | R + worldfootballR | — | Estadísticas reales de FBref |
| Parsing CSV | csv-parser | ^3.0 | Importación de estadísticas |
| HTTP client | fetch nativo | — | Llamadas a la API |

---

## 4. Estructura de la base de datos

El esquema completo se encuentra en [data/generarDB2.sql](data/generarDB2.sql).

### Diagrama de entidades principal

```
Equipo ──< Jugador >── Estadisticas >── Partido >── Jornada >── Temporada

Manager ──< CartaJugador >── Jugador
Manager ──< CartaObjeto  >── Objetos
Manager ──< Plantilla    >── PlantillaJugadorObjeto >── CartaJugador
                                                    >── CartaObjeto
Manager ──< Manager_Ligas >── Ligas
```

### Descripción de tablas

#### `Manager`
Almacena los datos del jugador (usuario) del juego.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `idManager` | INT PK | Identificador único |
| `Nombre` | VARCHAR(45) | Nombre de manager |
| `idGoogle` | VARCHAR(100) | ID de cuenta Google |
| `Email` | VARCHAR(100) | Correo electrónico |
| `esAdmin` | BOOLEAN | Rol administrador |
| `oro` | INT | Moneda principal |
| `balones` | INT | Moneda secundaria |
| `puntuacion_actual` | INT | Puntos acumulados totales |
| `pity` | INT | Contador de sobres sin legendaria (0–10) |

#### `Jugador`
Jugadores reales de la liga importados desde FBref.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `idJugador` | INT PK | Identificador único |
| `Nombre` | VARCHAR(45) | Nombre completo |
| `Edad` | VARCHAR(45) | Edad |
| `Pais` | VARCHAR(45) | Nacionalidad |
| `Posicion` | VARCHAR(45) | Posición (GK, CB, CM, ST…) |
| `Precio` | INT | Valor de mercado |
| `idEquipo` | INT FK | Equipo al que pertenece |

#### `Estadisticas`
Estadísticas reales de un jugador en un partido concreto. Incluye columnas generales y específicas de portero.

**Columnas generales:**
`Minutos`, `Goles`, `Asistencias`, `TarjetasAmarillas`, `TarjetasRojas`, `Disparos`, `DisparosPorteria`, `Toques`, `Entradas`, `Intercepciones`, `Bloqueos`, `PasesCompletados`, `PasesIntentados`, `PorcentajePasesCompletados`, `PasesProgresivos`, `Controles`, `ConduccionesProgresivas`, `EntradasOfensivas`, `EntradasConExito`, `GolesEsperados`, `GolesEsperadosSinPenaltis`, `AsistenciasEsperadas`, `AccionesCreadasDeTiro`, `AccionesCreadasDeGol`

**Columnas exclusivas de portero:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `Paradas` | INT | Paradas realizadas (Saves) |
| `GolesEncajados` | INT | Goles encajados (GA) |
| `PorteriaACero` | TINYINT | 1 si no encajó ningún gol (CS) |
| `PSxGPortero` | FLOAT | Post-Shot Expected Goals en contra |
| `PenaltisParados` | INT | Penaltis parados (PKsv) |

El campo `Puntos` se rellena automáticamente por el algoritmo de cálculo de jornada.

#### `CartaJugador` / `CartaObjeto`
Cartas que posee cada manager. Cada carta tiene una `Rareza` (Común / Rara / Épica / Legendaria) que determina sus slots para objetos y su apariencia visual.

#### `Plantilla`
Alineación del manager para una jornada concreta. Almacena la `Alineacion` (p.ej. "4-3-3") y los `Puntos` totales obtenidos.

#### `PlantillaJugadorObjeto`
Tabla puente que relaciona `Plantilla`, `CartaJugador` y `CartaObjeto`. La `posicion_en_plantilla` determina el slot en la formación.

#### `Ligas` / `Manager_Ligas`
`Ligas` define cada liga con un `tipo` (`general`, `privada`, `club`) y opcionalmente un `idEquipo` para ligas de club. `Manager_Ligas` almacena la `puntuacion_actual` del manager en esa liga específica.

#### `Objetos`
Catálogo de objetos del juego. Incluye objetos para todas las posiciones (delanteros, centrocampistas, defensas y porteros). Los objetos de portero actúan sobre `Intercepciones`, `Bloqueos` y `AccionesCreadasDeTiro`.

| Columna | Descripción |
|---------|-------------|
| `Nombre` | Nombre del objeto |
| `Rareza` | Comun / Rara / Epica / Legendaria |
| `Efecto` | `multiplicador` o `suma` |
| `ValorEfecto` | Factor multiplicador (ej: 1.30) o puntos planos |
| `Estadistica` | Columna de `Estadisticas` sobre la que actúa |

---

## 5. Estructura del proyecto

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Layout raíz (navbar, providers)
│   ├── page.tsx                # Página de inicio (/)
│   ├── login/                  # Página de login con Google
│   ├── home/                   # Dashboard principal del manager
│   ├── mi-equipo/              # Gestión de plantilla y alineación
│   ├── mi-perfil/              # Perfil del usuario
│   ├── sobres/                 # Apertura de sobres de cartas
│   ├── album/                  # Álbum de cartas + tienda
│   ├── ligas/                  # Vista de ligas y clasificaciones
│   ├── admin/                  # Panel de admin
│   └── api/                    # Endpoints del backend
│       ├── auth/[...nextauth]/ # NextAuth handler
│       ├── manager/            # CRUD de managers y economía
│       ├── jugador/            # CRUD de jugadores
│       ├── equipo/             # CRUD de equipos
│       ├── cartas-manager/     # Cartas del manager
│       ├── cartas/             # Eliminar cartas (vender)
│       ├── plantilla/          # Gestión de plantillas
│       ├── PlantillaJugadorObjeto/ # Jugadores en plantilla + objetos
│       ├── sobres/abrir/       # Lógica de apertura de sobres
│       ├── ligas/              # Crear, unirse, clasificación
│       ├── jornada/            # Datos de jornada y cálculo de puntos
│       ├── estadisticas/       # Estadísticas de jugadores
│       ├── objeto/             # Catálogo de objetos
│       ├── tienda/             # Catálogo y compra directa de cartas
│       ├── procesarCSV/        # Importación de estadísticas (CSV jugadores + porteros)
│       └── currency/           # Gestión de moneda
│
├── components/
│   ├── navbar.tsx
│   ├── playerCard.tsx          # Carta de jugador con rareza visual
│   ├── CartaObjeto.tsx         # Carta de objeto con rareza visual
│   ├── AlbumPlayerCard.tsx
│   ├── AlbumObjectCard.tsx
│   ├── AlbumView.tsx
│   ├── playerSelectionModal.tsx # Modal de selección y configuración de jugador
│   ├── objectSelectionModal.tsx # Modal de selección de objeto
│   ├── Toast.tsx               # Notificación flotante
│   ├── RequireAuth.tsx
│   └── RequireAdmin.tsx
│
├── context/
│   └── auth-context.tsx        # Contexto global: user, manager, currency, isAdmin
│
├── lib/
│   ├── auth.ts                 # Configuración NextAuth
│   ├── mysql.ts                # Pool de conexiones a MySQL
│   ├── data.ts                 # Tipos TypeScript e interfaces del dominio
│   ├── packs.ts                # Lógica de sobres y probabilidades
│   ├── packs-types.ts          # Tipos para el sistema de sobres
│   └── liga-utils.ts           # Utilidades de liga
│
├── types/
│   └── next-auth.d.ts          # Extensión de tipos de NextAuth
│
r-scripts/
├── obtenerDatos.r              # Script original (solo summary)
└── obtenerDatosConPorteros.r   # Script actualizado (summary + keeper + keeper_adv)

data/
├── generarDB2.sql              # Schema completo de la base de datos
└── migrations/                 # Migraciones incrementales (001–008)
```

---

## 6. Módulos y funcionalidades

### 6.1 Autenticación

La autenticación usa **NextAuth.js con Google OAuth**. Al hacer login por primera vez:

1. Se crea un registro en la tabla `Manager` con moneda inicial.
2. Se generan automáticamente cartas comunes de jugadores para el nuevo manager.
3. Se añade el manager a la **liga general** automáticamente.

El token JWT almacena `managerId` y `esAdmin`, que se propagan a la sesión y al `AuthContext` de React.

### 6.2 Sistema de cartas

Cada manager posee cartas de dos tipos:

- **Cartas de jugador** (`CartaJugador`): jugadores reales de la liga. La rareza determina los slots de objeto disponibles (0/1/2/3 para Común/Rara/Épica/Legendaria).
- **Cartas de objeto** (`CartaObjeto`): se equipan a un jugador en la plantilla y aplican un efecto multiplicador o de suma a sus puntos en el cálculo de jornada.

### 6.3 Sistema de sobres

Los sobres se abren gastando **oro** o **balones**. Existen tres tipos:

| Tipo | Contenido | Coste (balones) | Coste (oro) |
|------|-----------|-----------------|-------------|
| Normal | 3 jugadores + 1 objeto + 1 aleatorio | 100 | 10.000 |
| Jugadores | 5 cartas de jugador | 150 | 15.000 |
| Objetos | 5 cartas de objeto | 150 | 15.000 |

El **sistema pity** garantiza que si en 10 sobres consecutivos no se obtiene ninguna carta Legendaria, la probabilidad aumenta progresivamente hasta el 100% en el sobre 10. El contador `pity` se persiste en la tabla `Manager`.

### 6.4 Tienda

Los managers pueden comprar cartas directamente sin depender del azar de los sobres. Las cartas de jugador se pueden comprar en cualquiera de las cuatro rarezas con precios escalonados:

| Rareza | Precio (balones) | Precio (oro) |
|--------|-----------------|--------------|
| Común | 5.000 | 1.000 |
| Rara | 20.000 | 4.000 |
| Épica | 60.000 | 12.000 |
| Legendaria | 150.000 | 30.000 |

Las cartas de objeto se compran al precio de mercado según su rareza.

### 6.5 Gestión de plantilla

El manager puede configurar su plantilla eligiendo:

- Una **formación** entre 7 disponibles: 4-3-3, 4-4-2, 4-2-3-1, 3-4-3, 3-5-2, 5-3-2, 4-5-1.
- Los **jugadores** de su álbum para cada posición mediante un modal de selección en cuadrícula.
- Los **objetos equipados** para cada jugador (según sus slots disponibles por rareza).

Al pulsar sobre un jugador ya colocado en la alineación, se abre el mismo modal en modo "reconfigurar", permitiendo cambiar el jugador o sus objetos sin perder la posición.

### 6.6 Sistema de ligas

Existen tres tipos de liga:

| Tipo | Descripción |
|------|-------------|
| `general` | Todos los managers; unión automática al registrarse |
| `privada` | Creada manualmente, acceso por código de invitación |
| `club` | Asociada a un equipo real; jugadores de ese equipo puntúan el doble |

### 6.7 Panel de administración

Accesible solo para usuarios con `esAdmin = true`. Permite:

- Importar estadísticas de jornada desde CSV de jugadores y CSV de porteros (opcional).
- Ejecutar el cálculo de puntos de una jornada.
- Rellenar cartas comunes para todos los managers (útil tras importar nuevos jugadores).
- Gestionar la moneda de los managers.

---

## 7. API REST — Referencia de endpoints

Todos los endpoints devuelven JSON. La autenticación se verifica mediante el token de sesión de NextAuth.

### Managers

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/manager?idGoogle={id}` | Obtener manager por Google ID |
| GET | `/api/manager/{id}` | Obtener manager por ID |
| PUT | `/api/manager/{id}` | Actualizar nombre del manager |
| GET | `/api/manager/economia/{id}` | Obtener oro, balones y puntuación |
| PUT | `/api/manager/economia/{id}` | Actualizar oro y balones |

### Cartas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cartas-manager?managerId={id}` | Listar cartas de jugador del manager |
| GET | `/api/cartas-manager/objetos?managerId={id}` | Listar cartas de objeto del manager |
| DELETE | `/api/cartas/{tipo}/{id}` | Eliminar una carta (vender) |

### Tienda

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tienda` | Catálogo completo (jugadores × 4 rarezas + objetos) con precios |
| POST | `/api/tienda` | Comprar carta `{ managerId, tipo, idItem, moneda, rareza? }` |

### Plantilla

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/plantilla?managerId={id}&idJornada={j}` | Obtener plantilla de una jornada |
| POST | `/api/plantilla` | Crear plantilla nueva |
| PUT | `/api/plantilla/{id}` | Actualizar alineación |
| GET | `/api/PlantillaJugadorObjeto?idPlantilla={id}` | Jugadores con objetos equipados |
| POST | `/api/PlantillaJugadorObjeto` | Añadir jugador a plantilla |
| PUT | `/api/PlantillaJugadorObjeto/{id}` | Equipar/desequipar objeto |
| DELETE | `/api/PlantillaJugadorObjeto/{id}` | Quitar jugador de plantilla |

### Sobres

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/sobres/abrir?managerId={id}` | Obtener pity y probabilidades actuales |
| POST | `/api/sobres/abrir` | Abrir un sobre `{ managerId, tipo, moneda }` |

### Ligas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/ligas/mis-ligas?managerId={id}` | Ligas del manager |
| POST | `/api/ligas/crear` | Crear nueva liga `{ nombre, tipo, idEquipo? }` |
| POST | `/api/ligas/unirse` | Unirse con código `{ managerId, codigo }` |
| GET | `/api/ligas/{id}/clasificacion` | Clasificación de una liga |

### Jornadas y estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/jornada` | Listar jornadas |
| GET | `/api/jornada/{id}` | Datos de una jornada |
| POST | `/api/jornada/{id}/calcular` | Calcular puntos de la jornada (admin) |
| GET | `/api/estadisticas?idJugador={id}&idJornada={j}` | Estadísticas de un jugador |

### Jugadores, equipos y objetos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/jugador` | Listar jugadores (paginado, filtros) |
| GET | `/api/jugador/{id}` | Datos de un jugador |
| GET | `/api/equipo` | Listar equipos |
| GET | `/api/objeto` | Listar objetos del catálogo |

### Administración

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/procesarCSV` | Importar CSV jugadores (`file`) + CSV porteros (`filePorteros`, opcional) |
| POST | `/api/currency` | Añadir oro/balones a un manager |
| GET | `/api/currency/all` | Listar todos los managers con su economía |

---

## 8. Sistema de puntuación

El cálculo de puntos se ejecuta llamando a `POST /api/jornada/{id}/calcular` y sigue estos pasos:

### Paso 1: Puntos por jugador

Para cada registro de `Estadisticas` de la jornada, se calculan los puntos según la posición real del jugador.

#### Portero (GK)

| Estadística | Puntos |
|-------------|--------|
| Cada 10 minutos jugados | +1 pt |
| Cada 3 paradas (`Paradas`) | +1 pt |
| Cada 2 disparos a portería parados | +1 pt |
| Gol marcado | +6 pts |
| Asistencia | +3 pts |
| Portería a cero (`PorteriaACero = 1`) | +5 pts |
| Penalti parado (`PenaltisParados`) | +5 pts por penalti |
| Gol encajado (`GolesEncajados`) | -1 pt por gol |
| Tarjeta amarilla | -3 pts |
| Tarjeta roja | -5 pts |
| % pases > 70% | +2 pts |
| % pases > 80% | +3 pts |
| % pases > 90% | +4 pts |

#### Defensa (DF/CB/RB/LB/WB)

| Estadística | Puntos |
|-------------|--------|
| Cada 10 minutos | +1 pt |
| Cada 3 disparos | +1 pt |
| Gol marcado | +5 pts |
| Asistencia | +4 pts |
| Tarjeta amarilla | -3 pts |
| Tarjeta roja | -5 pts |
| % pases > 70/80/90% | +1/3/5 pts |

#### Centrocampista (MF/DM/CM/AM)

| Estadística | Puntos |
|-------------|--------|
| Cada 10 minutos | +1 pt |
| Gol marcado | +4 pts |
| Asistencia | +3 pts |
| Tarjeta amarilla | -3 pts |
| Tarjeta roja | -5 pts |
| % pases > 70/80/90% | +1/3/5 pts |

#### Delantero (FW/LW/RW/ST)

| Estadística | Puntos |
|-------------|--------|
| Cada 10 minutos | +1 pt |
| Gol marcado | +3 pts |
| Asistencia | +2 pts |
| Tarjeta amarilla | -3 pts |
| Tarjeta roja | -5 pts |
| % pases > 70/80/90% | +1/3/5 pts |

### Paso 2: Bonus de objetos equipados

Para cada jugador en la plantilla, si tiene un objeto equipado se aplica su efecto:

- **`multiplicador`**: `Puntos_totales * ValorEfecto` (ej: 1.30 = +30% de puntos)
- **`suma`**: `Valor_estadistica * ValorEfecto` puntos extra (ej: +2 pts por cada gol adicional)

Los objetos de portero actúan sobre `Paradas`, `GolesEncajados`, `Intercepciones`, `Bloqueos` y `AccionesCreadasDeTiro`.

### Paso 3: Actualización de ligas

Para cada liga del manager:

- **General / privada**: suma de todas las plantillas históricas del manager.
- **Club**: puntuación base + bonus equivalente a los puntos de los jugadores cuyo equipo coincide con el de la liga (efecto × 2 para esos jugadores).

---

## 9. Sistema de sobres y rareza

### Probabilidades base

| Rareza | Probabilidad base |
|--------|------------------|
| Común | 30% |
| Rara | 40% |
| Épica | 20% |
| Legendaria | 10% |

### Sistema pity

Por cada sobre abierto sin obtener carta Legendaria, el `pity` del manager aumenta en 1 (máximo 10). La probabilidad de Legendaria aumenta linealmente:

```
P(Legendaria) = 0.10 + (pity / 10) * 0.90
```

Las demás raridades se reescalan proporcionalmente. Al obtener una Legendaria, el `pity` se reinicia a 0 y se persiste en la tabla `Manager`.

### Rareza y slots de objeto

| Rareza | Slots de objeto | Aspecto visual |
|--------|-----------------|----------------|
| Común | 0 | Degradado gris (slate) |
| Rara | 1 | Degradado azul |
| Épica | 2 | Degradado morado |
| Legendaria | 3 | Degradado dorado/ámbar |

---

## 10. Autenticación y roles

### Flujo de autenticación

```
Usuario hace clic en "Iniciar sesión con Google"
  → NextAuth redirige a Google OAuth
  → Google devuelve perfil (email, nombre, imagen)
  → Callback signIn: crea Manager en DB si es nuevo
  → Callback jwt: añade managerId y esAdmin al token
  → Callback session: propaga al objeto session de Next.js
  → AuthContext (React): expone user, manager, currency, isAdmin
```

### Protección de rutas

- **`RequireAuth`**: componente wrapper que redirige a `/login` si no autenticado.
- **`RequireAdmin`**: componente wrapper que redirige si no tiene `esAdmin = true`.
- Los endpoints de API verifican la sesión con `getServerSession(authConfig)`.

---

## 11. Instalación y despliegue

### Requisitos previos

- Node.js 18+
- MySQL 8+
- R + paquete `worldfootballR` (solo para scraping de datos)

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone <url-repositorio>
cd Estadio-Fantasy

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear el archivo .env con los valores de la sección 12

# 4. Crear la base de datos (schema completo)
mysql -u root -p < data/generarDB2.sql

# 5. Arrancar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Aplicar migraciones a una BD existente

```bash
# Aplicar todas las migraciones en orden
for f in data/migrations/*.sql; do mysql -u root -p mydb < "$f"; done
```

---

## 12. Variables de entorno

Crear un archivo `.env` en la raíz:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=mydb

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=una_cadena_aleatoria_larga

# Google OAuth (obtenido desde Google Cloud Console)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

---

## 13. Pipeline de datos (scraping)

Las estadísticas reales se obtienen de [FBref](https://fbref.com) mediante scripts R con la librería `worldfootballR`.

### Flujo de importación

```
Rscript r-scripts/obtenerDatosConPorteros.r <jornada>
  → Scraping FBref (summary: todos los jugadores)
  → Scraping FBref (keeper: estadísticas de portero)
  → Exporta: partidosAdvanceSummaryJornada{N}.csv
             partidosPorterosJornada{N}.csv
             estadisticasJornada{N}.xlsx

Panel Admin → Subir CSV Jugadores + CSV Porteros
  → POST /api/procesarCSV (multipart/form-data)
  → Inserta en: Equipo, Jornada, Partido, Jugador, Estadisticas
  → UPDATE Estadisticas con columnas de portero (Paradas, GolesEncajados, etc.)

POST /api/jornada/{id}/calcular
  → Lee Estadisticas JOIN Jugador
  → Calcula Puntos por posición (incluyendo stats de portero para GK)
  → UPDATE Estadisticas.Puntos
  → Calcula puntos por plantilla (con bonus de objetos equipados)
  → UPDATE Plantilla.Puntos y Manager.puntuacion_actual
  → Calcula puntuación por liga (con bonus x2 para ligas de club)
  → UPDATE Manager_Ligas.puntuacion_actual
```

### Estadísticas importadas

**CSV Summary (todos los jugadores):**
Minutos, Goles, Asistencias, Tiros, Tiros a puerta, Tarjetas, Toques, Entradas, Intercepciones, Bloqueos, Pases, xG, xA, SCA, GCA, Conducciones, Regates

**CSV Porteros (solo porteros):**
Paradas (Saves), Goles encajados (GA), Portería a cero (CS), PSxG, Penaltis parados (PKsv)

---

## 14. Migraciones de base de datos

Las migraciones incrementales se encuentran en `data/migrations/`:

| Archivo | Descripción |
|---------|-------------|
| `001_add_manager_columns.sql` | Columnas iniciales del manager (oro, balones, pity) |
| `002_scoring_columns.sql` | Columnas de puntuación en Estadisticas |
| `003_club_leagues.sql` | Tipo de liga `club` e `idEquipo` en Ligas |
| `004_cartajugador_autoincrement.sql` | Auto-increment en CartaJugador |
| `005_fix_schema_sobres.sql` | Correcciones al schema de sobres |
| `006_objetos_redesign.sql` | Rediseño del catálogo de objetos con efectos |
| `007_add_config_table.sql` | Tabla de configuración del sistema |
| `008_goalkeeper_stats.sql` | Columnas de estadísticas de portero en Estadisticas |

---

## Licencia

Proyecto académico — Trabajo de Fin de Grado. Todos los derechos reservados al autor.
