-- ============================================================
-- Migración 006 — Rediseño completo del catálogo de objetos
--
-- Cambios en schema:
--   · Objetos.Efecto:      VARCHAR(200) → VARCHAR(45) ('multiplicador' | 'suma')
--   · Objetos.Estadistica: nueva columna — stat exacta a la que se aplica el efecto
--   · Objetos.Rareza:      nueva columna — rareza fija del objeto
--
-- Reemplaza los 32 objetos genéricos anteriores por 80 objetos con efecto
-- vinculado a una estadística concreta y rareza propia.
--
-- Aplica si ya tienes datos y NO quieres recrear la base de datos.
-- ============================================================

USE `mydb`;

-- 1. Modificar columna Efecto (antes texto libre, ahora 'multiplicador' | 'suma')
ALTER TABLE `Objetos`
  MODIFY COLUMN `Efecto` VARCHAR(45) NULL DEFAULT NULL;

-- 2. Añadir columna Estadistica (nombre exacto de la columna en tabla Estadisticas)
ALTER TABLE `Objetos`
  ADD COLUMN IF NOT EXISTS `Estadistica` VARCHAR(45) NULL DEFAULT NULL;

-- 3. Añadir columna Rareza con default Comun
ALTER TABLE `Objetos`
  ADD COLUMN IF NOT EXISTS `Rareza` VARCHAR(45) NOT NULL DEFAULT 'Comun';

-- 4. Borrar catálogo anterior (objetos genéricos sin estadística)
DELETE FROM `Objetos`;

-- 5. Insertar los 80 nuevos objetos
-- Columnas: Nombre, Precio, Descripcion, Tipo, Efecto, ValorEfecto, Estadistica, Rareza
--
-- Efecto 'multiplicador': ValorEfecto * puntos_de_esa_estadistica
--   > 1  → amplía puntos positivos  (e.g. 1.30 = +30%)
--   < 1  → reduce penalización negativa (e.g. 0.50 = mitad de la penalización)
-- Efecto 'suma': ValorEfecto puntos planos adicionales por cada ocurrencia
--
-- Estadistica: nombre exacto de la columna en la tabla Estadisticas
--   Posibles valores: Goles, Asistencias, Disparos, DisparosPorteria,
--   PasesCompletados, PasesProgresivos, Entradas, Intercepciones, Bloqueos,
--   AccionesCreadasDeGol, AccionesCreadasDeTiro, Minutos, Controles,
--   ConduccionesProgresivas, Toques, EntradasConExito, EntradasOfensivas,
--   TirosPenalti, TarjetasAmarillas, TarjetasRojas

INSERT INTO `Objetos`
  (`Nombre`, `Precio`, `Descripcion`, `Tipo`, `Efecto`, `ValorEfecto`, `Estadistica`, `Rareza`)
VALUES

-- ───────────── GOLES (8 objetos — stat más popular) ─────────────
('Tobillera del Artillero',   250, '+1 pto adicional por cada gol marcado. Para los finalizadores instintivos.',                                            'Botas',    'suma',          1.0,  'Goles', 'Comun'),
('Espinillera de Gol',        300, 'Multiplica x1.15 los puntos por goles marcados. El primer paso hacia la gloria.',                                       'Botas',    'multiplicador', 1.15, 'Goles', 'Comun'),
('Botines Predator',          750, '+2 ptos adicionales por cada gol. El botín de los delanteros más letales.',                                             'Botas',    'suma',          2.0,  'Goles', 'Rara'),
('Cintillo del Goleador',     800, 'Multiplica x1.30 los puntos por goles marcados. Para los referentes del ataque.',                                       'Cintillo', 'multiplicador', 1.30, 'Goles', 'Rara'),
('Bota de Oro del Crack',    2200, '+4 ptos adicionales por cada gol marcado. Para los depredadores del área rival.',                                       'Botas',    'suma',          4.0,  'Goles', 'Epica'),
('Botines del Depredador',   2500, 'Multiplica x1.55 los puntos por goles marcados. El instinto de matar en el área.',                                      'Botas',    'multiplicador', 1.55, 'Goles', 'Epica'),
('La Reliquia del 9',        6500, '+8 ptos adicionales por cada gol. Inscrita con los nombres de los mejores delanteros de la historia.',                  'Botas',    'suma',          8.0,  'Goles', 'Legendaria'),
('Corona del Pichichi',      7500, 'Multiplica x1.90 los puntos por goles marcados. Solo los mejores artilleros de la historia la merecen.',                'Corona',   'multiplicador', 1.90, 'Goles', 'Legendaria'),

