import { useEffect, useMemo, useState } from 'react'
import '../../styles/Leaderboard.css'
import { fetchRows } from '../../lib/supabaseRest'

const BASE_IMAGE_URL =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos'
const PLAYER_IMAGE_BASE =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots'

const DEFAULT_TEAM_IMAGE = `${BASE_IMAGE_URL}/NONE.png`
const DEFAULT_PLAYER_IMAGE = `${PLAYER_IMAGE_BASE}/DEFAULT.png`

// Convert team name to filename-safe format
const getTeamImage = (teamName) =>
  teamName ? `${BASE_IMAGE_URL}/${encodeURIComponent(teamName)}.png` : DEFAULT_TEAM_IMAGE
const getPlayerImage = (playerName) =>
  playerName ? `${PLAYER_IMAGE_BASE}/${encodeURIComponent(playerName)}.png` : DEFAULT_PLAYER_IMAGE

const formatScore = (score) => {
  if (Number.isInteger(score)) return score
  return Number(score.toFixed(2))
}

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const toNumberOrNull = (value) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

const isMatchPointFormat = (value) => {
  const normalized = normalizeText(value)
  return normalized === 'match point' || normalized === 'matchpoint'
}

const idsMatch = (a, b) => String(a) === String(b)

const getFormatFromTournamentRow = (row = {}) =>
  row['Format'] ||
  row.Format ||
  row.format ||
  row.tournament_format ||
  row.match_format ||
  row.points_format ||
  row.win_format ||
  ''

const findWinnerFromTeamRows = (teamRows = []) => {
  const winnerFlags = [
    'is_winner',
    'tournament_winner',
    'won_tournament',
    'winner',
    'champion',
    'is_champion',
    'team_won_tournament',
  ]
  const placementFields = [
    'tournament_placement',
    'overall_placement',
    'final_placement',
    'placement',
    'rank',
    'standing',
  ]

  const flaggedWinner = teamRows.find((team) =>
    winnerFlags.some((field) => team[field] === true),
  )
  const flaggedWinnerId = flaggedWinner?.team_id ?? flaggedWinner?.id
  if (flaggedWinnerId !== undefined && flaggedWinnerId !== null) {
    return flaggedWinnerId
  }

  const placementWinner = teamRows.find((team) =>
    placementFields.some((field) => toNumberOrNull(team[field]) === 1),
  )
  const placementWinnerId = placementWinner?.team_id ?? placementWinner?.id
  if (placementWinnerId !== undefined && placementWinnerId !== null) {
    return placementWinnerId
  }

  return null
}

const findWinnerFromTournamentRow = (row = {}, teamRows = []) => {
  const idFields = [
    'winner_team_id',
    'winning_team_id',
    'champion_team_id',
    'tournament_winner_team_id',
    'winner_id',
  ]
  for (const field of idFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      return row[field]
    }
  }

  const winnerName =
    row.winner_team_name ||
    row.winning_team_name ||
    row.champion_team_name ||
    row.winner ||
    ''
  if (winnerName) {
    const matched = teamRows.find(
      (team) =>
        normalizeText(team.updated_team_name ?? team.team_name) === normalizeText(winnerName),
    )
    const matchedId = matched?.team_id ?? matched?.id
    if (matchedId !== undefined && matchedId !== null) {
      return matchedId
    }
  }

  return null
}

const findWinnerFromFinalMap = (mapRows = []) => {
  if (!mapRows.length) return null

  let latestMapNumber = null
  mapRows.forEach((row) => {
    const mapNumber = toNumberOrNull(row.map_number)
    if (mapNumber !== null && (latestMapNumber === null || mapNumber > latestMapNumber)) {
      latestMapNumber = mapNumber
    }
  })
  if (latestMapNumber === null) return null

  const winningRow = mapRows.find((row) => {
    const mapNumber = toNumberOrNull(row.map_number)
    const placement = toNumberOrNull(row.map_placement)
    return mapNumber === latestMapNumber && placement === 1
  })

  return winningRow?.team_id ?? null
}

