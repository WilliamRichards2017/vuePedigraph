import jQuery from 'jquery'
global.jQuery = jQuery
global.$ = jQuery
import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App.vue'
import Home from './components/pages/Home.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Home,
  }
]

const router = new VueRouter({
  routes
})

new Vue({
  el: '#app',
  render: h => h(App),
  router
})
