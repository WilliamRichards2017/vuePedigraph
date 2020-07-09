<template>

  <div align="center">

    <v-toolbar style="padding-top: 10px" color="#123d53" dark>


      <v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>

      <v-spacer></v-spacer>


      <v-select :items="familyIDs"
                id='selectFamily'
                label="Select Family ID"
                v-model="selectedFamily"

                style="border: none; background-color: transparent;"
      >
      </v-select>

      <v-spacer></v-spacer>

      <v-tooltip top style="padding-left: 10px" v-show="launchedFrom === 'D'">
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" color="white">info_outline</v-icon>
        </template>
        <span style="font-weight: bold; text-decoration: underline">Interesting Correlations: </span>
        <div>PTC Taste Sensitivity - 7:141672604</div>
        <div>Androstrenone Smelling Sensitivity - 19:9325116</div>
        <div>Asparagus Smelling Sensitivity - 1:248496863</div>

      </v-tooltip>

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

    <div class="pedWrapper">
      <div class="flex">
        <div id="pedigrees" v-show="showPed" style="width: 70%;"></div>
        <div id="container" style="width: 30%; padding-right: 1px; padding-top: 1px">
          <div class="col">
            <v-card>
              <vueScatter :rawData="scatterplotData" :linePoints="linePoints" :opts="opts" :noVariants="noVariants"
                          :regressionType="selectedRegression" :operand="selectedOperand" :cuttoff="affectedCuttoff"
                          :maxPt="maxPt" :minPt="minPt" :binaryType="binaryType"></vueScatter>
            </v-card>

            <v-card style="background-color: #f2f2f2; height: 60vh">
              <div class="d-inline-flex">
                <v-select :items="regressionTypes"
                          style="width: 175px; padding-right: 75px"
                          id="regressionSelect" label="Regression Type" v-model="selectedRegression"
                ></v-select>

                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" color="black" dense>info_outline</v-icon>
                  </template>
                  <span>This will invert the color scale for the Phenotype values</span>

                </v-tooltip>

                <div style="flex-direction: column">
                  <div style="height: 10px"></div>
                  <v-btn v-on:click="invertRange()" small>Invert color scale</v-btn>
                </div>
              </div>


              <div id="logisticRegression" v-show="selectedRegression === 'Logistic' && !noVariants">
                <div class="tableTitle" v-if="!noVariants">Regression Statistics</div>

                <table class="gridtable">
                  <thead>
                  <th></th>
                  <th style="text-align: left"> Accuracy</th>
                  <th style="text-align: left"> Precision</th>
                  <th style="text-align: left"> Recall</th>
                  <th style="text-align: left"> F1</th>
                  </thead>
                  <tbody></tbody>
                  <tr>
                    <th>Family</th>
                    <td>{{familyAccuracy}}</td>
                    <td>{{familyPrecision}}</td>
                    <td>{{familyRecall}}</td>
                    <td>{{familyF1}}</td>
                  </tr>
                  <tr>
                    <th>Project</th>
                    <td>{{projectAccuracy}}</td>
                    <td>{{projectPrecision}}</td>
                    <td>{{projectRecall}}</td>
                    <td>{{projectF1}}</td>
                  </tr>

                </table>
              </div>

              <div id="linearRegression" v-show="selectedRegression === 'Linear' && !noVariants">

                <div class="d-inline-flex">
                  <table class="gridtable">
                    <thead>
                    <th></th>
                    <th style="text-align: left"> Pearsons 'r'</th>
                    <th style="text-align: left"> r^2</th>
                    <th style="text-align: left"> P-val</th>
                    <th>Significant</th>
                    </thead>
                    <tbody></tbody>
                    <tr class="val" id="familyRow">
                      <th class="val">Family</th>
                      <td id="familyR" class="val">{{familyCorrelation}}</td>
                      <td>{{(familyCorrelation**2).toFixed(4)}}</td>
                      <td id="familyP" class="val">{{familyPVal.toExponential(3)}}</td>
                      <td>
                        <v-icon dense right color="green" v-show="familyPVal <= 0.05 && familyPVal >= 0">check_circle</v-icon>
                      </td>
                    </tr>

                    <tr class="val" id="projectRow">
                      <th class="val"> Project</th>
                      <td id="projectR"> {{projectCorrelation}}</td>
                      <td class="val">{{(projectCorrelation**2).toFixed(4)}}</td>
                      <td id="projectP" class="val"> {{projectPVal.toExponential(3)}}</td>
                      <td>
                        <v-icon dense right color="green" v-show="projectPVal <= 0.05  && projectPVal >= 0">check_circle</v-icon>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div id="legend"></div>

            </v-card>

          </div>
        </div>


        <!--<div style="height: 300px"></div>-->


        <!--</div>-->


      </div>


    </div>


  </div>
</template>

