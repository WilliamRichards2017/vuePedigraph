<template>
  <div id="wrapper">


    <div v-if="launchedFrom===null">
    <v-btn small v-on:click="launchedFrom ='U'">Upload data</v-btn>
    <v-btn small v-on:click="launchedFrom ='H'">Launch from mosaic</v-btn>
    <v-btn small v-on:click="launchedFrom ='D'">Try with demo data</v-btn>
    </div>

    <PEDHandler
      v-if="launchedFrom === 'H' && typeof pedTxt !== 'null'"
      :txt="pedTxt" :launchedFrom="launchedFrom" :sample_id="sample_id" :project_id="project_id" :access_token="access_token" :token_type="token_type" :expires_in="expires_in" :is_pedigree="is_pedigree" :source="source"
  />

    <PEDHandler
      v-if="launchedFrom === 'D'"
      :launchedFrom="launchedFrom" :txt="demoTxt"
     />

  </div>
</template>

<script>


  import demoTxt from '../../../static/ped.js';
  import pedTxtBuilder from '../../../js/pedTxtBuilder'

import PEDHandler from "./../PEDHandler.vue";
export default {
  name: 'home',
  components: {PEDHandler},
  // component: {},
  props: {
    sample_id: null,
    project_id: null,
    access_token: null,
    token_type: null,
    expires_in: null,
    is_pedigree: null,
    source: null,
  },
  data() {
    return {
      demoTxt : demoTxt,
      launchedFrom : null,
      pedTxt: null
    }
  },

  beforeMount() {
    localStorage.setItem('hub-iobio-tkn', this.token_type + ' ' + this.access_token);
  },

  mounted(){
    this.buildTxt();
  },

  methods: {
    buildTxt: function(){
      let self = this;
      let hubTxt = new pedTxtBuilder("H", self.sample_id, self.project_id, self.source);
      hubTxt.promiseGetPedTxt()
        .then((pedTxt) => {
          self.pedTxt = pedTxt;
        })
    }
  }
}
</script>

<style>
  #wrapper {
    height: 100%;
  }
</style>
