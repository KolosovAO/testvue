export const getURL = {
    matchups: id => `https://api.opendota.com/api/heroes/${id}/matchups`,
    heroStats: () => "https://api.opendota.com/api/heroStats",
    recentMatches: playerId => `https://api.opendota.com/api/players/${playerId}/recentMatches`,
    player: playerId => `https://api.opendota.com/api/players/${playerId}`
}