<script>
  import 'vuetify'
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
      vcfTxt: null,
      metrics: null,
      phenotypeText: null,
      phenotypesProp: null,
      ptIdMap: null,
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
        phenotypes: ["PTC Sensitivity", "Androstenone Sensitivity", "Asparagus Sensitivity"],

        fullGTMap: {},
        noVariants: true,

        allIds: null,

        PTIndex: null,

        linearMetrics: [],
        linearHeader: [
          {
            text: '',
            align: 'left',
            sortable: false,
            value: 'name',
          },
          {text: 'Pearsons R', value: 'Pearsons R'},
          {text: 'R^2', value: 'R^2'},
          {text: 'P-Vale', value: 'P-Val'},
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
        operands: [">", "<", ">=", "<="],
        selectedRegression: null,
        showPed: true,
        affectedCuttoff: "7",
        minThreshold:  null,
        maxThreshold: null,


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
        projectF1: -1,

        familyAccuracy: -1,
        familyPrecision: -1,
        familyRecall: -1,
        familyF1: -1,

        ptMap: null,
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        binaryVals: ['Affected', 'affected', 'Unaffected', 'unaffected', 'Yes', 'yes', 'No', 'no', "Positive", 'positive', "Pos", 'pos', 'Negative', 'negavite', 'Neg', 'neg'],
        binaryType: null,

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
      self.hubSession = new HubSession(self.source);
    },

    beforeDestroy() {

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
        {name: 'Pearsons r', project: 0.5, family: 0},
        {name: 'r**2', project: 1, family: 1},
        {name: 'P-val', project: 1, family: 1}
      ];


      if (self.launchedFrom === "H") {
        self.populateHubPhenotypes();
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

      initSelectedFamily() {

        let self = this;


        self.hubSession.promiseGetPedigreeForSample(self.project_id, self.sample_id).then((data) => {
          self.selectedFamily = data.pedigree.proband.pedigree.kindred_id;
        })

      },

      populateHubPhenotypes(){

        let self = this;


        self.phenotypes = [];
         self.hubSession.promiseGetMetricsForSample(self.project_id, self.sample_id)
            .then((data) => {
              for (let key in data.metrics) {
                let match = self.metrics.filter(d => {
                  return d.uid === key;
                });

                if (match && match.length === 1) {
                  let val = data.metrics[key];
                  if (!isNaN(val)) {
                    self.phenotypes.push(match[0].name);
                  } else if (self.isBinary(val)) {
                    self.phenotypes.push(match[0].name);
                  }

                }
              }

              self.phenotypes.sort();
              setTimeout(function () {
                self.selectedPhenotype = self.phenotypes[0];
              }, 4000);

            });

      },

      isBinary(val){
        if(this.binaryVals.includes(val)){
          return true
        }
        else{
          return false
        }
      },


      formatJson: function(json){

        let ret = {};

        for(let i = 0; i < json.length; i++){
          let key = json[i]["LINK_ID"];
          let v = json[i]["LAB"];
          if(ret.hasOwnProperty(key)){
          }
          ret[key] = v;
        }
        return ret;

      },


      csvToJson: function(csv){

        var lines=csv.split("\n");

        var result = [];

        // NOTE: If your columns contain commas in their values, you'll need
        // to deal with those before doing the next step
        // (you might convert them to &&& or something, then covert them back later)
        // jsfiddle showing the issue https://jsfiddle.net/
        var headers=lines[0].split(",");

        for(var i=1;i<lines.length;i++){

          var obj = {};
          var currentline=lines[i].split(",");

          for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
          }

          result.push(obj);

        }

        //return result; //JavaScript object
        return result;
        //return JSON.stringify(result); //JSON

      },

      readTextFile: function()
      {

        let self = this;

    let file = "./../static/linkIds.csv"
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
      if(rawFile.readyState === 4)
      {
        if(rawFile.status === 200 || rawFile.status == 0)
        {
          var allText = rawFile.responseText;
          let json = self.csvToJson(allText);
          let ret = self.formatJson(json);

        }
      }
    }
    rawFile.send(null);
  }
