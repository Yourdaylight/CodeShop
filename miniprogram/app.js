// app.js
App({
  onLaunch: function (options) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        env: "cloud1-0gdh8xhva7c11eaa",
        traceUser: true,
      })
    }
        // 监听系统主题变化
        wx.onThemeChange((themeResult) => {
          _this.themeChanged(themeResult.theme)
        })
        if (options.scene != 1154) {
          const updateManager = wx.getUpdateManager()
          updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
          })
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，请重启应用',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新版本下载失败
          })
        }
    this.globalData = {
    };
  }


});
