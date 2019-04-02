
<template>

  <div id='container' style="margin:50px" align="center">
    <h1 style="color:#123d53;">
      Pedigree Visualizer
    </h1>

    <label for="selectFamily">
    <p>Family IDs</p>
          <select id='selectFamily' v-model="selectedFamily">
            <option disabled value="">Select a family ID</option>
            <option v-for="family in familyIDs">{{family}}</option>
          </select>
    </label>

    <label for="selectPhenotype"><p>Phenotypes</p>
      <select id="selectPhenotype" v-model="selectedPhenotype">
        <option disabled value="">Select a phenotype</option>
        <option v-for="phenotype in phenotypes">{{phenotype}}</option>
      </select>
    </label>

    <label for="selectGenotype"><p>Genotypes</p>
      <select id="selectGenotype" v-model="selectedGenotype">
        <option disabled value="">Select a genotype</option>
        <option v-for="genotype in genotypes">{{genotype}}</option>
      </select>
    </label>

    <toggle v-model="isolateFamily" color="#253DB9">Isolate selected Family</toggle>

    <div id="pedigrees">

    </div>

  </div>
</template>

<script>
  import * as pedigreejs from '../../js/pedigreejs'
  import family from '../../js/family'
  import toggle from './toggle.vue'





  export default {
    name: 'PEDHandler',
    props: ['txt'],
    components: {
      toggle
    },
    data() {
      return {
        txtLines: '',
        pedDict: {},
        familyIDs: [],
        selectedFamily : null,
        selectedPhenotype : null,
        selectedGenotype : null,

      phenotypes: ['Diabetes', 'Cancer', 'Familial pancreatic carcinoma'],
        genotypes: ['14:19248895_GCAAAC/ACAACG', '14:20142925_G/A', '14:24039463_T/G'],
        opts: {
          "targetDiv": "pedigree",
          "btn_target": "diabetes2_history",
          "width": 823.3333333333334,
          "height": 400,
          "symbol_size": 35,
          "edit": true,
          "diseases": [
            {
              "type": "diabetes",
              "colour": "#F68F35"
            }
          ],

          "DEBUG": false
        },

        cachedPhenotypes: [],
        cachedGenotypes: [],
        families: {},
        highlightedFamilyIDs: [],
        isolateFamily: false


      }
    },

    beforeMount() {
      this.splitTxt();
      this.populatePedDict();
      this.populateFamilies();
      this.highlightFamily();
    },

    methods: {
      onNodeClick: function(e, nodeId) {
        let self = this;
        console.log('Message RECEIVED START! ' + nodeId);

        let fam = self.families[self.selectedFamily];

        self.highlightedFamilyIDs = fam.getFamily(nodeId.toString());

        self.highlightFamily();

        // TODO: get your matching family IDs, use d3 or jquery to select nodes w/ those IDs, update css class
      },

      notHighlighted: function(id){

        let self = this;

        console.log("id", id);
        console.log("highlighted nodes ", self.highlightedFamilyIDs);

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
            console.log("applying styling");
            nodeToHightlight.style('opacity', 0.2);
            border.style('opacity', 0.2);
            txt.style("opacity", 0.2);
          }
          else{
            nodeToHightlight.style('opacity', 1);
            border.style('opacity', 1);
            txt.style('opacity', 1);

          }
        }
      )

      },

      rebuildPed: function(opts){
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.opts = ptree.build(self.opts);
        $('#pedigree').on('nodeClick', self.onNodeClick);

      },

      buildPedFromIDs : function(ids){
        let self = this;
        let ped = "";
        let pedLines = self.families[self.selectedFamily].pedLines;

        for(let i = 0; i < ids.length; i++){
          let line = pedLines[ids[i]].line;
          // console.log(line);
          ped = ped + line + '\n';
        }
        console.log("ped", ped);
        return ped;
      },


    splitTxt : function() {
        let self = this;
        self.txtLines = self.txt.split(/\r\n|\n/);
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
        console.log(self.families);
      },


      mockAffected: function(threshold) {
        let i = Math.random();

        if(i < threshold){
          return 2;
        }
        else{
          return 0;
        }
      },

      mockAlleles: function(threshold){

        let alleles = "";

        let a1T = Math.random();
        let a2T = Math.random();

        if(a1T < threshold){
          alleles += '1/'
        }
        else{
          alleles += '0/'
        }

        if(a2T < threshold){
          alleles += '1'
        }
        else{
          alleles += '0'
        }
        return alleles;

      },

      getDataByFamilyID: function(id) {
        let self = this;
        let strArr = self.pedDict[id];
        let data = '';
        for (let i = 0; i < strArr.length; i++) {
          data = data.concat(strArr[i] + '\n');
        }
        return data;
      },

      getPhenotypeLikelyhood: function(phenotype){
        if(phenotype==="Diabetes"){
          return 0.2
        }
        else if(phenotype==="Cancer"){
          return 0.5
        }
        else if(phenotype === "Familial pancreatic carcinoma"){
          return 0.3
        }

        else{
          return 0
        }

      }
    },
    watch : {
      selectedFamily : function(){

        let self = this;

        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));



        let e = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(e);

        self.cachedOpts = self.opts;


        self.opts = ptree.build(self.opts);

        $('#pedigree').on('nodeClick', self.onNodeClick);
        // $('#pedigree').on('nodeHoverEnd', self.onNodeHoverEnd);
      },

      isolateFamily: function(){
        // let self = this;
        //
        // $('#pedigree').remove();
        // $('#pedigrees').append($("<div id='pedigree'></div>"));
        //
        // console.log(self.isolateFamily);
        //
        // if(self.isolateFamily){
        //   let e = self.buildPedFromIDs(self.highlightedFamilyIDs);
        //   console.log("e", e);
        //
        //   self.opts.dataset = io.readLinkage(e);
        //   self.cachedOpts = self.opts;
        //   self.opts = ptree.build(self.opts);
        // }
        //
        // else{
        //   let e = self.getDataByFamilyID(self.selectedFamily);
        //   self.opts.dataset = io.readLinkage(e);
        //   self.cachedOpts = self.opts;
        //   self.opts = ptree.build(self.opts);
        // }

      },

      selectedPhenotype : function(){

        let self = this;

        self.cachedPhenotypes = [];

        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        let sp = self.selectedPhenotype;
        let freq = self.getPhenotypeLikelyhood(sp);


        let e = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(e);

        for(let i = 0; i < self.opts.dataset.length; i++) {
          let phen = self.mockAffected(freq);
          self.opts.dataset[i].affected = phen;
          self.cachedPhenotypes.push(phen);
          if(self.cachedGenotypes.length > 0){
            self.opts.dataset[i].alleles = self.cachedGenotypes[i];
          }
        }

        self.opts = ptree.build(self.opts);


      },

      selectedGenotype : function(){
        let self = this;

        self.cachedGenotypes = [];

        console.log(self.selectedGenotype);

        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));

        let e = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(e);

        for(let i = 0; i < self.opts.dataset.length; i++) {
          let a = self.mockAlleles(0.5);
          self.opts.dataset[i].alleles = a;
          //self.opts.dataset[i].alleles = '1/1';
          self.opts.dataset[i].affected = self.cachedPhenotypes[i];

          self.cachedGenotypes.push(a);
        }

        self.opts = ptree.build(self.opts);

      }
    },

  }


</script>

<style scoped>

  label {
    display: inline-block;
  }
</style>

