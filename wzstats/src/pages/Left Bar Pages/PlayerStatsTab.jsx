// src/components/PlayerStatsTab.jsx
import { memo, useDeferredValue, useEffect, useMemo, useState } from "react"
import { fetchRows } from "../../lib/supabaseRest"
import "../../styles/Left Bar Pages/PlayerStatsTab.css"

/* =========================
   HEADSHOT IMAGE HELPERS
   ========================= */
const BASE_IMAGE_URL =
  "https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots"
const DEFAULT_IMAGE = `${BASE_IMAGE_URL}/DEFAULT.png`
const DEFAULT_TEAM_LOGO =
  "https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos/NONE.png"
const getPlayerImage = (playerName) =>
  playerName ? `${BASE_IMAGE_URL}/${encodeURIComponent(playerName)}.png` : DEFAULT_IMAGE
const getOrgLogo = (orgName) =>
  orgName
    ? `https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos/${encodeURIComponent(orgName)}.png`
    : DEFAULT_TEAM_LOGO
const normalizeName = (name) => String(name || "").trim().toLowerCase()
const DISPLAY_LIMIT = 25
const VIRTUAL_ROW_HEIGHT = 88
const VIRTUAL_OVERSCAN = 8

const PlayerStatCard = memo(function PlayerStatCard({ row, player, rank }) {
  const rankClass = rank <= 5 ? `PlayerStatsTab__card--rank${rank}` : ""
  const hasOrg = Boolean(player?.orgName)

  return (
    <div className={`PlayerStatsTab__card PlayerStatsTab__card--player ${rankClass}`}>
      <div className="PlayerStatsTab__rank">{rank}</div>

      <img
        className="PlayerStatsTab__headshot"
        src={getPlayerImage(player?.name)}
        alt=""
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_IMAGE
        }}
      />

      <div className="PlayerStatsTab__name">{player?.name || "Unknown"}</div>

      {hasOrg ? (
        <img
          className="PlayerStatsTab__orgLogo"
          src={player?.orgLogo}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = DEFAULT_TEAM_LOGO
          }}
        />
      ) : (
        <div className="PlayerStatsTab__orgLogoPlaceholder" aria-hidden="true" />
      )}

      <div className="PlayerStatsTab__value">{row.value}</div>
    </div>
  )
})

const VirtualizedPlayerRows = memo(function VirtualizedPlayerRows({
  rows,
  statKey,
  ranks,
  playerById,
}) {
  const [range, setRange] = useState({
    start: 0,
    end: Math.min(rows.length, 30),
  })

  useEffect(() => {
    if (rows.length <= DISPLAY_LIMIT) {
      return undefined
    }

    const container = document.getElementById(`PlayerStatsTab-list-${statKey}`)
    if (!container) {
      return undefined
    }

    const updateRange = () => {
      const rect = container.getBoundingClientRect()
      const containerTop = window.scrollY + rect.top
      const viewportTop = window.scrollY
      const viewportBottom = viewportTop + window.innerHeight

      const topOffset = Math.max(0, viewportTop - containerTop)
      const bottomOffset = Math.max(0, viewportBottom - containerTop)

      const nextStart = Math.max(
        0,
        Math.floor(topOffset / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN,
      )
      const nextEnd = Math.min(
        rows.length,
        Math.ceil(bottomOffset / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN,
      )

      setRange((prev) =>
        prev.start === nextStart && prev.end === nextEnd
          ? prev
          : { start: nextStart, end: nextEnd },
      )
    }

    const rafId = window.requestAnimationFrame(updateRange)
    window.addEventListener("scroll", updateRange, { passive: true })
    window.addEventListener("resize", updateRange)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", updateRange)
      window.removeEventListener("resize", updateRange)
    }
  }, [rows, statKey])

  const start = Math.min(range.start, rows.length)
  const end = Math.min(Math.max(range.end, start), rows.length)
  const topSpacerHeight = start * VIRTUAL_ROW_HEIGHT
  const bottomSpacerHeight = Math.max(0, (rows.length - end) * VIRTUAL_ROW_HEIGHT)
  const renderRows = rows.slice(start, end)

  return (
    <div className="PlayerStatsTab__virtualRows">
      {topSpacerHeight > 0 ? (
        <div className="PlayerStatsTab__virtualSpacer" style={{ height: `${topSpacerHeight}px` }} />
      ) : null}

      {renderRows.map((row) => {
        const player = playerById.get(row.playerId)
        const rank = ranks.get(row.playerId) ?? 0
        return (
          <div key={`${statKey}-${row.playerId}`} className="PlayerStatsTab__virtualRow">
            <PlayerStatCard row={row} player={player} rank={rank} />
          </div>
        )
      })}

      {bottomSpacerHeight > 0 ? (
        <div className="PlayerStatsTab__virtualSpacer" style={{ height: `${bottomSpacerHeight}px` }} />
      ) : null}
    </div>
  )
})

const StatsColumn = memo(function StatsColumn({
  title,
  rows,
  visibleRows,
  statKey,
  ranks,
  search,
  visibleCount,
  setVisibleCount,
  playerById,
}) {
  const showMore = !search.trim() && visibleRows.length < rows.length
  const showLess = !search.trim() && visibleCount[statKey] > DISPLAY_LIMIT

  return (
    <div className="PlayerStatsTab__colInner">
      <h3 className="PlayerStatsTab__columnTitle">{title}</h3>

      <div className="PlayerStatsTab__list">
        {visibleRows.length > DISPLAY_LIMIT ? (
          <div id={`PlayerStatsTab-list-${statKey}`}>
            <VirtualizedPlayerRows
              rows={visibleRows}
              statKey={statKey}
              ranks={ranks}
              playerById={playerById}
            />
          </div>
        ) : (
          visibleRows.map((row) => {
            const player = playerById.get(row.playerId)
            const rank = ranks.get(row.playerId) ?? 0

            return (
              <PlayerStatCard
                key={`${statKey}-${row.playerId}`}
                row={row}
                player={player}
                rank={rank}
              />
            )
          })
        )}
        {!visibleRows.length && <div className="PlayerStatsTab__card">No results</div>}
      </div>
      {showMore && (
        <button
          type="button"
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
  )
})

function PlayerStatsTab() {
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState({
    kills: DISPLAY_LIMIT,
    mapWins: DISPLAY_LIMIT,
    tourneyWins: DISPLAY_LIMIT,
  })
  const [playersData, setPlayersData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    let cancelled = false

    const loadPlayerStats = async () => {
      setLoading(true)
      setError("")

      try {
        const [totalKills, mapWins, tournamentWins, organizations] = await Promise.all([
          fetchRows("individual_total_kills", { select: "player_name,total_kills" }),
          fetchRows("individual_map_wins", { select: "player_name,total_wins" }),
          fetchRows("individual_tournament_wins", { select: "player_name,total_wins" }),
          fetchRows("organizations", { select: "org_name,player_1,player_2,player_3" }),
        ])

        const playersByKey = new Map()

        const ensurePlayer = (playerName) => {
          const name = String(playerName || "").trim()
          const key = normalizeName(name)
          if (!key) return null

          if (!playersByKey.has(key)) {
            playersByKey.set(key, {
              playerId: key,
              name,
              orgName: "",
              kills: 0,
              mapWins: 0,
              tourneyWins: 0,
            })
          }

          return playersByKey.get(key)
        }

        ;(totalKills || []).forEach((row) => {
          const player = ensurePlayer(row.player_name)
          if (!player) return
          player.kills += Number(row.total_kills || 0)
        })

        ;(mapWins || []).forEach((row) => {
          const player = ensurePlayer(row.player_name)
          if (!player) return
          player.mapWins += Number(row.total_wins || 0)
        })

        ;(tournamentWins || []).forEach((row) => {
          const player = ensurePlayer(row.player_name)
          if (!player) return
          player.tourneyWins += Number(row.total_wins || 0)
        })
        const totalPlayerTourneyWins = (tournamentWins || []).reduce(
          (sum, row) => sum + Number(row.total_wins || 0),
          0
        )

        ;(organizations || []).forEach((org) => {
          ;[org.player_1, org.player_2, org.player_3].forEach((playerName) => {
            const key = normalizeName(playerName)
            if (!key) return
            const player = playersByKey.get(key)
            if (!player) return
            if (!player.orgName && org.org_name) {
              player.orgName = org.org_name
            }
          })
        })

        const nextPlayers = Array.from(playersByKey.values()).map((player) => ({
          ...player,
          orgLogo: player.orgName ? getOrgLogo(player.orgName) : "",
        }))

        if (!cancelled) {
          console.log("[PlayerStatsTab] Total player tournament wins:", totalPlayerTourneyWins)
          setPlayersData(nextPlayers)
        }
      } catch (err) {
        if (!cancelled) {
          setPlayersData([])
          setError(err.message || "Failed to load player stats.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPlayerStats()

    return () => {
      cancelled = true
    }
  }, [])

  // Map for quick lookup (stable)
  const playerById = useMemo(() => {
    const map = new Map()
    playersData.forEach((p) => map.set(p.playerId, p))
    return map
  }, [playersData])

  /**
   * 1) Build rankings ONCE from the full, non-searched list.
   *    These arrays are the "source of truth" for order & rank numbers.
   */
  const rankedColumns = useMemo(() => {
    const allKills = [...playersData]
      .sort((a, b) => b.kills - a.kills)
      .map((p) => ({ playerId: p.playerId, value: p.kills }))

    const allMapWins = [...playersData]
      .sort((a, b) => b.mapWins - a.mapWins)
      .map((p) => ({ playerId: p.playerId, value: p.mapWins }))

    const allTourneyWins = [...playersData]
      .sort((a, b) => b.tourneyWins - a.tourneyWins)
      .map((p) => ({ playerId: p.playerId, value: p.tourneyWins }))

    const kills = [...playersData]
      .filter((p) => Number(p.kills || 0) > 0)
      .sort((a, b) => b.kills - a.kills)
      .map((p) => ({ playerId: p.playerId, value: p.kills }))

    const mapWins = [...playersData]
      .filter((p) => Number(p.mapWins || 0) > 0)
      .sort((a, b) => b.mapWins - a.mapWins)
      .map((p) => ({ playerId: p.playerId, value: p.mapWins }))

    const tourneyWins = [...playersData]
      .filter((p) => Number(p.tourneyWins || 0) > 0)
      .sort((a, b) => b.tourneyWins - a.tourneyWins)
      .map((p) => ({ playerId: p.playerId, value: p.tourneyWins }))

    return { kills, mapWins, tourneyWins, allKills, allMapWins, allTourneyWins }
  }, [playersData])

  /**
   * 2) Search should NOT change order/ranks.
   *    So we filter the ranked lists, keeping original indices as rank.
   */
  const filteredColumns = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    if (!q) return rankedColumns

    const matches = new Set(
      playersData
        .filter((p) => p.name.toLowerCase().includes(q))
        .map((p) => p.playerId)
    )

    const filterRows = (rows) => rows.filter((r) => matches.has(r.playerId))

    return {
      kills: filterRows(rankedColumns.allKills),
      mapWins: filterRows(rankedColumns.allMapWins),
      tourneyWins: filterRows(rankedColumns.allTourneyWins),
    }
  }, [playersData, deferredSearch, rankedColumns])

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
    }
  }, [filteredColumns, search, visibleCount])

  /**
   * 3) Precompute ORIGINAL rank per stat based on the full list
   *    so displayed rank stays the same even after filtering.
   */
  const rankByStat = useMemo(() => {
    const buildRankMap = (rows) => {
      const m = new Map()
      let previousValue = null
      let currentRank = 0

      rows.forEach((row, idx) => {
        const value = Number(row.value || 0)
        if (idx === 0 || value !== previousValue) {
          currentRank = idx + 1
          previousValue = value
        }
        m.set(row.playerId, currentRank)
      })
      return m
    }

    return {
      kills: buildRankMap(rankedColumns.allKills),
      mapWins: buildRankMap(rankedColumns.allMapWins),
      tourneyWins: buildRankMap(rankedColumns.allTourneyWins),
    }
  }, [rankedColumns])

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

      {loading ? (
        <div className="PlayerStatsTab__split">
          <div className="PlayerStatsTab__col">Loading player stats...</div>
        </div>
      ) : error ? (
        <div className="PlayerStatsTab__split">
          <div className="PlayerStatsTab__col">{error}</div>
        </div>
      ) : !playersData.length ? (
        <div className="PlayerStatsTab__split">
          <div className="PlayerStatsTab__col">No player stats found.</div>
        </div>
      ) : (
        <div className="PlayerStatsTab__split">
          <div className="PlayerStatsTab__col">
            <StatsColumn
              title="Individual Kills"
              rows={filteredColumns.kills}
              visibleRows={visibleColumns.kills}
              statKey="kills"
              ranks={rankByStat.kills}
              search={search}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              playerById={playerById}
            />
          </div>

          <div className="PlayerStatsTab__col">
            <StatsColumn
              title="Map Wins"
              rows={filteredColumns.mapWins}
              visibleRows={visibleColumns.mapWins}
              statKey="mapWins"
              ranks={rankByStat.mapWins}
              search={search}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              playerById={playerById}
            />
          </div>

          <div className="PlayerStatsTab__col">
            <StatsColumn
              title="Tourney Wins"
              rows={filteredColumns.tourneyWins}
              visibleRows={visibleColumns.tourneyWins}
              statKey="tourneyWins"
              ranks={rankByStat.tourneyWins}
              search={search}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              playerById={playerById}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerStatsTab

