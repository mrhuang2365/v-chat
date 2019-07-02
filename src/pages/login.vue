<style lang="scss" scoped>
$primary:#2d8cf0;

.login-contnet{
  width: 100%;
  height: 100%;
  background-image: url('/static/img/2.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  overflow: hidden;
}
.note{
  position: absolute;
  bottom: 10px;
  color: white;
  text-align: center;
  width: 100%;
}
.registerMode{
  height: 530px!important;
}
.login-card{
  width: 500px;
  height: 500px;
  margin: 100px auto 0 auto;

  .title{
    display: flex;
    align-items: flex-end;
    // justify-content: center;
    font-weight: 600;
    border-bottom: 1px solid $primary;
    padding-bottom: 5px;

    .title1{
      font-size: 40px;
    }
    .title2{
      font-size: 35px;
    }
  }
}
.login-body{
  padding-top: 20px;
  .code-item{
    display: flex;
    // margin-top: 20px;
    // align-items: center

    .img{
      height: 50px;
      margin-left: 50px;
      margin-top: -10px;
    }
  }
}
.form-item{
  margin: 30px 0;
  padding-right: 60px;
}
.button-item{
  width: 320px;
  margin: 0 auto;
}

.remember-item{
  display: flex;
  justify-content: flex-start;
  margin: 20px 0 20px 80px;
}
.login-register-text{
  text-align: center;
  margin-top: 20px;
  span{
    cursor: pointer;
  }
}
</style>

<template>
  <div class="login-contnet">
    <Card class="login-card" :class="{registerMode: !login}">
      <div class="title">
        <div class="title1">Mr.</div>
        <div class="title2">huang</div>
      </div>
      <div class="login-body">
        <Form ref="formValidate" :model="userInfo" :rules="ruleValidate" :label-width="80">
          <FormItem label="账号:" prop="name" class="form-item">
            <Input v-model="userInfo.name" placeholder="请输入账号" :maxlength="16" size="large" />
          </FormItem>
          <FormItem label="密码:" prop="pwd" class="form-item">
            <Input v-model="userInfo.pwd" type="password" size="large" :minlength="6" :maxlength="16" placeholder="请输入6-16位密码"
            @keyup.enter.native="login ? signIn() : signUp()" />
          </FormItem>
          <FormItem v-if="!login" label="确认密码:" prop="pwd1" class="form-item">
            <Input v-model="userInfo.pwd1" type="password" size="large" :minlength="6" :maxlength="16" placeholder="请再次输入密码"
              @keyup.enter.native="login ? signIn() : signUp()"/>
          </FormItem>
          <FormItem label="验证码:" prop="code" class="form-item">
            <div class="code-item">
              <Input style="width:150px" v-model="userInfo.code" size="large" placeholder="请输入验证码"
                @keyup.enter.native="login ? signIn() : signUp()" />
              <div class="img" @click="getCapt()" v-html="captSvg"></div>
            </div>
          </FormItem>
          <div class="remember-item" v-if="login">
            <Checkbox v-model="remember">记住账号</Checkbox>
          </div>
          <div class="button-item">
            <Button type="primary" style="position:relative" v-if="login" long @click="signIn()">登录
              <Spin size="large" fix v-if="loading"></Spin>
            </Button>
            <Button type="primary" style="position:relative" v-else long @click="signUp()">注册
              <Spin size="large" fix v-if="loading"></Spin>
            </Button>
          </div>
        </Form>
        <!--  -->
        <div class="login-register-text">
          <span v-if="login" @click="reset(false)">立即注册</span>
          <span v-else @click="reset(true)">使用已有账号登录</span>
        </div>
      </div>
    </Card>
    <div class="note">
      Power By @Mrhuang2365 email:13809415342@sina.cn
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
const crypto = require('crypto-js');
const _d = require('debug')('js:login');

export default {
  data(){
    return {
      userInfo:{
        name: 'admin',
        pwd: 'huang123',
        pwd1: '',
        code: '',
      },
      loading: false,
      login:true,
      remember:false,
      ruleValidate:{
        name: { required: true, message: '请输入账号名', trigger: 'blur' },
        pwd: { required: true, validator: this.validatePwd, trigger: 'blur' },
        pwd1: { required: true, validator: this.validatePwd1, trigger: 'blur' },
        code: { required: true, message: '请输入验证码', trigger: 'blur' },
      },
      captSvg:null,
    }
  },
  methods:{
    ...mapActions('login', ['accountLogin']),
    reset(v){
      this.login = v;
      this.$refs.formValidate.resetFields();
    },
    validatePwd(rule, value, callback){
      if (value === '') {
        callback(new Error('请输入您的密码'));
      } else if ( value.length < 6 ) {
        callback(new Error('密码太短了!'));
      } else {
        callback();
      }
    },
    validatePwd1(rule, value, callback){
      if (value === '') {
        callback(new Error('请再次输入您的密码'));
      } else if (value !== this.userInfo.pwd) {
        callback(new Error('两次输入的密码不一致!'));
      } else {
        callback();
      }
    },
    initRememberStatus(){
      if (localStorage.userName) {
        this.userInfo.name = localStorage.userName
        this.remember = true
      }
    },
    // 登录
    signIn(){
      this.$refs.formValidate.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          const password = crypto.MD5(this.userInfo.pwd).toString();
          const data = {
            name: this.userInfo.name,
            password: password,
            code: this.userInfo.code,
          }
          try {
            await  this.accountLogin({vm:this, data})            
          } catch (error) {
            
          }
          this.loading = false;
        } else {

        }
      })
    },
    async onSignUp(){
      this.loading = true;
      try {
        const password = crypto.MD5(this.userInfo.pwd).toString();
        const data = {
          name: this.userInfo.name,
          password: password,
          code: this.userInfo.code,
        }
        await this.$http.post('/api/login/signUp', data)
        this.$Message.success('注册成功，赶快登录吧');
        this.reset(true);
        this.getCapt();
      } catch (error) {
      }
      this.loading = false;
    },
    signUp(){
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          this.onSignUp();
        } else {
          
        }
      })
    },
    async getCapt(){
      try {
        const res = await this.$http.post('/api/login/getCapt', {});
        this.captSvg = res.body;
      } catch (error) {
        _d('getCapt, error', error)
      }
    }
  },
  created(){
    this.initRememberStatus();
    this.getCapt();
  }
}
</script>
