# To get the latest version then you can run:
# GitHub link - https://github.com/JaseZiv/worldfootballR
# May require downloading RTools.  If so go download the latest version here: https://cran.r-project.org/bin/windows/Rtools/

# install.packages("devtools")
# devtools::install_github("JaseZiv/worldfootballR")
library(worldfootballR)
# install.packages("openxlsx")
 library(openxlsx)

# # If not already installed, install dplyr
# # dplyr will aid in quick viewing of data and filtering table data

# install.packages("dplyr")
 library(dplyr)

-------------------------------------------------------------------------
            

args <- commandArgs(trailingOnly = TRUE)
jornada <- as.numeric(args[1])

laliga_match_urls <- fb_match_urls(country = "ESP", gender = "M", season_end_year = 2023, tier = "1st")
urls_jornada <- laliga_match_urls[laliga_match_urls$RoundNumber == jornada, ]

jornada_df <- resultados %>% filter(Round == jornada)
urls_jornada <- jornada_df$MatchURL


partidos_advance_summary <- fb_advanced_match_stats(match_url = urls_jornada$MatchURL,
                                                 stat_type ="summary",
                                                 team_or_player = "player",
                                                 time_pause = 3)

write.csv(partidos_advance_summary, paste0("partidosAdvanceSummaryJornada", jornada, ".csv"), row.names = FALSE)
cat(paste("Jornada", jornada, "finalizada y guardada en partidosAdvanceSummaryJornada", jornada, ".csv\n")) 
