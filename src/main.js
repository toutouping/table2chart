import Vue from 'vue';
import Element from 'element-ui'; // 引入element-ui组件
import 'element-ui/lib/theme-chalk/index.css'; // 引入element-ui的样式
import App from 'src/App.vue';

Vue.config.productionTip = false;  // 关闭生产模式下给出的提示

Vue.use(Element);

new Vue({
  el: '#app', //  相当于 new Vue({}).$mount('#app');
  template: '<App/>', // 1、可以通过在 #app 内加入<app></app>替代 2、或者 通过 render: h => h(App) 渲染一个视图，然后提供给el挂载
  components: { // vue2中可以通过 render: h => h(App) 渲染一个视图，然后提供给el挂载
    App
  }
});
