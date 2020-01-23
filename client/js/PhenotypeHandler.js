import PTC from '../static/PTC';
import androstenone from '../static/androstenone.js'
import asparagus from '../static/asparagus.js'
import idMap from '../static/idMap';
import linkIdMap from '../static/linkIdMap.js'



export default class PhenotypeHandler {
  constructor() {
    this.PTC = PTC;
    this.androstenone = androstenone;
    this.asparagus = asparagus;
    this.idMap = idMap;
    this.linkIdMap = linkIdMap
    this.replacedIDs = {};
    this.smellIds = {};
    this.replacePTCIDs();
  }


  replacePTCIDs() {
    let self = this;

    for (let key in self.PTC) {
      let newKey = self.idMap[key].split('-')[1].toString();
      self.replacedIDs[newKey] = [];
      self.replacedIDs[newKey].push(self.PTC[key]);
    }

    for (let key in self.androstenone) {
      let newKey = self.idMap[key].split('-')[1].toString();
      if (self.replacedIDs.hasOwnProperty(newKey)) {
        if (self.androstenone.hasOwnProperty(key)) {
          if (self.androstenone[key] !== null) {
            self.replacedIDs[newKey].push(self.androstenone[key].toString());
          } else {
            self.replacedIDs[newKey].push("nan");
          }
        }
      } else {
        self.replacedIDs[newKey] = ["nan", "nan", "nan"];
      }
    }


    for (let key in self.asparagus) {

      let newKey = self.linkIdMap[key].toString();

      if(self.replacedIDs.hasOwnProperty(newKey)) {

        let val = self.asparagus[key];

        if(val === "Yes"){
          val = 1.99;
        }
        else if(val === "No"){
          val = 0.01;
        }
        else{
          val = 1;
        }

        self.replacedIDs[newKey].push(val);
      }
      else{
        self.replacedIDs[newKey] = ["nan", "nan", "nan"];
      }
    }
    for (let key in self.replacedIDs) {
      if (self.replacedIDs[key].length < 3) {
        // self.replacedIDs[key] =
      }
    }
  }
}
