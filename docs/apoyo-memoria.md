# Estadio Fantasy — Documento de Apoyo para Redacción de Memoria TFG

> Este documento está pensado para ser entregado a una IA junto con el prompt de redacción.
> Contiene toda la información real y específica del proyecto para que la memoria sea precisa.

---

## 1. IDENTIDAD DEL PROYECTO

- **Nombre:** Estadio Fantasy
- **Tipo:** Trabajo de Fin de Grado (TFG) — Ingeniería Informática
- **Descripción en una frase:** Aplicación web full-stack de fantasy football con sistema de cartas coleccionables, economía virtual, ligas y puntuación basada en estadísticas reales de La Liga española.
- **Repositorio:** GitHub (privado, control de versiones con ramas feature y pull requests)
- **Gestión de tareas:** Trello (tablero Kanban: Backlog / In Progress / Done)

---

## 2. CONTEXTO Y MOTIVACIÓN

El fantasy football es un formato de juego donde los participantes seleccionan jugadores reales y acumulan puntos según el rendimiento de esos jugadores en partidos reales. Aplicaciones como **Comunio**, **Biwenger** o **La Liga Fantasy Oficial** tienen millones de usuarios en España.

**Estadio Fantasy** añade una capa de coleccionismo al modelo tradicional: los jugadores no se "fichan" con un presupuesto fijo, sino que se **obtienen en sobres** con sistema de rareza (como los juegos de cartas digitales tipo FIFA Ultimate Team), y se pueden **equipar con objetos** que potencian su puntuación. Esto introduce un elemento de progresión y coleccionismo que diferencia la propuesta.

---

## 3. STACK TECNOLÓGICO COMPLETO

### 3.1 Frontend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Next.js | 14.2.3 | Framework React con App Router (SSR + CSR) |
| React | 18 | UI declarativa con hooks |
| TypeScript | ^5 | Tipado estático en todo el proyecto |
| Tailwind CSS | ^3.4 | Estilos utility-first, diseño responsive |
| React Context API | (built-in) | Estado global del manager (auth, moneda) |

### 3.2 Backend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Next.js API Routes | 14.2.3 | Endpoints REST serverless en /app/api/ |
| NextAuth.js | ^4.24 | Autenticación OAuth con Google, JWT |
| serverless-mysql | ^1.5 | Pool de conexiones MySQL optimizado |
| mysql2 | ^3.14 | Driver MySQL para Node.js |
| csv-parser | ^3.0 | Parseo de archivos CSV en el servidor |

### 3.3 Base de datos
| Tecnología | Versión | Rol |
|------------|---------|-----|
| MySQL | 8+ | Base de datos relacional principal |
| MySQL Workbench | — | Diseño visual del esquema E-R |

### 3.4 Scraping y datos
| Tecnología | Versión | Rol |
|------------|---------|-----|
| R | 4+ | Lenguaje para scripts de scraping |
| worldfootballR | GitHub | Scraping de FBref.com (estadísticas La Liga) |
| openxlsx | CRAN | Exportación a Excel desde R |
| dplyr | CRAN | Manipulación de data frames en R |

### 3.5 Herramientas de desarrollo y gestión
| Herramienta | Uso |
|-------------|-----|
| Git + GitHub | Control de versiones, pull requests, revisión de código |
| Trello | Gestión de tareas (Kanban: Backlog / In Progress / Done) |
| Postman | Pruebas manuales de endpoints de la API durante el desarrollo |
| MySQL Workbench | Diseño E-R y ejecución de migraciones |
| Visual Studio Code | IDE principal (extensiones: TypeScript, ESLint, Tailwind) |
| npm | Gestión de paquetes Node.js |

---

## 4. MODELO DE DATOS — TABLAS Y RELACIONES

### 4.1 Diagrama de relaciones (texto)

```
Temporada (1) ──< (N) Jornada (1) ──< (N) Partido
Equipo (1) ──< (N) Jugador (1) ──< (N) Estadisticas >── (N) Partido

Manager (1) ──< (N) CartaJugador >── (N:1) Jugador
Manager (1) ──< (N) CartaObjeto  >── (N:1) Objetos
Manager (1) ──< (N) Plantilla (por jornada)
  Plantilla (1) ──< (N) PlantillaJugadorObjeto >── CartaJugador
                                               >── CartaObjeto (nullable)

Manager (N) ──< Manager_Ligas >── (N) Ligas
Ligas >── (N:1) Equipo (solo tipo 'club')
```

