<template>
  <div id="wrapper" style="height: 96vh">

    <div id="mainContent">
    <div v-if="launchedFrom===null">

      <v-toolbar color="#123d53" dark>
        <v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>
      </v-toolbar>

      <div class="tag-line"> <h1>An Interactive Pedigree</h1></div>
      <div class="tag-line2"><h1>Visualization</h1></div>


      <h4 class="headline" style="text-align: center; padding-top: 25px; padding-bottom: 0; margin-bottom: 0">Visually inspect genotype and phenotype</h4>
      <h4 class="headline" style="text-align: center; padding-top: 0; margin-top: 0; padding-bottom: 25px; margin-bottom: 25px">relationships across a pedigree</h4>

      <div class="flex-grid" style="justify:center; text-align: center">

        <div class="column">

          <v-dialog
          width="800"
          >
          <template v-slot:activator="{ on }">
          <v-btn
            raised large color="primary"
            class="welcome-button"
            v-on="on"
          >
          Upload Local Data
          </v-btn>
            <p>Visualize your pedigree by uploading a .ped file.  Upload a vcf file and a csv containing phenotype information to view genotype/phenotype correlation.</p>



          </template>

          <v-card>
          <v-card-title
          class="headline grey lighten-2"
          primary-title
          >
          Upload Files
          </v-card-title>

          <v-card-text>


            <label class="headline lighten-2">Upload Pedigree</label>
            <FileReader class="uploader" @load="uploadedPedTxt = $event;" ></FileReader>

            <p>Upload a pedigree file from local storage.  Make sure the file is a valid <a href="https://gatkforums.broadinstitute.org/gatk/discussion/7696/pedigree-ped-files">.ped</a> file</p>


            <br>

            <label class="headline lighten-2">Upload VCF</label>
            <VCFReader class="uploader" @load="uploadedVCF = $event;" ></VCFReader>

            <p>Make sure your vcf adheres to the standard <a href="https://www.internationalgenome.org/wiki/Analysis/Variant%20Call%20Format/vcf-variant-call-format-version-40/">VCF specifications</a></p>

            <br>

            <label class="headline lighten-2">Upload Phenotype CSV</label>
            <FileReader class="uploader" @load="uploadedPTS = $event;" ></FileReader>

            <v-dialog
            width="500"
            >
            <template v-slot:activator="{ on }">
            <v-btn
            v-on="on"
            >
            View example phenotype csv
            </v-btn>
            </template>


            <v-card>
            <v-card-title
            class="headline grey lighten-2"
            primary-title
            >
            Example Phenotype csv
            </v-card-title>

            <v-card-text>
            sampleIds, PTC Sensitivity, height (cm) <br>1348, 12, 158 <br> 1349, 4, 179 <br> 1482, 12, 180 <br> 1278, 7, 173

            </v-card-text>
            </v-card>
            </v-dialog>

            <p>Upload a csv with sample phenotypes. The first column should contain sample ids, and the next column should contain the phenotype values. The first row should be a header describing the contents of each column.</p>



            <br>

            <div class="text-xs-center">

            <v-btn
              color="blue-grey"
              class="ma-2 white--text"
              large

              v-on:click="launchedFrom = 'U'"> Submit Files

              <v-icon right dark>mdi-cloud-upload</v-icon>


            </v-btn>

            </div>





          </v-card-text>
        </v-card>
        </v-dialog>







































        <!--<div class="flex-grid" style="justify:center; text-align: center">-->

            <!--<div class="column">-->


          <!--<label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Upload Ped</label>-->
          <!--<FileReader class="uploader" @load="uploadedPedTxt = $event;" ></FileReader>-->
              <!--<p>Upload a pedigree file from local storage.  Make sure the file is a valid <a href="https://gatkforums.broadinstitute.org/gatk/discussion/7696/pedigree-ped-files">.ped</a> file</p>-->


            <!--</div>-->


            <!--<div class="column">-->
          <!--<label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Upload VCF</label>-->
          <!--<VCFReader class="uploader" @load="uploadedVCF = $event;" ></VCFReader>-->
            <!--</div>-->

          <!--<div class="column">-->

          <!--<label>Upload Phenotypes</label>-->
          <!--<FileReader class="uploader" @load="uploadedPTS = $event;" ></FileReader>-->
            <!--<p>Upload a csv with sample phenotypes.  The first column should contain sample ids, and the second column should contain the phenotype values.</p>-->

            <!--<v-dialog-->
              <!--width="500"-->
            <!--&gt;-->
              <!--<template v-slot:activator="{ on }">-->
                <!--<v-btn-->
                  <!--color="red lighten-2"-->
                  <!--dark-->
                  <!--v-on="on"-->
                <!--&gt;-->
                  <!--View example phenotype csv-->
                <!--</v-btn>-->
              <!--</template>-->

              <!--<v-card>-->
                <!--<v-card-title-->
                  <!--class="headline grey lighten-2"-->
                  <!--primary-title-->
                <!--&gt;-->
                  <!--Example Phenotype csv-->
                <!--</v-card-title>-->

                <!--<v-card-text>-->
                <!--sampleIds, PTC Sensitivity <br>1348, 12 <br> 1349, 4 <br> 1482, 12 <br> 1278, 7-->

                <!--</v-card-text>-->
              <!--</v-card>-->
            <!--</v-dialog>-->






          <!--</div>-->
            <!--<v-btn v-on:click="launchedFrom = 'U'"> Submit Files</v-btn>-->

          <!--</div>-->

        </div>

        <div class="column">
      <v-btn  raised large color="primary" v-on:click="launchedFrom ='D'" class="welcome-button">Try with demo data</v-btn>
          <p>Test out the tool with demo data.  This dataset showcases an example genotype/phenotype correlation across a set of large multi-generational families.  <a href="http://www.cephb.fr/en/familles_CEPH.php">Click here </a> to learn more about the CEPH dataset</p>
        </div>

        <div class="column">
          <v-btn raised color="primary" large v-on:click="launchedFrom ='H'" class="welcome-button">Launch from mosaic</v-btn>
          <p>Launch pedigree.iobio with mosaic hosted data. <a href="https://frameshift.io/">Click here</a> to learn more about mosaic, a collaborative platform for organizing, understanding, and visualizing genomic data.</p>
        </div>

      </div>
    </div>


      <PEDHandler
      v-if="launchedFrom === 'H' && typeof pedTxt === 'string' && typeof familyId === 'string'"
      :txt="pedTxt" :launchedFrom="launchedFrom" :sample_id="sample_id" :project_id="project_id" :access_token="access_token" :token_type="token_type" :expires_in="expires_in" :is_pedigree="is_pedigree" :source="source" :variants="variants" :family_id="familyId"
  />

    <PEDHandler
      v-if="launchedFrom === 'D'"
      :launchedFrom="launchedFrom" :txt="demoTxt" :phenotypes="demoPhenotypes" :variants="demoVariants" :vcfTxt="uploadedVCF"
     />

    <PEDHandler
      v-if="launchedFrom === 'U'"
      :launchedFrom="launchedFrom" :txt="uploadedPedTxt" :vcfTxt="uploadedVCF" :phenotypeText="uploadedPTS"
    />

  </div>
      <v-footer
        absolute
        dark
        class="grey darken-3 justify-center"
      >

          {{ new Date().getFullYear() }} —  <strong>Pedigree.iobio</strong>
      </v-footer>

    </div>

