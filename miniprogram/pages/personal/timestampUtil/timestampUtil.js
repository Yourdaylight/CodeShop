// pages/personal/timestampUtil/timestampUtil.js
import {
  format
} from '../../../utils/util';
Page({
    data: {
      timestamp: '',
      result: '',
      date: '',
      currentTimestamp: "",
      inputDate:""
    },

    onInput(event) {
      this.setData({
        timestamp: event.detail.value,
        inputDate:""
      })
    },

    onInputDate(event) {
      this.setData({
        inputDate: event.detail.value,
        timestamp:""
      })
    },

    onConvert() {
      const timestamp = this.data.timestamp
      const dateStr = this.data.date
      if (!timestamp && !dateStr) {
        wx.showToast({
          title: '请输入时间戳或日期',
          icon: 'none'
        })
        return
      }
      if (timestamp) {
        let date = new Date(parseInt(timestamp))
        if(timestamp.length<13){
        date = new Date(parseInt(timestamp) * 1000)
        }
        this.setData({
          result: format(date,"yyyy-MM-dd HH:mm:ss")
        })
      } else {
        const date = new Date(dateStr)
        const timestamp = Math.floor(date.getTime() / 1000)
        this.setData({
          result: timestamp.toString()
        })
      }
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  updateCurrentTime() {
    const now = new Date()
    const currentTimestamp = Math.floor(now.getTime() / 1000).toString()
    const date = format(now,"yyyy-MM-dd HH:mm:ss")
    this.setData({
      currentTimestamp,
      date
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.updateCurrentTime()
    setInterval(() => {
      this.updateCurrentTime()
    }, 1000)
  },

  copyContent: function (e) {
    let copied = e.currentTarget.dataset.copied
    if(typeof copied==='number'){
      copied = copied.toString()
    }
    wx.setClipboardData({
      data:copied, //需要复制的内容
      success: function (res) { //成功回调函数
        wx.showToast({
          title: '内容已复制！',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})