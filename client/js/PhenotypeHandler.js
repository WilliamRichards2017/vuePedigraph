import PTC from '../static/PTC';
import idMap from '../static/idMap';



export default class PhenotypeHandler {
  constructor() {
    this.PTC = PTC;
    this.idMap = idMap;
    this.replacedIDs = {};
    this.replacePTCIDs();
  }


  replacePTCIDs() {
    let self = this;

    for(let key in self.PTC){
      let newKey = self.idMap[key].split('-')[1].toString();
      self.replacedIDs[newKey] =  [];
      self.replacedIDs[newKey].push(self.PTC[key]);
    }

  }

}


