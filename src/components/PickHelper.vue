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
				<div class="info-block">
					<img v-for="id in ally" :src="heroes[id].icon" :key="id"/>
				</div>
				<div class="find-controller">
					<button class="toggle-btn" @click="toggle(false)">{{showBest1 ? "best" : "worst"}}</button>
					<button class="default-btn" @click="findBest(false)">find vs team1</button>
				</div>
				<div v-if="bestVsTeam1.length">
					<div class="best-hero" v-for="hero in team1Heroes" :key="hero.id">
						<img :src="heroes[hero.id].icon"/>
						<div>{{hero.winrate}} {{hero.bad ? "*" : ""}}</div>
					</div>
				</div>
			</div>
			<div class="calc-block picks">
				<div class="info-block">
					<img v-for="id in enemy" :src="heroes[id].icon" :key="id"/>
				</div>
				<div class="find-controller">
					<button class="toggle-btn" @click="toggle(true)">{{showBest2 ? "best" : "worst"}}</button>
					<button class="default-btn" @click="findBest(true)">find vs team2</button>
				</div>
				<div v-if="bestVsTeam2.length">
					<div class="best-hero" v-for="hero in team2Heroes" :key="hero.id">
						<img :src="heroes[hero.id].icon"/>
						<div>{{hero.winrate}} {{hero.bad ? "*" : ""}}</div>
					</div>
				</div>
			</div>
			<div class="calc-block winrate">
				<div class="info-block team-winrate" :class="{positive: parseInt(winrate) > 50, empty: !winrate}">{{winrate || ""}}</div>
				<button class="default-btn" @click="getWinrate">get winrate</button>
			</div>
		</div>
	</div>
</template>

<script>
import { getPickWinrate, findBestHeroes } from "./../helper";
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
			const heroIds = Object.keys(this.heroes);

			if (enemy) {
				const pick = this.enemy;
				if (!pick.length) {
					return;
				}
				findBestHeroes(pick, heroIds).then(data => {
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
				findBestHeroes(pick, heroIds).then(data => {
					const best = data.slice(0, 15);
					const worst = data.slice(-15);
					this.bestVsTeam1 = best;
					this.worstVsTeam1 = worst;
				});
			}
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
			if (this.ally.length !== 5 || this.enemy.length !== 5) {
				return;
			}
			const winrate = getPickWinrate(this.ally, this.enemy);

			this.winrate = winrate;
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