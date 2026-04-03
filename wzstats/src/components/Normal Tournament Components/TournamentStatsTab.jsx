import { useEffect, useMemo, useState } from 'react'
import { fetchRows } from '../../lib/supabaseRest'
import '../../styles/TournamentStatsTab.css'

const PLAYER_IMAGE_BASE =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots'
const TEAM_IMAGE_BASE =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos'

const DEFAULT_PLAYER_IMAGE = `${PLAYER_IMAGE_BASE}/DEFAULT.png`
const DEFAULT_TEAM_IMAGE = `${TEAM_IMAGE_BASE}/NONE.png`
const getPlayerImage = (playerName) =>
  playerName
    ? `${PLAYER_IMAGE_BASE}/${encodeURIComponent(String(playerName).trim().toUpperCase())}.png`
    : DEFAULT_PLAYER_IMAGE
const getTeamImage = (teamName) =>
  teamName ? `${TEAM_IMAGE_BASE}/${encodeURIComponent(teamName)}.png` : DEFAULT_TEAM_IMAGE

function TournamentStatsTab({ tournamentId }) {
  const [hoveredTeamId, setHoveredTeamId] = useState(null)

  const [players, setPlayers] = useState([])
  const [resolvedPlayerImages, setResolvedPlayerImages] = useState(null)
  const [playerLoading, setPlayerLoading] = useState(true)
  const [playerError, setPlayerError] = useState('')

  const [teams, setTeams] = useState([])
  const [teamKills, setTeamKills] = useState([])
  const [avgPlacement, setAvgPlacement] = useState([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamError, setTeamError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadStats = async () => {
      setPlayerLoading(true)
      setTeamLoading(true)
      setPlayerError('')
      setTeamError('')
      setResolvedPlayerImages(null)

      try {
        const [teamRows, mapRows] = await Promise.all([
          fetchRows('team_info_view', {
            select: 'team_id,updated_team_name,updated_player_1,updated_player_2,updated_player_3',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('map_data', {
            select:
              'team_id,player_1_kills,player_2_kills,player_3_kills,team_kills,map_placement',
            filters: { tournament_id: tournamentId },
          }),
        ])

        const teamsById = new Map(teamRows.map((team) => [team.team_id, team]))
        const totalsByPlayerKey = new Map()

        const addKills = (teamId, playerName, teamName, kills) => {
          if (!playerName) return
          const key = `${teamId}:${playerName}`
          const current = totalsByPlayerKey.get(key) || {
            id: key,
            teamId,
            name: playerName,
            team: teamName || 'Unknown Team',
            value: 0,
          }
          current.value += Number(kills || 0)
          totalsByPlayerKey.set(key, current)
        }

        mapRows.forEach((row) => {
          const team = teamsById.get(row.team_id)
          addKills(row.team_id, team?.updated_player_1, team?.updated_team_name, row.player_1_kills)
          addKills(row.team_id, team?.updated_player_2, team?.updated_team_name, row.player_2_kills)
          addKills(row.team_id, team?.updated_player_3, team?.updated_team_name, row.player_3_kills)
        })

        const nextPlayers = Array.from(totalsByPlayerKey.values()).sort(
          (a, b) => b.value - a.value || a.name.localeCompare(b.name),
        )

        const teamsList = teamRows.map((team) => ({
          teamId: team.team_id,
          name: team.updated_team_name || 'Unknown Team',
          avatar: getTeamImage(team.updated_team_name),
        }))

        const agg = new Map()
        mapRows.forEach((row) => {
          const current = agg.get(row.team_id) || {
            kills: 0,
            placementTotal: 0,
            placementCount: 0,
          }

          current.kills += Number(row.team_kills || 0)

          if (row.map_placement !== null && row.map_placement !== undefined) {
            current.placementTotal += Number(row.map_placement)
            current.placementCount += 1
          }

          agg.set(row.team_id, current)
        })

        const killsRows = teamsList
          .map((team) => ({
            teamId: team.teamId,
            value: agg.get(team.teamId)?.kills || 0,
          }))
          .sort((a, b) => b.value - a.value)

        const placementRows = teamsList
          .map((team) => {
            const item = agg.get(team.teamId)
            const avg =
              item && item.placementCount > 0
                ? item.placementTotal / item.placementCount
                : Number.POSITIVE_INFINITY
            return { teamId: team.teamId, value: avg }
          })
          .sort((a, b) => a.value - b.value)
          .map((row) => ({
            ...row,
            value: Number.isFinite(row.value) ? Number(row.value.toFixed(2)) : '-',
          }))

        if (!cancelled) {
          setPlayers(nextPlayers)
          setTeams(teamsList)
          setTeamKills(killsRows)
          setAvgPlacement(placementRows)
        }
      } catch (err) {
        if (!cancelled) {
          setPlayers([])
          setTeams([])
          setTeamKills([])
          setAvgPlacement([])
          setPlayerError(err.message || 'Failed to load player stats.')
          setTeamError(err.message || 'Failed to load team stats.')
        }
      } finally {
        if (!cancelled) {
          setPlayerLoading(false)
          setTeamLoading(false)
        }
      }
    }

    if (tournamentId) {
      loadStats()
    } else {
      setPlayers([])
      setResolvedPlayerImages({})
      setTeams([])
      setTeamKills([])
      setAvgPlacement([])
      setPlayerLoading(false)
      setTeamLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  useEffect(() => {
    if (!players.length) {
      setResolvedPlayerImages({})
      return
    }

    const nextImages = {}
    players.forEach((player) => {
      nextImages[player.id] = {
        avatar: getPlayerImage(player.name),
        badge: getTeamImage(player.team),
      }
    })
    setResolvedPlayerImages(nextImages)
  }, [players])

  const teamById = useMemo(() => {
    const map = new Map()
    teams.forEach((team) => map.set(team.teamId, team))
    return map
  }, [teams])

  const renderTeamColumn = (title, rows) => (
    <div className="TournamentStatsTab__teamHalfInner">
      <h3 className="TournamentStatsTab__columnTitle">{title}</h3>

      <div className="TournamentStatsTab__teamList">
        {rows.map((row, index) => {
          const rank = index + 1
          const team = teamById.get(row.teamId)
          const rankClass = rank <= 5 ? `TournamentStatsTab__teamCard--rank${rank}` : ''
          const hoverClass =
            hoveredTeamId === row.teamId ? 'TournamentStatsTab__teamCard--hoverMatch' : ''

          return (
            <div
              key={`${title}-${row.teamId}`}
              className={['TournamentStatsTab__teamCard', rankClass, hoverClass].join(' ')}
              onMouseEnter={() => setHoveredTeamId(row.teamId)}
              onMouseLeave={() => setHoveredTeamId(null)}
            >
              <div className="TournamentStatsTab__teamRank">{rank}</div>

              <img
                className="TournamentStatsTab__teamAvatar"
                src={team?.avatar || DEFAULT_TEAM_IMAGE}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = DEFAULT_TEAM_IMAGE
                }}
              />

              <div className="TournamentStatsTab__teamName">{team?.name || 'Unknown'}</div>
              <div className="TournamentStatsTab__teamValue">{row.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="TournamentStatsTab">
      <section className="TournamentStatsTab__panel TournamentStatsTab__panel--player">
        <h2 className="TournamentStatsTab__title">Player Stats</h2>
        <h3 className="TournamentStatsTab__columnTitle">Player Kills</h3>

        {playerLoading || resolvedPlayerImages === null ? (
          <div className="TournamentStatsTab__status">Loading player stats...</div>
        ) : playerError ? (
          <div className="TournamentStatsTab__status">{playerError}</div>
        ) : !players.length ? (
          <div className="TournamentStatsTab__status">No player stats found.</div>
        ) : (
          <div className="TournamentStatsTab__playerList">
            {players.map((player, index) => {
              const rank = index + 1
              const rankClass = rank <= 5 ? `TournamentStatsTab__playerCard--rank${rank}` : ''
              const hoverClass =
                hoveredTeamId === player.teamId
                  ? 'TournamentStatsTab__playerCard--hoverMatch'
                  : ''
              const images = resolvedPlayerImages[player.id] || {
                avatar: DEFAULT_PLAYER_IMAGE,
                badge: DEFAULT_TEAM_IMAGE,
              }

              return (
                <div
                  key={player.id}
                  className={['TournamentStatsTab__playerCard', rankClass, hoverClass].join(' ')}
                  onMouseEnter={() => setHoveredTeamId(player.teamId)}
                  onMouseLeave={() => setHoveredTeamId(null)}
                >
                  <div className="TournamentStatsTab__playerRank">{rank}</div>
                  <img
                    className="TournamentStatsTab__playerOrgLogo"
                    src={images.badge}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = DEFAULT_TEAM_IMAGE
                    }}
                  />
                  <img
                    className="TournamentStatsTab__playerPic"
                    src={images.avatar}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = DEFAULT_PLAYER_IMAGE
                    }}
                  />
                  <div className="TournamentStatsTab__playerName">{player.name}</div>
                  <div className="TournamentStatsTab__playerValue">{player.value}</div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="TournamentStatsTab__divider" aria-hidden="true" />

      <section className="TournamentStatsTab__panel TournamentStatsTab__panel--team">
        <h2 className="TournamentStatsTab__title">Team Stats</h2>

        {teamLoading ? (
          <div className="TournamentStatsTab__status">Loading team stats...</div>
        ) : teamError ? (
          <div className="TournamentStatsTab__status">{teamError}</div>
        ) : !teams.length ? (
          <div className="TournamentStatsTab__status">No team stats found.</div>
        ) : (
          <div className="TournamentStatsTab__teamSplit">
            <div className="TournamentStatsTab__teamHalf">
              {renderTeamColumn('Team Kills', teamKills)}
            </div>

            <div className="TournamentStatsTab__teamHalf">
              {renderTeamColumn('Average Placement', avgPlacement)}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default TournamentStatsTab

