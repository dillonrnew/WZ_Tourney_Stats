import '../styles/TournamentCard.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function TournamentCard({ tournament, items }) {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState(
    items?.[0]?.category || 'all'
  )

  // Get unique categories
  const categories = items
    ? [...new Set(items.map((item) => item.category || 'all'))]
    : []

  // Filter items
  const filteredItems =
    activeFilter === 'all'
      ? items
      : items?.filter((item) => item.category === activeFilter)

  const handleCardClick = () => {
    navigate(`/tournament/${tournament.id}`)
  }

  return (
    <div
      className="tournament-card-container"
      onClick={handleCardClick}
      role="button"
    >
      <div className="card-header-image">
        <img src={tournament.image || ''} alt={tournament.name} />
        <div className="card-overlay"></div>

        <div className="card-header-content">
          <h3 className="card-title-overlay">{tournament.name}</h3>
          <p className="card-subtitle">
            {tournament.subtitle || 'Latest events'}
          </p>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="card-filters" onClick={(e) => e.stopPropagation()}>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-tab ${
                activeFilter === category ? 'active' : ''
              }`}
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="card-items" onClick={(e) => e.stopPropagation()}>
        {filteredItems &&
          filteredItems.map((item) => (
            <button key={item.id} className="card-item-box">
              <div className="item-icon">{item.icon || '⚡'}</div>

              <div className="item-content">
                <p className="item-text">{item.title}</p>
                {item.time && (
                  <p className="item-time">{item.time}</p>
                )}
              </div>

              <div className="item-arrow">›</div>
            </button>
          ))}
      </div>
    </div>
  )
}

export default TournamentCard
