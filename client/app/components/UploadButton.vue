<template>
  <upload-btn
    @file-update="update"
  >

  </upload-btn>
</template>

<script>
  import UploadButton from 'vuetify-upload-button'

  export default {
    methods: {
      update (file) {
        console.log(file);
      }
    },
    components: {
      'upload-btn': UploadButton
    }
  }
</script>
