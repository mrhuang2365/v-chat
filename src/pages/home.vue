
<style scoped>
.hello{
  font-size: 16px;
}
</style>

<template>
  <div class="hello">
    <h5>Mrhuang</h5>
    <svg width="325px" height="325px" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect></rect>
      <path d="M80 80
              A 45 45, 0, 0, 0, 125 125
              L 125 80 Z" fill="green"/>
      <path d="M230 80
              A 45 45, 0, 1, 0, 275 125
              L 275 80 Z" fill="red"/>
      <path d="M80 230
              A 45 45, 0, 0, 1, 125 275
              L 125 230 Z" fill="purple"/>
      <path d="M230 230
              A 45 45, 0, 1, 1, 275 275
              L 275 230 Z" fill="blue"/>
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
    this.$http.post('/api/login/test', {})
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
