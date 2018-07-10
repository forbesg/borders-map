(function () {

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

  var app = new Vue({
    el: '#app',
    data: {
      message: 'Test',
      childMapIndex: null,
      counties: null,
      tooltip: null,
      infoBox: null,
      childMap: null
    },
    computed: {
      loading () {
        return this.counties ? false : true
      }
    },
    mounted () {
      fetch('/data/counties.json').then(res => {
        return res.json()
      }).then(counties => {
        console.log(counties);
        this.counties = counties
      })

    },
    methods: {

      handleSelectMap (e) {
        // get selected map json svg data
        // Path based on 600 x 600 viewBox
        const county = e.target.parentNode.parentNode.getAttribute('data-tooltip')
        const jsonUrl = `/data/${county.toLowerCase()}.json`

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
    }
  })
})()
