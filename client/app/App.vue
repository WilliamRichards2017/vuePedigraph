<template>
  <div id="app">
    <v-app>
      <router-view></router-view>
    </v-app>
  </div>
</template>

<script>

  export default {
  name: 'app',
  data() {
    return {
    }
  }
}
</script>

<style lang="scss">
  html, body {margin: 0; height: 100%; overflow: hidden};
</style>
