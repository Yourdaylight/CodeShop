import { modal,getUserProfile } from "../../../utils/util"
const {
  envList
} = require('../../../envList.js');
const db = wx.cloud.database({
  env: envList[0]
})
const codeShopUsers = db.collection("codeShopUsers")
const configs = db.collection("configs")
// pages/personal/gitDownload/gitDownload.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    apiLimit:2,
    url:"",
    gitUrl:""
  },

  /**c
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(wx.getStorageSync('userInfo')){
      let info = JSON.parse(options.userInfo)
      this.setData({
        userInfo:info
      })
      //获取当前页面配置的ur信息
      configs.where({
        name: "gitDownload"
      }).get().then((res) => {
        let _config = res.data
        if (_config.length > 0) {
          this.setData({
            apiLimit: _config[0].apiLimit,
            url: _config[0].url
          })
        }
      }).catch((err) => {
        modal("温馨提示","当前页面服务更新中，请稍候重试")
      })
    }else{
      wx.showModal({
        title: '登陆提醒',
        content: '请先在我的工具箱点击头像登陆',
        complete: (res) => {
          wx.switchTab({
            url: '/pages/personal/index',
          })
        },
       
      })
    }
  },
  

  //提交下载请求
  submitDownload(){
    wx.showLoading({
      title: '拉取中，请稍候',
    })
    let that = this
    //todo url检验以及用户已下载列表展示
    wx.request({
      url: this.data.url,
      method:"POST",
      data:{
        git_url:this.data.gitUrl,
        _openid:this.data.userInfo._openid,
        _id:this.data.userInfo._id
      },
      success:function(res){
        
        wx.hideLoading()
          console.log(res)
          wx.showToast(
            {title:res.data.msg}
          )
          //成功之后更新用户的gitDownloads字段
          if (res.data.code==200){
            //将刚刚上传成功的数据加入到用户的文件下载列表中
            let uploadedFile = res.data.data.msg
            let userDownloadedFiles = that.data.userInfo.gitDownloaded!=undefined ?  that.data.userInfo.gitDownloaded:[]
            userDownloadedFiles.push(uploadedFile)
            codeShopUsers.doc(that.data.userInfo._id).update({
              data: {
                "gitDownloaded": userDownloadedFiles,
              }
            }).then((res) => {
              codeShopUsers.where({
                _id:that.data.userInfo._id
              }).get().then((res)=>{
                wx.setStorageSync('userInfo',res.data[0])
                this.setData({
                  userInfo:res.data[0]
                })
              })
            }).catch((err) => {
              wx.showToast({
                title: '更新本地已下载列表失败',
              })
            })
          }
          codeShopUsers
      },
      fail:function(err){
        wx.hideLoading()
        wx.showToast({
          title: '获取项目失败，请检查链接是否正确',
        })
          console.log(err)
      }
    })
  },

  onInput(e){
    this.setData({
      gitUrl:e.detail.value
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