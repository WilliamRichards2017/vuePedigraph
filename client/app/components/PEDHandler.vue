<template>
  <div align="center" id='container'>

    <v-toolbar color="#123d53" dark>

      <v-spacer></v-spacer>

      <v-select :items="familyIDs"
                @change="resetValues()"
                id='selectFamily'
                label="Select Family ID"
                v-model="selectedFamily"

                style="border: none; background-color: transparent;"
      >
      </v-select>

      <v-spacer></v-spacer>

      <!--TODO: phenotypes shouldnt be passed in as prop most likely-->
      <v-select :items="phenotypes"
                id="selectPhenotype" label="Select Phenotype" v-model="selectedPhenotype"
      >
      </v-select>

      <v-spacer></v-spacer>

      <v-select :items="parsedVariants"
                id="selectGenotype" label="Select Genotype" v-model="selectedGenotype"
      ></v-select>

      <v-spacer></v-spacer>


      <v-select :items="regressionTypes" label="Select regression" v-model="selectedRegression"></v-select>

      <div class="subtitle2">Project correlation coefficient: <br>{{projectCorrelation}}</div>
      <v-spacer></v-spacer>
      <br>
      <div class="subtitle2">Family correlation coefficient: <br> {{familyCorrelation}}</div>

      <v-spacer></v-spacer>



      <v-spacer></v-spacer>

      <v-menu
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
        <template v-slot:activator="{ on }">
          <v-btn
            color="indigo"
            dark
            v-on="on"
            class="btn"
          >
            configure
            <br>
            affected status
          </v-btn>
        </template>

        <v-card>

          <v-container fluid>

            Display affected status as:
            <v-radio-group v-model="displayAffectedAs" :mandatory="false">
              <v-radio label="Binary" value="binary"></v-radio>
              <v-radio label="Gradient" value="gradient"></v-radio>
            </v-radio-group>


            Affected cuttoff


              <div class="affectedStatus"  v-show="displayAffectedAs === 'binary'">
              <v-select :items="operands"
                      id="selectOperands" label="operand" v-model="selectedOperand" class="operand" value=">">
            </v-select>

              <v-text-field
                v-model="affectedCuttoff"
                label="Affected Cutt-off"
                outlined
                clearable
              ></v-text-field>

              </div>

              <div class="affectedStatus" v-show="displayAffectedAs === 'gradient'">

                <v-text-field
                  v-model="minThreshold"
                  label="minimum PT threshold"
                  outlined
                  clearable
                ></v-text-field>

                <v-text-field
                  v-model="maxThreshold"
                  label="maximum PT threshold"
                  outlined
                  clearable
                ></v-text-field>

              </div>

          </v-container>





        </v-card>
      </v-menu>

      <v-spacer></v-spacer>

      <v-switch label="'Isolate family'"
                v-model="isolateFamily"></v-switch>


    </v-toolbar>

    <!--<v-navigation-drawer-->
      <!--v-model="drawer"-->
      <!--right-->
    <!--&gt;-->
    <!--</v-navigation-drawer>-->



    <div class="affectedStatus">

    <div id="pedigrees" v-show="showPed" style="width: 75%; height: 100%">
    </div>
    <vueScatter style="width: 25%; height: 100%" :rawData="scatterplotData" :linePoints="linePoints"> swag</vueScatter>

    </div>



  </div>
</template>

