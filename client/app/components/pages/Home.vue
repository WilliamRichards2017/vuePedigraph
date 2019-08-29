<template>
  <div id="wrapper">


    <div v-if="launchedFrom===null">

      <v-toolbar color="#123d53" dark>
        <v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>
      </v-toolbar>


      <div class="buttons-group">


        <div>
      <v-btn large v-on:click="launchedFrom ='H'" class="welcome-button">Launch from mosaic</v-btn>
        </div>

        <div>
      <v-btn large v-on:click="launchedFrom ='D'" class="welcome-button">Try with demo data</v-btn>
        </div>
      <div class="uploader">
        <FileReader @load="uploadedPedTxt = $event; launchedFrom='U'" style="text-align: center"></FileReader>
      </div>
      </div>

    </div>


      <PEDHandler
      v-if="launchedFrom === 'H' && typeof pedTxt === 'string' && typeof familyId === 'string'"
      :txt="pedTxt" :launchedFrom="launchedFrom" :sample_id="sample_id" :project_id="project_id" :access_token="access_token" :token_type="token_type" :expires_in="expires_in" :is_pedigree="is_pedigree" :source="source" :variants="variants" :family_id="familyId" :phenotypes="phenotypes"
  />

    <PEDHandler
      v-if="launchedFrom === 'D'"
      :launchedFrom="launchedFrom" :txt="demoTxt" :phenotypes="demoPhenotypes" :variants="demoVariants"
     />

    <PEDHandler
      v-if="launchedFrom === 'U'"
      :launchedFrom="launchedFrom" :txt="uploadedPedTxt"
    />


  </div>
</template>

<script>


  import demoTxt from '../../../static/ped.js';
  import pedTxtBuilder from '../../../js/pedTxtBuilder'

  import PEDHandler from "./../PEDHandler.vue";
  import FileReader from "./../FileReader.vue";

  export default {
  name: 'home',
  components: {PEDHandler, FileReader},
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
      samples: null,
      familyId: null,
      familySamples: null,
      phenotypes: null,
      variants: null,

      demoPhenotypes: ["PTC Sensitivity"],
      demoVariants: ["7:141972755_C/T"],

      file: '',
      uploadedPedTxt: null,
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
      }
      else if (self.launchedFrom === "D"){

      }

    },
    uploadedPedTxt : function() {
      let self = this;
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
          }
        })
    },

    metricsToPhenotypes(){
      let self = this;
      self.phenotypes = [];

      for(let i = 0; i < self.metrics.length; i++){
        let pt = self.metrics[i].uid;
        self.phenotypes.push(pt);
      }
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

  .buttons-group{
    text-align: center;
  }

  .welcome-button{
    white-space: nowrap;
    font-size: 24px !important;
    margin-left: 7px;
    margin-right: 7px;
    width: 270px;
    height: 80px;
    text-align: center;
    padding: 20px;

    margin-top: 25px;
    margin-bottom: 25px;

    /*display: block;*/

  }

  .uploader{
    white-space: nowrap;
    margin-top: 25px;
    margin-bottom: 25px;
    text-align: center;
    width: 360px;
    height: 80px;

    padding: 20px;

    font-size: 24px !important;
    white-space: nowrap;
    border: 1px solid black;
    display: inline-block;
  }



</style>
