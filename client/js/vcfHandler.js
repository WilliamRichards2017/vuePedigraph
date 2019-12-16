



export default class vcfHandler {
  constructor(vcfFile) {
    this.vcfFile = vcfFile;
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


