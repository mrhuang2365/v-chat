# 项目介绍

#### 期望
* 移动端：基于vue+node+websocket实现端聊天功能，支持账号创建、登录、添加好友、创建群聊、私聊、关注等功能
* pc端：管理系统：聊天室、账号等
* 新玩法：未来增加 游戏娱乐 模块，开发h5小游戏

#### 技术栈
* 后台：node + express + mongodb + websocket
* 后台服务管理：pm2
* 前端：vue + vuex + vue-router + websocket
>* [pm2 点这里](http://pm2.keymetrics.io/docs/usage/quick-start/)
>* [mongodb 安装点这里](https://www.mongodb.com/download-center/community)
>* [mongodb node语法点这里](http://mongodb.github.io/node-mongodb-native/3.3/api/)

#### Development Setup
* 项目地址：https://github.com/mrhuang2365/v-chat
```sh
# clone project
git clone git@github.com:mrhuang2365/mrhuang.git
# install deps
npm install
# 后台启动
DEBUG=js* node ./service/index.js
或者
DEBUG=js* pm2 start ./service/index.js --watch ./service
# 前端打包
npm run build
# 前端启动
npm run dev
```


#### 说明
>* 该项目仅作为个人技术实现和分享
>* 期待大家的参与
>* 如何联系作者？
  * 邮箱：13809415342@sina.cn
  * 微信：
  <img src="./static/img/mrhuang.jpg" width="200"/>

## License

[MIT](http://opensource.org/licenses/MIT)
