import { Tooltip as ReactTooltip } from "react-tooltip";
import "../../styles/Major Tournament Pages/GroupStages.css";

const Box = ({ name, leaderboard }) => {
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.points - a.points
  );

  const midpoint = Math.ceil(sortedLeaderboard.length / 2);
  const leftColumn = sortedLeaderboard.slice(0, midpoint);
  const rightColumn = sortedLeaderboard.slice(midpoint);

  return (
    <div className="gs-bracket-box" data-tooltip-id={`tooltip-${name}`}>
      {name}

      <ReactTooltip
        id={`tooltip-${name}`}
        place="bottom"
        className="gs-leaderboard-tooltip"
      >
        <div className="gs-leaderboard">

          {/* Title */}
          <div className="gs-leaderboard-title">{name}</div>

          <div className="gs-leaderboard-columns">

            {/* Left Column */}
            <div className="gs-leaderboard-column">
              <div className="gs-column-header">
                <div className="gs-team-name">Teams</div>
                <div className="gs-team-points">Points</div>
              </div>

              {leftColumn.map((team, i) => (
                <div
                  key={i}
                  className="gs-leaderboard-row"
                  style={{ color: "green" }}
                >
                  <div className="gs-team-name">{team.name}</div>
                  <div className="gs-team-points">{team.points}</div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="gs-leaderboard-column">
              <div className="gs-column-header">
                <div className="gs-team-name">Teams</div>
                <div className="gs-team-points">Points</div>
              </div>

              {rightColumn.map((team, i) => (
                <div
                  key={i}
                  className="gs-leaderboard-row"
                  style={{ color: "red" }}
                >
                  <div className="gs-team-name">{team.name}</div>
                  <div className="gs-team-points">{team.points}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </ReactTooltip>
    </div>
  );
};



const FinalsBracket = ({ tournamentName }) => {
  const generateTeams = (count) =>
    Array.from({ length: count }, (_, i) => ({
      name: `Team ${i + 1}`,
      points: Math.floor(Math.random() * 10),
    }));

  return (
    <div className="gs-finals-page">
      {/* Top Bar */}
      <div className="gs-tournament-topbar">
        <h1>{tournamentName}</h1>
      </div>

      {/* Bracket */}
      <div className="gs-bracket-container">
        <div className="gs-bracket-layout">
          <div className="gs-bracket-titles">
            <div className="gs-bracket-column-title">Groups</div>
            <div className="gs-bracket-column-title gs-bracket-column-title-span-2">
              Group Matches
            </div>
            <div className="gs-bracket-column-title">Overall Groups Leaderboard</div>
          </div>

          <div className="gs-bracket-columns-row">
            <div className="gs-bracket-column">
              <Box name="Group A" leaderboard={generateTeams(8)} />
              <Box name="Group B" leaderboard={generateTeams(8)} />
              <Box name="Group C" leaderboard={generateTeams(8)} />
            </div>

            <div className="gs-bracket-column">
              <Box name="A vs B (Week 1)" leaderboard={generateTeams(16)} />
              <Box name="A vs C (Week 1)" leaderboard={generateTeams(16)} />
              <Box name="B vs C (Week 1)" leaderboard={generateTeams(16)} />
            </div>

            <div className="gs-bracket-column">
              <Box name="A vs B (Week 2)" leaderboard={generateTeams(16)} />
              <Box name="A vs C (Week 2)" leaderboard={generateTeams(16)} />
              <Box name="B vs C (Week 2)" leaderboard={generateTeams(16)} />
            </div>

            <div className="gs-bracket-column gs-finals-column">
              <Box name="Overall Groups Leaderboard" leaderboard={generateTeams(24)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalsBracket;
