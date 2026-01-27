import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import TournamentPage from './pages/TournamentsPage'
import About from './pages/About'
import Services from './pages/Services'
import Team from './pages/AboutTheTeams'
import Stats from './pages/Stats'
import Tournament from './pages/Tournament'
import './App.css'
import './styles/TournamentPage.css'

function App() {
  const pages = [
    { name: 'Tournaments', path: '/tournaments', icon: '目' },
    { name: 'Player Stats', path: '/player-stats', icon: '📊' },
    { name: 'Leaderboards', path: '/leaderboards', icon: '🏆' },
    { name: 'Stats', path: '/stats', icon: '📈' },
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
            <Route path="/tournaments" element={<TournamentPage />} />
            <Route path="/player-stats" element={<About />} />
            <Route path="/leaderboards" element={<Services />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/teams" element={<Team />} />
            <Route path="/tournament/:id" element={<Tournament />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
