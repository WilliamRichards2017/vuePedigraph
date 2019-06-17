<template>
  <div id="wrapper">
  <PEDHandler :txt="txt" :sample_id="sample_id" :project_id="project_id" :access_token="access_token" :token_type="token_type" :expires_in="expires_in" :is_pedigree="is_pedigree" :source="source"
  />
  </div>
</template>

<script>


  import txt from '../../../static/ped.js';

import PEDHandler from "./../PEDHandler.vue";
export default {
  name: 'home',
  components: {PEDHandler},
  // component: {},
  props: {
    sample_id: null,
    project_id: null,
    access_token: null,
    token_type: null,
    expires_in: null,
    is_pedigree: null,
    source: null
  },
  data() {
    return {
      txt : txt
    }
  },
  methods: {

  }
}
</script>

<style>
  #wrapper {
    height: 100%;
  }
</style>
