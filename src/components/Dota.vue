<template>
	<div class="dota">
		<div class="find-helper">{{heroFilter}}</div>
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
				<button @click="findWinrate">get winrate</button>
				<pre v-if="winrate">{{winrate}}</pre>
			</div>
		</div>
	</div>
</template>

<script>
import { getWinrate } from "./../helper";

export default {
	name: 'Dota',
	data () {
		return {
			heroes: [],
			enemy: [],
			ally: [],
			bestVsTeam1: [],
			showBest1: true,
			showBest2: true,
			bestVsTeam2: [],
			worstVsTeam1: [],
			worstVsTeam2: [],
			winrate: "",
			agiHeroes: [],
			strHeroes: [],
			intHeroes: [],
			heroFilter: ""
		}
	},
	beforeMount() {
		document.addEventListener("keydown", e => {
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
		})
		const url = "https://api.opendota.com/api/heroStats";
		fetch(url).then(res => res.json()).then(data => {
			const str = [];
			const agi = [];
			const int = [];
			const heroes = {};
			for (const hero of data) {
				heroes[hero.id] = {
					id: hero.id,
					attr: hero.primary_attr,
					icon: "http://cdn.dota2.com" + hero.icon,
					img: "http://cdn.dota2.com" + hero.img,
					name: hero.name,
					local: hero.localized_name,
					$markedAlly: false,
					$markedEnemy: false,
					$filtered: true
				};
				switch(hero.primary_attr) {
					case "agi":
						agi.push(heroes[hero.id]);
						break;
					case "str":
						str.push(heroes[hero.id]);
						break;
					case "int":
						int.push(heroes[hero.id]);
						break;
				}
			}
			const sortRule = (a, b) => a.local.localeCompare(b.local);
			str.sort(sortRule);
			int.sort(sortRule);
			agi.sort(sortRule);
			this.agiHeroes = agi;
			this.strHeroes = str;
			this.intHeroes = int;
			this.heroes = heroes;
		});
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
				this.findBestHero(pick).then(data => {
					this.bestVsTeam2 = data.best;
					this.worstVsTeam2 = data.worst;
				});
			} else {
				const pick = this.ally;
				this.findBestHero(pick).then(data => {
					this.bestVsTeam1 = data.best;
					this.worstVsTeam1 = data.worst;
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
			const result = [];
			allHeroes.forEach((heroId => {
				if (pick.find(hero => heroId == hero)) {
					return;
				}
				let total = 0;
				let bad = false;
				heroes.forEach(hero => {
					const currentHero = hero.find(item => item.hero_id == heroId);
					if (!currentHero || currentHero.games_played < 10) {
						total += 0.5;
						bad = true;
					} else {
						total += 1 - currentHero.wins / currentHero.games_played;
					}
				});
				result.push({
					id: heroId,
					winrate: (total / pick.length * 100).toFixed(4),
					bad
				})
			}));
			result.sort((a, b) => b.winrate - a.winrate);
			return {
				best: result.slice(0, 15),
				worst: result.slice(-15)
			}
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
	.dota {
		font-family: Roboto;
		font-size: 14px;
		background: #FEFEFE;
	}
	input {
		font-size: 22px;
		outline: none;
		border: none;
        border-bottom: 1px solid black;
		margin: 0 0 12px 0;
	}
	.heroes-list {
		display: flex;
		flex-direction: column;
		background: gray;
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
		margin: 0 12px 0 12px;
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
	}
	.winrate button {
		margin: 51px 0 0 0;
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
	.find-helper {
		display: flex;
		justify-content: center;
		width: 500px;
		height: 40px;
		border: 1px solid #cecece;
		font-size: 24px;
		line-height: 40px;
		padding: 0 8px 0 8px;
	}
</style>
