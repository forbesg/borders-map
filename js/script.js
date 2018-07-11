(function () {
  var uri = document.baseURI

  var LoadingComponent = Vue.component('LoadingComponent', {
    name: 'loading-component',
    template: `
      <div class="loading">
        <div class="spinner">
          <svg class="lds-blocks" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <rect x="19" y="19" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0s" calcMode="discrete"></animate>
            </rect>
            <rect x="40" y="19" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.125s" calcMode="discrete"></animate>
            </rect>
            <rect x="61" y="19" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.25s" calcMode="discrete"></animate>
            </rect>
            <rect x="19" y="40" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.875s" calcMode="discrete"></animate>
            </rect>
            <rect x="61" y="40" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.375s" calcMode="discrete"></animate>
            </rect>
            <rect x="19" y="61" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.75s" calcMode="discrete"></animate>
            </rect>
            <rect x="40" y="61" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.625s" calcMode="discrete"></animate>
            </rect>
            <rect x="61" y="61" width="20" height="20" fill="#1c4595">
              <animate attributeName="fill" values="#e76a24;#1c4595;#1c4595" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.5s" calcMode="discrete"></animate>
            </rect>
          </svg>
        </div>
      </div>
    `
  })

  var SVGComponent = Vue.component('SVGComponent', {
    name: 'svg-component',
    props: ['childMap', 'mouseover', 'mouseout'],
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
        <g :class="childMap.name">
          <path v-for="path in childMap.paths"
                :data-title="path.title"
                :data-content="path.content"
                :data-region="path.region"
                :d="path.d"
                @mouseenter="mouseover"
                @mouseout="mouseout"
                ></path>
        </g>
      </svg>`
  })

  var mapContainer = Vue.component('MapContainer', {
    name: 'map-container',
    data () {
      return {
        counties: null,
        tooltip: null,
        infoBox: null,
        childMap: null
      }
    },
    props: ['handleLoading'],
    computed: {
      loading () {
        return this.counties ? false : true
      }
    },
    mounted () {
      fetch('' + uri + 'data/counties.json').then(res => {
        return res.json()
      }).then(counties => {
        this.counties = counties
      })

    },
    methods: {

      handleSelectMap (e) {
        // get selected map json svg data
        // Path based on 600 x 600 viewBox
        const county = e.target.parentNode.parentNode.getAttribute('data-tooltip')
        const jsonUrl = `${uri}data/${county.toLowerCase()}.json`

        fetch(jsonUrl).then(res => {
          return res.json()
        }).then(paths => {
          this.childMap = {
            name: county,
            paths
          }
          this.tooltip = null
          window.document.removeEventListener('mousemove', this.positionTooltip)
        })
      },

      handleCloseChildMap () {
        this.childMap = null
      },

      positionTooltip (e) {
        this.tooltip.top = (e.clientY - 50) + 'px';
        this.tooltip.left = (e.clientX - 120) + 'px';
      },

      handleCountyTooltip (tooltip) {
        this.tooltip = {
          text: tooltip,
          top: 0,
          right: 0
        }
        window.document.addEventListener('mousemove', this.positionTooltip)
      },

      handleCloseCountyTooltip () {
        this.tooltip = null
        window.document.removeEventListener('mousemove', this.positionTooltip)
      },

      positionInfoBox (e) {
        if (this.$refs.infoBox) {
          const halfX = window.innerWidth / 2
          const halfY = window.innerHeight / 2
          e.clientX >= halfX ?
            this.infoBox.left = (e.clientX - (this.$refs.infoBox.offsetWidth + 30)) + "px" :
            this.infoBox.left = (e.clientX + 30) + "px"
          e.clientY >= halfY ?
            this.infoBox.top = (e.clientY - (this.$refs.infoBox.offsetHeight + 30)) + "px" :
            this.infoBox.top = (e.clientY + 30) + "px"
        }
      },

      handleMouseOverParish (e) {
        e.target.setAttribute('fill', '#ddd')
        e.target.setAttribute('fill-opacity', '0.1')
        const { title, content, region } = e.target.dataset
        this.infoBox = {
          title,
          content,
          region,
          top: null,
          left: null
        }
        window.document.addEventListener('mousemove', this.positionInfoBox)
      },

      handleMouseOutParish (e) {
        this.infoBox = null
        e.target.removeAttribute('fill')
        e.target.removeAttribute('fill-opacity')
        window.document.removeEventListener('mousemove', this.positionInfoBox)
      }
    },
    components: {
      'svg-component': SVGComponent
    },
    template: `
    <div>
      <loading-component v-if="loading"></loading-component>
      <transition v-else name="fade" mode="out-in">
        <div id="map-container">
          <transition name="fade">
            <span v-if="childMap" id="close-icon" @click="handleCloseChildMap">&times;</span>
          </transition>
          <transition name="popIn" mode="out-in">
            <div v-if="counties && !childMap" class="parent-map" key="parent-map">
              <span class="tooltip" v-if="tooltip" :style="{top: tooltip.top, left: tooltip.left}">{{tooltip.text}}</span>
              <svg xmlns="http://www.w3.org/2000/svg" sodipodi:docname="borders-colour-combine.svg" viewBox="0 0 600 600">
                <g fill-opacity="1" fill-rule="evenodd" stroke="#ddd">
                 <g v-for="(county, index) in counties"
                    :fill="county.fill"
                    :data-tooltip="county.tooltip"
                    @click.prevent="handleSelectMap"
                    @mouseenter="handleCountyTooltip(county.tooltip)"
                    @mouseout="handleCloseCountyTooltip"
                   >
                   <a :href="county.href" :aria-label="county.tooltip">
                     <path
                       :fill="county.path.fill"
                       stroke="#444"
                       stroke-width="0.5"
                       stroke-opacity="0.5"
                       :d="county.path.d"
                       fill-opacity="1"
                       fill-rule="evenodd"
                     ></path>
                   </a>
                 </g>
                </g>
              </svg>
            </div>
            <div v-else class="child-map" key="child-map">
              <svg-component :child-map="this.childMap"
                             :mouseover="handleMouseOverParish"
                             :mouseout="handleMouseOutParish"></svg-component>
            </div>
          </transition>
          <transition name="slideUp">
            <div class="info-box" ref="infoBox" v-if="infoBox" :style="{ top: infoBox.top, left: infoBox.left }">
              <h2>{{infoBox.title}}</h2>
              <p>{{infoBox.content}}</p>
            </div>
          </transition>
        </div> <!-- End Map Container -->
      </transition>
    </div>
    `
  })

  var app = new Vue({
    el: '#app',
    template: `
      <div>
        <header>
          <h2>The Border Counties</h2>
        </header>
        <map-container></map-container>
      </div>
    `,
    components: {
      'mapContainer': mapContainer,
      'loading-component': LoadingComponent
    }
  })
})()
