// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
exports.main = async (event, context) => {
  let prompt = event.prompt

  return await rp({
    url: 'https://programtree.cloud/chat?programtree=r_h&prompt='+prompt,
    method: 'GET',
    json:true
  })
    .then(function (res) {
      console.log("成功!")
      console.log(res)
      return res
    })
    .catch(function (err) {
      console.log("!!!??成功!")
      console.log(res)
      return err
    });
}