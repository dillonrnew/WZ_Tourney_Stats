import { useState, useEffect, useRef } from 'react'
import '../styles/Team.css'

function Team() {
  const BASE_IMAGE_URL =
    'https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Player%20Pictures'
  const DEFAULT_IMAGE = `${BASE_IMAGE_URL}/DEFAULT.png`

  const getPlayerImage = (playerName) =>
    `${BASE_IMAGE_URL}/${playerName}.png`

  const teams = [
    {
      id: 1,
      name: 'GEN.G',
      players: [
        { id: 1, name: 'AYDAN' },
        { id: 2, name: 'RATED' },
        { id: 3, name: 'LENUN' },
      ],
    },
    {
      id: 2,
      name: 'AG GLOBAL',
      players: [
        { id: 4, name: 'FIFAKILL' },
        { id: 5, name: 'OEKIY' },
        { id: 6, name: 'SCUMMN' },
      ],
    },
    {
      id: 3,
      name: 'LFAO',
      players: [
        { id: 7, name: 'ELATOO' },
        { id: 8, name: 'GOODBYE60HZ' },
        { id: 9, name: 'VEYL' },
      ],
    },
    {
      id: 4,
      name: 'WZPD',
      players: [
        { id: 10, name: 'CLOWHN' },
        { id: 11, name: 'COLONY2K' },
        { id: 12, name: 'WATCHWALDO' },
      ],
    },
    {
      id: 5,
      name: '#ON',
      players: [
        { id: 13, name: 'ELITO' },
        { id: 14, name: 'LAWLET' },
        { id: 15, name: 'SOSSA' },
      ],
    },
    {
      id: 6,
      name: 'GENTLE MATES',
      players: [
        { id: 16, name: 'ENKEO' },
        { id: 17, name: 'GROMALOK' },
        { id: 18, name: 'HALLOW' },
      ],
    },
    {
      id: 7,
      name: 'T1',
      players: [
        { id: 19, name: 'DISRRPT' },
        { id: 20, name: 'ECHO' },
        { id: 21, name: 'SPAMGOLA' },
      ],
    },
    {
      id: 8,
      name: 'NINJAS IN PYJAMAS',
      players: [
        { id: 22, name: 'KINGAJ' },
        { id: 23, name: 'PRXDIGY' },
        { id: 24, name: 'WARSZ' },
      ],
    },
    {
      id: 9,
      name: 'SVGE ESPORTS',
      players: [
        { id: 28, name: 'DESHI' },
        { id: 29, name: 'IVISIONSR' },
        { id: 30, name: 'SHOWSTOPPER' },
      ],
    },
    {
      id: 10,
      name: 'ESC',
      players: [
        { id: 31, name: 'BLINGCJAY' },
        { id: 32, name: 'KINGCHAWK' },
        { id: 33, name: 'NIASEN' },
      ],
    },
    {
      id: 11,
      name: 'TEAM BAKA',
      players: [
        { id: 34, name: 'GUNX' },
        { id: 35, name: 'JAYVELA' },
        { id: 36, name: 'PRAISE' },
      ],
    },
    {
      id: 12,
      name: 'TEAM ZEBRA',
      players: [
        { id: 37, name: 'BRAXTVN' },
        { id: 38, name: 'CLXP' },
        { id: 39, name: 'RYDA' },
      ],
    },
    {
      id: 13,
      name: 'ORGLESS',
      players: [
        { id: 40, name: 'EMPATHY' },
        { id: 41, name: 'INTECHS' },
        { id: 42, name: 'NATEDOGG' },
      ],
    },
    {
      id: 14,
      name: 'EKLETYC',
      players: [
        { id: 43, name: 'ISFREDDY' },
        { id: 44, name: 'KIBEYZ' },
        { id: 45, name: 'ZANX' },
      ],
    },
    {
      id: 15,
      name: 'RVX',
      players: [
        { id: 46, name: 'RESOLVE' },
        { id: 47, name: 'VXLCOM' },
        { id: 48, name: 'XTRAJ' },
      ],
    },
  ]

  const [selectedTeam, setSelectedTeam] = useState(null)
  const imageCacheRef = useRef({})

  // 🔥 Preload ALL player images on page load
  useEffect(() => {
    const allPlayers = teams.flatMap((team) => team.players)

    allPlayers.forEach((player) => {
      const img = new Image()
      const imageUrl = getPlayerImage(player.name)

      img.onload = () => {
        imageCacheRef.current[player.name] = imageUrl
      }

      img.onerror = () => {
        imageCacheRef.current[player.name] = DEFAULT_IMAGE
      }

      img.src = imageUrl
    })
  }, [])

  return (
    <div className="team-container">
      <h1>Meet The Teams</h1>

      <div className="teams-grid">
        {teams.map((team) => (
          <button
            key={team.id}
            className={`team-button ${
              selectedTeam?.id === team.id ? 'active' : ''
            }`}
            onClick={() => setSelectedTeam(team)}
          >
            {team.name}
          </button>
        ))}
      </div>

      <div className="players-container">
        {selectedTeam ? (
          <>
            <h2>{selectedTeam.name}</h2>
            <div className="players-grid">
              {selectedTeam.players.map((player) => (
                <div key={player.id} className="player-card">
                  <img
                    src={
                      imageCacheRef.current[player.name] ||
                      getPlayerImage(player.name)
                    }
                    alt={player.name}
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE
                    }}
                  />
                  <p>{player.name}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="no-team-selected">
            Select a team to view players
          </p>
        )}
      </div>
    </div>
  )
}

export default Team
