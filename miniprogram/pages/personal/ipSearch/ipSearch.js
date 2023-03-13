const {
  envList
} = require('../../../envList.js');
const db = wx.cloud.database({
  env: envList[0]
})
const configs = db.collection("configs")
let videoAd = null
// pages/personal/ipSearch/ipSearch.js
Page({
  data: {
    inputValue: '127.0.0.1',
    focus: false,
    searchTimes:0,//已经查询的次数
    searchFocusCss: '',
    r: {
      "ip":"127.0.0.1",
      "areacode":"本地局域网"
    },
    apiLimit: 5,
    url: "https://programtree.cloud/api/v2/ip"
  },

  onLoad: function () {
    configs.where({
      name: "ip"
    }).get().then((res) => {
      let _config = res.data
      if (_config.length > 0) {
        this.setData({
          apiLimit: _config[0].apiLimit,
          url: _config[0].url
        })
      }
    }).catch((err) => {
      console.log("error")
      console.log(err)
    })
  },
  onReady: function () {
    var that = this;
  },
  //展示广告
  showAdd: function (content) {
    var that = this
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
              that.searchSubmit()
            })
            videoAd.onClose((res) => {
              if (res && res.isEnded) {
                that.searchSubmit()
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
  searchTextClick: function () {
    this.setData({
      searchFocusCss: 'weui-search-bar_focusing',
      focus: true
    })
  },
  searchCancelClick: function () {
    this.setData({
      searchFocusCss: '',
      focus: false
    })
  },
  searchClearClick: function () {
    this.setData({
      searchValue: '',
      focus: true
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  searchIpSubmit:function(){
    if(wx.getStorageSync('userInfo')){
      if (wx.getStorageSync('userInfo').role!="visitor"){
        this.searchSubmit()
        return
      }
    }
    //除我以外都要看广告
    if(this.data.searchTimes>this.data.apiLimit){
      let ps = `每天前${this.data.apiLimit}次免广告查询`
      this.showAdd(ps)
    }else{
      this.searchSubmit()
    }
  },
  //搜索提交
  searchSubmit: function () {
    var that = this;
    var ip = this.data.inputValue;
    if (ip) {
      var isIP = ip.match(/^([1-9]\d*|0[0-7]*|0x[\da-f]+)(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))$/i);
      if (!isIP) {
        wx.showToast({
          title: 'ip格式不正确',
        });
        return false;
      }
      wx.showToast({
        title: '搜索中',
        icon: 'loading'
      });
      wx.request({
        url: this.data.url,
        method: 'POST',
        data: {
          ip: ip
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          let times = that.data.searchTimes+1
          that.setData({
            r: res.data.data,
            searchTimes:times
          })
        },
        fail: function () {
          // fail
        },
        complete: function () {
          // complete
          wx.hideToast();
        }
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: 'IP地址查询--一颗程序树',
      path: '/pages/personal/ipSearch/ipSearch',
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
})