function Leaderboard({ tournamentId }) {
  const [teams, setTeams] = useState([])
  const [mapsByTeamId, setMapsByTeamId] = useState(new Map())
  const [expandedTeamId, setExpandedTeamId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [teamRows, mapRows, tournamentResult] = await Promise.allSettled([
          fetchRows('team_info_view', {
            select: '*',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('map_data', {
            select:
              'team_id,map_number,map_placement,team_kills,map_points,player_1_kills,player_2_kills,player_3_kills',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('tournaments', {
            select: '*',
            filters: { id: tournamentId },
          }),
        ])

        if (teamRows.status !== 'fulfilled' || mapRows.status !== 'fulfilled') {
          throw new Error('Failed to load leaderboard data.')
        }

        const safeTeamRows = teamRows.value || []
        const safeMapRows = mapRows.value || []
        const tournamentRow =
          tournamentResult.status === 'fulfilled' ? tournamentResult.value?.[0] || {} : {}

        const scoreByTeamId = new Map()
        const nextMapsByTeamId = new Map()
        const nextPlayerKillsByTeamId = new Map()

        safeMapRows.forEach((row) => {
          const current = scoreByTeamId.get(row.team_id) || 0
          scoreByTeamId.set(row.team_id, current + Number(row.map_points || 0))

          const existing = nextMapsByTeamId.get(row.team_id) || []
          existing.push({
            mapNumber: row.map_number,
            placement: row.map_placement,
            kills: Number(row.team_kills || 0),
            points: Number(row.map_points || 0),
          })
          nextMapsByTeamId.set(row.team_id, existing)

          const currentPlayerKills = nextPlayerKillsByTeamId.get(row.team_id) || {
            player1Kills: 0,
            player2Kills: 0,
            player3Kills: 0,
          }
          currentPlayerKills.player1Kills += Number(row.player_1_kills || 0)
          currentPlayerKills.player2Kills += Number(row.player_2_kills || 0)
          currentPlayerKills.player3Kills += Number(row.player_3_kills || 0)
          nextPlayerKillsByTeamId.set(row.team_id, currentPlayerKills)
        })

        nextMapsByTeamId.forEach((teamMaps, teamId) => {
          const sortedTeamMaps = [...teamMaps].sort((a, b) => {
            const aNum = a.mapNumber ?? Number.MAX_SAFE_INTEGER
            const bNum = b.mapNumber ?? Number.MAX_SAFE_INTEGER
            return aNum - bNum
          })
          nextMapsByTeamId.set(teamId, sortedTeamMaps)
        })

        const nextTeams = safeTeamRows
          .map((team) => ({
            id: team.team_id,
            name: team.updated_team_name || 'Unknown Team',
            players: [team.updated_player_1, team.updated_player_2, team.updated_player_3].filter(Boolean),
            playerCards: [
              {
                name: team.updated_player_1 || 'Player 1',
                kills: nextPlayerKillsByTeamId.get(team.team_id)?.player1Kills || 0,
              },
              {
                name: team.updated_player_2 || 'Player 2',
                kills: nextPlayerKillsByTeamId.get(team.team_id)?.player2Kills || 0,
              },
              {
                name: team.updated_player_3 || 'Player 3',
                kills: nextPlayerKillsByTeamId.get(team.team_id)?.player3Kills || 0,
              },
            ],
            score: scoreByTeamId.get(team.team_id) || 0,
          }))
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

        const isMatchPoint = isMatchPointFormat(getFormatFromTournamentRow(tournamentRow))
        if (isMatchPoint) {
          const winnerTeamId =
            findWinnerFromTournamentRow(tournamentRow, safeTeamRows) ||
            findWinnerFromTeamRows(safeTeamRows) ||
            findWinnerFromFinalMap(safeMapRows)

          if (winnerTeamId !== null && winnerTeamId !== undefined) {
            const winnerIndex = nextTeams.findIndex((team) => idsMatch(team.id, winnerTeamId))
            if (winnerIndex > 0) {
              const [winnerTeam] = nextTeams.splice(winnerIndex, 1)
              nextTeams.unshift(winnerTeam)
            }
          }
        }

        if (!cancelled) {
          setTeams(nextTeams)
          setMapsByTeamId(nextMapsByTeamId)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load leaderboard data.')
          setTeams([])
          setMapsByTeamId(new Map())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (tournamentId) {
      setExpandedTeamId(null)
      loadData()
    } else {
      setTeams([])
      setMapsByTeamId(new Map())
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  useEffect(() => {
    if (typeof window === 'undefined' || !teams.length) return

    const imageUrls = new Set()
    teams.forEach((team) => {
      imageUrls.add(getTeamImage(team.name))
      team.playerCards.forEach((player) => {
        imageUrls.add(getPlayerImage(player.name))
      })
    })

    const preloadedImages = []
    imageUrls.forEach((src) => {
      const image = new Image()
      image.src = src
      preloadedImages.push(image)
    })
  }, [teams])

  const splitIndex = useMemo(() => Math.ceil(teams.length / 2), [teams])
  const leftColumn = teams.slice(0, splitIndex)
  const rightColumn = teams.slice(splitIndex)

  if (loading) {
    return <div className="leaderboard-wrapper">Loading leaderboard...</div>
  }

  if (error) {
    return <div className="leaderboard-wrapper">{error}</div>
  }

  if (!teams.length) {
    return <div className="leaderboard-wrapper">No leaderboard data found.</div>
  }

  const renderColumn = (columnTeams, offset) => (
    <div className="leaderboard-column">
      <div className="leaderboard-row leaderboard-header">
        <div className="header-text header-rank">#</div>
        <div className="header-text header-team">Team</div>
        <div />
        <div className="header-text header-score">Score</div>
      </div>

      {columnTeams.map((team, index) => {
        const isExpanded = expandedTeamId === team.id
        const teamMaps = mapsByTeamId.get(team.id) || []

        return (
          <div key={team.id} className="leaderboard-team-group">
            <div
              className={`leaderboard-row leaderboard-row--team ${isExpanded ? 'leaderboard-row--expanded' : ''}`}
              aria-expanded={isExpanded}
              onClick={() => {
                setExpandedTeamId((prev) => (prev === team.id ? null : team.id))
              }}
            >
              <div className="team-placement">
                {index + 1 + offset}
              </div>

              <div className="team-info">
                <div className="team-name">{team.name}</div>
                <div className="team-players">
                  {team.players.join(' | ')}
                </div>
              </div>

              <img
                src={getTeamImage(team.name)}
                alt=""
                className="team-logo"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = DEFAULT_TEAM_IMAGE
                }}
              />

              <div className="team-score">{formatScore(team.score)}</div>
            </div>

            <div
              className={`team-maps-panel-wrapper ${isExpanded ? 'team-maps-panel-wrapper--open' : ''}`}
            >
              <div className="team-maps-panel">
                <div className="team-player-strip">
                  {team.playerCards.map((player, playerIndex) => (
                    <div key={`${team.id}-player-${playerIndex}`} className="team-player-card">
                      <img
                        src={getPlayerImage(player.name)}
                        alt=""
                        className="team-player-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = DEFAULT_PLAYER_IMAGE
                        }}
                      />
                      <div className="team-player-overlay">
                        <div className="team-player-name">{player.name}</div>
                        <div className="team-player-kills">{formatScore(player.kills)} Kills</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="team-maps-title">Maps Played</div>
                {teamMaps.length ? (
                  <div className="team-maps-list">
                    <div className="team-map-columns">
                      <span className="team-map-colhead team-map-colhead--map">Map</span>
                      <span className="team-map-colhead">Kills</span>
                      <span className="team-map-colhead">Placement</span>
                      <span className="team-map-colhead">Points</span>
                    </div>

                    {teamMaps.map((teamMap, mapIndex) => (
                      <div key={`${team.id}-${teamMap.mapNumber ?? 'na'}-${mapIndex}`} className="team-map-row">
                        <span className="team-map-cell team-map-label">
                          {teamMap.mapNumber === null || teamMap.mapNumber === undefined
                            ? `Map ${mapIndex + 1}`
                            : `Map ${teamMap.mapNumber}`}
                        </span>
                        <span className="team-map-cell team-map-stat">{formatScore(teamMap.kills)}</span>
                        <span className="team-map-cell team-map-stat">
                          {teamMap.placement === null || teamMap.placement === undefined
                            ? '-'
                            : formatScore(Number(teamMap.placement))}
                        </span>
                        <span className="team-map-cell team-map-stat">{formatScore(teamMap.points)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="team-maps-empty">No maps found for this team.</div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="leaderboard-wrapper">
      <div className="leaderboard-columns">
        {renderColumn(leftColumn, 0)}
        {renderColumn(rightColumn, leftColumn.length)}
      </div>
    </div>
  )
}

export default Leaderboard

