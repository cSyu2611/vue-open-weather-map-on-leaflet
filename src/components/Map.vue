<template>
  <section class="container">
    <div id="map"></div>
    <table v-if="sharedState.weatherList" id="weather-table" border="1">
      <tr>
        <th>日時</th>
        <th>最低気温</th>
        <th>最高気温</th>
        <th>天気</th>
      </tr>
      <tr v-for="(list, index) in sharedState.weatherList" :key="index">
        <th>
          <input
            type="radio"
            name="date"
            :value="String(index) + '@' + list.weather[0].main"
            v-model="weather"
          />{{ list.dt_txt }}
        </th>
        <td>
          {{ (list.main.temp_min - 273.15).toFixed(2) }}
        </td>
        <td>
          {{ (list.main.temp_max - 273.15).toFixed(2) }}
        </td>
        <td>
          {{ list.weather[0].main }}
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid";
import env from "../../config/dev.env.var";
import clearIcon from "@/assets/clear.png";
import cloudIcon from "@/assets/cloud.png";
import rainIcon from "@/assets/rain.png";

export default {
  name: "Map",
  components: {},
  data() {
    return {
      weather: null
    };
  },
  mounted() {
    Promise.all([this.drawMap()]).then(() => {
      this.renderShape();
      this.$store.dispatch("fetchWeather");
    });
  },
  computed: {
    sharedState() {
      return this.$store.state;
    }
  },
  methods: {
    drawMap() {
      const osmtile = L.tileLayer("//{s}.tile.osm.org/{z}/{x}/{y}.png", {
        zIndex: 1,
        attribution:
          '&copy; <a href="//osm.org/copyright">OpenStreetMap</a> contributors'
      });
      const gsistdtile = L.tileLayer(
        "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
        {
          zIndex: 1,
          attribution:
            "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
        }
      );
      const map = L.map("map", {
        center: [34.504085, 133.350024],
        zoom: 11,
        layers: [osmtile],
        zoomControl: false,
        minZoom: 6,
        maxZoom: 17,
        gestureHandling: true,
        preferCanvas: true,
        scrollWheelZoom: false
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      const mapObj = document.getElementById("map");
      mapObj.addEventListener("focus", () => {
        map.scrollWheelZoom.enable();
      });
      mapObj.addEventListener("blur", () => {
        map.scrollWheelZoom.disable();
      });

      L.control.scale({ imperial: false }).addTo(map);

      L.control
        .layers({
          OpenStreetMap: osmtile,
          "国土地理院 - 標準地図": gsistdtile
        })
        .addTo(map);
      this.$store.commit("setMap", map);
    },
    renderShape() {
      const vectorLayer = L.vectorGrid.protobuf(
        env.tileServer + "/data/fukuyama/{z}/{x}/{y}.pbf",
        {
          rendererFactory: L.canvas.tile,
          getFeatureId: function(f) {
            return String(f.properties["KEY_CODE"]);
          },
          zIndex: 3,
          interactive: true,
          vectorTileLayerStyles: {
            fukuyama: this.sharedState.initialTileStyle
          }
        }
      );
      vectorLayer.on("click", e => {
        vectorLayer.bindPopup(e.layer.properties["MOJI"]);
      });
      vectorLayer.on("popupopen", e => {
        vectorLayer.setFeatureStyle(e.layer.properties["KEY_CODE"], {
          fill: true,
          fillColor: "red",
          color: "green"
        });
      });
      vectorLayer.on("popupclose", e => {
        vectorLayer.setFeatureStyle(
          e.layer.properties["KEY_CODE"],
          this.sharedState.initialTileStyle
        );
      });
      this.$store.commit("setVectorTileInstance", vectorLayer);
      this.$store.commit("addLayer", vectorLayer);
    },
    renderWeatherIcon(weather) {
      var icon_id;
      var disc;
      switch (weather.split("@")[1]) {
        case "Clear":
          icon_id = clearIcon;
          disc = "晴れ";
          break;
        case "Clouds":
          icon_id = cloudIcon;
          disc = "曇り";
          break;
        case "Rain":
          icon_id = rainIcon;
          disc = "雨";
          break;
        default:
          icon_id = null;
          disc = null;
      }
      var popup1 = L.popup().setContent("<h1>" + disc + "</h1><p>");
      var markerIcon = L.icon({
        iconUrl: icon_id,
        iconRetinaUrl: icon_id,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, 0]
      });
      const mark = L.marker(
        [this.sharedState.coord.lat, this.sharedState.coord.lon],
        { icon: markerIcon },
        { draggable: false }
      ).bindPopup(popup1);
      this.$store.commit("addMarkers", mark);
      this.$store.commit("setMarkerInstance", mark);
    }
  },
  watch: {
    weather: function(newval, oldval) {
      if (oldval != null) {
        Promise.all([this.$store.commit("removeMarker")]).then(() => {
          this.renderWeatherIcon(newval);
        });
      } else {
        this.renderWeatherIcon(newval);
      }
    }
  }
};
</script>

<style scoped>
#map {
  height: 800px;
  width: 50%;
  margin: auto;
  position: "absolute";
  float: left;
}

#weather-table {
  margin: auto;
}
</style>
