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
	 * 上传用户头像
	 * @param {Object} data 包含user_id和file_content或file_path的对象
	 * @returns {Object} 上传结果
	 */
	async uploadAvatar(data) {
		// 参数验证
		if (!data.user_id) {
			return {
				status: 0,
				msg: "没有传入用户ID"
			}
		}

		if (!data.file_content && !data.file_path) {
			return {
				status: 0,
				msg: "没有传入文件内容或路径"
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

		try {
			// 生成随机文件名，避免文件名冲突
			const timestamp = Date.now();
			const randomNum = Math.floor(Math.random() * 10000);

			// 获取文件扩展名
			let fileExt = 'jpg'; // 默认扩展名
			if (data.file_path) {
				fileExt = data.file_path.split('.').pop().toLowerCase();
			} else if (data.file_type) {
				// 从 MIME 类型提取扩展名
				const mimeToExt = {
					'image/jpeg': 'jpg',
					'image/png': 'png',
					'image/gif': 'gif',
					'image/webp': 'webp'
				};
				fileExt = mimeToExt[data.file_type] || 'jpg';
			}

			const cloudPath = `avatars/${data.user_id}_${timestamp}_${randomNum}.${fileExt}`;

			// 准备上传参数
			let uploadOptions = {
				cloudPath: cloudPath
			};

			// 根据提供的参数类型设置上传选项
			if (data.file_content) {
				// 如果提供了文件内容，使用 fileContent
				uploadOptions.fileContent = Buffer.from(data.file_content, 'base64');
			} else if (data.file_path) {
				// 如果提供了文件路径，使用 filePath
				uploadOptions.filePath = data.file_path;
			}

			// 上传文件到云存储
			const uploadResult = await uniCloud.uploadFile(uploadOptions);

			console.log('头像上传成功:', uploadResult);

			// 更新用户头像
			const updateResult = await db.collection('xm-stp-user_detail')
				.doc(data.user_id)
				.update({
					avatar: uploadResult.fileID
				})

			if (updateResult.updated) {
				return {
					status: 1,
					msg: "头像上传并更新成功",
					data: {
						avatar: uploadResult.fileID
					}
				}
			} else {
				return {
					status: 0,
					msg: "头像更新失败"
				}
			}
		} catch (e) {
			console.error('头像上传失败:', e)
			return {
				status: 0,
				msg: "头像上传失败: " + e.message
			}
		}
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
			// 处理用户类型
			try {
				const typeResult = await getType(res.data[i].type)
				res.data[i].type = typeResult && typeResult.name ? typeResult.name : '未知类型'
			} catch (e) {
				console.error('处理用户类型出错:', e)
				res.data[i].type = '未知类型'
			}

			// 处理学院信息
			try {
				if (res.data[i].college_category_id && Array.isArray(res.data[i].college_category_id) &&
					res.data[i].college_category_id.length > 0 && res.data[i].college_category_id[0] &&
					res.data[i].college_category_id[0].name) {
					res.data[i].college = res.data[i].college_category_id[0].name
				} else {
					res.data[i].college = '未知学院'
				}
			} catch (e) {
				console.error('处理学院信息出错:', e)
				res.data[i].college = '未知学院'
			}
			delete res.data[i].college_category_id

			// 处理专业信息
			try {
				if (res.data[i].specific_category_id && Array.isArray(res.data[i].specific_category_id) &&
					res.data[i].specific_category_id.length > 0 && res.data[i].specific_category_id[0] &&
					res.data[i].specific_category_id[0].name) {
					res.data[i].specific = res.data[i].specific_category_id[0].name
				}
			} catch (e) {
				console.error('处理专业信息出错:', e)
			}
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

		// 处理学院信息
		try {
			if (check.data[0].college_category_id && Array.isArray(check.data[0].college_category_id) &&
				check.data[0].college_category_id.length > 0 && check.data[0].college_category_id[0] &&
				check.data[0].college_category_id[0].name) {
				check.data[0].college = check.data[0].college_category_id[0].name
			} else {
				check.data[0].college = '未知学院'
			}
		} catch (e) {
			console.error('处理学院信息出错:', e)
			check.data[0].college = '未知学院'
		}

		// 处理专业信息
		try {
			if (check.data[0].specific_category_id && Array.isArray(check.data[0].specific_category_id) &&
				check.data[0].specific_category_id.length > 0 && check.data[0].specific_category_id[0] &&
				check.data[0].specific_category_id[0].name) {
				check.data[0].specific = check.data[0].specific_category_id[0].name
			}
		} catch (e) {
			console.error('处理专业信息出错:', e)
		}

		// 处理用户类型
		try {
			const typeResult = await getType(check.data[0].type)
			check.data[0].type = typeResult && typeResult.name ? typeResult.name : '未知类型'
		} catch (e) {
			console.error('处理用户类型出错:', e)
			check.data[0].type = '未知类型'
		}

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
		.field('title,person_needed,current_members,current_person_request,create_time,description,content_text').get()


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
	},
	/**
	 * 更新用户个人资料
	 * @param {Object} data 包含用户资料更新信息的对象
	 * @returns {Object} 更新结果
	 */
	async updateUserProfile(data) {
		// 参数验证
		if (!data.user_id) {
			return {
				status: 0,
				msg: "没有传入用户ID"
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

		// 构建更新数据对象
		const updateData = {}

		// 只更新提供的字段
		if (data.real_name !== undefined) {
			updateData.real_name = data.real_name
		}

		if (data.college_category_id !== undefined) {
			updateData.college_category_id = data.college_category_id
		}

		if (data.specific_category_id !== undefined) {
			updateData.specific_category_id = data.specific_category_id
		}

		if (data.onboarding_year !== undefined) {
			updateData.onboarding_year = data.onboarding_year
		}

		if (data.type !== undefined) {
			updateData.type = data.type
		}

		if (data.bio !== undefined) {
			updateData.bio = data.bio
		}

		// 如果没有要更新的字段，返回成功但提示没有更新
		if (Object.keys(updateData).length === 0) {
			return {
				status: 1,
				msg: "没有提供需要更新的字段"
			}
		}

		// 更新用户资料
		try {
			const updateResult = await db.collection('xm-stp-user_detail')
				.doc(data.user_id)
				.update(updateData)

			if (updateResult.updated) {
				// 获取更新后的用户信息，包括关联的学院和专业信息
				const updatedUser = await db.collection('xm-stp-user_detail,xm-stp-college_cat,xm-stp-specific_cat')
					.doc(data.user_id)
					.get()

				if (updatedUser.affectedDocs) {
					const userData = updatedUser.data[0]

					// 处理返回数据
					const result = {
						_id: userData._id,
						real_name: userData.real_name,
						onboarding_year: userData.onboarding_year,
						avatar: userData.avatar,
						bio: userData.bio || ''
					}

					// 添加学院信息
					if (userData.college_category_id && userData.college_category_id.length > 0) {
						result.college_category = {
							_id: userData.college_category_id[0]._id,
							name: userData.college_category_id[0].name
						}
					}

					// 添加专业信息
					if (userData.specific_category_id && userData.specific_category_id.length > 0) {
						result.specific_category = {
							_id: userData.specific_category_id[0]._id,
							name: userData.specific_category_id[0].name
						}
					}

					// 添加用户类型信息
					const typeInfo = await getType(userData.type)
					result.type = {
						value: userData.type,
						name: typeInfo.name
					}

					return {
						status: 1,
						msg: "个人资料更新成功",
						data: result
					}
				}
			}

			return {
				status: 0,
				msg: "个人资料更新失败"
			}
		} catch (e) {
			console.error(e)
			return {
				status: 0,
				msg: "个人资料更新出错: " + e.message
			}
		}
	}
}
