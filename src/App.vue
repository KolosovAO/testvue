<template>
	<div id="app">
		<div class="app-header">
    		<img class="logo" src="./assets/bear.jpg">
			<div class="header-text">MEDVEBOT</div>
		</div>
		<div class="app-body">
			<sidebar :active="active"/>
			<div class="app-content">
				<picker
					v-if="active===0"
					:heroes="heroes"
					:agiHeroes="agiHeroes"
					:strHeroes="strHeroes"
					:intHeroes="intHeroes"
				></picker>
				<playerInfo 
					v-if="active===1"
					:heroes="heroes"
				></playerInfo>
			</div>
		</div>
	</div>
</template>

<script>
import PickHelper from './components/PickHelper'
import PlayerInfo from './components/PlayerInfo'
import Sidebar from './components/Sidebar'

export default {
	name: 'App',
	components: {
		picker: PickHelper,
		sidebar: Sidebar,
		playerInfo: PlayerInfo
	},
	data () {
		return {
			heroes: {},
			active: 0,
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

			this.$root.$on("updateAcitveItem", index => {
				this.active = index;
			});
		});
	}
}
</script>

<style>
	html, body {
		padding: 0;
		margin: 0;
	}
	.app-header {
		display: flex;
		height: 60px;
		line-height: 60px;
		width: 100%;
		background: #202124;	
	}
	.logo {
		height: 60px;
		width: 90px;
	}
	.header-text {
		text-align: center;
		font-family: Roboto;
		color: #FFF;
		font-size: 40px;
	}
	.app-body {
		display: flex;
		flex-direction: row;
		height: calc(100% - 60px);
		background: #E0E0E0;
	}
	.app-content {
		width: 90%;
		height: 100%;
	}
	#app {
		height: 100vh;
	}
</style>
