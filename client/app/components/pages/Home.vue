<template>
  <div id="wrapper">


    <div v-if="launchedFrom===null">


      <input id="pedFile" name="file" @click="handleFiles" type="file" />

      <!--<v-btn small v-on:click="launchedFrom ='U'">Upload data</v-btn>-->
      <v-btn small v-on:click="launchedFrom ='H'">Launch from mosaic</v-btn>
      <v-btn small v-on:click="launchedFrom ='D'">Try with demo data</v-btn>
    </div>

    <PEDHandler
      v-if="launchedFrom === 'H' && typeof pedTxt === 'string'"
      :txt="pedTxt" :launchedFrom="launchedFrom" :sample_id="sample_id" :project_id="project_id" :access_token="access_token" :token_type="token_type" :expires_in="expires_in" :is_pedigree="is_pedigree" :source="source" :variants="variants"
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
      pedTxt: null,
      hubTxt: null,
      variants: null
    }
  },

  beforeMount() {

  },

  mounted(){
    let self = this;
    self.hubTxt = new pedTxtBuilder("H", self.sample_id, self.project_id, self.source);

  },

  watch: {
    launchedFrom : function() {
      let self = this;
      if(self.launchedFrom === "H"){
        localStorage.setItem('hub-iobio-tkn', self.token_type + ' ' + self.access_token);
        console.log("change in launchedFrom watcher");
        self.buildTxt();
        self.buildVariants();
      }
    }
  },

  methods: {
    buildTxt: function () {
      let self = this;
      self.hubTxt.promiseGetPedTxt()
        .then((pedTxt) => {
          self.pedTxt = pedTxt;
        })
    },

    buildVariants: function() {
      let self = this;

      self.variants = [];

      self.hubTxt.promiseGetVariantSets()
        .then((data) => {
          // const variantSets = data;s
          // console.log("variant sets", variantSets);
          self.variants = data.variants;
          console.log("self.variants", self.variants);



        })
    },

    handleFiles: function () {

      var fileInput = document.getElementById('the-file');
      console.log(fileInput.files);
    }
  }
}
</script>

<style>
  #wrapper {
    height: 100%;
  }

  .visually-hidden {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
  }

</style>
