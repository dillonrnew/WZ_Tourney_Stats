import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import TournamentsTab from './pages/Left Bar Pages/TournamentsTab'
import PlayerStatsTab from './pages/Left Bar Pages/PlayerStatsTab'
import LeaderboardTab from './pages/Left Bar Pages/LeaderboardTab'
import MeetTheTeamsTab from './pages/Left Bar Pages/MeetTheTeamsTab'
import TeamStatsTab from './pages/Left Bar Pages/TeamStatsTab'
import IndividualTournament from './pages/IndividualTournament'
import PCLSeason1Finals from './pages/Major Tournament Pages/PCLSeason1Finals'
import PCLSeason1GroupStages from './pages/Major Tournament Pages/PCLSeason1GroupStages'
import PCLSeason1QualifiersPage from './pages/Major Tournament Pages/PCLSeason1QualifiersPage'
import AdminTournaments from './pages/AdminTournaments'
import './App.css'
import './styles/TournamentPage.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pages = [
    { name: 'Tournaments', path: '/tournaments', icon: '🎯' },
    { name: 'Player Stats', path: '/player-stats', icon: '📊' },
    { name: 'Team Stats', path: '/team-stats', icon: '📈' },
    { name: 'Leaderboards', path: '/leaderboards', icon: '🏆' },
    { name: 'Meet The Teams', path: '/teams', icon: '👥' },
  ]

  return (
    <Router>
      <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-hidden'}`}>
        <aside className="sidebar">
          <div className="sidebar-toggle-wrap">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? 'Hide left sidebar' : 'Show left sidebar'}
            >
              {isSidebarOpen ? '<' : '>'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {pages.map((page) => (
              <NavLink key={page.path} to={page.path} className="sidebar-link">
                <div className="link-block">
                  <span className="link-icon">{page.icon}</span>
                  <h3 className="link-title">{page.name}</h3>
                </div>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <p>
              Developed by{' '}
              <a href="https://twitter.com/SUM_WZ" target="_blank" rel="noopener noreferrer">
                @SUM
              </a>
            </p>
          </div>
        </aside>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/tournaments" replace />} />
            <Route path="/tournaments" element={<TournamentsTab />} />
            <Route path="/player-stats" element={<PlayerStatsTab />} />
            <Route path="/team-stats" element={<TeamStatsTab />} />
            <Route path="/leaderboards" element={<LeaderboardTab />} />
            <Route path="/teams" element={<MeetTheTeamsTab />} />
            <Route path="/admin/tournaments" element={<AdminTournaments />} />

            <Route path="/tournament/:id" element={<IndividualTournament />} />
            <Route path="/tournament/:id/qualifiers" element={<PCLSeason1QualifiersPage />} />
            <Route path="/tournament/:id/finals" element={<PCLSeason1Finals />} />
            <Route path="/tournament/:id/GroupStages" element={<PCLSeason1GroupStages />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
