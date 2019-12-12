<template>

  <div align="center">

    <v-toolbar style="padding-top: 10px" color="#123d53" dark>

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
                id="selectPhenotype" label="Select Phenotype" v-model="selectedPhenotype" clearable
      >
      </v-select>

      <v-spacer></v-spacer>

      <v-select :items="parsedVariants"
                id="selectGenotype" label="Select Genotype" v-model="selectedGenotype" clearable
      ></v-select>


      <v-spacer></v-spacer>

      <v-select :items="affectedStatuses"
                id="selectAffectedStatus" label="Display affected status as" v-model="displayAffectedAs"
      ></v-select>


      <v-spacer></v-spacer>

      <v-menu
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >


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




    <div class="pedWrapper">

    <div class="flex">

      <div id="pedigrees" v-show="showPed" style="width: 70%;"></div>

      <!--<div class="flexCol" width="450px" >-->


      <div id="container"  style="width: 30%">

      <div  class="col" height="100vh">



        <v-card>
        <vueScatter :rawData="scatterplotData" :linePoints="linePoints" :opts="opts" :regressionType="selectedRegression" :operand="selectedOperand" :cuttoff="affectedCuttoff" :maxPt="maxPt" :minPt="minPt"></vueScatter>

        </v-card>


        <v-card style="background-color: #f2f2f2;">


          <div id="logisticRegression" v-show="displayAffectedAs === 'binary'">


            <!--<div style="display: inline-flex">  <div style="margin-top: 10px"> Affected Cuttoff</div>-->
              <!--<v-select :items="operands" style="width: 50px; margin-top: 0; padding-left:10px; padding-top: 0" outlined dense v-model="selectedOperand"></v-select>-->
              <!--<strong style="margin-top: 10px; margin-left: 10px">{{affectedCuttoff}} </strong> </div>-->


            <table class="gridtable">
              <thead>
              <th></th> <th style="text-align: left"> Project: </th> <th style="text-align: left"> Family: </th>
              </thead>
              <tbody></tbody>

              <tr class="val">
                <th class="val"> Accuracy </th> <td id="accuracyP" class="val"> {{projectAccuracy}}</td> <td id="accuracyF" class="val">{{familyAccuracy}}</td>
              </tr>

              <tr class="val">
                <th class="val"> Precision </th> <td id="precisonP" class="val"> {{projectPrecision}}</td> <td id="precisionF" class="val">{{familyPrecision}}</td>
              </tr>
              <tr class="val">
                <th class="val"> Recall </th> <td class="recallP"> {{projectRecall}}</td> <td class="val">{{(familyRecall).toFixed(4)}}</td>
              </tr>
              <tr class="val">
                <th class="val"> F1 </th> <td id="f1P" class="val"> {{projectF1}}</td> <td id="f1F" class="val">{{familyF1}}</td>
              </tr>
            </table>


            <div style="display: inline-flex">


              <v-tooltip>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" color="black">info_outline</v-icon>
                </template>
                <span>This will invert the color scale for the Phenotype values</span>

              </v-tooltip>

              <v-btn v-on:click="invertRange()" small>Invert color scale</v-btn>
            </div>


          </div>



        <div id="linearRegression" v-show="displayAffectedAs === 'continuous'">

            <div class="tableTitle">Regression Statistics</div>


          <div class="d-inline-flex">


              <table class="gridtable">
                <thead>
                <th></th> <th style="text-align: left"> Pearsons 'r' </th> <th style="text-align: left"> r^2 </th> <th style="text-align: left"> P-val </th> <th>Significant</th>
                </thead>
                <tbody></tbody>
                <tr class="val" id="familyRow">
                  <th class="val">Family</th>

                <td id="familyR" class="val">{{familyCorrelation}}</td>
                  <td>{{(familyCorrelation**2).toFixed(4)}}</td>
                 <td id="familyP" class="val">{{familyPVal.toExponential(3)}}</td>
                  <td>
                    <v-icon dense right color="green" v-show="familyPVal <= 0.05">check_circle</v-icon>
                  </td>
                </tr>

                <tr></tr>

                <tr class="val" id="projectRow">
                  <th class="val"> Project</th>
                  <td id="projectR" > {{projectCorrelation}}</td>
                  <td class="val">{{(projectCorrelation**2).toFixed(4)}}</td>
                  <td id="projectP" class="val"> {{projectPVal.toExponential(3)}}</td>
                  <td>
                    <v-icon dense right color="green" v-show="projectPVal <= 0.05">check_circle</v-icon>
                  </td>
                </tr>
              </table>

            <div style="display: inline-flex; justify-content: center">

              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" color="black">info_outline</v-icon>
                </template>
                <span>This will invert the color scale for the Phenotype values</span>
              </v-tooltip>


              <v-btn v-on:click="invertRange()" small color="white">Invert color scale</v-btn>

            </div>
          </div>

        </div>



          <div id="legend"></div>


          <div style="height: 100px"></div>

        </v-card>


      </div>



            <!--<div class="tableTitle">Stats Legend</div>-->

            <!--<v-card id="regressionLegend" class="col" style="margin-left: 10px; margin-right: 10px;">-->


              <!--<table>-->
                <!--<thead>-->
                <!--<th></th> <th style="background: limegreen; height: 20px;"></th> <th style="background: yellow"> </th> <th style="background: orange"></th> <th style="background: red"> </th>-->
                <!--</thead>-->
                <!--<tbody>-->
                <!--<tr>-->
                  <!--<th> Pearsons 'r' </th> <td> r > 0.7 </td> <td> r > 0.5 </td> <td> r > 0.3 </td> <td> r <= 0.3 </td>-->
                <!--</tr>-->
                <!--<tr>-->
                  <!--<th> P-val </th> <td> p < 0.05 </td> <td> p < 0.1 </td> <td> p < 0.25 </td> <td> p >= 0.25 </td>-->
                <!--</tr>-->
                <!--</tbody>-->

              <!--</table>-->

            <!--</v-card>-->

      </div>




      <!--<div style="height: 300px"></div>-->


      <!--</div>-->


    </div>



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
      vcfTxt: null,
      phenotypeText: null,
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
        affectedStatuses: ["binary", "continuous"],
        purple: "#3D6FFF",
        txtLines: '',
        txtDict: {},
        pedDict: {},
        PTCPhenotypes: {},
        TASGenotypes: TAS,
        cachedPhenotypes: {},
        cachedColors: {},
        cachedGenotypes: {},
        cachedOpacity: {},
        cachedNulls: [],
        familyIDs: [],
        families: {},
        selectedFamily: null,
        selectedPhenotype: null,
        selectedGenotype: null,
        selectedOperand: '<',
        familyPhenotypes: null,
        familyPhenotypesFlag: false,
        parsedVariants: null,
        highlightedSampleIDs: [],
        isolateFamily: false,
        isolatedPedTxt: [],
        hubSession: null,
        sampleIds: null,
        idList: null,
        phenotypes: ["PTC Sensitivity"],

        PTIndex: null,

        linearMetrics: [],
        linearHeader: [
          {
            text: '',
            align: 'left',
            sortable: false,
            value: 'name',
          },
          { text: 'Pearsons R', value: 'Pearsons R' },
          { text: 'R^2', value: 'R^2' },
          { text: 'P-Vale', value: 'P-Val' },
        ],



        sliderVal: null,

        scatterplotData: null,

        linePoints: null,
        regression: null,
        ccType: null,
        drawer: false,
        toggle: null,

        minPt: null,
        maxPt: null,

        inverted: false,

        genotypeMap: null,


        //user unputs
        displayAffectedAs: "continuous",
        operands: [">", "<", ">=", "<="],
        selectedRegression: null,
        showPed: true,
        affectedCuttoff: "7",
        minThreshold: -1,
        maxThreshold: -1,



        //linear Regression metrics~~~
        projectCorrelation: -1,
        projectPVal: -1,
        familyCorrelation: -1,
        familyPVal: -1,
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~

        ///Logistic ear Regression metrics
        projectAccuracy: -1,
        projectPrecision: -1,
        projectRecall: -1,
        projectF1 : -1,

        familyAccuracy: -1,
        familyPrecision: -1,
        familyRecall: -1,
        familyF1: -1,

        ptMap: null,
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~





        tableHeader: null,
        tableData: null,
        tableReady: false,

        familyCorrelationColor: null,
        projectCorrelationColor: null,
        familyPColor: null,
        projectPColor: null,


        regressionTypes: ["Linear", "Logistic"],
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

    beforeDestroy(){

    },

    mounted() {


      let self = this;

      self.tableHeader = [
        {
          text: ' ',
          align: 'left',
          sortable: false,
          value: 'name',
        },
        {
          text: 'Project',
          align: 'left',
          sortable: false,
          value: 'project',
        },
        {
          text: 'Family',
          align: 'left',
          sortable: false,
          value: 'family',
        }];



      self.tableData = [
        {name: 'Pearsons r', project: 0.5, family: 1},
        {name: 'r**2', project:1, family: 1},
        {name: 'P-val', project: 1, family: 1}
      ];


      if (self.launchedFrom === "H") {
        self.buildFromHub();
      }
      if (self.launchedFrom === "D") {
        self.populateThresholds();
        self.buildFromDemo();
        self.buildSlider();

      }
      if (self.launchedFrom === "U") {
        self.buildFromUpload();
      }


    }
    ,
    methods: {

      removeHighlight: function(){
        let self = this;

        console.log("removeHighlight");

        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts = self.addCachedValuesToOpts(self.opts);
        self.opts = ptree.build(self.opts);
        ptree.build(self.opts);

        self.highlightAll();
        self.drawGenotypeBars();

      },

      buildGTMapFromVcf(){

        let self = this;

        let gtMap = {};

        let sampleIDs = [];


        let vcfLines = self.vcfTxt.split('\n');


        let filteredTxt = "";

        for(let i = 0; i < vcfLines.length; i++){

          let firstTwo = vcfLines[i].substr(0,2)

          if(firstTwo === "##"){

          }
          else{

            let lineCols = vcfLines[i].split('\t');

            let filteredCols = [];

            for(let j = 0; j < lineCols.length; j++){
              if(lineCols[j] === ""){

              }
              else{
                filteredCols.push(lineCols[j]);
              }
            }

            let variant = filteredCols.slice(0,5);

            let varText = variant[0] + ':' + variant[1] + "_" + variant[3] + '/' + variant[4];

            varText = varText.replace(/\s/g, '');

            let gts = filteredCols.slice(9);

            if(firstTwo === "#C" || firstTwo === "#c"){
              sampleIDs = gts;
            }

            else{

              gtMap[varText] = gts;
            }

            filteredTxt = filteredTxt + vcfLines[i] + "\n";
          }
        }

        console.log("sampleIds", sampleIDs);

        self.idList = sampleIDs;


        return gtMap;

      },




      invertRange(){
        // let min = this.minThreshold;
        // let max = this.maxThreshold;

        this.inverted = ! this.inverted;

        // this.minThreshold = max;
        // this.maxThreshold = min;
      },

      buildFromDemo() {
        let self = this;
        self.pedTxt = self.txt;
        self.parsedVariants = self.variants;

        self.populateModel();
        self.populatePTC();
        // self.selectedPhenotype = "PTC Sensitivity";
        self.selectedRegression = "Linear";
        let PHandler = new PhenotypeHandler();
        self.PTCPhenotypes = PHandler.replacedIDs;

        self.ptMap = self.PTCPhenotypes;

        // self.selectedGenotype = "7:141972755_C/T";
        self.selectedFamily = "1463";
        // self.selectedFamily = "1408";

        self.selectedGenotype = "7:141972755_C/T";

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

        self.genotypeMap = self.buildGTMapFromVcf();
        self.parsedVariants = Object.keys(self.genotypeMap);

        self.populatePhenotypes();

        console.log("variants from gtMap");


      },

      populatePhenotypes(){
        console.log("phenotype text", this.phenotypeText);

        let lines = this.phenotypeText.split("\n");

        console.log("lines", lines);

        let firstLine = lines[0];

        let headerCols = firstLine.split(",");

        // let pt = headerCols[1];

        this.phenotypes = [];

        for(let i = 1; i < headerCols.length; i++){
          this.phenotypes.push(headerCols[i]);
        }

        console.log("this.phenotypes in populatePhenotypes", this.phenotypes);

        this.buildPTMap();

      },


      buildPTMap(){

        //TODO: refactor for multi-PT csv
        this.ptMap = {};

        let lines = this.phenotypeText.split("\n");

        for(let i = 1; i < lines.length; i++){

          let cols = lines[i].split(",");

          this.ptMap[cols[0]] = [];

          for(let j = 1; j < cols.length; j++) {
              this.ptMap[cols[0]].push(cols[j]);
            }
          }

          //TODO: refactor to remove allw htiespace from value

        console.log("ptMap", this.ptMap);



      },


      buildLinearRegression() {



        let self = this;


        console.log("self.phenotypes inside buildLinearRegression", self.phenotypes);

        self.PTIndex = self.phenotypes.indexOf(self.selectedPhenotype);

        console.log("self.PTINdex right before regression", self.PTIndex);

        console.log("PTCPhenotypes",self.PTCPhenotypes);

        if(self.launchedFrom === "U") {
          //TODO: pass in all genotypes, not jjust family
          self.regression = new Regression(self.cachedGenotypes, self.ptMap, "Linear", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, self.PTIndex, "U");
        }
        else if(self.launchedFrom === "D"){
          console.log("PTCPhenotypes", self.PTCPhenotypes);
          self.regression = new Regression(self.TASGenotypes, self.PTCPhenotypes, "Linear", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, 0, "D");
        }

        self.linePoints = self.regression.getLinePoints();

        // self.maxPt = self.regression.getMaxPt();
        // self.minPt = self.regression.getMinPt();



        self.projectCorrelation = self.regression.getProjectCorrelation();
        self.projectPVal = self.regression.getProjectPVal();


        let familyCandP = self.regression.getFamilyCorrelationAndPVal();



        self.familyCorrelation = familyCandP[0];
        self.familyPVal = familyCandP[1];

        self.linearMetrics = [
          {name: "family", "Pearsons R": self.familyCorrelation, "R^2" : self.familyCorrelation**2, "P-val" : self.familyPVal},
          {name: "project", "Pearsons R": self.projectCorrelation, "R^2" : self.projectCorrelation**2, "P-val" : self.projectPVal}

      ]
        // self.familyCorrelation = self.regression.getFamilyCorrelation(self.sampleIds)[0].toFixed(4);
        // self.familyPVal= self.regression.getFamilyCorrelation(self.sampleIds)[1].toExponential(3);

        // console.log("self.familyPVal inside PedHandler", self.familyPVal);

        self.scatterplotData = self.regression.getScatterplotData();

        console.log("self.scatterplotData", self.scatterplotData);

        self.buildRegressionTable();

        self.buildPTLegend();


      },

      buildSlider(){


        let self = this;

        // if(self.displayAffectedAs === "continuous") {
        //
        //   d3.select("#slider-axisCuttoff").remove();

          d3.select("#slider-axisRange").remove();

          console.log("minPT", self.minPt);
          console.log("maxPt", self.maxPt);



          if(self.displayAffectedAs === "continuous") {
            self.maxThreshold = self.maxPt;


            let sliderRange = d3
              .sliderVertical()
              .min(self.minPt)
              .max(self.maxPt)
              .default([self.minPt, self.maxPt])
              .height(400)
              .ticks(0)
              .fill('#2196f3')
              .on('onchange', val => {

                self.minThreshold = val[0];
                self.maxThreshold = val[1];

                console.log("inside onChange", self.minThreshold, self.maxThreshold);

              });


            d3.select("#scatterplot").append("g").attr("id", "slider-axisRange")
              .call(sliderRange)
              .append("text").text(self.selectedPhenotype)
              .attr("class", "axis-label")
              .attr("x", -250)
              .attr("y", -25)
              .attr("transform", "rotate(-90)");

          }

          else if(self.displayAffectedAs === "binary"){

            self.maxThreshold = self.maxPt/2;

            let sliderRange = d3
              .sliderVertical()
              .min(self.minPt)
              .max(self.maxPt)
              .default([self.minPt, self.maxPt/2])
              .height(300)
              .ticks(0)
              .fill('#2196f3')
              .on('onchange', val => {

                self.minThreshold = val[0];
                self.maxThreshold = val[1];

                console.log("inside onChange", self.minThreshold, self.maxThreshold);

              });


            d3.select("#scatterplot").append("g").attr("id", "slider-axisRange")
              .call(sliderRange)
              .append("text").text(self.selectedPhenotype);

          }



      },

      buildLogisticRegression() {


        let self = this;

        // self.buildDemoPhenotypes();

        self.PTIndex = self.phenotypes.indexOf(self.selectedPhenotype);


        self.regression = new Regression(self.TASGenotypes, self.ptMap, "Logistic", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, self.PTIndex);
        self.scatterplotData = self.regression.getScatterplotData();
        self.linePoints = self.regression.getLinePoints();

        self.buildRegressionTable();
        self.buildPTLegend();

        self.populateLogisticEvaluationMetrics();



      },


      populateModel() {
        let self = this;
        self.splitTxt();
        self.populateTxtDict();
        self.populatePedDict();
        self.populateFamilies();
        self.rebuildPedDict();
        self.highlightFamily();
        if (self.launchedFrom !== "U") {
          // self.parseVariants();
          // console.log("self.parsedVariants inside populateModel", self.parsedVariants);
        }
      },
      buildPhenotypes: function () {
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
        else if(self.launchedFrom === "U"){
          self.buildUploadPhenotypes();
        }

        $('#pedigree').on('nodeClick', self.onNodeClick);
        $('#pedigree').on('bgClick', self.onBGClick);




        d3.select("#pedigreeBackground")
          .on("click", console.log("clicked background"));
      },

      buildGenotypes: function () {

        let self = this
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.cachedGenotypes = {};
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts.dataset = self.addNewGenotypesToOpts(self.opts);
        self.opts = ptree.build(self.opts);

        self.drawGenotypeBars();

        $('#pedigree').on('nodeClick', self.onNodeClick);
        $('#pedigree').on('bgClick', self.onBGClick);

      },
      //Needed for when mosaic has variants for a project with ped data
      parseVariants: function () {
        let self = this;
        self.parsedVariants = [];
        for (let i = 0; i < self.variants.length; i++) {
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

      onBGClick: function(e, swag){
        console.log("onBGClick", swag);
        this.removeHighlight();
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
            opts.dataset[i].alleles = all;
          }
          if (self.cachedPhenotypes.hasOwnProperty(id)) {
            let aff = self.cachedPhenotypes[id];
            let col = self.cachedColors[id];
            let opacity = self.cachedOpacity[id];
            opts.dataset[i].affected = aff;
            opts.dataset[i].col = col;
            opts.dataset[i].opacity = opacity;
          }
          if (self.cachedNulls.includes(id)) {
            opts.dataset[i].NA = true;
          }
        }
        return opts;
      },
      populateSampleIds: function () {
        let self = this;
        self.sampleIds = [];

        if (typeof self.opts.dataset === "undefined") {
          return;
        }
        for (let i = 0; i < self.opts.dataset.length; i++) {
          let sampleId = parseInt(self.opts.dataset[i].name);
          self.sampleIds.push(sampleId);
        }
      },

      highlightAll: function(){

        console.log("inside highlight Family");
        let self = this;
        let parentNodes =
          d3.selectAll(".node").nodes().map(function (d) {
            return d.parentNode;
          });
        parentNodes.forEach(function (n) {
          let nodeToHightlight = d3.select(n.nextSibling.childNodes[0]);
          let border = d3.select(n.previousSibling);
          let txt = d3.select(n.nextSibling.nextSibling.nextSibling.nextSibling);

          nodeToHightlight.style('opacity', 1)
          border.style('opacity', 1);
          txt.style('opacity', 1);

        });

        self.highlightGTs();

      },

      highlightFamily: function () {

        console.log("inside highlight Family");
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
            console.log("found not highlighted");
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

      buildLinearRegressionLegend(){

        let self = this;

        let w = 200, h = 50;


        let key = d3.select("#legend")
          .append("svg")
          .attr("id", "legendSvg")
          .attr("width", 220)
          .attr("height", 100);

        let legend = key.append("defs")
          .append("svg:linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("y1", "100%")
          .attr("x2", "100%")
          .attr("y2", "100%")
          .attr("spreadMethod", "pad");

        if(self.inverted) {

          legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", self.purple)
            .attr("stop-opacity", 1);


          legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#F9F9F9")
            .attr("stop-opacity", 1);
        }

        else if (!self.inverted) {
          legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#F9F9F9")
            .attr("stop-oepacity", 1);


          legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", self.purple)
            .attr("stop-opacity", 1);

        }

        key.append("rect")
          .attr("width", w + 1)
          .attr("height", h - 30)
          .style("fill", "url(#gradient)")
          .attr("transform", "translate(5,60)");

        let lScale = d3.scaleLinear()
          .range([w, 0])
          .domain([self.maxThreshold, self.minThreshold]);

        let lAxis = d3.axisBottom()
          .scale(lScale)
          .ticks(5);

        key.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(5,80)")
          .call(lAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("dy", ".71em")
          .style("text-anchor", "end")

        key.append("text")
          .attr("transform", "translate(0,50)")
          .text("Less affected <----> More affected");
      },

      buildLogisticRegressionLegend(){

        let self = this;


        let w = 200, h = 50;

        let lScale = d3.scaleLinear()
          .range([0, w])
          .domain([self.minPt, self.maxPt]);

        let key = d3.select("#legend")
          .append('svg')
          .attr("id", "legendSvg")
          .append("svg")
          .attr("width", 220)
          .attr("height", 100);

        key.append("rect")
          .attr("width", w)
          .attr("height", h-30)
          .style("fill", "white")
          .style("stroke", "black")
          .attr("transform", "translate(5,60)");

        if(!self.inverted) {


          key.append("rect")
            .attr("width", lScale(self.maxThreshold-self.minThreshold))
            .attr("x", lScale(self.minThreshold))
            .attr("height", h - 30)
            .style("fill", self.purple)
            .style("stroke", "black")
            .attr("transform", "translate(5,60)");
        }



        else if(self.inverted) {


          key.append("rect")
            .attr("width", lScale(12-self.maxThreshold))
            .attr("x", lScale(self.maxThreshold))
            .attr("height", h - 30)
            .style("fill", self.purple)
            .style("stroke", "black")
            .attr("transform", "translate(5,60)");


          key.append("rect")
            .attr("width", lScale(self.minThreshold))
            .attr("height", h - 30)
            .style("fill", self.purple)
            .style("stroke", "black")
            .attr("transform", "translate(5,60)");

        }


        let lAxis = d3.axisBottom()
          .scale(lScale)
          .ticks(12);

        key.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(5,80)")
          .call(lAxis)
          .attr("dy", ".71em")
          .style("text-anchor", "end")


        if(!self.inverted){

          key.append("text")
            .attr("transform", "translate(20,50)")
            .text("Affected <----> Un-affected");
        }
        else if(self.inverted){
          key.append("text")
            .attr("transform", "translate(20,50)")
            .text("Un-affected <----> Affected");
        }

      },

      buildPTLegend() {

        let self = this;

        d3.select("#legendSvg").remove();


        if(self.displayAffectedAs === "continuous") {


       // this.buildLinearRegressionLegend();

        }
        else if(self.displayAffectedAs === "binary") {

          this.buildLogisticRegressionLegend();

        }


      },

      highlightGTs: function(){

        let self = this;

        for(let i = 0; i < self.cachedNulls.length; i++){

          let node = self.getNodeById(self.cachedNulls[i]);


          if(!self.highlightedSampleIDs.includes(self.cachedNulls[i].toString())) {

            node.selectAll("rect")
              .attr("opacity", 0.05);

          }
          else{
            node.selectAll("rect")
              .attr("opacity", 0.5);

          }
          }
        },

      //refactor name to styleLinearTableMetrics
      buildRegressionTable() {

        // let self = this;
        //
        //   if(self.familyPVal > 0.05){
        //     self.familyPColor = "none";
        //   }
        //   else{
        //     let normFamP = 1 - self.familyPVal;
        //     self.familyPColor  = d3.interpolateRgb("white", "#50c878")(normFamP);
        //   }
        //
        //   d3.select("#familyRow")
        //     .style("background", self.familyPColor);
        //
        // if(self.projectPVal > 0.05){
        //   self.projectPColor = "none";
        // }
        // else{
        //   let normProjP = 1 - self.projectPVal;
        //   self.projectPColor  = d3.interpolateRgb("white", "#50c878")(normProjP);
        // }
        //
        // d3.select("#projectRow")
        //   .style("background", self.projectPColor);



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


      populateThresholds: function(){

        let self = this;


        if(this.launchedFrom === "U") {
          self.minPt = Math.min();
          self.maxPt = Math.max();

          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = self.opts.dataset[i].name;
            let pts = self.ptMap[id];

            self.PTIndex = self.phenotypes.indexOf(self.selectedPhenotype);
            let sens = parseFloat(pts[self.PTIndex]);

            if (sens < this.minPt) {
              this.minPt = sens;
            } else if (sens > this.maxPt) {
              this.maxPt = sens;
            }

          }

          self.minThreshold = self.minPt;
          self.maxThreshold = self.maxPt;

        }

        else if(this.launchedFrom === "D"){
          self.minPt = 0;
          self.maxPt = 12;
          self.minThreshold = 0;
          self.maxThreshold = 12;

          console.log("Demo Data");
        }

      },

      buildUploadPhenotypes: function(){

        let self = this;

        if(self.selectedPhenotype === null){
          console.log("null selected phenotype");


          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = self.opts.dataset[i].name;

            self.opts.dataset[i].affected = 0;
            // console.log("color", color);
            self.opts.dataset[i].col = "none";
            self.opts.dataset[i].opac = 0;


            self.cachedPhenotypes[id] = 0;
            self.cachedColors[id] = "none";
            self.cachedOpacity[id] = 0;
            // Label Debug // let nid = self.opts.dataset[i].name.toString(); // let allele = self.TASGenotypes[nid]; // self.opts.dataset[i].alleles = sens + "," + allele;
          }
          self.opts = self.addCachedValuesToOpts(self.opts);
          self.opts = ptree.build(self.opts);
          self.drawGenotypeBars();

        }


        else {
          self.cachedPhenotypes = {};

          // self.populateThresholds();

          console.log("minThreshold", self.minThreshold);
          console.log("maxThreshold", self.maxThreshold);

          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = self.opts.dataset[i].name;
            let pts = self.ptMap[id];

            self.PTIndex = self.phenotypes.indexOf(self.selectedPhenotype);

            let sens = pts[self.PTIndex];


            let scaledSens = -1;
            let opacity = 1;


            if (typeof sens === 'undefined' || sens === 'nan') {
              self.opts.dataset[i].NA = true;

              self.cachedNulls.push(id);
            } else if (typeof sens === 'string') {
              if (sens.includes('>') || sens.includes('<')) {
                sens = sens.slice(-1);
              }
            }

            sens = parseInt(sens);

            self.opts.dataset[i].sens = sens;

            let aff = 0;

            let color = "white";

            if (typeof sens === "undefined" || isNaN(parseInt(sens))) {
              color = "none";
            } else if (self.displayAffectedAs === "binary") {

              if (!self.inverted) {
                if (sens >= self.minThreshold && sens <= self.maxThreshold) {
                  aff = 2;
                  color = self.purple;
                }
              } else if (self.inverted) {
                if (sens <= self.minThreshold || sens >= self.maxThreshold) {
                  aff = 2;
                  color = self.purple;
                }
              }

            } else if (self.displayAffectedAs === "continuous") {

              if (!this.inverted) {

                if (sens < self.minThreshold) {
                  scaledSens = -1;
                  opacity = 0.4;
                } else if (sens > self.maxThreshold) {
                  scaledSens = -1;
                  opacity = 0.4;
                } else {
                  scaledSens = (sens - self.minThreshold) / (self.maxThreshold - self.minThreshold)
                }

                if (scaledSens === -1) {
                  color = "gray";
                } else {
                  color = d3.interpolateRgb("white", self.purple)(scaledSens);
                }
              } else if (this.inverted) {

                console.log("range", this.minThreshold, this.maxThreshold);


                if (sens < self.minThreshold) {
                  scaledSens = -1;
                  opacity = 0.4;

                } else if (sens > self.maxThreshold) {
                  scaledSens = -1;
                  opacity = 0.4;

                } else {
                  scaledSens = 1 - (sens - self.minThreshold) / (self.maxThreshold - self.minThreshold)
                }
                if (scaledSens === -1) {
                  color = "gray";
                } else {
                  color = d3.interpolateRgb("white", self.purple)(scaledSens);
                }
              }

            }


            self.opts.dataset[i].affected = aff;
            // console.log("color", color);
            self.opts.dataset[i].col = color;
            self.opts.dataset[i].opac = opacity;


            self.cachedPhenotypes[id] = aff;
            self.cachedColors[id] = color;
            self.cachedOpacity[id] = opacity;
            // Label Debug // let nid = self.opts.dataset[i].name.toString(); // let allele = self.TASGenotypes[nid]; // self.opts.dataset[i].alleles = sens + "," + allele;
          }
          self.opts = self.addCachedValuesToOpts(self.opts);
          self.opts = ptree.build(self.opts);
          self.drawGenotypeBars();

        }

      },





      buildDemoPhenotypes: function () {
        let self = this;

        console.log("this.minThreshold", this.minThreshold, this.maxThreshold);

        self.cachedPhenotypes = {};
        if (self.selectedPhenotype === "PTC Sensitivity") {


            for (let i = 0; i < self.opts.dataset.length; i++) {
              let id = self.opts.dataset[i].name;
              let sens = self.PTCPhenotypes[id];
              let scaledSens = -1;
              let opacity = 1;



              if (typeof sens === 'undefined' || sens === 'nan') {
                self.opts.dataset[i].NA = true;

                self.cachedNulls.push(id);
              } else if (typeof sens === 'string') {
                if (sens.includes('>') || sens.includes('<')) {
                  sens = sens.slice(-1);
                }
              }

              sens = parseInt(sens);

              self.opts.dataset[i].sens = sens;

              let aff = 0;

              let color = "white";

              if(typeof sens === "undefined" || isNaN(parseInt(sens))){
                color = "none";
              }

              else if (self.displayAffectedAs === "binary") {

                if (!self.inverted) {
                  if (sens  >= self.minThreshold && sens <= self.maxThreshold) {
                    aff = 2;
                    color = self.purple;
                  }
                } else if (self.inverted) {
                  if (sens <= self.minThreshold || sens >= self.maxThreshold) {
                    aff = 2;
                    color = self.purple;
                  }
                }

              }


            else if (self.displayAffectedAs === "continuous") {

                if (!this.inverted) {

                  if (sens < self.minThreshold) {
                    scaledSens = -1;
                    opacity = 0.4;
                  } else if (sens > self.maxThreshold) {
                    scaledSens = -1;
                    opacity = 0.4;
                  } else {
                    scaledSens = (sens - self.minThreshold) / (self.maxThreshold - self.minThreshold)
                  }

                  if(scaledSens === -1){
                    color = "gray";
                  }
                  else {
                    color = d3.interpolateRgb("white", self.purple)(scaledSens);
                  }
                } else if (this.inverted) {

                  console.log("range", this.minThreshold, this.maxThreshold);


                  if (sens < self.minThreshold) {
                    scaledSens = -1;
                    opacity = 0.4;

                  } else if (sens > self.maxThreshold) {
                    scaledSens = -1;
                    opacity = 0.4;

                  } else {
                    scaledSens = 1 - (sens - self.minThreshold) / (self.maxThreshold - self.minThreshold)
                  }
                  if(scaledSens === -1){
                    color = "gray";
                  }
                  else {
                    color = d3.interpolateRgb("white", self.purple)(scaledSens);
                  }
                }

              }



              self.opts.dataset[i].affected = aff;
              // console.log("color", color);
              self.opts.dataset[i].col = color;
              self.opts.dataset[i].opac = opacity;


              self.cachedPhenotypes[id] = aff;
              self.cachedColors[id] = color;
              self.cachedOpacity[id] = opacity;
              // Label Debug // let nid = self.opts.dataset[i].name.toString(); // let allele = self.TASGenotypes[nid]; // self.opts.dataset[i].alleles = sens + "," + allele;
            }
            self.opts = self.addCachedValuesToOpts(self.opts);
            self.opts = ptree.build(self.opts);
            self.drawGenotypeBars();
          }
      },

      buildRegression: function(){

        if(this.selectedGenotype === null || this.selectedPhenotype === null){
          return;
        }
        if(this.displayAffectedAs === "continuous"){
          this.buildLinearRegression();
        }
        else if(this.displayAffectedAs=== "binary"){
          this.buildLogisticRegression()
        }
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
          // console.log("typeof selectedPhenotype", typeof self.selectedPhenotype);
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


        if(self.selectedGenotype === null){

        }
        else {

          if (self.selectedGenotype === '7:141972755_C/T') {
            for (let i = 0; i < opts.dataset.length; i++) {
              let id = parseInt(opts.dataset[i].name);
              let allele = self.TASGenotypes[id].split(";")[0];
              // opts.dataset[i].alleles = allele;
              self.cachedGenotypes[id] = allele;
            }
            self.opts = self.addCachedValuesToOpts(opts);
          } else {


            let keys = Object.keys(self.genotypeMap);


            let gts = self.genotypeMap[self.selectedGenotype];


            for (let i = 0; i < opts.dataset.length; i++) {
              let id = parseInt(opts.dataset[i].name)


              if (self.idList.includes(id.toString())) {


                let index = self.idList.indexOf(id.toString());
                let gtForID = gts[index];
                let allele = " ";

                if(typeof  gtForID === "undefined"){

                }
                else {

                  allele = gtForID.substr(0, 3);

                }

                self.cachedGenotypes[id] = allele;

              }
            }

          }
        }
        opts = self.addCachedValuesToOpts(opts);

        return opts.dataset;

      },


      getNodeById: function(id){
        let node = d3.select('[id="'+ id +'"]');

        let p1 = node.select(function() {
          return this.parentNode;
        });


        return p1;
      },

      populateLogisticEvaluationMetrics(){
        let self = this;
        self.familyAccuracy = self.regression.getFamilyAccuracy();
        self.familyPrecision = self.regression.getFamilyPrecision();
        self.familyRecall = self.regression.getFamilyRecall();
        self.familyF1 = self.regression.getFamilyF1();

        self.projectAccuracy = self.regression.getProjectAccuracy();
        self.projectPrecision = self.regression.getProjectPrecision();
        self.projectRecall = self.regression.getProjectRecall();
        self.projectF1 = self.regression.getProjectF1();
      },

      drawGenotypeBars: function(){
        let self = this;

        let blue = " #e6e6e6";
        let red = "#595959";

        let w = "6px";
        let h = "13px";

        // console.log("cachedGenotypes inside draw bars", self.cachedGenotypes);

        for(let key in self.cachedGenotypes){
          let node = self.getNodeById(key);


          let gt = self.cachedGenotypes[key];

          let opacity = 1.0;

          if(self.cachedNulls.includes(parseInt(key))){

            opacity = 0.5

          }


          if(gt === "0/1") {

            node.append("rect")
              .attr("width", w)
              .attr('height', h)
              .attr("x", "-7")
              .attr("y", "25")
              .attr("opacity", opacity)
              .attr("fill", blue)
              .style("stroke", "black")
              .style("stroke-width", 1);

            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "4")
              .attr("y", "25")
              .attr("opacity", opacity)
              .style("stroke", "black")
              .style("stroke-width",1)
              .attr("fill", red);
          }

            else if (gt === "0/0"){
            node.append("rect")
              .attr("width", "5px")
              .attr('height', "13px")
              .attr("x", "-7")
              .attr("y", "25")
              .attr("opacity", opacity)
              .style("stroke", "black")
              .style("stroke-width", 1)
              .attr("fill", blue);

            node.append("rect")
              .attr("width", w)
              .attr('height', h)
              .attr("x", "4")
              .attr("y", "25")
              .attr("opacity", opacity)
              .style("stroke", "black")
              .style("stroke-width", 1)
              .attr("fill", blue);
            }
          else if (gt === "1/1"){
            node.append("rect")
              .attr("width", w)
              .attr('height', h)
              .attr("x", "-7")
              .attr("y", "25")
              .attr("opacity", opacity)
              .style("stroke", "black")
              .style("stroke-width", 1)
              .attr("fill", red);

            node.append("rect")
              .attr("width", w)
              .attr('height', h)
              .attr("x", "4")
              .attr("y", "25")
              .attr("opacity", opacity)
              .style("stroke", "black")
              .style("stroke-width", 1)
              .attr("fill", red);
          }
        }
      }
    },
    watch: {

      affectedCuttoff: function(){

        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();
        // self.buildLogisticRegression();

      },

      selectedOperand: function(){
        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();
        // self.buildLogisticRegression();
      },


      displayAffectedAs: function(){
        let self = this;

        self.buildSlider();

        if(self.displayAffectedAs === "continuous"){
          self.selectedRegression = "Linear";
        }
        else if(self.displayAffectedAs === "binary"){
          self.selectedRegression === "Logistic";
        }
        self.buildPhenotypes();

        self.populateSampleIds();

        self.buildRegression();

      },

      minThreshold: function(){
        let self = this;

        console.log("change in minThreshhold");
        self.buildPhenotypes();

        // self.buildLinearRegression();
        self.buildRegression();
      },

      maxThreshold: function(){
        this.buildPhenotypes();
        this.buildRegression();
      },

      selectedFamily: function () {
        let self = this;


        if(self.launchedFrom === "D") {
          self.selectedPhenotype = "PTC Sensitivity";
          self.selectedGenotype = "7:141972755_C/T";
        }

        self.buildPhenotypes();
        self.populateSampleIds();

        self.buildGenotypes();



        self.buildRegression();
        console.log("self.sampleIds in watcher", self.sampleIds);
        $('#pedigree').on('nodeClick', self.onNodeClick)
        $('#pedigree').on('bgClick', self.onBGClick);





      },

      toggle: function(){
        let self = this;

        self.showPed = !self.showPed;
      },

      inverted: function(){

        console.log("watcher in inverted", this.inverted);

        this.buildPhenotypes();

        this.buildRegression();


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
          self.drawGenotypeBars();
          self.populateSampleIds();
          self.buildLinearRegression();
        } else {
          self.removeHighlight();
          $('#pedigree').on('nodeClick', self.onNodeClick);
          $('#pedigree').on('bgClick', self.onBGClick);


        }
        $('#pedigree').on('nodeClick', self.onNodeClick);
      },
      selectedPhenotype: function () {
        let self = this;
        self.populateThresholds();


        console.log("self.opts inside of selectedPhenotype", self.opts);
        self.buildPhenotypes();
        self.buildSlider();
        self.buildRegression();

      },
      selectedGenotype: function () {
        let self = this;

        console.log("self.selectedGenotype", self.selectedGenotype);

        if(typeof self.selectedGenotype === "undefined"){
        }
        else {
          self.buildGenotypes();
          self.buildRegression();
        }


      },
      selectedRegression: function() {
        let self = this;

        self.populateSampleIds();

        if (self.selectedRegression === "Linear") {
          self.buildLinearRegression();

        } else if (self.selectedRegression === "Logistic") {
          self.buildLogisticRegression();

          // self.buildLinearRegression();
        }


        self.linePoints = self.regression.getLinePoints();

        self.buildRegressionTable();
      }

    }
  }
