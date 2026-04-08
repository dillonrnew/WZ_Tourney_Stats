import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRows, getSupabaseRequestCount } from "../../lib/supabaseRest";
import {
  DEFAULT_PLAYER_IMAGE,
  DEFAULT_TEAM_IMAGE,
  getPlayerImage,
  getTeamImage,
} from "../../lib/imageHelpers";
import { normalizeText, toNumberOrNull } from "../../lib/normalizers";
import "../../styles/Major Tournament Pages/PCLSeason1QualifiersPage.css";

const CANVAS_WIDTH = 3600;
const CANVAS_HEIGHT = 1280;
const GROUP_STAGES_X = 1440;
const FINALS_X = 2760;
const BRACKET_AREA_WIDTH = 1360;
const BRACKET_OFFSET_Y = 160;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 65;
const DEFAULT_TEAM_LOGO = "/vite.svg";

const QUALIFIER_NODE_TOURNEY_LOOKUPS = [
  { nodeId: "q1", round: 1, lobby: 1 },
  { nodeId: "q2", round: 1, lobby: 2 },
  { nodeId: "q3", round: 1, lobby: 3 },
  { nodeId: "q4", round: 1, lobby: 4 },
  { nodeId: "q5", round: 1, lobby: 5 },
  { nodeId: "q6", round: 1, lobby: 6 },
  { nodeId: "q7", round: 1, lobby: 7 },
  { nodeId: "q8", round: 1, lobby: 8 },
  { nodeId: "r2a", round: 2, lobby: 1 },
  { nodeId: "r2b", round: 2, lobby: 2 },
  { nodeId: "r2c", round: 2, lobby: 3 },
  { nodeId: "r2d", round: 2, lobby: 4 },
  { nodeId: "fa", round: 3, lobby: 1 },
  { nodeId: "fb", round: 3, lobby: 2 },
  { nodeId: "losers", round: 3, lobby: 3 },
];
const ROUND_BY_NODE_ID = QUALIFIER_NODE_TOURNEY_LOOKUPS.reduce((acc, item) => {
  acc[item.nodeId] = item.round;
  return acc;
}, {});

const node = (id, x, y, label, sublabel = "", visible = true, winner = "TBD", logo = DEFAULT_TEAM_LOGO) => ({
  id,
  x,
  y,
  label,
  sublabel,
  visible,
  winner,
  logo,
});

const COLUMN_HEADERS = [
  { key: "qual", label: "Round 1 Lobbies", left: 130, width: 260 },
  { key: "r2", label: "Round 2 Lobbies", left: 390, width: 260 },
  { key: "final", label: "Final + Losers Lobbies", left: 650, width: 260 },
  { key: "entry", label: "Group Stage Entry", left: 1030, width: 320 },
];

const GROUP_COLUMN_HEADERS = [
  { key: "w1", label: "Week 1 Matches", left: 390, width: 220 },
  { key: "w2", label: "Week 2 Matches", left: 720, width: 220 },
  { key: "overall", label: "Overall Groups", left: 1050, width: 260 },
];

const GROUP_STAGE_NODES = [
  { id: "w1ab", x: 280, y: 227, label: "A VS B (W1)", winner: "TBD", logo: DEFAULT_TEAM_LOGO },
  { id: "w1bc", x: 280, y: 437, label: "B VS C (W1)", winner: "TBD", logo: DEFAULT_TEAM_LOGO },
  { id: "w1ac", x: 280, y: 647, label: "A VS C (W1)", winner: "TBD", logo: DEFAULT_TEAM_LOGO },
  { id: "w2ab", x: 610, y: 227, label: "A VS B (W2)", winner: "TBD", logo: DEFAULT_TEAM_LOGO },
  { id: "w2bc", x: 610, y: 437, label: "B VS C (W2)", winner: "TBD", logo: DEFAULT_TEAM_LOGO },
  { id: "w2ac", x: 610, y: 647, label: "A VS C (W2)", winner: "TBD", logo: DEFAULT_TEAM_LOGO },
  { id: "gso", x: 940, y: 437, label: "Overall Groups Leaderboard", winner: "Top 24 Qualified", logo: DEFAULT_TEAM_LOGO },
];

const BRACKET_NODES = [
  node("q1", 20, 70, "Round 1 Lobby 1"),
  node("q8", 20, 175, "Round 1 Lobby 8"),
  node("q4", 20, 280, "Round 1 Lobby 4"),
  node("q5", 20, 385, "Round 1 Lobby 5"),
  node("q2", 20, 490, "Round 1 Lobby 2"),
  node("q7", 20, 595, "Round 1 Lobby 7"),
  node("q3", 20, 700, "Round 1 Lobby 3"),
  node("q6", 20, 805, "Round 1 Lobby 6"),
  node("r2a", 280, 122, "Round 2 Lobby 1"),
  node("r2b", 280, 332, "Round 2 Lobby 2"),
  node("r2c", 280, 542, "Round 2 Lobby 3"),
  node("r2d", 280, 752, "Round 2 Lobby 4"),
  node("fa", 540, 227, "Final Lobby 1", "Top 8 -> Groups"),
  node("fb", 540, 647, "Final Lobby 2", "Top 8 -> Groups"),
  node("losers", 540, 437, "Losers Finals", "Bottom of 1 + Top of 2"),
  node("groups", 920, 437, "Group Stages (24 Teams)", "8 from 1 + 8 from 2 + 8 from Losers"),
];

