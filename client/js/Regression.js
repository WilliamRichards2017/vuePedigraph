import pearsonCorrelation from "./pearson-correlation.js"
import Correlation from "js-polynomial-regression/src/Correlation";
import {fisherTest} from "fisher-transform";
import LogisticRegression from "ml-logistic-regression";
import Matrix from "ml-matrix";



export default class Regression {
  constructor(rawGenotypes, rawPhenotypes, regressionType, dataset, sampleIds) {
    this.rawGenotypes = rawGenotypes;
    this.rawPhenotypes = rawPhenotypes;

    this.regressionType = regressionType;

    this.dataset = dataset;
    this.sampleIds = sampleIds;


    this.projectCorrelation = -1;
    this.projectPVal = -1;

    this.projectPrecision = -1;
    this.projectRecall = -1;
    this.projectF1 = -1


    this.scatterplotDataLin = null;
    this.scatterplotDataLog = null;
    this.linePointsLin = null;

    this.xRaw = null;
    this.yRaw = null;


    this.xLog = null;
    this.yLog = null;

    this.sourceXLin = null;
    this.sourceYLin = null;

    this.sourceXLog = null;
    this.sourceYLog = null;

    this.regressionData = null;



    this.populateRawCoords();
    this.populateLinearScatterplotData();
    // this.populateLogCoords();

    this.calculateProjectCorrelation();
    this.calculateProjectPVal();

  }




  populateRawCoords() {
    let self = this;

    self.xRaw = [];
    self.yRaw = [];

    console.log("self.dataset", self.dataset);

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
          self.xRaw.push(parseFloat(af));
          self.yRaw.push(parseInt(pt));
        }
      }
      else{
        console.log("could not interpret PT", pt);
      }
    }
  }

  calculateProjectCorrelation(){


    let self = this;

    console.log("self.rawX", self.xRaw, self.yRaw)


    self.projectCorrelation = self.pearsonCorrelation([self.xRaw, self.yRaw], 0, 1);

  }

  populateLinearScatterplotData(){

    let self = this;

    let x = [];
    let y = [];
    let ids = [];
    let sexes = [];
    let colors = [];

    for(let i  = 0; i < self.sampleIds.length; i++){

      let af = -1;
      let key = self.sampleIds[i];
      let gt = self.rawGenotypes[key];
      let pt = self.rawPhenotypes[key];
      let sex = self.getSexFromSampleId(key);
      let color = self.getColorFromSampleId(key);


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

      if(typeof af === "number" && typeof parseInt(pt) === "number" && !isNaN(pt)) {
        x.push(parseFloat(af));
        y.push(parseInt(pt));
        ids.push(key);
        sexes.push(sex);
        colors.push(color);
      }
    }


    let toggle = false;

    let xSource = x.slice(-1);

    //jitter x by hand
    //Todo: handle cases for large overlaps
    for(let i = 0; i < x.length; i++){
      for(let j = 0; j < x.length; j++){
        if(x[i] === x[j] && y[i] === y[j] && i !== j){

          if(toggle) {
            xSource[j] += 0.1;
            toggle=!toggle;
          }
          else{
            xSource[j] -= 0.1;
            toggle = !toggle;
          }

        }
      }
    }

    self.scatterplotDataLin = [x,y,ids, sexes, colors, xSource];
    self.linePointsLin = self.findLineByLeastSquares(x, y);

  }

  getFamilyCorrelation() {

    let self = this;
    let familyCorrelation = self.pearsonCorrelation(self.scatterplotDataLin, 0, 1);

    //where family correlation is rho
    let ft = fisherTest(familyCorrelation, self.xRaw.length);
    let familyPVal = ft.pvalue;

    return [familyCorrelation, familyPVal];
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

  getScatterplotData(){

    let self = this;

    if(self.regressionType === "Linear"){
      return self.scatterplotDataLin;
    }
    else if(self.regressionType === "Polynomial"){
      return self.scatterplotDataLog;
    }
    return self.scatterplotData;
  }

  getLinePoints(){
    let self = this;

    if(self.regressionType === "Linear"){
      return self.linePoints;
    }
    else if(self.regressionType === "Polynomial"){
      return self.regressionData;
    }

  }

  calculateProjectPVal(){

    let rho = this.projectCorrelation;

    let ft = fisherTest(rho, this.xRaw.length);

    this.projectPVal = ft.pvalue;

    console.log("fisher test", ft);

    console.log("project pval", this.projectPVal);


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