-- ───────────── ASISTENCIAS (4 objetos — muy popular) ─────────────
('Brazalete del Pasador',     250, '+1 pto adicional por cada asistencia. Mejora la visión de juego del portador.',                                         'Brazalete','suma',          1.0,  'Asistencias', 'Comun'),
('Guante del Creador',        700, '+2 ptos adicionales por cada asistencia. El pase siempre encuentra al compañero.',                                      'Guantes',  'suma',          2.0,  'Asistencias', 'Rara'),
('Capa del Maestro Asistidor',2200,'+4 ptos adicionales por cada asistencia. Los grandes creadores de juego la llevan.',                                    'Capa',     'suma',          4.0,  'Asistencias', 'Epica'),
('El Bastón del Maestro',    6000, '+7 ptos adicionales por cada asistencia. La visión de juego de una leyenda viviente.',                                  'Capa',     'suma',          7.0,  'Asistencias', 'Legendaria'),

-- ───────────── DISPAROS (4 objetos) ─────────────
('Rótula Técnica',            250, 'Multiplica x1.15 los puntos por disparos realizados. El primer disparo siempre cuenta.',                                'Botas',    'multiplicador', 1.15, 'Disparos', 'Comun'),
('Muñequera del Tirador',     750, 'Multiplica x1.30 los puntos por disparos. Estabiliza el cuerpo en el momento del tiro.',                                'Brazalete','multiplicador', 1.30, 'Disparos', 'Rara'),
('Cañón de Precisión',       2200, 'Multiplica x1.55 los puntos por disparos. Solo los mejores tiradores dominan su potencia.',                             'Balón',    'multiplicador', 1.55, 'Disparos', 'Epica'),
('El Rifle del Francotirador',6000,'Multiplica x1.85 los puntos por disparos. Precisión legendaria desde cualquier ángulo del campo.',                      'Balón',    'multiplicador', 1.85, 'Disparos', 'Legendaria'),

-- ───────────── DISPAROS A PORTERÍA (4 objetos) ─────────────
('Visor del Delantero',       300, 'Multiplica x1.15 los puntos por disparos a portería. El objetivo siempre en el punto de mira.',                         'Lentes',   'multiplicador', 1.15, 'DisparosPorteria', 'Comun'),
('Lentes de Francotirador',   800, 'Multiplica x1.30 los puntos por disparos a portería. El portero nunca sabe por dónde viene.',                           'Lentes',   'multiplicador', 1.30, 'DisparosPorteria', 'Rara'),
('Ojo del Halcón',           2500, 'Multiplica x1.55 los puntos por disparos a portería. Como el ave, detecta el hueco perfecto.',                          'Lentes',   'multiplicador', 1.55, 'DisparosPorteria', 'Epica'),
('Retícula del Maestro',     6500, 'Multiplica x1.85 los puntos por disparos a portería. La portería no tiene secretos para él.',                           'Lentes',   'multiplicador', 1.85, 'DisparosPorteria', 'Legendaria'),

-- ───────────── PASES COMPLETADOS (4 objetos — popular) ─────────────
('Cintillo del Pasador',      250, 'Multiplica x1.15 los puntos por pases completados. La cabeza siempre en el juego.',                                     'Cintillo', 'multiplicador', 1.15, 'PasesCompletados', 'Comun'),
('Brazalete del Distribuidor',700, 'Multiplica x1.30 los puntos por pases completados. El motor que mueve al equipo.',                                      'Brazalete','multiplicador', 1.30, 'PasesCompletados', 'Rara'),
('Manos del Metrónomo',      2000, 'Multiplica x1.55 los puntos por pases completados. La precisión del reloj suizo.',                                      'Guantes',  'multiplicador', 1.55, 'PasesCompletados', 'Epica'),
('El Metrónomo',             5500, 'Multiplica x1.85 los puntos por pases completados. Controla el ritmo de todo el equipo.',                               'Cintillo', 'multiplicador', 1.85, 'PasesCompletados', 'Legendaria'),