</script>

<style>
  #pedigrees svg > rect {

  }
  #pedigrees svg {
    height:96vh;
    /*height: -webkit-fill-available;  !* Mozilla-based browsers will ignore this. *!*/
    /*height: fill-available;*/
  }

  #legend{
    height: 100px;
    width: 220px;
    justify-content: center;
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

  .flex {
    display: flex; /* or inline-flex */
    align-content: flex-start;
    height: 100%;
  }



  #container{
    display: flex;
    flex-direction: column;
    height: 100%;
  }



  .col{

    flex-grow: 1;
    overflow: auto;
    height: 96vh;
  }

  .flexCol{
    display: flex;
    flex-direction: column;
    align-content: flex-start;


  }



  .v-input v-text-field v-select v-input--is-label-active v-input--is-dirty theme--light{
    max-height:100px;

  }

  .radioGroup{
    display: flex;
    flex-direction: column;
    /*align-content: flex-start;*/
    text-align: center;
    max-height:100px;

    display: inline-block;
    vertical-align: top;
  }


  .radioContainer{

    text-align: left;
    vertical-align: top;

  }
  .selectRegressionType{

  }

  .text-center{
    text-align: center;
  }


  table.gridtable {
    font-family: verdana,arial,sans-serif;
    font-size:11px;
    color:#333333;
    border-width: 1px;
    border-color: #666666;
    border-collapse: collapse;
  }
  table.gridtable th {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #666666;
    background-color: #dedede;
  }
  table.gridtable td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #666666;
    background-color: #ffffff;
  }

  th:empty {
    visibility: hidden;
  }


  /*td .val{*/
    /*text-align: left;*/
  /*}*/
  /*th .val{*/
    /*text-align: center;*/
    /*color: grey;*/
  /*}*/

  /*tr:nth-child(odd).val {background-color: #f2f2f2;}*/

  .tableTitle {
    /*text-decoration: underline;*/
    text-align: left;
    font-size: 16px;
    font-style: normal;
    font-weight: bold;
    margin: 5px;
  }


  text {
    /*color: white;*/
    fill: black;
    text-shadow: 2px 2px 11px white;

  }

  .pedWrapper{
    height: 96vh;

  }

  .axis-label {

    fill: black;
    font-size: 14px;
    font-weight: bold;
  }



  /*<v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>*/





</style>
