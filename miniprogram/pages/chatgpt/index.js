// index.js
// const app = getApp()
const {
  envList
} = require('../../envList.js');
const db = wx.cloud.database({
  env: envList[0]
})
// const db = getApp().globalData.db
console.log(getApp().globalData)
// pages/home/home.js

var app = getApp()
let videoAd = null
Page({

  data: {
    isloading: false,
    infoMess: '',
    content: '请输入',
    chatname: '',
    url: "https://programtree.cloud/chat?programtree=r_h&prompt=1",
    messages: []
  },

  getContent: function (content) {
    this.setData({
      content: content.detail.value
    })
  },

  
  // 发送消息
  loginBtnClick: function () {
    var that = this;
    var content = that.data.content.trim();
    if (content == "") {
      return;
    }
    var message = {
      name: "我",
      content: content,
      type: "you"
    };
    that.data.messages.push(message);
    that.setData({
      messages: that.data.messages,
      content: ""
    });
    if (that.data.messages.length>3){
        // 在页面onLoad回调事件中创建激励视频广告实例
        wx.showModal({
          title: '温馨提示',
          content: "受限于api访问能力，若要继续当前对话需要观看广告;也可以点击界面清除按钮开启新一轮对话",
          success: function (res) {
            if (res.confirm) { //这里是点击了确定以后
              if (wx.createRewardedVideoAd) {
                videoAd = wx.createRewardedVideoAd({
                  adUnitId: 'adunit-c2ab4e350d636eed'
                })
                videoAd.onLoad(() => {
      
                })
                videoAd.onError((err) => {})
                videoAd.onClose((res) => {
                  if (res && res.isEnded){
                    that.sendChat()
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
            } else { //这里是点击了取消以后
              console.log('用户点击取消')
            }
          }
        })

    }else{
      that.sendChat()
    }

  },

  sendChat:function(){
    let that = this
    wx.showLoading({
      title: '正在加载...',
    })
    wx.request({
      url: that.data.url,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        "question": this.data.messages
      },
      success: function (res) {
        console.log(res)
        let resp = res.data
        var message = {
          name: "ChatGPT",
          content: "服务器繁忙。请退出后重试",
          type: "me"
        };
 
        wx.hideLoading();
        if (resp.code===200){
          message.content = resp.data.answer
          that.data.messages.push(message);
          that.setData({
            messages: that.data.messages
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        })
      }
    })
  },

  //重置按钮点击事件
  resetBtnClick: function (e) {
    this.setData({
      infoMess: '',
      content: '',
      chatname: '',
      messages:[]
    })

  },
  onShareAppMessage: function (res) {
    return {
      //分享的标题
      title: '一颗程序树 智能问答',
      //分享的路径，也就是你分享的用户点击进入哪个页面
      path: '/pages/chatgpt/index'
    }
  },
  onShareTimeline: function (res) {
    return {
      //分享的标题
      title: '一颗程序树 Chatgpt智能问答',
      //分享的路径，也就是你分享的用户点击进入哪个页面
      path: '/pages/chatgpt/index'
    }
  }

})