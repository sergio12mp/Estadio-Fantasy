# =============================================================================
# descargarImagenes.r
# Descarga las fotos de cara de los jugadores de La Liga desde FBref
# y las guarda en public/images/jugadores/{idJugador}.jpg
#
# Uso:
#   Rscript descargarImagenes.r <ruta_csv_stats> <ruta_csv_jugadores_db> <ruta_output>
#
# Argumentos:
#   csv_stats        : CSV de estadísticas ya descargado (tiene columnas Player y PlayerURL)
#   csv_jugadores_db : CSV exportado desde la DB con columnas idJugador y Nombre
#                      Exportar con: SELECT idJugador, Nombre FROM Jugador
#   ruta_output      : carpeta destino (ej: ../public/images/jugadores)
#
# Si no se pasan argumentos, intenta usar valores por defecto (ver abajo).
# =============================================================================

# install.packages("stringdist")   # para matching de nombres aproximado
library(dplyr)
library(stringr)
library(stringdist)

# ------------------------------------------------------------
# Argumentos
# ------------------------------------------------------------
args <- commandArgs(trailingOnly = TRUE)

csv_stats        <- if (length(args) >= 1) args[1] else "partidosAdvanceSummaryJornada1.csv"
csv_jugadores_db <- if (length(args) >= 2) args[2] else "jugadores_db.csv"
ruta_output      <- if (length(args) >= 3) args[3] else "../public/images/jugadores"

cat("=== Descarga de imágenes de jugadores ===\n")
cat(paste0("  CSV stats:         ", csv_stats, "\n"))
cat(paste0("  CSV jugadores DB:  ", csv_jugadores_db, "\n"))
cat(paste0("  Carpeta destino:   ", ruta_output, "\n\n"))

# ------------------------------------------------------------
# Leer datos
# ------------------------------------------------------------
if (!file.exists(csv_stats)) {
  stop(paste0("No se encuentra el CSV de estadísticas: ", csv_stats))
}
if (!file.exists(csv_jugadores_db)) {
  stop(paste0("No se encuentra el CSV de jugadores de la DB: ", csv_jugadores_db,
              "\nExporta con: SELECT idJugador, Nombre FROM Jugador"))
}

stats_df <- read.csv(csv_stats, stringsAsFactors = FALSE)
db_df    <- read.csv(csv_jugadores_db, stringsAsFactors = FALSE)

# Columnas necesarias en stats_df
# Acepta tanto "PlayerURL" como "Player_Href" (worldfootballR puede usar cualquiera)
url_col <- if ("PlayerURL" %in% names(stats_df)) "PlayerURL" else if ("Player_Href" %in% names(stats_df)) "Player_Href" else NULL
if (is.null(url_col)) stop("El CSV de stats no tiene columna 'PlayerURL' ni 'Player_Href'")
if (!"Player" %in% names(stats_df)) stop("El CSV de stats no tiene columna 'Player'")

# Columnas necesarias en db_df
if (!"idJugador" %in% names(db_df)) stop("El CSV de la DB no tiene columna 'idJugador'")
if (!"Nombre"    %in% names(db_df)) stop("El CSV de la DB no tiene columna 'Nombre'")

# ------------------------------------------------------------
# Extraer FBref ID desde la URL del jugador
# URL ejemplo: https://fbref.com/en/players/abcdef12/Lionel-Messi
# FBref ID    = "abcdef12"
# Headshot    = https://fbref.com/req/202302030/images/headshots/abcdef12_2022.jpg
# ------------------------------------------------------------
jugadores_fbref <- stats_df %>%
  rename(PlayerURL = all_of(url_col)) %>%
  filter(!is.na(PlayerURL), PlayerURL != "") %>%
  distinct(Player, PlayerURL) %>%
  mutate(
    fbref_id = str_extract(PlayerURL, "/players/([a-z0-9]+)/", group = 1),
    headshot_url = paste0(
      "https://fbref.com/req/202302030/images/headshots/",
      fbref_id, "_2022.jpg"
    )
  ) %>%
  filter(!is.na(fbref_id))

cat(paste0("Jugadores únicos encontrados en CSV stats: ", nrow(jugadores_fbref), "\n"))

# ------------------------------------------------------------
# Normalizar nombres para el matching
# Eliminar acentos, mayúsculas, puntos, guiones
# ------------------------------------------------------------
normalizar <- function(x) {
  x <- tolower(x)
  x <- chartr("áéíóúàèìòùâêîôûäëïöüñ", "aeiouaeiouaeiouaeioun", x)
  x <- str_replace_all(x, "[^a-z0-9 ]", "")
  x <- str_squish(x)
  x
}

jugadores_fbref <- jugadores_fbref %>%
  mutate(nombre_norm = normalizar(Player))

db_df <- db_df %>%
  mutate(nombre_norm = normalizar(Nombre))

