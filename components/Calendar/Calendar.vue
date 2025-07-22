<template>
  <view class="calendar-wrapper">
    <view class="calendar-header">
      <view class="calendar-nav">
        <button @click="prevMonth" class="nav-btn">‹</button>
        <view class="current-month">{{ currentYear }}年{{ currentMonth }}月</view>
        <button @click="nextMonth" class="nav-btn">›</button>
      </view>
    </view>
    
    <view class="calendar-body">
      <view class="weekdays">
        <view class="weekday" v-for="day in weekdays" :key="day">{{ day }}</view>
      </view>
      
      <view class="days-grid">
        <view 
          class="day-item"
          :class="{
            'selected': isSelected(day),
            'today': isToday(day),
            'disabled': isDisabled(day),
            'other-month': day.otherMonth
          }"
          v-for="day in calendarDays" 
          :key="day.date"
          @click="selectDate(day)"
        >
          {{ day.day }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Calendar',
  props: {
    value: {
      type: [String, Date],
      default: ''
    },
    minDate: {
      type: [String, Date],
      default: ''
    },
    maxDate: {
      type: [String, Date],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      selectedDate: '',
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    calendarDays() {
      const year = this.currentYear
      const month = this.currentMonth
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      const firstDayWeek = firstDay.getDay()
      const daysInMonth = lastDay.getDate()
      
      const days = []
      
      // 添加上个月的日期
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        const prevMonthDays = new Date(prevYear, prevMonth, 0).getDate()
        days.push({
          day: prevMonthDays - i,
          date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`,
          otherMonth: true
        })
      }
      
      // 添加当前月的日期
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          day,
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          otherMonth: false
        })
      }
      
      // 添加下个月的日期
      const remainingDays = 42 - days.length
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        days.push({
          day,
          date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          otherMonth: true
        })
      }
      
      return days
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          const date = new Date(val)
          this.currentYear = date.getFullYear()
          this.currentMonth = date.getMonth() + 1
          this.selectedDate = val
        }
      },
      immediate: true
    }
  },
  methods: {
    prevMonth() {
      if (this.currentMonth === 1) {
        this.currentMonth = 12
        this.currentYear--
      } else {
        this.currentMonth--
      }
    },
    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentMonth = 1
        this.currentYear++
      } else {
        this.currentMonth++
      }
    },
    selectDate(day) {
      if (this.disabled || day.otherMonth || this.isDisabled(day)) {
        return
      }
      
      this.selectedDate = day.date
      this.$emit('input', day.date)
      this.$emit('change', day.date)
    },
    isSelected(day) {
      return this.selectedDate === day.date
    },
    isToday(day) {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      return day.date === todayStr
    },
    isDisabled(day) {
      if (this.minDate && day.date < this.minDate) return true
      if (this.maxDate && day.date > this.maxDate) return true
      return false
    }
  }
}
</script>

<style scoped>
.calendar-wrapper {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.calendar-header {
  margin-bottom: 16px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
}

.current-month {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.weekdays {
  display: flex;
  margin-bottom: 8px;
}

.weekday {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-item {
  width: 14.28%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.day-item:hover {
  background: #f0f0f0;
}

.day-item.selected {
  background: #007aff;
  color: #fff;
}

.day-item.today {
  color: #007aff;
  font-weight: 600;
}

.day-item.today.selected {
  color: #fff;
}

.day-item.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.day-item.other-month {
  color: #ccc;
}

.day-item.disabled:hover {
  background: transparent;
}
</style>