</template>

<script>



  import demoTxt from '../../../static/ped.js';
  import pedTxtBuilder from '../../../js/pedTxtBuilder.js'

  import cephGTs from '../../../static/cephGts.js'

  import PEDHandler from "./../PEDHandler.vue";
  import FileReader from "./../FileReader.vue";
  import VCFReader from "./../VCFReader.vue";
  import PTReader from './../PTReader.vue';


  export default {
  name: 'home',
  components: {PEDHandler, FileReader, VCFReader},
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
      uploadedPTS: null,
      uploadedVCF: null,
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
        self.uploadedVCF = cephGTs;
      }

    },
    uploadedPedTxt : function() {
    },

    uploadedVCF: function(){
      console.log("uploaded vcf", this.uploadedVCF);
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
    display: flex;
    justify-content: center;

  }

  .welcome-button{
    white-space: nowrap;
    font-size: 24px !important;
    margin-left: 7px;
    margin-right: 7px;
    /*width: 340px;*/
    height: 100px;
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
    height: 80px;

    padding: 20px;

    font-size: 24px !important;
    white-space: nowrap;
    border: 1px solid black;
    display: inline-block;
  }


  .tag-line{
    color: black;
    font-size: 32px;
    line-height: 36px;
    --font-family-sans-serif: "Open Sans", sans-serif;
    --font-family-monospace: "Roboto Mono", monospace;    font-weight: normal;
    text-align: center;
    padding-top: 50px;
    padding-bottom: 25px;
  }

.tag-line2{
  color: black;
  font-size: 32px;
  line-height: 36px;
  --font-family-sans-serif: "Open Sans", sans-serif;
  --font-family-monospace: "Roboto Mono", monospace;  font-weight: normal;
  text-align: center;
  padding-bottom: 25px;
}

  .flex-grid {
    display: flex;
  }
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .column {
    flex-basis: 100%;
    margin: 10px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  /*.text-center{*/
    /*text-align: center;*/
  /*}*/

  .v-footer{
    text-align: center;
  }

</style>
