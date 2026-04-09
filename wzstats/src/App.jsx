import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import TournamentsTab from './pages/Left Bar Pages/TournamentsTab'
import PlayerStatsTab from './pages/Left Bar Pages/PlayerStatsTab'
import LeaderboardTab from './pages/Left Bar Pages/LeaderboardTab'
import MeetTheTeamsTab from './pages/Left Bar Pages/MeetTheTeamsTab'
import TeamStatsTab from './pages/Left Bar Pages/TeamStatsTab'
import IndividualTournament from './pages/IndividualTournament'
import PCLSeason1Finals from './pages/Major Tournament Pages/PCLSeason1Finals'
import PCLSeason1GroupStages from './pages/Major Tournament Pages/PCLSeason1GroupStages'
import PCLSeason1QualifiersPage from './pages/Major Tournament Pages/PCLSeason1QualifiersPage'
import PCLSeason2Finals from './pages/Major Tournament Pages/PCLSeason2Finals'
import PCLSeason2GroupStages from './pages/Major Tournament Pages/PCLSeason2GroupStages'
import PCLSeason2QualifiersPage from './pages/Major Tournament Pages/PCLSeason2QualifiersPage'
import AdminTournaments from './pages/AdminTournaments'
import StandaloneTierListPage from './pages/StandaloneTierListPage'
import './App.css'
import './styles/TournamentPage.css'

function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth > 768 : true
  )
  const location = useLocation()

  // Close sidebar automatically when navigating on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  const isStandaloneTierRoute =
    location.pathname === '/tier-list-lab' || location.pathname === '/tier-list-lab/'
  const pages = [
    {
      name: 'Tournaments',
      path: '/tournaments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
        </svg>
      ),
    },
    {
      name: 'Player Stats',
      path: '/player-stats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      ),
    },
    {
      name: 'Team Stats',
      path: '/team-stats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
    },
    {
      name: 'Orgs',
      path: '/teams',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      ),
    },
  ]

  if (isStandaloneTierRoute) {
    return (
      <main className="page-content page-content--standalone">
        <Routes>
          <Route path="/tier-list-lab" element={<StandaloneTierListPage />} />
          <Route path="/tier-list-lab/" element={<StandaloneTierListPage />} />
        </Routes>
      </main>
    )
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-hidden'}`}>
      {/* Mobile-only hamburger button — hidden on desktop via CSS */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open navigation"
      >
        ☰
      </button>

      {/* Backdrop dims content when sidebar overlays on mobile */}
      <div
        className="sidebar-backdrop"
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

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
                <span className="link-icon link-icon--svg">{page.icon}</span>
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
          <Route path="/pcl-season-2/:id/qualifiers" element={<PCLSeason2QualifiersPage />} />
          <Route path="/pcl-season-2/:id/finals" element={<PCLSeason2Finals />} />
          <Route path="/pcl-season-2/:id/GroupStages" element={<PCLSeason2GroupStages />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
