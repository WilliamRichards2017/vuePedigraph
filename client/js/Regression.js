import pearsonCorrelation from "./pearson-correlation.js"
import Correlation from "js-polynomial-regression/src/Correlation";
import {fisherTest} from "fisher-transform";
import LogisticRegression from "ml-logistic-regression";
import Matrix from "ml-matrix";



export default class Regression {
  constructor(rawGenotypes, rawPhenotypes, regressionType, dataset) {
    this.rawGenotypes = rawGenotypes;
    this.rawPhenotypes = rawPhenotypes;

    this.regressionType = regressionType;

    this.dataset = dataset;


    this.projectCorrelation = -1;
    this.projectPVal = -1;


    this.scatterplotData = null;
    this.linePoints = null;

    this.x = null;
    this.y = null;

    this.famX = null;
    this.famY = null;

    this.polyModel = null;
    this.regressionData = null;
    this.terms = null;




    this.buildXandY();
    this.calculateProjectCorrelation();
    this.calculateProjectPVal();

  }


  buildXandY() {
    let self = this;

    // console.log("this.rawGenotypes", self.rawGenotypes);
    // console.log("this.rawPhenotypes", self.rawPhenotypes);

    // console.log("genotypes", self.rawGenotypes);
    // console.log("phenotypes", self.rawPhenotypes);

    self.x = [];
    self.y = [];

    console.log("self.dataset", self.dataset);

    for (let key in self.rawGenotypes) {

      let af = -1;


      let gt = self.rawGenotypes[key];
      let pt = self.rawPhenotypes[key];
      let sex = self.getSexFromSampleId(key);

      // console.log("gt", gt);
      // console.log("pt", pt);

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
          self.x.push(parseFloat(af));
          self.y.push(parseInt(pt));
        }
      }
      else{
        console.log("could not interpret PT", pt);
      }
    }
  }

  calculateProjectCorrelation(){


    let self = this;

    console.log("self.regressionType", self.regressionType);



    if(self.regressionType === "Linear") {
      let data = [self.x,self.y];


        self.projectCorrelation = self.pearsonCorrelation(data, 0, 1);
    }

    else if(self.regressionType === 'Logistic') {




      // self.regressionData = [rx,ry];


    }
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

  getFamilyCorrelation(sampleIds) {

    let self = this;

    let x = [];
    let y = [];
    let ids = [];
    let sexes = [];
    let colors = [];

    for(let i  = 0; i < sampleIds.length; i++){

      let af = -1;

      let key = sampleIds[i];

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



    let tempDat = [];

    for (let i = 0; i < x.length; i++){

      let d = {
        x : x[i],
        y : y[i],
        id : ids[i],
        sex: sexes[i]
      };
      tempDat.push(d);
    }



    self.linePoints = self.findLineByLeastSquares(x, y);



    let toggle = false;
    //jitter x by hand
    for(let i = 0; i < x.length; i++){
      for(let j = 0; j < x.length; j++){
        if(x[i] === x[j] && y[i] === y[j] && i !== j){

          if(toggle) {
            x[j] += 0.1;
            toggle=!toggle;
          }
          else{
            x[j] -= 0.1;
            toggle = !toggle;
          }

        }
      }
    }

    self.scatterplotData = [x,y,ids, sexes, colors];


    let familyCorrelation = -1;
    let familyPVal = -1;
    if(self.regressionType === "Linear"){
      console.log("linear Regression selected");
      familyCorrelation = self.pearsonCorrelation(self.scatterplotData, 0, 1);


      let rho = familyCorrelation;

      let ft = fisherTest(rho,x.length);
      familyPVal = ft.pvalue;

    }
    else if(self.regressionType === "Logistic"){

      // console.log("Polynomial Regression selected");
      //
      // console.log("x,y", x, y);

      console.log("x,y", x, y);


      let xM = Matrix.columnVector(x);

      let yM = Matrix.columnVector([0,0,0,1,1,1,1,1,1,1,1]);

      let tM = Matrix.columnVector([1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);


      let logreg = new LogisticRegression({numSteps: 10000, learningRate: 5e-3});

      logreg.train(xM,yM);


      var finalResults = logreg.predict(tM);

      console.log("final Results", finalResults);


      if(isNaN(familyCorrelation)){
        familyCorrelation = 0;
      }

    }
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

    let ft = fisherTest(rho, this.x.length);

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

}