### 4.2 Tablas clave con columnas reales

#### `Manager`
```sql
idManager INT PK AUTO_INCREMENT
Nombre VARCHAR(45)
idGoogle VARCHAR(100) UNIQUE      -- ID de Google OAuth
Email VARCHAR(100)
esAdmin TINYINT DEFAULT 0
oro INT DEFAULT 1000
balones INT DEFAULT 10
puntuacion_actual INT DEFAULT 0
pity INT DEFAULT 0                -- contador sobres sin legendaria (0-10)
```

#### `Jugador`
```sql
idJugador INT PK AUTO_INCREMENT
Nombre VARCHAR(45)
Edad VARCHAR(45)
Pais VARCHAR(45)
Posicion VARCHAR(45)              -- GK, CB, LB, RB, WB, CM, DM, AM, LM, RM, FW, LW, RW, ST
Precio INT DEFAULT 0
idEquipo INT FK → Equipo.idEquipo
```

#### `Estadisticas`
```sql
idEstadisticas INT PK AUTO_INCREMENT
idPartido INT FK
idJornada INT FK
idJugador INT FK
idEquipo INT FK
-- Estadísticas generales
Minutos INT
Goles INT
Asistencias INT
TirosPenalti INT
TirosPenaltiIntentados INT
Disparos INT
DisparosPorteria INT
TarjetasAmarillas INT
TarjetasRojas INT
Toques INT
Entradas INT
Intercepciones INT
Bloqueos INT
GolesEsperados FLOAT
GolesEsperadosSinPenaltis FLOAT
AsistenciasEsperadas FLOAT
AccionesCreadasDeTiro INT
AccionesCreadasDeGol INT
PasesCompletados INT
PasesIntentados INT
PorcentajePasesCompletados FLOAT
PasesProgresivos INT
Controles INT
ConduccionesProgresivas INT
EntradasOfensivas INT
EntradasConExito INT
-- Estadísticas exclusivas de portero (se rellenan con el CSV de porteros)
Paradas INT                       -- Saves
GolesEncajados INT                -- GA (Goals Against)
PorteriaACero TINYINT             -- CS (Clean Sheet: 0 o 1)
PSxGPortero FLOAT                 -- Post-Shot xG
PenaltisParados INT               -- PKsv
-- Resultado
Puntos FLOAT                      -- calculado por POST /api/jornada/{id}/calcular
```

#### `CartaJugador`
```sql
idCartaJugador INT PK AUTO_INCREMENT
Jugador_idJugador INT FK
Manager_idManager INT FK
Rareza VARCHAR(45)                -- 'Comun' | 'Rara' | 'Epica' | 'Legendaria'
```

#### `CartaObjeto`
```sql
idCartaObjeto INT PK AUTO_INCREMENT
idObjetos INT FK → Objetos.idObjetos
idManager INT FK
Rareza VARCHAR(45)
```

#### `Objetos`
```sql
idObjetos INT PK AUTO_INCREMENT
Nombre VARCHAR(100)
Precio INT
Descripcion TEXT
Tipo VARCHAR(50)                  -- 'Escudo' | 'Balon' | 'Capa' | 'Armadura' | 'Guantes' | etc.
Efecto VARCHAR(20)                -- 'multiplicador' | 'suma'
ValorEfecto FLOAT                 -- ej: 1.30 (multiplicador) o 2.0 (suma)
Estadistica VARCHAR(100)          -- nombre exacto de columna en Estadisticas
Rareza VARCHAR(45)
```

#### `Plantilla`
```sql
idPlantilla INT PK AUTO_INCREMENT
idManager INT FK
idJornada INT FK
Alineacion VARCHAR(10)            -- ej: '4-3-3'
Puntos FLOAT                      -- puntos totales de esta jornada (calculados)
```

#### `PlantillaJugadorObjeto`
```sql
idPlantillaJugadorObjeto INT PK AUTO_INCREMENT
idPlantilla INT FK
idCartaJugador INT FK
idCartaObjeto INT FK (nullable)   -- objeto equipado (null si no lleva)
posicion_en_plantilla INT         -- slot 0-10 en la formación
```

