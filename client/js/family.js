
import pedLine from './pedLine.js'

export default class family {
  constructor(familyID, pedTxt){
    // console.log(pedTxt);
    this.familyID = familyID;
    this.pedTxt = pedTxt;
    this.pedLines = {};

    this.anscestors = [];
    this.descendants = [];


    this.populatePEDLines();
    // console.log(this.pedLines);
  }

  populatePEDLines(){
    let self = this;
    for(let i = 0; i < self.pedTxt.length; i++){
      let line = self.pedTxt[i];
      let pl = new pedLine(line);

      self.pedLines[pl.individualID] = pl;
    }
  }


  getParents(pedLine){

    let self = this;

    let pl = pedLine;
    let parents = [];

    if (self.pedLines.hasOwnProperty(pl.maternalID.toString())) {
      parents.push(self.pedLines[pl.maternalID.toString()]);
    }

    if (self.pedLines.hasOwnProperty(pl.paternalID.toString())) {
      parents.push(self.pedLines[pl.paternalID.toString()]);
    }


    console.log(parents);

    return parents;
  }

  getChildren(pedLine){

  }

  getAllAnscestors(id) {


    let self = this;

    let pl = this.pedLines[id.toString()];
    console.log("getAllAnscestors", pl);

    let parents = [];

    let currentParents = self.getParents(pl);

    console.log("currentParents", currentParents)

    let grandparents = [];

    for(let i = 0; i < currentParents.length; i++) {
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

  pedLinesToIDs(pedLines){
    let ids = [];

    for(let i = 0; i < pedLines.length; i++){
      ids.push(pedLines[i].individualID);
    }

    return ids;

  }

  getAllDescendants(individualID){

  }
}
