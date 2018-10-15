<template>
	<div class="pick-helper">
		<div class="heroes-list-wrapper">
			<finder :filter="heroFilter"></finder>
			<div class="heroes-list">
				<div class="heroes str-heroes">
					<img
						:src="hero.icon"
						:key="hero.id"
						@contextmenu="heroClick($event, hero)"
						@click="heroClick($event, hero)"
						:class="{ally_selected: hero.$markedAlly, enemy_selected: hero.$markedEnemy, filtered: !hero.$filtered}"
						v-for="hero in strHeroes"
					/>
				</div>
				<div class="heroes agi-heroes">
					<img
						:src="hero.icon"
						:key="hero.id"
						@contextmenu="heroClick($event, hero)"
						@click="heroClick($event, hero)"
						:class="{ally_selected: hero.$markedAlly, enemy_selected: hero.$markedEnemy, filtered: !hero.$filtered}"
						v-for="hero in agiHeroes"
					/>
				</div>
				<div class="heroes int-heroes">
					<img
						:src="hero.icon"
						:key="hero.id"
						@contextmenu="heroClick($event, hero)"
						@click="heroClick($event, hero)"
						:class="{ally_selected: hero.$markedAlly, enemy_selected: hero.$markedEnemy, filtered: !hero.$filtered}"
						v-for="hero in intHeroes"
					/>
				</div>
			</div>
		</div>
		<div class="calculations">
			<div class="calc-block picks">
				<div class="pick">
					<img v-for="id in ally" :src="heroes[id].icon" :key="id"/>
				</div>
				<div class="find-controller">
					<button class="toggler" @click="toggle(false)">{{showBest1 ? "best" : "worst"}}</button>
					<button @click="findBest(false)">find vs team1</button>
				</div>
				<div v-if="bestVsTeam1.length">
					<div class="best-hero" v-for="hero in team1Heroes" :key="hero.id">
						<img :src="heroes[hero.id].icon"/>
						<div>{{hero.winrate}} {{hero.bad ? "*" : ""}}</div>
					</div>
				</div>
			</div>
			<div class="calc-block picks">
				<div class="pick">
					<img v-for="id in enemy" :src="heroes[id].icon" :key="id"/>
				</div>
				<div class="find-controller">
					<button class="toggler" @click="toggle(true)">{{showBest2 ? "best" : "worst"}}</button>
					<button @click="findBest(true)">find vs team2</button>
				</div>
				<div v-if="bestVsTeam2.length">
					<div class="best-hero" v-for="hero in team2Heroes" :key="hero.id">
						<img :src="heroes[hero.id].icon"/>
						<div>{{hero.winrate}} {{hero.bad ? "*" : ""}}</div>
					</div>
				</div>
			</div>
			<div class="calc-block winrate">
				<div class="team-winrate" :class="{positive: winrate > 50, empty: !winrate}">{{winrate || ""}}</div>
				<button @click="findWinrate">get winrate</button>
			</div>
		</div>
	</div>
</template>

<script>
import { getWinrate, findBestHero } from "./../helper";
import Finder from "./Finder";

