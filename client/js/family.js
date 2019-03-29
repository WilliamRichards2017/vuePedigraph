import pedLine from './pedLine.js'

export default class family {
  constructor(familyID, pedTxt) {
    // console.log(pedTxt);
    this.familyID = familyID;
    this.pedTxt = pedTxt;
    this.pedLines = {};
    this.anscestors = [];
    this.descendants = [];
    this.populatePEDLines();
    // console.log(this.pedLines);
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
        grandparents.push(self.pedLines[pl.maternalID.toString()]);
      }

      if (self.pedLines.hasOwnProperty(pl.paternalID.toString())) {
        grandparents.push(self.pedLines[pl.paternalID.toString()]);
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

    let fam = ans.concat(des);

    return fam;
  }


  getChildren(id) {
    let self = this;
    let individualID = parseInt(id);


    let children = [];


    for (var key in self.pedLines) {
      // check if the property/key is defined in the object itself, not in parent
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
      ids.push(pedLines[i].individualID);
    }
    return ids;

  }
}
