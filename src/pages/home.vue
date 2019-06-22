
<style scoped>
.hello{
  font-size: 16px;
}
</style>

<template>
  <div class="hello">
    <h5>Mrhuang</h5>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <polyline points="20,20 40,25 60,40 80,120 120,140 200,180"
      style="fill:none;stroke:black;stroke-width:3" />
    </svg>
  </div>
</template>

<script>
/* eslint-disable */
const debug = require('debug')('js:home')

export default {
  name: 'HelloWorld',
  data () {
    return {
   
    }
  },
  methods:{
  
  },
  created() {
    this.$http.post('/api/test', {})
    .then((res) => {
      debug('res', res);
    })
    .catch((err) => {
      debug('err', err);
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
