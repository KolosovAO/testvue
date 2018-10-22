<template>
    <div class="player-info">
        <div v-if="!showMatchInfo" class="account-block">
            <input type="text" v-model="playerid"/>
            <button @click="updatePlayerInfo()" class="find-account">
                <span class="mdi mdi-magnify"></span>
                search
            </button>
            <div v-if="avatar" class="account">
                <img :src="avatar" />
                <div class="account-name">{{name}}</div>
            </div>
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
            <tr v-for="match in matches" :key="match.match_id" class="match" :class="{win: (match.player_slot < 5 && match.radiant_win) || (match.player_slot >= 5 && !match.radiant_win)}">
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
                    <button class="default-btn" @click="showInfo(match.match_id)">
                        <span class="mdi mdi-calculator"></span>
                    </button>
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
import {getURL} from "./../urls";
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
            match: null,
            avatar: null,
            name: null
        }
    },
    beforeMount() {
        const playerId = window.localStorage.getItem("player_id");
        if (playerId) {
            this.playerid = +playerId;
        }
        this.$root.$on("closeMatchInfo", () => this.showMatchInfo = false);
    },
    methods: {
        async updatePlayerInfo() {
            try {
                const raw = await fetch(getURL.recentMatches(this.playerid));
                this.matches = await raw.json();
                await this.playerInfo();
                window.localStorage.setItem("player_id", this.playerid);
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
                const raw = await fetch(getURL.match(id));
                this.match = await raw.json();
                this.showMatchInfo = true;
            } catch(e) {
                this.$root.$emit("error", "Invalid match");
            }
        },
        async playerInfo() {
            try {
                const raw = await fetch(getURL.player(this.playerid));
                const player = await raw.json();
                this.avatar = player.profile.avatar;
                this.name = player.profile.personaname;
            } catch(e) {
                this.$root.$emit("error", "Invalid player");
            }
        }
    }
}
</script>