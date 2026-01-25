import { useParams } from 'react-router-dom'
import { useState } from 'react'
import Leaderboard from '../components/TournamentLeaderboard'
import PlayerStats from '../components/TournamentPlayerStats'
import TeamStats from '../components/TournamentTeamStats'
import MapWins from '../components/TournamentMapWins' // <-- new tab
import '../styles/TournamentsPage.css'

function Tournament() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('leaderboard')

  const tournamentName = `Tournament ${id}`

  // Tabs list
  const tabs = [
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'player-stats', label: 'Player Stats' },
    { key: 'team-stats', label: 'Team Stats' },
    { key: 'map-wins', label: 'Map Wins' }, // new tab
  ]

  // Render active content
  const renderContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <Leaderboard />
      case 'player-stats':
        return <PlayerStats />
      case 'team-stats':
        return <TeamStats />
      case 'map-wins':
        return <MapWins />
      default:
        return null
    }
  }

  return (
    <div className="tournament-page">
      {/* Top Bar */}
      <div className="tournament-topbar">
        <h1>{tournamentName}</h1>
      </div>

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
      <div className="tournament-content">{renderContent()}</div>
    </div>
  )
}

export default Tournament
