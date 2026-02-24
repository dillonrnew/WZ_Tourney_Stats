import { useEffect, useMemo, useState } from 'react'
import '../../styles/Leaderboard.css'
import { fetchRows } from '../../lib/supabaseRest'

const BASE_IMAGE_URL =
  'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos'

const DEFAULT_TEAM_IMAGE = `${BASE_IMAGE_URL}/NONE.png`

// Convert team name to filename-safe format
const getTeamImage = () => {
  return DEFAULT_TEAM_IMAGE
}

const formatScore = (score) => {
  if (Number.isInteger(score)) return score
  return Number(score.toFixed(2))
}

function Leaderboard({ tournamentId }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [teamRows, mapRows] = await Promise.all([
          fetchRows('Team Data', {
            select: 'id,team_name,player_1,player_2,player_3',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('Map Data', {
            select: 'team_id,map_points',
            filters: { tournament_id: tournamentId },
          }),
        ])

        const scoreByTeamId = new Map()
        mapRows.forEach((row) => {
          const current = scoreByTeamId.get(row.team_id) || 0
          scoreByTeamId.set(row.team_id, current + Number(row.map_points || 0))
        })

        const nextTeams = teamRows
          .map((team) => ({
            id: team.id,
            name: team.team_name || 'Unknown Team',
            players: [team.player_1, team.player_2, team.player_3].filter(Boolean),
            score: scoreByTeamId.get(team.id) || 0,
          }))
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

        if (!cancelled) {
          setTeams(nextTeams)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load leaderboard data.')
          setTeams([])
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
      setTeams([])
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [tournamentId])

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
        <div />
        <div className="header-text">#</div>
        <div className="header-text header-team">Team</div>
        <div className="header-text header-score">Score</div>
      </div>

      {columnTeams.map((team, index) => (
        <div key={team.id} className="leaderboard-row">
          <img
            src={getTeamImage(team.name)}
            alt=""
            className="team-logo"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = DEFAULT_TEAM_IMAGE
            }}
          />

          <div className="team-placement">
            {index + 1 + offset}
          </div>

          <div className="team-info">
            <div className="team-name">{team.name}</div>
            <div className="team-players">
              {team.players.join(' | ')}
            </div>
          </div>

          <div className="team-score">{formatScore(team.score)}</div>
        </div>
      ))}
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
