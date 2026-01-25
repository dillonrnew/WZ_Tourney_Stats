import '../styles/TournamentMapWins.css'

function TournamentMapWins() {
  const mapsData = [
  {
    mapNumber: 1,
    images: [
      'https://via.placeholder.com/36x36?text=A',
      'https://via.placeholder.com/36x36?text=B',
      'https://via.placeholder.com/36x36?text=C',
    ],
    teamName: 'GEN.G',
    players: ['AYDAN', 'RATED', 'LENUN'],
    kills: 34,
  },
  {
    mapNumber: 2,
    images: [
      'https://via.placeholder.com/36x36?text=D',
      'https://via.placeholder.com/36x36?text=E',
      'https://via.placeholder.com/36x36?text=F',
    ],
    teamName: 'AG GLOBAL',
    players: ['FIFAKILL', 'OEKIY', 'SCUMMN'],
    kills: 27,
  },
  {
    mapNumber: 3,
    images: [
      'https://via.placeholder.com/36x36?text=G',
      'https://via.placeholder.com/36x36?text=H',
      'https://via.placeholder.com/36x36?text=I',
    ],
    teamName: 'LFAO',
    players: ['PLAYER1', 'PLAYER2', 'PLAYER3'],
    kills: 22,
  },
  {
    mapNumber: 4,
    images: [
      'https://via.placeholder.com/36x36?text=J',
      'https://via.placeholder.com/36x36?text=K',
      'https://via.placeholder.com/36x36?text=L',
    ],
    teamName: 'WZPD',
    players: ['ALPHA', 'BRAVO', 'CHARLIE'],
    kills: 19,
  },
  {
    mapNumber: 5,
    images: [
      'https://via.placeholder.com/36x36?text=M',
      'https://via.placeholder.com/36x36?text=N',
      'https://via.placeholder.com/36x36?text=O',
    ],
    teamName: 'T1',
    players: ['DELTA', 'ECHO', 'FOXTROT'],
    kills: 25,
  },
  {
    mapNumber: 6,
    images: [
      'https://via.placeholder.com/36x36?text=P',
      'https://via.placeholder.com/36x36?text=Q',
      'https://via.placeholder.com/36x36?text=R',
    ],
    teamName: 'NIP',
    players: ['GAMMA', 'HOTEL', 'INDIA'],
    kills: 30,
  },
  {
    mapNumber: 7,
    images: [
      'https://via.placeholder.com/36x36?text=S',
      'https://via.placeholder.com/36x36?text=T',
      'https://via.placeholder.com/36x36?text=U',
    ],
    teamName: 'SVGE',
    players: ['JULIET', 'KILO', 'LIMA'],
    kills: 28,
  },
  {
    mapNumber: 8,
    images: [
      'https://via.placeholder.com/36x36?text=V',
      'https://via.placeholder.com/36x36?text=W',
      'https://via.placeholder.com/36x36?text=X',
    ],
    teamName: 'ESC',
    players: ['MIKE', 'NOVEMBER', 'OSCAR'],
    kills: 21,
  },
];


  return (
    <div className="map-wins-container">
      {mapsData.map((map, idx) => (
        <div key={idx} className="map-row">
          <div className="map-label">Map {map.mapNumber}</div>

          <div className="map-images">
            {map.images.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`player-${i}`}
                className="map-image"
                style={{ left: `${i * 18}px` }}
              />
            ))}
          </div>

          <div className="map-team-info">
            <div className="team-name">{map.teamName}</div>
            <div className="team-players">{map.players.join(' | ')}</div>
          </div>

          <div className="map-kills">{map.kills}</div>
        </div>
      ))}
    </div>
  )
}

export default TournamentMapWins
