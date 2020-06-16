import idMap from '../static/idMap.js';
import PTC from '../static/PTC';




export default class mapToCsv {
  constructor(phenotypes) {
    this.phenotypes = PTC;
    this.idMap = idMap;
    this.replacedIDs = {};
    this.csv = "";
    this.replacePTCIDs();
    this.populateCsv();
  }

  getCsv(){
    return this.csv;
  }

  populateCsv(){
    let self = this;
    for(let key in self.replacedIDs){
      self.csv = self.csv + key + ',' + self.replacedIDs[key] + '\n';
    }

  }

  replacePTCIDs() {
    let self = this;

    for(let key in self.phenotypes){
      let newKey = self.idMap[key].split('-')[1].toString();
      self.replacedIDs[newKey] =  [];
      self.replacedIDs[newKey].push(self.phenotypes[key]);
    }

  }

}
