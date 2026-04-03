import { useEffect, useState } from 'react'
import { fetchRows } from '../../lib/supabaseRest'
import '../../styles/Left Bar Pages/MeetTheTeamsTab.css'

function Team() {
  const BASE_IMAGE_URL =
    'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots'
  const DEFAULT_IMAGE = `${BASE_IMAGE_URL}/DEFAULT.png`

  const getPlayerImage = (playerName) =>
    playerName
      ? `${BASE_IMAGE_URL}/${encodeURIComponent(String(playerName).trim().toUpperCase())}.png`
      : DEFAULT_IMAGE

  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadOrganizations = async () => {
      setLoading(true)
      setError('')

      try {
        const rows = await fetchRows('organizations', {
          select: 'id,org_name,player_1,player_2,player_3',
          order: { column: 'org_name', ascending: true },
        })

        const mappedTeams = (rows || []).map((org) => ({
          id: org.id,
          name: org.org_name || 'Unknown Org',
          players: [org.player_1, org.player_2, org.player_3]
            .filter(Boolean)
            .map((playerName, index) => ({
              id: `${org.id}-${index + 1}`,
              name: playerName,
            })),
        }))

        if (!cancelled) {
          setTeams(mappedTeams)
        }
      } catch (err) {
        if (!cancelled) {
          setTeams([])
          setError(err.message || 'Failed to load organizations.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOrganizations()

    return () => {
      cancelled = true
    }
  }, [])

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
                  <img
                    src={getPlayerImage(player.name)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = DEFAULT_IMAGE
                    }}
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
