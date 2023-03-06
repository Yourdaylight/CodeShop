const cloud = require('wx-server-sdk')

cloud.init({
    env: 'cloud1-0gdh8xhva7c11eaa'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
	//返回两数相加的和
    return await db.collection("projects").update({
      data:{
        price:0,
        buy_url:"开源地址:https://github.com/Yourdaylight?tab=repositories"
      }
    })
}
