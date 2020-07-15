<template>
  <div id="app">
    <div class="app-header">
      <img class="logo" src="./assets/bear.jpg" />
      <div class="header-text">MEDVEBOT</div>
      <div class="live-circle" @click="toggleLive"></div>
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
        <live v-if="live" :heroes="heroes" :teams="teams" :copyHeroes="copyHeroes" />
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
import { getURL } from "./urls";

export default {
  name: "App",
  components: {
    picker: PickHelper,
    error: ErrorMessage,
    live: Live
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
      forcedEnemy: []
    };
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