const BRACKET_CONNECTIONS = [
  { from: "q1", to: "r2a" }, { from: "q8", to: "r2a" },
  { from: "q4", to: "r2b" }, { from: "q5", to: "r2b" },
  { from: "q2", to: "r2c" }, { from: "q7", to: "r2c" },
  { from: "q3", to: "r2d" }, { from: "q6", to: "r2d" },
  { from: "r2a", to: "fa" }, { from: "r2b", to: "fa" },
  { from: "r2c", to: "fb" }, { from: "r2d", to: "fb" },
  { from: "fa", to: "losers", fromAnchor: "bottom", toAnchor: "top" },
  { from: "fb", to: "losers", fromAnchor: "top", toAnchor: "bottom" },
  { from: "fa", to: "groups", curveToGroup: true },
  { from: "fb", to: "groups", curveToGroup: true },
  { from: "losers", to: "groups" },
];

const buildQualifierTourneyName = (round, lobby) => `PCL S2 ROUND ${round} LOBBY ${lobby}`;
const GROUP_STAGE_TOURNEY_LOOKUPS = [
  { nodeId: "w1ab", tournamentName: "PCL S2 WEEK 1 A VS B" },
  { nodeId: "w1bc", tournamentName: "PCL S2 WEEK 1 B VS C" },
  { nodeId: "w1ac", tournamentName: "PCL S2 WEEK 1 A VS C" },
  { nodeId: "w2ab", tournamentName: "PCL S2 WEEK 2 A VS B" },
  { nodeId: "w2bc", tournamentName: "PCL S2 WEEK 2 B VS C" },
  { nodeId: "w2ac", tournamentName: "PCL S2 WEEK 2 A VS C" },
];

const isMatchPointFormat = (value) => {
  const normalized = normalizeText(value);
  return normalized === "match point" || normalized === "matchpoint";
};

const getFormatFromTournamentRow = (row = {}) =>
  row["Format"] ||
  row.Format ||
  row.format ||
  row.tournament_format ||
  row.match_format ||
  row.points_format ||
  row.win_format ||
  "";

const idsMatch = (a, b) => String(a) === String(b);

const findWinnerFromTeamRows = (teamRows = []) => {
  const winnerFlags = [
    "is_winner",
    "tournament_winner",
    "won_tournament",
    "winner",
    "champion",
    "is_champion",
    "team_won_tournament",
  ];
  const placementFields = [
    "tournament_placement",
    "overall_placement",
    "final_placement",
    "placement",
    "rank",
    "standing",
  ];

  const flaggedWinner = teamRows.find((team) =>
    winnerFlags.some((field) => team[field] === true)
  );
  const flaggedWinnerId = flaggedWinner?.team_id ?? flaggedWinner?.id;
  if (flaggedWinnerId !== undefined && flaggedWinnerId !== null) {
    return flaggedWinnerId;
  }

  const placementWinner = teamRows.find((team) =>
    placementFields.some((field) => toNumberOrNull(team[field]) === 1)
  );
  const placementWinnerId = placementWinner?.team_id ?? placementWinner?.id;
  if (placementWinnerId !== undefined && placementWinnerId !== null) {
    return placementWinnerId;
  }

  return null;
};

const findWinnerFromTournamentRow = (row = {}, teamRows = []) => {
  const idFields = [
    "winner_team_id",
    "winning_team_id",
    "champion_team_id",
    "tournament_winner_team_id",
    "winner_id",
  ];
  for (const field of idFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== "") {
      return row[field];
    }
  }

  const winnerName =
    row.winner_team_name ||
    row.winning_team_name ||
    row.champion_team_name ||
    row.winner ||
    "";
  if (winnerName) {
    const matched = teamRows.find(
      (team) =>
        normalizeText(team.updated_team_name ?? team.team_name) === normalizeText(winnerName)
    );
    const matchedId = matched?.team_id ?? matched?.id;
    if (matchedId !== undefined && matchedId !== null) {
      return matchedId;
    }
  }

  return null;
};

const findWinnerFromFinalMap = (mapRows = []) => {
  if (!mapRows.length) return null;

  let latestMapNumber = null;
  mapRows.forEach((row) => {
    const mapNumber = toNumberOrNull(row.map_number);
    if (mapNumber !== null && (latestMapNumber === null || mapNumber > latestMapNumber)) {
      latestMapNumber = mapNumber;
    }
  });
  if (latestMapNumber === null) return null;

  const winningRow = mapRows.find((row) => {
    const mapNumber = toNumberOrNull(row.map_number);
    const placement = toNumberOrNull(row.map_placement);
    return mapNumber === latestMapNumber && placement === 1;
  });

  return winningRow?.team_id ?? null;
};

const findWinnerByTotalPoints = (mapRows = []) => {
  if (!mapRows.length) return null;

  const scoreByTeam = new Map();
  mapRows.forEach((row) => {
    const teamId = row.team_id;
    const points = Number(row.map_points || 0);
    if (teamId === undefined || teamId === null || !Number.isFinite(points)) return;
    scoreByTeam.set(teamId, (scoreByTeam.get(teamId) || 0) + points);
  });

  let winnerTeamId = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  scoreByTeam.forEach((score, teamId) => {
    if (score > bestScore) {
      bestScore = score;
      winnerTeamId = teamId;
    }
  });

  return winnerTeamId;
};

