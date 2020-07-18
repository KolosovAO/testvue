export const getURL = {
    matchups: id => `https://api.opendota.com/api/heroes/${id}/matchups`,
    heroStats: () => "https://api.opendota.com/api/heroStats",
    recentMatches: playerId => `https://api.opendota.com/api/players/${playerId}/recentMatches`,
    player: playerId => `https://api.opendota.com/api/players/${playerId}`,
    match: id => `https://api.opendota.com/api/matches/${id}`,
    live: () => "https://api.opendota.com/api/live",
    teams: () => "https://api.opendota.com/api/teams",
    teamMatches: (team_id) => `https://api.opendota.com/api/teams/${team_id}/matches`,
    teamHeroes: (team_id) => `https://api.opendota.com/api/teams/${team_id}/heroes`,
    recentHeroesMatches: (pick1, pick2) =>
        `https://api.opendota.com/api/findMatches?${pick1.map(id => "teamA[]=" + id).join("&")}&${pick2.map(id => "teamB[]=" + id).join("&")}`
}