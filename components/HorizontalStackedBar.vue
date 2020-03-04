<template>
  <data-view :title="title" :date="date">
    <template v-slot:button>
      <span />
    </template>
    <div class="ChartContainer">
      <svg :width="width" :height="height">
        <g :transform="`translate(${graphMargin}, 0)`">
          <g class="TopLayer" :transform="`translate(${topNode.x}, ${topNode.y})`">>
            <text
                :x="0.5 * topNode.width"
                :y="topNode.height - lineHeight - axisHeight - 2 * axisWeight"
                text-anchor="middle"
                :font-size="`${fontSize}px`"
                :fill="axisColor"
              >{{ topNode.attr }}
            </text>
            <text
                :x="0.5 * topNode.width"
                :y="topNode.height - axisHeight - 2 * axisWeight"
                text-anchor="middle"
                :font-size="`${fontSize}px`"
                :fill="axisColor"
              >{{ `${topNode.value}${unit}` }}
            </text>
            <path
              :d="`M ${0.5 * axisWeight + boxMargin} ${topNode.height - 0.5 * axisWeight} v -${axisHeight} h ${topNode.width - axisWeight - 2 * boxMargin} v ${axisHeight}`"
              :stroke-width="axisWeight"
              :stroke="axisColor"
              :fill="'none'"
            />
          </g>
          <g class="MiddleLayer">
            <g v-for="item in middleNodes" :key="item.x" :transform="`translate(${item.x}, ${item.y})`">
              <rect
                :x="boxMargin"
                :y="boxMargin"
                :width="item.width - 2 * boxMargin"
                :height="item.height - 2 * boxMargin"
                :fill="item.bgColor"
                :stroke="item.borderColor" />
              <text
                :x="0.5 * item.width"
                :y="0.5 * item.height - 0.5 * lineHeight"
                dominant-baseline="middle"
                text-anchor="middle"
                :font-size="`${fontSize}px`"
                :fill="item.fgColor"
              >{{ item.attr }}</text>
              <text
                :x="0.5 * item.width"
                :y="0.5 * item.height + 0.5 * lineHeight"
                dominant-baseline="middle"
                text-anchor="middle"
                :font-size="`${fontSize}px`"
                :fill="item.fgColor"
              >{{ `${item.value}${unit}` }}</text>
            </g>
          </g>
          <g class="BottomLayer">
            <g v-for="item in bottomNodes" :key="item.x" :transform="`translate(${item.x}, ${item.y})`">
              <text
                  :x="0.5 * item.width"
                  :y="axisHeight + 2 * axisWeight + lineHeight"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  :font-size="`${fontSize}px`"
                  :fill="axisColor"
                >{{ item.attr }}
              </text>
              <text
                  :x="0.5 * item.width"
                  :y="axisHeight + 2 * axisWeight + 2 * lineHeight"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  :font-size="`${fontSize}px`"
                  :fill="axisColor"
                >{{ `${item.value}${unit}` }}
              </text>
              <path
                :d="`M ${0.5 * axisWeight + boxMargin} ${0.5 * axisWeight} v ${axisHeight} h ${item.width - axisWeight - 2 * boxMargin} v -${axisHeight}`"
                :stroke-width="axisWeight"
                :stroke="axisColor"
                :fill="'none'"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  </data-view>
</template>

<style lang="scss">
</style>

<script>
import DataView from '@/components/DataView.vue'
import * as d3 from 'd3'

export default {
  components: { DataView },
  data() {
    return {
      width: 400
    }
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    fontSize: {
      type: Number,
      default: 14
    },
    lineHeight: {
      type: Number,
      default: 18
    },
    chartData: {
      type: Object,
      default: () => {}
    },
    height: {
      type: Number,
      default: 240
    },
    date: {
      type: String,
      default: ''
    },
    bgColors: {
      type: Array,
      default: () => {return ['#00A040', '#FFFFFF', '#FFFFFF']}
    },
    borderColors: {
      type: Array,
      default: () => {return ['#00A040', '#00A040', '#00A040']}
    },
    fgColors: {
      type: Array,
      default: () => {return ['#FFFFFF', '#00A040', '#00A040']}
    },
    axisColor: {
      type: String,
      default: '#4D4D4D'
    },
    boxMargin: {
      type: Number,
      default: 2
    },
    graphMargin: {
      type: Number,
      default: 10
    },
    axisHeight: {
      type: Number,
      default: 7
    },
    axisWeight: {
      type: Number,
      default: 4
    },
    unit: {
      type: String,
      default: ''
    }
  },
  computed: {
    graphWidth() {
      return this.width - 2 * this.graphMargin
    },
    total() {
      return this.chartData.value
    },
    xScale() {
      return d3.scaleLinear().range([0, this.graphWidth]).domain([0, this.total])
    },
    yScale() {
      return d3.scaleBand().range([0, this.height]).domain([0])
        .paddingOuter(1.2)
    },
    bgColorScale() {
      return d3.scaleOrdinal().range(this.bgColors).domain(d3.range(this.bgColors.length))
    },
    fgColorScale() {
      return d3.scaleOrdinal().range(this.fgColors).domain(d3.range(this.fgColors.length))
    },
    borderColorScale() {
      return d3.scaleOrdinal().range(this.borderColors).domain(d3.range(this.borderColors.length))
    },
    topNode() {
      return {
        attr: this.chartData.attr,
        value: this.chartData.value,
        x: 0,
        y: 0,
        width: this.graphWidth,
        height: this.yScale(0)
      }
    },
    middleNodes() {
      var nodes = []
      var x = 0
      const self = this
      this.chartData.children.forEach(function(d1, i) {
        if (d1.children !== undefined) {
          d1.children.forEach(function(d2) {
            nodes.push({
              attr: d2.attr,
              value: d2.value,
              x: x,
              y: self.yScale(0),
              width: self.xScale(d2.value),
              height: self.yScale.bandwidth(),
              bgColor: self.bgColorScale(i),
              fgColor: self.fgColorScale(i),
              borderColor: self.borderColorScale(i)
            })
            x += self.xScale(d2.value)
          })
        } else {
          nodes.push({
            attr: d1.attr,
            value: d1.value,
            x: x,
            y: self.yScale(0),
            width: self.xScale(d1.value),
            height: self.yScale.bandwidth(),
            bgColor: self.bgColorScale(i),
            fgColor: self.fgColorScale(i),
            borderColor: self.borderColorScale(i)
          })
          x += self.xScale(d1.value)
        }
      })
      return nodes
    },
    bottomNodes() {
      var nodes = []
      var x = 0
      const self = this
      this.chartData.children.forEach(function(d, i) {
        if (d.children !== undefined) {
          nodes.push({
            attr: d.attr,
            value: d.value,
            x: x,
            y: self.yScale(0) + self.yScale.bandwidth(),
            width: self.xScale(d.value),
            height: self.height - (self.yScale(0) + self.yScale.bandwidth()),
          })
        }
        x += self.xScale(d.value)
      })
      return nodes
    }
  },
  created() {
    console.log(this.chartData)
    let self = this
    this.$nextTick().then(function() {
      self.width = d3.select(self.$el).select('div.ChartContainer').node().clientWidth
    })
  },
  methods: {
    computeBBox(s) {
      console.log(this)
      console.log(this.$el)
    }
  }
}
</script>
