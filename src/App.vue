<template>
  <div id="app">
    <lmap class='map' />
  </div>
</template>

<script>
import lmap from './components/Map'

export default {
  name: 'app',
  components: {
    lmap
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