-- ───────────── PASES PROGRESIVOS (4 objetos) ─────────────
('Brújula Táctica',           300, 'Multiplica x1.15 los puntos por pases progresivos. Siempre sabe hacia dónde avanzar.',                                  'Cintillo', 'multiplicador', 1.15, 'PasesProgresivos', 'Comun'),
('GPS del Mediocampista',     800, 'Multiplica x1.30 los puntos por pases progresivos. Siempre encuentra el espacio libre.',                                'Cintillo', 'multiplicador', 1.30, 'PasesProgresivos', 'Rara'),
('Radar del Mediocampista',  2500, 'Multiplica x1.55 los puntos por pases progresivos. Ve el campo como ningún otro jugador.',                              'Cintillo', 'multiplicador', 1.55, 'PasesProgresivos', 'Epica'),
('El Oráculo del Pase',      6500, 'Multiplica x1.85 los puntos por pases progresivos. El futuro del juego ya lo conoce de antemano.',                      'Capa',     'multiplicador', 1.85, 'PasesProgresivos', 'Legendaria'),

-- ───────────── ENTRADAS (4 objetos — popular defensas) ─────────────
('Rodillera del Defensor',    250, 'Multiplica x1.15 los puntos por entradas realizadas. Protege y ataca en igual medida.',                                 'Armadura', 'multiplicador', 1.15, 'Entradas', 'Comun'),
('Armadura del Stopper',      700, 'Multiplica x1.30 los puntos por entradas. El muro inamovible del centro de la defensa.',                                'Armadura', 'multiplicador', 1.30, 'Entradas', 'Rara'),
('Escudo del Defensor',      2000, 'Multiplica x1.55 los puntos por entradas. La defensa es un arte, y él es el artista.',                                  'Escudo',   'multiplicador', 1.55, 'Entradas', 'Epica'),
('La Muralla',               5500, 'Multiplica x1.85 los puntos por entradas. Nadie pasa por su zona sin pagar el precio.',                                 'Escudo',   'multiplicador', 1.85, 'Entradas', 'Legendaria'),

-- ───────────── INTERCEPCIONES (4 objetos) ─────────────
('Manoplas del Interceptor',  300, 'Multiplica x1.15 los puntos por intercepciones. Siempre en el lugar correcto en el momento preciso.',                   'Guantes',  'multiplicador', 1.15, 'Intercepciones', 'Comun'),
('Radar Defensivo',           800, 'Multiplica x1.30 los puntos por intercepciones. Anticipa cada pase del equipo rival.',                                  'Cintillo', 'multiplicador', 1.30, 'Intercepciones', 'Rara'),
('Visión de Lince',          2200, 'Multiplica x1.55 los puntos por intercepciones. Detecta el peligro antes de que ocurra.',                               'Lentes',   'multiplicador', 1.55, 'Intercepciones', 'Epica'),
('El Sexto Sentido',         6000, 'Multiplica x1.85 los puntos por intercepciones. Intuición sobrenatural en el campo de juego.',                          'Capa',     'multiplicador', 1.85, 'Intercepciones', 'Legendaria'),

-- ───────────── BLOQUEOS (4 objetos) ─────────────
('Escudo de Entrenamiento',   250, 'Multiplica x1.15 los puntos por bloqueos realizados. La primera línea de defensa del equipo.',                          'Escudo',   'multiplicador', 1.15, 'Bloqueos', 'Comun'),
('Escudo de Batalla',         700, 'Multiplica x1.28 los puntos por bloqueos. Probado en mil batallas tácticas.',                                           'Escudo',   'multiplicador', 1.28, 'Bloqueos', 'Rara'),
('Égida del Defensor',       2000, 'Multiplica x1.50 los puntos por bloqueos. Inspirado en los escudos de los guerreros griegos.',                          'Escudo',   'multiplicador', 1.50, 'Bloqueos', 'Epica'),
('La Fortaleza Inexpugnable',5500, 'Multiplica x1.80 los puntos por bloqueos. El jugador que nunca deja pasar el balón.',                                   'Escudo',   'multiplicador', 1.80, 'Bloqueos', 'Legendaria'),

