// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const { hashPassword, verifyPassword } = require('password')
const { generateRandomToken,checkTokenValid } = require('session-token')

const { getUserDetail } = require('b_user') 

module.exports = {
	_before: function () { // 通用预处理器

	   db.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
	   		role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission字段
	   	})
	},
   async register(data){
	   const check = await db.collection('xm-stp-user').where({'username':data.username}).field('username').limit(1).get()
   	   
   	   if(check.affectedDocs) return {			//affectedDocs （查找时）有多少匹配的就返回多少
   		   status:0,
   		   msg: '用户名已存在，请换用户名进行注册'
   	   }
	   
	   // 密码加密
	   const encrp_pass = await hashPassword(data.password)
	   
   	   const res = await db.collection('xm-stp-user').add({
			username:data.username,
			password:encrp_pass,
			token: generateRandomToken(8)
   	   })
	   
   	   return {
   		   status:1,
   		   msg:'注册成功,请再次登录',
		   data:{
			   id:res.id
		   }
   	   }
   } ,
   async login(data){
	   const check = await db.collection('xm-stp-user').where({'username':data.username}).field('username, password,token').limit(1).get()

	   if(!check.affectedDocs) return {
		   status:0,
		   msg: '用户名不存在'
	   }
	   
	   const userData = check.data[0]
	   const checkPass = await verifyPassword(data.password,userData.password)
	   
	   if(!checkPass)return {
		   status:0,
		   msg: '密码错误'
	   }
	   
	   const res = {
		   status:1,
		   msg: '登录成功',
		   data:await getUserDetail(userData)
	   }
	   
	   return res
   },
	async loginState(data){
		const check = checkTokenValid(data.id,data.token)
		if(!check) return {
			status:-1,
			msg:'请重新登陆'
		}
		
		const userData = await db.collection('xm-stp-user').where({"_id":data.id}).field('username,token').limit(1).get()
		
		if(!userData.affectedDocs || check.token != userData.data[0].token) return {
			status:-1,
			msg:'请重新登陆'
		}
		
		
		const res = {
		   status:1,
		   msg: '还在登录状态',
		   data:await getUserDetail(userData)
		}
		
		return res
	}
}
