<template>
  <div id="app">
    <div class="app-header">
      <img class="logo" src="./assets/bear.jpg" />
      <div class="header-text">MEDVEBOT</div>
      <div class="live-circle" @click="toggleLive"></div>
      <div class="team-finder" v-if="live">
        <input type="text" v-model="team_input_value" />
        <div @click="getTeamInfo" class="mdi mdi-magnify"></div>
        <div class="team-finder__suggested_team">{{suggested_team && suggested_team.name}}</div>
        <div @click="clear" v-if="team_info" class="mdi mdi-backspace"></div>
        <loading v-if="team_info_in_progress" />
      </div>
    </div>
    <div class="app-body">
      <div class="app-content">
        <picker
          v-if="!live"
          :heroes="heroes"
          :agiHeroes="agiHeroes"
          :strHeroes="strHeroes"
          :intHeroes="intHeroes"
          :forcedAlly="forcedAlly"
          :forcedEnemy="forcedEnemy"
        />
        <live v-if="live && !team_info" :heroes="heroes" :teams="teams" :copyHeroes="copyHeroes" />
        <teaminfo v-if="live && team_info" :heroes="heroes" :team_info="team_info" single />
      </div>
    </div>
    <error v-if="error" :message="error"></error>
  </div>
</template>

<script>
import "./styles/index.scss";

import PickHelper from "./components/PickHelper";
import ErrorMessage from "./components/Error";
import Live from "./components/Live";
import TeamInfo from "./components/TeamInfo";
import Loading from "./components/Loading";
import { getURL } from "./urls";
import {
  fuzzySearch,
  getTeamHeroesWinrate,
  getTeamLastMatches
} from "./helper";

export default {
  name: "App",
  components: {
    picker: PickHelper,
    error: ErrorMessage,
    live: Live,
    teaminfo: TeamInfo,
    loading: Loading
  },
  data() {
    return {
      heroes: {},
      teams: {},
      live: false,
      error: "",
      agiHeroes: [],
      strHeroes: [],
      intHeroes: [],
      forcedAlly: [],
      forcedEnemy: [],
      team_input_value: "",
      suggested_team: undefined,
      team_info: undefined,
      team_info_in_progress: false
    };
  },
  watch: {
    team_input_value(value) {
      if (!value) {
        this.suggested_team = undefined;
      } else {
        const suggested_teams = Object.values(this.teams).filter(team =>
          fuzzySearch(team.name.toLowerCase(), value.toLowerCase())
        );
        let letters_count = Infinity;
        let suggested_team = undefined;
        for (const team of suggested_teams) {
          if (team.name.length < letters_count) {
            letters_count = team.name.length;
            suggested_team = team;
          }
        }
        this.suggested_team = suggested_team;
      }
    }
  },
  methods: {
    toggleLive() {
      this.forcedAlly = [];
      this.forcedEnemy = [];
      this.live = !this.live;
    },
    copyHeroes(ally, enemy) {
      this.live = false;
      this.forcedAlly = ally;
      this.forcedEnemy = enemy;
    },
    getTeamInfo() {
      if (this.suggested_team) {
        this.team_info_in_progress = true;
        Promise.all([
          getTeamHeroesWinrate(
            this.suggested_team.team_id,
            Object.values(this.heroes).map(({ id }) => id)
          ),
          getTeamLastMatches(this.suggested_team.team_id)
        ]).then(([heroes_info, last_matches]) => {
          this.team_info_in_progress = false;
          this.team_info = {
            team: this.suggested_team,
            heroes_info,
            last_matches
          };
        });
      }
    },
    clear() {
      this.team_input_value = "";
      this.team_info = undefined;
      this.suggested_team = undefined;
    }
  },
  beforeMount() {
    fetch(getURL.heroStats())
      .then(res => res.json())
      .then(data => {
        const str = [];
        const agi = [];
        const int = [];
        const heroes = {};
        for (const hero of data) {
          heroes[hero.id] = {
            id: hero.id,
            attr: hero.primary_attr,
            icon: "./static/heroes/" + hero.id + ".png",
            name: hero.name,
            local: hero.localized_name || "new",
            $markedAlly: false,
            $markedEnemy: false,
            $filtered: true,
            divine_wr: hero["8_win"] / hero["8_pick"],
            divine_count: hero["8_pick"],
            pro_count: hero.pro_pick,
            pro_wr: hero.pro_win / hero.pro_pick
          };
          switch (hero.primary_attr) {
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

    fetch(getURL.teams())
      .then(res => res.json())
      .then(result => {
        const teams = {};
        for (const team of result) {
          teams[team.team_id] = {
            team_id: team.team_id,
            rating: team.raiting,
            wins: team.wins,
            losses: team.loses,
            last_match_time: team.last_match_time,
            name: team.name,
            tag: team.tag,
            logo_url: team.logo_url
          };
        }

        this.teams = teams;
      });

    this.$root.$on("error", msg => {
      this.error = msg;
      setTimeout(() => {
        if (this.error === msg) {
          this.error = "";
        }
      }, 5000);
    });
  }
};
</script>
