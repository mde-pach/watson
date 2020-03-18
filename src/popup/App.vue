<template>
  <modal id="watson-search-bar" name="search-bar" class="watson-modal" classes="watson-container" width="40%" height="auto" adaptive @opened="modalOpened" @closed="modalClosed">
    <div class="watson-container">
      <input ref="search" placeholder="Search in your history..." type="search" v-model="query" class="watson-input" @keydown.arrow-up.prevent="arrowUp" @keydown.arrow-down.prevent="arrowDown" @keyup.enter.prevent="keyEnter"/>
      <div id="watson-search-results" class="rows">
        <template v-for="(historyItem, index) in historyItems">
          <a :href="historyItem.url" target="_blank" :title="historyItem.name" >
            <div class="row card" :id="`watson-search-result-card-${index}`" :class='{"active": userItemIndex === index}' @mouseover="userItemIndex = index">
              <div class="card-content">
                <p class="is-size-6 has-text-weight-bold card-title" v-html="historyItem._formatted.name"></p>
                <div class="card-body">
                  <div><img :src="getBrowserImage(historyItem.browser_name)"/> {{ historyItem.hostname }}</div>
                </div>
              </div>
            </div>
          </a>
        </template>
      </div>
    </div>
  </modal>
</template>

<script>
export default {
  data () {
    return {
      isModalActive: true,
      query: '',
      historyItems: [],
      requestedHistoryItemsCount: 0,
      userItemIndex: 0
    }
  },
  watch: {
    async query(val) {
      this.userItemIndex = 0
      this.requestedHistoryItemsCount = 0
      this.historyItems = await this.getNextHistoryItems()
    },
    userItemIndex(val) {
      this.updateScrollPosition()
    }
  },
  mounted() {
    if (this.$refs.search === undefined) {
      this.$modal.show('search-bar')
    }
  },
  methods: {
    modalOpened() {
      var scrollView = document.getElementById('watson-search-results')
      scrollView.addEventListener("scroll", this.scroll)
      this.$refs.search.focus()
    },
    modalClosed() {
      var scrollView = document.getElementById('watson-search-results')
      scrollView.removeEventListener("scroll", this.scroll)
    },
    async arrowUp(event) {
      if (this.userItemIndex > 0) {
        this.userItemIndex--
      }
    },
    async arrowDown(event) {
      if (this.userItemIndex < this.historyItems.length - 1) {
        this.userItemIndex++
        if (this.userItemIndex === this.historyItems.length - 2) {
          if (this.historyItems.length === this.requestedHistoryItemsCount) {
            this.historyItems.push.apply(this.historyItems, await this.getNextHistoryItems())
          }
        }
      }
    },
    keyEnter(event) {
      window.open(this.historyItems[this.userItemIndex].url, '_blank')      
    },
    getNextHistoryItems(limit = 5) {
      let promise = new Promise((resolve, reject) => {
        this.$meili.Index('test').search(this.query, {limit: limit, offset: this.requestedHistoryItemsCount, attributesToHighlight: ['name']}).then((response) => {
          this.requestedHistoryItemsCount += limit
          resolve(response.hits)
        }).catch((error) => {
          reject(error)
        })
      })
      return promise
    },
    async scroll (event) {
      var scrollView = document.getElementById('watson-search-results')
      var element = document.getElementById('watson-search-result-card-0')
      if (scrollView.offsetHeight + scrollView.scrollTop >= scrollView.scrollHeight - (element ? element.offsetHeight : 0)) {
        if (this.historyItems.length === this.requestedHistoryItemsCount) {
          this.historyItems.push.apply(this.historyItems, await this.getNextHistoryItems())
        }
      }
    },
    getBrowserImage(browserName) {
      return browser.extension.getURL(`img/${browserName}.png`)
    },
    updateScrollPosition() {
      // TODO Need to opti that
      var scrollView = document.getElementById('watson-search-results')
      var element = document.getElementById(`watson-search-result-card-${this.userItemIndex}`)
      var scrollViewBottom = scrollView.clientHeight + scrollView.scrollTop
      var elementTop = element.getBoundingClientRect().top - scrollView.getBoundingClientRect().top
      var absoluteElementTop = elementTop + scrollView.scrollTop
      var elementBottom = elementTop + element.clientHeight
      var absoluteElementBottom = elementBottom + scrollView.scrollTop

      if (absoluteElementBottom > scrollViewBottom) {
        scrollView.scrollTo(0, absoluteElementBottom - scrollView.clientHeight)
      }
      if (elementTop < 0) {
        scrollView.scrollTo(0, absoluteElementTop)
      }
    }
  }
}
</script>

<style lang="scss">
.watson-modal {
  // fix z index issue with website with high z index
  z-index: 100000 !important;
  
  .watson-container {
    margin: 0 !important;

    input {
      font-family: "Montserrat", sans-serif !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      -webkit-appearance: searchfield !important;
      background-color: white !important;
      box-shadow: none !important;
      padding: 0 2vw 0 2vw !important;
      font-size: 4vh !important;
      border: none !important;
      outline: none !important;
      height: 10vh !important;
      width: 100% !important;
      border-radius: 5px;
      border-bottom-left-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
      &::-webkit-search-cancel-button {
        -webkit-appearance: searchfield-cancel-button !important;
      }
      &::selection {
        background: #cbeafb !important; /* WebKit/Blink Browsers */
      }
    }

    .rows {
      overflow-y: auto !important;
      width: 100% !important;
      max-height: 50vh !important;
      background-color: white !important;
      color: rgb(81, 81, 81) !important;
      display: flex !important;
      flex-direction: column !important;
      .row {
        margin: 0 !important;
      }
      .card {
        line-height: normal !important;
        border: none !important;
        
        &:hover {
          background-color: #EBEBEB !important;
        }

        .card-header-title {
          font-size: 1rem !important;
        }

        .card-content {
          font-size: 2vh !important;
          width: calc(100% - 4vh) !important;
          font-family: "Montserrat", sans-serif !important;
          color: rgb(81, 81, 81) !important;
          margin: 2vh !important;
          em {
            font-style: normal !important;
            font-weight: 900 !important;
            text-decoration: underline !important;
          }
          p {
            font-size: 3vh !important;
            margin: 0 !important;
          }
        }

        .card-title {
          display: inline-block !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          display: block !important;
          white-space: nowrap !important;
        }

        .card-body {
          display: flex !important;
          justify-content: space-between !important;
          img {
            height: 3vh !important;
            width: auto !important;
          }
        }
      }
      .active {
        background-color: #EBEBEB !important;
        pointer-events: none !important;
      }
    }
  }
}

.disable-hover * {
  pointer-events: none !important;
}

</style>
