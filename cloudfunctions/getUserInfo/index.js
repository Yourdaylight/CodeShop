const cloud = require('wx-server-sdk');

cloud.init({
  env: "cloud1-0gdh8xhva7c11eaa"
});
const db = cloud.database();
const users = db.collection('codeShopUsers');
/**
 * 根据openid获取用户信息，没有则新增用户信息
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  let userData = event.userData
  if (event.openid) {
    return getUserData(userData,event.openid);
  } else {
    const wxContext = cloud.getWXContext();
    return getUserData(userData,wxContext.OPENID);
  }
};

async function getUserData(userData,openid) {
  await users.where({
    _openid: openid
  })
  .limit(1)
  .get()
  .then(res=>{
    if (res.data.length <= 0) {
      userData["_openid"]=openid
      userData["create_time"]=db.serverDate()
      userData["role"]="visitor",
      userData["openai_key"] = "",
      userData["favorites"]=[]
      try {
        users.add({
          data: userData
        }).then(res=>{
          userData = false
        }).catch(err=>{
          userData = false
        })
      } catch(e) {
        console.log("云函数getUserInfo插入报错")
      }
    } else {
      userData = res.data[0];
    }
  }).catch(err=>{
    userData = false;
  })
  return {
    userData
  }
}