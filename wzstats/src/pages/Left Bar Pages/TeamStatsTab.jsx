import { useEffect, useMemo, useState } from "react"
import { fetchRows } from "../../lib/supabaseRest"
import "../../styles/Left Bar Pages/TeamStatsTab.css"

const DEFAULT_TEAM_LOGO =
  "https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos/NONE.png"
const ORG_LOGO_BASE =
  "https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos"
const DISPLAY_LIMIT = 15

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()

const rosterKey = (players) =>
  players
    .map((player) => normalizeText(player))
    .filter(Boolean)
    .sort()
    .join("|")

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const sortDescending = (a, b) => b.value - a.value || a.name.localeCompare(b.name)

const sortAscending = (a, b) => a.value - b.value || a.name.localeCompare(b.name)

const mergeRowsById = (rows, sortFn) => {
  const merged = new Map()

  rows.forEach((row) => {
    const existing = merged.get(row.id)
    if (existing) {
      existing.value += row.value
      return
    }

    merged.set(row.id, { ...row })
  })

  return Array.from(merged.values()).sort(sortFn)
}

const averageRowsById = (rows) => {
  const merged = new Map()

  rows.forEach((row) => {
    const existing = merged.get(row.id)
    if (existing) {
      existing.total += row.value
      existing.count += 1
      return
    }

    merged.set(row.id, {
      row: { ...row },
      total: row.value,
      count: 1,
    })
  })

  return Array.from(merged.values())
    .map(({ row, total, count }) => ({
      ...row,
      value: total / count,
    }))
    .sort(sortAscending)
}

const getTeamLogo = (teamName) =>
  teamName ? `${ORG_LOGO_BASE}/${encodeURIComponent(teamName)}.png` : DEFAULT_TEAM_LOGO

