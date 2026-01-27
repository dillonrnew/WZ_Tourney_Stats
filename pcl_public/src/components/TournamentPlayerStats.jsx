import "../styles/PlayerStats.css";

const players = [
  { id: 1,  name: "BLAZT",      avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 155 },
  { id: 2,  name: "SAGE",       avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 148 },
  { id: 3,  name: "SKULLFACE",  avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 141 },
  { id: 4,  name: "ECHO",       avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 136 },
  { id: 5,  name: "SPAMGOLA",   avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 130 },

  { id: 6,  name: "DISRRPT",    avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 124 },
  { id: 7,  name: "GUNX",       avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 119 },
  { id: 8,  name: "RJ",         avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 114 },
  { id: 9,  name: "LAWLET",     avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 109 },
  { id: 10, name: "SPYRO",      avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 104 },

  { id: 11, name: "WATCHWALDO", avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 99 },
  { id: 12, name: "AMIR",       avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 94 },
  { id: 13, name: "FINMUIRR",   avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 89 },
  { id: 14, name: "AWBZ",       avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 84 },
  { id: 15, name: "NIASEN",     avatar: "https://via.placeholder.com/96", badge: "https://via.placeholder.com/64", value: 79 },
];
function PlayerStats() {
  return (
    <div className="PlayerStatsPage">
      <h2 className="PlayerStatsPage__title">Player Stats</h2>

      <div className="PlayerStatsPage__list">
        {players.map((player, index) => {
          const rank = index + 1;
          const rankClass =
            rank <= 5 ? `PlayerStatsPage__card--rank${rank}` : "";

          return (
            <div
              key={player.id}
              className={`PlayerStatsPage__card ${rankClass}`}
            >
              {/* Far left: rank */}
              <div className="PlayerStatsPage__rank">{rank}</div>

              {/* Avatar */}
              <img
                className="PlayerStatsPage__avatar"
                src={player.avatar}
                alt={`${player.name} avatar`}
              />

              {/* Secondary image */}
              <img
                className="PlayerStatsPage__badge"
                src={player.badge}
                alt="badge"
              />

              {/* Player name */}
              <div className="PlayerStatsPage__name">
                {player.name}
              </div>

              {/* Far right: value */}
              <div className="PlayerStatsPage__value">
                {player.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerStats;
