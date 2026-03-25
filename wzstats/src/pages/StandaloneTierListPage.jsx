import { useEffect, useState } from 'react'
import { fetchRows } from '../lib/supabaseRest'
import '../styles/StandaloneTierListPage.css'

const PLAYER_IMAGE_BASE =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Headshots'
const TEAM_IMAGE_BASE =
  'https://mswibjiemxfddkymdpta.supabase.co/storage/v1/object/public/Org%20Logos'
const DEFAULT_PLAYER_IMAGE = `${PLAYER_IMAGE_BASE}/DEFAULT.png`
const DEFAULT_TEAM_IMAGE = `${TEAM_IMAGE_BASE}/NONE.png`

const INITIAL_ROWS = [
  { id: 'tier-s', label: 'S', color: '#ff7f7f' },
  { id: 'tier-a', label: 'A', color: '#ffbf7f' },
  { id: 'tier-b', label: 'B', color: '#ffdf7f' },
  { id: 'tier-c', label: 'C', color: '#bfff7f' },
  { id: 'tier-d', label: 'D', color: '#7fff7f' },
  { id: 'tier-unknown', label: '?', color: '#7fffff' },
]

const INITIAL_ITEMS = [
  { id: 'team-01', players: ['AYDAN', 'LENUN', 'RATED'], accent: '#f97316' },
  { id: 'team-02', players: ['DONGY', 'NEWBZ', 'SOKA'], accent: '#38bdf8' },
  { id: 'team-03', players: ['DEKII', 'LAYZE', 'STUKEX'], accent: '#facc15' },
  { id: 'team-04', players: ['ALMOND', 'SHIFTY', 'ZSMIT'], accent: '#4ade80' },
  { id: 'team-05', players: ['FIFAKILL', 'OEKIY', 'SCUMMN'], accent: '#fb7185' },
  { id: 'team-06', players: ['ANZIETY', 'BIGMAN', 'CYTHE'], accent: '#22c55e' },
  { id: 'team-07', players: ['BUBBLECT', 'FLXNKED', 'JUJU'], accent: '#e879f9' },
  { id: 'team-08', players: ['CLOWHN', 'COLONY2K', 'WATCHWALDO'], accent: '#f59e0b' },
  { id: 'team-09', players: ['RXNZO', 'VDATY', 'ZAAK'], accent: '#14b8a6' },
  { id: 'team-10', players: ['ADRIAN', 'DESTROY', 'GRIMEY'], accent: '#60a5fa' },
  { id: 'team-11', players: ['ETCTHOMAS', 'PROSPECT', 'VONBOT'], accent: '#ef4444' },
  { id: 'team-12', players: ['DISRRPT', 'ECHO', 'SPAMGOLA'], accent: '#8b5cf6' },
  { id: 'team-13', players: ['BBLADE', 'GXBZ', 'WAARTEX'], accent: '#06b6d4' },
  { id: 'team-14', players: ['ENKEO', 'GROMALOK', 'HALLOW'], accent: '#84cc16' },
  { id: 'team-15', players: ['IVISIONSR', 'ROBSTAR', 'SHOWSTOPPER'], accent: '#f43f5e' },
  { id: 'team-16', players: ['SARIELEU', 'SWIIZN', 'VAUTHENTIKZ'], accent: '#a855f7' },
  { id: 'team-17', players: ['FUZZN', 'MARKUS', 'RVPHIIX'], accent: '#0ea5e9' },
  { id: 'team-18', players: ['DRAGAN', 'KIRIKOU', 'WILLY'], accent: '#10b981' },
  { id: 'team-19', players: ['CAMZ', 'JAVIIX', 'JUKEYZ'], accent: '#f97316' },
  { id: 'team-20', players: ['FLS', 'ILGOOY', 'MELVN'], accent: '#6366f1' },
  { id: 'team-21', players: ['BRANDONSKULLZ', 'FEUCZR', 'JSTN'], accent: '#ec4899' },
  { id: 'team-22', players: ['CASTILLO', 'PANDA', 'REFLAME'], accent: '#f59e0b' },
  { id: 'team-23', players: ['COOKER', 'PERR', 'ROCKET'], accent: '#22c55e' },
  { id: 'team-24', players: ['BIAAR', 'CRAZYSNAKEEU', 'GHOSTANDR3'], accent: '#38bdf8' },
  { id: 'team-25', players: ['BLAZT', 'SAGE', 'SKULLFACE'], accent: '#fb7185' },
  { id: 'team-26', players: ['KINGAJ', 'PRXDIGY', 'WARSZ'], accent: '#a3e635' },
  { id: 'team-27', players: ['IHEEDZ', 'KINGCHAWK', 'NIASEN'], accent: '#2dd4bf' },
  { id: 'team-28', players: ['CLUMZIY', 'GABEKUUN', 'KNIGHT'], accent: '#c084fc' },
  { id: 'team-29', players: ['EMPATHY', 'INTECHS', 'NATEDOGG'], accent: '#f87171' },
  { id: 'team-30', players: ['FREDDYY', 'KIBEYZ', 'ZANX'], accent: '#facc15' },
  { id: 'team-31', players: ['ORLAND', 'PIO', 'SAVYULTRAS'], accent: '#34d399' },
  { id: 'team-32', players: ['LAWLET', 'SUCRE', 'TENUX'], accent: '#818cf8' },
  { id: 'team-33', players: ['CONALL', 'CONTROLDEC', 'IVFIREE'], accent: '#e879f9' },
  { id: 'team-34', players: ['HAVOC', 'MLLSY', 'SKINNER'], accent: '#0ea5e9' },
  { id: 'team-35', players: ['ABWIZZ', 'ENXIUN', 'ZACHAR'], accent: '#f97316' },
  { id: 'team-36', players: ['MARCOELSANCHO', 'SLAPPY', 'ZOROTV'], accent: '#14b8a6' },
  { id: 'team-37', players: ['AMIR', 'CRIMINAL GOD', 'ZDARK'], accent: '#ef4444' },
  { id: 'team-38', players: ['ELATOO', 'GOODBYE60HZ', 'VEYL'], accent: '#84cc16' },
  { id: 'team-39', players: ['CAUDWELL', 'MONZO', 'SPYROOEU'], accent: '#60a5fa' },
]

