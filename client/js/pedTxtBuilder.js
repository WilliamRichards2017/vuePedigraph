
import HubSession from './HubSession.js'


export default class pedTxtBuilder {
  constructor(launchedFrom, sampleId, projectId, variantSetId, source) {
    this.launchedFrom = launchedFrom;
    this.sampleId = sampleId;
    this.projectId = projectId;
    this.variantSetId = variantSetId
    this.source = source;
    this.hubSession = null;
    this.initHubSession();
  }

  initHubSession() {
    let self = this;
    self.hubSession = new HubSession(self.source);
  }


  sampleToPedTxt(sample) {

    if(!sample.pedigree["sample_id"]){
      return -1;
    }

    let maternalId = sample.pedigree["maternal_id"];
    let paternalId = sample.pedigree["paternal_id"];
    if (typeof maternalId === "object" || maternalId === null) {
      maternalId = "0";
    }
    if (typeof paternalId === "object" || paternalId === null) {
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
          const samples = data.data;
          for (let i = 0; i < samples.length; i++) {
            let pedLine = self.sampleToPedTxt(samples[i]);
            if(pedLine !== -1) {
              pedTxt = pedTxt + pedLine;
            }
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
      self.hubSession.promiseGetVariantSets(self.projectId, self.variantSetId)
        .then((data) => {
          // const variantSets = data;
          // console.log("variant sets", variantSets);
          resolve(data);
        }).catch( (e) => {
          console.log("error", e);

      })
    })
  }

  promiseGetProjectSamples(){
    let self = this;
    return new Promise((resolve, reject) => {
      self.hubSession.promiseGetProjectSamples(self.projectId)
        .then((data) => {
          // const variantSets = data;
          // console.log("variant sets", variantSets);
          resolve(data);
        }).catch( (e) => {
        console.log("error", e);
      })
    })
  }


  promiseGetMetricsForProject(){
    let self = this;
    return new Promise((resolve, reject) => {
      self.hubSession.promiseGetMetricsForProject(self.projectId)
        .then((analyses) => {
          // const variantSets = data;
          // console.log("variant sets", variantSets);
          resolve(analyses);
        }).catch( (e) => {
        console.log("error", e);

      })
    })
  }

  promiseGetFilesForProject(){
    let self = this;
    return new Promise((resolve, reject) => {
      self.hubSession.promiseGetFilesForProject(self.projectId)
        .then((data) => {

          resolve(data);
        }).catch( (e) => {
        console.log("error", e);

      })
    })
  }

  promiseGetVariantsForProject(){
    let self = this;
    return new Promise((resolve, reject) => {
      self.hubSession.promiseGetVariantsForProject(self.projectId)
        .then((data) => {
          resolve(data);
        }).catch( (e) => {
        console.log("error", e);

      })
    })
  }

}