-- ───────────── ACCIONES CREADAS DE GOL (4 objetos) ─────────────
('Visión de Juego Básica',    350, 'Multiplica x1.15 los puntos por acciones que crean ocasiones de gol. El instinto de crear peligro.',                    'Cintillo', 'multiplicador', 1.15, 'AccionesCreadasDeGol', 'Comun'),
('Mente Táctica Avanzada',    950, 'Multiplica x1.30 los puntos por acciones que crean ocasiones de gol. Lee el juego mejor que nadie.',                    'Cintillo', 'multiplicador', 1.30, 'AccionesCreadasDeGol', 'Rara'),
('El Arquitecto del Gol',    2800, 'Multiplica x1.55 los puntos por acciones que crean gol. Diseña jugadas de ataque maestras de forma instintiva.',        'Capa',     'multiplicador', 1.55, 'AccionesCreadasDeGol', 'Epica'),
('El Cerebro del Equipo',    7500, 'Multiplica x1.90 los puntos por acciones que crean gol. La mente maestra que lo controla todo desde la sombra.',        'Capa',     'multiplicador', 1.90, 'AccionesCreadasDeGol', 'Legendaria'),

-- ───────────── MINUTOS (4 objetos — universal) ─────────────
('Botella de Agua',           200, 'Multiplica x1.10 los puntos obtenidos por minutos jugados. Hidratación básica pero efectiva.',                          'Bidón',    'multiplicador', 1.10, 'Minutos', 'Comun'),
('Bidón Energético Pro',      600, 'Multiplica x1.22 los puntos por minutos jugados. Fórmula avanzada de recuperación física.',                             'Bidón',    'multiplicador', 1.22, 'Minutos', 'Rara'),
('Suplemento de Élite',      1800, 'Multiplica x1.42 los puntos por minutos jugados. Los suplementos de los atletas olímpicos.',                            'Bidón',    'multiplicador', 1.42, 'Minutos', 'Epica'),
('Néctar de los Dioses',     5500, 'Multiplica x1.70 los puntos por minutos jugados. La bebida que da vida eterna a las piernas.',                          'Bidón',    'multiplicador', 1.70, 'Minutos', 'Legendaria'),

-- ───────────── CONTROLES (4 objetos) ─────────────
('Vendas del Técnico',        200, 'Multiplica x1.12 los puntos por controles del balón. El toque perfecto empieza en los pies.',                           'Guantes',  'multiplicador', 1.12, 'Controles', 'Comun'),
('Guantes de Control',        650, 'Multiplica x1.28 los puntos por controles del balón. El esférico nunca se le escapa al portador.',                      'Guantes',  'multiplicador', 1.28, 'Controles', 'Rara'),
('Manos de Seda',            1800, 'Multiplica x1.48 los puntos por controles del balón. Una técnica exquisita para dominar el esférico.',                  'Guantes',  'multiplicador', 1.48, 'Controles', 'Epica'),
('Guantes del Mago',         5000, 'Multiplica x1.75 los puntos por controles del balón. El esférico hace exactamente lo que él desea.',                    'Guantes',  'multiplicador', 1.75, 'Controles', 'Legendaria'),

-- ───────────── CONDUCCIONES PROGRESIVAS (4 objetos) ─────────────
('Zapatillas de Velocidad',   300, 'Multiplica x1.15 los puntos por conducciones progresivas hacia la portería rival.',                                     'Botas',    'multiplicador', 1.15, 'ConduccionesProgresivas', 'Comun'),
('Botines de Sprint',         800, 'Multiplica x1.30 los puntos por conducciones progresivas. Diseñados para el contraataque letal.',                       'Botas',    'multiplicador', 1.30, 'ConduccionesProgresivas', 'Rara'),
('Alas de Mercurio',         2500, 'Multiplica x1.55 los puntos por conducciones progresivas. La velocidad de un dios del olimpo.',                         'Botas',    'multiplicador', 1.55, 'ConduccionesProgresivas', 'Epica'),
('Botas del Viento',         6500, 'Multiplica x1.85 los puntos por conducciones progresivas. Nadie puede seguirle el ritmo en ningún estadio.',            'Botas',    'multiplicador', 1.85, 'ConduccionesProgresivas', 'Legendaria'),

