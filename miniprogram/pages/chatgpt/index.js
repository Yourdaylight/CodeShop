// index.js
// const app = getApp()
const {
  envList
} = require('../../envList.js');
const db = wx.cloud.database({
  env: envList[0]
})
const codeShopUsers = db.collection("codeShopUsers")
// const db = getApp().globalData.db
console.log(getApp().globalData)
// pages/home/home.js
var app = getApp()
let videoAd = null
Page({
  data: {
    isloading: false,
    infoMess: '',
    content: '',
    chatname: '',
    url: "https://programtree.cloud/chat?programtree=r_h&prompt=1",
    messages: [{
        "type": "me",
        "name": 'chatgpt',
        "content": `Hello!`,
        "currentDate": new Date().toLocaleString()

      },
    ],
    robotImg: '../../images/tabbar/tab2-s.png',
    //用户基本信息(头像、昵称)
    userInfo: {
      avatarUrl: '../../images/tabbar/tab2-s.png',
      nickName: '未授权用户'
    },
    //是否已经获取用户信息
    hasUserInfo: false,
    //是否可以调用获取信息得函数
    canIUseGetUserProfile: false,
    openai_key: ""
  },
  //第一次获取用户信息
  getUserProfile: function (e) {
    wx.showLoading({
      title: '登陆中，请稍候',
    })
    wx.getUserProfile({
      desc: '获取您的微信昵称',
      success: (res) => {
        let userData = res.userInfo
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            "userData": userData
          }
        }).then((res) => {
          wx.hideLoading()
          wx.showToast({
            title: '登陆成功！',
          })
          this.setData({
            userInfo: res.result.userData,
            hasUserInfo: true
          })
          wx.setStorageSync('userInfo', this.data.userInfo)
        })

      },
      fail: function (e) {
        wx.showToast({
          title: '你选择了取消',
          icon: "none",
          duration: 1500,
          mask: true
        })
      }
    })
  },
  onLoad: function (n) {
    this.setData({
      canIUseGetUserProfile: true
    })

  },

  onShow: function () {
    //获取用户的本地缓存数据，userinfo信息是在用户授权登录时保存的
    var n = wx.getStorageSync("userInfo");
    //当本地缓存的用户名称不为""或者null时，设置userinfo信息
    if (n.nickName != '' && n.nickName != null) {
      this.setData({
        userInfo: n,
        hasUserInfo: true,
        canIUseGetUserProfile: true
      })
      // 通过wx.login获取登录凭证（code），然后通过code去获取我们用户的openid
      wx.login({
        success: (res) => {
          console.log("登陆成功", res);
        },
      })
    }
  },

  copyContent:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.copied, //需要复制的内容
      success: function (res) { //成功回调函数
        wx.showToast({
          title: '内容已复制！',
        })
      }
    })
  },
  getContent: function (content) {
    this.setData({
      content: content.detail.value
    })
  },


  // 发送消息
  loginBtnClick: function () {
    var that = this;
    if (!that.data.hasUserInfo) {
      that.getUserProfile()
      return
    }
    var content = that.data.content.trim();
    if (content == "") {
      return;
    }
    //如果用户配置的有apikey，询问是否使用
    this.testApikey()
    var message = {
      name: that.data.userInfo.nickName,
      content: content,
      type: "you",
      currentDate:new Date().toLocaleString()
    };
    that.data.messages.push(message);
    that.setData({
      messages: that.data.messages,
      content: ""
    });
    if (that.data.messages.length > 5 & this.data.openai_key == "") {
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
              videoAd.onLoad(() => {})
              videoAd.onError((err) => {})
              videoAd.onClose((res) => {
                if (res && res.isEnded) {
                  that.sendChat()
                } else {}
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

    } else {
      that.sendChat()
    }

  },

  //检测用户是否使用apikey
  testApikey: function () {
    if (this.data.openai_key == "" && this.data.userInfo.openai_key) {
      wx.showModal({
        title: '注意！',
        content: '检测到你已经设置过私有apikey，本次是否使用你的私有key？',
        complete: (res) => {
          if (res.cancel) {}
          if (res.confirm) {
            this.setData({
              openai_key: this.data.userInfo.openai_key,
            })
          }
        }
      })
    }
  },
  //输入api
  inputApi: function () {
    var that = this
    if (!that.data.hasUserInfo) {
      that.getUserProfile()
      return
    }
    var content = that.data.content.trim();
    if (content == "") {
      wx.showToast({
        title: '输入框不能为空，请输入你的openai的apikey。如果不再想使用你的apikey，可以点击界面清除按钮',
      })
    } else {
      wx.showModal({
        title: 'apikey输入确认',
        content: '使用apikey不会有访问轮数限制。请确认你的apikey输入正确:' + content,
        complete: (res) => {
          if (res.cancel) {}
          if (res.confirm) {
            codeShopUsers.doc(that.data.userInfo._id).update({
              data: {
                "openai_key": content
              }
            }).then((res) => {
              wx.showToast({
                title: '设置成功!',
              })
              that.data.userInfo["openai_key"] = content
              this.setData({
                userInfo: that.data.userInfo
              })
            }).fail((err) => {
              wx.showToast({
                title: '设置失败!',
              })
            })


          }
        }
      })
    }


  },

  sendChat: function () {
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
        "question": this.data.messages,
        "apikey": this.data.openai_key,
        "_openid": this.data.userInfo._openid
      },
      success: function (res) {
        let resp = res.data
        var message = {
          name: "chatgpt",
          content: "服务器繁忙。请退出后重试",
          type: "me"
        };
        wx.hideLoading();
        if (resp.code === 200) {
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
          title: 'API访问异常，请稍后重试',
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
      messages: [],
      openai_key: ""
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