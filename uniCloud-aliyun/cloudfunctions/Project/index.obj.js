// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { milliSecond } = require('timestamp')

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

		const detail = await db.collection('xm-stp-project_detail').field('_id,title,person_needed,current_members,current_person_request,view_count')
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

		// 构建基础查询条件
		var condition = 'status == 1' // 显示所有已发布的项目
		if(comp.affectedDocs) condition += ` && type_id != '${comp.data[0]._id}'` // 排除竞赛项目

		// 过滤过期项目 - 只显示未过期的项目
		// 使用秒级时间戳进行比较，因为数据库中存储的是秒级时间戳
		const currentTimeSeconds = Math.floor(Date.now() / 1000)
		condition += ` && ending_time > ${currentTimeSeconds}`

		// 处理类型筛选 - 直接使用分类ID
		if(data.filter_type_id) {
			condition += ` && type_id == '${data.filter_type_id}'`
		}

		// 如果有用户ID，额外显示该用户的草稿项目（但要保持筛选条件）
		if(data.user_id) {
			let draftCondition = `user_id == '${data.user_id}' && status == 0`

			// 如果有类型筛选，草稿项目也要符合筛选条件
			if(data.filter_type_id) {
				draftCondition += ` && type_id == '${data.filter_type_id}'`
			}

			// 排除竞赛项目
			if(comp.affectedDocs) {
				draftCondition += ` && type_id != '${comp.data[0]._id}'`
			}

			condition = `(${condition}) || (${draftCondition})`
		}

		// 支持分页参数
		const page = data.page || 1;
		const limit = data.limit || 20; // 默认每页20个项目，比原来的5个多
		const skip = (page - 1) * limit;

		// 获取项目列表，按创建时间倒序排列
		const list = await db.collection('xm-stp-project').where(condition)
			.orderBy('create_time','desc').skip(skip).limit(limit).get()

		// 调试：检查项目数据结构
		if (list.data && list.data.length > 0) {
			console.log('第一个项目的字段:', Object.keys(list.data[0]))
			console.log('第一个项目的user_id:', list.data[0].user_id)
		}
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

		// 获取对应的项目详情，包括描述、图片和浏览量
		const detail = await db.collection('xm-stp-project_detail').where({
			_id:dbCmd.in(projs)
		}).field('title,person_needed,current_members,current_person_request,description,content_text,images,view_count').get()

		for(const i1 in list.data){
			for(const i2 in detail.data){
				if(list.data[i1]._id == detail.data[i2]._id){
					list.data[i1].title = detail.data[i2].title
					list.data[i1].person_needed = detail.data[i2].person_needed
					list.data[i1].current_members = detail.data[i2].current_members || 0
					list.data[i1].current_person_request = detail.data[i2].current_person_request || 0
					// 添加描述信息
					list.data[i1].description = detail.data[i2].description || ''
					list.data[i1].content_text = detail.data[i2].content_text || ''
					// 添加图片信息
					list.data[i1].images = detail.data[i2].images || []
				// 添加浏览量信息
				list.data[i1].view_count = detail.data[i2].view_count || 0
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

		// 获取项目申请人数 - 确保数据准确性
		if (projs.length > 0) {
			const $ = db.command.aggregate
			// 获取项目申请人数
			const requestsCountList = await db.collection('xm-stp-project_app_request').aggregate()
				.match({
					project_id: db.command.in(projs),
					status: 0 // 状态0表示待处理的申请
				})
				.group({
					_id: '$project_id',
					count: $.sum(1)
				})
				.end()

			// 更新申请人数
			for(const i in list.data) {
				// 更新申请人数
				const requestInfo = requestsCountList.data.find(r => r._id === list.data[i]._id);
				if(requestInfo) {
					list.data[i].current_person_request = requestInfo.count;

					// 同步更新到项目详情表
					try {
						await db.collection('xm-stp-project_detail')
							.doc(list.data[i]._id)
							.update({
								current_person_request: list.data[i].current_person_request
							});
					} catch (err) {
						console.error(`更新项目 ${list.data[i]._id} 数据失败:`, err);
					}
				}
			}
		}

		// 处理搜索过滤
		let filteredProjects = list.data;
		if(data.search) {
			const searchTerm = data.search.toLowerCase();
			filteredProjects = list.data.filter(project => {
				const title = (project.title || '').toLowerCase();
				const description = (project.description || '').toLowerCase();
				const contentText = (project.content_text || '').toLowerCase();

				return title.includes(searchTerm) ||
					   description.includes(searchTerm) ||
					   contentText.includes(searchTerm);
			});
		}

		// 去重处理，防止同一个项目显示多次
		const uniqueProjects = [];
		const seenIds = new Set();

		for(const project of filteredProjects) {
			if (!seenIds.has(project._id)) {
				seenIds.add(project._id);
				uniqueProjects.push(project);
			}
		}

		// 获取创建者信息（头像等）
		if (uniqueProjects.length > 0) {
			// 收集所有创建者ID
			const creatorIds = [...new Set(uniqueProjects.map(p => p.user_id).filter(id => id))];

			if (creatorIds.length > 0) {
				console.log('获取创建者信息，创建者ID列表:', creatorIds);

				// 批量获取创建者信息
				const creators = await db.collection('xm-stp-user_detail')
					.where({
						_id: dbCmd.in(creatorIds)
					})
					.field('_id,real_name,username,avatar,introduction')
					.get();

				console.log('创建者信息查询结果:', creators);

				// 为每个项目添加创建者信息
				for (const project of uniqueProjects) {
					if (project.user_id) {
						const creator = creators.data.find(c => c._id === project.user_id);
						if (creator) {
							project.creator_name = creator.real_name || creator.username || '未知用户';
							project.creator_avatar = creator.avatar || '';
							project.creator_intro = creator.introduction || '';
							console.log(`项目 ${project._id} 设置创建者信息:`, {
								name: project.creator_name,
								avatar: project.creator_avatar
							});
						} else {
							console.log(`项目 ${project._id} 找不到创建者信息，用户ID: ${project.user_id}`);
							project.creator_name = '未知用户';
							project.creator_avatar = '';
						}
					}
				}
			}
		}

		return {
			status:1,
			msg:"OK",
			data: uniqueProjects,
			pagination: {
				page: page,
				limit: limit,
				total: uniqueProjects.length,
				hasMore: uniqueProjects.length >= limit
			}
		}
	},
	async getDetailFromList(data){
		const res = await db.collection('xm-stp-project_detail').doc(data.id).field('description,content_text,user_id,view_count').get()
		if(res.affectedDocs == 0) return {
			status:0,
			msg: "不存在该项目"
		}

		const $ = db.command.aggregate
		const counter = await db.collection('xm-stp-project_app_request').aggregate()
		    .match({
		        project_id: data.id,
		        status: 0 // 状态0表示待处理的申请
		    })
		    .group({
		        _id: '$project_id', // 按 project_id 分组
		        count: $.sum(1) // 统计每组的数量
		    })
		    .end();

		if(!counter.affectedDocs) res.data[0].person_pending = 0
		else res.data[0].person_pending = counter.data[0].count

		// 处理浏览量统计逻辑
		if (data.user_id) {
			try {
				// 检查用户是否已经浏览过这个项目
				const viewLogRes = await db.collection('xm-stp-project_view_log')
					.where({
						user_id: data.user_id,
						project_id: data.id
					})
					.get();

				// 如果用户没有浏览过这个项目，则增加浏览量并记录
				if (viewLogRes.affectedDocs === 0) {
					// 增加项目浏览量
					const currentViewCount = res.data[0].view_count || 0;
					const newViewCount = currentViewCount + 1;

					await db.collection('xm-stp-project_detail')
						.doc(data.id)
						.update({
							view_count: newViewCount
						});

					// 记录用户浏览历史
					await db.collection('xm-stp-project_view_log')
						.add({
							user_id: data.user_id,
							project_id: data.id,
							ip_address: data.ip_address || '',
							user_agent: data.user_agent || ''
						});

					// 更新返回数据中的浏览量
					res.data[0].view_count = newViewCount;
					console.log(`用户 ${data.user_id} 首次浏览项目 ${data.id}，浏览量增加至 ${newViewCount}`);
				} else {
					console.log(`用户 ${data.user_id} 已浏览过项目 ${data.id}，不重复统计浏览量`);
				}
			} catch (err) {
				console.error(`处理项目 ${data.id} 浏览量统计失败:`, err);
			}
		} else {
			// 匿名用户也增加浏览量，但不记录浏览历史
			try {
				const currentViewCount = res.data[0].view_count || 0;
				const newViewCount = currentViewCount + 1;

				await db.collection('xm-stp-project_detail')
					.doc(data.id)
					.update({
						view_count: newViewCount
					});

				res.data[0].view_count = newViewCount;
				console.log(`匿名用户浏览项目 ${data.id}，浏览量增加至 ${newViewCount}`);
			} catch (err) {
				console.error(`处理匿名用户浏览项目 ${data.id} 失败:`, err);
			}
		}

		// 同步更新到项目详情表，确保数据一致性
		try {
			await db.collection('xm-stp-project_detail')
				.doc(data.id)
				.update({
					current_person_request: res.data[0].person_pending
				});
			console.log(`已同步更新项目 ${data.id} 的申请人数为 ${res.data[0].person_pending}`);
		} catch (err) {
			console.error(`更新项目 ${data.id} 数据失败:`, err);
		}

		return {
			status:1,
			msg:"OK",
			data:res.data[0]
		}
	},
	async getJoin(data) {
		try {
			// 获取用户加入的项目关系，按加入时间倒序排序
			const memberRelations = await db.collection('xm-stp-project_detail_user_rel')
				.where({
					user_id: data.user_id
				})
				.field("project_id,user_id,project_position,has_invite_permission,join_time")
				.orderBy('join_time desc')
				.get();

			if (!memberRelations.data.length) {
				console.log('未找到项目成员关系');
				return {
					status: 1,
					msg: "OK",
					data: []
				}
			}

			// 获取所有项目ID
			const projectIds = memberRelations.data.map(rel => rel.project_id);

			// 获取项目详情
			const projectDetails = await db.collection('xm-stp-project_detail')
				.where({
					_id: dbCmd.in(projectIds),
					user_id: dbCmd.neq(data.user_id) // 排除用户自己发起的项目
				})
				.field('_id,title,description,content_text,user_id,person_needed,current_members,current_person_request,create_time')
				.get();

			// 获取项目的ending_time字段（从 xm-stp-project 表中获取）
			const filteredProjectIds = projectDetails.data.map(p => p._id);
			const projectEndingTimes = await db.collection('xm-stp-project')
				.where({
					_id: dbCmd.in(filteredProjectIds)
				})
				.field('_id,ending_time')
				.get();

			// 将ending_time添加到projectDetails中
			for (const project of projectDetails.data) {
				const endingTimeInfo = projectEndingTimes.data.find(p => p._id === project._id);
				if (endingTimeInfo && endingTimeInfo.ending_time) {
					project.ending_time = endingTimeInfo.ending_time;
					console.log(`项目 ${project._id} 的ending_time从 xm-stp-project 表中获取为: ${project.ending_time}`);
				}
			}

			// 获取项目类型信息
			// 只获取已经过滤后的项目的类型信息
			const projectTypeInfo = await db.collection('xm-stp-project')
				.where({
					_id: dbCmd.in(filteredProjectIds)
				})
				.field('_id,type_id,competition_id')
				.get();

			// 获取项目类型名称
			const typeIds = projectTypeInfo.data.map(p => p.type_id).filter(id => id);
			let projectCats = [];
			if (typeIds.length > 0) {
				projectCats = await db.collection('xm-stp-project_cat')
					.where({
						_id: dbCmd.in(typeIds)
					})
					.field('_id,name')
					.get();
			}

			// 合并项目详情和成员关系
			const result = [];
			for (const project of projectDetails.data) {
				const relation = memberRelations.data.find(rel => rel.project_id === project._id);
				if (relation) {
					// 获取项目类型信息
					const typeInfo = projectTypeInfo.data.find(t => t._id === project._id);
					let projectCat = null;
					if (typeInfo && typeInfo.type_id) {
						projectCat = projectCats.data?.find(cat => cat._id === typeInfo.type_id);
					}

					// 获取创建者类型信息
					let creatorType = null;
					if (project.user_id) {
						try {
							const creatorInfo = await db.collection('xm-stp-user_detail')
								.where({
									_id: project.user_id
								})
								.field('_id,type')
								.get();

							if (creatorInfo.data && creatorInfo.data.length > 0) {
								creatorType = creatorInfo.data[0].type === 'teacher' ? '导师发起' : '学生发起';
							}
						} catch (error) {
							console.error('获取创建者类型失败:', error);
						}
					}

					result.push({
						...project,
						project_position: relation.project_position,
						has_invite_permission: relation.has_invite_permission,
						join_time: relation.join_time,
						project_cat: projectCat,
						creator_type: creatorType,
						type: typeInfo?.competition_id ? '竞赛组队' : '项目协作'
					});
				}
			}

			return {
				status: 1,
				msg: "OK",
				data: result
			};
		} catch (error) {
			console.error('获取用户加入的项目失败:', error);
			return {
				status: 0,
				msg: "获取用户加入的项目失败: " + error.message
			};
		}
	},

	async getSelf(data) {
		let check = await db.collection('xm-stp-project_detail')
			.where(`user_id=='${data.user_id}'`)
			.orderBy('create_time desc')
			.field('_id, title, description, content_text, user_id, person_needed, college_categories, current_members, current_person_request, create_time')
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

		// 获取申请人数 - 使用与getDetailFromList相同的方法
		const $ = db.command.aggregate
		// 对每个项目单独获取申请人数
		for (const proj of list) {
			const counter = await db.collection('xm-stp-project_app_request').aggregate()
				.match({
					project_id: proj._id
				})
				.group({
					_id: '$project_id', // 按 project_id 分组
					count: $.sum(1) // 统计每组的数量
				})
				.end();

			if (!counter.affectedDocs) {
				proj.person_pending = 0;
				proj.current_person_request = 0;
			} else {
				proj.person_pending = counter.data[0].count;
				proj.current_person_request = counter.data[0].count;
			}

			// 同步更新到项目详情表
			await db.collection('xm-stp-project_detail')
				.doc(proj._id)
				.update({
					current_person_request: proj.current_person_request
				});
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
					current_members: proj.current_members
				});

			console.log(`已同步更新项目 ${proj._id} 的成员数为 ${proj.current_members}，申请人数为 ${proj.current_person_request}`);
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

		// 准备项目详情数据
		const projectDetailData = {
			_id: projectId,
			user_id: data.user_id,
			title: data.title,
			description: data.description,
			person_needed: parseInt(data.person_needed),
			user_type: data.user_type
		};

		// 如果有图片数组，添加到项目详情中
		if (data.images && Array.isArray(data.images) && data.images.length > 0) {
			console.log(`添加项目图片数组: ${JSON.stringify(data.images)}`);
			projectDetailData.images = data.images;
		}

		// 如果有内容文本，添加到项目详情中
		if (data.content_text) {
			projectDetailData.content_text = data.content_text;
		}

		// 添加项目详情
		await db.collection('xm-stp-project_detail').add(projectDetailData)

		await db.collection('xm-stp-project_detail_user_rel').add({
			user_id: data.user_id,
			project_id: projectId,
			project_position: parseInt(convertPosition("项目负责人"))
			// join_time 字段会由数据库schema自动设置为当前时间
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

		// 获取项目成员关系，包括邀请权限字段
		list['relation'] = await db.collection('xm-stp-project_detail_user_rel').where({
			'project_id':data.id
		}).field('user_id,project_position,has_invite_permission').get()

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

		// 打印调试信息，检查成员的邀请权限状态
		console.log('项目成员关系数据:', JSON.stringify(list.relation));

		// 确保所有成员都有 has_invite_permission 字段
		for (const i in list.relation) {
			if (list.relation[i].has_invite_permission === undefined) {
				list.relation[i].has_invite_permission = false;
				console.log(`为成员 ${list.relation[i].user_id} 设置默认邀请权限状态: false`);
			} else {
				console.log(`成员 ${list.relation[i].user_id} 的邀请权限状态: ${list.relation[i].has_invite_permission}`);
			}
		}

		return {
			status:1,
			msg:"OK",
			data:list
		}

	},
	// 分页获取项目
	async getProjectsByPage(data) {
		try {
			// 参数验证
			const page = parseInt(data.page) || 1;
			const pageSize = parseInt(data.pageSize) || 10;
			const skip = (page - 1) * pageSize;

			// 构建查询条件
			let condition = 'status == 1';

			// 如果有筛选条件
			if (data.filter) {
				// 获取项目类型ID
				const cat = await db.collection('xm-stp-project_cat').where(`name=='${data.filter}'`).get();
				if (cat.affectedDocs > 0) {
					condition += ` && type_id == '${cat.data[0]._id}'`;
				}
			}

			// 查询项目基本信息
			let res = await db.collection('xm-stp-project')
				.where(condition)
				.field('_id,user_id,competition_id,type_id,create_time,ending_time')
				.orderBy('create_time', 'desc')
				.skip(skip)
				.limit(pageSize)
				.get();

			if (res.affectedDocs === 0) {
				return {
					status: 1,
					msg: "OK",
					data: []
				}
			}

			// 收集项目ID、类别ID和创建者ID
			const projIds = [];
			const catIds = [];
			const userIds = [];

			for (const item of res.data) {
				projIds.push(item._id);
				if (item.type_id) catIds.push(item.type_id);
				if (item.user_id) userIds.push(item.user_id);
			}

			// 获取项目详情
			const details = await db.collection('xm-stp-project_detail')
				.where({
					_id: dbCmd.in(projIds)
				})
				.field('_id,title,description,content_text,person_needed,current_members,current_person_request')
				.get();

			// 获取项目类别
			const cats = await db.collection('xm-stp-project_cat')
				.where({
					_id: dbCmd.in([...new Set(catIds)])
				})
				.field('_id,name')
				.get();

			// 合并数据
			const result = [];
			for (const project of res.data) {
				const detail = details.data.find(d => d._id === project._id);
				if (!detail) continue;

				const cat = cats.data.find(c => c._id === project.type_id);

				const projectData = {
					_id: project._id,
					title: detail.title,
					description: detail.description,
					content_text: detail.content_text,
					person_needed: detail.person_needed,
					current_members: detail.current_members || 0,
					current_person_request: detail.current_person_request || 0,
					user_id: project.user_id,
					create_time: project.create_time,
					ending_time: project.ending_time,
					project_cat: cat ? { id: cat._id, name: cat.name } : null
				};

				result.push(projectData);
			}

			return {
				status: 1,
				msg: "OK",
				data: result
			}
		} catch (error) {
			console.error('分页获取项目失败:', error);
			return {
				status: 0,
				msg: "获取项目失败: " + error.message,
				data: []
			}
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
				.field('_id,title,description,content_text,person_needed,major,skills,student_type,current_members,current_person_request')
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
	},

	// 增加项目浏览量
	async incrementViewCount(data) {
		try {
			// 验证必要参数
			if (!data.project_id) {
				return {
					status: 0,
					msg: "项目ID不能为空"
				};
			}

			// 检查项目是否存在
			const projectRes = await db.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.field('_id,view_count')
				.get();

			if (projectRes.affectedDocs === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}

			const currentViewCount = projectRes.data[0].view_count || 0;

			// 如果有用户ID，检查是否已经浏览过
			if (data.user_id) {
				const viewLogRes = await db.collection('xm-stp-project_view_log')
					.where({
						user_id: data.user_id,
						project_id: data.project_id
					})
					.get();

				// 如果用户已经浏览过，不重复统计
				if (viewLogRes.affectedDocs > 0) {
					return {
						status: 1,
						msg: "用户已浏览过该项目",
						data: {
							view_count: currentViewCount,
							is_new_view: false
						}
					};
				}

				// 记录用户浏览历史
				await db.collection('xm-stp-project_view_log')
					.add({
						user_id: data.user_id,
						project_id: data.project_id,
						ip_address: data.ip_address || '',
						user_agent: data.user_agent || ''
					});
			}

			// 增加浏览量
			const newViewCount = currentViewCount + 1;
			await db.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.update({
					view_count: newViewCount
				});

			console.log(`项目 ${data.project_id} 浏览量从 ${currentViewCount} 增加到 ${newViewCount}`);

			return {
				status: 1,
				msg: "浏览量统计成功",
				data: {
					view_count: newViewCount,
					is_new_view: true
				}
			};

		} catch (error) {
			console.error('增加项目浏览量失败:', error);
			return {
				status: 0,
				msg: "浏览量统计失败: " + error.message
			};
		}
	},

	// 获取用户浏览过的项目列表
	async getUserViewHistory(data) {
		try {
			if (!data.user_id) {
				return {
					status: 0,
					msg: "用户ID不能为空"
				};
			}

			const page = data.page || 1;
			const limit = data.limit || 20;
			const skip = (page - 1) * limit;

			// 获取用户浏览记录
			const viewLogsRes = await db.collection('xm-stp-project_view_log')
				.where({
					user_id: data.user_id
				})
				.orderBy('view_time desc')
				.skip(skip)
				.limit(limit)
				.get();

			if (viewLogsRes.affectedDocs === 0) {
				return {
					status: 1,
					msg: "暂无浏览记录",
					data: []
				};
			}

			// 获取项目详情
			const projectIds = viewLogsRes.data.map(log => log.project_id);
			const projectsRes = await db.collection('xm-stp-project_detail')
				.where({
					_id: dbCmd.in(projectIds)
				})
				.field('_id,title,description,content_text,person_needed,current_members,view_count,create_time')
				.get();

			// 合并浏览记录和项目详情
			const result = viewLogsRes.data.map(log => {
				const project = projectsRes.data.find(p => p._id === log.project_id);
				return {
					...log,
					project: project || null
				};
			}).filter(item => item.project !== null);

			return {
				status: 1,
				msg: "获取成功",
				data: result,
				pagination: {
					page: page,
					limit: limit,
					total: result.length,
					hasMore: result.length >= limit
				}
			};

		} catch (error) {
			console.error('获取用户浏览历史失败:', error);
			return {
				status: 0,
				msg: "获取浏览历史失败: " + error.message
			};
		}
	}
}