import PTC from '../static/PTC';
import idMap from '../static/idMap';



export default class PhenotypeHandler {
  constructor() {
    this.PTC = PTC;
    this.idMap = idMap;
    this.replacedIDs = {};
    this.replacePTCIDs();
    console.log(this.replacedIDs);
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


