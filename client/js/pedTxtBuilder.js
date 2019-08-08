
import HubSession from './HubSession.js'


export default class pedTxtBuilder {
  constructor(launchedFrom, sampleId, projectId, source) {
    this.launchedFrom = launchedFrom;
    this.sampleId = sampleId;
    this.projectId = projectId;
    this.source = source;
    this.hubSession = null;
    this.initHubSession();
  }

  initHubSession() {
    let self = this;
    self.hubSession = new HubSession(self.source);
  }


  sampleToPedTxt(sample) {
    let maternalId = sample.pedigree["maternal_id"];
    let paternalId = sample.pedigree["paternal_id"];
    if (typeof maternalId === "object") {
      maternalId = "0";
    }
    if (typeof paternalId === "object") {
      paternalId = "0";
    }
    let pedLine = sample.pedigree["kindred_id"] + " " + sample.pedigree["sample_id"] + " " + paternalId + " " + maternalId + " " + sample.pedigree["sex"] + "\n";
    return pedLine;
  }

  promiseGetPedTxt() {
    let self = this;
    let pedTxt = "";
    return new Promise((resolve, reject) => {
      self.hubSession.promiseGetProjectSamples(self.projectId)
        .then((data) => {
          // console.log("sample raw data", data);
          const samples = data.data;
          console.log("samples", samples);
          for (let i = 0; i < samples.length; i++) {
            let pedLine = self.sampleToPedTxt(samples[i]);
            pedTxt = pedTxt + pedLine;
          }
          resolve(pedTxt);
        }).catch((e) => {
        console.log(e);
      })
    })
  }

  promiseGetVariantSets(){
    let self = this;
    return new Promise((resolve, reject) => {
      self.hubSession.promiseGetVariantSets(self.projectId)
        .then((data) => {
          // const variantSets = data;
          // console.log("variant sets", variantSets);
          resolve(data);
        }).catch( (e) => {
          console.log("error", e);

      })
    })
  }
}

