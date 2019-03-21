<template>
  <div>
  <PEDHandler :txt=txt />
  </div>
</template>

<script>


  import txt from '../../../static/ped.js';

import PEDHandler from "./../PEDHandler.vue";
export default {
  name: 'home',
  components: {PEDHandler},
  // component: {},
  props: [],
  data() {
    return {
      txt : txt
    }
  },
  methods: {

  }
}
</script>
