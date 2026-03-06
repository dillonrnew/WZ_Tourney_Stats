import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Leaderboard from '../components/Normal Tournament Components/TournamentLeaderboard'
import TournamentStatsTab from '../components/Normal Tournament Components/TournamentStatsTab'
import MapWins from '../components/Normal Tournament Components/TournamentMapWins'
import { fetchRows } from '../lib/supabaseRest'
import '../styles/TournamentsPage.css'
import '../styles/TournamentPage.css'

function Tournament() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [loadedTabs, setLoadedTabs] = useState({ leaderboard: true })
  const [showPage, setShowPage] = useState(false)
  const [tournamentName, setTournamentName] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadTournamentName = async () => {
      if (!id) {
        setTournamentName('')
        return
      }

      try {
        const rows = await fetchRows('tournaments', {
          select: 'id,"Name"',
          filters: { id },
        })

        if (!cancelled) {
          const row = rows?.[0] || {}
          setTournamentName(row['Name'] || '')
        }
      } catch {
        if (!cancelled) {
          setTournamentName('')
        }
      }
    }

    loadTournamentName()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const tabs = [
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'stats', label: 'Stats' },
    { key: 'map-wins', label: 'Map Wins' },
  ]

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setLoadedTabs((prev) => (prev[tabKey] ? prev : { ...prev, [tabKey]: true }))
  }

  return (
    <div className="tournament-page">
      {/* Top Bar */}
      <div className="tournament-topbar">
        <h1>{tournamentName}</h1>
      </div>

      {/* Mount tabs on first open, then keep mounted */}
      <div style={{ display: showPage ? 'block' : 'none' }}>
        {/* Navigation Tabs */}
        <div className="tournament-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => handleTabChange(tab.key)}
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
            {loadedTabs.leaderboard ? <Leaderboard tournamentId={id} /> : null}
          </div>

          <div
            className="tournament-tab-panel"
            style={{ display: activeTab === 'stats' ? 'block' : 'none' }}
          >
            {loadedTabs.stats ? <TournamentStatsTab tournamentId={id} /> : null}
          </div>

          <div
            className="tournament-tab-panel"
            style={{ display: activeTab === 'map-wins' ? 'block' : 'none' }}
          >
            {loadedTabs['map-wins'] ? <MapWins tournamentId={id} /> : null}
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