function TeamStatsTab() {
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState({
    kills: DISPLAY_LIMIT,
    mapWins: DISPLAY_LIMIT,
    tourneyWins: DISPLAY_LIMIT,
    avgPlacement: DISPLAY_LIMIT,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rankedColumns, setRankedColumns] = useState({
    kills: [],
    mapWins: [],
    tourneyWins: [],
    avgPlacement: [],
  })

  useEffect(() => {
    let cancelled = false

    const loadTeamStats = async () => {
      setLoading(true)
      setError("")

      try {
        const [teamInfoRows, mapWinsRows, tourneyWinsRows, avgPlacementRows, totalKillsRows] =
          await Promise.all([
            fetchRows("team_info_view", {
              select: "updated_team_name,updated_player_1,updated_player_2,updated_player_3",
            }),
            fetchRows("team_map_wins", {
              select: "team_name,team_map_wins",
            }),
            fetchRows("team_tourney_wins", {
              select: "team_name,team_tourney_wins",
            }),
            fetchRows("team_avg_placement", {
              select: "team_name,team_avg_placement",
            }),
            fetchRows("team_total_kills", {
              select: "player_1,player_2,player_3,total_kills",
            }),
          ])

        const teamByName = new Map()
        const teamByRoster = new Map()

        ;(teamInfoRows || []).forEach((row) => {
          const teamName = String(row.updated_team_name || "").trim()
          const players = [row.updated_player_1, row.updated_player_2, row.updated_player_3]
            .filter(Boolean)
            .map((player) => String(player).trim())
          const displayPlayers = players.length ? players : [teamName || "Unknown Team"]

          if (teamName) {
            const nameKey = normalizeText(teamName)
            if (!teamByName.has(nameKey)) {
              teamByName.set(nameKey, {
                id: `team:${nameKey}`,
                name: teamName,
                players: displayPlayers,
                orgLogo: getTeamLogo(teamName),
              })
            }
          }

          const key = rosterKey(players)
          if (key && !teamByRoster.has(key)) {
            teamByRoster.set(key, {
              id: teamName ? `team:${normalizeText(teamName)}` : `roster:${key}`,
              name: teamName || displayPlayers.join(" | "),
              players: displayPlayers,
              orgLogo: getTeamLogo(teamName),
            })
          }
        })

        const buildRowFromTeamName = (teamName, value) => {
          const normalizedTeamName = normalizeText(teamName)
          const info = teamByName.get(normalizedTeamName)
          const fallbackName = String(teamName || "Unknown Team")
          const canonicalRosterKey = info ? rosterKey(info.players) : ""
          const canonicalId = canonicalRosterKey
            ? `roster:${canonicalRosterKey}`
            : info?.id || `team:${normalizedTeamName || fallbackName}`

          return {
            id: canonicalId,
            name: info?.name || fallbackName,
            players: info?.players || [fallbackName],
            orgLogo: info?.orgLogo || getTeamLogo(fallbackName),
            value: toNumber(value),
          }
        }

        const nextKills = mergeRowsById(
          (totalKillsRows || []).map((row) => {
            const players = [row.player_1, row.player_2, row.player_3]
              .filter(Boolean)
              .map((player) => String(player).trim())
            const key = rosterKey(players)
            const info = teamByRoster.get(key)
            return {
              id: `roster:${key}`,
              name: info?.name || players.join(" | ") || "Unknown Team",
              players: info?.players || players,
              orgLogo: info?.orgLogo || DEFAULT_TEAM_LOGO,
              value: toNumber(row.total_kills),
            }
          }),
          sortDescending
        )

        const nextMapWins = mergeRowsById(
          (mapWinsRows || []).map((row) => buildRowFromTeamName(row.team_name, row.team_map_wins)),
          sortDescending
        )

        const nextTourneyWins = mergeRowsById(
          (tourneyWinsRows || []).map((row) =>
            buildRowFromTeamName(row.team_name, row.team_tourney_wins)
          ),
          sortDescending
        )
        const totalTeamTourneyWins = nextTourneyWins.reduce(
          (sum, row) => sum + Number(row.value || 0),
          0
        )

        const nextAvgPlacement = averageRowsById(
          (avgPlacementRows || []).map((row) =>
            buildRowFromTeamName(row.team_name, row.team_avg_placement)
          )
        )

        if (!cancelled) {
          console.log("[TeamStatsTab] Total team tournament wins:", totalTeamTourneyWins)
          setRankedColumns({
            kills: nextKills,
            mapWins: nextMapWins,
            tourneyWins: nextTourneyWins,
            avgPlacement: nextAvgPlacement,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load team stats.")
          setRankedColumns({
            kills: [],
            mapWins: [],
            tourneyWins: [],
            avgPlacement: [],
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTeamStats()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredColumns = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rankedColumns

    const allRows = [
      ...rankedColumns.kills,
      ...rankedColumns.mapWins,
      ...rankedColumns.tourneyWins,
      ...rankedColumns.avgPlacement,
    ]

    const matches = new Set(
      allRows
        .filter((t) =>
          t.name.toLowerCase().includes(q) ||
          t.players.some((p) => p.toLowerCase().includes(q))
        )
        .map((t) => t.id)
    )

    const filterRows = (rows) => rows.filter((r) => matches.has(r.id))

    return {
      kills: filterRows(rankedColumns.kills),
      mapWins: filterRows(rankedColumns.mapWins),
      tourneyWins: filterRows(rankedColumns.tourneyWins),
      avgPlacement: filterRows(rankedColumns.avgPlacement),
    }
  }, [search, rankedColumns])

  const rankByStat = useMemo(() => {
    const build = (rows) => {
      const map = new Map()
      rows.forEach((r, i) => map.set(r.id, i + 1))
      return map
    }

    return {
      kills: build(rankedColumns.kills),
      mapWins: build(rankedColumns.mapWins),
      tourneyWins: build(rankedColumns.tourneyWins),
      avgPlacement: build(rankedColumns.avgPlacement),
    }
  }, [rankedColumns])

  const visibleColumns = useMemo(() => {
    const q = search.trim()
    const applyLimit = (rows, key) => {
      if (q) return rows
      return rows.slice(0, visibleCount[key])
    }

    return {
      kills: applyLimit(filteredColumns.kills, "kills"),
      mapWins: applyLimit(filteredColumns.mapWins, "mapWins"),
      tourneyWins: applyLimit(filteredColumns.tourneyWins, "tourneyWins"),
      avgPlacement: applyLimit(filteredColumns.avgPlacement, "avgPlacement"),
    }
  }, [filteredColumns, search, visibleCount])

  const renderColumn = (title, rows, visibleRows, statKey) => {
    const ranks = rankByStat[statKey]
    const showMore = !search.trim() && visibleRows.length < rows.length
    const showLess = !search.trim() && visibleCount[statKey] > DISPLAY_LIMIT

    return (
      <div className="TeamStatsTab__colInner">
        <h3 className="TeamStatsTab__columnTitle">{title}</h3>

        <div className="TeamStatsTab__list">
          {visibleRows.map((row) => {
            const rank = ranks.get(row.id)
            const rankClass =
              rank <= 5 ? `TeamStatsTab__card--rank${rank}` : ""

            return (
              <div
                key={`${statKey}-${row.id}`}
                className={`TeamStatsTab__card ${rankClass}`}
              >
                <div className="TeamStatsTab__rank">{rank}</div>

                <img
                  className="TeamStatsTab__orgLogo"
                  src={row.orgLogo || DEFAULT_TEAM_LOGO}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = DEFAULT_TEAM_LOGO
                  }}
                />

                <div className="TeamStatsTab__name">
                  {row.players.join(" | ")}
                </div>

                <div className="TeamStatsTab__value">
                  {statKey === "avgPlacement"
                    ? row.value.toFixed(2)
                    : row.value}
                </div>
              </div>
            )
          })}
          {!rows.length && (
            <div className="TeamStatsTab__card">
              <div className="TeamStatsTab__name">No teams found.</div>
            </div>
          )}
        </div>
        <div className="TeamStatsTab__actions">
          {showMore && (
            <button
              type="button"
              className="TeamStatsTab__actionButton"
              onClick={() =>
                setVisibleCount((prev) => ({
                  ...prev,
                  [statKey]: prev[statKey] + DISPLAY_LIMIT,
                }))
              }
            >
              Show more
            </button>
          )}
          {showLess && (
            <button
              type="button"
              className="TeamStatsTab__actionButton"
              onClick={() =>
                setVisibleCount((prev) => ({
                  ...prev,
                  [statKey]: DISPLAY_LIMIT,
                }))
              }
            >
              Show less
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="TeamStatsTab">
        <div className="TeamStatsTab__header">
          <h2 className="TeamStatsTab__title">Team Stats</h2>
        </div>
        <div className="TeamStatsTab__split">
          <div className="TeamStatsTab__col">
            <div className="TeamStatsTab__colInner">
              <div className="TeamStatsTab__card">
                <div className="TeamStatsTab__name">Loading team stats...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="TeamStatsTab">
        <div className="TeamStatsTab__header">
          <h2 className="TeamStatsTab__title">Team Stats</h2>
        </div>
        <div className="TeamStatsTab__split">
          <div className="TeamStatsTab__col">
            <div className="TeamStatsTab__colInner">
              <div className="TeamStatsTab__card">
                <div className="TeamStatsTab__name">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="TeamStatsTab">
      <div className="TeamStatsTab__header">
        <h2 className="TeamStatsTab__title">Team Stats</h2>

        <input
          className="TeamStatsTab__search"
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="TeamStatsTab__split">
        <div className="TeamStatsTab__col">
          {renderColumn("Team Kills", filteredColumns.kills, visibleColumns.kills, "kills")}
        </div>

        <div className="TeamStatsTab__col">
          {renderColumn("Map Wins", filteredColumns.mapWins, visibleColumns.mapWins, "mapWins")}
        </div>

        <div className="TeamStatsTab__col">
          {renderColumn(
            "Tourney Wins",
            filteredColumns.tourneyWins,
            visibleColumns.tourneyWins,
            "tourneyWins"
          )}
        </div>

        <div className="TeamStatsTab__col">
          {renderColumn(
            "Average Placement",
            filteredColumns.avgPlacement,
            visibleColumns.avgPlacement,
            "avgPlacement"
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamStatsTab
