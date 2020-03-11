// content.js
import Vue from 'vue';
import App from './popup/App';
import Buefy from 'buefy'
// import 'buefy/dist/buefy.css'
import vmodal from 'vue-js-modal'


if (document.getElementById('watson-search-bar') === null) {
  const app = document.createElement('div');
  app.id = 'app';
  document.body.prepend(app);

  Vue.use(Buefy)
  Vue.use(vmodal)

  // Browser polyfill
  global.browser = require('webextension-polyfill')
  Vue.prototype.$browser = global.browser

  // Meili client
  const Meili = require('meilisearch')
  const config = {
    host: 'http://0.0.0.0:7700'
  }
  Vue.prototype.$meili = new Meili.default(config)

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    render: h => h(App)
  })    
}