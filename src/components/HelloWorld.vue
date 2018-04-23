<template>
  <div class="hello">
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome'
    }
  },
  created() {
    this.$http.post('/api', { name: 'huang' })
    .then((data) => {
      console.log('---------', data);      
    })
    .catch((err) => {
      console.log(err);
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
