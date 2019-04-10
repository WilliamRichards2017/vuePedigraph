
import TAS from '../static/TAS2R38';


export default class PhenotypeHandler {
  constructor() {
    this.TAS = TAS;
    this.idMap = idMap;
    this.replacedIDs = {};
    this.replacePTCIDs();

  }

  replacePTCIDs() {
    let self = this;


    for(let key in self.PTC){
      // console.log(key, self.PTC[key]);
      let newKey = self.idMap[key].split('-')[1];
      self.replacedIDs[newKey] = self.PTC[key];
    }

  }

}


