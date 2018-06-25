<template>
	<div class="dota">
		<input type="text" @input="filter" placeholder="type to filter"/>
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
				<button @click="findBest(false)">Find best vs team1</button>
				<pre>{{bestVsTeam1}}</pre>
			</div>
			<div class="calc-block picks">
				<div class="pick">
					<img v-for="id in enemy" :src="heroes[id].icon" :key="id"/>
				</div>
				<button @click="findBest(true)">Find best vs team2</button>
				<pre>{{bestVsTeam2}}</pre>
			</div>
			<div class="calc-block winrate">
				<button @click="findWinrate">Get winrate</button>
				<pre v-if="winrate">{{winrate}}</pre>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	name: 'Dota',
	data () {
		return {
			heroes: [],
			enemy: [],
			ally: [],
			filterValue: "",
			bestVsTeam1: "",
			bestVsTeam2: "",
			winrate: "",
			agiHeroes: [],
			strHeroes: [],
			intHeroes: []
		}
	},
	beforeMount() {
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
			this.bestVsTeam1 = "";
			this.bestVsTeam2 = "";
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
					this.bestVsTeam2 = data;
				});
			} else {
				const pick = this.ally;
				this.findBestHero(pick).then(data => {
					this.bestVsTeam1 = data;
				});
			}
		},
		findWinrate() {
			this.getWinrate().then(data => {
				this.winrate = data;
			})
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
		filter(e) {
			const value = e.target.value;
			this.filterValue = value;
			for (const key in this.heroes) {
				this.heroes[key].$filtered = this.heroes[key].local.toLowerCase().indexOf(value) !== -1;
			}
		},
		async getWinrate() {
			const team1 = this.ally;
			const team2 = this.enemy;
			if (team1.length !== 5 || team2.length !== 5) {
				return;
			}
			const matchups = this.getMatchups(team1);
			const heroes = await Promise.all(matchups);
			let count = 0;
			let badCount = 0;
			heroes.forEach(hero => {
				const avHeroWr = hero.reduce((total, item) => {
					if (team2.find(id => id == item.hero_id)) {
						if (!item || item.games_played < 8) {
							total += 0.5;
							badCount ++;
						} else {
							total += item.wins / item.games_played;
						}
					}
					return total;
				}, 0) / 5;
				count += avHeroWr;
			});
			return `winrate - ${count * 20} ${badCount > 5 ? "*" : ""}`;
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
					name: this.heroes[heroId].local,
					winrate: total / pick.length,
					bad
				})
			}));
			result.sort((a, b) => b.winrate - a.winrate);
			return result.slice(0, 15).map(item => `${item.name} - ${item.winrate} ${item.bad ? "*" : ""}`).join("\n");
		},
		getMatchups(pick) {
			return pick.map(id => fetch(`https://api.opendota.com/api/heroes/${id}/matchups`).then(res => res.json()));
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
</style>
