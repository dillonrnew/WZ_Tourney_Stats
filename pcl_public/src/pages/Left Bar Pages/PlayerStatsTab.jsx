// src/components/PlayerStatsTab.jsx
import { useMemo, useState } from "react"
import "../../styles/Left Bar Pages/PlayerStatsTab.css"

/* =========================
   HEADSHOT IMAGE HELPERS
   ========================= */
const BASE_IMAGE_URL =
  "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures"
const DEFAULT_IMAGE = `${BASE_IMAGE_URL}/DEFAULT.png`
const getPlayerImage = (playerName) => `${BASE_IMAGE_URL}/${playerName}.png`

/* =========================
   PLAYER DATA (demo)
   ========================= */
const playersData = [
  {
    playerId: "p1",
    name: "BLAZT",
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/AG%20GLOBAL.png",
    kills: 155,
    mapWins: 22,
    tourneyWins: 1,
  },
  {
    playerId: "p2",
    name: "SAGE",
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/EKLETYC.png",
    kills: 148,
    mapWins: 20,
    tourneyWins: 4,
  },
  {
    playerId: "p3",
    name: "SKULLFACE",
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/ESC.png",
    kills: 141,
    mapWins: 18,
    tourneyWins: 3,
  },
  {
    playerId: "p4",
    name: "ECHO",
    orgLogo:
      "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos/GEN.G.png",
    kills: 136,
    mapWins: 16,
    tourneyWins: 2,
  },
]

function PlayerStatsTab() {
  const [search, setSearch] = useState("")

  // Map for quick lookup (stable)
  const playerById = useMemo(() => {
    const map = new Map()
    playersData.forEach((p) => map.set(p.playerId, p))
    return map
  }, [])

  /**
   * 1) Build rankings ONCE from the full, non-searched list.
   *    These arrays are the "source of truth" for order & rank numbers.
   */
  const rankedColumns = useMemo(() => {
    const kills = [...playersData]
      .sort((a, b) => b.kills - a.kills)
      .map((p) => ({ playerId: p.playerId, value: p.kills }))

    const mapWins = [...playersData]
      .sort((a, b) => b.mapWins - a.mapWins)
      .map((p) => ({ playerId: p.playerId, value: p.mapWins }))

    const tourneyWins = [...playersData]
      .sort((a, b) => b.tourneyWins - a.tourneyWins)
      .map((p) => ({ playerId: p.playerId, value: p.tourneyWins }))

    return { kills, mapWins, tourneyWins }
  }, [])

  /**
   * 2) Search should NOT change order/ranks.
   *    So we filter the ranked lists, keeping original indices as rank.
   */
  const filteredColumns = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rankedColumns

    const matches = new Set(
      playersData
        .filter((p) => p.name.toLowerCase().includes(q))
        .map((p) => p.playerId)
    )

    const filterRows = (rows) => rows.filter((r) => matches.has(r.playerId))

    return {
      kills: filterRows(rankedColumns.kills),
      mapWins: filterRows(rankedColumns.mapWins),
      tourneyWins: filterRows(rankedColumns.tourneyWins),
    }
  }, [search, rankedColumns])

  /**
   * 3) Precompute ORIGINAL rank per stat based on the full list
   *    so displayed rank stays the same even after filtering.
   */
  const rankByStat = useMemo(() => {
    const buildRankMap = (rows) => {
      const m = new Map()
      rows.forEach((row, idx) => m.set(row.playerId, idx + 1))
      return m
    }

    return {
      kills: buildRankMap(rankedColumns.kills),
      mapWins: buildRankMap(rankedColumns.mapWins),
      tourneyWins: buildRankMap(rankedColumns.tourneyWins),
    }
  }, [rankedColumns])

  const renderColumn = (title, rows, statKey) => {
    const ranks = rankByStat[statKey]

    return (
      <div className="PlayerStatsTab__colInner">
        <h3 className="PlayerStatsTab__columnTitle">{title}</h3>

        <div className="PlayerStatsTab__list">
          {rows.map((row) => {
            const player = playerById.get(row.playerId)
            const rank = ranks.get(row.playerId) ?? 0

            const rankClass = rank <= 5 ? `PlayerStatsTab__card--rank${rank}` : ""

            return (
              <div
                key={`${statKey}-${row.playerId}`}
                className={`PlayerStatsTab__card ${rankClass}`}
              >
                <div className="PlayerStatsTab__rank">{rank}</div>

                {/* Player headshot (Supabase, fallback-safe) */}
                <img
                  className="PlayerStatsTab__headshot"
                  src={getPlayerImage(player?.name)}
                  alt={player?.name || ""}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE
                  }}
                />

                {/* Org logo */}
                <img
                  className="PlayerStatsTab__orgLogo"
                  src={player?.orgLogo}
                  alt=""
                />

                <div className="PlayerStatsTab__name">
                  {player?.name || "Unknown"}
                </div>

                <div className="PlayerStatsTab__value">{row.value}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="PlayerStatsTab">
      <div className="PlayerStatsTab__header">
        <h2 className="PlayerStatsTab__title">Player Stats</h2>

        <input
          className="PlayerStatsTab__search"
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="PlayerStatsTab__split">
        <div className="PlayerStatsTab__col">
          {renderColumn("Individual Kills", filteredColumns.kills, "kills")}
        </div>

        <div className="PlayerStatsTab__col">
          {renderColumn("Map Wins", filteredColumns.mapWins, "mapWins")}
        </div>

        <div className="PlayerStatsTab__col">
          {renderColumn("Tourney Wins", filteredColumns.tourneyWins, "tourneyWins")}
        </div>
      </div>
    </div>
  )
}

export default PlayerStatsTab
