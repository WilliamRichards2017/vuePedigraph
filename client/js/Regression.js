import pearsonCorrelation from "./pearson-correlation.js"
import Correlation from "js-polynomial-regression/src/Correlation";
import {fisherTest} from "fisher-transform";
import LogisticRegression from "ml-logistic-regression";
import {Matrix} from "ml-matrix";



export default class Regression {
  constructor(rawGenotypes, rawPhenotypes, regressionType, dataset, sampleIds, affectedCuttoff, selectedOperand) {
    this.rawGenotypes = rawGenotypes;
    this.rawPhenotypes = rawPhenotypes;
    this.affectedCuttoff = affectedCuttoff;
    this.selectedOperand = selectedOperand;

    this.regressionType = regressionType;

    this.dataset = dataset;
    this.sampleIds = sampleIds;

    this.data = null;


    this.projectCorrelation = null;
    this.projectPVal = null;

    this.purple =  "#5810A5";


    this.projectAccuracy = -1;
    this.projectPrecision = -1;
    this.projectRecall = -1;
    this.projectF1 = -1;


    this.scatterplotDataLin = null;
    this.scatterplotDataLog = null;
    this.linePointsLin = null;
    this.linePointsLog = null;

    this.xRawP = null;
    this.yRawP = null;
    this.xRawF = null;
    this.yRawF = null;

    this.familyAccuracy = -1;
    this.familyPrecision = -1;
    this.familyRecall = -1;
    this.familyF1 = -1;


    this.familyFP = null;
    this.familyFN = null;
    this.familyTP = null;
    this.familyTN = null;

    this.projectFP = null;
    this.projectFN = null;
    this.projectTP = null;
    this.projectTN = null;

    this.logJitterMapping = [[0,0], [1,0], [-1, 0], [0,1], [-1, 1], [1,1], [0, -1], [-1, -1], [1, -1]];

    this.processRawData()

    this.populateRawCoords();

    this.populateScatterplotData();
    // this.populateLogCoords();

    this.calculateProjectCorrelation();
    this.calculateProjectPVal();

  }

  populateFamilyClassificationMetrics(y, yPred){

    let self = this;

    self.familyFN = 0;
    self.familyFP = 0;
    self.familyTN = 0;
    self.familyTP = 0;

    //Make sure order of y and yPred is preserved in populate log
    for(let i = 0; i < y.length; i++){
      if(y[i] === 1 && yPred[i] === 1 ){
        self.familyTP += 1;
      }
      else if(y[i] === 0 && yPred[i] === 0){
        self.familyTN +=1;
      }
      else if(y[i] === 0 && yPred[i] === 1){
        self.familyFP +=1;
      }
      else if(y[i] === 1 && yPred[i] === 0){
        self.familyFN +=1;
      }
    }


    self.familyFN.toFixed(4);
    self.familyFP.toFixed(4);
    self.familyTN.toFixed(4);
    self.familyTP.toFixed(4);

    self.familyAccuracy = (self.familyTP + self.familyTN) / y.length;

    // Precision = tp / (tp+fp)
    self.familyPrecision = self.familyTP / (self.familyTP + self.familyFP);


    //Recall tp/tp+fn

    self.familyRecall = self.familyTP / (self.familyTP + self.familyFN);


    //F1
    self.familyF1 = 2* ((self.familyPrecision*self.familyRecall)/(self.familyPrecision+self.familyRecall))



  }

  populateProjectClassificationMetrics(y, yPred){

    let self = this;

    self.projectFN = 0;
    self.projectFP = 0;
    self.projectTN = 0;
    self.projectTP = 0;

    //Make sure order of y and yPred is preserved in populate log
    for(let i = 0; i < y.length; i++){
      if(y[i] === 1 && yPred[i] === 1 ){
        self.projectTP += 1;
      }
      else if(y[i] === 0 && yPred[i] === 0){
        self.projectTP +=1;
      }
      else if(y[i] === 0 && yPred[i] === 1){
        self.projectFP +=1;
      }
      else if(y[i] === 1 && yPred[i] === 0){
        self.projectFN +=1;
      }
    }


    self.projectAccuracy = (self.projectTP + self.projectTN) / y.length;

    // Precision = tp / (tp+fp)
    self.projectPrecision = self.projectTP / (self.projectTP + self.projectFP);


    //Recall tp/tp+fn

    self.projectRecall = self.projectTP / (self.projectTP + self.projectFN);


    //F1
    self.projectF1 = 2* ((self.projectPrecision*self.projectRecall)/(self.projectPrecision+self.projectRecall));


    // console.log("family log cliassification metrics");


  }



