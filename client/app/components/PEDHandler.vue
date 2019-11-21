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

      <div id="pedigrees" v-show="showPed" style="width: 80%;"></div>

      <!--<div class="flexCol" width="450px" >-->


      <div id="container">

      <div  class="col">



        <v-card>
        <vueScatter :rawData="scatterplotData" :linePoints="linePoints" :opts="opts" :regressionType="selectedRegression" :operand="selectedOperand" :cuttoff="affectedCuttoff"></vueScatter>

        </v-card>


        <v-card>
          <div  id="affectedCuttoff" v-show="selectedRegression === 'Logistic'">
          <div style="display: inline-flex">  <div style="margin-top: 10px"> Affected Cuttoff</div>
            <v-select :items="operands" style="width: 50px; margin-top: 0; padding-left:10px; padding-top: 0" outlined dense v-model="selectedOperand"></v-select>
            <strong style="margin-top: 10px; margin-left: 10px">{{affectedCuttoff}} </strong> </div>
          </div>


          <div id="legend">

          </div>

          <div id="logisticRegression" v-show="selectedRegression === 'Logistic'">

            <table>
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


          </div>



        <div id="linearRegression" v-show="selectedRegression === 'Linear'">

            <div class="tableTitle">Regression Statistics</div>


              <table>
                <thead>
                <th></th> <th style="text-align: left"> Pearsons 'r' </th> <th style="text-align: left"> r^2 </th> <th style="text-align: left"> P-val </th>
                </thead>
                <tbody></tbody>
                <tr class="val">
                <th class="val"> Project</th>
                <td id="projectR" > {{projectCorrelation}}</td>
                  <td class="val">{{(projectCorrelation**2).toFixed(4)}}</td>
                  <td id="projectP" class="val"> {{projectPVal.toExponential(3)}}</td>
              </tr>


                <tr class="val">
                  <th class="val">Family</th>

                <td id="familyR" class="val">{{familyCorrelation}}</td>
                  <td>{{(familyCorrelation**2).toFixed(4)}}</td>
                 <td id="familyP" class="val">{{familyPVal.toExponential(3)}}</td>
                </tr>
              </table>


        </div>

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
        affectedStatuses: ["binary", "continuous"],
        purple: "#8629EA",
        txtLines: '',
        txtDict: {},
        pedDict: {},
        PTCPhenotypes: {},
        TASGenotypes: TAS,
        cachedPhenotypes: {},
        cachedColors: {},
        cachedGenotypes: {},
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

        sliderVal: null,

        scatterplotData: null,

        linePoints: null,
        regression: null,
        ccType: null,
        drawer: false,
        toggle: null,

        minPt: 0,
        maxPt: 12,



        //user unputs
        displayAffectedAs: "continuous",
        operands: [">", "<", ">=", "<="],
        selectedRegression: null,
        showPed: true,
        affectedCuttoff: "7",
        minThreshold: 0,
        maxThreshold: 12,



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
        self.buildFromDemo();
        self.buildSlider();

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
        // self.selectedPhenotype = "PTC Sensitivity";
        self.selectedRegression = "Linear";
        let PHandler = new PhenotypeHandler();
        self.PTCPhenotypes = PHandler.replacedIDs;

        // self.selectedGenotype = "7:141972755_C/T";
        self.selectedFamily = "1463";
        // self.selectedFamily = "1408";

        self.selectedPhenotype = "PTC Sensitivity";
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
      },

      buildLinearRegression() {



        let self = this;

        self.buildDemoPhenotypes();

        self.regression = new Regression(self.TASGenotypes, self.PTCPhenotypes, "Linear", self.opts.dataset, self.sampleIds, self.affectedCuttoff, self.selectedOperand, self.minThreshold, self.maxThreshold);

        self.linePoints = self.regression.getLinePoints();


        self.projectCorrelation = self.regression.getProjectCorrelation();
        self.projectPVal = self.regression.getProjectPVal();

        let familyCandP = self.regression.getFamilyCorrelationAndPVal();



        self.familyCorrelation = familyCandP[0];
        self.familyPVal = familyCandP[1];
        // self.familyCorrelation = self.regression.getFamilyCorrelation(self.sampleIds)[0].toFixed(4);
        // self.familyPVal= self.regression.getFamilyCorrelation(self.sampleIds)[1].toExponential(3);

        // console.log("self.familyPVal inside PedHandler", self.familyPVal);

        self.scatterplotData = self.regression.getScatterplotData();


        self.buildRegressionTable();

        self.buildPTLegend();



      },

      buildSlider(){


        let self = this;

        if(self.displayAffectedAs === "continuous") {

          d3.select("#slider-axisCuttoff").remove();


          let sliderRange = d3
            .sliderVertical()
            .min(0)
            .max(12)
            .height(300)
            .ticks(0)
            .default([0, 12])
            .fill('#2196f3')
            .on('onchange', val => {

              self.minThreshold = val[0];
              self.maxThreshold = val[1];

            });

          d3.select("#scatterplot").append("g").attr("id", "slider-axisRange")
            .call(sliderRange)
            .append("text").text(self.selectedPhenotype);

        }

        else if(self.displayAffectedAs === "binary") {

          d3.select("#slider-axisRange").remove();



          let slider = d3
            .sliderVertical()
            .min(0)
            .max(11)
            .ticks(0)
            .default(self.affectedCuttoff)
            .step(1)
            .height(300)
            .on('onchange', val => {

              self.affectedCuttoff = val;

            })
            .displayValue(true);

          d3.select("#scatterplot").append("g").attr("id", "slider-axisCuttoff")
            .call(slider)
            .append("text").text(self.selectedPhenotype);
        }
      },

      buildLogisticRegression() {


        let self = this;

        // self.buildDemoPhenotypes();

        self.regression = new Regression(self.TASGenotypes, self.PTCPhenotypes, "Logistic", self.opts.dataset, self.sampleIds, self.affectedCuttoff, self.selectedOperand);
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
        $('#pedigree').on('nodeClick', self.onNodeClick);
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
            let col = self.cachedColors[id];
            opts.dataset[i].affected = aff;
            opts.dataset[i].col = col;
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

      buildPTLegend() {

        let self = this;

        d3.select("#legendSvg").remove();

        let w = 200, h = 50;


        if(self.displayAffectedAs === "continuous") {


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

          legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", self.purple)
            .attr("stop-opacity", 1);


          legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#F9F9F9")
            .attr("stop-opacity", 1);

          key.append("rect")
            .attr("width", w + 1)
            .attr("height", h - 30)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(5,60)");

          let yScale = d3.scaleLinear()
            .range([w, 0])
            .domain([self.maxThreshold, self.minThreshold]);

          var yAxis = d3.axisBottom()
            .scale(yScale)
            .ticks(5);

          key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(5,80)")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".71em")
            .style("text-anchor", "end")

          key.append("text")
            .attr("transform", "translate(0,50)")
            .text("More affected <----> Less affected");

        }
        else if(self.displayAffectedAs === "binary"){


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

          if(self.selectedOperand === "<" || self.selectedOperand === "<=") {

            let yScale = d3.scaleLinear()
              .range([w, 0])
              .domain([self.maxThreshold, self.minThreshold]);

            key.append("rect")
              .attr("width", yScale(self.affectedCuttoff))
              .attr("height", h - 30)
              .style("fill", self.purple)
              .style("stroke", "black")
              .attr("transform", "translate(5,60)");
          }



          //todo: rename yscale to legend scale
          else if(self.selectedOperand === ">" || self.selectedOperand === ">=") {

            let yScale = d3.scaleLinear()
              .range([w, 0])
              .domain([12, 0]);

            key.append("rect")
              .attr("width", yScale(self.maxPt - self.affectedCuttoff))
              .attr("height", h - 30)
              .style("fill", self.purple)
              .style("stroke", "black")
              .attr("transform", "translate(" + (5 + yScale(self.affectedCuttoff)).toString() + ",60)");

          }


          // let ticks = ["7"];
          let yScale = d3.scaleLinear()
            .range([w, 0])
            .domain([12, 0]);

          var yAxis = d3.axisBottom()
            .scale(yScale)
            .ticks(10);

          key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(5,80)")
            .call(yAxis)
            .attr("dy", ".71em")
            .style("text-anchor", "end")


          if(self.selectedOperand === "<" || self.selectedOperand === "<="){

            key.append("text")
              .attr("transform", "translate(20,50)")
              .text("Affected <----> Un-affected");
          }
          else if(self.selectedOperand === ">" || self.selectedOperand === ">="){
            key.append("text")
              .attr("transform", "translate(20,50)")
              .text("Un-affected <----> Affected");
          }

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

      buildRegressionTable() {

        let self = this;

        if(self.selectedRegression === "Linear") {

          self.familyCorrelationColor = self.getCorColor(self.familyCorrelation);
          self.projectCorrelationColor = self.getCorColor(self.projectCorrelation);

          self.familyPColor = self.getPColor(self.familyPVal);
          self.projectPColor = self.getPColor(self.projectPVal);


          d3.select("#projectR")
            .style("background", self.projectCorrelationColor);

          d3.select("#familyR")
            .style("background", self.familyCorrelationColor);

          d3.select("#projectP")
            .style("background", self.projectPColor);

          d3.select("#familyP")
            .style("background", self.familyPColor);

        }

        else{
          d3.select("#logisticRegression")
            .attr("height", "px")
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
              let id = self.opts.dataset[i].name;
              let sens = self.PTCPhenotypes[id];

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

                // console.log("typeof sens", typeof sens);

                self.affectedCuttoff == parseInt(self.affectedCuttoff);

                if (self.selectedOperand === "<") {
                  if (sens < self.affectedCuttoff) {
                    aff = 2;
                    color = self.purple;
                  }
                } else if (self.selectedOperand === ">") {
                  if (sens > self.affectedCuttoff) {
                    aff = 2;
                    color = self.purple;
                  }
                } else if (self.selectedOperand === ">=") {
                  if (sens >= self.affectedCuttoff) {
                    aff = 2;
                    color = self.purple;

                  }
                } else if (self.selectedOperand === "<=") {
                  if (sens <= self.affectedCuttoff) {
                    aff = 2;
                    color = self.purple;

                  }
                }

              }

              else if (self.displayAffectedAs === "continuous"){

                let scaledSens = -1;

                if(sens < self.minThreshold){
                  scaledSens = 0;
                }
                else if(sens > self.maxThreshold){
                  scaledSens= 1;
                }
                else{
                  scaledSens = (sens-self.minThreshold)/(self.maxThreshold - self.minThreshold)
                }

                color = d3.interpolateRgb("white", self.purple)(scaledSens);

              }


              self.opts.dataset[i].affected = aff;
              // console.log("color", color);
              self.opts.dataset[i].col = color;

              self.cachedPhenotypes[id] = aff;
              self.cachedColors[id] = color;
              // Label Debug // let nid = self.opts.dataset[i].name.toString(); // let allele = self.TASGenotypes[nid]; // self.opts.dataset[i].alleles = sens + "," + allele;
            }
            self.opts = self.addCachedValuesToOpts(self.opts);
            self.opts = ptree.build(self.opts);
            self.drawGenotypeBars();
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

      getCorColor: function(val){



        val = parseFloat(val);

        // console.log("val inside getCorColor", val);

        if(val > 0.7){
          return "limegreen"
        } else if(val > 0.5){
          return "yellow"
        }
        else if (val > .3){
          return "orange"
        }
        else{
          return "red";
        }
      },

      getPColor: function(val){

        val = parseFloat(val);

        if(val < 0.05){
          return "limegreen"
        }
        else if(val < 0.1){
          return "yellow"
        }
        else if(val < 0.25){
          return "orange"
        }
        else{
          return "red";
        }

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

        let blue = "#0059D1";
        let red = "#DD0000";

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

      affectedCuttoff: function(){

        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();
        self.buildLogisticRegression();

      },

      selectedOperand: function(){
        let self = this;
        self.populateSampleIds();
        self.buildPhenotypes();
        self.buildLogisticRegression();
      },


      displayAffectedAs: function(){
        let self = this;
        self.buildPhenotypes();

        self.populateSampleIds();

        self.buildSlider();


        if(self.displayAffectedAs === "binary"){
          self.selectedRegression = "Logistic";

          self.buildLogisticRegression();

        }
        else if(self.displayAffectedAs === "continuous"){

          self.selectedRegression = "Linear";
          self.buildLinearRegression();
        }

      },

      minThreshold: function(){
        let self = this;
        self.buildPhenotypes();

        self.buildLinearRegression();
      },

      maxThreshold: function(){
        let self = this;
        self.buildPhenotypes();
        self.buildLinearRegression();

      },

      selectedFamily: function () {
        let self = this;

        self.selectedPhenotype = "PTC Sensitivity";
        self.selectedGenotype = "7:141972755_C/T";

        self.buildPhenotypes();
        self.populateSampleIds();

        self.buildGenotypes();



        self.buildLinearRegression();
        console.log("self.sampleIds in watcher", self.sampleIds);
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
          self.drawGenotypeBars();
        } else {
          self.opts.dataset = io.readLinkage(self.pedTxt);
          self.opts = self.addCachedValuesToOpts(self.opts);
          self.opts = ptree.build(self.opts);
          ptree.build(self.opts)
          self.drawGenotypeBars();

        }
        $('#pedigree').on('nodeClick', self.onNodeClick);
      },
      selectedPhenotype: function () {
        let self = this;
        self.buildPhenotypes();
      },
      selectedGenotype: function () {
        let self = this;
        self.buildGenotypes();

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
    background-color: rgb(240, 250, 254);
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

  td .val{
    text-align: left;
  }
  th .val{
    text-align: center;
    color: grey;
  }

  tr:nth-child(odd).val {background-color: #f2f2f2;}

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





  /*<v-toolbar-title class="white--text">pedigree.iobio</v-toolbar-title>*/





</style>
