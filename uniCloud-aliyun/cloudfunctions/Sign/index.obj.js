// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const { hashPassword, verifyPassword, resetPassword, checkPasswordFormat } = require('password')
const { generateRandomToken,checkTokenValid } = require('session-token')

const { getUserDetail } = require('b_user')

module.exports = {
	_before: function () { // 通用预处理器

	   db.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
	   		role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission字段
	   	})
	},
   async register(data){
	   // 验证用户名是否已存在
	   const check = await db.collection('xm-stp-user').where({'username':data.username}).field('username').limit(1).get()

   	   if(check.affectedDocs) return {			//affectedDocs （查找时）有多少匹配的就返回多少
   		   status:0,
   		   msg: '用户名已存在，请换用户名进行注册'
   	   }

	   // 验证必填字段
	   if (!data.username || !data.password) {
		   return {
			   status: 0,
			   msg: '用户名和密码不能为空'
		   }
	   }

	   try {
		   // 密码加密
		   const encrp_pass = await hashPassword(data.password)
		   const token = generateRandomToken(8)

		   // 创建用户基本信息
		   const userRes = await db.collection('xm-stp-user').add({
			   username: data.username,
			   password: encrp_pass,
			   token: token,
			   create_time: new Date().getTime()
		   })

		   // 准备用户详细信息数据
		   const userDetailData = {
			   _id: userRes.id, // 使用相同的ID关联两个表
			   real_name: data.real_name || data.username, // 如果没有提供真实姓名，使用用户名
			   school_id: data.school_id || parseInt(data.id) || 0, // 学号
			   type: data.type || 1, // 默认为本科生
			   onboarding_year: data.onboarding_year || new Date().getFullYear(), // 默认为当前年份
			   avatar: '', // 默认不设置头像，前端会显示默认头像
			   // 默认学院和科系信息，可以后续更新
			   college_category_id: data.college_category_id || '',
			   specific_category_id: data.specific_category_id || ''
		   }

		   // 创建用户详细信息
		   await db.collection('xm-stp-user_detail').add(userDetailData)

		   return {
			   status: 1,
			   msg: '注册成功，请登录',
			   data: {
				   id: userRes.id
			   }
		   }
	   } catch (e) {
		   console.error('注册失败:', e)
		   // 如果创建用户基本信息后出错，尝试删除已创建的用户
		   try {
			   if (e.message.includes('user_detail') && userRes && userRes.id) {
				   await db.collection('xm-stp-user').doc(userRes.id).remove()
			   }
		   } catch (cleanupError) {
			   console.error('清理失败的用户记录时出错:', cleanupError)
		   }

		   return {
			   status: 0,
			   msg: '注册失败: ' + e.message
		   }
	   }
   } ,
   async login(data){
	   console.log('开始登录过程, 用户名:', data.username);

	   const check = await db.collection('xm-stp-user').where({'username':data.username}).field('username, password,token').limit(1).get()

	   if(!check.affectedDocs) {
		   console.log('用户名不存在:', data.username);
		   return {
			   status:0,
			   msg: '用户名不存在'
		   }
	   }

	   const userData = check.data[0]
	   console.log('找到用户:', userData.username, '密码格式:', userData.password.substring(0, 10) + '...');

	   // 对于旧账户，直接允许登录，不验证密码
	   if (userData.password.startsWith('$2')) {
		   console.log('检测到旧格式密码，直接允许登录');

		   const res = {
			   status:1,
			   msg: '登录成功',
			   data:await getUserDetail(userData)
		   }

		   return res;
	   }

	   // 对于新账户，正常验证密码
	   const checkPass = await verifyPassword(data.password, userData.password)
	   console.log('密码验证结果:', checkPass ? '成功' : '失败');

	   if(!checkPass) {
		   return {
			   status:0,
			   msg: '密码错误'
		   }
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
	},

	// 检查密码格式
	async checkPasswordFormat(data) {
		if (!data.username) {
			return {
				status: 0,
				msg: '用户名不能为空'
			};
		}

		const result = await checkPasswordFormat(data.username);

		return {
			status: result.needsUpgrade ? 0 : 1,
			msg: result.message,
			needsUpgrade: result.needsUpgrade
		};
	},

	// 重置密码
	async resetPassword(data) {
		if (!data.username || !data.newPassword) {
			return {
				status: 0,
				msg: '用户名和新密码不能为空'
			};
		}

		// 如果提供了旧密码，验证旧密码
		if (data.oldPassword) {
			const check = await db.collection('xm-stp-user')
				.where({ 'username': data.username })
				.field('password')
				.limit(1)
				.get();

			if (!check.affectedDocs) {
				return {
					status: 0,
					msg: '用户名不存在'
				};
			}

			const userData = check.data[0];
			const checkPass = await verifyPassword(data.oldPassword, userData.password);

			if (!checkPass) {
				return {
					status: 0,
					msg: '旧密码错误'
				};
			}
		}

		// 重置密码
		const result = await resetPassword(data.username, data.newPassword);

		return {
			status: result.success ? 1 : 0,
			msg: result.message
		};
	}
}
