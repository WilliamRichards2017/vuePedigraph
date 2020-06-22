import jQuery from 'jquery'
global.jQuery = jQuery;
global.$ = jQuery;

import axios from 'axios'
import VueAxios from 'vue-axios'


import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueAxios, axios);


import App from './App.vue'
import Home from './components/pages/Home.vue'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

Vue.use(VueRouter);
Vue.use(Vuetify);

const routes = [
  {
    path: '/',
    component: Home,

    props: (route) => ({
      sample_id: route.query.sample_id,
      project_id: route.query.project_id,
      access_token: route.query.access_token,
      token_type: route.query.token_type,
      expires_in: route.query.expires_in,
      is_pedigree: route.query.is_pedigree,
      source: route.query.source,
      variant_set_id: route.query.variant_set_id
    })
  }
];

const router = new VueRouter({
  routes
});

new Vue({
  el: '#app',
  render: h => h(App),
  router
});
