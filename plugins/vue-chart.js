import Vue from 'vue'
import { Doughnut, Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

Vue.component('doughnut-chart', {
  extends: Doughnut,
  mixins: [reactiveProp],
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.options)
  }
})

Vue.component('bar', {
  extends: Bar,
  mixins: [reactiveProp],
  props: {
    options: {
      type: Object,
      default: () => {},
      responsive: true,
      maintainAspectRatio: false
    }
  },
  mounted() {
    const ctx = document.getElementById('bar-chart').getContext('2d')
    ctx.canvas.parentNode.style.height = '240px'
    ctx.canvas.parentNode.style.width = '100%'
    ctx.canvas.style.height = '240px'

    this.renderChart(this.chartData, this.options)
  }
})
