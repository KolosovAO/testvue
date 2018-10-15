export function getWinrate(matchups) {
    let count = 0;
    let badCount = 0;

    matchups.forEach(matchup => {
        if (!matchup.length) {
            count += 0.5;
            badCount += 5;
        } else {
            const avHeroWr = matchup.reduce((total, item) => {
                if (!item || item.games_played < 8) {
                    total += 0.5;
                    badCount ++;
                } else {
                    total += item.wins / item.games_played;
                }
                return total;
            }, 0) / matchup.length;
            count += avHeroWr;
        }
    });

    return `${(count * 20).toFixed(4)} ${badCount > 5 ? "*" : ""}`;
}

export function findBestHero(heroes, pick, heroesIds) {
    const result = [];

    heroes = heroes.map(hero => hero.reduce((o, h) => {
        if (h.games_played > 8) {
            o[h.hero_id] = 1 - h.wins / h.games_played;
        }
        return o;
    }, {}));

    heroesIds.filter(id => !pick.includes(+id)).forEach((heroId => {
        let total = 0;
        let bad = 0;

        for (const hero of heroes) {
            if (!hero[heroId]) {
                bad++;
                total += 0.5;
            } else {
                total += hero[heroId];
            }
        }
        result.push({
            id: heroId,
            winrate: (total / pick.length * 100).toFixed(4),
            bad
        });
    }));
    result.sort((a, b) => b.winrate - a.winrate);
    return result;
}