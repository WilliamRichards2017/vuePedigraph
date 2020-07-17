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

import Qs from 'qs'



import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

Vue.use(VueRouter);
Vue.use(Vuetify);

const routes = [
  {
    path: '/',
    component: Home,
    beforeEnter: (to, from, next) => {

console.log("to", to);
      var idx = to.query.hasOwnProperty("access_token");
      if (idx) {
        let queryParams = Qs.parse(to.query);
        let { access_token, expires_in, token_type, sample_id, project_id, is_pedigree, source, variant_set_id } = queryParams;
        let otherQueryParams = "?sample_id=" + sample_id + "&project_id=" + project_id + "&is_pedigree=" + is_pedigree + "&source=" +source + "&variant_set_id=" + variant_set_id;
        localStorage.setItem('hub-iobio-tkn', token_type + ' ' + access_token);
        next('/' + otherQueryParams);

      } else {
        next();
      }
    },

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
  routes,
  mode: 'history',

});

new Vue({
  el: '#app',
  render: h => h(App),
  router
});
