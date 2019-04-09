<template>
  <div id='navigation'>
    <nav class="toolbar toolbar--fixed theme--dark" style="margin-top: 0px; padding-right: 0px; padding-left: 0px; transform: translateY(0px);" data-booted="true">
      <v-toolbar-items  class="hidden-sm-and-down" style="padding-top:3px">

        <div class="flex-container">

        <div class="toolbar__title">pedigree.iobio</div>

        <v-select id='selectFamily' v-model="selectedFamily" >
            <option disabled value="">Select a family ID</option>
            <option v-for="family in familyIDs">{{family}}</option>
          </v-select>

          <v-select id="selectPhenotype" v-model="selectedPhenotype">
            <option disabled value="">Select a phenotype</option>
            <option v-for="phenotype in phenotypes">{{phenotype}}</option>
          </v-select>

          <v-select id="selectGenotype" v-model="selectedGenotype">
            <option disabled value="">Select a genotype</option>
            <option v-for="genotype in genotypes">{{genotype}}</option>
          </v-select>
        <v-container fluid>
          <v-switch v-model="isolateFamily" :label="'Isolate Selected Nodes'" color="#253DB9"></v-switch>
        </v-container>
        </div>
      </v-toolbar-items>

    </nav>


  </div>
</template>



<script>

  export default {
    name: 'navigation',

    data() {
      return {}
    }
  }

</script>

<style lang="sass">
  nav.toolbar
    -webkit-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.13), 0px 4px 5px 0px rgba(0, 0, 0, 0.06), 0px 1px 10px 0px rgba(0,0,0,0.12)
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.13), 0px 4px 5px 0px rgba(0, 0, 0, 0.06), 0px 1px 10px 0px rgba(0,0,0,0.12)
    background-color: #153d52 !important
    font-weight: 300 !important
    .toolbar__title
      color: white
      font-weight:  600
      font-size: 24px
      margin-right: 5px
      margin-left: 5px
      padding-bottom: 5px
      min-width: 130px
    .btn
      color: white

</style>

