<template>
    <div class="player-info">
        <div v-if="!showMatchInfo" class="selected-account">
            <input type="text" v-model="playerid"/>
            <button @click="updatePlayerInfo()" class="find-account">search</button>
        </div>
        <table v-if="!showMatchInfo && matches.length" class="player-games-info">
            <tr>
                <th>Hero</th>
                <th>Date</th>
                <th>Last hits</th>
                <th>KDA</th>
                <th>GPM</th>
                <th>XPM</th>
                <th>Hero damage</th>
                <th>Tower damage</th>
                <th>Calculate</th>
            </tr>
            <tr v-for="match in matches" :key="match.match_id">
                <td>
                    <img :src="heroes[match.hero_id].icon"/>
                </td>
                <td>
                    {{prettyDate(match.start_time)}}
                </td>
                <td>
                    {{match.last_hits}}
                </td>
                <td>
                    {{`${match.kills}-${match.deaths}-${match.assists}`}}
                </td>
                <td>
                    {{match.gold_per_min}}
                </td>
                <td>
                    {{match.xp_per_min}}
                </td>
                <td>
                    {{match.hero_damage}}
                </td>
                <td>
                    {{match.tower_damage}}
                </td>
                <td>
                    <button @click="showInfo(match.match_id)">Show match info</button>
                </td>
            </tr>
        </table>
        <matchInfo 
            v-if="showMatchInfo"
            :heroes="heroes"
            :accountId="playerid"
            :match="match"
        >
        </matchInfo>

    </div>
</template>

<script>
    import MatchInfo from "./MatchInfo";
    export default {
        name: 'PlayerInfo',
        components: {
            matchInfo: MatchInfo
        },
        props: {
            heroes: Object
        },
        data() {
            return {
                matches: [],
                playerid: 116528675,
                showMatchInfo: false,
                match: null
            }
        },
        beforeMount() {
            this.$root.$on("closeMatchInfo", () => this.showMatchInfo = false);
        },
        methods: {
            async updatePlayerInfo() {
                try {
                    const raw = await fetch(`https://api.opendota.com/api/players/${this.playerid}/recentMatches`);
                    this.matches = await raw.json();
                } catch(e) {
                    this.$root.$emit("error", "Invalid player");
                }
            },
            prettyDate(d) {
                const date = new Date(d * 1000);
                const ho = date.getHours();
                const mi = date.getMinutes();
                const da = date.getDate();
                const mo = date.getMonth() + 1;
                return `${ho < 10 ? "0" + ho : ho}:${mi < 10 ? "0" + mi : mi} ${da < 10 ? "0" + da : da}-${mo < 10 ? "0" + mo : mo}-${date.getFullYear()}`;
            },
            async showInfo(id) {
                try {
                    const raw = await fetch(`https://api.opendota.com/api/matches/${id}`);
                    this.match = await raw.json();
                    this.showMatchInfo = true;
                } catch(e) {
                    this.$root.$emit("error", "Invalid match");
                }
            }
        }
    }
</script>

<style scoped>
    .selected-account {
		color: white;
		text-align: center;
		height: 50px;
		width: 100%;
    }
    .selected-account input {
        font-family: Roboto;
        color: rgba(0, 0, 0, 0.8);
		background: #E0E0E0;
        height: 50px;
        line-height: 50px;
        font-size: 18px;
        border: 1px solid #757575;
        box-sizing: border-box;
        padding: 0 0 0 8px;
    }
    .find-account {
        font-family: Roboto;
		background: #E0E0E0;
        color: rgba(0, 0, 0, 0.8);
        border: none;
		text-align: center;
		text-decoration: none;
		display: inline-block;
        border: 1px solid #757575;
		font-size: 18px;
		height: 50px;
		cursor: pointer;
		width: 80px;
    }
    .player-games-info {
        width: 100%;
        text-align: center;
        font-family: Roboto;
        font-size: 16px;
    }
    .player-games-info tr {
        height: 32px;
    }
    .player-games-info button {
        font-family: Roboto;
		background: rgba(0, 0, 0, 0.8);
        display: inline-block;
        text-align: center;
        color: #FFF;
        height: 32px;
        line-height: 32px;
        border: none;
        text-decoration: none;
        cursor: pointer;
    }
</style>