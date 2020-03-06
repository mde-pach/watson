<template>
  <div class="container">
    <b-field>
      <b-input placeholder="Search in history..." type="search" icon="magnify" icon-clickable v-model="query" />
    </b-field>
    <div class="rows">
      <template v-for="historyItem in historyItems">
        <a :href="historyItem.url" target="_blank">
          <div class="row card">
            <div class="card-content">
              <p class="is-size-6 has-text-weight-bold card-title" v-html="historyItem._formatted.name"></p>
              <div>{{ historyItem.hostname }}</div>
            </div>
          </div>
        </a>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      query: '',
      historyItems: {}
    }
  },
  watch: {
    query(val) {
      this.$meili.Index('test').search(val, {limit: 3, attributesToHighlight: ['name']}).then((response) => {
        this.historyItems = response.hits
      })
    }
  }
}
</script>

<style lang="scss">
@import url("https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css");

.container {
  margin: 1rem !important;
}

.rows {
  display: flex;
  flex-direction: column;
}

.card-header-title {
  font-size: 1rem;
}

.card-content {
  padding: 0.8rem !important;
}

.card-title {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 240px;
  white-space: nowrap;
}

p {
  font-size: 20px;
}

em {
  background-color: #FFFF00;
}
</style>
