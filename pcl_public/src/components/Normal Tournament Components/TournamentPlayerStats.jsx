import React, { useState, useEffect } from "react";
import "../../styles/TournamentPlayerStats.css";

const PLAYER_IMAGE_BASE =
  "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Shoulders%20Up%20Pictures";

const TEAM_IMAGE_BASE =
  "https://cszyqguhwvxnkozuyldj.supabase.co/storage/v1/object/public/Org%20Logos";

const DEFAULT_PLAYER_IMAGE = `${PLAYER_IMAGE_BASE}/DEFAULT.png`;
const DEFAULT_TEAM_IMAGE = `${TEAM_IMAGE_BASE}/NONE.png`;

const sanitizeName = (name) =>
  name.toUpperCase();

const players = [
  { id: 1, name: "BLAZT", team: "GEN.G", value: 155 },
  { id: 2, name: "SAGE", team: "AG GLOBAL", value: 148 },
  { id: 3, name: "SKULLFACE", team: "LFAO", value: 141 },
  { id: 4, name: "ECHO", team: "T1", value: 136 },
  { id: 5, name: "SPAMGOLA", team: "T1", value: 130 },
  { id: 6, name: "DISRRPT", team: "T1", value: 124 },
  { id: 7, name: "GUNX", team: "TEAM BAKA", value: 119 },
  { id: 8, name: "RJ", team: "EXAMPLE", value: 114 },
  { id: 9, name: "LAWLET", team: "#ON", value: 109 },
  { id: 10, name: "SPYRO", team: "SVGE", value: 104 },
  { id: 11, name: "WATCHWALDO", team: "WZPD", value: 99 },
  { id: 12, name: "AMIR", team: "ESC", value: 94 },
  { id: 13, name: "FINMUIRR", team: "ORGLESS", value: 89 },
  { id: 14, name: "AWBZ", team: "EKLETYC", value: 84 },
  { id: 15, name: "NIASEN", team: "ESC", value: 79 },
];

function preloadImage(src, fallback) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => resolve(fallback);
  });
}

function PlayerStats() {
  const [resolvedImages, setResolvedImages] = useState(null);

  useEffect(() => {
    const preloadAll = async () => {
      // Create an array of promises for all players' avatars and badges
      const promises = players.flatMap((player) => {
        const avatarSrc = `${PLAYER_IMAGE_BASE}/${sanitizeName(player.name)}.png`;
        const badgeSrc = `${TEAM_IMAGE_BASE}/${sanitizeName(player.team)}.png`;
        return [
          preloadImage(avatarSrc, DEFAULT_PLAYER_IMAGE),
          preloadImage(badgeSrc, DEFAULT_TEAM_IMAGE),
        ];
      });

      // Wait for all images to preload in parallel
      const results = await Promise.all(promises);

      // Map results back to players
      const map = {};
      players.forEach((player, i) => {
        map[player.id] = {
          avatar: results[i * 2], // avatar
          badge: results[i * 2 + 1], // badge
        };
      });

      setResolvedImages(map);
    };

    preloadAll();
  }, []);

  if (!resolvedImages) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#fff" }}>
        Loading Player Stats...
      </div>
    );
  }

  return (
    <div className="PlayerStatsPage">
      <h2 className="PlayerStatsPage__title">Player Stats</h2>

      <div className="PlayerStatsPage__list">
        {players.map((player, index) => {
          const rank = index + 1;
          const rankClass = rank <= 5 ? `PlayerStatsPage__card--rank${rank}` : "";
          const images = resolvedImages[player.id];

          return (
            <div key={player.id} className={`PlayerStatsPage__card ${rankClass}`}>
              <div className="PlayerStatsPage__rank">{rank}</div>

              {/* Org / Team logo */}
              <img
                className="PlayerStatsPage_OrgLogos"
                src={images.badge}
                alt=""
              />

              {/* Player picture */}
              <img
                className="PlayerStatsPage_PlayerPics"
                src={images.avatar}
                alt=""
              />

              <div className="PlayerStatsPage__name">{player.name}</div>

              <div className="PlayerStatsPage__value">{player.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerStats;
