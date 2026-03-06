import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Leaderboard from '../../components/Normal Tournament Components/TournamentLeaderboard'
import TournamentStatsTab from '../../components/Normal Tournament Components/TournamentStatsTab'
import MapWins from '../../components/Normal Tournament Components/TournamentMapWins'
import '../../styles/Major Tournament Pages/Finals.css'

function Finals() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [showPage, setShowPage] = useState(false)

  const finalsName = `Pullze Check Ladder Finals`

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true)
    }, 750)

    return () => clearTimeout(timer)
  }, [])

  const tabs = [
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'stats', label: 'Stats' },
    { key: 'map-wins', label: 'Map Wins' },
  ]

  return (
    <div className="finals-page">
      {/* Top Bar */}
      <div className="finals-topbar">
        <h1>{finalsName}</h1>
      </div>

      <div style={{ display: showPage ? 'block' : 'none' }}>
        {/* Navigation Tabs */}
        <div className="finals-tabs">
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
        <div className="finals-content">
          <div style={{ display: activeTab === 'leaderboard' ? 'block' : 'none' }}>
            <Leaderboard tournamentId={id} />
          </div>

          <div style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
            <TournamentStatsTab tournamentId={id} />
          </div>

          <div style={{ display: activeTab === 'map-wins' ? 'block' : 'none' }}>
            <MapWins tournamentId={id} />
          </div>
        </div>
      </div>

      {!showPage && (
        <div className="finals-content">
          <div style={{ padding: 24, opacity: 0.6 }}>
            Loading finals…
          </div>
        </div>
      )}
    </div>
  )
}

export default Finals
