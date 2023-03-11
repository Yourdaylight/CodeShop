// pages/personal/index.js
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

Page({
  /**
   * 页面的初始数据
   */
  data: {
    modifiedInfo: false, //是否修改了个人信息
    showLoading: false,
    style: 2,
    hasUserInfo: false,
    btns: [{
        name: '源码集合',
        fun: 'toIndex',
        icon:'💻'
      },
      {
        name: 'ip地址查询',
        fun: 'toIpSearch',
        icon:'🌏'
      },
      {
        name: '时间戳转换工具',
        fun: 'toTimestamp',
        icon:'📅'
      },
      {
        name: '清除缓存',
        fun: 'clearStorage',
        icon:'🔧'
      }, {
        name: '退出小程序',
        fun: 'exitSys',
        icon:'📍'
      }
    ],
    userStatus: "未登陆，请点击头像登陆",
    userInfo: wx.getStorageSync('userInfo'),
    versionNum: "2.6.0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('userInfo')) {
      let userStatus = "已登录"
      if (wx.getStorageSync('userInfo').nickName == "微信用户" && wx.getStorageSync('userInfo').avatarUrl == "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132") {
        userStatus = "待更新头像/昵称信息"
      }
      this.setData({
        hasUserInfo: true,
        userInfo: wx.getStorageSync('userInfo'),
        userStatus: userStatus
      })
    }
    this.updateUserInfo()

  },
  /**
   * 更新用户信息
   */
  updateUserInfo() {
    getUserProfile().then((res) => {
      this.setData({
        hasUserInfo: res.hasUserInfo,
        userInfo: res.userInfo,
        userStatus: res.hasUserInfo ? "已登录" : "未登陆，请点击头像登陆"
      })
    }).catch((err)=>{
      this.setData({
        hasUserInfo: err.hasUserInfo,
        userInfo: err.userInfo,
        userStatus: err.hasUserInfo ? "已登录" : "未登陆，请点击头像登陆"
      })
    })
  },
  //新版微信获取头像能力
  onChooseAvatar(e) {
    this.setData({
      'userInfo.avatarUrl': e.detail.avatarUrl,
      modifiedInfo:true
    })
  },
  ascertain() {
    uni.navigateBack({
      delta: 1
    })
  },

  updateNickName(e) {
    this.setData({
      "userInfo.nickName": e.detail.value,
      modifiedInfo:true
    })
  },
  /**
   * 按钮统一点击事件
   * @param {*} event 
   */
  tapButton(event) {
    let index = event.currentTarget.dataset.index;
    let item = this.data.btns[index];
    if (item.fun) {
      this[item.fun]();
    }
  },

  /**
   * 跳转到首页
   */
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  //跳转到ip查询界面
  toIpSearch(){
    wx.navigateTo({
      url: '/pages/personal/ipSearch/ipSearch',
    })
  },

  //跳转到时间戳转换界面
  toTimestamp(){
    wx.navigateTo({
      url: '/pages/personal/timestampUtil/timestampUtil',
    })
  },


  onHide() {
    if (this.data.userInfo.modifiedInfo) {
      codeShopUsers.doc(this.data.userInfo._id).update({
        data: {
          "avatarUrl": this.data.userInfo.avatarUrl,
          "nickName": this.data.userInfo.nickName
        }
      }).then((res) => {
        wx.showToast({
          title: '个人信息更新成功!',
        })
        this.setData({
          userInfo: this.data.userInfo,
          modifiedInfo: false
        })
        wx.setStorageSync('userInfo', this.data.userInfo)
      }).catch((err) => {
        wx.showToast({
          title: '个人信息更新失败!',
        })
      })
    }

  },
  /**
   * 清除小程序缓存
   */
  clearStorage() {
    modal('操作确认', '确定要清除所有缓存吗', '清除缓存', '取消').then(res => {
      wx.clearStorage({
        success: (res) => {
          modal('缓存已清理', '为了保证数据正常，请退出应用后重启小程序');
        },
      })
    })

  },

  /**
   * 退出小程序
   */
  exitSys() {
    modal('操作确认', '确定要退出小程序吗', '退出', '取消').then(res => {
      wx.exitMiniProgram();
    })
  }
})