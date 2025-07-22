// filepath: components/node/node.vue
<template>
  <view class="node-wrapper">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'node',
  props: {
    tag: String,
    attrs: Object,
    continue: Number
  }
}
</script>