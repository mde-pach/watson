global.browser = require('webextension-polyfill')
const Meili = require('meilisearch')

const config = {
  host: 'http://0.0.0.0:7700'
}

const meili = new Meili.default(config)

function sendHistoryItem(historyItem, browserName = getBrowserName()) {
  var url = new URL(historyItem.url)
  meili.Index('test').addDocuments([{
    url: url.href,
    name: historyItem.title,
    hostname: url.hostname,
    domain: url.hostname.split(".").slice(-2).join('.'),
    pathname: url.pathname.split(/[\s\/_\-]/).join(" "),
    id: historyItem.id,
    visit_count: historyItem.visitCount,
    browser_name: browserName
  }]).then((response) => {
    // TODO
    console.log(response)
  }).catch((error) => {
    // TODO
    console.log(error)
  })
}

browser.history.onVisited.addListener((historyItem) => {
  sendHistoryItem(historyItem)
})

browser.commands.onCommand.addListener((command) => {
  if (command === "open-search-bar") {
    browser.tabs.insertCSS({
      file: './popup/search-bar.css',
      cssOrigin: 'user'
    })
    browser.tabs.executeScript({
      file: './popup/search-bar.js',
    })
  }
})

browser.runtime.onInstalled.addListener(() => {
  var endDate = Date.now()
  var browserName = getBrowserName()
  browser.history.search({text: "", maxResults: 100}).then((historyItems) => {
    historyItems.forEach((historyItem) => {
      sendHistoryItem(historyItem, browserName)
    })
  })

  // Create meili index
  meili.createIndex({
    name: 'Test',
    uid: 'test',
  }).then((indexe) => {
    // TODO
    console.log(indexe)
  }).catch((error) => {
    // TODO
    console.log(error)
  })
})

function getBrowserName() {
  // Opera 8.0+ (tested on Opera 42.0)
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+ (tested on Firefox 45 - 53)
  var isFirefox = typeof InstallTrigger !== 'undefined';

  // Internet Explorer 6-11
  //   Untested on IE (of course). Here because it shows some logic for isEdge.
  var isIE = /*@cc_on!@*/false || !!document.documentMode;

  // Edge 20+ (tested on Edge 38.14393.0.0)
  var isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1+ (tested on Chrome 55.0.2883.87)
  //
  // This does not work in an extension:
  // var isChrome = !!window.chrome && !!window.chrome.webstore;
  //
  // The other browsers are trying to be more like Chrome, so picking
  // capabilities which are in Chrome, but not in others is a moving
  // target.  Just default to Chrome if none of the others is detected.
  var isChrome = !isOpera && !isFirefox && !isIE && !isEdge;

  if (isChrome) {
    return 'chrome'
  } else if (isEdge) {
    return 'edge'
  } else if (isFirefox) {
    return 'firefox'
  } else if (isOpera) {
    return 'opera'
  } else {
    return undefined
  }
}