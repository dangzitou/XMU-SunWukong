// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
module.exports = {
	_before: function () { // 通用预处理器
	
	db.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission字段
		})

	},
	async getList(limit=8){
		const res = await db.collection('xm-stp-news')
		.where({'status':1,'remove_time':null})
		.orderBy('create_time','desc')
		.field('title,avatar,create_time')
		.limit(limit).get()
		return{
			status:1,
			msg:'OK',
			data:res.data
		};
	},
	
	async getDetail(id){
		const res = await db.collection('xm-stp-news').where({'_id':id}).field('paragraph,title,avatar').get()
		
		if(!res.affectedDocs) return {
			status:0,
			msg:"新闻不存在"
		}
		
		return{
			status:1,
			msg:'OK',
			data:res.data[0]
		};
		
	}
	
	/**
	 * method1方法描述
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */
	/* 
	method1(param1) {
		// 参数校验，如无参数则不需要
		if (!param1) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '参数不能为空'
			}
		}
		// 业务逻辑
		
		// 返回结果
		return {
			param1 //请根据实际需要返回值
		}
	}
	*/
}