#### `Ligas`
```sql
idLigas INT PK AUTO_INCREMENT
Nombre VARCHAR(100)
tipo VARCHAR(20)                  -- 'general' | 'privada' | 'club'
codigo VARCHAR(20)                -- código de invitación (solo privadas)
idEquipo INT FK (nullable)        -- equipo asociado (solo ligas de club)
```

#### `Manager_Ligas`
```sql
Manager_idManager INT FK (PK compuesta)
Ligas_idLigas INT FK (PK compuesta)
puntuacion_actual FLOAT           -- puntuación del manager en esta liga específica
```

---

## 5. SISTEMA DE PUNTUACIÓN — VALORES EXACTOS

El cálculo se realiza en `src/app/api/jornada/[id]/calcular/route.ts`.

### 5.1 Mapeo de posiciones FBref → categorías del juego

```
GK              → PORTERO
DF, CB, RB, LB, WB → DEFENSA
MF, DM, CM, LM, RM, AM → CENTROCAMPISTA
FW, LW, RW, ST  → DELANTERO
```

### 5.2 Puntos por estadísticas continuas (1 pt por cada N)

| Estadística | PORTERO | DEFENSA | CENTROCAMPISTA | DELANTERO |
|------------|---------|---------|----------------|-----------|
| MinutosPorPunto | 10 | 10 | 10 | 10 |
| DisparosPorPunto | 0 | 3 | 4 | 5 |
| DisparosPorteriaPorPunto | 2 | 2 | 2 | 3 |
| ToquesPorPunto | 10 | 30 | 20 | 10 |
| EntradasPorPunto | 10 | 10 | 10 | 10 |
| IntercepcionesPorPunto | 10 | 10 | 10 | 10 |
| BloqueosPorPunto | 10 | 5 | 4 | 3 |
| AccionesCreadasDeTiroPorPunto | 1 | 3 | 4 | 5 |
| AccionesCreadasDeGolPorPunto | 2 | 2 | 3 | 4 |
| PasesCompletadosPorPunto | 20 | 40 | 40 | 10 |
| PasesProgresivosPorPunto | 30 | 20 | 20 | 30 |
| ControlesPorPunto | 22 | 30 | 30 | 20 |
| ConduccionesProgresivasPorPunto | 27 | 80 | 80 | 30 |
| EntradasOfensivasPorPunto | 35 | 4 | 2 | 80 |
| EntradasConExitoPorPunto | 1 | 2 | 2 | 3 |
| ParadasPorPunto (solo GK) | 3 | — | — | — |

### 5.3 Puntos fijos por evento (multiplicadores)

| Evento | PORTERO | DEFENSA | CENTROCAMPISTA | DELANTERO |
|--------|---------|---------|----------------|-----------|
| Gol | +6 | +5 | +4 | +3 |
| Asistencia | +3 | +4 | +3 | +2 |
| TirosPenalti marcado | +3 | +3 | +3 | +3 |
| TarjetaAmarilla | -3 | -3 | -3 | -3 |
| TarjetaRoja | -5 | -5 | -5 | -5 |

### 5.4 Estadísticas exclusivas de portero

| Evento | Puntos |
|--------|--------|
| Portería a cero (PorteriaACero = 1) | +5 |
| Gol encajado (cada GolesEncajados) | -1 |
| Penalti parado (cada PenaltisParados) | +5 |

### 5.5 Umbral porcentaje de pases

| Umbral | PORTERO | DEFENSA | CENTROCAMPISTA | DELANTERO |
|--------|---------|---------|----------------|-----------|
| > 70% | +2 | +1 | +1 | +1 |
| > 80% | +3 | +3 | +3 | +3 |
| > 90% | +4 | +5 | +5 | +5 |

### 5.6 Objetos: cómo se aplica el efecto

```
tipo 'multiplicador':
  puntos_con_bonus = E.Puntos + E.Puntos * (O.ValorEfecto - 1)
  → equivale a E.Puntos * O.ValorEfecto

tipo 'suma':
  puntos_con_bonus = E.Puntos + E.[O.Estadistica] * O.ValorEfecto
  → suma ValorEfecto puntos por cada ocurrencia de la estadística
```

---

## 6. SISTEMA DE SOBRES — VALORES EXACTOS

### 6.1 Tipos de sobre y costes

| Tipo | balones | oro | Contenido |
|------|---------|-----|-----------|
| `normal` | 100 | 10.000 | 3 jugadores + 1 objeto + 1 carta aleatoria (jug. o obj.) |
| `jugadores` | 150 | 15.000 | 5 cartas de jugador |
| `objetos` | 150 | 15.000 | 5 cartas de objeto |

