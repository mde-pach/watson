<template>
  <modal id="watson-search-bar" name="search-bar" class="watson-modal" classes="watson-container" width="40%" height="auto" adaptive @opened="modalOpened" @closed="modalClosed">
    <div class="watson-container">
      <input ref="search" placeholder="Search in your history..." type="search" v-model="query" class="watson-input"/>
      <div id="watson-search-results" class="rows" @keyup="changeItem" @mouseover="isActiveClassEnable = false">
        <template v-for="(historyItem, index) in historyItems">
          <a :href="historyItem.url" target="_blank">
            <div class="row card" :id="`watson-search-result-card-${index}`" :class='{"active": isActiveClassEnable === true && userItemIndex === index}'>
              <div class="card-content">
                <p class="is-size-6 has-text-weight-bold card-title" v-html="historyItem._formatted.name"></p>
                <div class="card-body">
                  <div>{{ historyItem.hostname }}</div>
                  <div>from {{ historyItem.browser_name }}</div>
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
      userItemIndex: 0,
      isActiveClassEnable: true
    }
  },
  watch: {
    async query(val) {
      this.userItemIndex = 0
      this.requestedHistoryItemsCount = 0
      this.historyItems = await this.getNextHistoryItems(val)
    },
    userItemIndex(val) {
      // TODO Need to opti that
      var scrollView = document.getElementById('watson-search-results')
      var element = document.getElementById(`watson-search-result-card-${val}`)
      var scrollViewBottom = scrollView.clientHeight + scrollView.scrollTop
      var elementTop = element.getBoundingClientRect().top - scrollView.getBoundingClientRect().top
      var elementBottom = elementTop + element.clientHeight
      
      if (!(elementTop >= 0 && elementBottom <= scrollView.clientHeight)) {
        var offset = elementBottom - scrollView.clientHeight
        if (offset < 0) {
          var offset = elementTop
        }
        scrollView.scrollBy({top: Math.ceil(offset)})
      }
    }
  },
  mounted() {
    if (this.$refs.search === undefined) {
      this.$modal.show('search-bar')
    }
  },
  methods: {
    modalOpened() {
      document.addEventListener("keydown", this.changeItem)
      this.$refs.search.focus()
    },
    modalClosed() {
      document.removeEventListener("keydown", this.changeItem)
    },
    async changeItem(event) {
      if (event.code == 'ArrowDown') {
        event.preventDefault()
        if (this.isActiveClassEnable === false) {
          this.isActiveClassEnable = true
        } else if (this.userItemIndex < this.historyItems.length - 1) {
          this.userItemIndex++
        }
      } else if (event.code == 'ArrowUp') {
        event.preventDefault()
        if (this.isActiveClassEnable === false) {
          this.isActiveClassEnable = true
        } else if (this.userItemIndex > 0) {
          this.userItemIndex--
        }
      }
      if (this.userItemIndex >= this.historyItems.length - 2) {
        this.historyItems.push.apply(this.historyItems, await this.getNextHistoryItems(this.query))
      }
    },
    getNextHistoryItems(queryString, limit = 5) {
      let promise = new Promise((resolve, reject) => {
        this.$meili.Index('test').search(queryString, {limit: limit, offset: this.requestedHistoryItemsCount, attributesToHighlight: ['name']}).then((response) => {
          this.requestedHistoryItemsCount += limit
          resolve(response.hits)
        }).catch((error) => {
          reject(error)
        })
      })
      return promise
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
      display: flex;
      flex-direction: column;
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
          font-size: 1rem;
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
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          white-space: nowrap;
        }

        .card-body {
          display: flex;
          justify-content: space-between;
        }
      }
      .active {
        background-color: #EBEBEB !important;
        pointer-events: none;
      }
    }
  }
}

</style>
