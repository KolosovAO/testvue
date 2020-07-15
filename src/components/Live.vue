<template>
  <div class="live">
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
      <div class="copy">
        <div
          class="mdi mdi-content-copy"
          @click="copyHeroes(match.radiant_heroes, match.dire_heroes)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLiveProMatches } from "./../helper";
export default {
  name: "Live",
  props: {
    heroes: Object,
    teams: Object,
    copyHeroes: Function
  },
  data() {
    return {
      matches: []
    };
  },
  beforeMount() {
    this.refresh();
  },
  methods: {
    refresh() {
      getLiveProMatches().then(matches => (this.matches = matches));
    }
  }
};
</script>