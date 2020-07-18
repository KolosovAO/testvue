<template>
  <div class="live">
    <div class="matches">
      <div class="match" v-for="match in matches" :key="match.id">
        <div class="team">
          <div class="team__logo" v-if="teams[match.team_id_radiant]">
            <img :src="teams[match.team_id_radiant].logo_url" />
          </div>
          <div class="team__name">{{match.team_name_radiant}}</div>
          <div class="team__heroes">
            <img
              v-for="hero_id in match.radiant_heroes"
              :key="hero_id"
              :src="heroes[hero_id] && heroes[hero_id].icon"
            />
          </div>
          <div class="team__score">{{match.radiant_score}}</div>
        </div>
        <div class="team">
          <div class="team__score">{{match.dire_score}}</div>
          <div class="team__heroes">
            <img
              v-for="hero_id in match.dire_heroes"
              :key="hero_id"
              :src="heroes[hero_id] && heroes[hero_id].icon"
            />
          </div>
          <div class="team__name">{{match.team_name_dire}}</div>
          <div class="team__logo" v-if="teams[match.team_id_dire]">
            <img :src="teams[match.team_id_dire].logo_url" />
          </div>
        </div>
        <div class="icons">
          <div class="mdi mdi-google-analytics" @click="analytic(match)"></div>
          <div
            class="mdi mdi-content-copy"
            @click="copyHeroes(match.radiant_heroes, match.dire_heroes)"
          ></div>
        </div>
      </div>
    </div>
    <loading v-if="loading_teams_info"></loading>
    <div v-for="team_info in teams_info" :key="team_info.team.team_id" class="team_info">
      <div class="team_info__header">
        <div class="team__logo">
          <img :src="team_info.team.logo_url" />
        </div>
        <div class="team__name">{{team_info.team.name}}</div>
      </div>
      <div class="team__heroes">
        <div class="hero__info" v-for="hero in team_info.heroes_info" :key="hero.hero_id">
          <img :src="heroes[hero.hero_id].icon" />
          <div>{{(hero.wins / hero.games_played * 100).toFixed(2)}}% games: {{hero.games_played}}</div>
        </div>
      </div>
      <div class="team__matches">
        <div
          v-for="match in team_info.last_matches"
          :key="match.match_id"
          class="team__match"
          :class="{ match__win: match.win }"
        >
          vs
          <div class="team__logo">
            <img :src="match.opposing_team_logo" />
          </div>
          <div class="team__name">{{match.opposing_team_name}}</div>
          <div class="duration">{{(match.duration / 60).toFixed(2)}} min</div>
          <a :href="`https://www.dotabuff.com/matches/${match.match_id}`" target="_blank">DB</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getLiveProMatches,
  getTeamHeroesWinrate,
  getTeamLastMatches
} from "./../helper";
import Loading from "./Loading";

export default {
  name: "Live",
  components: {
    loading: Loading
  },
  props: {
    heroes: Object,
    teams: Object,
    copyHeroes: Function
  },
  data() {
    return {
      matches: [],
      teams_info: [],
      loading_teams_info: false
    };
  },
  beforeMount() {
    this.refresh();
  },
  methods: {
    refresh() {
      getLiveProMatches().then(matches => (this.matches = matches));
    },
    analytic(match) {
      this.teams_info = undefined;
      this.loading_teams_info = true;
      Promise.all([
        getTeamHeroesWinrate(match.team_id_radiant, match.radiant_heroes),
        getTeamLastMatches(match.team_id_radiant),
        getTeamHeroesWinrate(match.team_id_dire, match.dire_heroes),
        getTeamLastMatches(match.team_id_dire)
      ]).then(
        ([
          heroes_info_team_radiant,
          last_matches_team_radiant,
          heroes_info_team_dire,
          last_matches_team_dire
        ]) => {
          this.teams_info = [
            {
              team: this.teams[match.team_id_radiant],
              heroes_info: heroes_info_team_radiant,
              last_matches: last_matches_team_radiant
            },
            {
              team: this.teams[match.team_id_dire],
              heroes_info: heroes_info_team_dire,
              last_matches: last_matches_team_dire
            }
          ];
          this.loading_teams_info = false;
        }
      );
    }
  }
};
</script>