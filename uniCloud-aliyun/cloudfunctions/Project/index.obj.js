// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command

const {
	convertStatus,
	convertPosition,
	getDetailForUpdate
} = require('b_project')

const {getType} = require('identified')

const {
	formatDateTime
} = require('date')

const { getInviteStatus } = require('project-history')

module.exports = {
	_before: function() { // 通用预处理器
		db.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission字段
		})
	},
	async getListByCat(data) {
		const cat = await db.collection('xm-stp-project_cat').where(`name=='${data.name}'`).get()
		
		if (cat.affectedDocs == 0) return {
			status: 0,
			msg: "不合格类别"
		}

		const detail = await db.collection('xm-stp-project_detail').field('_id,title,person_needed,current_members,current_person_request')
			.getTemp()

		var condition = data.name == '竞赛项目' ? 
			`type_id == '${cat.data[0]._id}' && status == 1 && competition_id != NULL` 
			:
			`type_id == '${cat.data[0]._id}' && status == 1`;
		
		//if(data.user_id != null) condition += ` && user_id != '${data.user_id}'`
		
		let res = await db.collection('xm-stp-project', detail)
			.where(condition)
			.field('_id,user_id,competition_id,create_time,ending_time')
			.get()
		
		// 如果没有数据，直接返回空数组
		if (!res.data || res.data.length === 0) {
			return {
				status: 1,
				msg: "OK",
				data: []
			}
		}
		
		const projIds = []
		let validProjects = [];
		
		// 第一次处理：仅保留有效的项目数据
		for(const i in res.data){
			// 确保_id和子元素存在且有效
			if (res.data[i]._id && 
				res.data[i]._id['xm-stp-project_detail'] && 
				res.data[i]._id['xm-stp-project_detail'].length > 0 &&
				res.data[i]._id['xm-stp-project_detail'][0] &&
				res.data[i]._id['xm-stp-project_detail'][0].title) { // 确保标题存在
				
				const project = {
					title: res.data[i]._id['xm-stp-project_detail'][0].title,
					person_needed: res.data[i]._id['xm-stp-project_detail'][0].person_needed || 0,
					current_members: res.data[i]._id['xm-stp-project_detail'][0].current_members || 0,
					current_person_request: res.data[i]._id['xm-stp-project_detail'][0].current_person_request || 0,
					_id: res.data[i]._id._value,
					user_id: res.data[i].user_id,
					competition_id: res.data[i].competition_id,
					create_time: res.data[i].create_time,
					ending_time: res.data[i].ending_time
				};
				
				validProjects.push(project);
				projIds.push(project._id);
			} else {
				console.warn('跳过无效项目数据:', res.data[i]);
			}
		}
		
		// 如果没有有效项目，返回空数组
		if (validProjects.length === 0) {
			console.log('没有找到有效的项目数据');
			return {
				status: 1,
				msg: "没有有效的项目数据",
				data: []
			}
		}
		
		// 继续处理有效项目数据
		if(data.user_id && projIds.length > 0){
			const inProj = await db.collection('xm-stp-project_app_request')
				.where({
					project_id:dbCmd.in(projIds),
					user_id:data.user_id
				})
				.get()
			
			if(inProj.affectedDocs){
				for(const i1 in validProjects){
					for(const i2 in inProj.data){
						if(validProjects[i1]._id == inProj.data[i2].project_id){
							validProjects[i1].in_project = 1
							break
						}
					}
				}
			}
		}
		
		// 处理竞赛项目信息
		if(data.name == '竞赛项目'){
			const compIds = []
			for(const i in validProjects){
				if (validProjects[i].competition_id) {
					compIds.push(validProjects[i].competition_id)
				}
			}
			
			if (compIds.length > 0) {
				const comp = await db.collection('xm-stp-project_comp_detail')
				.where({
					_id:dbCmd.in(compIds),
				})
				.field('title')
				.get()
				
				for(const i1 in validProjects){
					if (!validProjects[i1].competition_id) continue;
					
					for(const i2 in comp.data){
						if(validProjects[i1].competition_id == comp.data[i2]._id){
							validProjects[i1].comp_name = comp.data[i2].title
							delete validProjects[i1].competition_id
						}
					}
				}
			}
		}
		
		// 如果current_members为空，获取成员数量
		if (projIds.length > 0) {
			const $ = db.command.aggregate
			// 获取项目申请人数
			const requestsCountList = await db.collection('xm-stp-project_app_request').aggregate()
				.match({
					project_id: db.command.in(projIds),
					status: 0 // 状态0表示待处理的申请
				})
				.group({
					_id: '$project_id',
					count: $.sum(1)
				})
				.end()
			
			// 更新申请人数（仅限）
			for(const project of validProjects) {
				// 更新申请人数
				const requestInfo = requestsCountList.data.find(r => r._id === project._id);
				if(requestInfo) {
					project.current_person_request = requestInfo.count;
					
					// 同步更新到项目详情表
					try {
						await db.collection('xm-stp-project_detail')
							.doc(project._id)
							.update({
								current_person_request: project.current_person_request
							});
					} catch (err) {
						console.error(`更新项目 ${project._id} 数据失败:`, err);
					}
				}
			}
		}
		
		return {
			status: 1,
			msg: "OK",
			data: validProjects
		}
	},
	async getListForMainPage(data){
		// 这个操作是确保不会获取到竞赛项目
		const comp = await db.collection('xm-stp-project_cat').where({name:'竞赛项目'}).get()
		// 竞赛项目
		var condition = 'status == 1'
		if(comp.affectedDocs) condition += ` && type_id != '${comp.data[0]._id}'`
		// 如果有用户id就不拿他的
		if(data.user_id) condition += ` && user_id != '${data.user_id}'`
		
		// 获取随机5个
		const list = await db.collection('xm-stp-project').where(condition)
			.field('type_id,create_time,ending_time').orderBy('create_time','desc').limit(5).get()
		if(list.affectedDocs == 0)  return {
			status:1,
			msg:"OK",
			data: []
		}
		
		const projs = []
		var cats = []
		for(const i in list.data)
		{
			projs.push(list.data[i]._id)
			cats.push(list.data[i].type_id)
		}
		cats = Array.from(new Set(cats))
		
		// 获取对应的项目详情
		const detail = await db.collection('xm-stp-project_detail').where({
			_id:dbCmd.in(projs)
		}).field('title,person_needed').get()
		
		for(const i1 in list.data){
			for(const i2 in detail.data){
				if(list.data[i1]._id == detail.data[i2]._id){
					list.data[i1].title = detail.data[i2].title
					list.data[i1].person_needed = detail.data[i2].person_needed
					break
				}
			}
		}
		
		// 获取类别数据
		const cat = await db.collection('xm-stp-project_cat').where({
			_id:dbCmd.in(cats)
		}).get()
		
		for(const i1 in list.data){
			for(const i2 in cat.data){
				if(list.data[i1].type_id == cat.data[i2]._id){
					list.data[i1].type = cat.data[i2].name
					delete list.data[i1].type_id
					break
				}
			}
		}
		
		return {
			status:1,
			msg:"OK",
			data: list.data
		}
	},
	async getDetailFromList(data){
		const res = await db.collection('xm-stp-project_detail').doc(data.id).field('description,user_id').get()
		if(res.affectedDocs == 0) return {
			status:0,
			msg: "不存在该项目"
		}
		
		const $ = db.command.aggregate
		const counter = await db.collection('xm-stp-project_app_request').aggregate()
		    .match({
		        project_id: data.id 
		    })
		    .group({
		        _id: '$project_id', // 按 project_id 分组
		        count: $.sum(1) // 统计每组的数量
		    })
		    .end();
		
		if(!counter.affectedDocs) res.data[0].person_pending = 0
		else res.data[0].person_pending = counter.data[0].count
		
		return {
			status:1,
			msg:"OK",
			data:res.data[0]
		}
	},
	async getSelf(data) {
		let check = await db.collection('xm-stp-project_detail')
			.where(`user_id=='${data.user_id}'`)
			.orderBy('create_time desc')
			.field('_id, title, user_id, person_needed, college_categories, current_members, current_person_request, create_time')
			.get()

		if (check.affectedDocs == 0) return {
			status: 1,
			msg: "OK",
			data: []
		}

		const listId = []
		const detail = check.data
		for (const i in detail) {
			listId.push(detail[i]._id)
		}

		const res = await db.collection('xm-stp-project').where({
			_id: dbCmd.in(listId)
		}).get()

		const project = res.data

		const list = []
		const prjTypeList = []
		const compIds = []
		var index = 0
		for (const i1 in detail) {
			for (const i2 in project) {
				if (detail[i1]._id == project[i2]._id) {
					list.push({
						...detail[i1],
						...project[i2]
					})
					if(list[index].competition_id) compIds.push(list[index].competition_id)					
					prjTypeList.push(list[index++].type_id)
					break
				}
			}
		}
		
		if(compIds.length){
			const compList = await db.collection('xm-stp-project_comp_detail')
			.where({
				_id: dbCmd.in([...new Set(compIds)])
			})
			.field('title').get()
			
			for(const i1 in list){
				for(const i2 in compList.data){
					if(list[i1].competition_id == compList.data[i2]._id){
						list[i1].comp = compList.data[i2].title
						delete list[i1].competition_id
						break
					}
				}
			}
		}

		const projectTypeDb = await db.collection('xm-stp-project_cat').where({
			_id: dbCmd.in([...new Set(prjTypeList)])
		}).get()

		projectTypes = {}
		for (const i in projectTypeDb.data) {
			projectTypes[projectTypeDb.data[i]._id] = projectTypeDb.data[i].name
		}
		
		const projIds = []
		for (const i in list) {
			projIds.push(list[i]._id)
			list[i].type = projectTypes[list[i].type_id]
			delete list[i].type_id
			list[i].status = convertStatus(list[i].status)
		}
		
		// 获取申请人数
		const $ = db.command.aggregate
		const counter = await db.collection('xm-stp-project_app_request').aggregate()
		    .match({
		        project_id: dbCmd.in(projIds) // 条件过滤：project_id 在指定列表中
		    })
		    .group({
		        _id: '$project_id', // 按 project_id 分组
		        count: $.sum(1) // 统计每组的数量
		    })
		    .end();

		for(const i1 in counter.data){
			for(const i2 in list){
				if(list[i2]._id == counter.data[i1]._id){
					list[i2].person_request = counter.data[i1].count
					break
				}
			}
		}
		
		// 更新成员数量
		for (const proj of list) {
			// 获取当前成员数量 - 使用 xm-stp-project_detail_user_rel 表
			const memberCountRes = await db.collection('xm-stp-project_detail_user_rel')
				.where({
					project_id: proj._id,
					project_position: dbCmd.neq(1) // 排除项目负责人
				})
				.count();
			
			// 更新项目详情中的成员数
			proj.current_members = memberCountRes.total || 0;
			
			// 同步更新到项目详情表，确保数据一致性
			await db.collection('xm-stp-project_detail')
				.doc(proj._id)
				.update({
					current_members: proj.current_members,
					current_person_request: proj.person_request || 0
				});
			
			console.log(`已同步更新项目 ${proj._id} 的成员数为 ${proj.current_members}，申请人数为 ${proj.person_request || 0}`);
		}
		
		if(data.target_user) {
			check = await db.collection('xm-stp-project_app_invite').where({
				user_id: data.target_user,
				project_id:dbCmd.in(projIds)
			}).field('project_id').get()
			
			for(const i1 in check.data){
				for(const i2 in list){
					if(check.data[i1].project_id == list[i2]._id) {
						list[i2].target_status = "已被邀请"
						break
					}
				}
			}
			
			check = await db.collection('xm-stp-project_app_request').where({
				user_id: data.target_user,
				project_id:dbCmd.in(projIds)
			}).field('project_id').get()
			
			for(const i1 in check.data){
				for(const i2 in list){
					if(check.data[i1].project_id == list[i2]._id) {
						list[i2].target_status = "用户已申请"
						break
					}
				}
			}
		}
		
		return {
			status: 1,
			msg: "OK",
			data: list
		}

	},
	async getDetail(data) {
		// 获取项目详情
		const check = await db.collection('xm-stp-project_detail')
			.doc(data.id).get()

		if (check.affectedDocs == 0) return {
			status: 0,
			msg: "项目不存在"
		}

		// 获取项目的时间和类型
		const project = await db.collection('xm-stp-project,xm-stp-project_cat')
			.where({
				'_id': data.id
			})
			.get()

		project.data[0].type = project.data[0].type_id[0].name
		delete project.data[0].type_id
		
		// 如果是隶属于竞赛
		if(project.data[0].competition_id){
			const comp = await db.collection('xm-stp-project_comp_detail')
			.doc(project.data[0].competition_id).field('title').get()
			
			if(comp.affectedDocs) project.data[0].comp = comp.data[0].title
		}
		
		// 获取项目允许学院信息
		const academyNeeded = await db.collection('xm-stp-project_cat_relation, xm-stp-college_cat')
			.where({
				'project_id': data.id
			})
			.foreignKey("xm-stp-project_cat_relation.college_category_id")
			.get()
		
		const academyList = []
		for (const i in academyNeeded.data)
			academyList.push(academyNeeded.data[i].college_category_id[0])
		
		// 获取项目中用户的信息
		const userDetailTmp = await db.collection('xm-stp-user_detail').field('_id,real_name').getTemp()
		const memberInProject = await db.collection('xm-stp-project_detail_user_rel', userDetailTmp)
			.where({
				project_id: data.id,
				project_position: dbCmd.lte(2)
			})
			.orderBy('project_position asc')
			.get()

		let haveUser = 0
		
		for (const i in memberInProject.data) {
			if(data.user_id && data.user_id == memberInProject.data[i].user_id[0]) haveUser = 1 
			memberInProject.data[i].user = memberInProject.data[i].user_id[0]
			memberInProject.data[i].project_position = convertPosition(memberInProject.data[i].project_position)
			delete memberInProject.data[i].user_id
		}
		
		// 先提前把数据整理
		const result = {
				...project.data[0],
				...check.data[0],
				...{
					'academyList': academyList
				},
				...{
					'memberList': memberInProject.data
				}
			}

		// 如果有用户信息但是并不存在于项目里【可能用户申请了加入但还没被处理】
		if(data.user_id && !haveUser){
			var checkExist = await db.collection('xm-stp-project_app_request').where({
				'user_id':data.user_id,
				'project_id':data.id
			}).field('_id').get()
			
			// 如果发现存在用户那么设置pending
			if(checkExist.affectedDocs){
				result.pending = 1
			}else{
				checkExist = await db.collection('xm-stp-project_app_invite').where({
					'user_id':data.user_id,
					'project_id':data.id,
					'status': parseInt(getInviteStatus("等待回复"))
				}).field('_id').get()
				
				if(checkExist.affectedDocs){
					result.invite_pending = 1
				}
			}
			
		}

		return {
			status: 1,
			msg: 'OK',
			data: result
		}

	},
	async addProject(data) {
		let check = await db.collection('xm-stp-project_cat').doc(data.type_id).get()
		if (check.affectedDocs == 0) return {
			status: 0,
			msg: "项目类型不存在"
		}

		check = await db.collection('xm-stp-college_cat').where({
			_id: dbCmd.in(data.college_categories)
		}).get()

		if (check.affectedDocs != data.college_categories.length)
			return {
				status: 0,
				msg: "有学院是不存在"
			}
		const transaction = await db.startTransaction()
		// try{
		const res = await db.collection('xm-stp-project').add({
			type_id: data.type_id,
			ending_time: data.ending_time,
			status: parseInt(data.status),
			user_id: data.user_id
		})

		const projectId = res.id

		await db.collection('xm-stp-project_detail').add({
			_id: projectId,
			user_id: data.user_id,
			title: data.title,
			description: data.description,
			person_needed: parseInt(data.person_needed),
			user_type: data.user_type
		})

		await db.collection('xm-stp-project_detail_user_rel').add({
			user_id: data.user_id,
			project_id: projectId,
			project_position: parseInt(convertPosition("项目负责人"))
		})

		const catList = []
		for (const index in data.college_categories)
			catList.push({
				project_id: projectId,
				college_category_id: data.college_categories[index]
			})


		await db.collection('xm-stp-project_cat_relation').add(catList)

		await transaction.commit()
		// }catch(\throw e){
		// 	await transaction.rollback()

		// 	return {
		// 		status:0,
		// 		msg:"项目添加失败，请再重试或者上报给技术部门"
		// 	}
		// }


		return {
			status: 1,
			msg: "项目添加成功"
		}
	},
	async getDetailForUpdate(data) {
		return await getDetailForUpdate(data)
	},
	async updateProject(data) {
		// 获取旧数据, 并对数据进行整理
		const res = await getDetailForUpdate(data)
		if (res.status == 0) return res
		delete res.data._id
		res.data.ending_time = formatDateTime(res.data.ending_time, 'YYYY-mm-dd')

		// 检查数据是否真的有更新，没更新则不做操作并返回通知
		const updatedData = {}
		for (const key in res.data) {
			// 如果数据是为array或者object另外进行分析
			if (typeof data[key] == 'object' || typeof data[key] == 'array') {
				if (data[key].length != res.data[key].length) {
					updatedData[key] = data[key]
					continue
				}
				for (const k1 in data[key]) {
					if (data[key][k1] != res.data[key][k1]) {
						updatedData[key] = data[key]
						continue
					}
				}
				continue
			}

			if (data[key] != res.data[key]) {
				updatedData[key] = data[key]
			}
		}

		if (Object.keys(updatedData).length == 0) return {
			status: 0,
			msg: '参数没变过，不需要更新'
		}


		// 逐个更新
		const transaction = await db.startTransaction()
		// 如果存在project的字段
		if ('ending_time' in updatedData || 'status' in updatedData) {
			const projData = {}
			if ('ending_time' in updatedData)
				projData['ending_time'] = Math.floor(new Date(updatedData['ending_time']).getTime() / 1000)

			if ('status' in updatedData)
				projData['status'] = parseInt(updatedData['status'])

			await db.collection('xm-stp-project').doc(data.id).update(projData)
			delete updatedData['ending_time']
			delete updatedData['status']
		}

		// 如果存在学院的字段
		if ('academyList' in updatedData) {
			await db.collection('xm-stp-project_cat_relation').where({
				project_id: data.id
			}).remove()

			const list = []
			for (const i in updatedData['academyList'])
				list.push({
					project_id: data.id,
					college_category_id: updatedData['academyList'][i]
				})

			await db.collection('xm-stp-project_cat_relation').add(list)
			delete updatedData['academyList']
		}

		// 上述的处理后如果还有键值，那么就是detail更新用
		if (Object.keys(updatedData).length > 0) {
			await db.collection('xm-stp-project_detail').doc(data.id).update(updatedData)
		}


		await transaction.commit()

		return {
			status: 1,
			msg: '更新成功'
		}

	},
	async getProjectMembers(data){
		const check = await db.collection('xm-stp-project_detail')
		.where({_id:data.id,user_id:data.user_id}).field('_id').get()
		if(!check.affectedDocs) return {
			status:0,
			msg:'不存在该项目'
		}
		
		const list = {}
		
		list['invited'] = await db.collection('xm-stp-project_app_invite')
		.where(`project_id == '${data.id}' && status == 1`).field('user_id').get()
		
		list['request'] = await db.collection('xm-stp-project_app_request').where({
			'project_id':data.id,
			'status':0
		}).field('user_id,status,comment').get()
		
		list['relation'] = await db.collection('xm-stp-project_detail_user_rel').where({
			'project_id':data.id
		}).field('user_id,project_position').get()
		
		// console.log(check,invited,request,relation)
		
		for(const i in list['relation'].data)
			list['relation'].data[i].project_position = convertPosition(list['relation'].data[i].project_position)
		
		
		var user = [];
		for(const key in list){
			for(const i in list[key].data){
				user.push(list[key].data[i].user_id)
			}
		}
		
		list['user'] = await db.collection('xm-stp-user_detail').where({
			'_id':dbCmd.in(Array.from(new Set(user)))
		}).get()
		
		for(const key in list){
			list[key] = list[key].data
		}
		
		cat_list = {'college':[],'specific':[]}
		for(const i in list['user']){
			list['user'][i].type = (await getType(list['user'][i].type)).name
			cat_list['college'].push(list['user'][i].college_category_id)
			cat_list['specific'].push(list['user'][i].specific_category_id)
		}
		
		const college = await db.collection('xm-stp-college_cat').where({
			'_id':dbCmd.in(Array.from(new Set(cat_list['college'])))
		}).get()
		
		const specific = await db.collection('xm-stp-specific_cat').where({
			'_id':dbCmd.in(Array.from(new Set(cat_list['specific'])))
		}).get()
		
		for(const i in list['user']){
			for(const j in college.data){
				if(list['user'][i].college_category_id == college.data[j]._id){
					list['user'][i].college_category_id = college.data[j].name
					break;
				}
			}
			
			for(const j in specific.data){
				if(list['user'][i].specific_category_id == specific.data[j]._id){
					list['user'][i].specific_category_id = specific.data[j].name
					break;
				}
			}
		}
				
		return {
			status:1,
			msg:"OK",
			data:list
		}
		
	},
	// 获取所有项目
	async getAllProjects() {
		try {
			// 获取所有有效的项目
			const condition = 'status == 1'
			
			let res = await db.collection('xm-stp-project')
				.where(condition)
				.field('_id,user_id,competition_id,type_id,create_time,ending_time')
				.orderBy('create_time', 'desc')
				.get()
			
			if (res.affectedDocs === 0) {
				return {
					status: 1,
					msg: "OK",
					data: []
				}
			}
			
			// 收集所有项目ID和类别ID
			const projIds = []
			const catIds = []
			const compIds = []
			const userIds = [] // 收集所有创建者ID
			
			for (const item of res.data) {
				projIds.push(item._id)
				if (item.type_id) catIds.push(item.type_id)
				if (item.competition_id) {
					compIds.push(item.competition_id)
				}
				if (item.user_id) {
					userIds.push(item.user_id) // 收集项目创建者ID
				}
			}
			
			// 获取项目详情
			const details = await db.collection('xm-stp-project_detail')
				.where({
					_id: dbCmd.in(projIds)
				})
				.field('_id,title,person_needed,major,skills,student_type,current_members,current_person_request')
				.get()
				
			// 获取项目申请人数 - 仍然需要计算申请人数
			const dbAgg = db.command.aggregate
			const requestsCount = await db.collection('xm-stp-project_app_request')
				.aggregate()
				.match({
					project_id: dbCmd.in(projIds),
					status: 0 // 状态0表示待处理的申请
				})
				.group({
					_id: '$project_id',
					count: dbAgg.sum(1)
				})
				.end()
			
			// 获取项目类别
			let cats = {data: []};
			if(catIds.length > 0) {
				cats = await db.collection('xm-stp-project_cat')
					.where({
						_id: dbCmd.in([...new Set(catIds)])
					})
					.field('_id,name')
					.get()
			}
			
			// 获取竞赛信息（如果有）
			let comps = []
			if (compIds.length > 0) {
				comps = await db.collection('xm-stp-project_comp_detail')
					.where({
						_id: dbCmd.in([...new Set(compIds)])
					})
					.field('_id,title')
					.get()
				
				comps = comps.data
			}
			
			// 获取项目创建者信息
			let creators = []
			if (userIds.length > 0) {
				creators = await db.collection('xm-stp-user_detail')
					.where({
						_id: dbCmd.in([...new Set(userIds)])
					})
					.field('_id,real_name,username,avatar')
					.get()
				
				creators = creators.data
			}
			
			// 整合数据，严格验证每个项目的数据完整性
			const result = []
			
			for (const project of res.data) {
				// 添加项目详情 - 必须要有详情和标题才是有效项目
				const detail = details.data.find(d => d._id === project._id);
				if (!detail || !detail.title) {
					console.warn('跳过无效项目(缺少标题):', project._id);
					continue; // 跳过没有详情或标题的项目
				}
				
				const projectData = { 
					...project,
					...detail,
					current_members: detail.current_members || 0,
					current_person_request: detail.current_person_request || 0
				};

				// 只更新申请人数 - 从requestsCount中获取真实数据
				const requestInfo = requestsCount.data.find(r => r._id === project._id);
				if (requestInfo) {
					projectData.current_person_request = requestInfo.count;
					
					// 同步更新到项目详情表，仅更新申请人数
					try {
						await db.collection('xm-stp-project_detail')
							.doc(project._id)
							.update({
								current_person_request: projectData.current_person_request
							});
					} catch (err) {
						console.error(`更新项目 ${project._id} 数据失败:`, err);
					}
				}
				
				// 添加项目类别
				if (project.type_id) {
					const category = cats.data.find(c => c._id === project.type_id);
					if (category) {
						projectData.project_cat = {
							_id: category._id,
							name: category.name
						};
					}
				}
				
				// 添加竞赛信息
				if (project.competition_id) {
					const comp = comps.find(c => c._id === project.competition_id);
					if (comp) {
						projectData.comp_name = comp.title;
					}
				}
				
				// 添加创建者信息
				if (project.user_id) {
					const creator = creators.find(c => c._id === project.user_id);
					if (creator) {
						projectData.creator_name = creator.real_name || creator.username || '未知用户';
						projectData.creator_avatar = creator.avatar;
					}
				}
				
				result.push(projectData);
			}
			
			return {
				status: 1,
				msg: "OK",
				data: result
			}
		} catch (error) {
			console.error('获取所有项目出错:', error)
			return {
				status: 0,
				msg: "获取项目失败: " + error.message,
				data: []
			}
		}
	},
	async getProjectById(data) {
		try {
			console.log('获取项目信息，项目ID:', data.id);
			
			if (!data.id) {
				return {
					status: 0,
					msg: "项目ID不能为空"
				};
			}
			
			// 获取项目基本信息
			const projectRes = await db.collection('xm-stp-project')
				.where(`_id == '${data.id}'`)
				.get();
				
			if (projectRes.affectedDocs === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}
			
			const project = projectRes.data[0];
			console.log('项目基本信息:', project);
			
			// 获取项目详情
			const detailRes = await db.collection('xm-stp-project_detail')
				.where(`_id == '${data.id}'`)
				.field('title,description,person_needed,current_members,current_person_request,user_id')
				.get();
				
			if (detailRes.affectedDocs > 0) {
				Object.assign(project, detailRes.data[0]);
			}
			
			// 获取当前报名人数 - 使用已有的 xm-stp-project_app_request 表
			const $ = db.command.aggregate;
			
			// 获取当前申请人数
			const requestCountRes = await db.collection('xm-stp-project_app_request')
				.where({
					project_id: data.id,
					status: 0 // 状态0表示待处理的申请
				})
				.count();
				
			// 更新项目详情中的申请人数
			project.current_person_request = requestCountRes.total || 0;
			
			// 同步更新到项目详情表，确保数据一致性
			await db.collection('xm-stp-project_detail')
				.doc(data.id)
				.update({
					current_person_request: project.current_person_request
				});
				
			console.log(`已同步更新项目 ${data.id} 的申请人数为 ${project.current_person_request}`);
			
			// 获取项目分类信息
			if (project.type_id) {
				const catRes = await db.collection('xm-stp-project_cat')
					.where(`_id == '${project.type_id}'`)
					.get();
					
				if (catRes.affectedDocs > 0) {
					project.project_cat = catRes.data[0];
				}
			}
			
			// 获取竞赛信息
			if (project.competition_id) {
				const compRes = await db.collection('xm-stp-project_comp_detail')
					.where(`_id == '${project.competition_id}'`)
					.get();
					
				if (compRes.affectedDocs > 0) {
					project.comp_name = compRes.data[0].title;
				}
			}
			
			// 获取创建者信息 - 从正确的表获取用户信息
			if (project.user_id) {
				console.log('获取创建者信息，用户ID:', project.user_id);
				
				// 从xm-stp-user_detail表获取用户信息，而不是uni-id-users表
				const userRes = await db.collection('xm-stp-user_detail')
					.where(`_id == '${project.user_id}'`)
					.field('_id,username,real_name,avatar,introduction')
					.get();
					
				console.log('创建者查询结果:', userRes);
					
				if (userRes.affectedDocs > 0) {
					// 设置创建者名称 - 优先使用real_name, 然后是username
					project.creator_name = userRes.data[0].real_name || userRes.data[0].username || '未知用户';
					project.avatar = userRes.data[0].avatar || '';
					project.creator_intro = userRes.data[0].introduction || '';
					console.log('设置创建者名称:', project.creator_name);
				} else {
					console.log('找不到用户信息，使用默认值');
					project.creator_name = '未知用户';
				}
			} else {
				console.log('项目无用户ID信息');
				project.creator_name = '未知用户';
			}
			
			// 获取项目成员信息 - 使用 xm-stp-project_detail_user_rel 表
			const memberRes = await db.collection('xm-stp-project_detail_user_rel')
				.where(`project_id == '${data.id}'`)
				.get();
				
			if (memberRes.affectedDocs > 0) {
				project.members = memberRes.data;
			} else {
				project.members = [];
			}
			
			console.log('最终返回的项目信息:', project);
			
			return {
				status: 1,
				msg: "获取项目信息成功",
				data: project
			};
		} catch (error) {
			console.error('获取项目信息失败:', error);
			return {
				status: 0,
				msg: "获取项目信息失败: " + error.message
			};
		}
	},
	// 获取项目创建者信息
	async getProjectCreator(data) {
		try {
			console.log('获取项目创建者信息，项目ID:', data.project_id);
			
			if (!data.project_id) {
				return {
					status: 0,
					msg: "项目ID不能为空"
				};
			}
			
			// 获取项目信息以找到创建者ID
			const projectRes = await db.collection('xm-stp-project')
				.where(`_id == '${data.project_id}'`)
				.field('user_id')
				.get();
				
			console.log('项目查询结果:', projectRes);
				
			if (projectRes.affectedDocs === 0 || !projectRes.data[0].user_id) {
				console.log('找不到项目或创建者ID');
				return {
					status: 0,
					msg: "找不到项目或创建者信息"
				};
			}
			
			const userId = projectRes.data[0].user_id;
			console.log('创建者ID:', userId);
			
			// 获取用户信息 - 从xm-stp-user_detail表获取
			const userRes = await db.collection('xm-stp-user_detail')
				.where(`_id == '${userId}'`)
				.field('_id,username,real_name,avatar,introduction')
				.get();
				
			console.log('用户查询结果:', userRes);
				
			if (userRes.affectedDocs === 0) {
				console.log('找不到用户信息');
				return {
					status: 0,
					msg: "找不到创建者信息",
					data: null
				};
			}
			
			// 返回格式调整，匹配ui-id-users表的字段名，保证前端代码兼容
			const userData = {
				_id: userRes.data[0]._id,
				username: userRes.data[0].username,
				nickname: userRes.data[0].real_name,  // 使用real_name作为nickname
				avatar: userRes.data[0].avatar,
				introduction: userRes.data[0].introduction
			};
			
			console.log('用户信息:', userData);
			
			return {
				status: 1,
				msg: "获取创建者信息成功",
				data: userData
			};
		} catch (error) {
			console.error('获取项目创建者信息失败:', error);
			return {
				status: 0,
				msg: "获取创建者信息失败: " + error.message,
				data: null
			};
		}
	},
	// 修复项目成员数量
	async fixProjectMembers() {
		try {
			console.log("开始修复项目成员数量...");
			// 获取所有项目ID
			const projectsResult = await db.collection('xm-stp-project_detail')
				.field('_id,current_members,user_id')
				.get();
			
			if (!projectsResult.data || projectsResult.data.length === 0) {
				return {
					status: 0,
					msg: "未找到项目数据"
				};
			}
			
			const projects = projectsResult.data;
			console.log(`找到 ${projects.length} 个项目需要处理`);
			
			let updatedCount = 0;
			for (const project of projects) {
				// 查询每个项目的成员数量，排除项目负责人(创建者)
				const membersResult = await db.collection('xm-stp-project_detail_user_rel')
					.where({
						project_id: project._id,
						user_id: dbCmd.neq(project.user_id) // 排除项目创建者
					})
					.count();
				
				const memberCount = membersResult.total;
				
				// 只有当当前成员数与实际不符时才更新
				if (project.current_members !== memberCount) {
					await db.collection('xm-stp-project_detail')
						.doc(project._id)
						.update({
							current_members: memberCount
						});
					
					updatedCount++;
					console.log(`已更新项目 ${project._id}: 当前成员从 ${project.current_members} 更新为 ${memberCount}`);
				}
			}
			
			console.log(`共修复 ${updatedCount} 个项目的成员数量`);
			
			return {
				status: 1,
				msg: `成功修复 ${updatedCount} 个项目的成员数量`,
				data: { updated: updatedCount, total: projects.length }
			};
		} catch (error) {
			console.error("修复项目成员数量时出错:", error);
			return {
				status: 0,
				msg: "修复失败: " + error.message
			};
		}
	},
	// 提供一个API端点用于执行修复
	async runMembersFix() {
		return await this.fixProjectMembers();
	}
}