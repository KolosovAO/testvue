<template>
    <div class="match-info">
        <div class="block-title">Team winrate</div>
        <div class="picks-info">
        	<div class="ally-pick">
				<img v-for="id in ally" :src="heroes[id].icon" :key="id" :class="{your_hero: id === hero}"/>
			</div>
            <div class="enemy-pick">
				<img v-for="id in enemy" :src="heroes[id].icon" :key="id"/>
			</div>
            <div class="team-winrate" :class="{positive: pickWinrate > 50}">{{pickWinrate}}</div>
        </div>
        <div class="block-title">Hero winrate</div>
        <div class="hero-winrate" :class="{positive: heroWinrate > 50}">{{heroWinrate}}</div>
        <div class="block-title">Best heroes</div>
        <div class="best-heroes"></div>
            <div class="best-hero" v-for="hero in bestHeroes" :key="hero.id">
                <img :src="heroes[hero.id].icon"/>
                <div>{{hero.winrate}} {{hero.bad ? "*" : ""}}</div>
            </div>
        <button @click="close()">Close</button>
    </div>
</template>

<script>
    import { getWinrate, findBestHero } from "./../helper";

    export default {
        name: 'MatchInfo',
        props: {
            heroes: Object,
            accountId: Number,
            match: {
                players: {
                    isRadiant: Boolean,
                    hero_id: Number,
                    account_id: Number
                }
            }
        },
        data() {
            return {
                ally: [],
                enemy: [],
                hero: null,
                pickWinrate: null,
                heroWinrate: null,
                bestHeroes: []
            }
        },
        beforeMount() {
            const players = this.match.players;
            const infoPlayer = players.find(player => player.account_id === this.accountId);
            const isRadiant = infoPlayer.isRadiant;
            this.hero = infoPlayer.hero_id;

            for (const player of players) {
                if (isRadiant === player.isRadiant) {
                    this.ally.push(player.hero_id);
                } else {
                    this.enemy.push(player.hero_id);
                }
            }

            this.findBest();
            this.findWinrate();
        },
        methods: {
            async findBest() {
                const matchups = await Promise.all(this.getMatchups(this.enemy));
                const allHeroes = Object.keys(this.heroes);

                const heroes = await findBestHero(matchups, this.enemy, allHeroes);

                this.heroWinrate = heroes.find(hero => hero.id == this.hero).winrate;

                this.bestHeroes = heroes.slice(0, 15);
            },
            async findWinrate() {
                const matchups = await Promise.all(this.getMatchups(this.ally));

                const vsTeam2Heroes = matchups.map(arr => arr.filter(hero => this.enemy.includes(hero.hero_id)));
                
                this.pickWinrate = await getWinrate(vsTeam2Heroes);
            },
            getMatchups(pick) {
                return pick.map(id => fetch(`https://api.opendota.com/api/heroes/${id}/matchups`).then(res => res.json()));
            },
            close() {
                this.$root.$emit("closeMatchInfo");
            }
        }
    }
</script>

<style scoped>
    .match-info {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .match-info img {
        height: 32px;
        width: 32px;
    }
    .picks-info {
        display: flex;
        height: 48px;
        line-height: 48px;
    }
    .ally-pick, .enemy-pick {
        margin: 8px;
    }
    .ally-pick .your_hero {
        background: rgba(255, 0, 0, 0.5);
    }
    .team-winrate, .hero-winrate {
		color: rgba(0, 0, 0, 0.7);
		font-family: Roboto;
		font-size: 20px;
		height: 48px;
        width: 260px;
		line-height: 50px;
		text-align: center;
		background: rgba(255, 0, 0, 0.4);
		border: 1px solid #cecece;
	}
	.team-winrate.positive, .hero-winrate.positive {
		background: rgba(0, 255, 0, 0.4);
	}
    .best-hero {
        display: flex;
    }
    .best-hero {
		height: 28px;
		display: flex;
        font-family: Roboto;
		flex-direction: row;
		align-items: center;
	}
	.best-hero img {
		width: 24px;
		height: 24px;
	}
    .block-title {
        font-family: Roboto;
        font-size: 18px;
        color: rgba(0, 0, 0, 0.8);
    }
    button {
		background-color: rgba(0, 0, 0, 0.8);
		border: none;
		color: white;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		height: 50px;
		cursor: pointer;
		width: 100%;
	}
</style>