export default {
	name: 'Pickhelper',
	components: {
		finder: Finder
	},
	props: {
		heroes: Object,
		agiHeroes: Array,
		strHeroes: Array,
		intHeroes: Array
	},
	data () {
		return {
			enemy: [],
			ally: [],
			bestVsTeam1: [],
			showBest1: true,
			showBest2: true,
			bestVsTeam2: [],
			worstVsTeam1: [],
			worstVsTeam2: [],
			winrate: "",
			heroFilter: "",
			keydownListener: null
		}
	},
	beforeMount() {
		this.keydownListener = e => {
			if (e.shiftKey || e.altKey || e.ctrlKey) {
				return;
			}
			if (e.keyCode >= 65 && e.keyCode <= 90) {
				this.heroFilter += e.key;
			}
			if (e.keyCode === 8 && this.heroFilter.length) {
				this.heroFilter = this.heroFilter.slice(0, -1);
			}
			if (e.keyCode === 27) {
				this.heroFilter = "";
			}
			for (const key in this.heroes) {
				this.heroes[key].$filtered = this.heroes[key].local.toLowerCase().indexOf(this.heroFilter) !== -1;
			}
		};
		document.addEventListener("keydown", this.keydownListener);

	},
	beforeDestroy() {
		document.removeEventListener("keydown", this.keydownListener);
	},
	methods: {
		heroClick(e, hero) {
			this.bestVsTeam1 = [];
			this.bestVsTeam2 = [];
			this.worstVsTeam1 = [];
			this.worstVsTeam2 = [];
			this.winrate = "";
			if (e.which === 3) {
				e.preventDefault();
				this.balanceArray(hero, true);
			} else {
				this.balanceArray(hero, false);
			}
		},
		findBest(enemy) {
			if (enemy) {
				const pick = this.enemy;
				if (!pick.length) {
					return;
				}
				this.findBestHero(pick).then(data => {
					const best = data.slice(0, 15);
					const worst = data.slice(-15);
					this.bestVsTeam2 = best;
					this.worstVsTeam2 = worst;
				});
			} else {
				const pick = this.ally;
				if (!pick.length) {
					return;
				}
				this.findBestHero(pick).then(data => {
					const best = data.slice(0, 15);
					const worst = data.slice(-15);
					this.bestVsTeam1 = best;
					this.worstVsTeam1 = worst;
				});
			}
		},
		findWinrate() {
			this.getWinrate().then(data => {
				this.winrate = data;
			})
		},
		toggle(isTeam2) {
			if (isTeam2) {
				this.showBest2 = !this.showBest2;
			} else {
				this.showBest1 = !this.showBest1;
			}
		},
		balanceArray(hero, isEnemy) {
			const enemyIndex = this.enemy.indexOf(hero.id);
			if (enemyIndex !== -1) {
				hero.$markedEnemy = false;
				this.enemy.splice(enemyIndex, 1);
				return;
			}
			const allyIndex = this.ally.indexOf(hero.id);
			if (allyIndex !== -1) {
				hero.$markedAlly = false;
				this.ally.splice(allyIndex, 1);
				return;
			}
			const arr = isEnemy ? this.enemy : this.ally;
			const [field, other] = isEnemy ? ["$markedEnemy", "$markedAlly"] : ["$markedAlly", "$markedEnemy"];
			if (arr.length === 5) {
				const first = arr.shift();
				this.heroes[first][field] = false;
			}
			hero[field] = true;
			hero[other] = false;

			arr.push(hero.id);
		},
		async getWinrate() {
			const team1 = this.ally;
			const team2 = this.enemy;
			if (team1.length !== 5 || team2.length !== 5) {
				return;
			}
			const matchups = this.getMatchups(team1);
			const heroes = await Promise.all(matchups);

			const vsTeam2Heroes = heroes.map(arr => arr.filter(hero => team2.includes(hero.hero_id)));

			return getWinrate(vsTeam2Heroes);
		},
		async findBestHero(pick) {
			const matchups = this.getMatchups(pick);
			const heroes = await Promise.all(matchups);
			const allHeroes = Object.keys(this.heroes);

			return findBestHero(heroes, pick, allHeroes);
		},
		getMatchups(pick) {
			return pick.map(id => fetch(`https://api.opendota.com/api/heroes/${id}/matchups`).then(res => res.json()));
		}
	},
	computed: {
		team1Heroes() {
			return this.showBest1 ? this.bestVsTeam1 : this.worstVsTeam1;
		},
		team2Heroes() {
			return this.showBest2 ? this.bestVsTeam2 : this.worstVsTeam2;
		}
	}
}
</script>

<style scoped>
	.pick-helper {
		font-family: Roboto;
		font-size: 14px;
		background: #E0E0E0;
		height: 100%;
	}
	input {
		font-size: 22px;
		outline: none;
		border: none;
        border-bottom: 1px solid black;
		margin: 0 0 12px 0;
	}
	.heroes-list-wrapper {
		position: relative;
	}
	.heroes-list {
		display: flex;
		flex-direction: column;
		background: #757575;
	}
	.heroes-list img {
		cursor: pointer;
	}
	.heroes {
		display: flex;
		width: 1100px;
		flex-wrap: wrap;
		margin: 12px 0 12px 0;
	}
	.ally_selected {
		background: rgba(0, 255, 0, 0.5);
	}
	.enemy_selected {
		background: rgba(255, 0, 0, 0.5);
	}
	.filtered {
		opacity: 0.2;
	}
	.calculations .calc-block {
		margin: 0 36px 0 0;
		width: 248px;
		height: 180px;
	}
	img {
		width: 40px;
		height: 40px;
		padding: 4px;
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
	.find-controller {
		display: flex;
		flex-direction: row;
	}
	.find-controller button {
		width: 50%;
	}
	.toggler {
		background: rgba(0, 0, 0, 0.5);
	}
	.pick {
		height: 48px;
		border: 1px solid #cecece;
	}
	.calculations {
		margin: 12px 0 0 0;
		display: flex;
		flex-direction: row;
		background: #E0E0E0;
	}
	.best-hero {
		height: 28px;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.best-hero img {
		width: 24px;
		height: 24px;
	}
	.best-hero div {
		line-height: 28px;
	}
	.team-winrate {
		color: rgba(0, 0, 0, 0.7);
		font-family: Roboto;
		font-size: 20px;
		height: 48px;
		line-height: 50px;
		text-align: center;
		background: rgba(255, 0, 0, 0.4);
		border: 1px solid #cecece;
	}
	.team-winrate.positive {
		background: rgba(0, 255, 0, 0.4);
	}
	.team-winrate.empty {
		background: transparent;
	}
</style>
