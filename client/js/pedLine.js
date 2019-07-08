export default class pedLine{
  constructor(line){
    this.line = line;
    this.familyID = -1;
    this.individualID = -1;
    this.maternalID = -1;
    this.paternalID = -1;
    this.sexID = -1;
    this.sex = 'unknown';
    this.phenotype = null;
    this.genotype = null;

    this.isRoot = false;
    this.isLeaf = false;
    this.parseSex();
    this.populateLine();
  }

  rebuildTxt(){
    let self = this;

    self.line = '';
    self.line = self.line + self.familyID;
    self.line = self.line + ' ' + self.individualID;
    self.line = self.line + ' ' + self.paternalID;
    self.line = self.line + ' ' + self.maternalID;
    self.line = self.line + ' ' + self.sexID;
  }


  populateLine(){
    let self = this;

    let cols = self.line.split(/(\s+)/).filter(function (e) {
      return e.trim().length > 0;
    });

    // self.familyID = parseInt(cols[0]);
    // self.individualID = parseInt(cols[1]);
    // self.paternalID = parseInt(cols[2]);
    // self.maternalID = parseInt(cols[3]);
    // self.sexID = parseInt(cols[4]);

    self.familyID = cols[0];
    self.individualID = parseInt(cols[1]);
    self.paternalID = parseInt(cols[2]);
    self.maternalID = parseInt(cols[3]);
    self.sexID = parseInt(cols[4]);


    if(self.maternalID === 0 && self.paternalID === 0){
      self.isRoot = true;
    }
  }

  parseSex(){
    let self = this;
    if(self.sexID === 1){
      self.sex = 'male';
    }
    else if (this.sexID === 2){
      self.sex = 'female';
    }
  }
}


