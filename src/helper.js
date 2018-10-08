export function getWinrate(matchups) {
    let count = 0;
    let badCount = 0;

    matchups.forEach(matchup => {
        const avHeroWr = matchup.reduce((total, item) => {
            if (!item || item.games_played < 8) {
                total += 0.5;
                badCount ++;
            } else {
                total += item.wins / item.games_played;
            }
            return total;
        }, 0) / 5;
        count += avHeroWr;
    });

    return `winrate - ${count * 20} ${badCount > 5 ? "*" : ""}`;
}