-- ============================================================
-- Migración 005 — Fix del schema para apertura de sobres
-- Aplica si ya tienes datos y no quieres recrear la DB
-- ============================================================

USE `mydb`;

-- 1. Añadir columna Rareza a CartaJugador (si no existe)
ALTER TABLE `CartaJugador`
  ADD COLUMN IF NOT EXISTS `Rareza` VARCHAR(45) NOT NULL DEFAULT 'Comun';

-- 2. Añadir columnas Tipo y Efecto a Objetos (si no existen)
ALTER TABLE `Objetos`
  ADD COLUMN IF NOT EXISTS `Tipo`   VARCHAR(45)  NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `Efecto` VARCHAR(200) NULL DEFAULT NULL;

-- 3. Ampliar Descripcion de Objetos por si es VARCHAR(200) pequeño
ALTER TABLE `Objetos`
  MODIFY COLUMN `Descripcion` VARCHAR(500) NULL DEFAULT NULL;

-- 4. Rellenar Rareza en cartas de jugador existentes que tengan NULL
UPDATE `CartaJugador` SET `Rareza` = 'Comun' WHERE `Rareza` IS NULL OR `Rareza` = '';

-- 5. Insertar objetos si la tabla está vacía
INSERT INTO `Objetos` (`Nombre`, `Precio`, `Descripcion`, `Tipo`, `Efecto`, `ValorEfecto`)
SELECT * FROM (
  SELECT 'Botas Turbo'           , 500,  'Botas de alta velocidad.',                                  'Botas',     'multiplicador', 1.10 UNION ALL
  SELECT 'Botas de Precisión'    , 1000, 'Maximizan la precisión en pases y tiros.',                  'Botas',     'multiplicador', 1.20 UNION ALL
  SELECT 'Botas Élite'           , 2000, 'Calzado profesional de primera categoría.',                  'Botas',     'multiplicador', 1.35 UNION ALL
  SELECT 'Botas Legendarias'     , 5000, 'Las botas más avanzadas del mercado.',                       'Botas',     'multiplicador', 1.60 UNION ALL
  SELECT 'Guantes Básicos'       , 400,  'Guantes estándar de portero.',                              'Guantes',   'multiplicador', 1.10 UNION ALL
  SELECT 'Guantes Pro'           , 900,  'Guantes de portero de gama media.',                          'Guantes',   'multiplicador', 1.20 UNION ALL
  SELECT 'Guantes Titanio'       , 2000, 'Guantes reforzados con fibra de titanio.',                   'Guantes',   'multiplicador', 1.35 UNION ALL
  SELECT 'Guantes del Olimpo'    , 4500, 'Guantes legendarios de los mejores porteros.',               'Guantes',   'multiplicador', 1.55 UNION ALL
  SELECT 'Cintillo Deportivo'    , 300,  'Mejora la concentración del jugador.',                       'Cintillo',  'multiplicador', 1.08 UNION ALL
  SELECT 'Cintillo Capitán'      , 800,  'Símbolo de liderazgo en el campo.',                         'Cintillo',  'multiplicador', 1.18 UNION ALL
  SELECT 'Cintillo de Campeón'   , 1800, 'Usado por los campeones. Bonus notable.',                    'Cintillo',  'multiplicador', 1.30 UNION ALL
  SELECT 'Corona del Rey'        , 4000, 'El accesorio más codiciado.',                               'Cintillo',  'multiplicador', 1.50 UNION ALL
  SELECT 'Brazalete Atlético'    , 600,  'Potencia la energía del jugador.',                           'Brazalete', 'multiplicador', 1.12 UNION ALL
  SELECT 'Brazalete de Platino'  , 1500, 'Efectos sobre el rendimiento del portador.',                 'Brazalete', 'multiplicador', 1.25 UNION ALL
  SELECT 'Brazalete Épico'       , 3000, 'Eleva significativamente los puntos obtenidos.',             'Brazalete', 'multiplicador', 1.40 UNION ALL
  SELECT 'Brazalete Legendario'  , 6000, 'El brazalete más poderoso del juego.',                      'Brazalete', 'multiplicador', 1.70 UNION ALL
  SELECT 'Bidón Energético'      , 200,  'Mantiene al jugador en su mejor nivel.',                     'Bidón',     'multiplicador', 1.05 UNION ALL
  SELECT 'Bidón Pro'             , 500,  'Fórmula avanzada de recuperación.',                          'Bidón',     'multiplicador', 1.12 UNION ALL
  SELECT 'Bidón Olímpico'        , 1200, 'Suplemento de atletas de élite.',                            'Bidón',     'multiplicador', 1.22 UNION ALL
  SELECT 'Néctar del Campeón'    , 3500, 'Bebida mítica que despierta capacidades ocultas.',           'Bidón',     'multiplicador', 1.45 UNION ALL
  SELECT 'Escudo Básico'         , 350,  'Mejora el rendimiento defensivo.',                           'Escudo',    'multiplicador', 1.08 UNION ALL
  SELECT 'Escudo Reforzado'      , 900,  'Mayor resistencia y bonus de puntos.',                       'Escudo',    'multiplicador', 1.18 UNION ALL
  SELECT 'Escudo de Mithril'     , 2200, 'Material legendario. Bonus excepcional.',                    'Escudo',    'multiplicador', 1.32 UNION ALL
  SELECT 'Égida Divina'          , 5500, 'El escudo definitivo.',                                     'Escudo',    'multiplicador', 1.65 UNION ALL
  SELECT 'Balón de Entrenamiento', 250,  'Mejora la técnica del jugador.',                             'Balón',     'multiplicador', 1.07 UNION ALL
  SELECT 'Balón Profesional'     , 700,  'Balón oficial de competición.',                             'Balón',     'multiplicador', 1.15 UNION ALL
  SELECT 'Balón de Oro'          , 2500, 'El balón más exclusivo del mercado.',                        'Balón',     'multiplicador', 1.38 UNION ALL
  SELECT 'Balón del Destino'     , 6500, 'Un balón mítico que ha decidido finales históricas.',        'Balón',     'multiplicador', 1.75 UNION ALL
  SELECT 'Capa del Estratega'    , 800,  'Realza la visión del juego del mediocampista.',              'Capa',      'multiplicador', 1.15 UNION ALL
  SELECT 'Capa del Genio'        , 2000, 'Para mentes brillantes del fútbol.',                         'Capa',      'multiplicador', 1.30 UNION ALL
  SELECT 'Capa del Maestro'      , 4000, 'Distingue a los mejores mediocampistas.',                    'Capa',      'multiplicador', 1.48 UNION ALL
  SELECT 'Capa Omnisciente'      , 7000, 'El objeto definitivo para los creadores de juego.',          'Capa',      'multiplicador', 1.80
) AS nuevos
WHERE NOT EXISTS (SELECT 1 FROM `Objetos` LIMIT 1);

