// index.js
// const app = getApp()
import {
  modal,
  getUserProfile
} from '../../utils/util';
const {
  envList
} = require('../../envList.js');
const db = wx.cloud.database({
  env: envList[0]
})
const codeShopUsers = db.collection("codeShopUsers")
const configs = db.collection("configs")
// const db = getApp().globalData.db
// pages/home/home.js
var app = getApp()
let videoAd = null
Page({
  data: {
    apiLimit:3,
    isloading: false,
    infoMess: '',
    content: '',
    chatname: '',
    url: "https://programtree.cloud/api/v1/chat?programtree=r_h&prompt=1",
    messages: [{
        "type": "me",
        "name": 'chatgpt',
        "content": `Hello!`,
        "currentDate": new Date().toLocaleString()
      },
    ],
    showAnnounce:false,
    announce:"",//公告栏，当小程序更新时将广告展示在这里
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
  getUserInitialInfo(){
    getUserProfile().then((res) => {
      this.setData({
        hasUserInfo: res.hasUserInfo,
        userInfo: res.userInfo,
      })
    })
  },
  onLoad: function (n) {
    configs.where({
      name: "chatgpt"
    }).get().then((res)=>{
      let _config = res.data
      if (_config.length>0){
        let checkShowAnnounce=false
        if (_config[0].announce.length>0){
          checkShowAnnounce=true
        }
        this.setData({
          apiLimit:_config[0].apiLimit,
          url:_config[0].url,
          announce:_config[0].announce,
          showAnnounce:checkShowAnnounce
        })
      }
    }).catch((err)=>{
      console.log("error")
      console.log(err)
    })
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
      that.getUserInitialInfo()
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
    if (that.data.messages.length > this.data.apiLimit && this.data.openai_key == "") {
      // 在页面onLoad回调事件中创建激励视频广告实例
      let ps = "受限于api访问能力，若要继续当前对话需要观看广告;也可以点击界面清除按钮开启新一轮对话"
      this.showAdd(ps)
      return
    } else if(content.length>100 && content.length<800 && this.data.openai_key == ""){
      let ps = "受限于api访问能力，若要输入长问题;需要观看广告授权"
      this.showAdd(ps)
      return
    } else if(content.length>800){
      let ps = "受限于api访问能力，最大支持800字的问题"
      this.showAdd(ps)
      return
    }else {
      that.sendChat()
    }

  },

  //展示广告
  showAdd:function(content){
    let that = this
    wx.showModal({
      title: '温馨提示',
      content: content,
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
              adUnitId: 'adunit-c2ab4e350d636eed'
            })
            videoAd.onLoad(() => {})
            videoAd.onError((err) => {
              that.sendChat()
            })
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
  },
  //检测用户是否使用apikey，是的话将api对话回合修改到99
  testApikey: function () {
    if (this.data.openai_key == "" && this.data.userInfo.openai_key) {
      wx.showModal({
        title: '注意！',
        content: '检测到你已经设置过私有apikey，本次是否使用你的私有key？',
        complete: (res) => {
          if (res.cancel) {
            this.setData({
              apiLimit:5
            })
          }
          if (res.confirm) {
            this.setData({
              openai_key: this.data.userInfo.openai_key,
              apiLimit:99
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
      that.getUserInitialInfo()
      return
    }
    var content = that.data.content.trim();
    if (content == "") {
      wx.showToast({
        title: '输入框不能为空，请输入你的openai的apikey。如果不再想使用你的apikey，可以点击界面清除按钮',
      })
      
    } else if(this.data.userInfo.nickName=="微信用户" || this.data.userInfo.nickName=="未授权用户"){
      modal("信息更新","请先在-我的工具箱-点击头像和昵称进行更新")
    }else {
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
                userInfo: that.data.userInfo,
                apiLimit:99
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
        "_openid": this.data.userInfo._openid,
        "nickname":this.data.userInfo.nickName
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
          message.currentDate = new Date().toLocaleString()
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
        wx.showReq
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
  onChooseAvatar(e) {
    this.userInfo.avatarUrl = e.detail.avatarUrl
  },
  ascertain(){
    uni.navigateBack({
      delta:1
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