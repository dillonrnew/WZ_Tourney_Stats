import React, { useMemo, useState } from "react";
import "../styles/TeamStatsPage.css";

/**
 * Demo data:
 * - kills and avgPlacement are separate lists so you can see independent ordering
 * - teamId is the key that links the same team across both columns
 */
const teams = [
  { teamId: "t1", name: "TEAM OMEGA", avatar: "https://via.placeholder.com/96" },
  { teamId: "t2", name: "TEAM NOVA", avatar: "https://via.placeholder.com/96" },
  { teamId: "t3", name: "TEAM PULSE", avatar: "https://via.placeholder.com/96" },
  { teamId: "t4", name: "TEAM APEX", avatar: "https://via.placeholder.com/96" },
  { teamId: "t5", name: "TEAM FURY", avatar: "https://via.placeholder.com/96" },
  { teamId: "t6", name: "TEAM SYNC", avatar: "https://via.placeholder.com/96" },
  { teamId: "t7", name: "TEAM ZEN", avatar: "https://via.placeholder.com/96" },
  { teamId: "t8", name: "TEAM VIBE", avatar: "https://via.placeholder.com/96" },
  { teamId: "t9", name: "TEAM LOCK", avatar: "https://via.placeholder.com/96" },
  { teamId: "t10", name: "TEAM VOID", avatar: "https://via.placeholder.com/96" },
  { teamId: "t11", name: "TEAM CORE", avatar: "https://via.placeholder.com/96" },
  { teamId: "t12", name: "TEAM IRON", avatar: "https://via.placeholder.com/96" },
  { teamId: "t13", name: "TEAM FLUX", avatar: "https://via.placeholder.com/96" },
  { teamId: "t14", name: "TEAM WAVE", avatar: "https://via.placeholder.com/96" },
  { teamId: "t15", name: "TEAM NEXUS", avatar: "https://via.placeholder.com/96" },
];

// Column 1 (Team Kills)
const teamKills = [
  { teamId: "t1", value: 155 },
  { teamId: "t3", value: 148 },
  { teamId: "t2", value: 141 },
  { teamId: "t6", value: 136 },
  { teamId: "t5", value: 130 },
  { teamId: "t8", value: 124 },
  { teamId: "t7", value: 119 },
  { teamId: "t10", value: 114 },
  { teamId: "t4", value: 109 },
  { teamId: "t9", value: 104 },
  { teamId: "t12", value: 99 },
  { teamId: "t11", value: 94 },
  { teamId: "t13", value: 89 },
  { teamId: "t14", value: 84 },
  { teamId: "t15", value: 79 },
];

// Column 2 (Average Placement) — lower is better, but we’ll just display a number
const avgPlacement = [
  { teamId: "t4", value: 2.1 },
  { teamId: "t1", value: 2.4 },
  { teamId: "t2", value: 2.6 },
  { teamId: "t5", value: 2.9 },
  { teamId: "t3", value: 3.0 },
  { teamId: "t7", value: 3.1 },
  { teamId: "t6", value: 3.2 },
  { teamId: "t9", value: 3.5 },
  { teamId: "t8", value: 3.7 },
  { teamId: "t10", value: 3.8 },
  { teamId: "t11", value: 4.0 },
  { teamId: "t12", value: 4.1 },
  { teamId: "t13", value: 4.3 },
  { teamId: "t14", value: 4.6 },
  { teamId: "t15", value: 4.9 },
];

function TeamStats() {
  const [hoveredTeamId, setHoveredTeamId] = useState(null);

  const teamById = useMemo(() => {
    const map = new Map();
    teams.forEach((t) => map.set(t.teamId, t));
    return map;
  }, []);

  const renderColumn = (title, rows) => {
    return (
      <div className="TeamStatsPage__halfInner">
        <h3 className="TeamStatsPage__columnTitle">{title}</h3>

        <div className="TeamStatsPage__list">
          {rows.map((row, index) => {
            const rank = index + 1;
            const team = teamById.get(row.teamId);
            const isHovered = hoveredTeamId === row.teamId;

            const rankClass =
              rank <= 5 ? `TeamStatsPage__card--rank${rank}` : "";

            return (
              <div
                key={`${title}-${row.teamId}`}
                className={[
                  "TeamStatsPage__card",
                  rankClass,
                  isHovered ? "TeamStatsPage__card--hoverMatch" : "",
                ].join(" ")}
                onMouseEnter={() => setHoveredTeamId(row.teamId)}
                onMouseLeave={() => setHoveredTeamId(null)}
              >
                <div className="TeamStatsPage__rank">{rank}</div>

                <img
                  className="TeamStatsPage__avatar"
                  src={team?.avatar}
                  alt={`${team?.name || "Team"} logo`}
                />

                <div className="TeamStatsPage__name">{team?.name || "Unknown"}</div>

                <div className="TeamStatsPage__value">{row.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="TeamStatsPage">
      <h2 className="TeamStatsPage__title">Team Stats</h2>

      <div className="TeamStatsPage__split">
        <div className="TeamStatsPage__half">
          {renderColumn("Team Kills", teamKills)}
        </div>

        <div className="TeamStatsPage__half">
          {renderColumn("Average Placement", avgPlacement)}
        </div>
      </div>
    </div>
  );
}

export default TeamStats;