  populateRawCoords() {
    let self = this;

    self.xRawP = [];
    self.yRawP = [];


    for (let key in self.rawGenotypes) {

      let af = -1;


      let gt = self.rawGenotypes[key];
      let pt = self.rawPhenotypes[key];


      if(gt === "1/1"){
        af = 1;
      }
      else if(gt === "1/0" || gt === "0/1"){
        af = 0.5;
      }
      else if(gt === "0/0"){
        af = 0;
      }
      else{
        // console.log("error: could not interpret GT", gt);
        af = "not a number";
      }


      if(typeof pt === "string") {
        if (pt.includes('>') || pt.includes('<')) {
          pt = pt.slice(-1);
        }
        if (typeof af === "number" && typeof parseInt(pt) === "number" && !isNaN(pt)) {
          self.xRawP.push(parseFloat(af));
          self.yRawP.push(parseInt(pt));
        }
      }
      else{
        // console.log("could not interpret PT", pt);
      }
    }
  }

  calculateProjectCorrelation(){
    let self = this;
    self.projectCorrelation = self.pearsonCorrelation([self.xRawP, self.yRawP], 0, 1);
    console.log("slef.projectcorrelation in calculate", self.projectCorrelation);
  }

  calculateProjectPVal(){

    let self = this;
    let ft = fisherTest(self.projectCorrelation, self.xRawP.length);
    self.familyPVal = ft.pvalue;
  }

  logisticJitter(data){

    let self = this;

    let coordsIdMap = {};

    for (const i in data) {

      let p = data[i];
      if (p.hasOwnProperty("x") && p.hasOwnProperty("y") && p.hasOwnProperty("id")) {

        let yi = p.y;

        console.log("self.selectedOperand", self.selectedOperand);

        if(this.selectedOperand === "<") {

          if (yi < this.affectedCuttoff) {
            yi = 7;
          } else {
            yi = 3;
          }
        }

        else if(this.selectedOperand === ">") {

          if (yi > this.affectedCuttoff) {
            yi = 7;
          } else {
            yi = 3;
          }
        }

        else if(this.selectedOperand === "<="){
          if (yi <= this.affectedCuttoff) {
            yi = 7;
          } else {
            yi = 3;
          }
        }

        else if(this.selectedOperand === ">="){
          if (yi >= this.affectedCuttoff) {
            yi = 7;
          } else {
            yi = 3;
          }
        }

        let key = p.x.toString() + ',' + yi.toString();

        if(coordsIdMap.hasOwnProperty(key)){
          coordsIdMap[key].push(p["id"]);
        }
        else{
          coordsIdMap[key] = [];
          coordsIdMap[key].push(p["id"]);
        }
      }
    }


    let jitterCoords = {};

    for(let key of Object.keys(coordsIdMap)){
      let value = coordsIdMap[key];

      let s = key.split(',');

      let xi = parseFloat(s[0]);
      let yi = parseFloat(s[1]);

      for(let i = 0; i < value.length; i++) {

          let xOff = self.logJitterMapping[i][0];
          let x = xi + xOff*0.11;

          let yOff = self.logJitterMapping[i][1];
          let y = yi + yOff*1

          jitterCoords[value[i]] = [x,y];
        }

    }

    let jDs = [];

    for(let key of Object.keys(jitterCoords)) {
      let value = jitterCoords[key];
      let x = value[0];
      let y = value[1];
      let id = key;

      let jD = {id: id, x: x, y: y};
      jDs.push(jD);
      }

    return jDs;
    }





  linearJitter(data){

    let coordsIdMap = {};

    for (const i in data) {

      let p = data[i];
      if (p.hasOwnProperty("x") && p.hasOwnProperty("y") && p.hasOwnProperty("id")) {
        let key = p.x.toString() + ',' + p.y.toString();

        if(coordsIdMap.hasOwnProperty(key)){
          coordsIdMap[key].push(p["id"]);
        }
        else{
          coordsIdMap[key] = [];
          coordsIdMap[key].push(p["id"]);
        }
      }
    }


    let jitterCoords = {};

    for(let key of Object.keys(coordsIdMap)){
      let value = coordsIdMap[key];

      let s = key.split(',');

      let xi = parseFloat(s[0]);
      let yi = parseFloat(s[1]);


      if(value.length % 2 === 1){

        let ls = -1*(value.length-1)/2;
        for(let i = 0; i < value.length; i++) {
          let x = xi + ls*0.11;

          jitterCoords[value[i]] = [x,yi];
          ls +=1;
        }
      }
      else if (value.length % 2 === 0){
        let ls = -1*(value.length)/2;
        for(let i = 0; i < value.length; i++) {
          let x = xi + ls*0.1;
          jitterCoords[value[i]] = [x,yi];
          ls +=1;
        }
      }
    }

    let jDs = [];

    for(let key of Object.keys(jitterCoords)) {
      let value = jitterCoords[key];
      let x = value[0];
      let y = value[1];
      let id = key;

      let jD = {id: id, x: x, y: y};
      jDs.push(jD);
    }

    return jDs;
  }



