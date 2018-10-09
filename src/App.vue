<template>
	<div id="app">
		<div class="app-header">
    		<img class="logo" src="./assets/bear.jpg">
			<div class="header-text">MEDVEBOT</div>
		</div>
		<picker
			:heroes="heroes"
			:agiHeroes="agiHeroes"
			:strHeroes="strHeroes"
			:intHeroes="intHeroes"
		></picker>
	</div>
</template>

<script>
import PickHelper from './components/PickHelper'

export default {
	name: 'App',
	components: {
		picker: PickHelper
	},
	data () {
		return {
			heroes: {},
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
	#app {
		height: 100vh;
	}
</style>