-- ───────────── ACCIONES CREADAS DE TIRO (4 objetos) ─────────────
('Pin Táctico',               250, 'Multiplica x1.12 los puntos por acciones que generan oportunidades de tiro. Pequeño detalle, gran impacto.',            'Cintillo', 'multiplicador', 1.12, 'AccionesCreadasDeTiro', 'Comun'),
('Silbato del Estratega',     700, 'Multiplica x1.28 los puntos por acciones que generan tiros. Genera caos en la defensa rival.',                          'Cintillo', 'multiplicador', 1.28, 'AccionesCreadasDeTiro', 'Rara'),
('El Detonador',             2000, 'Multiplica x1.50 los puntos por acciones que generan tiros. Explosivo en cada jugada ofensiva del partido.',            'Balón',    'multiplicador', 1.50, 'AccionesCreadasDeTiro', 'Epica'),
('La Chispa del Genio',      5500, 'Multiplica x1.78 los puntos por acciones que generan tiros. Improvisa lo que nadie más ve como posible.',               'Capa',     'multiplicador', 1.78, 'AccionesCreadasDeTiro', 'Legendaria'),

-- ───────────── TOQUES (4 objetos) ─────────────
('Mediasuela Técnica',        200, 'Multiplica x1.12 los puntos por toques del balón. El esférico fluye de forma natural por sus pies.',                    'Botas',    'multiplicador', 1.12, 'Toques', 'Comun'),
('Plantilla de Caucho',       600, 'Multiplica x1.25 los puntos por toques del balón. Agarre perfecto en cualquier superficie de juego.',                   'Botas',    'multiplicador', 1.25, 'Toques', 'Rara'),
('Suela de Carbono',         1800, 'Multiplica x1.45 los puntos por toques del balón. Tecnología de última generación al servicio del juego.',              'Botas',    'multiplicador', 1.45, 'Toques', 'Epica'),
('La Suela del Maestro',     5000, 'Multiplica x1.72 los puntos por toques del balón. Cada toque es una obra de arte en movimiento.',                       'Botas',    'multiplicador', 1.72, 'Toques', 'Legendaria'),

-- ───────────── ENTRADAS CON ÉXITO (4 objetos) ─────────────
('Casco Defensivo Básico',    300, 'Multiplica x1.15 los puntos por entradas con éxito. La base de todo buen defensor.',                                    'Armadura', 'multiplicador', 1.15, 'EntradasConExito', 'Comun'),
('Armadura Reforzada',        800, 'Multiplica x1.30 los puntos por entradas con éxito. El defensor perfecto no falla las entradas.',                       'Armadura', 'multiplicador', 1.30, 'EntradasConExito', 'Rara'),
('Armadura de Titán',        2500, 'Multiplica x1.55 los puntos por entradas con éxito. Un defensor de proporciones míticas.',                              'Armadura', 'multiplicador', 1.55, 'EntradasConExito', 'Epica'),
('La Armadura del Guerrero', 6500, 'Multiplica x1.85 los puntos por entradas con éxito. El guerrero que nunca cede ni un centímetro de terreno.',           'Armadura', 'multiplicador', 1.85, 'EntradasConExito', 'Legendaria'),

-- ───────────── ENTRADAS OFENSIVAS (4 objetos) ─────────────
('Coderas del Atacante',      300, 'Multiplica x1.15 los puntos por entradas ofensivas en campo contrario. La presión alta comienza aquí.',                 'Armadura', 'multiplicador', 1.15, 'EntradasOfensivas', 'Comun'),
('Espolones Tácticos',        800, 'Multiplica x1.30 los puntos por entradas ofensivas. La presión alta convertida en arte y destreza.',                    'Botas',    'multiplicador', 1.30, 'EntradasOfensivas', 'Rara'),
('Carga de Élite',           2200, 'Multiplica x1.55 los puntos por entradas ofensivas. La intensidad del pressing moderno en estado puro.',                'Armadura', 'multiplicador', 1.55, 'EntradasOfensivas', 'Epica'),
('Fuerza del Toro',          5500, 'Multiplica x1.85 los puntos por entradas ofensivas. La fuerza bruta al servicio de la táctica más efectiva.',           'Armadura', 'multiplicador', 1.85, 'EntradasOfensivas', 'Legendaria'),

