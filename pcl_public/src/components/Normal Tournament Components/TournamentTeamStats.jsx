import { useEffect, useMemo, useState } from 'react'
import '../../styles/TournamentTeamStats.css'
import { fetchRows } from '../../lib/supabaseRest'

const TEAM_IMAGE_BASE =
  'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos'

const DEFAULT_TEAM_IMAGE = `${TEAM_IMAGE_BASE}/NONE.png`

const getTeamImage = () => DEFAULT_TEAM_IMAGE

function TeamStats({ tournamentId }) {
  const [hoveredTeamId, setHoveredTeamId] = useState(null)
  const [teams, setTeams] = useState([])
  const [teamKills, setTeamKills] = useState([])
  const [avgPlacement, setAvgPlacement] = useState([])
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
            select: 'id,team_name',
            filters: { tournament_id: tournamentId },
          }),
          fetchRows('Map Data', {
            select: 'team_id,team_kills,map_placement',
            filters: { tournament_id: tournamentId },
          }),
        ])

        const teamsList = teamRows.map((team) => ({
          teamId: team.id,
          name: team.team_name || 'Unknown Team',
          avatar: getTeamImage(team.team_name || ''),
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
          setTeams(teamsList)
          setTeamKills(killsRows)
          setAvgPlacement(placementRows)
        }
      } catch (err) {
        if (!cancelled) {
          setTeams([])
          setTeamKills([])
          setAvgPlacement([])
          setError(err.message || 'Failed to load team stats.')
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
      setTeamKills([])
      setAvgPlacement([])
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  const teamById = useMemo(() => {
    const map = new Map()
    teams.forEach((team) => map.set(team.teamId, team))
    return map
  }, [teams])

  const renderColumn = (title, rows) => (
    <div className="TeamStatsPage__halfInner">
      <h3 className="TeamStatsPage__columnTitle">{title}</h3>

      <div className="TeamStatsPage__list">
        {rows.map((row, index) => {
          const rank = index + 1
          const team = teamById.get(row.teamId)
          const isHovered = hoveredTeamId === row.teamId
          const rankClass = rank <= 5 ? `TeamStatsPage__card--rank${rank}` : ''

          return (
            <div
              key={`${title}-${row.teamId}`}
              className={[
                'TeamStatsPage__card',
                rankClass,
                isHovered ? 'TeamStatsPage__card--hoverMatch' : '',
              ].join(' ')}
              onMouseEnter={() => setHoveredTeamId(row.teamId)}
              onMouseLeave={() => setHoveredTeamId(null)}
            >
              <div className="TeamStatsPage__rank">{rank}</div>

              <img
                className="TeamStatsPage__avatar"
                src={team?.avatar || DEFAULT_TEAM_IMAGE}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = DEFAULT_TEAM_IMAGE
                }}
              />

              <div className="TeamStatsPage__name">{team?.name || 'Unknown'}</div>

              <div className="TeamStatsPage__value">{row.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (loading) {
    return <div className="TeamStatsPage">Loading team stats...</div>
  }

  if (error) {
    return <div className="TeamStatsPage">{error}</div>
  }

  if (!teams.length) {
    return <div className="TeamStatsPage">No team stats found.</div>
  }

  return (
    <div className="TeamStatsPage">
      <h2 className="TeamStatsPage__title">Team Stats</h2>

      <div className="TeamStatsPage__split">
        <div className="TeamStatsPage__half">
          {renderColumn('Team Kills', teamKills)}
        </div>

        <div className="TeamStatsPage__half">
          {renderColumn('Average Placement', avgPlacement)}
        </div>
      </div>
    </div>
  )
}

export default TeamStats
