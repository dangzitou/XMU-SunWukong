<template>
  <button 
    :class="['global-button', small ? 'global-button-small' : '', inline ? 'global-button-inline' : '']" 
    @tap="handleTap">
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    small: {
      type: Boolean,
      default: false
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleTap(e) {
      this.$emit('tap', e)
    }
  }
}
</script> 