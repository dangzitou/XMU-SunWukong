<template>
  <view class="time-picker-wrapper">
    <picker 
      mode="time" 
      :value="time" 
      @change="onTimeChange"
      :disabled="disabled"
    >
      <view class="time-display">
        {{ displayTime || placeholder }}
      </view>
    </picker>
  </view>
</template>

<script>
export default {
  name: 'time-picker',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择时间'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      default: 'HH:mm'
    }
  },
  data() {
    return {
      time: ''
    }
  },
  computed: {
    displayTime() {
      return this.time || this.value
    }
  },
  watch: {
    value: {
      handler(val) {
        this.time = val
      },
      immediate: true
    }
  },
  methods: {
    onTimeChange(e) {
      const time = e.detail.value
      this.time = time
      this.$emit('input', time)
      this.$emit('change', time)
    }
  }
}
</script>

<style scoped>
.time-picker-wrapper {
  width: 100%;
}

.time-display {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
}

.time-display:empty {
  color: #999;
}
</style>
