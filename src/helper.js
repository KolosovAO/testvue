import { getURL } from "./urls";

export async function getMatchups(pick) {
    const matchupsPromises = pick.map(id => fetch(getURL.matchups(id)).then(res => res.json()));

    const matchups = await Promise.all(matchupsPromises);
    return matchups;
}

export async function getPickWinrate(team1, team2, pretty = true) {
    const matchups = await getMatchups(team1);

    const vsTeam2Heroes = matchups.map(matchup => 
        matchup.filter(hero => team2.includes(hero.hero_id))
    );

    let count = 0;
    let badCount = 0;
    for (const matchup of vsTeam2Heroes) {
        if (matchup.length === 0) {
            count += 0.5;
            badCount += 5;
            continue;
        }

        count += matchup.reduce((wr, h) => {
            if (h.games_played < 8) {
                badCount++;
                wr += 0.5;
            } else {
                wr += h.wins / h.games_played;
            }
            return wr;
        }, 0) / matchup.length;
    }

    const winrate = count * 20;

    if (pretty) {
        return `${winrate.toFixed(4)} ${badCount > 5 ? "*" : ""}`;
    }

    return {
        bad: badCount,
        winrate
    } 
}

export async function findBestHeroes(pick, heroIds) {
    const matchups = await getMatchups(pick);

    const winrates = [];

    const calculatedMatchups = matchups.map(matchup => matchup.reduce((o, h) => {
        if (h.games_played > 8) {
            o[h.hero_id] = 1 - h.wins / h.games_played;
        }
        return o;
    }, {}));
    for (const id of heroIds) {
        if (pick.includes(+id)) {
            continue;
        }
        let total = 0;
        let bad = 0;

        for (const matchup of calculatedMatchups) {
            if (!matchup[id]) {
                bad++;
                total += 0.5;
            } else {
                total += matchup[id];
            }
        }

        winrates.push({
            id,
            winrate: (total / pick.length * 100).toFixed(4),
            bad
        });
    }
    winrates.sort((a, b) => b.winrate - a.winrate);
    return winrates;
}