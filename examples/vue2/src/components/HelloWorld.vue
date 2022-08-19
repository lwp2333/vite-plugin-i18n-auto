<template>
  <div class="container">
    {{ text }}
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'HelloWorld',
})
export default class App extends Vue {
  text = '你好，世界'
  created() {}
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
