<template>
  <div align="center" id='container'>

    <v-toolbar color="#123d53" dark>
      <v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-select :items="familyIDs"
                @change="resetValues()"
                id='selectFamily'
                label="Select Family ID"
                v-model="selectedFamily"
      >
      </v-select>

      <v-spacer></v-spacer>

      <v-select :items="phenotypes"
                id="selectPhenotype" label="Select Phenotype" v-model="selectedPhenotype"
      >
      </v-select>

      <v-spacer></v-spacer>

      <v-select :items="parsedVariants"
                id="selectGenotype" label="Select Genotype" v-model="selectedGenotype"
      >
      </v-select>

      <v-spacer></v-spacer>

      <v-switch :label="'Isolate Selected Nodes'"
                v-model="isolateFamily"></v-switch>
    </v-toolbar>

    <div id="pedigrees">
    </div>
  </div>
</template>

<script>
  import * as pedigreejs from '../../js/pedigreejs'
  import PhenotypeHandler from '../../js/PhenotypeHandler'

  import family from '../../js/family'
  import toggle from './toggle.vue'
  import navigation from './navigation.vue'
  import TAS from '../../static/TAS2R38';


  import 'vuetify'
  import HubSession from "../../js/HubSession";

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
      familySamples: null,
      phenotypes: null
    },
    components: {
      navigation,
      toggle
    },
    data() {
      return {
        txtLines: '',
        txtDict: {},
        pedDict: {},

        PTCPhenotypes: {},
        TASGenotypes: TAS,

        // phenotypes: ['PTC Sensitivity'],
        genotypes: ['7:141972755_C/T'],

        cachedPhenotypes: {},
        cachedGenotypes: {},
        cachedNulls: [],

        familyIDs: [],
        families: {},

        selectedFamily: null,
        selectedPhenotype: null,
        selectedGenotype: null,

        familyPhenotypes: null,
        familyPhenotypesFlag: false,

        parsedVariants: null,

        highlightedFamilyIDs: [],
        isolateFamily: false,
        isolatedPedTxt: [],
        hubSession: null,

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
        self.populateModel();
        self.populatePTC();
        self.selectedFamily = self.family_id;
      },

      buildFromHub() {
        let self = this;
        self.pedTxt = self.txt;
        self.selectedPhenotype = "affected_status";
        self.populateModel();
        self.selectedFamily = self.family_id;

        console.log("phenotypes inside buildFromHub", self.phenotypes);

        let b = self.phenotypes.includes("affected_status");

        console.log("was able to find affected_status", b);

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

      parseVariants: function() {
        let self = this;
        self.parsedVariants = [];

        console.log("self.variants inside parseVariants", self.variants);

        for(let i = 0; i < self.variants.length; i++){
          let parsedVariant = self.variants[i].chr + ":" + self.variants[i].pos + "_" + self.variants[i].ref + "/" + self.variants[i].alt;
          self.parsedVariants.push(parsedVariant);
          console.log("parsed variant is", parsedVariant);
          console.log("parsed variants is ", self.parsedVariants);
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
        self.highlightedFamilyIDs = fam.getFamily(nodeId.toString());
        self.highlightFamily();
      },

      notHighlighted: function (id) {
        let self = this;
        if (self.highlightedFamilyIDs.includes(id)) {
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
            opts.dataset[i].alleles = all;
          }
          if (self.cachedPhenotypes.hasOwnProperty(id)) {
            let aff = self.cachedPhenotypes[id];
            console.log("aff", aff);
            opts.dataset[i].affected = aff;
          }
          if (self.cachedNulls.includes(id)) {
            opts.dataset[i].NA = " **";
          }
        }
        return opts;
      },

      highlightFamily: function () {
        let self = this;
        let parentNodes = d3.selectAll(".node").nodes().map(function (d) {
          return d.parentNode;
        });

        parentNodes.forEach(function (n) {
          let nodeToHightlight = d3.select(n.nextSibling.childNodes[0]);
          let border = d3.select(n.previousSibling);
          let txt = d3.select(n.nextSibling.nextSibling.nextSibling.nextSibling);

          if (self.notHighlighted(n.id.toString())) {
            nodeToHightlight.style('opacity', 0.2);
            border.style('opacity', 0.2);
            txt.style("opacity", 0.2);
          } else {
            nodeToHightlight.style('opacity', 1);
            border.style('opacity', 1);
            txt.style('opacity', 1);
          }
        });
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

      addDemoPhenotypesToOpts: function (opts) {
        let self = this;
        self.cachedPhenotypes = {};
        if (self.selectedPhenotype === "PTC Sensitivity") {
          for (let i = 0; i < opts.dataset.length; i++) {
            let id = parseInt(opts.dataset[i].name);
            let sens = self.PTCPhenotypes[id];

            if (typeof sens === 'undefined' || sens === 'nan') {
              opts.dataset[i].NA = ' **';
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
            opts.dataset[i].affected = aff;
            self.cachedPhenotypes[id] = aff;
            // // Label Debug // let nid = self.opts.dataset[i].name.toString(); // let allele = self.TASGenotypes[nid]; // self.opts.dataset[i].alleles = sens + "," + allele;
          }
          self.opts = self.addCachedValuesToOpts(self.opts);
        }
        return opts.dataset;
      },

      promisePhenotypes: function(opts){

        return new Promise((resolve, reject) => {
          let self = this;
          let pts = [];
          let promises = [];
          for (let i = 0; i < self.familySamples.length; i++) {
            let metP = self.hubSession.promiseGetMetricsForSample(self.project_id, self.familySamples[i])
              .then((data) => {
                let pt = self.selectedPhenotype;
                let samplePhenotype = data.metrics[pt];
                pts.push(samplePhenotype);
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
            opts.dataset[i].alleles = allele;
            self.cachedGenotypes[id] = allele;
          }
          self.opts = self.addCachedValuesToOpts(opts);
        }
        return opts.dataset;
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
        $('#pedigree').on('nodeClick', self.onNodeClick)
      },


      isolateFamily: function () {
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        if (self.isolateFamily) {
          self.isolatedPedTxt = self.isolatePedTxt(self.highlightedFamilyIDs);
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
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);


        self.opts.dataset = io.readLinkage(self.pedTxt);
        // console.log("self.opts.dataset after io read linkage", self.opts.dataset[0].display_name);
        // console.log("self.opts after io read linkage", self.opts);

        if(self.launchedFrom === 'D') {
          self.opts.dataset = self.addDemoPhenotypesToOpts(self.opts);
          self.opts = ptree.build(self.opts);

        }
        else if(self.launchedFrom === 'H'){

          console.log("change in selectedPhenotype watcher");

          self.promisePhenotypes(self.opts)
            .then((pts) => {
              for(let i = 0; i < pts.length; i++){
                if(pts[i] === "Affected"){
                  self.opts.dataset[i].affected = 2;
                }
                else if (pts[i] === "Unaffected"){
                  self.opts.dataset[i].affected = 0;
                }
                else{
                }
                self.opts.dataset[i].alleles = pts[i];

              }
              console.log("inside of promise resolution");
              self.opts = ptree.build(self.opts);
            })
        }

        $('#pedigree').on('nodeClick', self.onNodeClick);
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
        $('#pedigree').on('nodeClick', self.onNodeClick);
      }
    }
  }
</script>

<style>
  #pedigrees svg > rect {
    background-color: rgb(240, 250, 254);
  }

  #pedigrees svg {
    height: -webkit-fill-available;
  }
</style>

