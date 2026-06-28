Component({
  options: {
    multipleSlots: true
  },
  properties: {},
  data: {
    visible: false,
    message: '',
    type: 'success',
    _timer: null
  },
  methods: {
    /**
     * 显示 toast
     * @param {string} message - 提示文字
     * @param {string} [type='success'] - 类型：success / error / warn
     * @param {number} [duration=2000] - 显示时长 (ms)
     */
    show(message, type, duration) {
      this.clearTimer()
      this.setData({
        visible: true,
        message: message || '',
        type: type || 'success'
      })
      const ms = typeof duration === 'number' && duration > 0 ? duration : 2000
      this.data._timer = setTimeout(() => {
        this.hide()
      }, ms)
    },

    /** 隐藏 toast */
    hide() {
      this.clearTimer()
      this.setData({ visible: false })
    },

    clearTimer() {
      if (this.data._timer) {
        clearTimeout(this.data._timer)
        this.data._timer = null
      }
    }
  },
  lifetimes: {
    detached() {
      this.clearTimer()
    }
  }
})
