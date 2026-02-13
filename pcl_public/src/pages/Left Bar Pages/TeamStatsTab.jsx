// src/components/TeamStatsTab.jsx
import { useMemo, useState } from "react"
import "../../styles/Left Bar Pages/TeamStatsTab.css"

/* =========================
   TEAM DATA (demo)
   ========================= */
const teamsData = [
  {
    teamId: "t1",
    players: ["BLAZT", "SAGE", "ECHO"],
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/AG%20GLOBAL.png",
    kills: 410,
    mapWins: 32,
    tourneyWins: 3,
    avgPlacement: 2.1,
  },
  {
    teamId: "t2",
    players: ["SKULLFACE", "ECHO", "SAGE"],
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/ESC.png",
    kills: 395,
    mapWins: 29,
    tourneyWins: 2,
    avgPlacement: 3.4,
  },
  {
    teamId: "t3",
    players: ["BLAZT", "SKULLFACE", "SAGE"],
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/EKLETYC.png",
    kills: 372,
    mapWins: 27,
    tourneyWins: 1,
    avgPlacement: 4.0,
  },
]

function TeamStatsTab() {
  const [search, setSearch] = useState("")

  const rankedColumns = useMemo(() => {
    const desc = (key) =>
      [...teamsData]
        .sort((a, b) => b[key] - a[key])
        .map((t) => ({ teamId: t.teamId, value: t[key] }))

    const asc = (key) =>
      [...teamsData]
        .sort((a, b) => a[key] - b[key])
        .map((t) => ({ teamId: t.teamId, value: t[key] }))

    return {
      kills: desc("kills"),
      mapWins: desc("mapWins"),
      tourneyWins: desc("tourneyWins"),
      avgPlacement: asc("avgPlacement"),
    }
  }, [])

  const filteredColumns = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rankedColumns

    const matches = new Set(
      teamsData
        .filter((t) =>
          t.players.some((p) => p.toLowerCase().includes(q))
        )
        .map((t) => t.teamId)
    )

    const filterRows = (rows) => rows.filter((r) => matches.has(r.teamId))

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
      rows.forEach((r, i) => map.set(r.teamId, i + 1))
      return map
    }

    return {
      kills: build(rankedColumns.kills),
      mapWins: build(rankedColumns.mapWins),
      tourneyWins: build(rankedColumns.tourneyWins),
      avgPlacement: build(rankedColumns.avgPlacement),
    }
  }, [rankedColumns])

  const renderColumn = (title, rows, statKey) => {
    const ranks = rankByStat[statKey]

    return (
      <div className="TeamStatsTab__colInner">
        <h3 className="TeamStatsTab__columnTitle">{title}</h3>

        <div className="TeamStatsTab__list">
          {rows.map((row) => {
            const team = teamsData.find((t) => t.teamId === row.teamId)
            const rank = ranks.get(row.teamId)
            const rankClass =
              rank <= 5 ? `TeamStatsTab__card--rank${rank}` : ""

            return (
              <div
                key={`${statKey}-${row.teamId}`}
                className={`TeamStatsTab__card ${rankClass}`}
              >
                <div className="TeamStatsTab__rank">{rank}</div>

                <img
                  className="TeamStatsTab__orgLogo"
                  src={team.orgLogo}
                  alt=""
                />

                <div className="TeamStatsTab__name">
                  {team.players.join(" | ")}
                </div>

                <div className="TeamStatsTab__value">
                  {statKey === "avgPlacement"
                    ? row.value.toFixed(2)
                    : row.value}
                </div>
              </div>
            )
          })}
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
          {renderColumn("Team Kills", filteredColumns.kills, "kills")}
        </div>

        <div className="TeamStatsTab__col">
          {renderColumn("Map Wins", filteredColumns.mapWins, "mapWins")}
        </div>

        <div className="TeamStatsTab__col">
          {renderColumn("Tourney Wins", filteredColumns.tourneyWins, "tourneyWins")}
        </div>

        <div className="TeamStatsTab__col">
          {renderColumn(
            "Average Placement",
            filteredColumns.avgPlacement,
            "avgPlacement"
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamStatsTab
