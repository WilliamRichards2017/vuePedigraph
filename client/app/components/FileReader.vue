<template>
  <label class="text-reader">
    <input type="file" @change="loadTextFromFile" accept=".txt, .ped" style="color:transparent;" onchange="this.style.color = 'black';"  size="35">
  </label>
</template>
<script>
  export default {
    name: 'text-reader',
    methods: {
      loadTextFromFile(ev) {
        const file = ev.target.files[0];
        const reader = new FileReader();

        reader.onload = e => this.$emit("load", e.target.result);
        reader.readAsText(file);
      }
    }
  };
</script>

