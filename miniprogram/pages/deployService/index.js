// miniprogram/pages/deployService/index.js
const { envList } = require('../../envList.js');
const db = wx.cloud.database({env:envList[0]})
const config = db.collection("configs")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:"",
    url:""
  },

  onLoad(e){
      wx.showLoading({
        title: '加载中,请稍候',
      })
      config.where({
        name:"project"
      }).get().then((res)=>{
        let data = res.data
        console.log(data)
        wx.hideLoading()
        if(data.length>0){
          this.setData({
            content:data[0].announce,
            url:data[0].url
          })
        }else{
          this.setData({
            content:"如果您需要定制项目，我们可以为您提供专业的定制服务。请您点击下方按钮，填写您的需求描述和完成时间，我们会尽快与您联系。我们拥有一支由专业的硕士和博士团队组成的团队，确保为您提供高质量的服务，并提供质量保障。支持技术栈包括Python/Java/Go/小程序开发。可承接Web开发，数据分析，机器学习，爬虫可视化等相关内容。",
            url:"cloud://cloud1-0gdh8xhva7c11eaa.636c-cloud1-0gdh8xhva7c11eaa-1310395233/project.png"
          })
        }
      })
  }
});
