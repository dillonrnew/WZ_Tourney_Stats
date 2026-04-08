import { useState } from 'react'
import { fetchRows } from '../../lib/supabaseRest'
import {
  DEFAULT_PLAYER_IMAGE as DEFAULT_IMAGE,
  getPlayerImage,
} from '../../lib/imageHelpers'
import { useAsync } from '../../lib/useAsync'
import ImageWithFallback from '../../components/ImageWithFallback'
import '../../styles/Left Bar Pages/MeetTheTeamsTab.css'

function Team() {
  const [selectedTeam, setSelectedTeam] = useState(null)

  const { data, loading, error } = useAsync(
    () =>
      fetchRows('organizations', {
        select: 'id,org_name,player_1,player_2,player_3',
        order: { column: 'org_name', ascending: true },
      }).then((rows) =>
        (rows || []).map((org) => ({
          id: org.id,
          name: org.org_name || 'Unknown Org',
          players: [org.player_1, org.player_2, org.player_3]
            .filter(Boolean)
            .map((playerName, index) => ({
              id: `${org.id}-${index + 1}`,
              name: playerName,
            })),
        }))
      ),
    []
  )
  const teams = data ?? []

  return (
    <div className="team-container">
      <h1>Meet The Teams</h1>

      <div className="teams-grid">
        {teams.map((team) => (
          <button
            key={team.id}
            className={`team-button ${
              selectedTeam?.id === team.id ? 'active' : ''
            }`}
            onClick={() => setSelectedTeam(team)}
          >
            {team.name}
          </button>
        ))}
      </div>

      <div className="players-container">
        {loading ? (
          <p className="no-team-selected">Loading teams...</p>
        ) : error ? (
          <p className="no-team-selected">{error}</p>
        ) : selectedTeam ? (
          <>
            <h2>{selectedTeam.name}</h2>
            <div className="players-grid">
              {selectedTeam.players.map((player) => (
                <div key={player.id} className="player-card">
                  <ImageWithFallback
                    src={getPlayerImage(player.name)}
                    fallback={DEFAULT_IMAGE}
                    loading="lazy"
                    decoding="async"
                  />
                  <p>{player.name}</p>
                </div>
              ))}
            </div>
          </>
        ) : teams.length ? (
          <p className="no-team-selected">
            Select a team to view players
          </p>
        ) : (
          <p className="no-team-selected">No teams found.</p>
        )}
      </div>
    </div>
  )
}

export default Team
