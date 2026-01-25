import TournamentCard from '../components/TournamentCard'
import '../styles/Tournaments.css'

function Home() {
  const tournaments = [
    { 
      id: 1, 
      name: 'Pullze Check Ladder', 
      image: 'https://pbs.twimg.com/media/G-fRVqZXAAAOBHA?format=jpg&name=large'
    },
    { 
      id: 2, 
      name: 'Pullzecheck Scrims', 
      image: 'https://via.placeholder.com/250x150?text=Pullzecheck' 
    },
    { 
      id: 3, 
      name: 'Kenton Scrims', 
      image: 'https://via.placeholder.com/250x150?text=Kenton' 
    },
    { 
      id: 4, 
      name: 'Pheonix_arena Scrims', 
      image: 'https://via.placeholder.com/250x150?text=Pheonix' 
    },
  ]

  const tournamentItems = {
    1: [
      { id: 1, title: 'GEN.G leads', time: '1 hour ago' },
      { id: 2, title: 'AG GLOBAL 2nd', time: '1 hour ago' },
      { id: 3, title: 'LFAO 3rd', time: '1 hour ago' },
    ],
    2: [
      { id: 4, title: 'WZPD vs #ON', time: '2 hours ago' },
      { id: 5, title: 'GENTLE MATES vs T1', time: '3 hours ago' },
      { id: 6, title: 'NIP vs SVGE', time: '4 hours ago' },
    ],
    3: [
      { id: 7, title: 'ESC won', time: '30 mins ago' },
      { id: 8, title: 'TEAM BAKA won', time: '1 hour ago' },
      { id: 9, title: 'TEAM ZEBRA won', time: '2 hours ago' },
    ],
    4: [
      { id: 10, title: 'ORGLESS defeated', time: '45 mins ago' },
      { id: 11, title: 'EKLETYC qualified', time: '1.5 hours ago' },
      { id: 12, title: 'RVX vs ORGLESS', time: '3 hours ago' },
    ],
    5: [
      { id: 13, title: 'Arena match ongoing', time: 'Just now' },
      { id: 14, title: 'GEN.G vs AG GLOBAL', time: '30 mins ago' },
      { id: 15, title: 'LFAO qualified', time: '1 hour ago' },
    ],
  }

  const recentScrims = [
    { id: 1, title: 'GEN.G vs AG GLOBAL', time: '2 hours ago', status: 'Completed' },
    { id: 2, title: 'LFAO vs WZPD', time: '4 hours ago', status: 'Completed' },
    { id: 3, title: 'T1 vs NINJAS IN PYJAMAS', time: '6 hours ago', status: 'Completed' },
    { id: 4, title: '#ON vs GENTLE MATES', time: '8 hours ago', status: 'Completed' },
    { id: 5, title: 'SVGE ESPORTS vs ESC', time: '10 hours ago', status: 'Completed' },
    { id: 6, title: 'TEAM BAKA vs TEAM ZEBRA', time: '12 hours ago', status: 'Completed' },
  ]

  return (
    <div className="tournaments-container">
      <div className="tournaments-main">
        <h1>Tournaments</h1>
        <div className="tournaments-grid">
          {tournaments.map((tournament) => (
            <TournamentCard 
              key={tournament.id} 
              tournament={tournament}
              items={tournamentItems[tournament.id]}
            />
          ))}
        </div>
      </div>
      <aside className="recent-scrims-sidebar">
        <h2>Recent Scrims</h2>
        <div className="scrims-list">
          {recentScrims.map((scrim) => (
            <div key={scrim.id} className="scrim-item">
              <p className="scrim-title">{scrim.title}</p>
              <p className="scrim-time">{scrim.time}</p>
              <p className="scrim-status">{scrim.status}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default Home
