# Script para obtener estadísticas de La Liga incluyendo datos de porteros
# Requiere worldfootballR instalado desde GitHub:
#   install.packages("devtools")
#   devtools::install_github("JaseZiv/worldfootballR")

library(worldfootballR)
library(openxlsx)
library(dplyr)

# ------------------------------------------------------------
# Argumentos: Rscript obtenerDatosConPorteros.r <jornada>
# Ejemplo:    Rscript obtenerDatosConPorteros.r 10
# ------------------------------------------------------------
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 1) stop("Uso: Rscript obtenerDatosConPorteros.r <numero_jornada>")
jornada <- as.numeric(args[1])

# ------------------------------------------------------------
# 1. Obtener URLs de los partidos de la jornada
# ------------------------------------------------------------
cat(paste0("Obteniendo URLs de partidos de La Liga 2024-25 (jornada ", jornada, ")...\n"))

laliga_match_urls <- fb_match_urls(
  country    = "ESP",
  gender     = "M",
  season_end_year = 2025,
  tier       = "1st"
)

# fb_match_urls devuelve un data.frame; filtrar por la columna RoundNumber
urls_jornada <- laliga_match_urls[laliga_match_urls$RoundNumber == jornada, "MatchURL"]

if (length(urls_jornada) == 0) {
  stop(paste0("No se encontraron partidos para la jornada ", jornada,
              ". Comprueba que la jornada existe y que la temporada 2024-25 ya ha comenzado."))
}

cat(paste0("Partidos encontrados: ", length(urls_jornada), "\n"))

# ------------------------------------------------------------
# 2. Estadísticas generales (jugadores de campo y porteros)
#    stat_type = "summary" incluye: Goles, Asistencias, xG, Pases, etc.
# ------------------------------------------------------------
cat("Descargando estadísticas de resumen (summary)...\n")

summary_stats <- fb_advanced_match_stats(
  match_url      = urls_jornada,
  stat_type      = "summary",
  team_or_player = "player",
  time_pause     = 3
)

# ------------------------------------------------------------
# 3. Estadísticas de porteros
#    stat_type = "keeper" incluye: Paradas (Saves), SavePct,
#    Goles encajados (GA), Portería a cero (CS), PSxG, etc.
# ------------------------------------------------------------
cat("Descargando estadísticas de porteros (keeper)...\n")

keeper_stats <- fb_advanced_match_stats(
  match_url      = urls_jornada,
  stat_type      = "keeper",
  team_or_player = "player",
  time_pause     = 3
)

# ------------------------------------------------------------
# 4. Estadísticas avanzadas de porteros (keeper_adv)
#    Incluye: PSxG-GA (rendimiento vs expected), % paradas por zona, etc.
# ------------------------------------------------------------
cat("Descargando estadísticas avanzadas de porteros (keeper_adv)...\n")

keeper_adv_stats <- tryCatch(
  fb_advanced_match_stats(
    match_url      = urls_jornada,
    stat_type      = "keeper_adv",
    team_or_player = "player",
    time_pause     = 3
  ),
  error = function(e) {
    cat("AVISO: keeper_adv no disponible para estos partidos. Continuando sin ella.\n")
    NULL
  }
)

# ------------------------------------------------------------
# 5. Unir estadísticas de porteros en un único data.frame
# ------------------------------------------------------------

# Columnas clave para el join
join_keys <- c("MatchURL", "Team", "Player", "PlayerURL")

if (!is.null(keeper_adv_stats) && nrow(keeper_adv_stats) > 0) {
  # Evitar duplicar columnas presentes en ambos data.frames
  cols_adv_extra <- setdiff(names(keeper_adv_stats), c(join_keys, names(keeper_stats)))
  keeper_combined <- left_join(
    keeper_stats,
    keeper_adv_stats[, c(join_keys, cols_adv_extra), drop = FALSE],
    by = join_keys
  )
} else {
  keeper_combined <- keeper_stats
}

# ------------------------------------------------------------
# 6. Guardar archivos CSV
# ------------------------------------------------------------

# Archivo de jugadores de campo (summary de todos)
summary_file <- paste0("partidosAdvanceSummaryJornada", jornada, ".csv")
write.csv(summary_stats, summary_file, row.names = FALSE)
cat(paste0("Summary guardado en: ", summary_file, "\n"))

# Archivo específico de porteros
keeper_file <- paste0("partidosPorterosJornada", jornada, ".csv")
write.csv(keeper_combined, keeper_file, row.names = FALSE)
cat(paste0("Porteros guardados en: ", keeper_file, "\n"))

# ------------------------------------------------------------
# 7. Opcional: fichero Excel con ambas hojas
# ------------------------------------------------------------
excel_file <- paste0("estadisticasJornada", jornada, ".xlsx")
wb <- createWorkbook()
addWorksheet(wb, "Jugadores")
writeData(wb, "Jugadores", summary_stats)
addWorksheet(wb, "Porteros")
writeData(wb, "Porteros", keeper_combined)
saveWorkbook(wb, excel_file, overwrite = TRUE)
cat(paste0("Excel combinado guardado en: ", excel_file, "\n"))

cat(paste0("\nJornada ", jornada, " completada.\n"))
cat(paste0("  - Jugadores (summary): ", nrow(summary_stats), " filas\n"))
cat(paste0("  - Porteros (keeper):   ", nrow(keeper_combined), " filas\n"))
