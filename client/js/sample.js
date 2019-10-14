export default class Sample {
  constructor(data) {

    this.data = data;
    this.logSample();

  }

  logSample(){
    console.log("data inside sample", this.data);
  }
}
