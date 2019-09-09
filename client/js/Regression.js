import pearsonCorrelation from "./pearson-correlation.js"

export default class Regression {
  constructor(rawGenotypes, rawPhenotypes) {
    this.rawGenotypes = rawGenotypes;
    this.rawPhenotypes = rawPhenotypes;

    this.correlationMap = {};

    this.correlation = -1;


    this.buildDemoCorrelationMap();

  }


  buildDemoCorrelationMap() {
    let self = this;

    console.log("genotypes", self.rawGenotypes);
    console.log("phenotypes", self.rawPhenotypes);

    let x = [];
    let y = [];

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
        console.log("error: could not interpret GT", gt);
        af = "not a number";
      }

      if(typeof af === "number" && typeof parseInt(pt) === "number") {
        self.correlationMap[key] = [parseFloat(af), parseInt(pt)];
        x.push(parseFloat(af));
        y.push(parseFloat(pt));
      }
    }

    let data = [x,y];

    self.correlation = self.pearsonCorrelation(data, 0 , 1);

    console.log("self.correlation", self.correlation);


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

    console.log("sampleIds in getFamilyCorrelation", sampleIds);

    let self = this;

    let x = [];
    let y = [];

    for(let i  = 0; i < sampleIds.length; i++){

      let af = -1;

      let key = sampleIds[i];

      let gt = self.rawGenotypes[key];
      let pt = self.rawPhenotypes[key];

      console.log("gt", gt);
      console.log("pt", pt);

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

      if(typeof af === "number" && typeof parseInt(pt) === "number") {
        self.correlationMap[key] = [parseFloat(af), parseInt(pt)];
        x.push(parseFloat(af));
        y.push(parseFloat(pt));
      }

    }

    let data = [x,y];

    return self.pearsonCorrelation(data, 0, 1);

  }



}
