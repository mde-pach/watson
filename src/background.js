global.browser = require('webextension-polyfill')
const Meili = require('meilisearch')

const config = {
  host: 'http://0.0.0.0:7700'
}

const meili = new Meili.default(config)

function sendHistoryItem(historyItem) {
  var url = new URL(historyItem.url)
  meili.Index('test').addDocuments([{
    url: url.href,
    name: historyItem.title,
    hostname: url.hostname,
    domain: url.hostname.split(".").slice(-2).join('.'),
    pathname: url.pathname.split(/[\s\/_\-]/).join(" "),
    id: historyItem.id,
    visit_count: historyItem.visitCount
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
      file: 'search-bar.css',
      cssOrigin: 'user'
    })
    browser.tabs.executeScript({
      file: 'search-bar.js',
    })
  }
})

browser.runtime.onInstalled.addListener(() => {
  var endDate = Date.now()
  browser.history.search({text: "", maxResults: 100}).then((historyItems) => {
    historyItems.forEach((historyItem) => {
      sendHistoryItem(historyItem)
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
