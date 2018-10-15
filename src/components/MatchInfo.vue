<template>
    <div class="match-info">
        <div class="picks-info">
        	<div class="ally-pick">
				<img v-for="id in ally" :src="heroes[id].icon" :key="id" :class="{your_hero: id === hero}"/>
			</div>
            <div class="enemy-pick">
				<img v-for="id in enemy" :src="heroes[id].icon" :key="id"/>
			</div>
            <div class="winrate">
            
			</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MatchInfo',
        props: {
            heroes: Object,
            account_id: Number,
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
                hero: null
            }
        },
        beforeMount() {
            const players = this.match.players;
            const infoPlayer = players.find(player => player.id === this.account_id);
            const isRadiant = infoPlayer.isRadiant;
            this.hero = infoPlayer.hero_id;

            for (const player of players) {
                if (isRadiant === player.isRadiant) {
                    this.ally.push(player.hero_id);
                } else {
                    this.enemy.push(player.hero_id);
                }
            }
        }
    }
</script>

<style scoped>

</style>