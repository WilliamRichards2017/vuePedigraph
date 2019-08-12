<template>
  <div id="wrapper">


    <div v-if="launchedFrom===null">


      <input id="pedFile" name="file" @click="handleFiles" type="file" />

      <!--<v-btn small v-on:click="launchedFrom ='U'">Upload data</v-btn>-->
      <v-btn small v-on:click="launchedFrom ='H'">Launch from mosaic</v-btn>
      <v-btn small v-on:click="launchedFrom ='D'">Try with demo data</v-btn>
    </div>

    <PEDHandler
      v-if="launchedFrom === 'H' && typeof pedTxt === 'string' && typeof familyId === 'string'"
      :txt="pedTxt" :launchedFrom="launchedFrom" :sample_id="sample_id" :project_id="project_id" :access_token="access_token" :token_type="token_type" :expires_in="expires_in" :is_pedigree="is_pedigree" :source="source" :variants="variants" :family_id="familyId" :familySamples="familySamples" :phenotypes="phenotypes"
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
      variants: null,
      samples: null,
      familyId: null,
      familySamples: null,
      phenotypes: null
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
        self.getProjectKindredId();
        self.getProjectSamples();
        self.getMetricsForProject();
        self.buildTxt();
        self.buildVariantsFromSet();
        // self.buildAllVariants();
        // self.getFilesForProject();
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

    getProjectKindredId: function(){
      let self = this;

      self.samples = [];
      self.hubTxt.promiseGetProjectSamples()
        .then((data) => {
          self.samples = data;
          if(self.samples.data.length > 0){
            self.familyId = self.samples.data[0].pedigree["kindred_id"];
            console.log("self.familyId", self.familyId)
          }
        })
    },

    metricsToPhenotypes(){
      let self = this;
      console.log("self.metrics inside metricsToPhenotypes", self.metrics);
      self.phenotypes = [];

      for(let i = 0; i < self.metrics.length; i++){
        let pt = self.metrics[i].name;
        self.phenotypes.push(pt);
      }
      console.log("Phenotypes in metricsToPhenotypes", self.phenotypes);
    },


    buildVariantsFromSet: function() {
      let self = this;

      self.variants = [];

      self.hubTxt.promiseGetVariantSets()
        .then((data) => {
          self.variants = data.variants;
          console.log("self.variants", self.variants);
        })
    },

    buildAllVariants: function(){
      let self = this
      self.variants = [];

      self.hubTxt.promiseGetVariantsForProject()
        .then((data) => {
          self.variants = data.variants;
          console.log("self.variants", self.variants);
        })
    },

    getProjectSamples: function(){
      let self = this;
      let samples = []
      self.familySamples = [];
      self.hubTxt.promiseGetProjectSamples()
        .then((data) => {
          samples = data.data;
          for(let i = 0; i < samples.length; i++){
            if(samples[i].pedigree["kindred_id"] === self.familyId){
              console.log("found sample in family", self.familyId);
              self.familySamples.push(samples[i].id);
            }
          }
        })
    },


    getFilesForProject: function(){
      let self = this;
      let files = null;
      self.hubTxt.promiseGetFilesForProject()
        .then((data) => {
          files = data;
        })
    },

    getMetricsForProject: function(){
      let self = this;

      self.metrics = [];

      self.hubTxt.promiseGetMetricsForProject()
        .then((data) => {
          self.metrics = data;

          self.metricsToPhenotypes();


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