### 6.2 Probabilidades base

| Rareza | Probabilidad |
|--------|-------------|
| Común | 30% |
| Rara | 40% |
| Épica | 20% |
| Legendaria | 10% |

### 6.3 Sistema pity (contador de garantía)

- `pity` se incrementa en +1 por cada sobre que no da Legendaria (máx 10).
- La probabilidad de Legendaria aumenta linealmente:
  ```
  P(Legendaria) = 0.10 + (pity / 10) * 0.90
  ```
- Al obtener una Legendaria, `pity` se reinicia a 0.
- Se persiste en `Manager.pity` en la base de datos (no en memoria).

---

## 7. TIENDA — PRECIOS EXACTOS

### 7.1 Cartas de jugador (por rareza)

| Rareza | balones | oro |
|--------|---------|-----|
| Común | 5.000 | 1.000 |
| Rara | 20.000 | 4.000 |
| Épica | 60.000 | 12.000 |
| Legendaria | 150.000 | 30.000 |

### 7.2 Cartas de objeto (por rareza)

| Rareza | balones | oro |
|--------|---------|-----|
| Común | 2.000 | 400 |
| Rara | 5.000 | 1.000 |
| Épica | 12.000 | 2.500 |
| Legendaria | 30.000 | 6.000 |

---

## 8. CATÁLOGO DE OBJETOS — GRUPOS

Los objetos se organizan por la estadística sobre la que actúan. Existen 4 rarezas por grupo.

| Estadística objetivo | Ejemplos de nombre | Posición orientada |
|---------------------|--------------------|--------------------|
| Goles | Botas de Gol, Botas del Artillero, Botas de Crack, Botas Legendarias | Delantero |
| Asistencias | Visión de Juego, Pase Maestro... | Centrocampista/Delantero |
| Disparos | Diana Certera... | Delantero |
| DisparosPorteria | Puntería del Francotirador... | Delantero |
| Entradas | Espinillera Básica... | Defensa |
| TarjetasAmarillas | Bota Suave... (reduce penalización) | Todos |
| TarjetasRojas | Cabeza Fría... | Todos |
| PasesCompletados | Playmaker Básico... | Centrocampista |
| PasesProgresivos | Motor de Juego... | Centrocampista |
| AccionesCreadasDeGol | Asistente Fantasma... | Centrocampista |
| Intercepciones | Guantes de Portero, Guantes de Élite... | Portero |
| Bloqueos | Casco de Portero, El Muro Bajo los Palos... | Portero |
| AccionesCreadasDeTiro | Jersey del Portero Activo, El Portero Legendario... | Portero |

---

## 9. LIGAS — TIPOS Y COMPORTAMIENTO

### 9.1 Liga general
- Se crea automáticamente al inicializar el sistema.
- Todos los managers se unen al registrarse.
- Puntuación = suma de `Plantilla.Puntos` de todas las jornadas.

### 9.2 Liga privada
- Creada por un manager con nombre personalizado.
- Genera un `codigo` aleatorio de invitación.
- Otros managers se unen introduciendo el código.
- Puntuación = misma fórmula que la general.

### 9.3 Liga de club
- Asociada a un equipo real de la liga (campo `idEquipo`).
- Puntuación = base + bonus: los puntos de los jugadores del equipo asociado se cuentan el doble.
- Ejemplo: liga del Real Madrid → los puntos de Bellingham, Vinicius, etc. se duplican.

---

## 10. PIPELINE DE DATOS — FLUJO COMPLETO

### 10.1 Scripts R

**`r-scripts/obtenerDatosConPorteros.r`** — Script principal (actualizado, temporada 2024-25):

1. Obtiene las URLs de los partidos de la jornada con `fb_match_urls(country="ESP", season_end_year=2025)`.
2. Llama a `fb_advanced_match_stats(stat_type="summary")` → estadísticas generales de todos los jugadores.
3. Llama a `fb_advanced_match_stats(stat_type="keeper")` → paradas, goles encajados, CS, PSxG, penaltis.
4. Llama a `fb_advanced_match_stats(stat_type="keeper_adv")` → estadísticas avanzadas de portero (con tryCatch por si no está disponible).
5. Une keeper + keeper_adv con `left_join`.
6. Exporta 3 archivos: `partidosAdvanceSummaryJornada{N}.csv`, `partidosPorterosJornada{N}.csv`, `estadisticasJornada{N}.xlsx`.

