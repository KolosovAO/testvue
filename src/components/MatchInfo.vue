<template>
    <div class="match-info">
        <div class="block-title">Team winrate</div>
        <div class="picks-info">
        	<div class="info-block">
				<img v-for="id in ally" :src="heroes[id].icon" :key="id" :class="{your_hero: id === hero}"/>
			</div>
            <div class="info-block">
				<img v-for="id in enemy" :src="heroes[id].icon" :key="id"/>
			</div>
            <div class="winrate" :class="{positive: parseInt(pickWinrate) > 50}">{{pickWinrate}}</div>
        </div>
        <div class="block-title">Hero winrate</div>
        <div class="winrate" :class="{positive: parseInt(heroWinrate) > 50}">{{heroWinrate}}</div>
        <div class="block-title">Best heroes</div>
        <div class="best-heroes"></div>
            <div class="best-hero" v-for="hero in bestHeroes" :key="hero.id">
                <img :src="heroes[hero.id].icon"/>
                <div>{{hero.winrate}} {{hero.bad ? "*" : ""}}</div>
            </div>
        <button class="default-btn" @click="close()">
            <span class="mdi mdi-step-backward"></span>
            Back
        </button>
    </div>
</template>

<script>
import { findBestHeroes, getPickWinrate } from "./../helper";

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
        if (!infoPlayer) {
            this.$root.$emit("error", "Too many requests, try again")
            return;
        }
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
            const allHeroes = Object.keys(this.heroes);
            const heroes = await findBestHeroes(this.enemy, allHeroes);

            const playerHero = heroes.find(hero => hero.id == this.hero);

            this.heroWinrate = playerHero ? playerHero.winrate : 50;

            this.bestHeroes = heroes.slice(0, 20);
        },
        async findWinrate() {
            this.pickWinrate = await getPickWinrate(this.ally, this.enemy);
        },
        close() {
            this.$root.$emit("closeMatchInfo");
        }
    }
}
</script>