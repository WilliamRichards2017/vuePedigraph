<template>
  <label class="VCFReader">
    <input type="file" @change="loadTextFromFile" accept=".txt, .vcf" style="color:transparent;" onchange="this.style.color = 'black';">
  </label>
</template>
<script>
  export default {
    name: 'VCFReader',
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

