import Vue from 'vue'
import App from './App'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy)

// Browser polyfill
global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

// Meili client
const Meili = require('meilisearch')
const config = {
  host: 'http://192.168.1.50:7700'
}
Vue.prototype.$meili = new Meili.default(config)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
