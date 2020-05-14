import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import env from '../../config/dev.env.var'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: null,
    tileLayerRetval: null,
    vectorTileInstance: null,
    markerInstance: null,
    initialTileStyle : {
      color: "green",
      fill: true,
      fillColor: "green"
    },
    coord: null,
    weatherList: null

  },
  mutations: {
    setMap (state, map) {
      state.map = map
    },
    addLayer (state, L) {
      L.addTo(state.map)
    },
    setVectorTileInstance(state, vectorTileInstance){
      state.vectorTileInstance = vectorTileInstance
    },
    setWeatherInfo(state,data){
      state.coord = data.city.coord
      state.weatherList = data.list
    },
    addMarkers (state, L) {
      L.addTo(state.map)
    },
    setMarkerInstance(state, L){
      state.markerInstance = L
    },
    removeMarker(state){
      state.map.removeLayer(state.markerInstance)
    }
  },
  actions: {
    fetchWeather(context){
      axios.get(env.localAPI+"/weather")
      .then(res => {
        context.commit("setWeatherInfo",res.data.data)
      })
    }
  }
})
