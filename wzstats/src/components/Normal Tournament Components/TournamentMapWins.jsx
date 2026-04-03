import { useEffect, useState } from 'react'
import '../../styles/TournamentMapWins.css'
import { fetchRows } from '../../lib/supabaseRest'

const BASE_IMAGE_URL =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots'
const TEAM_IMAGE_BASE =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos'

const DEFAULT_IMAGE = `${BASE_IMAGE_URL}/DEFAULT.png`
const DEFAULT_TEAM_IMAGE = `${TEAM_IMAGE_BASE}/NONE.png`
const getPlayerImage = (playerName) =>
  playerName
    ? `${BASE_IMAGE_URL}/${encodeURIComponent(String(playerName).trim().toUpperCase())}.png`
    : DEFAULT_IMAGE
const getTeamImage = (teamName) =>
  teamName ? `${TEAM_IMAGE_BASE}/${encodeURIComponent(teamName)}.png` : DEFAULT_TEAM_IMAGE

function TournamentMapWins({ tournamentId }) {
  const [mapsData, setMapsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [teamRows, mapRows] = await Promise.all([
          fetchRows('team_info_view', {
            select: 'team_id,updated_team_name,updated_player_1,updated_player_2,updated_player_3',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('map_data', {
            select: 'map_number,team_id,map_placement,team_kills,map_points',
            filters: { tournament_id: tournamentId },
          }),
        ])

        const teamsById = new Map(teamRows.map((team) => [team.team_id, team]))
        const bestByMap = new Map()

        mapRows.forEach((row) => {
          if (row.map_number === null || row.map_number === undefined) return

          const current = bestByMap.get(row.map_number)
          if (!current) {
            bestByMap.set(row.map_number, row)
            return
          }

          const placement = Number(row.map_placement)
          const currentPlacement = Number(current.map_placement)
          const hasPlacement = Number.isFinite(placement)
          const currentHasPlacement = Number.isFinite(currentPlacement)

          if (hasPlacement && currentHasPlacement) {
            if (placement < currentPlacement) {
              bestByMap.set(row.map_number, row)
            }
            return
          }

          if (hasPlacement && !currentHasPlacement) {
            bestByMap.set(row.map_number, row)
            return
          }

          if (!hasPlacement && currentHasPlacement) {
            return
          }

          const kills = Number(row.team_kills || 0)
          const currentKills = Number(current.team_kills || 0)
          const points = Number(row.map_points || 0)
          const currentPoints = Number(current.map_points || 0)

          if (kills > currentKills || (kills === currentKills && points > currentPoints)) {
            bestByMap.set(row.map_number, row)
          }
        })

        const nextRows = Array.from(bestByMap.entries())
          .map(([mapNumber, row]) => {
            const team = teamsById.get(row.team_id)
            return {
              mapNumber: Number(mapNumber),
              teamName: team?.updated_team_name || 'Unknown Team',
              teamLogo: getTeamImage(team?.updated_team_name),
              players: [team?.updated_player_1, team?.updated_player_2, team?.updated_player_3].filter(Boolean),
              kills: Number(row.team_kills || 0),
            }
          })
          .sort((a, b) => a.mapNumber - b.mapNumber)

        if (!cancelled) {
          setMapsData(nextRows)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load map wins.')
          setMapsData([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (tournamentId) {
      loadData()
    } else {
      setMapsData([])
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  if (loading) {
    return <div className="map-wins-container">Loading map wins...</div>
  }

  if (error) {
    return <div className="map-wins-container">{error}</div>
  }

  if (!mapsData.length) {
    return <div className="map-wins-container">No map data found.</div>
  }

  return (
    <div className="map-wins-container">
      <div className="map-table-header">
        <div className="map-header-spacer map-header-map" />
        <div className="map-header-spacer map-header-images" />
        <div className="map-header-team">Team</div>
        <div className="map-header-logo">Logo</div>
        <div className="map-header-kills">Kills</div>
      </div>

      <div className="map-rows">
        {mapsData.map((map) => (
          <div key={map.mapNumber} className="map-row">
            <div className="map-label">Map {map.mapNumber}</div>

            <div className="map-images">
              {map.players.slice(0, 3).map((player) => {
                const playerImage = getPlayerImage(player)

                return (
                  <img
                    key={player}
                    src={playerImage}
                    alt=""
                    className="map-image"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = DEFAULT_IMAGE
                    }}
                  />
                )
              })}
            </div>

            <div className="map-team-info">
              <div className="team-name">{map.teamName}</div>
              <div className="team-players">{map.players.join(' | ')}</div>
            </div>

            <div className="map-logo-info">
              <img
                src={map.teamLogo}
                alt=""
                className="map-team-logo"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = DEFAULT_TEAM_IMAGE
                }}
              />
            </div>

            <div className="map-kills-info">
              <div className="map-kills">{map.kills}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TournamentMapWins
