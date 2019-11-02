
import TAS from '../static/TAS2R38';


export default class GenotypeIdMap {
  constructor() {

    this.GTMap = null;

    this.populateGenotypeIdMap()
  }




  populateGenotypeIdMap() {
    let self = this;


    for(let key in self.PTC){
      // console.log(key, self.PTC[key]);
      let newKey = self.idMap[key].split('-')[1];
      self.replacedIDs[newKey] = self.PTC[key];
    }

  }

}

