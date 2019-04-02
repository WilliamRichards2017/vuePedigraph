export default class pedLine {
  constructor(opts, cachedGenotype, cachedPhenotype) {
    this.opts = opts;
    this.cachedGenotypes = cachedGenotypes;
    this.cachedPhenotypes = cachedPhenotypes;
    this.generateMockPhenotypes();
    this.generateMockGenotypes();

  }

  generateMockPhenotypes() {
    let self = this;
    self.cachedPhenotypes = [];

    let freq = 0.5;
    for (let i = 0; i < self.opts.dataset.length; i++) {
      let phen = self.mockAffected(freq);
      self.opts.dataset[i].affected = phen;
      self.cachedPhenotypes.push(phen);
      if (self.cachedGenotypes.length > 0) {
        self.opts.dataset[i].alleles = self.cachedGenotypes[i];
      }
    }
  }

  generateMockGenotypes(){
    let self = this;
    self.cachedGenotypes = [];

    for(let i = 0; i < self.opts.dataset.length; i++) {
      let a = self.mockAlleles(0.5);
      self.opts.dataset[i].alleles = a;
      self.opts.dataset[i].affected = self.cachedPhenotypes[i];
      self.cachedGenotypes.push(a);
    }

  }



  mockAffected(threshold) {
    let i = Math.random();

    if (i < threshold) {
      return 2;
    } else {
      return 0;
    }
  }

  mockAlleles(threshold) {

    let alleles = "";

    let a1T = Math.random();
    let a2T = Math.random();

    if (a1T < threshold) {
      alleles += '1/'
    } else {
      alleles += '0/'
    }

    if (a2T < threshold) {
      alleles += '1'
    } else {
      alleles += '0'
    }
    return alleles;

  }
}