const normalizeName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')

const buildRosterKey = (players) =>
  players
    .map(normalizeName)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join('|')

const getPlayerImage = (playerName) =>
  playerName ? `${PLAYER_IMAGE_BASE}/${encodeURIComponent(playerName)}.png` : DEFAULT_PLAYER_IMAGE

const getTeamImage = (teamName) =>
  teamName ? `${TEAM_IMAGE_BASE}/${encodeURIComponent(teamName)}.png` : DEFAULT_TEAM_IMAGE

const getFallbackTeamName = (players) => `Team ${players?.[0] || 'Unknown'}`

function buildLocations(rows, pool) {
  const nextLocations = {}

  rows.forEach((row) => {
    row.items.forEach((itemId) => {
      nextLocations[itemId] = { type: 'row', rowId: row.id }
    })
  })

  pool.forEach((itemId) => {
    nextLocations[itemId] = { type: 'pool' }
  })

  return nextLocations
}

function StandaloneTierListPage() {
  const [rows, setRows] = useState(() => INITIAL_ROWS.map((row) => ({ ...row, items: [] })))
  const [pool, setPool] = useState(() => INITIAL_ITEMS.map((item) => item.id))
  const [draggedItemId, setDraggedItemId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState(INITIAL_ITEMS[0]?.id ?? '')
  const [orgByRosterKey, setOrgByRosterKey] = useState({})
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgError, setOrgError] = useState('')
  const [teamStatsByRosterKey, setTeamStatsByRosterKey] = useState({})
  const [playerKillsByName, setPlayerKillsByName] = useState({})
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    document.body.classList.add('standalone-tier-body')
    document.documentElement.classList.add('standalone-tier-html')

    return () => {
      document.body.classList.remove('standalone-tier-body')
      document.documentElement.classList.remove('standalone-tier-html')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadSidebarData = async () => {
      setOrgLoading(true)
      setOrgError('')
      setStatsLoading(true)
      setStatsError('')

      try {
        const [organizationRows, teamKillsRows, mapWinsRows, tourneyWinsRows, avgPlacementRows, individualKillRows] =
          await Promise.all([
            fetchRows('organizations', {
              select: 'id,org_name,player_1,player_2,player_3',
              order: { column: 'org_name', ascending: true },
            }),
            fetchRows('team_total_kills', {
              select: 'player_1,player_2,player_3,total_kills',
            }),
            fetchRows('team_map_wins', {
              select: 'team_name,team_map_wins',
            }),
            fetchRows('team_tourney_wins', {
              select: 'team_name,team_tourney_wins',
            }),
            fetchRows('team_avg_placement', {
              select: 'team_name,team_avg_placement',
            }),
            fetchRows('individual_total_kills', {
              select: 'player_name,total_kills',
            }),
          ])

        if (cancelled) {
          return
        }

        const nextOrgMap = {}
        const orgByNameKey = new Map()

        ;(organizationRows || []).forEach((org) => {
          const players = [org.player_1, org.player_2, org.player_3].filter(Boolean)
          const rosterKey = buildRosterKey(players)
          const nameKey = normalizeName(org.org_name)

          if (nameKey) {
            orgByNameKey.set(nameKey, {
              id: org.id,
              name: org.org_name || 'Unknown Org',
              players,
            })
          }

          if (rosterKey) {
            nextOrgMap[rosterKey] = {
              id: org.id,
              name: org.org_name || 'Unknown Org',
              players,
            }
          }
        })

        const nextTeamStatsByRosterKey = {}

        const ensureTeamStats = (rosterKey, fallback = {}) => {
          if (!rosterKey) {
            return null
          }

          if (!nextTeamStatsByRosterKey[rosterKey]) {
            nextTeamStatsByRosterKey[rosterKey] = {
              teamKills: 0,
              mapWins: 0,
              tourneyWins: 0,
              avgPlacement: 0,
              ...fallback,
            }
          }

          return nextTeamStatsByRosterKey[rosterKey]
        }

        ;(teamKillsRows || []).forEach((row) => {
          const rosterKey = buildRosterKey([row.player_1, row.player_2, row.player_3].filter(Boolean))
          const stats = ensureTeamStats(rosterKey)
          if (stats) {
            stats.teamKills += Number(row.total_kills || 0)
          }
        })

        const applyNamedTeamValue = (rows, valueKey, outputKey) => {
          ;(rows || []).forEach((row) => {
            const org = orgByNameKey.get(normalizeName(row.team_name))
            const rosterKey = org ? buildRosterKey(org.players) : ''
            const stats = ensureTeamStats(rosterKey)
            if (stats) {
              stats[outputKey] = Number(row[valueKey] || 0)
            }
          })
        }

        applyNamedTeamValue(mapWinsRows, 'team_map_wins', 'mapWins')
        applyNamedTeamValue(tourneyWinsRows, 'team_tourney_wins', 'tourneyWins')
        applyNamedTeamValue(avgPlacementRows, 'team_avg_placement', 'avgPlacement')

        const nextPlayerKillsByName = {}
        ;(individualKillRows || []).forEach((row) => {
          const key = normalizeName(row.player_name)
          if (key) {
            nextPlayerKillsByName[key] = Number(row.total_kills || 0)
          }
        })

        setOrgByRosterKey(nextOrgMap)
        setTeamStatsByRosterKey(nextTeamStatsByRosterKey)
        setPlayerKillsByName(nextPlayerKillsByName)
      } catch (error) {
        if (!cancelled) {
          setOrgByRosterKey({})
          setTeamStatsByRosterKey({})
          setPlayerKillsByName({})
          setOrgError(error.message || 'Failed to load team information.')
          setStatsError(error.message || 'Failed to load stats.')
        }
      } finally {
        if (!cancelled) {
          setOrgLoading(false)
          setStatsLoading(false)
        }
      }
    }

    loadSidebarData()

    return () => {
      cancelled = true
    }
  }, [])

  const itemMap = INITIAL_ITEMS.reduce((accumulator, item) => {
    accumulator[item.id] = item
    return accumulator
  }, {})

  const selectedTeam = itemMap[selectedTeamId] ?? INITIAL_ITEMS[0]
  const selectedRosterKey = selectedTeam ? buildRosterKey(selectedTeam.players) : ''
  const selectedOrg = selectedTeam ? orgByRosterKey[selectedRosterKey] : null
  const selectedTeamStats = selectedRosterKey ? teamStatsByRosterKey[selectedRosterKey] : null
  const selectedPlayerKillRows = (selectedOrg?.players || selectedTeam?.players || []).map((player) => ({
    name: player,
    kills: playerKillsByName[normalizeName(player)] || 0,
  }))

  const moveItem = (itemId, destination) => {
    if (!itemId) {
      return
    }

    const locations = buildLocations(rows, pool)
    const currentLocation = locations[itemId]

    if (!currentLocation) {
      return
    }

    if (currentLocation.type === destination.type && currentLocation.rowId === destination.rowId) {
      return
    }

    const nextRows = rows.map((row) => ({
      ...row,
      items: row.items.filter((existingItemId) => existingItemId !== itemId),
    }))

    let nextPool = pool.filter((existingItemId) => existingItemId !== itemId)

    if (destination.type === 'pool') {
      nextPool = [...nextPool, itemId]
    }

    if (destination.type === 'row') {
      const targetRowIndex = nextRows.findIndex((row) => row.id === destination.rowId)

      if (targetRowIndex === -1) {
        return
      }

      nextRows[targetRowIndex] = {
        ...nextRows[targetRowIndex],
        items: [...nextRows[targetRowIndex].items, itemId],
      }
    }

    setRows(nextRows)
    setPool(nextPool)
  }

  return (
    <section className="standalone-tier-page">
      <div className="standalone-tier-page__header">
        <div>
          <h1>DREAMHACK BIRMINGHAM TIER LIST</h1>
        </div>
      </div>

      <div className="standalone-tier-layout">
        <div className="standalone-tier-board">
          {rows.map((row) => (
            <div className="standalone-tier-row" key={row.id}>
              <div className="standalone-tier-row__label" style={{ backgroundColor: row.color }}>
                <span>{row.label}</span>
              </div>

              <div
                className="standalone-tier-row__dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  moveItem(event.dataTransfer.getData('text/plain'), { type: 'row', rowId: row.id })
                  setDraggedItemId('')
                }}
              >
                {row.items.length
                  ? row.items.map((itemId) => {
                      const item = itemMap[itemId]

                      return (
                        <button
                          key={item.id}
                          type="button"
                          draggable
                          className={`standalone-tier-card ${draggedItemId === item.id ? 'is-dragging' : ''} ${
                            selectedTeamId === item.id ? 'is-selected' : ''
                          }`}
                          style={{ '--tier-card-accent': item.accent }}
                          onClick={() => setSelectedTeamId(item.id)}
                          onDragStart={(event) => {
                            event.dataTransfer.setData('text/plain', item.id)
                            setDraggedItemId(item.id)
                          }}
                          onDragEnd={() => setDraggedItemId('')}
                        >
                          <span className="standalone-tier-card__players">
                            {item.players.map((player) => (
                              <span key={player} className="standalone-tier-card__player">
                                {player}
                              </span>
                            ))}
                          </span>
                        </button>
                      )
                    })
                  : null}
              </div>
            </div>
          ))}
        </div>

        <aside className="standalone-tier-sidebar">
          <div className="standalone-tier-sidebar__card">
            <p className="standalone-tier-sidebar__eyebrow">Team Information</p>
            <div className="standalone-tier-sidebar__identity">
              <img
                className="standalone-tier-sidebar__logo"
                src={getTeamImage(selectedOrg?.name)}
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = DEFAULT_TEAM_IMAGE
                }}
	              />

	              <div>
	                <h2>{selectedOrg?.name || getFallbackTeamName(selectedTeam?.players)}</h2>
	              </div>
	            </div>

	            <div className="standalone-tier-sidebar__section">
              <h3>Team Stats</h3>
              {statsError ? <p className="standalone-tier-sidebar__status">{statsError}</p> : null}
              <div className="standalone-tier-sidebar__stats-grid">
                <div className="standalone-tier-sidebar__stat-card">
                  <span className="standalone-tier-sidebar__stat-label">Team Kills</span>
                  <strong>{selectedTeamStats?.teamKills ?? (statsLoading ? '...' : 0)}</strong>
                </div>
                <div className="standalone-tier-sidebar__stat-card">
                  <span className="standalone-tier-sidebar__stat-label">Map Wins</span>
                  <strong>{selectedTeamStats?.mapWins ?? (statsLoading ? '...' : 0)}</strong>
                </div>
                <div className="standalone-tier-sidebar__stat-card">
                  <span className="standalone-tier-sidebar__stat-label">Tourney Wins</span>
                  <strong>{selectedTeamStats?.tourneyWins ?? (statsLoading ? '...' : 0)}</strong>
                </div>
                <div className="standalone-tier-sidebar__stat-card">
                  <span className="standalone-tier-sidebar__stat-label">Avg Placement</span>
                  <strong>
                    {selectedTeamStats
                      ? Number(selectedTeamStats.avgPlacement || 0).toFixed(2)
                      : statsLoading
                        ? '...'
                        : '0.00'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="standalone-tier-sidebar__section">
              <h3>Roster</h3>
              {orgError ? <p className="standalone-tier-sidebar__status">{orgError}</p> : null}
              <div className="standalone-tier-sidebar__roster">
                {selectedPlayerKillRows.map((player) => (
                  <div key={player.name} className="standalone-tier-sidebar__player">
                    <img
                      className="standalone-tier-sidebar__player-image"
                      src={getPlayerImage(player.name)}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = DEFAULT_PLAYER_IMAGE
                      }}
                    />
                    <div className="standalone-tier-sidebar__player-copy">
                      <span>{player.name}</span>
                      <small>Individual Kills: {statsLoading ? '...' : player.kills}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="standalone-tier-tray">
        <div className="standalone-tier-tray__header">
          <div />

          <button
            type="button"
            className="standalone-tier-tray__reset"
            onClick={() => {
              setRows(INITIAL_ROWS.map((row) => ({ ...row, items: [] })))
              setPool(INITIAL_ITEMS.map((item) => item.id))
              setDraggedItemId('')
            }}
          >
            Reset
          </button>
        </div>

        <div
          className="standalone-tier-tray__items"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            moveItem(event.dataTransfer.getData('text/plain'), { type: 'pool' })
            setDraggedItemId('')
          }}
        >
          {pool.map((itemId) => {
            const item = itemMap[itemId]

            return (
              <button
                key={item.id}
                type="button"
                draggable
                className={`standalone-tier-card ${draggedItemId === item.id ? 'is-dragging' : ''} ${
                  selectedTeamId === item.id ? 'is-selected' : ''
                }`}
                style={{ '--tier-card-accent': item.accent }}
                onClick={() => setSelectedTeamId(item.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', item.id)
                  setDraggedItemId(item.id)
                }}
                onDragEnd={() => setDraggedItemId('')}
              >
                <span className="standalone-tier-card__players">
                  {item.players.map((player) => (
                    <span key={player} className="standalone-tier-card__player">
                      {player}
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StandaloneTierListPage
