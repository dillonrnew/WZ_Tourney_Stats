import '../styles/Leaderboard.css'

const BASE_IMAGE_URL =
  'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos'

const DEFAULT_TEAM_IMAGE = `${BASE_IMAGE_URL}/NONE.png`

// Convert team name to filename-safe format
const getTeamImage = (teamName) => {
  return `${BASE_IMAGE_URL}/${teamName.toUpperCase()}.png`
}

function Leaderboard() {
  const teams = [
    { id: 1, name: 'GEN.G', players: ['AYDAN', 'RATED', 'LENUN'], score: 152 },
    { id: 2, name: 'AG GLOBAL', players: ['FIFAKILL', 'OEKIY', 'SCUMMN'], score: 144 },
    { id: 3, name: 'LFAO', players: ['ELATOO', 'GOODBYE60HZ', 'VEYL'], score: 138 },
    { id: 4, name: 'WZPD', players: ['CLOWHN', 'COLONY2K', 'WATCHWALDO'], score: 130 },
    { id: 5, name: '#ON', players: ['ELITO', 'LAWLET', 'SOSSA'], score: 126 },
    { id: 6, name: 'GENTLE MATES', players: ['ENKEO', 'GROMALOK', 'HALLOW'], score: 121 },
    { id: 7, name: 'T1', players: ['DISRRPT', 'ECHO', 'SPAMGOLA'], score: 118 },
    { id: 8, name: 'NINJAS IN PYJAMAS', players: ['KINGAJ', 'PRXDIGY', 'WARSZ'], score: 110 },
    { id: 9, name: 'SVGE', players: ['DESHI', 'IVISIONSR', 'SHOWSTOPPER'], score: 104 },
    { id: 10, name: 'ESC', players: ['BLINGCJAY', 'KINGCHAWK', 'NIASEN'], score: 98 },
    { id: 11, name: 'TEAM BAKA', players: ['GUNX', 'JAYVELA', 'PRAISE'], score: 94 },
    { id: 12, name: 'TEAM ZEBRA', players: ['BRAXTVN', 'CLXP', 'RYDA'], score: 90 },
    { id: 13, name: 'ORGLESS', players: ['EMPATHY', 'INTECHS', 'NATEDOGG'], score: 86 },
    { id: 14, name: 'EKLETYC', players: ['ISFREDDY', 'KIBEYZ', 'ZANX'], score: 82 },
    { id: 15, name: 'RVX', players: ['RESOLVE', 'VXLCOM', 'XTRAJ'], score: 78 },
    { id: 16, name: 'EXAMPLE', players: ['PLAYER1', 'PLAYER2', 'PLAYER3'], score: 72 },
  ]

  const leftColumn = teams.slice(0, 8)
  const rightColumn = teams.slice(8, 16)

  const renderColumn = (columnTeams, offset) => (
    <div className="leaderboard-column">
      <div className="leaderboard-row leaderboard-header">
        <div />
        <div className="header-text">#</div>
        <div className="header-text header-team">Team</div>
        <div className="header-text header-score">Score</div>
      </div>

      {columnTeams.map((team, index) => (
        <div key={team.id} className="leaderboard-row">
          <img
            src={getTeamImage(team.name)}
            alt=""
            className="team-logo"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = DEFAULT_TEAM_IMAGE
            }}
          />

          <div className="team-placement">
            {index + 1 + offset}
          </div>

          <div className="team-info">
            <div className="team-name">{team.name}</div>
            <div className="team-players">
              {team.players.join(' | ')}
            </div>
          </div>

          <div className="team-score">{team.score}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="leaderboard-wrapper">
      <div className="leaderboard-columns">
        {renderColumn(leftColumn, 0)}
        {renderColumn(rightColumn, 8)}
      </div>
    </div>
  )
}

export default Leaderboard
