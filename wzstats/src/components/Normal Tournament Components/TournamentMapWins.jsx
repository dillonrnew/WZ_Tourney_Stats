import { fetchRows } from '../../lib/supabaseRest'
import {
  DEFAULT_PLAYER_IMAGE as DEFAULT_IMAGE,
  DEFAULT_TEAM_IMAGE,
  getPlayerImage,
  getTeamImage,
} from '../../lib/imageHelpers'
import { useAsync } from '../../lib/useAsync'
import ImageWithFallback from '../ImageWithFallback'
import '../../styles/TournamentMapWins.css'

async function loadMapWins(tournamentId) {
  if (!tournamentId) return []

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
      if (placement < currentPlacement) bestByMap.set(row.map_number, row)
      return
    }

    if (hasPlacement && !currentHasPlacement) {
      bestByMap.set(row.map_number, row)
      return
    }

    if (!hasPlacement && currentHasPlacement) return

    const kills = Number(row.team_kills || 0)
    const currentKills = Number(current.team_kills || 0)
    const points = Number(row.map_points || 0)
    const currentPoints = Number(current.map_points || 0)

    if (kills > currentKills || (kills === currentKills && points > currentPoints)) {
      bestByMap.set(row.map_number, row)
    }
  })

  return Array.from(bestByMap.entries())
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
}

function TournamentMapWins({ tournamentId }) {
  const { data, loading, error } = useAsync(() => loadMapWins(tournamentId), [tournamentId])
  const mapsData = data ?? []

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
                  <ImageWithFallback
                    key={player}
                    src={playerImage}
                    className="map-image"
                    fallback={DEFAULT_IMAGE}
                    loading="lazy"
                    decoding="async"
                  />
                )
              })}
            </div>

            <div className="map-team-info">
              <div className="team-name">{map.teamName}</div>
              <div className="team-players">{map.players.join(' | ')}</div>
            </div>

            <div className="map-logo-info">
              <ImageWithFallback
                src={map.teamLogo}
                className="map-team-logo"
                fallback={DEFAULT_TEAM_IMAGE}
                loading="lazy"
                decoding="async"
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