-- 6. Crear la liga general si no existe
INSERT IGNORE INTO `Ligas` (`Nombre`, `Codigo`, `tipo`)
SELECT 'Liga General', NULL, 'general'
WHERE NOT EXISTS (SELECT 1 FROM `Ligas` WHERE tipo = 'general');

-- 7. Insertar temporada y jornadas si la tabla está vacía
INSERT INTO `Temporada` (`Nombre`)
SELECT 'LaLiga 2024-25'
WHERE NOT EXISTS (SELECT 1 FROM `Temporada` LIMIT 1);

INSERT INTO `Jornada` (`Nombre`, `idTemporada`)
SELECT j.nombre, t.idTemporada
FROM (
  SELECT 'Jornada 1' AS nombre  UNION ALL SELECT 'Jornada 2'  UNION ALL SELECT 'Jornada 3'  UNION ALL
  SELECT 'Jornada 4'            UNION ALL SELECT 'Jornada 5'  UNION ALL SELECT 'Jornada 6'  UNION ALL
  SELECT 'Jornada 7'            UNION ALL SELECT 'Jornada 8'  UNION ALL SELECT 'Jornada 9'  UNION ALL
  SELECT 'Jornada 10'           UNION ALL SELECT 'Jornada 11' UNION ALL SELECT 'Jornada 12' UNION ALL
  SELECT 'Jornada 13'           UNION ALL SELECT 'Jornada 14' UNION ALL SELECT 'Jornada 15' UNION ALL
  SELECT 'Jornada 16'           UNION ALL SELECT 'Jornada 17' UNION ALL SELECT 'Jornada 18' UNION ALL
  SELECT 'Jornada 19'           UNION ALL SELECT 'Jornada 20' UNION ALL SELECT 'Jornada 21' UNION ALL
  SELECT 'Jornada 22'           UNION ALL SELECT 'Jornada 23' UNION ALL SELECT 'Jornada 24' UNION ALL
  SELECT 'Jornada 25'           UNION ALL SELECT 'Jornada 26' UNION ALL SELECT 'Jornada 27' UNION ALL
  SELECT 'Jornada 28'           UNION ALL SELECT 'Jornada 29' UNION ALL SELECT 'Jornada 30' UNION ALL
  SELECT 'Jornada 31'           UNION ALL SELECT 'Jornada 32' UNION ALL SELECT 'Jornada 33' UNION ALL
  SELECT 'Jornada 34'           UNION ALL SELECT 'Jornada 35' UNION ALL SELECT 'Jornada 36' UNION ALL
  SELECT 'Jornada 37'           UNION ALL SELECT 'Jornada 38'
) j
CROSS JOIN (SELECT idTemporada FROM `Temporada` ORDER BY idTemporada DESC LIMIT 1) t
WHERE NOT EXISTS (SELECT 1 FROM `Jornada` LIMIT 1);
