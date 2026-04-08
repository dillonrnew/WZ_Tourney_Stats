// Shared image URL constants and helpers used across the app

export const HEADSHOT_BASE_URL =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots'
export const ORG_LOGO_BASE_URL =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos'

export const DEFAULT_PLAYER_IMAGE = `${HEADSHOT_BASE_URL}/DEFAULT.png`
export const DEFAULT_TEAM_IMAGE = `${ORG_LOGO_BASE_URL}/NONE.png`

export const getPlayerImage = (playerName) =>
  playerName
    ? `${HEADSHOT_BASE_URL}/${encodeURIComponent(String(playerName).trim().toUpperCase())}.png`
    : DEFAULT_PLAYER_IMAGE

export const getTeamImage = (teamName) =>
  teamName ? `${ORG_LOGO_BASE_URL}/${encodeURIComponent(teamName)}.png` : DEFAULT_TEAM_IMAGE
