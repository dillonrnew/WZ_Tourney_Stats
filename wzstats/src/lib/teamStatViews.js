import { fetchRows } from "./supabaseRest"

export const TEAM_KILLS_VIEW = {
  table: "team_kills",
  select: "team_name,player_1,player_2,player_3,team_kills",
  valueField: "team_kills",
}

export const MAP_WINS_VIEW = {
  table: "map_wins",
  select: "team_name,player_1,player_2,player_3,map_wins",
  valueField: "map_wins",
}

export const TOURNEY_WINS_VIEW = {
  table: "team_tourney_wins",
  select: "team_name,player_1,player_2,player_3,team_tourney_wins",
  valueField: "team_tourney_wins",
}

export const AVG_MAP_PLACEMENT_VIEW = {
  table: "avg_map_placement",
  select: "team_name,player_1,player_2,player_3,avg_map_placement",
  valueField: "avg_map_placement",
}

export const fetchTeamKillsView = () =>
  fetchRows(TEAM_KILLS_VIEW.table, { select: TEAM_KILLS_VIEW.select }).then((rows) => ({
    ...TEAM_KILLS_VIEW,
    rows,
  }))

export const fetchMapWinsView = () =>
  fetchRows(MAP_WINS_VIEW.table, { select: MAP_WINS_VIEW.select }).then((rows) => ({
    ...MAP_WINS_VIEW,
    rows,
  }))

export const fetchTourneyWinsView = () =>
  fetchRows(TOURNEY_WINS_VIEW.table, { select: TOURNEY_WINS_VIEW.select }).then((rows) => ({
    ...TOURNEY_WINS_VIEW,
    rows,
  }))

export const fetchAvgPlacementView = () =>
  fetchRows(AVG_MAP_PLACEMENT_VIEW.table, { select: AVG_MAP_PLACEMENT_VIEW.select }).then(
    (rows) => ({
      ...AVG_MAP_PLACEMENT_VIEW,
      rows,
    })
  )