-- ───────────── TIROS DE PENALTI (3 objetos, desde Rara) ─────────────
('El Punto Blanco',          1000, '+3 ptos adicionales por cada penalti marcado. Solo para los más fríos bajo presión extrema.',                           'Balón',    'suma',          3.0,  'TirosPenalti', 'Rara'),
('Ritual del Penalti',       3000, '+5 ptos adicionales por cada penalti marcado. El proceso mental de los grandes especialistas.',                          'Balón',    'suma',          5.0,  'TirosPenalti', 'Epica'),
('Botines del Verdugo',      8000, '+10 ptos adicionales por cada penalti marcado. Los nervios no existen para él. El frío es su hogar.',                   'Botas',    'suma',          10.0, 'TirosPenalti', 'Legendaria'),

-- ───────────── TARJETAS AMARILLAS — reducen penalización (3 objetos) ─────────────
-- ValorEfecto < 1: multiplica la penalización → ej. 0.75 convierte -3 pts en -2.25 pts
('Cintillo del Fair Play',    900, 'Reduce al 75% la penalización por tarjeta amarilla (-3 pts → -2.25 pts). El juego limpio recompensado.',                 'Cintillo', 'multiplicador', 0.75, 'TarjetasAmarillas', 'Rara'),
('Brazalete Diplomático',    2500, 'Reduce al 50% la penalización por tarjeta amarilla (-3 pts → -1.50 pts). El negociador del campo.',                      'Brazalete','multiplicador', 0.50, 'TarjetasAmarillas', 'Epica'),
('El Escudo de la Inocencia',7000, 'Reduce al 20% la penalización por tarjeta amarilla (-3 pts → -0.60 pts). Casi inmune a las tarjetas.',                   'Escudo',   'multiplicador', 0.20, 'TarjetasAmarillas', 'Legendaria'),

-- ───────────── TARJETAS ROJAS — reducen penalización (2 objetos) ─────────────
-- ValorEfecto < 1: multiplica la penalización → ej. 0.50 convierte -5 pts en -2.50 pts
('Escudo Jurídico',          4500, 'Reduce al 50% la penalización por tarjeta roja (-5 pts → -2.50 pts). El abogado defensor del campo.',                   'Escudo',   'multiplicador', 0.50, 'TarjetasRojas', 'Epica'),
('Inmunidad Divina',         9500, 'Reduce al 10% la penalización por tarjeta roja (-5 pts → -0.50 pts). Los dioses del fútbol nunca son expulsados.',       'Capa',     'multiplicador', 0.10, 'TarjetasRojas', 'Legendaria');

-- ============================================================
-- NOTA IMPORTANTE: cambios de código necesarios tras esta migración
-- ============================================================
-- 1. src/app/api/jornada/[id]/calcular/route.ts
--    El cálculo actual aplica ValorEfecto al total de puntos del jugador.
--    Con la nueva columna Estadistica, debe aplicarse solo a los puntos
--    de esa estadística concreta.
--    Estrategia recomendada:
--      a) Calcular sub-puntos por estadística antes de sumar el total.
--      b) Multiplicar/sumar con ValorEfecto según Efecto y Estadistica.
--      c) Sumar todos los sub-puntos para obtener la puntuación final.
--
-- 2. src/lib/packs.ts / src/app/api/sobres/abrir/route.ts
--    Con Objetos.Rareza fija, al abrir un sobre:
--      a) Sortear la rareza (Comun/Rara/Epica/Legendaria).
--      b) SELECT * FROM Objetos WHERE Rareza = ? ORDER BY RAND() LIMIT 1
--      c) Insertar en CartaObjeto con esa misma Rareza.
-- ============================================================