<script>
  import 'vuetify'
  import TAS from '../../static/TAS2R38';
  // import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
  // import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';









  //DO NOT REMOVE!!!
  import * as pedigreejs from '../../js/pedigreejs'
  //pedigreejs is used and must not be removed
  import PhenotypeHandler from '../../js/PhenotypeHandler'
  import HubSession from "../../js/HubSession";
  import family from '../../js/family'
  import Regression from "../../js/Regression.js"
  import toggle from './toggle.vue'
  import navigation from './navigation.vue'
  import vueScatter from "./scatterplot.vue"
  // import * as d3 from "d3";

  export default {
    name: 'PEDHandler',
    props: {
      txt: null,
      sample_id: null,
      family_id: null,
      project_id: null,
      access_token: null,
      token_type: null,
      expires_in: null,
      is_pedigree: null,
      source: null,
      launchedFrom: null,
      variants: null,
      family_id: null,
      phenotypes: null
    },
    components: {
      navigation,
      toggle,
      vueScatter
    },
    icons: {
      iconfont: 'fa'
    },
    data() {
      return {
        txtLines: '',
        txtDict: {},
        pedDict: {},
        PTCPhenotypes: {},
        TASGenotypes: TAS,
        cachedPhenotypes: {},
        cachedGenotypes: {},
        cachedNulls: [],
        familyIDs: [],
        families: {},
        selectedFamily: null,
        selectedPhenotype: null,
        selectedGenotype: null,
        selectedOperand: null,
        familyPhenotypes: null,
        familyPhenotypesFlag: false,
        parsedVariants: null,
        highlightedSampleIDs: [],
        isolateFamily: false,
        isolatedPedTxt: [],
        hubSession: null,
        sampleIds: null,
        projectCorrelation: null,
        familyCorrelation: null,
        minThreshold: 0,
        maxThreshold: 12,
        linePoints: null,
        regression: null,
        ccType: null,
        drawer: false,
        toggle: null,
        displayAffectedAs: "binary",
        operands: [">", "<", ">=", "<="],
        selectedRegression: null,
        showPed: true,
        affectedCuttoff: "7",
        scatterplotData: null,
        regressionTypes: ["Linear", "Polynomial"],
        opts: {
          "targetDiv": "pedigree",
          labels: ['alleles', 'NA']
        }
      }
    },
    beforeMount() {
      let self = this;
      localStorage.setItem('hub-iobio-tkn', self.token_type + ' ' + self.access_token);
      self.hubSession = new HubSession(self.source);
    },
    mounted() {
      let self = this;
      if (self.launchedFrom === "H") {
        console.log("launched from hub");
        self.buildFromHub();
        console.log("self.sample_id", self.sample_id);
      }
      if (self.launchedFrom === "D") {
        console.log("launched from demo");
        self.buildFromDemo();
      }
      if (self.launchedFrom === "U") {
        self.buildFromUpload();
      }
    }
    ,
    methods: {
      buildFromDemo() {
        let self = this;
        self.pedTxt = self.txt;
        self.parsedVariants = self.variants;
        self.populateModel();
        self.populatePTC();
        self.selectedPhenotype = "PTC Sensitivity";
        self.selectedRegression = "Linear"
        let PHandler = new PhenotypeHandler();
        self.PTCPhenotypes = PHandler.replacedIDs;
        self.selectedGenotype = "7:141972755_C/T";
        self.selectedFamily = "1463";
        // for(let key in self.PTCPhenotypes){
        //   console.log("PT:", self.PTCPhenotypes[key]);





        console.log("samplePC");
      },
      buildFromHub() {
        let self = this;
        self.pedTxt = self.txt;
        self.selectedPhenotype = "affected_status";
        self.populateModel();
        self.selectedFamily = self.family_id;
      },
      buildFromUpload() {
        let self = this;
        self.pedTxt = self.txt;
        self.populateModel();
        self.selectedFamily = self.txt.split(" ")[0];
      },
      populateModel() {
        let self = this;
        self.splitTxt();
        self.populateTxtDict();
        self.populatePedDict();
        self.populateFamilies();
        self.rebuildPedDict();
        self.highlightFamily();
        if(self.launchedFrom !== "U") {
          // self.parseVariants();
          // console.log("self.parsedVariants inside populateModel", self.parsedVariants);
        }
      },
      buildPhenotypes: function() {
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        if (self.launchedFrom === 'D') {
          self.buildDemoPhenotypes();
        } else if (self.launchedFrom === 'H') {
          self.buildHubPhenotypes();
        }
        $('#pedigree').on('nodeClick', self.onNodeClick);
      },
      //Needed for when mosaic has variants for a project with ped data
      parseVariants: function() {
        let self = this;
        self.parsedVariants = [];
        for(let i = 0; i < self.variants.length; i++){
          let parsedVariant = self.variants[i].chr + ":" + self.variants[i].pos + "_" + self.variants[i].ref + "/" + self.variants[i].alt;
          self.parsedVariants.push(parsedVariant);
        }
      },
      resetValues: function () {
        let self = this;
        self.selectedPhenotype = null;
        self.selectedGenotype = null;
      },
      onNodeClick: function (e, nodeId) {
        let self = this;
        let fam = self.families[self.selectedFamily];
        self.highlightedSampleIDs = fam.getFamily(nodeId.toString());
        self.highlightFamily();
      },
      notHighlighted: function (id) {
        let self = this;
        if (self.highlightedSampleIDs.includes(id)) {
          return false;
        }
        return true;
      },
      addCachedValuesToOpts: function (opts) {
        let self = this;
        for (let i = 0; i < opts.dataset.length; i++) {
          let id = parseInt(opts.dataset[i].name);
          if (self.cachedGenotypes.hasOwnProperty(id)) {
            let all = self.cachedGenotypes[id].toString();
            // opts.dataset[i].alleles = all;
          }
          if (self.cachedPhenotypes.hasOwnProperty(id)) {
            let aff = self.cachedPhenotypes[id];
            opts.dataset[i].affected = aff;
          }
          if (self.cachedNulls.includes(id)) {
            opts.dataset[i].NA = true;
          }
        }
        return opts;
      },
      populateSampleIds: function(){
        let self = this;
        self.sampleIds = [];

        if(typeof self.opts.dataset === "undefined"){
          return;
        }

        console.log("opts.dataset in populateSampleIds", self.opts.dataset);
        for(let i = 0; i < self.opts.dataset.length; i++){
          let sampleId = parseInt(self.opts.dataset[i].name);
          self.sampleIds.push(sampleId);
        }
      },


      highlightFamily: function () {
        let self = this;
        let parentNodes =
          d3.selectAll(".node").nodes().map(function (d) {
          return d.parentNode;
        });
        parentNodes.forEach(function (n) {
          let nodeToHightlight = d3.select(n.nextSibling.childNodes[0]);
          let border = d3.select(n.previousSibling);
          let txt = d3.select(n.nextSibling.nextSibling.nextSibling.nextSibling);
          if (self.notHighlighted(n.id.toString())) {
            nodeToHightlight.style('opacity', 0.1);
            border.style('opacity', 0.1);
            txt.style("opacity", 0.1);
          } else {

            if (self.cachedNulls.includes(parseInt(n.id))) {
              nodeToHightlight.style('opacity', 0.5);

              border.style('opacity', 0.5);
              txt.style('opacity', 1);
            } else {
              nodeToHightlight.style('opacity', 1)

              border.style('opacity', 1);
              txt.style('opacity', 1);
            }

          }
        });

            self.highlightGTs();
        },

      highlightGTs: function(){

        let self = this;

        console.log("self.highlightedSampleIDs", self.highlightedSampleIDs);
        console.log("self.sampleIds", self.sampleIds);


        for(let i = 0; i < self.cachedNulls.length; i++){

          let node = self.getNodeById(self.cachedNulls[i]);


          if(!self.highlightedSampleIDs.includes(self.cachedNulls[i].toString())) {

            let rects = node.selectAll("rect")
              .attr("opacity", 0.05);

            console.log("node to highlight", node);
            console.log("rects", rects);
          }
          else{
            let rects = node.selectAll("rect")
              .attr("opacity", 0.5);
            console.log("rects", rects);


          }
          }
        },


      isolatePedTxt: function (ids) {
        let self = this;
        let txtLines = [];
        for (let i = 0; i < ids.length; i++) {
          let txtLine = self.txtDict[parseInt(ids[i])];
          txtLines.push(txtLine);
        }
        let familyId = txtLines[0].split(/\s+/).slice(0, 1);
        let newFam = new family(familyId, txtLines);
        let txt = newFam.famToTxt();
        return txt;
      },
      splitTxt: function () {
        let self = this;
        self.txtLines = self.pedTxt.split(/\r\n|\n/);
      },
      populateTxtDict: function () {
        let self = this;
        for (let i = 0; i < self.txtLines.length; i++) {
          let line = self.txtLines[i];
          let individualID = line.split(/\s+/).slice(1, 2);
          self.txtDict[individualID] = line;
        }
      },
      populatePedDict: function () {
        let self = this;
        for (let i = 0; i < self.txtLines.length; i++) {
          let line = self.txtLines[i];
          let familyID = line.replace(/ .*/, '');
          if (self.pedDict[familyID]) {
            this.pedDict[familyID].push(line);
          } else {
            self.pedDict[familyID] = [];
            self.pedDict[familyID].push(line);
          }
        }
      },
      populatePTC: function () {
        let self = this;
        let PHandler = new PhenotypeHandler();
        self.PTCPhenotypes = PHandler.replacedIDs;
      },
      rebuildPedDict: function () {
        let self = this;
        for (let key in self.pedDict) {
          let line = self.pedDict[key].line;
          let familyID = self.pedDict[key].familyID;
          if (self.pedDict[familyID]) {
            this.pedDict[familyID].push(line);
          } else {
            self.pedDict[familyID] = [];
            self.pedDict[familyID].push(line);
          }
        }
      },
      populateFamilies: function () {
        let self = this;
        for (let key in self.pedDict) {
          if (self.pedDict.hasOwnProperty(key)) {
            self.familyIDs.push(key);
            let pedLines = self.pedDict[key];
            let fam = new family(key, pedLines);
            self.families[fam.familyID] = fam;
          }
        }
        // console.log("self.families", self.families);
      },
      getDataByFamilyID: function (id) {
        let self = this;
        let fam = self.families[id];
        let data = '';
        for (let key in fam.pedLines) {
          let line = fam.pedLines[key].line + '\n';
          data = data.concat(line);
        }
        return data;
      },
      buildDemoPhenotypes: function () {
        let self = this;



        self.cachedPhenotypes = {};
        if (self.selectedPhenotype === "PTC Sensitivity") {
          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = parseInt(self.opts.dataset[i].name);
            let sens = self.PTCPhenotypes[id];
            if (typeof sens === 'undefined' || sens === 'nan') {
              self.opts.dataset[i].NA = true;

              self.cachedNulls.push(id);
            } else if (typeof sens === 'string') {
              if (sens.includes('>') || sens.includes('<')) {
                sens = sens.slice(-1);
              }
            }
            let aff = 0;
            if (sens < 7) {
              aff = 2;
            }
            self.opts.dataset[i].affected = aff;
            self.cachedPhenotypes[id] = aff;
            // // Label Debug // let nid = self.opts.dataset[i].name.toString(); // let allele = self.TASGenotypes[nid]; // self.opts.dataset[i].alleles = sens + "," + allele;
          }
          self.opts = self.addCachedValuesToOpts(self.opts);
          self.opts = ptree.build(self.opts);

        }
        // return opts.dataset;
      },



      buildHubPhenotypes: function(){
        let self = this;
        self.promisePhenotypes()
          .then((pts) => {

            for (let i = 0; i < self.opts.dataset.length; i++) {
              let sampleId = parseInt(self.opts.dataset[i].name);
              if (pts.hasOwnProperty(sampleId)) {
                // console.log(sampleId, pts[sampleId]);
                let pt = pts[sampleId];
                if (pt === "Affected" || pt === "affected") {
                  self.opts.dataset[i].affected = 2;
                  self.cachedPhenotypes[sampleId] = 2;
                } else if (pt === "Unaffected" || pt === "unaffected") {
                  self.opts.dataset[i].affected = 0;
                  self.cachedPhenotypes[sampleId] = 0;
                }
              }
            }
            self.opts = self.addCachedValuesToOpts(self.opts);
            self.opts = ptree.build(self.opts);
          })
      },
      promisePhenotypes: function(){
        return new Promise((resolve, reject) => {
          let self = this;
          let pts = {};
          let promises = [];
          console.log("typeof selectedPhenotype", typeof self.selectedPhenotype);
          if(typeof self.selectedPhenotype === "object"){
            self.selectedPhenotype = "affected_status";
          }
          self.populateSampleIds();
          for (let i = 0; i < self.sampleIds.length; i++) {
            let metP = self.hubSession.promiseGetMetricsForSample(self.project_id, self.sampleIds[i])
              .then((data) => {
                let pt = self.selectedPhenotype;
                let samplePhenotype = data.metrics[pt];
                let sampleId = self.sampleIds[i];
                pts[sampleId] = samplePhenotype;
              })
            promises.push(metP);
          }
          Promise.all(promises)
            .then(() => {
              resolve(pts)
            }).catch( (e) => {
            console.log("error", e);
            reject(e);
          });
        })
      },
      addNewGenotypesToOpts: function (opts) {
        let self = this;
        if (self.selectedGenotype === '7:141972755_C/T') {
          for (let i = 0; i < opts.dataset.length; i++) {
            let id = parseInt(opts.dataset[i].name);
            let allele = self.TASGenotypes[id].split(";")[0];
            // opts.dataset[i].alleles = allele;
            self.cachedGenotypes[id] = allele;
          }
          self.opts = self.addCachedValuesToOpts(opts);
        }
        return opts.dataset;
      },

      getNodeById: function(id){
        let node = d3.select('[id="'+ id +'"]');

        let p1 = node.select(function() {
          return this.parentNode;
        });


        return p1;
      },

      drawGenotypeBars: function(){
        let self = this;

        console.log("cachedGenotypes inside draw bars", self.cachedGenotypes);

        for(let key in self.cachedGenotypes){
          let node = self.getNodeById(key);

          console.log("key", key);

          let gt = self.cachedGenotypes[key];

          console.log("self.cachedNulls", self.cachedNulls);

          let opacity = 1.0;

          if(self.cachedNulls.includes(parseInt(key))){

            opacity = 0.5

          }


          console.log("gt", gt);

          let blue = "dodgerblue";
          let red = "#ff3333";

          if(gt === "0/1") {

            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "-7")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", blue);

            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "2")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", red);
          }

            else if (gt === "0/0"){
            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "-7")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", blue);

            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "2")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", blue);
            }
          else if (gt === "1/1"){
            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "-7")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", red);

            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "2")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", red);
          }
        }
      }
    },
    watch: {
      selectedFamily: function () {
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts = ptree.build(self.opts);
        self.populateSampleIds();


        // console.log("self.sampleIds in watcher", self.sampleIds);
        $('#pedigree').on('nodeClick', self.onNodeClick)
      },

      toggle: function(){
        let self = this;

        self.showPed = !self.showPed;
      },

      isolateFamily: function () {
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        if (self.isolateFamily) {
          self.isolatedPedTxt = self.isolatePedTxt(self.highlightedSampleIDs);
          self.opts.dataset = io.readLinkage(self.isolatedPedTxt);
          self.opts = self.addCachedValuesToOpts(self.opts);
          self.opts = ptree.build(self.opts);
        } else {
          self.opts.dataset = io.readLinkage(self.pedTxt);
          self.opts = self.addCachedValuesToOpts(self.opts);
          self.opts = ptree.build(self.opts);
          ptree.build(self.opts)
        }
        $('#pedigree').on('nodeClick', self.onNodeClick);
      },
      selectedPhenotype: function () {
        let self = this;
        self.buildPhenotypes();
      },
      selectedGenotype: function () {
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.cachedGenotypes = {};
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts.dataset = self.addNewGenotypesToOpts(self.opts);
        self.opts = ptree.build(self.opts);

        self.drawGenotypeBars();

        $('#pedigree').on('nodeClick', self.onNodeClick);
      },
      selectedRegression: function() {
        let self = this;

        if (self.selectedRegression === "Linear") {
          self.regression = new Regression(self.TASGenotypes, self.PTCPhenotypes, "Linear");
          self.ccType = "Pearson correlations coefficient";
        }

        else if (self.selectedRegression === "Polynomial"){
          self.regression = new Regression(self.TASGenotypes, self.PTCPhenotypes, "Polynomial");
          self.ccType = "Pearsons correlation coefficient";
        }



          self.projectCorrelation = self.regression.projectCorrelation.toFixed(4);

          self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
          self.opts.dataset = io.readLinkage(self.pedTxt);

          self.populateSampleIds();
          self.familyCorrelation = self.regression.getFamilyCorrelation(self.sampleIds).toFixed(4);
          console.log("self.familyPC", self.familyCorrelation);
          self.scatterplotData = self.regression.getScatterplotData();
          self.linePoints = self.regression.getLinePoints();

          console.log("self.linePoints inside PedHandler", self.linePoints);



      }
    }
  }
</script>

<style>
  #pedigrees svg > rect {
    background-color: rgb(240, 250, 254);
  }
  #pedigrees svg {
    height: 2000px;          /* WebKit-based browsers will ignore this. */
    /*height: -webkit-fill-available;  !* Mozilla-based browsers will ignore this. *!*/
    /*height: fill-available;*/
  }

  .phenotypeNA{
  stroke-dasharray: 5,5;
  }

  .btn{
    height: 50px;
  }

  .operand {
    width: 100px;
  }

  .affectedStatus{
    display: flex; /* or inline-flex */

  }

  /*<v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>*/



</style>