**Uso:**
```bash
Rscript r-scripts/obtenerDatosConPorteros.r 10
```

### 10.2 Importación vía panel admin

El endpoint `POST /api/procesarCSV` acepta `multipart/form-data` con dos campos:
- `file` (obligatorio): CSV summary de jugadores.
- `filePorteros` (opcional): CSV keeper de porteros.

**Proceso del CSV summary (por cada fila):**
1. Crea el `Equipo` si no existe.
2. Crea la `Jornada` si no existe (vinculada a `Temporada` con `idTemporada=1`).
3. Crea el `Partido` si no existe (local vs visitante en esa jornada).
4. Crea el `Jugador` si no existe (nombre + equipo).
5. Inserta la fila en `Estadisticas` si no existe ya (idPartido + idJugador únicos).

**Proceso del CSV porteros:**
- Para cada fila, localiza el `Estadisticas` ya existente (via idJugador + idJornada).
- Hace `UPDATE` añadiendo `Paradas`, `GolesEncajados`, `PorteriaACero`, `PSxGPortero`, `PenaltisParados`.

### 10.3 Columnas del CSV summary (nombres exactos)

```
Player, Team, Home_Team, Away_Team, Matchweek, Nation, Pos, Age, Min,
Gls, Ast, PK, PKatt, Sh, SoT, CrdY, CrdR, Touches, Tkl, Int, Blocks,
xG_Expected, npxG_Expected, xAG_Expected, SCA_SCA, GCA_SCA,
Cmp_Passes, Att_Passes, Cmp_percent_Passes, PrgP_Passes,
Carries_Carries, PrgC_Carries, Att_Take_Ons, Succ_Take_Ons
```

### 10.4 Columnas del CSV porteros (nombres esperados)

```
Player, Team, Home_Team, Away_Team, Matchweek,
Saves (o Saves_Keeper), GA (o GA_Keeper), CS, PSxG (o PSxG_Keeper), PKsv (o PKsv_Keeper)
```

---

## 11. ARQUITECTURA DE COMPONENTES FRONTEND

### 11.1 Páginas principales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | page.tsx | Landing page |
| `/login` | login/page.tsx | Login con Google |
| `/home` | home/page.tsx | Dashboard del manager (moneda, stats, accesos rápidos) |
| `/mi-equipo` | mi-equipo/page.tsx | Alineación visual interactiva con formación |
| `/album` | album/page.tsx | Álbum de cartas + tienda integrada |
| `/sobres` | sobres/page.tsx | Apertura de sobres con animación |
| `/ligas` | ligas/page.tsx | Mis ligas y clasificaciones |
| `/mi-perfil` | mi-perfil/page.tsx | Perfil del manager |
| `/admin` | admin/page.tsx | Panel de administración |

### 11.2 Componentes reutilizables clave

**`playerCard.tsx`**
Carta de jugador con degradado visual según rareza. Muestra nombre, posición, equipo y slots de objeto disponibles.

**`CartaObjeto.tsx`**
Carta de objeto con degradado visual según rareza. Muestra nombre, tipo, efecto y estadística objetivo.

**`playerSelectionModal.tsx`**
Modal de dos pasos:
- Paso `select`: cuadrícula de cartas disponibles filtradas por posición.
- Paso `configure`: carta seleccionada con slots de objeto + cuadrícula para cambiar de jugador.
- Acepta `initialPlayer` e `initialObjects` para abrir directamente en modo configurar (cuando el manager pincha en un jugador ya colocado).

**`objectSelectionModal.tsx`**
Modal para seleccionar el objeto a equipar en un slot concreto. Filtra por rareza compatible.

**`AlbumView.tsx`**
Vista del álbum completo con paginación y filtros (por rareza, posición, equipo).

**`RequireAuth.tsx` / `RequireAdmin.tsx`**
Higher-Order Components que protegen rutas redirigiendo a `/login` si no hay sesión o no se tiene rol de admin.

### 11.3 Contexto global `auth-context.tsx`

```typescript
interface AuthContextType {
  user: Session["user"] | null;
  manager: Manager | null;
  currency: { oro: number; balones: number } | null;
  isAdmin: boolean;
  refreshCurrency: () => Promise<void>;
}
```

