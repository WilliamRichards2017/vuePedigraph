<template>
  <div id='container' align="center">

    <v-toolbar dark
      color="#123d53"
    >
      <v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>

      <v-spacer></v-spacer>

          <v-select id='selectFamily'
            :items="familyIDs"
                    label="Select Family ID"
                    v-model="selectedFamily"
                    @change="resetValues()"
          >
          </v-select>

      <v-spacer></v-spacer>


        <v-select id="selectPhenotype"
                  :items="phenotypes" label="Select Phenotype" v-model="selectedPhenotype"
        >
        </v-select>

      <v-spacer></v-spacer>


        <v-select id="selectGenotype"
                  :items="genotypes" label="Select Genotype" v-model="selectedGenotype"
                  >
        </v-select>

      <v-spacer></v-spacer>

      <v-switch v-model="isolateFamily"
                :label="'Isolate Selected Nodes'" ></v-switch>
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
  import PTC from '../../static/PTC';
  import idMap from '../../static/idMap';


  import {mockAffected, mockAlleles, getPhenotypeLikelyhood} from '../../js/mock'
  import 'vuetify'

  export default {
    name: 'PEDHandler',
    props: ['txt'],
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
        familyIDs: [],
        selectedFamily : null,
        selectedPhenotype : null,
        selectedGenotype : null,

      // phenotypes: [ 'PTC Sensitivity', 'Familial pancreatic carcinoma'],
      //   genotypes: ['14:19248895_GCAAAC/ACAACG', '7:141973615_C/A'],

        phenotypes: [ 'PTC Sensitivity'],
        genotypes: ['7:141973615_C/A'],


        opts: {
          "targetDiv": "pedigree",
          "symbol_size": 35,

          "DEBUG": false
        },

        cachedPhenotypes: [],
        cachedGenotypes: {},
        families: {},
        highlightedFamilyIDs: [],
        isolateFamily: false,
        isolatedPedTxt: [],
      }
    },

    beforeMount() {
      this.splitTxt();
      this.populateTxtDict();
      this.populatePedDict();
      this.populateFamilies();
      this.populatePTC();
      this.rebuildPedDict();
      this.highlightFamily();
    },

    methods: {
      resetValues: function(){
        let self = this;
        self.selectedPhenotype = null;
        self.selectedGenotype = null;

      },

      onNodeClick: function(e, nodeId) {
        let self = this;
        let fam = self.families[self.selectedFamily];

        console.log("fam");

        self.highlightedFamilyIDs = fam.getFamily(nodeId.toString());
        self.highlightFamily();

      },

      notHighlighted: function(id){
        let self = this;
        if(self.highlightedFamilyIDs.includes(id)){
          return false;
        }
          return true;
      },

      highlightFamily: function(){

        let self = this;
        let parentNodes = d3.selectAll(".node").nodes().map(function(d) { return d.parentNode; });

        parentNodes.forEach( function(n) {
          let nodeToHightlight = d3.select(n.nextSibling.childNodes[0]);
          let border = d3.select(n.previousSibling);
          let txt = d3.select(n.nextSibling.nextSibling.nextSibling.nextSibling);

          if(self.notHighlighted(n.id.toString())) {
            nodeToHightlight.style('opacity', 0.2);
            border.style('opacity', 0.2);
            txt.style("opacity", 0.2);
          }
          else{
            nodeToHightlight.style('opacity', 1);
            border.style('opacity', 1);
            txt.style('opacity', 1);

          }
        });
      },

      isolatePedTxt : function(ids){
        let self = this;
        let txtLines = [];

        for(let i = 0; i < ids.length; i++){
          let txtLine = self.txtDict[parseInt(ids[i])];
          txtLines.push(txtLine);
        }

        let familyId =  txtLines[0].split(/\s+/).slice(0,1);
        let newFam = new family(familyId, txtLines);
        let txt = newFam.famToTxt();
        return txt;
      },

      splitTxt : function() {
        let self = this;
        self.txtLines = self.txt.split(/\r\n|\n/);
      },

      populateTxtDict: function() {
        let self = this;
        for (let i = 0; i < self.txtLines.length; i++) {
          let line = self.txtLines[i];
          let individualID =  line.split(/\s+/).slice(1,2);
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

      populatePTC: function(){
        let self = this;
        let PHandler = new PhenotypeHandler();
        self.PTCPhenotypes = PHandler.replacedIDs;
      },


      rebuildPedDict(){
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


      getDataByFamilyID: function(id) {
        let self = this;
        let fam = self.families[id];
        let data = '';

        for(let key in fam.pedLines){
          let line = fam.pedLines[key].line + '\n';
          data = data.concat(line);
        }
        return data;
      },


      addNewPhenotypesToOpts: function(opts){
        let self = this;
        self.cachedPhenotypes = [];

        if(self.selectedPhenotype === "PTC Sensitivity" ){
          for (let i = 0; i < opts.dataset.length; i++) {
              let id = opts.dataset[i].name;
              let sens = self.PTCPhenotypes[id];
              let aff = 0;
              if(sens < 8 ){
                aff = 2;
              }
              opts.dataset[i].affected = aff;
              opts.dataset[i].alleles = self.cachedGenotypes[id];

            //Label Debug
            // let nid = self.opts.dataset[i].name.toString();
            // let allele = self.TASGenotypes[nid];
            // self.opts.dataset[i].alleles =  sens + "," + allele;

            self.cachedPhenotypes.push(aff);
            }
          }
        //Toggle mock phenotype.
        //
        // else if(self.selectedPhenotype === "Familial pancreatic carcinoma") {
        //   for (let i = 0; i < opts.dataset.length; i++) {
        //     let phen = mockAffected(0.5);
        //     opts.dataset[i].affected = phen;
        //     self.cachedPhenotypes.push(phen);
        //     if (self.cachedGenotypes.length > 0) {
        //       opts.dataset[i].alleles = self.cachedGenotypes[i];
        //     }
        //   }
        // }
        return opts.dataset;
      }
    },

    watch : {
      selectedFamily : function(){

        let self = this;

        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts = ptree.build(self.opts);

        $('#pedigree').on('nodeClick', self.onNodeClick);
      },

      isolateFamily: function(){
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        if(self.isolateFamily){
          self.isolatedPedTxt = self.isolatePedTxt(self.highlightedFamilyIDs);
          self.opts.dataset = io.readLinkage(self.isolatedPedTxt);

          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = parseInt(self.opts.dataset[i].name);

            if (self.cachedGenotypes.hasOwnProperty(id)) {
              let all = self.cachedGenotypes[id].toString();
              self.opts.dataset[i].alleles = all;
            }
          }
          self.opts = ptree.build(self.opts);
        }
        else{
          self.opts.dataset = io.readLinkage(self.pedTxt);

          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = parseInt(self.opts.dataset[i].name);

            if (self.cachedGenotypes.hasOwnProperty(id)) {
              let all = self.cachedGenotypes[id].toString();
              self.opts.dataset[i].alleles = all;
            }
          }
          self.opts = ptree.build(self.opts);
        }
        $('#pedigree').on('nodeClick', self.onNodeClick);
      },

      selectedPhenotype : function(){
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts.dataset = self.addNewPhenotypesToOpts(self.opts);
        self.opts = ptree.build(self.opts);

        $('#pedigree').on('nodeClick', self.onNodeClick);
      },

      selectedGenotype : function(){
        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        self.cachedGenotypes = {};
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);

        if (self.selectedGenotype === '7:141973615_C/A'){
            for (let i = 0; i < self.opts.dataset.length; i++) {
              let id = self.opts.dataset[i].name.toString();
              let allele = self.TASGenotypes[id].split(";")[0];
              let nid = self.opts.dataset[i].name;

              // let sens = self.PTCPhenotypes[nid];
              // self.opts.dataset[i].alleles = sens + ":" + allele;

              self.opts.dataset[i].alleles = allele;
              self.opts.dataset[i].affected = self.cachedPhenotypes[i];
              self.cachedGenotypes[nid] = allele;
            }
          }
        //Toggle mock genotype
        //
        // else {
        //   for (let i = 0; i < self.opts.dataset.length; i++) {
        //     let a = mockAlleles(0.5);
        //     self.opts.dataset[i].alleles = a;
        //     //self.opts.dataset[i].alleles = '1/1';
        //     self.opts.dataset[i].affected = self.cachedPhenotypes[i];
        //
        //     self.cachedGenotypes.push(a);
        //   }
        // }

        self.opts = ptree.build(self.opts);
        $('#pedigree').on('nodeClick', self.onNodeClick);

      }
    },
  }
</script>

<style>

  #pedigrees {
    margin-top: 3px;
  }

</style>

