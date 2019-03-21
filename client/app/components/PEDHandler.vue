
<template>

  <div id='container' style="margin:50px" align="center">
    <h1 style="color:#123d53;">
      Pedigree Visualizer
    </h1>
    <p>Family IDs</p>
    <form id="dropdown" style="margin-bottom:15px">
      <select id='selectFamily' v-model="selectedFamily">
        <option>Select Family ID</option>
      </select>
    </form>
    <div id="pedigrees"></div>
  </div>
</template>

<script>
  import * as pedigreejs from '../../js/pedigreejs'

  export default {
    name: 'PEDHandler',
    props: ['txt'],
    data() {
      return {
        txtLines: '',
        pedDict: {},
        familyIDs: [],
        selectedFamily : null
      }
    },

    beforeMount() {
      this.splitTxt();
      this.populatePedDict();
      this.populateFamilyIDs();
      this.populateDropdown();
    },

    methods: {

      splitTxt() {
        let self = this;
        self.txtLines = self.txt.split(/\r\n|\n/);
      },

      populatePedDict: function () {
        let self = this;
        for (let i = 0; i < self.txtLines.length; i++) {
          let line = self.txtLines[i];
          let familyID = line.replace(/ .*/, '');

          if (self.pedDict[familyID]) {
            this.pedDict[familyID].push(line);

          } else {
            self.pedDict[familyID] = [];
            self.pedDict[familyID].push(line);
          }
        }
        console.log("pedDict", self.pedDict);
      },
      populateFamilyIDs: function () {
        let self = this;
        for (let key in self.pedDict) {
          if (self.pedDict.hasOwnProperty(key)) {
            self.familyIDs.push(key);
          }
        }
        console.log("first", self.familyIDs);
      },

      populateDropdown: function () {
        let self = this;
        $(document).ready(function () {

          let select = document.getElementById("selectFamily");
          console.log("second", self.familyIDs);
          for (let i = 0; i < self.familyIDs.length; i++) {
            let opt = self.familyIDs[i];
            let el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }
        });
      },

      getDataByFamilyID(id) {
        let self = this;
        let strArr = self.pedDict[id];
        let data = '';
        for (let i = 0; i < strArr.length; i++) {
          data = data.concat(strArr[i] + '\n');
        }
        return data;
      },
    },
    watch : {
      selectedFamily : function(){

        let self = this;
        console.log("inside getOption");

        $('#pedigree').remove();
        $("#pedigrees").append($("<div id='pedigree'></div>"));

        var opts = {
          'targetDiv': 'pedigree',
          'btn_target': 'pedigree_history',
          'width': 800,
          'height': 500,
          'symbol_size': 35,
          'store_type': 'array',
          'diseases': [
            {'type': 'breast_cancer', 'colour': '#F68F35'},
            {'type': 'ovarian_cancer', 'colour': '#4DAA4D'},
            {'type': 'pancreatic_cancer', 'colour': '#4289BA'},
            {'type': 'prostate_cancer', 'colour': '#D5494A'}],
          labels: ['age', 'yob'],
          font_size: '.75em',
          font_family: 'Helvetica',
          font_weight: 700,
          'DEBUG': (pedigree_util.urlParam('debug') !== null),
          'zoomIn': .3,
          'zoomOut': 3.,
        };

        let e = self.getDataByFamilyID(self.selectedFamily);

        opts.dataset = io.readLinkage(e);

        console.log(opts.dataset);

        opts = ptree.build(opts);

      }
    }
  }
</script>

