<style scoped>
.hello{
  font-size: 16px;
}
</style>

<template>
  <div class="hello">
    <h5>Mrhuang</h5>
    <yd-cell-group class="mt03" :class="error">
      <yd-cell-item>
        <yd-input
          slot="right"
          :show-required-icon="false"
          v-model="phone"
          required
          ref="phone"
          regex="mobile"
          max="11"
          :on-blur = 'checkval(phone,"phone")'
          placeholder="请输入手机号码"
        ></yd-input>
      </yd-cell-item>
      <p slot="bottom" style="color:#F00;padding: 0 .3rem;text-align:right;" v-html="nameMessage"></p >
      </yd-cell-group>
    <img src="/api/test1" alt="">
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome',
      error: '',
      phone: '',
      input1: '',
      input2: '',
      nameMessage: ''
    }
  },
  methods:{
   checkval(e,name){
      let that = this;
      setTimeout(function() {
        switch (name) {
          case "phone":
            if(that.$refs.phone.errorMsg != ''){
                 that.error = 'error'
                 that.nameMessMessage = '真实姓名'+that.$refs.phone.errorMsg;
            }else{
                 that.error = ''
                 that.nameMessMessage = ''
            }
            break
        }
      }, 1);
    },
  },
  created() {
    this.$http.post('/api/test', { name: 'huang' })
    .then((data) => {
      console.log('---------', data);      
    })
    .catch((err) => {
      console.log(err);
    });
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
