import pedLine from './pedLine.js'

export default class family {
  constructor(familyID, pedTxt) {
    // console.log(pedTxt);
    this.familyID = familyID;
    this.pedTxt = pedTxt;
    this.pedLines = {};
    this.populatePEDLines();
    this.zeroOutParents();
  }

  rebuildTxt(pedLine){
    let line = '';
    line = line + pedLine.familyID;
    line = line + ' ' + pedLine.individualID;
    line = line + ' ' + pedLine.paternalID;
    line = line + ' ' + pedLine.maternalID;
    line = line + ' ' + pedLine.sexID + ' 0';
    return line;
  }

  famToTxt(){
    let self = this;

    let txt = '';
    for(let key in self.pedLines){
      let line = self.pedLines[key];
      let lineTxt = self.rebuildTxt(line);
      txt = txt + lineTxt + '\n';
    }
    return txt;
  }

  zeroOutParents(){
    let self = this;
    for (let key in self.pedLines) {
      let MI = self.pedLines[key].maternalID;
      let PI = self.pedLines[key].paternalID;

      if(! (MI===0) ){
        if (!(self.pedLines.hasOwnProperty(MI))) {
          self.pedLines[key].maternalID = 0;
          self.pedLines[key].line = self.rebuildTxt(self.pedLines[key]);
        }
      }

      if(! (PI===0) ){
        if (! (self.pedLines.hasOwnProperty(PI))) {
          self.pedLines[key].paternalID = 0;
          self.pedLines[key].line = self.rebuildTxt(self.pedLines[key]);
        }
      }
    }
  }

  populatePEDLines() {
    let self = this;
    for (let i = 0; i < self.pedTxt.length; i++) {
      let line = self.pedTxt[i];
      let pl = new pedLine(line);

      self.pedLines[pl.individualID] = pl;
    }
  }

  getParents(pedLine) {
    let self = this;
    let pl = pedLine;
    let parents = [];

    if (self.pedLines.hasOwnProperty(pl.maternalID.toString())) {
      parents.push(self.pedLines[pl.maternalID.toString()]);
    }

    if (self.pedLines.hasOwnProperty(pl.paternalID.toString())) {
      parents.push(self.pedLines[pl.paternalID.toString()]);
    }
    return parents;
  }

  getAllSpouses(id){

    let self = this;
    let spouses = [];

    let children = self.getChildren(id);

    for(let i = 0; i < children.length; i++){
      if(! (children[i].maternalID.toString() === id.toString())) {
        if (!spouses.includes(children[i].maternalID.toString())) {
          spouses.push(children[i].maternalID.toString());
        }
      }
      else if(! (children[i].paternalID.toString() === id)){
        if (!spouses.includes(children[i].paternalID.toString())) {
          spouses.push(children[i].paternalID.toString());
        }
      }
    }
    return spouses;

  }


  getAllAnscestors(id) {
    let self = this;
    let pl = this.pedLines[id.toString()];
    let parents = [];
    let currentParents = self.getParents(pl);
    let grandparents = [];

    for (let i = 0; i < currentParents.length; i++) {
      let pl = currentParents[i];
      console.log(pl);

      if (self.pedLines.hasOwnProperty(pl.maternalID.toString())) {
        grandparents.push(self.pedLines[pl.maternalID]);
      }

      if (self.pedLines.hasOwnProperty(pl.paternalID.toString())) {
        grandparents.push(self.pedLines[pl.paternalID]);
      }
    }


    parents = currentParents.concat(grandparents);
    let anscestorIDs = this.pedLinesToIDs(parents);

    return anscestorIDs;
  }

  getFamily(id){

    let self = this;
    let ans = self.getAllAnscestors(id);
    let des = self.getAllDescendants(id);
    let spouses = self.getAllSpouses(id);
    let fam = spouses.concat(ans.concat(des).concat(id));
    return fam;
  }


  getChildren(id) {
    let self = this;
    let individualID = parseInt(id);

    let children = [];

    for (var key in self.pedLines) {
      if (self.pedLines.hasOwnProperty(key)) {
        if(self.pedLines[key].maternalID == individualID || self.pedLines[key].paternalID == individualID){
          children.push(self.pedLines[key])
        }
      }
    }
    return children;
  }

  getAllDescendants(individualID) {
      let self = this;
      let children = self.getChildren(individualID);

      let currentChildren = self.getChildren(individualID);
      let grandChildren = [];

      for (let i = 0; i < currentChildren.length; i++) {
        let pl = currentChildren[i];
        let gc = self.getChildren(currentChildren[i].individualID);
        grandChildren = grandChildren.concat(gc);
      }
      children = children.concat(grandChildren);
      let descendantIDs = this.pedLinesToIDs(children);

      return descendantIDs;
  }

  pedLinesToIDs(pedLines) {
    let ids = [];
    for (let i = 0; i < pedLines.length; i++) {
      ids.push(pedLines[i].individualID.toString());
    }
    return ids;
  }
}