  populateScatterplotData(){
    let self = this;
    if(self.regressionType === "Linear"){
      self.populateLinearScatterplotData();
    }
    else if(self.regressionType === "Logistic"){
      self.populateLogisticScatterplotData();
    }
  }

  translateYtoLogCategories(y){
    console.log(y);
    let yB = [];
    for(let i = 0; i < y.length; i++) {
      if (y[i] < this.affectedCuttoff) {
        yB.push(0);
      }
      else{
        yB.push(1);
      }
    }
    return yB;
  }



  //changed to test logreg predict, need to change back to scaled y
  translateYtoBinary(y){
    console.log(y);
    let yB = [];
    for(let i = 0; i < y.length; i++) {
      if (y[i] <= 7) {
        yB.push(0.3);
      }
      else{
       B.push(2);
      }
    }
    return yB;
  }

  populateLogisticMetrics(xF, yF, xP, yP){

    let self = this;

    let yBF = self.translateYtoLogCategories(yF);

    let xMF = Matrix.columnVector(xF);
    let yMF = Matrix.columnVector(yBF);

    let logregF = new LogisticRegression({numSteps: 1000, learningRate: 5e-3});
    logregF.train(xMF,yMF);

    let yPredF= logregF.predict(xMF);
    self.populateFamilyClassificationMetrics(yBF, yPredF);

    ///////////////////////////////////////////////////////

    let yBP = self.translateYtoLogCategories(yP);

    let xMP = Matrix.columnVector(xP);
    let yMP = Matrix.columnVector(yBP);



    let logregP = new LogisticRegression({numSteps: 1000, learningRate: 5e-3});
    logregP.train(xMP,yMP);

    let yPredP= logregP.predict(xMP);
    self.populateProjectClassificationMetrics(yBP, yPredP);
  }



  populateLogisticScatterplotData(){

    let self = this;

    let jDs = self.logisticJitter(self.data);

    console.log("jDs after jitter", jDs);

    self.scatterplotDataLog = self.mapJitterToData(jDs, self.data);

    console.log("self.scatterplotDataLog", self.scatterplotDataLog);

    self.populateLogisticMetrics(self.xRawF, self.yRawF, self.xRawP, self.yRawP);

  }

  mapJitterToData(jDs, ds){

    let data = ds.slice();
    for(const i in jDs){
      let j = jDs[i];
      for(const i in data){
        let d = data[i];

        if(d.id === parseInt(j.id)){
          d.xSource = j.x;
          d.ySource = j.y;
        }

      }
    }
    return data;

  }


  populateLinearScatterplotData(){

    let self = this;
    let jDs = self.linearJitter(self.data);

    self.scatterplotDataLin = self.mapJitterToData(jDs, self.data);
    self.linePointsLin = self.findLineByLeastSquares(self.xRawF, self.yRawF);

  }



  //Linear regression evaluation metrics

  getProjectPrecision(){
    return this.projectPrecision.toFixed(4);
  }

  getProjectRecall(){
    return this.projectRecall.toFixed(4);
  }

  getProjectF1(){
    return this.projectF1.toFixed(4);
  }

  getProjectAccuracy(){
    return this.projectAccuracy.toFixed(4);
  }

//Linear regression evaluation metrics
  getProjectCorrelation(){
    return this.projectCorrelation.toFixed(4);
  }

  getProjectPVal(){
    return this.projectPVal;
  }


  getProjectPVal(){
    return this.projectPVal;
  }


  getFamilyCorrelationAndPVal(){

    let self = this;

    console.log("self.scatterplotDataLin", self.scatterplotDataLin)

    let familyCorrelation = self.pearsonCorrelation([self.xRawF,self.yRawF], 0, 1);

    //where family correlation is rho
    let ft = fisherTest(familyCorrelation, self.xRawF.length);
    self.familyPVal = ft.pvalue;

    console.log(familyCorrelation, self.familyPVal);

    return [familyCorrelation.toFixed(4), self.familyPVal];

  }


  getFamilyAccuracy(){
    return this.familyAccuracy;
  }

  getFamilyPrecision(){
    return this.familyPrecision;
  }

  getFamilyRecall(){
    return this.familyRecall;
  }

  getFamilyF1(){
    return this.familyF1;
  }










