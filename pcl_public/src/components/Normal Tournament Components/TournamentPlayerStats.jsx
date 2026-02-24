import { useEffect, useState } from 'react'
import '../../styles/TournamentPlayerStats.css'
import { fetchRows } from '../../lib/supabaseRest'

const PLAYER_IMAGE_BASE =
  'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures'

const TEAM_IMAGE_BASE =
  'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos'

const DEFAULT_PLAYER_IMAGE = `${PLAYER_IMAGE_BASE}/DEFAULT.png`
const DEFAULT_TEAM_IMAGE = `${TEAM_IMAGE_BASE}/NONE.png`

function PlayerStats({ tournamentId }) {
  const [players, setPlayers] = useState([])
  const [resolvedImages, setResolvedImages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError('')
      setResolvedImages(null)

      try {
        const [teamRows, mapRows] = await Promise.all([
          fetchRows('Team Data', {
            select: 'id,team_name,player_1,player_2,player_3',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('Map Data', {
            select: 'team_id,player_1_kills,player_2_kills,player_3_kills',
            filters: { tournament_id: tournamentId },
          }),
        ])

        const teamsById = new Map(teamRows.map((team) => [team.id, team]))
        const totalsByPlayerKey = new Map()

        const addKills = (teamId, playerName, teamName, kills) => {
          if (!playerName) return
          const key = `${teamId}:${playerName}`
          const current = totalsByPlayerKey.get(key) || {
            id: key,
            name: playerName,
            team: teamName || 'Unknown Team',
            value: 0,
          }
          current.value += Number(kills || 0)
          totalsByPlayerKey.set(key, current)
        }

        mapRows.forEach((row) => {
          const team = teamsById.get(row.team_id)
          addKills(row.team_id, team?.player_1, team?.team_name, row.player_1_kills)
          addKills(row.team_id, team?.player_2, team?.team_name, row.player_2_kills)
          addKills(row.team_id, team?.player_3, team?.team_name, row.player_3_kills)
        })

        const nextPlayers = Array.from(totalsByPlayerKey.values()).sort(
          (a, b) => b.value - a.value || a.name.localeCompare(b.name),
        )

        if (!cancelled) {
          setPlayers(nextPlayers)
        }
      } catch (err) {
        if (!cancelled) {
          setPlayers([])
          setError(err.message || 'Failed to load player stats.')
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
      setPlayers([])
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  useEffect(() => {
    let cancelled = false

    const preloadAll = async () => {
      const nextImages = {}

      players.forEach((player) => {
        nextImages[player.id] = {
          avatar: DEFAULT_PLAYER_IMAGE,
          badge: DEFAULT_TEAM_IMAGE,
        }
      })

      if (!cancelled) {
        setResolvedImages(nextImages)
      }
    }

    if (players.length) {
      preloadAll()
    } else {
      setResolvedImages({})
    }

    return () => {
      cancelled = true
    }
  }, [players])

  if (loading || resolvedImages === null) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
        Loading Player Stats...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
        {error}
      </div>
    )
  }

  if (!players.length) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
        No player stats found.
      </div>
    )
  }

  return (
    <div className="PlayerStatsPage">
      <h2 className="PlayerStatsPage__title">Player Stats</h2>

      <div className="PlayerStatsPage__list">
        {players.map((player, index) => {
          const rank = index + 1
          const rankClass = rank <= 5 ? `PlayerStatsPage__card--rank${rank}` : ''
          const images = resolvedImages?.[player.id] || {
            avatar: DEFAULT_PLAYER_IMAGE,
            badge: DEFAULT_TEAM_IMAGE,
          }

          return (
            <div key={player.id} className={`PlayerStatsPage__card ${rankClass}`}>
              <div className="PlayerStatsPage__rank">{rank}</div>

              <img className="PlayerStatsPage_OrgLogos" src={images.badge} alt="" />

              <img className="PlayerStatsPage_PlayerPics" src={images.avatar} alt="" />

              <div className="PlayerStatsPage__name">{player.name}</div>

              <div className="PlayerStatsPage__value">{player.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayerStats
