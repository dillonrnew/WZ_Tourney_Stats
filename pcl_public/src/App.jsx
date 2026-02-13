import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import TournamentsTab from './pages/Left Bar Pages/TournamentsTab'
import PlayerStatsTab from './pages/Left Bar Pages/PlayerStatsTab'
import LeaderboardTab from './pages/Left Bar Pages/LeaderboardTab'
import MeetTheTeamsTab from './pages/Left Bar Pages/MeetTheTeamsTab'
import TeamStatsTab from './pages/Left Bar Pages/TeamStatsTab'
import IndividualTournament from './pages/IndividualTournament'
import Finals from './pages/Major Tournament Pages/Finals'
import GroupStages from './pages/Major Tournament Pages/GroupStages'
import './App.css'
import './styles/TournamentPage.css'

function App() {
  const pages = [
    { name: 'Tournaments', path: '/tournaments', icon: '目' },
    { name: 'Player Stats', path: '/player-stats', icon: '📊' },
    { name: 'Team Stats', path: '/team-stats', icon: '📈' },
    { name: 'Leaderboards', path: '/leaderboards', icon: '🏆' },
    { name: 'Meet The Teams', path: '/teams', icon: '👥' },
  ]

  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
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
            
            <Route path="/tournament/:id" element={<IndividualTournament />} />
            <Route path="/tournament/:id/finals" element={<Finals />} />
            <Route path="/tournament/:id/GroupStages" element={<GroupStages />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