const buildCompactLeaderboard = (teamRows = [], mapRows = []) => {
  const scoreByTeamId = new Map();
  mapRows.forEach((row) => {
    const teamId = row.team_id;
    if (teamId === undefined || teamId === null) return;
    scoreByTeamId.set(teamId, (scoreByTeamId.get(teamId) || 0) + Number(row.map_points || 0));
  });

  // Mirror TournamentLeaderboard behavior: render each team_info_view row,
  // don't collapse rows by team_id.
  const fromTeamRows = teamRows.map((team, index) => ({
    id: team.team_id ?? team.id ?? `team-row-${index}`,
    name: team.updated_team_name || team.team_name || "Unknown Team",
    score: scoreByTeamId.get(team.team_id) || 0,
  }));

  if (fromTeamRows.length) {
    return fromTeamRows
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 16);
  }

  // Fallback when team_info_view is empty: derive rows from map_data team IDs.
  return Array.from(scoreByTeamId.entries())
    .map(([teamId, score], index) => ({
      id: teamId ?? `map-team-${index}`,
      name: "Unknown Team",
      score,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 16);
};

const prioritizeWinnerInLeaderboard = (rows = [], winnerTeamId = null, winnerTeamName = "") => {
  if (!rows.length) return rows;

  let winnerIndex = -1;
  if (winnerTeamId !== undefined && winnerTeamId !== null) {
    winnerIndex = rows.findIndex((row) => idsMatch(row.id, winnerTeamId));
  }

  if (winnerIndex === -1 && winnerTeamName) {
    winnerIndex = rows.findIndex((row) => normalizeText(row.name) === normalizeText(winnerTeamName));
  }

  if (winnerIndex <= 0) return rows;

  const winnerRow = rows[winnerIndex];
  return [winnerRow, ...rows.slice(0, winnerIndex), ...rows.slice(winnerIndex + 1)];
};

const extractPlayerNamesFromTeamRows = (teamRows = []) => {
  const namesByKey = new Map();
  teamRows.forEach((team) => {
    [
      team?.updated_player_1,
      team?.updated_player_2,
      team?.updated_player_3,
      team?.player_1,
      team?.player_2,
      team?.player_3,
    ].forEach((name) => {
      const trimmed = String(name || "").trim();
      const normalized = normalizeText(trimmed);
      if (normalized && !namesByKey.has(normalized)) {
        namesByKey.set(normalized, trimmed);
      }
    });
  });
  return Array.from(namesByKey.values());
};

function anchorPoint(item, anchor) {
  if (!item.visible) return { x: item.x, y: item.y };
  if (anchor === "top") return { x: item.x + NODE_WIDTH / 2, y: item.y };
  if (anchor === "bottom") return { x: item.x + NODE_WIDTH / 2, y: item.y + NODE_HEIGHT };
  if (anchor === "left") return { x: item.x, y: item.y + NODE_HEIGHT / 2 };
  return { x: item.x + NODE_WIDTH, y: item.y + NODE_HEIGHT / 2 };
}

function buildPath(from, to, fromAnchor = "right", toAnchor = "left", curveToGroup = false) {
  const start = anchorPoint(from, fromAnchor);
  const end = anchorPoint(to, toAnchor);

  if (curveToGroup) {
    const curveRadius = 50;
    const joinX = end.x - curveRadius;
    const verticalDirection = start.y < end.y ? 1 : -1;
    const preCurveY = end.y - verticalDirection * curveRadius;
    return `M ${start.x} ${start.y} L ${joinX} ${start.y} L ${joinX} ${preCurveY} Q ${joinX} ${end.y} ${end.x} ${end.y}`;
  }

  if ((fromAnchor === "bottom" && toAnchor === "top") || (fromAnchor === "top" && toAnchor === "bottom")) {
    const midY = start.y + (end.y - start.y) * 0.5;
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
  }

  const midX = start.x + (end.x - start.x) * 0.5;
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
}

function PCLSeason2QualifiersPage({
  initialSection = "qualifiers",
  tournamentName = "PCL S2",
}) {
  const { id } = useParams();
  const viewportRef = useRef(null);
  const groupStagesSectionRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const dragStateRef = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0 });
  const [nodeWinnersById, setNodeWinnersById] = useState({});
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoverLeaderboardByTournamentId, setHoverLeaderboardByTournamentId] = useState({});
  const [playerSearch, setPlayerSearch] = useState("");
  const [isPlayerSearchFocused, setIsPlayerSearchFocused] = useState(false);
  const [finalsNodeData, setFinalsNodeData] = useState({
    winner: "TBD",
    logo: DEFAULT_TEAM_IMAGE,
    tournamentId: null,
    previewRows: [],
    playerNames: [],
  });
  const normalizedPlayerSearch = normalizeText(playerSearch);
  const matchedNodeIds = useMemo(() => {
    if (!normalizedPlayerSearch) return new Set();
    const next = new Set();
    Object.entries(nodeWinnersById).forEach(([nodeId, nodeData]) => {
      const hasMatch = (nodeData?.playerNames || []).some((name) =>
        normalizeText(name).includes(normalizedPlayerSearch)
      );
      if (hasMatch) {
        next.add(nodeId);
      }
    });
    const finalsMatch = (finalsNodeData.playerNames || []).some((name) =>
      normalizeText(name).includes(normalizedPlayerSearch)
    );
    if (finalsMatch) {
      next.add("finals-node");
    }
    return next;
  }, [finalsNodeData.playerNames, nodeWinnersById, normalizedPlayerSearch]);
  const allSearchablePlayerNames = useMemo(() => {
    const namesByKey = new Map();
    Object.values(nodeWinnersById).forEach((nodeData) => {
      (nodeData?.playerNames || []).forEach((name) => {
        const key = normalizeText(name);
        if (key && !namesByKey.has(key)) {
          namesByKey.set(key, name);
        }
      });
    });
    (finalsNodeData.playerNames || []).forEach((name) => {
      const key = normalizeText(name);
      if (key && !namesByKey.has(key)) {
        namesByKey.set(key, name);
      }
    });
    return Array.from(namesByKey.entries())
      .map(([normalized, display]) => ({ normalized, display }))
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [finalsNodeData.playerNames, nodeWinnersById]);
  const playerSearchSuggestions = useMemo(() => {
    if (!normalizedPlayerSearch) return [];
    return allSearchablePlayerNames
      .filter((item) => item.normalized.includes(normalizedPlayerSearch))
      .sort((a, b) => {
        const aStarts = a.normalized.startsWith(normalizedPlayerSearch) ? 0 : 1;
        const bStarts = b.normalized.startsWith(normalizedPlayerSearch) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        const aIndex = a.normalized.indexOf(normalizedPlayerSearch);
        const bIndex = b.normalized.indexOf(normalizedPlayerSearch);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return a.display.localeCompare(b.display);
      })
      .slice(0, 8);
  }, [allSearchablePlayerNames, normalizedPlayerSearch]);
  const showPlayerSearchSuggestions =
    isPlayerSearchFocused && normalizedPlayerSearch.length > 0 && playerSearchSuggestions.length > 0;

  const nodeMap = useMemo(() => new Map(BRACKET_NODES.map((item) => [item.id, item])), []);
  const bracketNodesWithWinners = useMemo(
    () =>
      BRACKET_NODES.map((item) => {
        const winnerData = nodeWinnersById[item.id];
        if (!winnerData) return item;
        return {
          ...item,
          winner: winnerData.winner,
          logo: winnerData.logo,
          tournamentId: winnerData.tournamentId,
        };
      }),
    [nodeWinnersById]
  );
  const groupStageNodesWithWinners = useMemo(
    () =>
      GROUP_STAGE_NODES.map((item) => {
        const winnerData = nodeWinnersById[item.id];
        if (!winnerData) return item;
        return {
          ...item,
          winner: winnerData.winner,
          logo: winnerData.logo,
          tournamentId: winnerData.tournamentId,
        };
      }),
    [nodeWinnersById]
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowPage(true), 1000);
    return () => clearTimeout(timer);
  }, [id]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !showPage) return;

    if (initialSection === "group-stages") {
      const section = groupStagesSectionRef.current;
      if (section) {
        const sectionCenterX = section.offsetLeft + (section.offsetWidth / 2);
        const centeredLeft = sectionCenterX - (viewport.clientWidth / 2);
        const maxScrollLeft = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
        viewport.scrollLeft = Math.max(0, Math.min(centeredLeft, maxScrollLeft));
      } else {
        viewport.scrollLeft = Math.max(GROUP_STAGES_X - 60, 0);
      }
      viewport.scrollTop = 0;
      return;
    }

    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }, [initialSection, showPage]);

  useEffect(() => {
    let cancelled = false;

    const loadNodeWinners = async () => {
      const requestCountStart = getSupabaseRequestCount();
      const lookups = [
        ...QUALIFIER_NODE_TOURNEY_LOOKUPS.map(({ nodeId, round, lobby }) => ({
          nodeId,
          tournamentName: buildQualifierTourneyName(round, lobby),
        })),
        ...GROUP_STAGE_TOURNEY_LOOKUPS,
      ];

      if (!lookups.length) {
        setNodeWinnersById({});
        setHoverLeaderboardByTournamentId({});
        const requestsUsed = getSupabaseRequestCount() - requestCountStart;
        console.log(`[QualifiersPage] Supabase requests during load: ${requestsUsed}`);
        return;
      }

      try {
        const tournamentsByName = new Map();
        const teamsByTournamentId = new Map();
        const mapsByTournamentId = new Map();
        const appendTournamentRowsByName = (rows = []) => {
          rows.forEach((row) => {
            const name = row?.Name || row?.["Name"];
            if (!name) return;
            const existing = tournamentsByName.get(name) || [];
            existing.push(row);
            tournamentsByName.set(name, existing);
          });
        };
        const appendRowsByTournamentId = (rows = [], targetMap) => {
          rows.forEach((row) => {
            const tournamentId = row?.tournament_id;
            if (!tournamentId) return;
            const existing = targetMap.get(tournamentId) || [];
            existing.push(row);
            targetMap.set(tournamentId, existing);
          });
        };

        const lookupsByRound = [1, 2, 3, 4]
          .map((round) => ({
            key: `round-${round}`,
            entries: lookups.filter((item) => ROUND_BY_NODE_ID[item.nodeId] === round),
          }))
          .filter((group) => group.entries.length > 0);
        const groupStageLookups = lookups.filter((item) => ROUND_BY_NODE_ID[item.nodeId] === undefined);
        if (groupStageLookups.length) {
          lookupsByRound.push({ key: "group-stage", entries: groupStageLookups });
        }

        for (const lookupGroup of lookupsByRound) {
          const groupTournamentNames = [
            ...new Set(lookupGroup.entries.map((item) => item.tournamentName).filter(Boolean)),
          ];
          if (!groupTournamentNames.length) continue;

          const groupTournamentRows = await fetchRows("tournaments", {
            select: "*",
            filters: { '"Name"': groupTournamentNames },
            order: { column: "id", ascending: false },
          });
          appendTournamentRowsByName(groupTournamentRows || []);

          const groupTournamentIds = [
            ...new Set((groupTournamentRows || []).map((row) => row?.id).filter(Boolean)),
          ];
          if (!groupTournamentIds.length) continue;

          const [teamRowsResult, mapRowsResult] = await Promise.allSettled([
            fetchRows("team_info_view", {
              select: "*",
              filters: { tournament_id: groupTournamentIds },
              limit: 5000,
            }),
            fetchRows("map_data", {
              select: "tournament_id,team_id,map_number,map_placement,map_points",
              filters: { tournament_id: groupTournamentIds },
              limit: 20000,
            }),
          ]);
          const groupTeamRows = teamRowsResult.status === "fulfilled" ? teamRowsResult.value || [] : [];
          const groupMapRows = mapRowsResult.status === "fulfilled" ? mapRowsResult.value || [] : [];

          appendRowsByTournamentId(groupTeamRows, teamsByTournamentId);
          appendRowsByTournamentId(groupMapRows, mapsByTournamentId);
          console.log(
            `[QualifiersPage] Loaded ${lookupGroup.key}: tournaments=${groupTournamentRows?.length || 0}, teams=${groupTeamRows.length}, maps=${groupMapRows.length}`
          );
        }

        lookups.forEach(({ tournamentName }) => {
          if (tournamentsByName.has(tournamentName)) return;
          tournamentsByName.set(tournamentName, []);
        });

        const pickBestTournamentRow = (rowsForName = []) => {
          if (!rowsForName.length) return null;

          const score = (row) => {
            const tournamentId = row?.id;
            const teamCount = (teamsByTournamentId.get(tournamentId) || []).length;
            const mapRowsForTournament = mapsByTournamentId.get(tournamentId) || [];
            const mapCount = mapRowsForTournament.length;
            let nonZeroPointRows = 0;
            let totalPoints = 0;
            mapRowsForTournament.forEach((mapRow) => {
              const points = Number(mapRow?.map_points || 0);
              totalPoints += points;
              if (points !== 0) {
                nonZeroPointRows += 1;
              }
            });
            const dateScore =
              Date.parse(row?.updated_at || row?.created_at || row?.tourney_date || "") || 0;
            return { nonZeroPointRows, totalPoints, mapCount, teamCount, dateScore };
          };

          return [...rowsForName].sort((a, b) => {
            const aScore = score(a);
            const bScore = score(b);
            if (bScore.nonZeroPointRows !== aScore.nonZeroPointRows) {
              return bScore.nonZeroPointRows - aScore.nonZeroPointRows;
            }
            if (bScore.totalPoints !== aScore.totalPoints) {
              return bScore.totalPoints - aScore.totalPoints;
            }
            if (bScore.mapCount !== aScore.mapCount) {
              return bScore.mapCount - aScore.mapCount;
            }
            if (bScore.teamCount !== aScore.teamCount) {
              return bScore.teamCount - aScore.teamCount;
            }
            return bScore.dateScore - aScore.dateScore;
          })[0];
        };

        const next = {};
        const nextHoverLeaderboards = {};
        const fallbackMapsByTournamentId = new Map();
        const shouldRetryMapPoints = (teamRows, previewRows) =>
          teamRows.length > 0 &&
          previewRows.length > 0 &&
          previewRows.every((row) => Number(row.score || 0) === 0);

        for (const { nodeId, tournamentName: lookupName } of lookups) {
          const tournamentRow = pickBestTournamentRow(tournamentsByName.get(lookupName) || []);
          const tournamentId = tournamentRow?.id || null;

          if (!tournamentId) {
            next[nodeId] = {
              winner: "TBD",
              logo: DEFAULT_TEAM_IMAGE,
              tournamentId: null,
              previewRows: [],
              playerNames: [],
            };
            continue;
          }

          const teamRows = teamsByTournamentId.get(tournamentId) || [];
          let mapRows = mapsByTournamentId.get(tournamentId) || [];
          let previewRows = buildCompactLeaderboard(teamRows, mapRows);

          if (shouldRetryMapPoints(teamRows, previewRows)) {
            let fallbackMapRows = fallbackMapsByTournamentId.get(tournamentId);
            if (!fallbackMapRows) {
              try {
                fallbackMapRows = await fetchRows("map_data", {
                  select: "team_id,map_number,map_placement,map_points",
                  filters: { tournament_id: tournamentId },
                });
              } catch {
                fallbackMapRows = [];
              }
              fallbackMapsByTournamentId.set(tournamentId, fallbackMapRows);
            }

            if (fallbackMapRows.length) {
              mapRows = fallbackMapRows;
              previewRows = buildCompactLeaderboard(teamRows, mapRows);
            }
          }

          const isMatchPoint = isMatchPointFormat(getFormatFromTournamentRow(tournamentRow));
          const winnerTeamId = isMatchPoint
            ? findWinnerFromTournamentRow(tournamentRow, teamRows) ||
              findWinnerFromTeamRows(teamRows) ||
              findWinnerFromFinalMap(mapRows)
            : findWinnerByTotalPoints(mapRows) ||
              findWinnerFromTournamentRow(tournamentRow, teamRows) ||
              findWinnerFromTeamRows(teamRows);

          const winnerTeam = teamRows.find((team) => idsMatch(team.team_id ?? team.id, winnerTeamId));
          const winnerName =
            winnerTeam?.updated_team_name ||
            winnerTeam?.team_name ||
            previewRows[0]?.name ||
            "TBD";

          next[nodeId] = {
            winner: winnerName,
            logo: getTeamImage(winnerName),
            tournamentId,
            previewRows,
            playerNames: extractPlayerNamesFromTeamRows(teamRows),
          };
          nextHoverLeaderboards[tournamentId] = previewRows;
        }

        if (cancelled) return;
        setNodeWinnersById(next);
        setHoverLeaderboardByTournamentId(nextHoverLeaderboards);

        if (id) {
          const [finalTeamRowsResult, finalMapRowsResult, finalTournamentResult] = await Promise.allSettled([
            fetchRows("team_info_view", {
              select: "*",
              filters: { tournament_id: id },
            }),
            fetchRows("map_data", {
              select: "team_id,map_number,map_placement,map_points",
              filters: { tournament_id: id },
            }),
            fetchRows("tournaments", {
              select: "*",
              filters: { id },
            }),
          ]);

          const finalTeamRows = finalTeamRowsResult.status === "fulfilled" ? finalTeamRowsResult.value || [] : [];
          const finalMapRows = finalMapRowsResult.status === "fulfilled" ? finalMapRowsResult.value || [] : [];
          const finalTournamentRow =
            finalTournamentResult.status === "fulfilled" ? finalTournamentResult.value?.[0] || {} : {};

          const finalWinnerTeamId =
            findWinnerFromFinalMap(finalMapRows) ||
            findWinnerFromTournamentRow(finalTournamentRow, finalTeamRows) ||
            findWinnerFromTeamRows(finalTeamRows) ||
            findWinnerByTotalPoints(finalMapRows);

          const finalWinnerTeam = finalTeamRows.find((team) =>
            idsMatch(team.team_id ?? team.id, finalWinnerTeamId)
          );
          const finalWinnerName = finalWinnerTeam?.updated_team_name || finalWinnerTeam?.team_name || "TBD";
          const finalPreviewRows = prioritizeWinnerInLeaderboard(
            buildCompactLeaderboard(finalTeamRows, finalMapRows),
            finalWinnerTeamId,
            finalWinnerName
          );

          if (!cancelled) {
            setFinalsNodeData({
              winner: finalWinnerName,
              logo: getTeamImage(finalWinnerName),
              tournamentId: id,
              previewRows: finalPreviewRows,
              playerNames: extractPlayerNamesFromTeamRows(finalTeamRows),
            });
          }
        } else {
          setFinalsNodeData({
            winner: "TBD",
            logo: DEFAULT_TEAM_IMAGE,
            tournamentId: null,
            previewRows: [],
            playerNames: [],
          });
        }

        const requestsUsed = getSupabaseRequestCount() - requestCountStart;
        console.log(`[QualifiersPage] Supabase requests during load: ${requestsUsed}`);
      } catch {
        if (cancelled) return;
        setNodeWinnersById({});
        setHoverLeaderboardByTournamentId({});
        setFinalsNodeData({
          winner: "TBD",
          logo: DEFAULT_TEAM_IMAGE,
          tournamentId: id || null,
          previewRows: [],
          playerNames: [],
        });
        const requestsUsed = getSupabaseRequestCount() - requestCountStart;
        console.log(`[QualifiersPage] Supabase requests during load: ${requestsUsed}`);
      }
    };

    loadNodeWinners();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const startDrag = (event) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setIsDragging(true);
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startLeft: viewport.scrollLeft,
      startTop: viewport.scrollTop,
    };
  };

  const onDrag = (event) => {
    if (!isDragging) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const dx = event.clientX - dragStateRef.current.startX;
    const dy = event.clientY - dragStateRef.current.startY;
    viewport.scrollLeft = dragStateRef.current.startLeft - dx;
    viewport.scrollTop = dragStateRef.current.startTop - dy;
  };

  const endDrag = () => setIsDragging(false);

  const openNodeLeaderboard = (tournamentId) => {
    if (!tournamentId) return;
    window.open(`/tournament/${tournamentId}`, "_blank", "noopener,noreferrer");
  };
  const handleNodeLogoError = (event) => {
    if (event.currentTarget.src === DEFAULT_TEAM_IMAGE) {
      event.currentTarget.style.visibility = "hidden";
      return;
    }
    event.currentTarget.src = DEFAULT_TEAM_IMAGE;
  };

  return (
    <div className="qp-page">
      <div className="qp-topbar">
        <h1>{tournamentName} - Qualifiers and Group Stages</h1>
        <div className="qp-player-search">
          <label htmlFor="qp-player-search-input">Search player</label>
          <div className="qp-player-search-input-wrap">
            <input
              id="qp-player-search-input"
              type="text"
              value={playerSearch}
              onChange={(event) => {
                setPlayerSearch(event.target.value);
                setIsPlayerSearchFocused(true);
              }}
              onFocus={() => setIsPlayerSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsPlayerSearchFocused(false), 120);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsPlayerSearchFocused(false);
                }
              }}
              placeholder="Search player..."
              aria-label="Search player"
              autoComplete="off"
            />
            {showPlayerSearchSuggestions ? (
              <ul className="qp-player-search-suggestions" role="listbox" aria-label="Player suggestions">
                {playerSearchSuggestions.map((item) => (
                  <li key={item.normalized}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setPlayerSearch(item.display);
                        setIsPlayerSearchFocused(false);
                      }}
                    >
                      {item.display}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {showPage ? (
        <div
          ref={viewportRef}
          className={`qp-viewport ${isDragging ? "qp-viewport-dragging" : ""}`}
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          <div className="qp-canvas" style={{ width: CANVAS_WIDTH }}>
          <section className="qp-section qp-qualifiers-section" style={{ width: BRACKET_AREA_WIDTH }}>
            <h2 className="qp-section-title">Qualifiers Bracket</h2>
            <p className="qp-section-subtitle">
              <span className="qp-section-subtitle-text">
                Round 1 lobbies start the bracket immediately.{" "}
                Bottom 8 from Final Lobby 1 and Final Lobby 2 move to Losers Finals.
                Top 8 from 1, Top 8 from 2, and Top 8 from Losers qualify for Group Stages.
              </span>
            </p>

            <div className="qp-column-labels" style={{ width: BRACKET_AREA_WIDTH }}>
              {COLUMN_HEADERS.map((item) => (
                <span
                  key={item.key}
                  className="qp-column-label"
                  style={{ left: item.left, width: item.width }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <svg
              className="qp-lines"
              style={{ width: BRACKET_AREA_WIDTH }}
              viewBox={`0 0 ${BRACKET_AREA_WIDTH} 1120`}
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="qp-arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#5f9ea0" />
                </marker>
              </defs>
              {BRACKET_CONNECTIONS.map((connection) => {
                const from = nodeMap.get(connection.from);
                const to = nodeMap.get(connection.to);

                if (!from || !to) return null;

                return (
                  <path
                    key={`${connection.from}-${connection.to}-${connection.fromAnchor || "right"}-${connection.toAnchor || "left"}`}
                    d={buildPath(
                      from,
                      to,
                      connection.fromAnchor,
                      connection.toAnchor,
                      connection.curveToGroup
                    )}
                  />
                );
              })}
            </svg>

            {bracketNodesWithWinners.filter((item) => item.visible).map((item) => (
              (() => {
                const redMeaning =
                  item.id === "fa" || item.id === "fb"
                    ? "Drops to Losers"
                    : "Eliminated";
                const previewRows = hoverLeaderboardByTournamentId[item.tournamentId] || [];
                const paddedRows = [...previewRows];
                while (paddedRows.length < 16) {
                  paddedRows.push({
                    id: `empty-${item.id}-${paddedRows.length}`,
                    name: "TBD",
                    score: 0,
                    isPlaceholder: true,
                  });
                }
                const topRows = paddedRows.slice(0, 8);
                const bottomRows = paddedRows.slice(8, 16);

                return (
                  <article
                    key={item.id}
                    className={`qp-node ${item.id === "groups" ? "qp-node-highlight qp-node-entry-only" : ""} ${item.tournamentId ? "qp-node-clickable" : ""} ${matchedNodeIds.has(item.id) ? "qp-node-player-match" : ""}`}
                    style={{ left: item.x, top: item.y + BRACKET_OFFSET_Y }}
                    onClick={() => openNodeLeaderboard(item.tournamentId)}
                    onMouseEnter={() => {
                      if (!item.tournamentId) return;
                      setHoveredNodeId(item.id);
                    }}
                    onMouseLeave={() => {
                      if (!item.tournamentId) return;
                      setHoveredNodeId((prev) => (prev === item.id ? null : prev));
                    }}
                  >
                    {item.id === "groups" ? (
                      <div className="qp-node-entry-title">{item.label}</div>
                    ) : (
                      <div className="qp-node-content">
                        <div className="qp-node-text">
                          <h3 className="qp-node-title">{item.label}</h3>
                          <p className="qp-node-winner">{item.winner}</p>
                        </div>
                        <div className="qp-node-logo-wrap">
                          <img className="qp-node-logo" src={item.logo} alt="" onError={handleNodeLogoError} />
                        </div>
                      </div>
                    )}
                    {item.tournamentId && hoveredNodeId === item.id ? (
                      <div className="qp-hover-preview" aria-hidden="true">
                        {!previewRows.length ? (
                          <p className="qp-hover-preview-state">No leaderboard data</p>
                        ) : (
                          <>
                            <div className="qp-hover-preview-columns">
                              <div className="qp-hover-preview-column">
                                <div className="qp-hover-preview-header">
                                  <span>Top 8</span>
                                  <span>Score</span>
                                </div>
                                {topRows.map((row) => (
                                  <div key={row.id} className="qp-hover-preview-row qp-hover-preview-row--advancing">
                                    <span className={`qp-hover-preview-team ${row.isPlaceholder ? "qp-hover-preview-team--placeholder" : ""}`}>{row.name}</span>
                                    <span className={`qp-hover-preview-score ${row.isPlaceholder ? "qp-hover-preview-score--placeholder" : ""}`}>{Math.round(row.score)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="qp-hover-preview-column">
                                <div className="qp-hover-preview-header">
                                  <span>Bottom 8</span>
                                  <span>Score</span>
                                </div>
                                {bottomRows.map((row) => (
                                  <div key={row.id} className="qp-hover-preview-row qp-hover-preview-row--cut">
                                    <span className={`qp-hover-preview-team ${row.isPlaceholder ? "qp-hover-preview-team--placeholder" : ""}`}>{row.name}</span>
                                    <span className={`qp-hover-preview-score ${row.isPlaceholder ? "qp-hover-preview-score--placeholder" : ""}`}>{Math.round(row.score)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="qp-hover-preview-key">
                              <span className="qp-hover-preview-key-item">
                                <span className="qp-hover-preview-key-dot qp-hover-preview-key-dot--advancing" />
                                Advancing
                              </span>
                              <span className="qp-hover-preview-key-item">
                                <span className="qp-hover-preview-key-dot qp-hover-preview-key-dot--cut" />
                                {redMeaning}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })()
            ))}
          </section>

          <section
            ref={groupStagesSectionRef}
            className="qp-section qp-group-stages-section"
            style={{ left: GROUP_STAGES_X }}
          >
            <h2 className="qp-section-title">Group Stages</h2>
            <p className="qp-section-subtitle">
              <span className="qp-section-subtitle-text">
                Two weeks of group-stage matchups. Top 16 advance to Finals. Bottom 8 are eliminated.
              </span>
            </p>

            <div className="qp-column-labels qp-group-column-labels">
              {GROUP_COLUMN_HEADERS.map((item) => (
                <span
                  key={item.key}
                  className="qp-column-label"
                  style={{ left: item.left, width: item.width }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div className="qp-group-stage-board">
              {groupStageNodesWithWinners.map((item) => (
                <article
                  key={item.id}
                  className={`qp-node qp-gs-node ${item.id === "gso" ? "qp-node-highlight" : ""} ${item.tournamentId ? "qp-node-clickable" : ""} ${matchedNodeIds.has(item.id) ? "qp-node-player-match" : ""}`}
                  style={{ left: item.x, top: item.y }}
                  onClick={() => openNodeLeaderboard(item.tournamentId)}
                  onMouseEnter={() => {
                    if (!item.tournamentId) return;
                    setHoveredNodeId(item.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredNodeId((prev) => (prev === item.id ? null : prev));
                  }}
                >
                  <div className="qp-node-content">
                    <div className="qp-node-text">
                      <h3 className="qp-node-title">{item.label}</h3>
                      <p className="qp-node-winner">{item.winner}</p>
                    </div>
                    <div className="qp-node-logo-wrap">
                      <img className="qp-node-logo" src={item.logo} alt="" onError={handleNodeLogoError} />
                    </div>
                  </div>
                  {item.tournamentId && hoveredNodeId === item.id ? (
                    <div className="qp-hover-preview" aria-hidden="true">
                      {(() => {
                        const previewRows = hoverLeaderboardByTournamentId[item.tournamentId] || [];
                        if (!previewRows.length) {
                          return <p className="qp-hover-preview-state">No leaderboard data</p>;
                        }
                        const paddedRows = [...previewRows];
                        while (paddedRows.length < 16) {
                          paddedRows.push({
                            id: `${item.id}-empty-${paddedRows.length}`,
                            name: "TBD",
                            score: 0,
                            isPlaceholder: true,
                          });
                        }
                        const topRows = paddedRows.slice(0, 8);
                        const bottomRows = paddedRows.slice(8, 16);
                        return (
                          <>
                            <div className="qp-hover-preview-columns">
                              <div className="qp-hover-preview-column">
                                <div className="qp-hover-preview-header">
                                  <span>Top 8</span>
                                  <span>Score</span>
                                </div>
                                {topRows.map((row) => (
                                  <div key={row.id} className="qp-hover-preview-row qp-hover-preview-row--advancing">
                                    <span className={`qp-hover-preview-team ${row.isPlaceholder ? "qp-hover-preview-team--placeholder" : ""}`}>{row.name}</span>
                                    <span className={`qp-hover-preview-score ${row.isPlaceholder ? "qp-hover-preview-score--placeholder" : ""}`}>{Math.round(row.score)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="qp-hover-preview-column">
                                <div className="qp-hover-preview-header">
                                  <span>Bottom 8</span>
                                  <span>Score</span>
                                </div>
                                {bottomRows.map((row) => (
                                  <div key={row.id} className="qp-hover-preview-row qp-hover-preview-row--cut">
                                    <span className={`qp-hover-preview-team ${row.isPlaceholder ? "qp-hover-preview-team--placeholder" : ""}`}>{row.name}</span>
                                    <span className={`qp-hover-preview-score ${row.isPlaceholder ? "qp-hover-preview-score--placeholder" : ""}`}>{Math.round(row.score)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="qp-hover-preview-key">
                              <span className="qp-hover-preview-key-item">
                                <span className="qp-hover-preview-key-dot qp-hover-preview-key-dot--advancing" />
                                Advancing
                              </span>
                              <span className="qp-hover-preview-key-item">
                                <span className="qp-hover-preview-key-dot qp-hover-preview-key-dot--cut" />
                                Eliminated
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="qp-section qp-finals-section" style={{ left: FINALS_X }}>
            <h2 className="qp-section-title">Finals</h2>
            <div className="qp-finals-board">
              <div className="qp-finals-mvp-card">
                <img
                  className="qp-finals-mvp-image"
                  src={DEFAULT_PLAYER_IMAGE}
                  alt="TBD"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_PLAYER_IMAGE;
                  }}
                />
                <p className="qp-finals-mvp-text">
                  <span>TBD</span>
                  <span>TOURNEY MVP</span>
                </p>
              </div>

              <article
                className={`qp-node qp-finals-node ${finalsNodeData.tournamentId ? "qp-node-clickable" : ""} ${matchedNodeIds.has("finals-node") ? "qp-node-player-match" : ""}`}
                onClick={() => openNodeLeaderboard(finalsNodeData.tournamentId)}
                onMouseEnter={() => {
                  if (!finalsNodeData.tournamentId) return;
                  setHoveredNodeId("finals-node");
                }}
                onMouseLeave={() => {
                  setHoveredNodeId((prev) => (prev === "finals-node" ? null : prev));
                }}
              >
                <div className="qp-node-content">
                  <div className="qp-node-text">
                    <h3 className="qp-node-title">Finals</h3>
                    <p className="qp-node-winner">{finalsNodeData.winner}</p>
                  </div>
                  <div className="qp-node-logo-wrap">
                    <img className="qp-node-logo" src={finalsNodeData.logo} alt="" onError={handleNodeLogoError} />
                  </div>
                </div>
                {finalsNodeData.tournamentId && hoveredNodeId === "finals-node" ? (
                  <div className="qp-hover-preview" aria-hidden="true">
                    {(() => {
                      const paddedRows = [...(finalsNodeData.previewRows || [])];
                      while (paddedRows.length < 16) {
                        paddedRows.push({
                          id: `finals-empty-${paddedRows.length}`,
                          name: "TBD",
                          score: 0,
                          isPlaceholder: true,
                        });
                      }
                      const topRows = paddedRows.slice(0, 8);
                      const bottomRows = paddedRows.slice(8, 16);
                      return (
                        <>
                          <div className="qp-hover-preview-columns">
                            <div className="qp-hover-preview-column">
                              <div className="qp-hover-preview-header">
                                <span>Top 8</span>
                                <span>Score</span>
                              </div>
                              {topRows.map((row) => (
                                <div key={row.id} className="qp-hover-preview-row qp-hover-preview-row--advancing">
                                  <span className={`qp-hover-preview-team ${row.isPlaceholder ? "qp-hover-preview-team--placeholder" : ""}`}>{row.name}</span>
                                  <span className={`qp-hover-preview-score ${row.isPlaceholder ? "qp-hover-preview-score--placeholder" : ""}`}>{Math.round(row.score)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="qp-hover-preview-column">
                              <div className="qp-hover-preview-header">
                                <span>Bottom 8</span>
                                <span>Score</span>
                              </div>
                              {bottomRows.map((row) => (
                                <div key={row.id} className="qp-hover-preview-row qp-hover-preview-row--cut">
                                  <span className={`qp-hover-preview-team ${row.isPlaceholder ? "qp-hover-preview-team--placeholder" : ""}`}>{row.name}</span>
                                  <span className={`qp-hover-preview-score ${row.isPlaceholder ? "qp-hover-preview-score--placeholder" : ""}`}>{Math.round(row.score)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="qp-hover-preview-key">
                            <span className="qp-hover-preview-key-item">
                              <span className="qp-hover-preview-key-dot qp-hover-preview-key-dot--advancing" />
                              Advancing
                            </span>
                            <span className="qp-hover-preview-key-item">
                              <span className="qp-hover-preview-key-dot qp-hover-preview-key-dot--cut" />
                              Eliminated
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : null}
              </article>
            </div>
          </section>
          </div>
        </div>
      ) : (
        <div className="qp-viewport">
          <div className="qp-loading">Loading bracket...</div>
        </div>
      )}
    </div>
  );
}

export default PCLSeason2QualifiersPage;
