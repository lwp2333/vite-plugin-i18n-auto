<template>
  <div class="container">
    <HelloWorld />
    <ul>
      <li v-for="(item, index) in textMap" :key="index">{{ item }}</li>
    </ul>
    <div title="标题" @click="cnMap.一年级 = '无产者'">
      {{ '立即进入' }}
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import HelloWorld from '@/components/HelloWorld.vue'
@Component({
  name: 'App',
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {
  // 1. 普通字符串值（转换）
  text = '普通字符串'
  cnMap = {
    一年级: '!i18n:一年级/Grade one',
  }
  timeInfo = {
    year: 2022,
    month: 8,
    day: 8,
  }
  textMap: string[] = [
    // 4.1  普通全字符含中文（转换）
    '模版字符串',
    // 4.2 模版字符串 含中文字符，或者其它全是变量且无其它复杂逻辑（函数、运算符什么的）
    `今天是${this.timeInfo.year}年${this.timeInfo.month}月${this.timeInfo.day}日`,
    // 4.3 模版字符串中有函数
    `${this.tempFun('模版中函数的参数')}, 你仍是我的光芒`,
  ]
  created() {
    // 2. 作为条件判断（转换）
    if (this.text === '普通字符串') {
      console.log('===', this.text)
    }
    // 3. 函数参数（转换）
    const funcall = this.tempFun('哈哈哈哈')
    console.log('funcall', funcall)
    // 5.忽略转换标记[!i18n]
    console.log('我是', this.cnMap)
  }
  tempFun(text: string): string {
    return text + '混搭'
  }
}
</script>

<style scoped lang="less">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>