  findLineByLeastSquares(values_x, values_y) {
    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;
    var count = 0;

    /*
     * The above is just for quick access, makes the program faster
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
      throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Above and below cover edge cases
     */
    if (values_length === 0) {
      return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (let i = 0; i< values_length; i++) {
      x = values_x[i];
      y = values_y[i];
      x_sum+= x;
      y_sum+= y;
      xx_sum += x*x;
      xy_sum += x*y;
      count++;
    }

    /*
     * Calculate m and b for the line equation:
     * y = x * m + b
     */
    var m = (count*xy_sum - x_sum*y_sum) / (count*xx_sum - x_sum*x_sum);
    var b = (y_sum/count) - (m*x_sum)/count;

    /*
     * We then return the x and y data points according to our fit
     */
    var result_values_x = [];
    var result_values_y = [];

    for (let i = 0; i < values_length; i++) {
      x = values_x[i];
      y = x * m + b;
      result_values_x.push(x);
      result_values_y.push(y);
    }

    return [result_values_x, result_values_y];


  }

  processRawData(){
    let self = this;

    self.data = [];

    console.log("sampleIds in regression", self.sampleIds);

    for(let i  = 0; i < self.sampleIds.length; i++){

      let af = -1;
      let key = self.sampleIds[i];
      let gt = self.rawGenotypes[key];


      if(gt === "1/1"){
        af = 1;
      }
      else if(gt === "1/0" || gt === "0/1"){
        af = 0.5;
      }
      else if(gt === "0/0"){
        af = 0;
      }
      else{
        console.log("error: could not interpret GT", gt);
        af = "not a number";
      }

      let pt = self.rawPhenotypes[key];

      if(typeof pt === "undefined"){
        pt = "";
      }

      console.log("typeof pt", typeof pt);

      if (pt.includes('>') || pt.includes('<')) {
        pt = pt.slice(-1);
      }

      let x = af;
      let y = parseInt(pt);
      let sex = self.getSexFromSampleId(key);
      let color = self.getColorFromSampleId(key);




      if(typeof af === "number" && typeof parseInt(y) === "number" && !isNaN(y)) {
        let d = {
          x: x,
          y: y,
          id: key,
          sex: sex,
          color: color,
          xSource: null,
          ySource: null,
        }
        self.data.push(d);
      }
      else{
        console.log("did not make data for key, sex, color, x, y",key, sex, color, x, self.rawPhenotypes[key]);
      }
    }

    let x = Object.keys(self.data).map(function(k){return self.data[k].x});
    let y =  Object.keys(self.data).map(function(k){return self.data[k].y});

    self.xRawF = x;
    self.yRawF = y;
  }

  getScatterplotData(){

    let self = this;


    if(self.regressionType === "Linear"){
      return self.scatterplotDataLin;
    }
    else if(self.regressionType === "Logistic"){
      return self.scatterplotDataLog;
    }
  }

  getLinePoints(){
    let self = this;

    if(self.regressionType === "Linear"){
      return self.linePointsLin;
    }
    else if(self.regressionType === "Logistic"){
      return self.linePointsLog;
    }

  }

  calculateProjectPVal(){

    this.populateRawCoords();

    let rho = this.projectCorrelation;

    let ft = fisherTest(rho, this.xRawF.length);

    this.projectPVal = ft.pvalue;



  }

  getSexFromSampleId(id){

    for(let i = 0; i < this.dataset.length; i++){
      if(this.dataset[i].name === id.toString()){
        return this.dataset[i].sex;
      }
    }

    return "U";

  }

  getColorFromSampleId(id){

    for(let i = 0; i < this.dataset.length; i++){
      if(this.dataset[i].name === id.toString()){
        return this.dataset[i].col;
      }
    }

    return "none";

  }

  pearsonCorrelation(prefs, p1, p2) {
    var si = [];

    for (var key in prefs[p1]) {
      if (prefs[p2][key]) si.push(key);
    }

    var n = si.length;

    if (n == 0) return 0;

    var sum1 = 0;
    for (var i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

    var sum2 = 0;
    for (var i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

    var sum1Sq = 0;
    for (var i = 0; i < si.length; i++) {
      sum1Sq += Math.pow(prefs[p1][si[i]], 2);
    }

    var sum2Sq = 0;
    for (var i = 0; i < si.length; i++) {
      sum2Sq += Math.pow(prefs[p2][si[i]], 2);
    }

    var pSum = 0;
    for (var i = 0; i < si.length; i++) {
      pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
    }

    var num = pSum - (sum1 * sum2 / n);
    var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
      (sum2Sq - Math.pow(sum2, 2) / n));

    if (den == 0) return 0;

    return num / den;
  }

}
