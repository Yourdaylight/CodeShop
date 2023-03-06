// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
    //获取表
    // let table = db.collection('set_collection');
    // //查询表 
    // //由于考虑到异步调用,需要用await返回结果给res
    // //否则可能res没有获得值就传给了处理函数
    // let res = await table.get();
    // return res.data;	
    console.log("test")
    return await db.collection("set_collection").get()
}