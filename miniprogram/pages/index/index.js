// index.js
// const app = getApp()
const { envList } = require('../../envList.js');
const db = wx.cloud.database({env:envList[0]})
// const db = getApp().globalData.db
Page({
  data: {
    showUploadTip: false,
    value:"",
    powerList: [
      {
        icon:"🔍 ",
        title: '搜索结果',
        tip: '',
        showItem: false,
        item: []
      },
      {
        icon:'🐍 ',
        title: 'Python Web',
        tip: '基于django, flask, fastapi的web系统',
        showItem: false,
        item: []
      },
      {
        icon:"📊 ",
      title: '数据分析',
      tip: '机器学习，文本情感分析，金融数据分析',
      showItem: false,
      item: []
    }, {
      icon:"☕ ",
      title: 'Java Web',
      tip: 'spring boot, SSM',
      showItem: false,
      item: []
    },{
      icon:"🕸 ",
      title: '实用脚本',
      tip: '持续更新实用脚本、爬虫脚本等',
      showItem: false,
      item: [ {
        title: '待更新',
        page: 'deployService'
      }]
    }, 
    {
      icon:"📌 ",
      title: '开发项目定制',
      tip: '毕业设计指导，项目定制，代码讲解/部署',
      showItem: false,
      item: [
        {
          title: '项目定制/设计指导',
          page: 'deployService'
        },
        {
        title: '代码讲解/部署',
        page: 'deployProject'
      }
    ]
    }, ],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: true,
    projects:[]
  },
   
  onCancel(e){
    this.data.value = ""
    this.data.powerList[0].showItem=true
    this.onClickPowerInfo({currentTarget:{dataset:{index:0}}})
  },
  onChange(e){
    this.data.value = e.detail

  },
  onSearch(e){
    this.data.value = e.detail
    this.data.powerList[0].showItem=false
    this.onClickPowerInfo({currentTarget:{dataset:{index:0}}})
  },
  // 根据菜单标题索引，以及对应条件查询数据库
  searchDbWithParam(index,search_param){
    const powerList = this.data.powerList;
    db.collection("projects").where(search_param).get().then(res=>{
      var projects = res.data
      var project_list=[]
      for(var i in projects){
        project_list.push({
          "title":projects[i]["project_name"],
          "page":"codeDetail"
        })
      }
      powerList[index]["item"] = project_list
      this.setData({powerList});
      })
  },
  onClickPowerInfo(e) {

    const index = e.currentTarget.dataset.index;
    const powerList = this.data.powerList;
    powerList[index].showItem = !powerList[index].showItem;
    if(powerList[index].title === 'Python Web') {
      this.searchDbWithParam(index,{"language":"python"})
    }        
    else if(powerList[index].title === '数据分析') {
      this.searchDbWithParam(index,{"language":"ds"})
    }         
    else if(powerList[index].title === 'Java Web') {
      this.searchDbWithParam(index,{"language":"java"})
    }         
    else if(powerList[index].title === '实用脚本') {
      this.searchDbWithParam(index,{"language":"script"})
    }                    
    else if(powerList[index].title === '搜索结果' && this.data.value) {
      var search_param = {
        "project_name":{
          $regex:".*"+this.data.value+".*",
          $options:'i'
        }
      }
      this.searchDbWithParam(index,search_param)
    }
    else {
      this.setData({powerList});
      
    }

  },

  onChangeShowEnvChoose() {
    wx.showActionSheet({
      itemList: this.data.envList.map(i => i.alias),
      success: (res) => {
        this.onChangeSelectedEnv(res.tapIndex);
      },
      fail (res) {
        console.log(res.errMsg);
      }
    });
  },

  onChangeSelectedEnv(index) {
    if (this.data.selectedEnv.envId === this.data.envList[index].envId) {
      return;
    }
    const powerList = this.data.powerList;
    powerList.forEach(i => {
      i.showItem = false;
    });
    this.setData({
      selectedEnv: this.data.envList[index],
      powerList,
      haveCreateCollection: false
    });
  },

  jumpPage(e) {
    wx.navigateTo({
      url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}&projectname=${e.currentTarget.dataset.projectname}`,
    });
  },

  onShareAppMessage: function (res) {
    return {
      //分享的标题
      title: '一颗程序树 代码商店',
      //分享的路径，也就是你分享的用户点击进入哪个页面
      path:'/pages/index/index'
    }
  },
  onShareTimeline: function (res) {
    return {
      //分享的标题
      title: '一颗程序树 代码商店',
      //分享的路径，也就是你分享的用户点击进入哪个页面
      path:'/pages/index/index'
    }
  }

});
