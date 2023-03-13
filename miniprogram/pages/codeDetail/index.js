// pages/codeDetail/codeDetail.js

const {
  envList
} = require('../../envList.js');
const db = wx.cloud.database({
  env: envList[0]
})
var app = getApp()
// 在页面中定义激励视频广告
let videoAd = null



Page({

  /**
   * 页面的初始数据
   */
  data: {
    "info": "",
    "project_name": "",
    "price": "",
    "img_path": "",
    "buy_url": ""
  },


  onBuy(e) {
    var that = this
        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
          videoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-c2ab4e350d636eed'
          })
          videoAd.onLoad(() => {
          })
          videoAd.onError((err) => {
            wx.showModal({
              title: '复制到剪贴板',
              content: this.data.buy_url,
              success: function (res) {
                if (res.confirm) { //这里是点击了确定以后
                  wx.setClipboardData({
                    data: that.data.buy_url, //需要复制的内容
                    success: function (res) { //成功回调函数
                      wx.showModal({
                        title: '提示',
                        content: '复制成功',
                        success: function (res) {
                          if (res.confirm) {
                            console.log('确定')
                          } else if (res.cancel) {
                            console.log('取消')
                          }
                        }
                      })
                    }
                  })
                } else { //这里是点击了取消以后
                  console.log('用户点击取消')
                }
              }
            })
          })
          videoAd.onClose((res) => {
            if (res && res.isEnded){
              wx.showModal({
                title: '复制到剪贴板',
                content: this.data.buy_url,
                success: function (res) {
                  if (res.confirm) { //这里是点击了确定以后
                    wx.setClipboardData({
                      data: that.data.buy_url, //需要复制的内容
                      success: function (res) { //成功回调函数
                        wx.showModal({
                          title: '提示',
                          content: '复制成功',
                          success: function (res) {
                            if (res.confirm) {
                              console.log('确定')
                            } else if (res.cancel) {
                              console.log('取消')
                            }
                          }
                        })
                      }
                    })
                  } else { //这里是点击了取消以后
                    console.log('用户点击取消')
                  }
                }
              })
            }else{
              
            }
  
          })
        }
        // 用户触发广告后，显示激励视频广告
        if (videoAd) {
          videoAd.show().catch(() => {
            // 失败重试
            videoAd.load()
              .then(() => videoAd.show())
              .catch(err => {
                console.log('激励视频 广告显示失败')
              })
          })
        }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var project_name = options["projectname"]
    db.collection("projects").where({
      "project_name": project_name
    }).get().then(res => {
      var data = res.data[0]
      this.setData({
        "info": data.info,
        "price": data.price,
        "project_name": data.project_name,
        "img_path": data.img_path,
        "buy_url": data.buy_url
      })
      console.log(data.img_path)
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      //分享的标题
      title: this.data.project_name,
      //分享的路径，也就是你分享的用户点击进入哪个页面
      path: `/pages/codeDetail/index?envId=${envList[0]}&projectname=${this.data.project_name}`
    }
  },
  onShareTimeline: function () {
    return {
      //分享的标题
      title: this.data.project_name,
      //分享的路径，也就是你分享的用户点击进入哪个页面
      path: `/pages/codeDetail/index?envId=${envList[0]}&projectname=${this.data.project_name}`
    }
  }
})