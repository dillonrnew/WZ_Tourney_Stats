import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Leaderboard from '../components/Normal Tournament Components/TournamentLeaderboard'
import PlayerStats from '../components/Normal Tournament Components/TournamentPlayerStats'
import TeamStats from '../components/Normal Tournament Components/TournamentTeamStats'
import MapWins from '../components/Normal Tournament Components/TournamentMapWins'
import '../styles/TournamentsPage.css'
import '../styles/TournamentPage.css'

function Tournament() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [showPage, setShowPage] = useState(false)

  const tournamentName = `Tournament ${id}`

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const tabs = [
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'player-stats', label: 'Player Stats' },
    { key: 'team-stats', label: 'Team Stats' },
    { key: 'map-wins', label: 'Map Wins' },
  ]

  return (
    <div className="tournament-page">
      {/* Top Bar */}
      <div className="tournament-topbar">
        <h1>{tournamentName}</h1>
      </div>

      {/* Mount ALL tabs immediately (hidden until showPage) */}
      <div style={{ display: showPage ? 'block' : 'none' }}>
        {/* Navigation Tabs */}
        <div className="tournament-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="tournament-content">
          <div
            className="tournament-tab-panel"
            style={{ display: activeTab === 'leaderboard' ? 'block' : 'none' }}
          >
            <Leaderboard tournamentId={id} />
          </div>

          <div
            className="tournament-tab-panel"
            style={{ display: activeTab === 'player-stats' ? 'block' : 'none' }}
          >
            <PlayerStats tournamentId={id} />
          </div>

          <div
            className="tournament-tab-panel"
            style={{ display: activeTab === 'team-stats' ? 'block' : 'none' }}
          >
            <TeamStats tournamentId={id} />
          </div>

          <div
            className="tournament-tab-panel"
            style={{ display: activeTab === 'map-wins' ? 'block' : 'none' }}
          >
            <MapWins tournamentId={id} />
          </div>
        </div>
      </div>

      {/* Optional: tiny placeholder during 250ms */}
      {!showPage && (
        <div className="tournament-content">
          <div style={{ padding: 24, opacity: 0.6 }}>
            Loading tournament…
          </div>
        </div>
      )}
    </div>
  )
}

export default Tournament