Expone los datos del manager en toda la aplicación. Se actualiza automáticamente tras compras, apertura de sobres, etc.

---

## 12. MIGRACIONES — HISTORIAL DE CAMBIOS EN BD

| Nº | Archivo | Qué añade |
|----|---------|-----------|
| 001 | add_manager_columns | oro, balones, puntuacion_actual, pity, esAdmin en Manager |
| 002 | scoring_columns | Columnas de estadísticas avanzadas en Estadisticas |
| 003 | club_leagues | Campo tipo ('club') e idEquipo en Ligas; idEquipo en Manager_Ligas |
| 004 | cartajugador_autoincrement | PK auto-increment en CartaJugador |
| 005 | fix_schema_sobres | Correcciones FK y constraints tras rediseño de sobres |
| 006 | objetos_redesign | Columnas Efecto, ValorEfecto, Estadistica, Tipo en Objetos |
| 007 | add_config_table | Tabla Config para parámetros globales del sistema |
| 008 | goalkeeper_stats | Paradas, GolesEncajados, PorteriaACero, PSxGPortero, PenaltisParados en Estadisticas |

---

## 13. CASOS DE USO PRINCIPALES

### CU-01: Registro de nuevo manager
**Actor:** Usuario no registrado
**Flujo:**
1. El usuario accede a `/login` y pulsa "Iniciar sesión con Google".
2. Google OAuth devuelve el perfil del usuario.
3. El sistema verifica si existe un Manager con ese `idGoogle`.
4. Si no existe: crea el Manager con valores iniciales, genera cartas comunes, une a la liga general.
5. Redirige al dashboard `/home`.

### CU-02: Abrir un sobre
**Actor:** Manager autenticado
**Flujo:**
1. Manager accede a `/sobres`, selecciona tipo (normal/jugadores/objetos) y moneda (oro/balones).
2. El sistema verifica que tiene suficiente moneda.
3. Se generan cartas aleatorias según las probabilidades (con modificador pity).
4. Se descuenta la moneda, se insertan las CartaJugador/CartaObjeto, se actualiza pity.
5. Se muestran las cartas obtenidas con animación.

### CU-03: Configurar plantilla para jornada
**Actor:** Manager autenticado
**Flujo:**
1. Manager accede a `/mi-equipo`, selecciona formación.
2. Pulsa en un slot vacío → abre modal `playerSelectionModal` en modo "select".
3. Selecciona un jugador de su álbum → modal pasa a modo "configure".
4. Opcionalmente equipa objetos en los slots disponibles según rareza.
5. Confirma → se guarda en `PlantillaJugadorObjeto`.
6. Si pulsa en un jugador ya colocado → modal abre en modo "configure" con el jugador actual (puede cambiar jugador u objetos).

### CU-04: Calcular puntos de jornada (admin)
**Actor:** Administrador
**Flujo:**
1. Admin ejecuta el script R y obtiene los CSV de jugadores y porteros.
2. Sube los CSV en `/admin` (campo jugadores obligatorio, porteros opcional).
3. `procesarCSV` importa equipos, jornadas, partidos, jugadores y estadísticas.
4. Admin introduce el ID de jornada y pulsa "Calcular".
5. `POST /api/jornada/{id}/calcular` recorre todos los registros de Estadisticas de esa jornada, calcula puntos por jugador (aplicando sistema de scoring y stats de portero), luego calcula puntos por plantilla (aplicando bonus de objetos), y finalmente actualiza la clasificación de cada liga.

### CU-05: Crear y unirse a liga privada
**Actor:** Manager autenticado
**Flujo creación:**
1. Manager va a `/ligas`, pulsa "Crear liga".
2. Introduce nombre y tipo (privada o club, con selector de equipo si es club).
3. Se genera un código aleatorio de invitación.

**Flujo unión:**
1. Otro manager introduce el código en "Unirse a liga".
2. Se valida el código y se inserta en `Manager_Ligas`.

### CU-06: Comprar carta en la tienda
**Actor:** Manager autenticado
**Flujo:**
1. Manager accede a `/album` → pestaña "Tienda".
2. Filtra por tipo (jugador/objeto), rareza, posición.
3. Selecciona la carta y la moneda de pago.
4. `POST /api/tienda` verifica saldo, inserta la carta en CartaJugador/CartaObjeto, descuenta moneda.
5. La carta aparece en el álbum del manager.

---

