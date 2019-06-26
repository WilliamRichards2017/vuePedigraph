<template>
  <div align="center" id='container'>

    <v-toolbar color="#123d53"
               dark
    >
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

      <v-select :items="genotypes"
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
  import HubSession from '../../js/HubSession'

  import family from '../../js/family'
  import toggle from './toggle.vue'
  import navigation from './navigation.vue'
  import TAS from '../../static/TAS2R38';
  import PTC from '../../static/PTC';
  import idMap from '../../static/idMap';


  import {mockAffected, mockAlleles, getPhenotypeLikelyhood} from '../../js/mock'
  import 'vuetify'

  export default {
    name: 'PEDHandler',
    props: {
      txt: null,
      sample_id: null,
      project_id: null,
      access_token: null,
      token_type: null,
      expires_in: null,
      is_pedigree: null,
      source: null

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

        phenotypes: ['PTC Sensitivity'],
        genotypes: ['7:141972755_C/T'],
        nullPhenIds: [],

        cachedPhenotypes: {},
        cachedGenotypes: {},
        cachedNulls: [],

        isUpload: false,


        // phenotypes: [ 'PTC Sensitivity', 'Familial pancreatic carcinoma'],
        // genotypes: ['14:19248895_GCAAAC/ACAACG', '7:141973615_C/A'],

        familyIDs: [],
        families: {},

        selectedFamily: null,
        selectedPhenotype: null,
        selectedGenotype: null,

        highlightedFamilyIDs: [],
        isolateFamily: false,
        isolatedPedTxt: [],

        hubSession: null,
        hubRawPedigree: null,
        parsedUrl: null,
        project: null,

        opts: {
          "targetDiv": "pedigree",
          labels: ['alleles', 'NA']
        }

      }
    },

    beforeMount() {


      localStorage.setItem('hub-iobio-tkn', this.token_type + ' ' + this.access_token);

      let self = this;


      console.log("typeof sample_id", typeof self.sample_id);
      if(typeof self.sample_id !== "undefined"){
        self.isUpload = true;
      }

      // this.splitTxt();
      // this.populateTxtDict();
      // this.populatePedDict();
      // this.populateFamilies();
      // this.populatePTC();
      // this.rebuildPedDict();
      // this.highlightFamily();
      // this.selectedFamily = '1463';

    },

    methods: {
      resetValues: function () {
        let self = this;
        self.selectedPhenotype = null;
        self.selectedGenotype = null;

      },

      initHubSession(){
        let self = this;
        self.hubSession = new HubSession();
      },

      promiseHubSession: function (sampleId) {
        let self = this;
        return self.hubSession.promiseInit(sampleId, self.source, self.is_pedigree, self.project_id);
      },

      buildPedFromSampleId(sampleId){
        let self = this;
        self.promiseHubSession(sampleId).then(data => {
          self.hubRawPedigree = data.rawPedigree;
          self.buildPedFromHub();
        });
      },

      populateDropdownsFromHub: function(){
        let self = this;
        for(let i = 0; i < self.project.data.length; i++){
          let id = self.project.data[i].id;
          self.familyIDs.push(id);
        }R
      },

      buildPedFromHub: function(){

        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        let self = this;

        self.pedTxt = "";

        for (const [key, value] of Object.entries(self.hubRawPedigree)) {

          let pedLine = "";

          let paternal_id = "0";
          let maternal_id = "0";

          let ped = value["pedigree"];
          let name = value["name"];
          let id = value["id"];

          let sex = ped["sex"];
          let affection_status = ped["affection_status"];
          let kindred_id = ped["kindred_id"];


          console.log("ped", ped);
          console.log("name", name);

          if(ped.hasOwnProperty("paternal_id")){
            paternal_id = ped["paternal_id"];
            console.log("paternal_id", typeof paternal_id);
            if(typeof paternal_id === "object"){
              paternal_id = "0";
            }
          }

          if(ped.hasOwnProperty("maternal_id")){
            maternal_id = ped["maternal_id"];
            if(typeof maternal_id === "object"){
              maternal_id = "0";
            }
          }


          pedLine = pedLine + kindred_id + " " + id + " " + paternal_id + " " + maternal_id + " " + sex + " " + affection_status + "\n";


          console.log("pedLine is:", pedLine);

          self.pedTxt = self.pedTxt + pedLine;

        }

        // console.log("pedTxt inside hubToTxt", self.pedTxt);

        self.opts.dataset = io.readLinkage(self.pedTxt);
        console.log(self.pedTxt);
        self.opts = ptree.build(self.opts);

        $('#pedigree').on('nodeClick', self.onNodeClick);


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

          // console.log("cachedNull", self.cachedNulls, "id", id);
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
        self.txtLines = self.txt.split(/\r\n|\n/);
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

      addNewPhenotypesToOpts: function (opts) {
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

            // // Label Debug
            // let nid = self.opts.dataset[i].name.toString();
            // let allele = self.TASGenotypes[nid];
            // self.opts.dataset[i].alleles = sens + "," + allele;
          }

          self.opts = self.addCachedValuesToOpts(self.opts);
        }

        return opts.dataset;
      },

      addNewGenotypesToOpts: function (opts) {
        let self = this;
        if (self.selectedGenotype === '7:141972755_C/T') {
          for (let i = 0; i < opts.dataset.length; i++) {
            console.log("opts.dataset[i]", opts.dataset[i]);
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

        self.buildPedFromHub();

        console.log("self.PedTxt in selectedFamily", self.pedTxt);

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
        self.opts.dataset = self.addNewPhenotypesToOpts(self.opts);
        self.opts = ptree.build(self.opts);

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
    },

    mounted() {

      let self = this;

      if(self.isUpload){
        self.initHubSession();
        self.buildPedFromSampleId(self.sample_id);
        // self.populateDropdownsFromHub();
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

