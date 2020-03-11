<template>
  <modal id="watson-search-bar" name="search-bar" class="watson-modal" classes="watson-container" width="40%" height="auto" adaptive @opened="modalOpened" @closed="modalClosed">
    <div class="watson-container">
      <input ref="search" placeholder="Search in your history..." type="search" v-model="query" class="watson-input"/>
      <div class="rows" @keyup="changeItem" @mouseover="isActiveClassEnable = false">
        <template v-for="(historyItem, index) in historyItems">
          <a :href="historyItem.url" target="_blank">
            <div class="row card" :class='{"active": isActiveClassEnable === true && currentItem === index}'>
              <div class="card-content">
                <p class="is-size-6 has-text-weight-bold card-title" v-html="historyItem.name"></p>
                <div>{{ historyItem.hostname }}</div>
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
      historyItems: {},
      currentItem: 0,
      isActiveClassEnable: true
    }
  },
  watch: {
    query(val) {
      this.$meili.Index('test').search(val, {limit: 3, attributesToHighlight: ['name']}).then((response) => {
        this.historyItems = response.hits
      }).catch((error) => {
        console.log(error)
      })
    }
  },
  mounted() {
    if (this.$refs.search === undefined) {
      this.$modal.show('search-bar')
    }
  },
  methods: {
    modalOpened() {
      document.addEventListener("keyup", this.changeItem)
      this.$refs.search.focus()
    },
    modalClosed() {
      document.removeEventListener("keyup", this.changeItem)
    },
    changeItem(event) {
      if (this.cleanActiveClass === false) {
        this.isActiveClassEnable = true
      }
      if (event.code == 'ArrowDown' && this.currentItem < this.historyItems.length - 1) {
          this.currentItem++
      } else if (event.code == 'ArrowUp' && this.currentItem > 0) {
          this.currentItem--
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
      width: 100% !important;
      background-color: white !important;
      color: rgb(81, 81, 81) !important;
      display: flex;
      flex-direction: column;
      .row {
        margin: 0 !important;
      }
      em {
        font-weight: 900;
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
      }
      .active {
        background-color: #EBEBEB !important;
      }
    }
  }
}

</style>