## 14. DECISIONES TÉCNICAS CLAVE Y SU JUSTIFICACIÓN

### ¿Por qué Next.js y no React + Express separados?
Next.js permite tener frontend y backend en un único repositorio con un único despliegue. Las API Routes del App Router actúan como funciones serverless. Esto simplifica la arquitectura para un proyecto TFG sin perder potencia, y permite SSR en las páginas que lo necesitan.

### ¿Por qué MySQL y no MongoDB?
Los datos del juego son altamente relacionales: jugadores pertenecen a equipos, las cartas pertenecen a managers, las plantillas relacionan cartas con jornadas y objetos. Un modelo relacional con claves foráneas garantiza integridad referencial, algo crítico en un sistema de economía virtual donde una inconsistencia puede dar cartas gratis o borrar moneda erroneamente.

### ¿Por qué NextAuth en vez de implementar auth propia?
NextAuth gestiona el flujo OAuth 2.0 con Google (tokens, callbacks, sesiones JWT) de forma segura y estandarizada. Implementarlo manualmente supondría gestionar los tokens de Google, el estado CSRF, la renovación de sesión, etc. — trabajo de semanas sin valor añadido al proyecto.

### ¿Por qué R para el scraping?
La librería `worldfootballR` es la herramienta más completa para extraer datos de FBref, que es la fuente de estadísticas más detallada de fútbol europeo. No existe una alternativa equivalente en Node.js o Python con el mismo nivel de soporte para datos avanzados (xG, PSxG, SCA, GCA...).

### ¿Por qué sistema de pity persistido en base de datos?
Una primera implementación usaba un `Map` en memoria del servidor. Al reiniciar Next.js en producción, los contadores se perdían. Migrar el `pity` a una columna de la tabla `Manager` garantiza que el contador sobrevive reinicios y escalado horizontal.

### ¿Por qué dos CSVs separados para jugadores y porteros?
FBref organiza las estadísticas de portero en una tabla diferente a las de jugadores de campo. `worldfootballR` requiere dos llamadas separadas (`stat_type="summary"` y `stat_type="keeper"`). Mantenerlos separados permite importar jornadas sin datos de portero cuando solo están disponibles las estadísticas generales.

---

## 15. PROBLEMAS ENCONTRADOS DURANTE EL DESARROLLO

| Problema | Solución |
|----------|----------|
| Pity counter se perdía al reiniciar el servidor | Migrar de Map en memoria a columna `pity` en tabla Manager |
| Ruta hardcodeada en procesarCSV (`C:/Users/Sergio/Desktop/...`) | Migrar a upload de archivo con `multipart/form-data` |
| Duplicación de claves en el grid de la tienda (mismo jugador en 4 rarezas compartía id) | Usar clave compuesta `${tipo}-${id}-${rareza}` |
| Modal de configuración no se abría al reeditar jugador colocado | Añadir props `initialPlayer`/`initialObjects` con lazy state initialization |
| Los porteros no tenían estadísticas propias (paradas, goles encajados) | Añadir 5 columnas a Estadisticas + segundo script R + migración 008 |
| worldfootballR archivado y sin mantenimiento activo | Usar la última versión de GitHub; la librería sigue funcionando aunque no reciba actualizaciones |
| CartaJugador sin auto-increment causaba errores de inserción | Migración 004 para añadir AUTO_INCREMENT a la PK |

---

## 16. MÉTRICAS DEL PROYECTO

- **Tablas en la base de datos:** ~15
- **Endpoints de API:** ~35
- **Páginas de la aplicación:** 9
- **Componentes React:** ~20
- **Formaciones disponibles:** 7 (4-3-3, 4-4-2, 4-2-3-1, 3-4-3, 3-5-2, 5-3-2, 4-5-1)
- **Tipos de rareza:** 4 (Común, Rara, Épica, Legendaria)
- **Tipos de sobre:** 3 (normal, jugadores, objetos)
- **Tipos de liga:** 3 (general, privada, club)
- **Objetos en catálogo:** ~60+ (grupos por estadística × 4 rarezas, incluidos porteros)
- **Scripts R:** 2 (obtenerDatos.r original + obtenerDatosConPorteros.r actualizado)
- **Migraciones de BD:** 8

---

*Documento generado a partir del código fuente real del proyecto. Todos los valores, nombres de tablas, columnas y endpoints son los que aparecen en el código de producción.*
