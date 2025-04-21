// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command

const { getType, getCollege, getSpecific } = require('identified')
module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({ 
			role: ['admin'],
		})
	},
	/**
	 * 更新用户头像
	 * @param {Object} data 包含user_id和avatar_url的对象
	 * @returns {Object} 更新结果
	 */
	async updateAvatar(data) {
		// 参数验证
		if (!data.user_id) {
			return {
				status: 0,
				msg: "没有传入用户ID"
			}
		}
		
		if (!data.avatar_url) {
			return {
				status: 0,
				msg: "没有传入头像URL"
			}
		}
		
		// 检查用户是否存在
		const userCheck = await db.collection('xm-stp-user_detail').doc(data.user_id).get()
		if (!userCheck.affectedDocs) {
			return {
				status: 0,
				msg: "用户不存在"
			}
		}
		
		// 更新用户头像
		try {
			const updateResult = await db.collection('xm-stp-user_detail')
				.doc(data.user_id)
				.update({
					avatar: data.avatar_url
				})
			
			if (updateResult.updated) {
				return {
					status: 1,
					msg: "头像更新成功",
					data: {
						avatar: data.avatar_url
					}
				}
			} else {
				return {
					status: 0,
					msg: "头像更新失败"
				}
			}
		} catch (e) {
			console.error(e)
			return {
				status: 0,
				msg: "头像更新出错: " + e.message
			}
		}
	},
	async getList(data){
		var condition = data.type == '学生' ? 'type != 0' : 'type == 0'
		
		if(data.user_id) condition += ` && _id != '${data.user_id}'`
		
		if(data.real_name) condition += ` && real_name == '${data.real_name}'`
		
		const res = await db.collection('xm-stp-user_detail,xm-stp-college_cat,xm-stp-specific_cat').where(condition).get()

		
		if(!res.affectedDocs) return {
			status:1,
			msg:"OK",
			data:[]
		}
		
		console.log(res)
		const userIds = []
		
		for(const i in res.data){
			res.data[i].type = await getType(res.data[i].type)
			res.data[i].type = res.data[i].type.name
			res.data[i].college = res.data[i].college_category_id[0].name
			
			delete res.data[i].college_category_id
			if(res.data[i].specific_category_id.length) res.data[i].specific = res.data[i].specific_category_id[0].name
			delete res.data[i].specific_category_id
			
			userIds.push(res.data[i]._id)
		}
		
		const $ = db.command.aggregate
		var projAct = await db.collection('xm-stp-project_app_request').aggregate()
		.match({
		    user_id: dbCmd.in(userIds) 
		}).group({
			_id: '$user_id', 
			count: $.sum(1) 
		})
		.end();
		
		for(const i1 in projAct.data){
			for(const i2 in res.data){
				if(projAct.data[i1]._id == res.data[i2]._id){
					res.data[i2].request_count = projAct.data[i1].count
				}
			}
		}
		
		projAct = await db.collection('xm-stp-project_app_invite').aggregate()
		.match({
		    user_id: dbCmd.in(userIds) 
		}).group({
			_id: '$user_id', 
			count: $.sum(1) 
		})
		.end();
		
		for(const i1 in projAct.data){
			for(const i2 in res.data){
				if(projAct.data[i1]._id == res.data[i2]._id){
					res.data[i2].invited_count = projAct.data[i1].count
				}
			}
		}
		
		projAct = await db.collection('xm-stp-project_detail').aggregate()
		.match({
		    user_id: dbCmd.in(userIds) 
		}).group({
			_id: '$user_id', 
			count: $.sum(1) 
		})
		.end();
		
		for(const i1 in projAct.data){
			for(const i2 in res.data){
				if(projAct.data[i1]._id == res.data[i2]._id){
					res.data[i2].self_count = projAct.data[i1].count
					break
				}
			}
		}
		
		return {
			status:1,
			msg:"OK",
			data:res.data
		}
	},
	async getUserDetail(data){
		if(data.user_id == null) return {
			status:0,
			msg:"没传入用户id"
		}
		
		const check = await db.collection('xm-stp-user_detail,xm-stp-college_cat,xm-stp-specific_cat').doc(data.user_id).get()
		if(!check.affectedDocs) return {
			status:0,
			msg:"用户不存在"
		}
		
		check.data[0].college = check.data[0].college_category_id[0].name
		if(check.data[0].specific_category_id.length)
		check.data[0].specific = check.data[0].specific_category_id[0].name
		check.data[0].type = await getType(check.data[0].type)
		check.data[0].type = check.data[0].type.name
		delete check.data[0].college_category_id
		delete check.data[0].specific_category_id
		
		const projs = await db.collection('xm-stp-project,xm-stp-project_cat').where({
			user_id:data.user_id,
			status:1
		})
		.field('type_id')
		.get()
		
		if(!projs.affectedDocs) return {
			status:1,
			msg:"OK",
			data:{
				user:check.data[0],
				list:[]
			}
		}
		
		const projList = []
		for(const i in projs.data) projList.push(projs.data[i]._id)
		
		
		const detailList = await db.collection('xm-stp-project_detail')
		.where({
			_id:dbCmd.in(projList)
		})
		.field('title,person_needed,current_person_request,create_time').get()
		
		
		for(const i1 in detailList.data){
			for(const i2 in projs.data){
				if(detailList.data[i1]._id == projs.data[i2]._id){
					detailList.data[i1].type = projs.data[i2].type_id[0].name
					break
				}
			}
		}
		
		return {
			status:1,
			msg:"OK",
			data:{
				user:check.data[0],
				list:detailList.data
			}
		}
	}
}
