import '../../styles/TournamentMapWins.css'

const BASE_IMAGE_URL =
  'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures'

const DEFAULT_IMAGE = `${BASE_IMAGE_URL}/DEFAULT.png`

function TournamentMapWins() {
  const mapsData = [
    {
      mapNumber: 1,
      teamName: 'GEN.G',
      players: ['AYDAN', 'RATED', 'LENUN'],
      kills: 34,
    },
    {
      mapNumber: 2,
      teamName: 'AG GLOBAL',
      players: ['FIFAKILL', 'OEKIY', 'SCUMMN'],
      kills: 27,
    },
    {
      mapNumber: 3,
      teamName: 'LFAO',
      players: ['PLAYER1', 'PLAYER2', 'PLAYER3'],
      kills: 22,
    },
    {
      mapNumber: 4,
      teamName: 'WZPD',
      players: ['ALPHA', 'BRAVO', 'CHARLIE'],
      kills: 19,
    },
    {
      mapNumber: 5,
      teamName: 'T1',
      players: ['DELTA', 'ECHO', 'FOXTROT'],
      kills: 25,
    },
    {
      mapNumber: 6,
      teamName: 'NIP',
      players: ['GAMMA', 'HOTEL', 'INDIA'],
      kills: 30,
    },
    {
      mapNumber: 7,
      teamName: 'SVGE',
      players: ['JULIET', 'KILO', 'LIMA'],
      kills: 28,
    },
    {
      mapNumber: 8,
      teamName: 'ESC',
      players: ['MIKE', 'NOVEMBER', 'OSCAR'],
      kills: 21,
    },
  ]

  return (
    <div className="map-wins-container">
      <div className="map-table-header">
        <div className="map-header-spacer map-header-map" />
        <div className="map-header-spacer map-header-images" />
        <div className="map-header-team">Team</div>
        <div className="map-header-kills">Kills</div>
      </div>

      <div className="map-rows">
        {mapsData.map((map) => (
          <div key={map.mapNumber} className="map-row">
            <div className="map-label">Map {map.mapNumber}</div>

            <div className="map-images">
              {map.players.slice(0, 3).map((player) => {
                const playerImage = `${BASE_IMAGE_URL}/${player}.png`

                return (
                  <img
                    key={player}
                    src={playerImage}
                    alt=""
                    className="map-image"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = DEFAULT_IMAGE
                    }}
                  />
                )
              })}
            </div>

            <div className="map-team-info">
              <div className="team-name">{map.teamName}</div>
              <div className="team-players">{map.players.join(' | ')}</div>
            </div>

            <div className="map-kills-info">
              <div className="map-kills">{map.kills}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TournamentMapWins