# ------------------------------------------------------------
# Matching: primero exacto, luego aproximado (distancia Jaro-Winkler)
# ------------------------------------------------------------
cat("Cruzando nombres con la base de datos...\n")

# Join exacto
matched_exact <- inner_join(jugadores_fbref, db_df, by = "nombre_norm")

# Jugadores del CSV no encontrados exactamente
no_matched_fbref <- jugadores_fbref %>%
  filter(!nombre_norm %in% matched_exact$nombre_norm)

# Jugadores de la DB no encontrados exactamente
no_matched_db <- db_df %>%
  filter(!nombre_norm %in% matched_exact$nombre_norm)

# Matching aproximado para los no encontrados
if (nrow(no_matched_fbref) > 0 && nrow(no_matched_db) > 0) {
  dist_matrix <- stringdistmatrix(no_matched_fbref$nombre_norm,
                                   no_matched_db$nombre_norm,
                                   method = "jw")
  best_match  <- apply(dist_matrix, 1, which.min)
  best_dist   <- apply(dist_matrix, 1, min)

  # Solo aceptar matches con distancia < 0.15 (muy similar)
  THRESHOLD <- 0.15
  matched_approx <- data.frame(
    Player       = no_matched_fbref$Player,
    fbref_id     = no_matched_fbref$fbref_id,
    headshot_url = no_matched_fbref$headshot_url,
    nombre_norm  = no_matched_fbref$nombre_norm,
    idJugador    = no_matched_db$idJugador[best_match],
    Nombre       = no_matched_db$Nombre[best_match],
    distancia    = best_dist,
    stringsAsFactors = FALSE
  ) %>% filter(distancia < THRESHOLD)

  cat(paste0("  Match exacto:      ", nrow(matched_exact), " jugadores\n"))
  cat(paste0("  Match aproximado:  ", nrow(matched_approx), " jugadores\n"))

  # Combinar
  todos_matched <- bind_rows(
    matched_exact %>% select(Player, fbref_id, headshot_url, idJugador, Nombre),
    matched_approx %>% select(Player, fbref_id, headshot_url, idJugador, Nombre)
  )
} else {
  cat(paste0("  Match exacto:      ", nrow(matched_exact), " jugadores\n"))
  todos_matched <- matched_exact %>% select(Player, fbref_id, headshot_url, idJugador, Nombre)
}

sin_imagen <- jugadores_fbref %>%
  filter(!fbref_id %in% todos_matched$fbref_id)

if (nrow(sin_imagen) > 0) {
  cat(paste0("  Sin match en DB:   ", nrow(sin_imagen), " jugadores\n"))
  cat("  Jugadores sin match:\n")
  for (n in sin_imagen$Player) cat(paste0("    - ", n, "\n"))
}

cat(paste0("\nTotal a descargar: ", nrow(todos_matched), " imágenes\n\n"))

# ------------------------------------------------------------
# Descargar imágenes
# ------------------------------------------------------------
dir.create(ruta_output, recursive = TRUE, showWarnings = FALSE)

# Simular navegador para evitar bloqueo de FBref
options(HTTPUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

descargados  <- 0
fallidos     <- 0
ya_existian  <- 0

for (i in seq_len(nrow(todos_matched))) {
  row      <- todos_matched[i, ]
  destino  <- file.path(ruta_output, paste0(row$idJugador, ".jpg"))

  if (file.exists(destino)) {
    ya_existian <- ya_existian + 1
    next
  }

  tryCatch({
    Sys.sleep(0.5)  # respetar rate limit de FBref
    res <- tryCatch(
      download.file(row$headshot_url, destino, mode = "wb", quiet = TRUE, method = "libcurl"),
      error = function(e) -1
    )

    if (res == 0 && file.size(destino) > 1000) {
      descargados <- descargados + 1
      cat(paste0("[", i, "/", nrow(todos_matched), "] ✓ ", row$Nombre, "\n"))
    } else {
      # La imagen no existe en FBref (algunos jugadores no tienen foto)
      if (file.exists(destino)) file.remove(destino)
      fallidos <- fallidos + 1
      cat(paste0("[", i, "/", nrow(todos_matched), "] ✗ Sin foto: ", row$Nombre, "\n"))
    }
  }, error = function(e) {
    fallidos <<- fallidos + 1
    cat(paste0("[", i, "/", nrow(todos_matched), "] ERROR: ", row$Nombre, " — ", e$message, "\n"))
  })
}

# ------------------------------------------------------------
# Resumen
# ------------------------------------------------------------
cat(paste0("\n=== Completado ===\n"))
cat(paste0("  Descargadas:   ", descargados, "\n"))
cat(paste0("  Ya existían:   ", ya_existian, "\n"))
cat(paste0("  Sin foto:      ", fallidos, "\n"))
cat(paste0("  Guardadas en:  ", normalizePath(ruta_output), "\n"))
