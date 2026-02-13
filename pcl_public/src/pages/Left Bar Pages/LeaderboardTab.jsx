// src/pages/Leaderboards.jsx
import "../../styles/Left Bar Pages/LeaderboardTab.css"

const featuredStats = [
  {
    title: "Highest Kill Game",
    player: "BLAZT",
    value: "27 KILLS",
    org: "AG GLOBAL",
    image: "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures/RATED.png",
    context: "Week 3 Finals",
  },
  {
    title: "Highest Total Points",
    player: "SAGE",
    value: "142 PTS",
    org: "EKLETYC",
    image: "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures/SHIFTY.png",
    context: "Season Record",
  },
  {
    title: "Most Damage in a Game",
    player: "ECHO",
    value: "4,820 DMG",
    org: "GEN.G",
    image: "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures/SCUMMN.png",
    context: "Map 5",
  },
]

const topKillGames = [
  { rank: 1, name: "BLAZT", value: 27 },
  { rank: 2, name: "SAGE", value: 25 },
  { rank: 3, name: "ECHO", value: 24 },
  { rank: 4, name: "SKULLFACE", value: 23 },
  { rank: 5, name: "NOVA", value: 22 },
]

const teamHighlights = [
  {
    title: "Best Team Game",
    org: "AG GLOBAL",
    roster: "BLAZT | SAGE | ECHO",
    value: "142 TOTAL POINTS",
    logo: "/orgs/AG_GLOBAL.png",
  },
  {
    title: "Best Avg Placement",
    org: "ESC",
    roster: "SKULLFACE | ECHO | SAGE",
    value: "2.10 AVG",
    logo: "/orgs/ESC.png",
  },
]

function Leaderboards() {
  return (
    <div className="Leaderboards">
      {/* HEADER */}
      <header className="Leaderboards__header">
        <h1>LEADERBOARDS</h1>
        <p>Top performances this season</p>
      </header>

      {/* FEATURED */}
      <section className="Leaderboards__section">
        <h2 className="Leaderboards__sectionTitle">Featured Performances</h2>

        <div className="Leaderboards__featuredGrid">
          {featuredStats.map((stat) => (
            <div key={stat.title} className="FeaturedCard">
              <img
                src={stat.image}
                alt={stat.player}
                className="FeaturedCard__image"
              />

              <div className="FeaturedCard__overlay">
                <div className="FeaturedCard__title">{stat.title}</div>
                <div className="FeaturedCard__player">{stat.player}</div>
                <div className="FeaturedCard__value">{stat.value}</div>
                <div className="FeaturedCard__meta">
                  {stat.org} • {stat.context}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP LISTS */}
      <section className="Leaderboards__section">
        <h2 className="Leaderboards__sectionTitle">Top Performers</h2>

        <div className="Leaderboards__listGrid">
          <div className="TopListCard">
            <h3>Top 5 Kill Games</h3>

            {topKillGames.map((row) => (
              <div key={row.rank} className="TopListRow">
                <span className="TopListRow__rank">{row.rank}</span>
                <span className="TopListRow__name">{row.name}</span>
                <span className="TopListRow__value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM HIGHLIGHTS */}
      <section className="Leaderboards__section">
        <h2 className="Leaderboards__sectionTitle">Team Highlights</h2>

        <div className="Leaderboards__teamGrid">
          {teamHighlights.map((team) => (
            <div key={team.title} className="TeamHighlightCard">
              <h3>{team.title}</h3>

              <img
                src={team.logo}
                alt={team.org}
                className="TeamHighlightCard__logo"
              />

              <div className="TeamHighlightCard__roster">
                {team.roster}
              </div>

              <div className="TeamHighlightCard__value">
                {team.value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Leaderboards