,

      removeHighlight: function () {
        let self = this;

        self.opts.dataset = io.readLinkage(self.pedTxt);
        self.opts = self.addCachedValuesToOpts(self.opts);
        self.opts = ptree.build(self.opts);
        ptree.build(self.opts);

        self.highlightAll();
        self.drawGenotypeBars();

      },
      buildGTMapFromVcf() {

        let self = this;

        let gtMap = {};

        let sampleIDs = [];


        let vcfLines = self.vcfTxt.split('\n');


        let filteredTxt = "";

        for (let i = 0; i < vcfLines.length; i++) {

          let firstTwo = vcfLines[i].substr(0, 2);

          if (firstTwo === "##") {

          } else {

            let lineCols = vcfLines[i].split('\t');
            let filteredCols = [];

            for (let j = 0; j < lineCols.length; j++) {
              if (lineCols[j] === "") {
                filteredCols.push("");
              } else {
                filteredCols.push(lineCols[j]);
              }
            }

            let variant = filteredCols.slice(0, 5);

            let varText = variant[0] + ':' + variant[1] + "_" + variant[3] + '/' + variant[4];



            varText = varText.replace(/\s/g, '');

            let gts = filteredCols.slice(9);

            if (firstTwo === "#C" || firstTwo === "#c") {
              sampleIDs = gts;
            } else {
              if(varText === ":undefined_undefined/undefined"){
              }
              else{
                gtMap[varText] = gts;

              }
            }

          }
        }
        self.idList = sampleIDs;
        return gtMap;

      },


      invertRange() {
        this.inverted = !this.inverted;
      },

      buildFromDemo() {
        let self = this;
        self.pedTxt = self.txt;

        self.binaryType = "Number";


        self.genotypeMap = self.buildGTMapFromVcf();
        self.parsedVariants = Object.keys(self.genotypeMap).filter(Boolean);


        self.populateModel();
        self.populatePTC();
        self.selectedPhenotype = "PTC Sensitivity";
        self.selectedGenotype = "7:141972755_C/T";
        self.selectedFamily = "1463";


        self.selectedRegression = "Linear";
        let PHandler = new PhenotypeHandler();
        self.PTCPhenotypes = PHandler.replacedIDs;
        self.ptMap = self.PTCPhenotypes;
        self.selectedGenotype = self.parsedVariants[0];

      },

      ptNameToId(pt){
        if(this.ptIdMap && this.ptIdMap.hasOwnProperty(pt)){
          return this.ptIdMap[pt];
        }
        return pt;
      },

      buildFromUpload() {
        let self = this;

        self.pedTxt= self.validatePedFile(self.txt);
        self.populateModel();
        self.selectedRegression = "Linear";
        self.selectedFamily = self.pedTxt.split(" ")[0];
        self.genotypeMap = self.buildGTMapFromVcf();
        self.parsedVariants = Object.keys(self.genotypeMap);

        self.populatePhenotypes();

      },


      buildFromHub() {
        let self = this;
        self.pedTxt = self.txt;
        self.selectedRegression = "Linear";
        self.populateModel();
      },

      buildGTMapFromHub(){
        let self = this;
        let gtMap = {};


        for(let i = 0; i < self.variants.length; i++){
          let varText = self.variants[i].chr + ":" + self.variants[i].pos + "_" + self.variants[i].ref + "/" + self.variants[i].alt;
          let gts = {};
          gtMap[varText] = gts;
          for(let j = 0; j < this.sampleIds.length; j++){
            let sampleId = self.sampleIds[j];
            if(self.variants[i].sample_ids.includes(self.sampleIds[j])){
              gtMap[varText][sampleId] = "1/1";
            }
            else{
              gtMap[varText][sampleId] = "0/0";
            }
          }
        }
        // self.selectedGenotype = self.variants[0];
        self.genotypeMap = gtMap;
        },


      buildPedFromTxt(txt) {
        let pedLines = txt.split('\n');
        let pedObject = {};

        for (let i = 0; i < pedLines.length; i++) {
          let splitLine = pedLines[i].split("\t");
          let sample = {
            kindred_id: splitLine[0],
            individual_id: splitLine[1],
            paternal_id: splitLine[2],
            maternal_id: splitLine[3],
            sex: splitLine[4],
            affection_status: splitLine[5]
          }
          pedObject[i] = sample;
        }
        return pedObject
      },

      promiseGetPedigreeForSample(project_id, sample_id) {
        let self = this;

        return new Promise(function(resolve, reject) {
          // Get pedigree for sample
          self.getPedigreeForSample(project_id, sample_id)
            .done(rawPedigree => {
              const rawPedigreeOrig = $.extend({}, rawPedigree);
              let pedigree = self.parsePedigree(rawPedigree, sample_id)
              if (pedigree) {
                resolve({pedigree: pedigree, rawPedigree: rawPedigreeOrig});
              } else {
                reject("Error parsing pedigree");
              }
            })
            .fail(error => {
              reject("Error getting pedigree for sample " + sample_id + ": " + error);
            })
        })
      },

      validatePedFile(txt){
        let pedLines = txt.split('\n');
        let pedTxt = "";

        let newPedLines = [];

        let allSampleIds = [];
        let allMaternalIds = [];
        let allPaternalIds = [];

        //todo: double check genders are correct
        for(let i = 0; i < pedLines.length; i++){
          let splitLine = pedLines[i].split("\t");

          let pedLine = pedLines[i];

          let maternalId = splitLine[3];
          let paternalId = splitLine[2];

          if(maternalId === "0" && paternalId !== "0"){
            maternalId = "undefinedMaternal" + i.toString();
            pedLine = splitLine[0] + '\t' + splitLine[1] + '\t' + paternalId + '\t' + maternalId + "\t" + splitLine[4];
          }
          else if(maternalId !== "0" && paternalId === "0"){
            paternalId = "undefinedPaternal" + i.toString();
            pedLine = splitLine[0] + '\t' + splitLine[1] + '\t' + paternalId + '\t' + maternalId + "\t" + splitLine[4];
          }

          newPedLines.push(pedLine);

          allSampleIds.push(splitLine[1]);
          allMaternalIds.push(maternalId);
          allPaternalIds.push(paternalId);
        }

        let familyId = this.getFamilyIdFromPedLine(pedLines[0]);

        for(let  i = 0; i < allMaternalIds.length; i++){
          if(!allSampleIds.includes(allMaternalIds[i])){
            if(allMaternalIds !== "0") {
              let nullPedLine = this.buildNullPedLine(familyId, allMaternalIds[i], "M");
              newPedLines.push(nullPedLine);
            }
          }
        }
        for(let  i = 0; i < allPaternalIds.length; i++){
          if(!allSampleIds.includes(allPaternalIds[i])){
            if(allPaternalIds[i] !== "0") {
              let nullPedLine = this.buildNullPedLine(familyId, allPaternalIds[i], "P");
              newPedLines.push(nullPedLine);
            }
          }
        }


        pedTxt = this.linesToText(newPedLines);
        return pedTxt;
      },

      linesToText(lines){

        let txt = "";

        for(let i = 0; i < lines.length; i++){
          txt = txt + lines[i] + '\n';
        }

        return txt;

      },

      getFamilyIdFromPedLine(pedLine){
        let splitLine = pedLine.split('\t')
        return splitLine[0];

      },

      buildNullPedLine(familyId, id, gender){

        let sex = 0;

        if(gender === "M"){
          sex = 2;
        }
        else if(gender === "P"){
          sex = 1;
        }
        let nullPedLine = familyId + "\t" + id + '\t0\t0\t' + sex;
        return nullPedLine;
      },


      populatePhenotypes() {

        let lines = this.phenotypeText.split("\n");


        let firstLine = lines[0];

        let headerCols = firstLine.split(",");

        // let pt = headerCols[1];

        this.phenotypes = [];

        for (let i = 1; i < headerCols.length; i++) {
          this.phenotypes.push(headerCols[i]);
        }
        this.buildPTMap();

      },


      buildPTMap() {

        //TODO: refactor for multi-PT csv
        this.ptMap = {};

        let lines = this.phenotypeText.split("\n");

        for (let i = 1; i < lines.length; i++) {

          let cols = lines[i].split(",");

          this.ptMap[cols[0]] = [];

          for (let j = 1; j < cols.length; j++) {
            this.ptMap[cols[0]].push(cols[j]);
          }
        }
      },

      populateAllSampleIds() {


        this.allIds = [];


        for (let i = 1; i < this.txtLines.length; i++) {

          let cols = this.txtLines[i].split(" ");

          if (typeof cols[1] === "undefined") {
          } else {
            this.allIds.push(cols[1].toString())
          }

        }
      },

      populateGenotypes() {

        this.fullGTMap = {};


        let gts = Object.keys(this.genotypeMap);


        for (let i = 0; i < gts.length; i++) {
          let key = gts[i];

          let values = this.genotypeMap[key];
          let dict = {};

          for (let i = 0; i < this.idList.length; i++) {

            let id = this.idList[i];
            let gtForID = values[i];
            let allele = " ";

            if (typeof gtForID === "undefined") {

            } else {

              allele = gtForID.substr(0, 3);

            }

            dict[id] = allele;

          }
          this.fullGTMap[key] = dict;
        }

      },


      buildLinearRegression() {
        let self = this;
        //TODO - implement this


        self.scatterplotData = self.regression.getScatterplotData();


        if(self.launchedFrom === "H"){
          self.buildGTMapFromHub();
        }
        else{
          self.populateGenotypes();
        }
        let gts = self.fullGTMap[self.selectedGenotype];
        self.PTIndex = self.phenotypes.indexOf(self.ptNameToId(self.selectedPhenotype));


        if(self.launchedFrom === "D") {

          self.regression = new Regression(gts, self.ptMap, "Linear", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, self.ptIndex);

        }
        else if(self.launchedFrom === "H"){


          gts = self.genotypeMap[self.selectedGenotype];
          self.regression = new Regression(gts, self.ptMap, "Linear", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, -1, self.binaryType);

        }
        else{
          self.regression = new Regression(gts, self.ptMap, "Linear", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, self.ptIndex);
        }
        self.linePoints = self.regression.getLinePoints();
        self.noVariants = self.regression.getNoVariants();
        self.projectCorrelation = self.regression.getProjectCorrelation();
        self.projectPVal = self.regression.getProjectPVal();

        let familyCandP = self.regression.getFamilyCorrelationAndPVal();

        self.familyCorrelation = familyCandP[0];
        self.familyPVal = familyCandP[1];

        self.linearMetrics = [
          {
            name: "family",
            "Pearsons R": self.familyCorrelation,
            "R^2": self.familyCorrelation ** 2,
            "P-val": self.familyPVal
          },
          {
            name: "project",
            "Pearsons R": self.projectCorrelation,
            "R^2": self.projectCorrelation ** 2,
            "P-val": self.projectPVal
          }
        ];

        self.scatterplotData = self.regression.getScatterplotData();
        self.buildPTLegend();
      },

      nFormatterLabel(num) {

        let digits = 2;

        if(this.binaryType === "Yes"){
          if(num == 1){
            return "Yes"
          }
          return "No";
        }


        var si = [
          {value: 1, symbol: ""},
          {value: 1E3, symbol: "K"},
          {value: 1E6, symbol: "M"},
          {value: 1E9, symbol: "B"},
          {value: 1E12, symbol: "T"}
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
          if (num >= si[i].value) {
            break;
          }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
      },


      nFormatter(num) {

        let digits = 2;

        var si = [
          {value: 1, symbol: ""},
          {value: 1E3, symbol: "K"},
          {value: 1E6, symbol: "M"},
          {value: 1E9, symbol: "B"},
          {value: 1E12, symbol: "T"}
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
          if (num >= si[i].value) {
            break;
          }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
      },

      buildSlider() {
        let self = this;

        d3.select("#slider-axisRange").remove();

        let sliderRange = null;


        console.log("self.minPT, self.maxPt", self.minPt, self.maxPt);
        console.log("self.selectedRegression", self.selectedRegression);



        // if(self.binaryType && self.binaryType !== "Number" && self.binaryType !== "unknown" || self.maxPt === -Infinity){
        //   self.minPt = 0;
        //   self.maxPt =  1;
        // }
        //



        if (self.selectedRegression === "Linear") {
          self.minThreshold = self.minPt;
          self.maxThreshold = self.maxPt;


          sliderRange = d3
            .sliderVertical()
            .min(self.minPt)
            .max(self.maxPt)
            .default([self.minPt, self.maxPt])
            .height(300)
            .ticks(0)
            .displayFormat(d => self.nFormatterLabel(d))
            .tickFormat(d => self.nFormatter(d))
            .fill('#2196f3')
            .on('onchange', val => {

              self.minThreshold = val[0];
              self.maxThreshold = val[1];

            });

        } else if (self.selectedRegression === "Logistic") {

          self.minThreshold = (self.maxPt + self.minPt) / 2;
          self.maxThreshold = self.maxPt;

          sliderRange = d3
            .sliderVertical()
            .min(self.minPt)
            .max(self.maxPt)
            .default([self.minThreshold, self.maxThreshold])
            .height(300)
            .ticks(0)
            .displayFormat(d => self.nFormatter(d))
            .fill('#2196f3')
            .on('onchange', val => {
              self.minThreshold = val[0];
              self.maxThreshold = val[1];
            });

        }


        if(self.binaryType === "Number" || self.binaryType === "unknown") {
          console.log("updating slider with self.minPt, self.maxPt / 2",self.minPt, self.maxPt / 2)
          d3.select("#scatterplot").append("g").attr("id", "slider-axisRange")
            .call(sliderRange)
            .append("text").text(self.selectedPhenotype)
            .attr("class", "axis-label")
            .attr("x", -250)
            .attr("y", -50)
            .attr("transform", "rotate(-90)");
        }
      },

      buildLogisticRegression() {
        let self = this;

        if(self.launchedFrom === "D") {
          let gts = self.fullGTMap[self.selectedGenotype];

          self.regression = new Regression(gts, self.ptMap, "Logistic", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, self.ptIndex);

        }
        else if(self.launchedFrom === "H"){
          self.buildGTMapFromHub();
          let gts = self.genotypeMap[self.selectedGenotype];
          self.regression = new Regression(gts, self.ptMap, "Logistic", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, -1);

        }
        else{
          let gts = self.fullGTMap[self.selectedGenotype];
          self.regression = new Regression(gts, self.ptMap, "ogistic", self.opts.dataset, self.sampleIds, self.minThreshold, self.maxThreshold, self.inverted, self.ptIndex);
        }


          if(!self.noVariants) {
            self.populateLogisticEvaluationMetrics();
          }

        self.scatterplotData = self.regression.getScatterplotData();
        self.buildLogisticRegressionLegend();


        self.scatterplotData = self.regression.getScatterplotData();
        self.noVariants = self.regression.getNoVariants();
        self.linePoints = self.regression.getLinePoints();


      },


      populateModel() {
        let self = this;
        self.splitTxt();
        self.populateAllSampleIds();
        self.populateTxtDict();
        self.populatePedDict();
        self.populateFamilies();
        self.initSelectedFamily();
        self.rebuildPedDict();
        self.highlightFamily();

        if (self.launchedFrom !== "U") {
          // self.parseVariants();
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
        } else if (self.launchedFrom === "U") {
          self.buildUploadPhenotypes();
        }

        $('#pedigree').on('nodeClick', self.onNodeClick);
        $('#pedigree').on('bgClick', self.onBGClick);

      },

      buildGenotypes: function () {

        let self = this;
        $('#pedigree').remove();
        $('#pedigrees').append($("<div id='pedigree'></div>"));
        self.cachedGenotypes = {};
        self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
        self.opts.dataset = io.readLinkage(self.pedTxt);
        if(self.launchedFrom === "H"){
          self.opts.dataset = self.addHubGenotypesToOpts(self.opts);

        }
        else{
          self.opts.dataset = self.addNewGenotypesToOpts(self.opts);
        }
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
          if(typeof parsedVariant === "undefined"){

          }
          else {
            self.parsedVariants.push(parsedVariant);
          }
        }

        setTimeout(function () {
          self.selectedGenotype = self.parsedVariants[0];
        }, 4000);

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

      onBGClick: function (e, swag) {
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

      highlightAll: function () {

        let self = this;
        let parentNodes =
          d3.selectAll(".node").nodes().map(function (d) {
            return d.parentNode;
          });
        parentNodes.forEach(function (n) {
          let nodeToHightlight = d3.select(n.nextSibling.childNodes[0]);
          let border = d3.select(n.previousSibling);
          let txt = d3.select(n.nextSibling.nextSibling.nextSibling.nextSibling);

          nodeToHightlight.style('opacity', 1);
          border.style('opacity', 1);
          txt.style('opacity', 1);

        });

        self.highlightGTs();

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
              nodeToHightlight.style('opacity', 1);

              border.style('opacity', 1);
              txt.style('opacity', 1);
            }

          }
        });

        self.highlightGTs();
      },

      buildLinearRegressionLegend() {

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
        if (self.inverted) {
          legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", self.purple)
            .attr("stop-opacity", 1);
          legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#F9F9F9")
            .attr("stop-opacity", 1);
        } else if (!self.inverted) {
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
          .ticks(5)
          .tickFormat(d => self.nFormatter(d));

  key.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(5,80)")
          .call(lAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("dy", ".71em")
          .style("text-anchor", "end");
        key.append("text")
          .attr("transform", "translate(0,50)")
          .text("Less affected <----> More affected");
      },

      buildLogisticRegressionLegend() {

        console.log("inside build logistic regression")
        console.log("self.inverted", this.inverted);

        let self = this;
        d3.select("#legendSvg").remove();
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
          .attr("height", h - 30)
          .style("fill", "white")
          .style("stroke", "black")
          .attr("transform", "translate(5,60)");
        if (!self.inverted) {
          key.append("rect")
            .attr("width", lScale(self.maxThreshold) - lScale(self.minThreshold))
            .attr("x", lScale(self.minThreshold))
            .attr("height", h - 30)
            .style("fill", self.purple)
            .style("stroke", "black")
            .attr("transform", "translate(5,60)");

        } else if (self.inverted) {
          key.append("rect")
            .attr("width", lScale(self.maxPt) - lScale(self.maxThreshold))
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

        let tickNum = 5;

        if(self.binaryType && self.binaryType !== "Number" && self.binaryType !== "unknown"){
          tickNum = 1;
        }

        let lAxis = d3.axisBottom()
          .scale(lScale)
          .ticks(tickNum)
          .tickFormat(d => self.nFormatterLabel(d));
  ;
        key.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(5,80)")
          .call(lAxis)
          .attr("dy", ".71em")
          .style("text-anchor", "end");
        if (!self.inverted) {
          key.append("text")
            .attr("transform", "translate(20,50)")
            .text("Affected <----> Un-affected");
        } else if (self.inverted) {
          key.append("text")
            .attr("transform", "translate(20,50)")
            .text("Un-affected <----> Affected");
        }
      },

      buildPTLegend() {
        let self = this;
        d3.select("#legendSvg").remove();
        if (self.selectedRegression === "Linear") {
          this.buildLinearRegressionLegend();
        } else if (self.selectedRegression === "Logistic") {
          this.buildLogisticRegressionLegend()
        }
      },

      highlightGTs: function () {
        let self = this;
        for (let i = 0; i < self.cachedNulls.length; i++) {
          let node = self.getNodeById(self.cachedNulls[i]);
          if (!self.highlightedSampleIDs.includes(self.cachedNulls[i].toString())) {
            node.selectAll("rect")
              .attr("opacity", 0.05);
          } else {
            node.selectAll("rect")
              .attr("opacity", 0.5);
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
          // let splitLine = line.split('\t');
          // let familyID = splitLine[0];

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
            if(key === ""){}
            else {
              self.familyIDs.push(key);
            }
            let pedLines = self.pedDict[key];
            let fam = new family(key, pedLines);
            self.families[fam.familyID] = fam;
          }
        }
        self.familyIDs.filter(Boolean);
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


      populateThresholds: function () {
        let self = this;
        if (this.launchedFrom === "U") {
          self.minPt = Math.min();
          self.maxPt = Math.max();
          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = self.opts.dataset[i].name;
            let pts = self.ptMap[id];
            self.PTIndex = self.phenotypes.indexOf(self.selectedPhenotype);
            let sens = parseFloat(pts[self.PTIndex]);
            if (sens < this.minPt) {
              this.minPt = sens;
            } if (sens > this.maxPt) {
              this.maxPt = sens;
            }
          }
          self.minThreshold = self.minPt;
          self.maxThreshold = self.maxPt;
        } else if (this.launchedFrom === "D") {
          if (self.selectedPhenotype === "PTC Sensitivity") {
            self.minPt = 0;
            self.maxPt = 12;
            self.minThreshold = 0;
            self.maxThreshold = 12;
          } else if (self.selectedPhenotype === "Androstenone Sensitivity") {
            self.minPt = 0;
            self.maxPt = 12;
            self.minThreshold = 0;
            self.maxThreshold = 12;
          } else if (self.selectedPhenotype === "Asparagus Sensitivity") {
            self.minPt = 0;
            self.maxPt = 2;
            self.minThreshold = 0;
            self.maxThreshold = 2;
          }
        }
          else if(self.launchedFrom === "H") {


          self.promisePhenotypes()
            .then((pts) => {
              let keys = Object.keys(pts);

              let minArr = [];


              for(let i = 0; i < keys.length; i++){
                let x = keys[i];
                if (typeof pts[x] === "undefined" || isNaN(pts[x])) {
                } else {
                  minArr.push(parseFloat(pts[x]))
                }
              }

              minArr = minArr.sort(function(a, b){return a-b});
              if(minArr.length > 0){
                self.minPt = minArr[0];
              }
              else{
                self.minPt = 0;
              }

              self.minPT = Math.min.apply(null, keys.map(function (x) {
                if (typeof pts[x] === "undefined" || isNaN(pts[x])) {
                  return Infinity;
                } else {
                  return parseFloat(pts[x])
                }
              }));

              console.log("self.minPT in promise phenotype", self.minPt);

                self.minThreshold = self.minPt;



                console.log("keys after mapping", keys);
              self.maxPt = Math.max.apply(null, keys.map(function (x) {
                if (isNaN(pts[x])) {
                  return 1
                } else {
                  return parseFloat(pts[x]);
                }
              }));

                self.maxThreshold = self.maxPt;
                self.buildSlider();
            })
        }
      },

      buildUploadPhenotypes: function () {
        let self = this;
        if (self.selectedPhenotype === null) {
          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = self.opts.dataset[i].name;
            self.opts.dataset[i].affected = 0;
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
        } else {
          self.cachedPhenotypes = {};
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
            } else if (self.selectedRegression === "Logistic") {
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
            } else if (self.selectedRegression === "Linear") {
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

        self.ptIndex = self.phenotypes.indexOf(self.selectedPhenotype);


        self.cachedPhenotypes = {};
          for (let i = 0; i < self.opts.dataset.length; i++) {
            let id = self.opts.dataset[i].name;
            let sens = "nan";
            if(self.PTCPhenotypes.hasOwnProperty(id)) {
              sens = self.PTCPhenotypes[id][self.ptIndex];
            }
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
            } else if (self.selectedRegression === "Logistic") {

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

            } else if (self.selectedRegression === "Linear") {
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
      },

      buildRegression: function () {

        if (this.selectedGenotype === null || this.selectedPhenotype === null) {
          return;
        }
        if (this.selectedRegression === "Linear") {
          this.buildLinearRegression();
        } else if (this.selectedRegression === "Logistic") {
          this.buildLogisticRegression()
        }

      },

      parseBinary(sens){
        if(!isNaN(sens)){
          this.binaryType = 'Number';
          return parseFloat(sens);
        }
        if( sens === 'Positive' || sens === 'positive' || sens === 'Pos' || sens === 'pos'){
         this.binaryType = 'Positive';
         return 1;
        }
        else if( sens === 'Negative' || sens === 'negative' || sens === 'Neg' || sens === 'neg'){
          this.binaryType = 'Positive';
          return 0
        }
        else if(sens === 'Yes' || sens === 'yes'){
          this.binaryType = 'Yes';
          return 1;
        }
        else if(sens === 'No' || sens === 'no'){
          this.binaryType = 'Yes';
          return 0;
        }
        else if(sens === 'Affected' || sens === 'affected'){
          this.binaryType = 'Affected';
          return 1;
        }
        else if(sens === 'Unaffected' || sens === 'unaffected'){
          this.binaryType = 'Affected';
          return 0;
        }
        else{
          return null;
        }
      },


      buildHubPhenotypes: function () {
        let self = this;
        self.cachedPhenotypes = {};

        self.promisePhenotypes()
          .then((pts) => {
            self.ptMap = pts;



            for (let i = 0; i < self.opts.dataset.length; i++) {
              let id = self.opts.dataset[i].name;
              let sens = "nan";
              if(pts.hasOwnProperty(id)) {
                let pt = pts[id];
                sens = self.parseBinary(pt);
              }
              let scaledSens = -1;
              let opacity = 1;


              if (typeof sens === 'undefined' || sens === 'nan') {
                self.opts.dataset[i].NA = true;

                self.cachedNulls.push(id);
              }

              self.opts.dataset[i].sens = sens;

              let aff = 0;

              let color = "white";

              if (self.binaryType === "unknown") {
                color = "none";
              } else if(self.binaryType !== 'Number' || (self.minThreshold === 0 && self.maxThreshold === 0) || (self.minThreshold === 1 && self.maxThreshold === 1)){
                console.log("sens", sens);
                if((self.inverted && sens === 0) || (!self.inverted && sens === 1)){
                  color = self.purple;
                }
                else{
                  color = "white";
                }
              }else if (self.selectedRegression === "Logistic") {

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

              } else if (self.selectedRegression === "Linear") {
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
              self.opts.dataset[i].col = color;
              self.opts.dataset[i].opac = opacity;
              self.cachedPhenotypes[id] = aff;
              self.cachedColors[id] = color;
              self.cachedOpacity[id] = opacity;
            }

            self.opts = self.addCachedValuesToOpts(self.opts);
            self.opts = ptree.build(self.opts);
            self.buildRegression();
          })


      },
      promisePhenotypes: function () {
        return new Promise((resolve, reject) => {
          let self = this;
          let pts = {};
          let promises = [];
          if (typeof self.selectedPhenotype === "object") {
            // self.selectedPhenotype = "affected_status";
          }

          for (let i = 0; i < self.sampleIds.length; i++) {
            let metP = self.hubSession.promiseGetMetricsForSample(self.project_id, self.sampleIds[i])
              .then((data) => {
                let pt = self.ptNameToId(self.selectedPhenotype);
                let samplePhenotype = data.metrics[pt];
                let sampleId = self.sampleIds[i];
                pts[sampleId] = samplePhenotype;
              });
            promises.push(metP);
          }
          Promise.all(promises)
            .then(() => {
              resolve(pts)
            }).catch((e) => {
            console.log("error", e);
            reject(e);
          });
        })
      },

      addHubGenotypesToOpts: function(opts){

        let self = this;
        if (self.selectedGenotype === null) {
        } else {
          let gts = self.genotypeMap[self.selectedGenotype];
          for (let i = 0; i < opts.dataset.length; i++) {
            let id = parseInt(opts.dataset[i].name).toString();

            let gtForID = gts[id];
              let allele = " ";
              if (typeof gtForID === "undefined") {
              } else {
                allele = gtForID.substr(0, 3);
              }
              self.cachedGenotypes[id] = allele;
            }
          }

        opts = self.addCachedValuesToOpts(opts);
        return opts.dataset;
      },

      addNewGenotypesToOpts: function (opts) {
        let self = this;
        //todo - remove this type of null checking from all code
        if (self.selectedGenotype === null) {
        } else {
          let keys = Object.keys(self.genotypeMap);
          let gts = self.genotypeMap[self.selectedGenotype];
          for (let i = 0; i < opts.dataset.length; i++) {
            let id = parseInt(opts.dataset[i].name);
            if (self.idList.includes(id.toString())) {
              let index = self.idList.indexOf(id.toString());
              let gtForID = gts[index];
              let allele = " ";
              if (typeof gtForID === "undefined") {
              } else {
                allele = gtForID.substr(0, 3);
              }
              self.cachedGenotypes[id] = allele;
            }
          }
        }
        opts = self.addCachedValuesToOpts(opts);
        return opts.dataset;
      },

      getNodeById: function (id) {
        let node = d3.select('[id="' + id + '"]');
        let p1 = node.select(function () {
          return this.parentNode;
        });
        return p1;
      },

      populateLogisticEvaluationMetrics() {
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

      drawGenotypeBars: function () {
        let self = this;
        let blue = " #e6e6e6";
        let red = "#595959";
        let w = "6px";
        let h = "13px";
        for (let key in self.cachedGenotypes) {
          let node = self.getNodeById(key);
          let gt = self.cachedGenotypes[key];
          let opacity = 1.0;
          if (self.cachedNulls.includes(parseInt(key))) {
            opacity = 0.5
          }
          if (gt === "0/1") {
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
              .style("stroke-width", 1)
              .attr("fill", red);
          } else if (gt === "0/0") {
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
          } else if (gt === "1/1") {
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

      affectedCuttoff: function () {
        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();

      },

      selectedOperand: function () {
        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();
      },

      minThreshold: function () {
        let self = this;
          self.buildPhenotypes();
          if(self.launchedFrom !== "H") {
            self.buildRegression();
          }
      },

      maxThreshold: function () {
        let self = this
          self.buildPhenotypes();
        if(self.launchedFrom !== "H") {
          self.buildRegression();
        }
      },

      selectedFamily: function () {
        let self = this;
        let gt = self.selectedGenotype;
        let pt = null;
        if(self.selectedPhenotype){
          pt = self.selectedPhenotype;
        }

        if(self.launchedFrom === "H"){
          self.parseVariants();
          self.pedTxt = self.getDataByFamilyID(self.selectedFamily);
          self.opts.dataset = io.readLinkage(self.pedTxt);
          self.populateSampleIds();
          self.buildGTMapFromHub();
        }


        self.resetValues();
        self.selectedGenotype = gt;
        if(pt) {
          self.selectedPhenotype = pt;
        }
        self.buildPhenotypes();
        self.populateSampleIds();
        self.buildGenotypes();
        self.buildRegression();
        $('#pedigree').on('nodeClick', self.onNodeClick);
        $('#pedigree').on('bgClick', self.onBGClick);
      },

      toggle: function () {
        let self = this;
        self.showPed = !self.showPed;
      },

      inverted: function () {
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
          self.buildRegression();
        } else {
          self.removeHighlight();
          $('#pedigree').on('nodeClick', self.onNodeClick);
          $('#pedigree').on('bgClick', self.onBGClick);
        }
        $('#pedigree').on('nodeClick', self.onNodeClick);
      },
      selectedPhenotype: function () {
        let self = this;
        // self.populateSampleIds();
        self.populateThresholds();
        self.buildPhenotypes();
        //
        //
        // self.ptIndex = self.phenotypes.indexOf(self.selectedPhenotype);
        //
        // self.buildRegression();

      },

      selectedGenotype: function () {
        let self = this;
        if (typeof self.selectedGenotype === "undefined") {
        } else {
          self.buildGenotypes();
          self.buildRegression();
        }
      },

      selectedRegression: function () {
        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();
        self.buildRegression();
        self.buildSlider();
        self.linePoints = self.regression.getLinePoints();
      },

      binaryType:function(){
        if(this.binaryType != null && this.binaryType !== "Number" && this.binaryType !== "unknown"){
          this.regressionTypes = ["Logistic"];
          this.selectedRegression = "Logistic";
        }
        else {
          this.regressionTypes = ["Linear", "Logistic"];
          // this.selectedRegression = "Linear";
          this.buildSlider();

        }
      }
    }
  }
</script>

<style>

  #pedigrees svg {
    height: 96vh;
  }

  #legend {
    height: 100px;
    width: 220px;
    justify-content: center;
  }

  .flex {
    display: flex; /* or inline-flex */
    align-content: flex-start;
    height: 100%;
  }

  #container {
    display: flex;
    flex-direction: column;
    height: 95vh;
  }

  .col {
    flex-grow: 1;
    overflow: auto;
    height: 96vh;
  }

  .v-input v-text-field v-select v-input--is-label-active v-input--is-dirty theme--light {
    max-height: 100px;
  }

  table.gridtable {
    font-family: verdana, arial, sans-serif;
    font-size: 11px;
    color: #333333;
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

  .tableTitle {
    text-align: left;
    font-size: 16px;
    font-style: normal;
    font-weight: bold;
    margin: 5px;
  }

  text {
    fill: black;
    text-shadow: 2px 2px 11px white;
  }

  .pedWrapper {
    height: 96vh;
  }

</style>
