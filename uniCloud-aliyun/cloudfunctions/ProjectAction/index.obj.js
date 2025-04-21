// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { getStatus,getInviteStatus } = require('project-history')
const { convertPosition, convertStatus } = require('b_project')
const { getType } = require('identified')
const { second } = require('timestamp')

// 发送项目通知的辅助函数（直接添加通知到数据库）
async function sendNotificationToUser(userId, projectId, title, content, type = 'other', actionData = {}) {
	console.log('尝试直接向用户发送通知:', { userId, projectId, title, content, type });
	
	try {
		// 准备通知数据
		const notification = {
			user_id: userId,
			project_id: projectId,
			title: title,
			content: content,
			type: type,
			status: 0, // 0表示未读
			action_data: actionData,
			create_time: new Date()
		};
		
		console.log('准备添加通知:', notification);
		
		// 直接添加到通知表
		const db = uniCloud.database();
		const dbForJQL = uniCloud.databaseForJQL();
		dbForJQL.setUser({
			role: ['admin']
		});
		
		const result = await db.collection('xm-stp-project-notification').add(notification);
		
		console.log('通知添加成功:', result);
		return {
			status: 1,
			msg: '通知发送成功',
			id: result.id
		};
	} catch (error) {
		console.error('直接添加通知失败:', error);
		throw error;
	}
}

/**
 * 发送项目通知
 * @param {Object} userId 接收通知的用户ID
 * @param {Object} projectId 项目ID
 * @param {Object} title 通知标题
 * @param {Object} content 通知内容
 * @param {Object} type 通知类型
 * @param {Object} actionData 额外数据
 */
async function sendProjectNotification(userId, projectId, title, content, type = 'other', actionData = {}) {
  console.log('顶部sendProjectNotification函数被调用, 参数:', { userId, projectId, title, type });
  
  if (!userId || !projectId || !title || !content) {
    console.error('发送项目通知失败：必要参数缺失');
    return;
  }
  
  try {
    // 显式设置管理员权限
    const admin_db = uniCloud.database();
    admin_db.setUser({
      role: ['admin']
    });
    
    // 查询项目信息
    const project = await admin_db.collection('xm-stp-project_detail').doc(projectId).field({
      title: 1
    }).get();
    
    if (!project.data || !project.data.length) {
      console.error(`发送项目通知失败：找不到项目信息 projectId=${projectId}`);
      return;
    }
    
    const projectName = project.data[0].title;
    const notificationData = {
      user_id: userId,
      project_id: projectId,
      title: title || `项目"${projectName}"通知`,
      content: content,
      type: type,
      status: 0,
      action_data: actionData,
      create_time: new Date()
    };
    
    console.log('准备添加顶部通知, 通知数据:', JSON.stringify(notificationData));
    
    // 添加到项目通知表
    const notificationResult = await admin_db.collection('xm-stp-project-notification').add(notificationData);
    
    console.log(`成功为用户${userId}发送项目通知，标题：${title}，结果:`, JSON.stringify(notificationResult));
    return true;
  } catch (error) {
    console.error('发送项目通知失败，详细错误:', error);
    if (error.message) console.error('错误消息:', error.message);
    if (error.stack) console.error('错误堆栈:', error.stack);
    return false;
  }
}

module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({
			role: ['admin'], 
		})
	},
	// 获取用户发起的项目
	async getSelf(data) {
		try {
			// 检查参数
			if (!data.user_id) {
				return {
					status: 0,
					msg: "用户ID不能为空"
				};
			}
			
			// 查询用户发起的项目
			const projects = await db.collection('xm-stp-project_detail')
				.where({
					user_id: data.user_id
				})
				.field('_id,title,person_needed,current_members,current_person_request,user_id,create_time')
				.get();
			
			if (projects.affectedDocs === 0) {
				return {
					status: 1,
					msg: "暂无项目",
					data: []
				};
			}
			
			// 收集项目IDs
			const projectIds = projects.data.map(p => p._id);
			
			// 获取项目的额外信息
			const projectsExtra = await db.collection('xm-stp-project')
				.where({
					_id: dbCmd.in(projectIds)
				})
				.field('_id,type_id,ending_time,view_count')
				.get();
			
			// 获取项目类型信息
			const typeIds = projectsExtra.data.map(p => p.type_id).filter(Boolean);
			const projectTypes = await db.collection('xm-stp-project_cat')
				.where({
					_id: dbCmd.in([...new Set(typeIds)])
				})
				.field('_id,name')
				.get();
			
			// 合并项目数据
			const mergedProjects = projects.data.map(project => {
				const extraInfo = projectsExtra.data.find(p => p._id === project._id) || {};
				const typeInfo = extraInfo.type_id ? 
					projectTypes.data.find(t => t._id === extraInfo.type_id) : null;
				
				return {
					...project,
					ending_time: extraInfo.ending_time,
					view_count: extraInfo.view_count || 0,
					project_cat: typeInfo ? { id: typeInfo._id, name: typeInfo.name } : null
				};
			});
			
			return {
				status: 1,
				msg: "获取成功",
				data: mergedProjects
			};
		} catch (error) {
			console.error('获取用户发起的项目失败:', error);
			return {
				status: 0,
				msg: "获取项目失败: " + error.message,
				data: []
			};
		}
	},
	// 申请加入项目（用户申请加入项目）
	async requestJoin(data){
		const checkProject = await db.collection('xm-stp-project_detail')
		.where({_id:data.project_id}).field('current_person_request').get()
		
		if(!checkProject.affectedDocs) return {
			status:0,
			msg:"项目不存在"
		}
		
		const check = await db.collection('xm-stp-project_app_request')
		.where({
			user_id:data.user_id,
			project_id:data.project_id,
		})
		.get()
		
		// 如果已存在申请，更新申请内容
		if(check.affectedDocs == 1) {
			try {
				// 只更新comment字段
				await db.collection('xm-stp-project_app_request')
				.where({
					user_id:data.user_id,
					project_id:data.project_id,
				})
				.update({
					comment:data.introduce
				})
				
				return {
					status:1,
					msg:"申请修改成功"
				}
			} catch (error) {
				console.error('修改申请失败:', error);
				return {
					status:0,
					msg:"修改申请失败: " + error.message
				}
			}
		}
		
		const check2 = await db.collection('xm-stp-project_app_invite')
		.where({
			user_id:data.user_id,
			project_id:data.project_id,
		})
		.get()
		if(check2.affectedDocs == 1) return {
			status:0,
			msg:"你已被邀请于这个项目"
		}
		
		
		const transaction = await db.startTransaction()
		await db.collection('xm-stp-project_app_request').add({
			user_id:data.user_id,
			project_id:data.project_id,
			comment:data.introduce,
			status:0
		})
		
		await db.collection('xm-stp-project_app_history').add({
			user_id:data.user_id,
			project_id:data.project_id,
			action:parseInt(getStatus('申请加入'))
		})
		
		
		await db.collection('xm-stp-project_detail').where({_id:data.project_id})
		.update({
			'current_person_request':checkProject.data[0].current_person_request + 1
		})
		
		// todo 可以考虑发消息给用户
		
		await transaction.commit()
		
		return {
			status:1,
			msg:"申请成功"
		}
	},
	// 获取用户已提交的申请信息
	async getRequestInfo(data) {
		try {
			if (!data.project_id || !data.user_id) {
				return {
					status: 0,
					msg: "项目ID和用户ID不能为空"
				};
			}
			
			// 查询用户对该项目的申请信息
			const requestRes = await db.collection('xm-stp-project_app_request')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();
				
			if (requestRes.affectedDocs === 0) {
				return {
					status: 0,
					msg: "未找到申请信息",
					data: null
				};
			}
			
			// 返回申请信息
			return {
				status: 1,
				msg: "获取申请信息成功",
				data: {
					_id: requestRes.data[0]._id,
					project_id: requestRes.data[0].project_id,
					user_id: requestRes.data[0].user_id,
					introduce: requestRes.data[0].comment,
					status: requestRes.data[0].status,
					create_time: requestRes.data[0].create_time
				}
			};
		} catch (error) {
			console.error('获取申请信息失败:', error);
			return {
				status: 0,
				msg: "获取申请信息失败: " + error.message,
				data: null
			};
		}
	},
	// 邀请加入项目（项目拥有者邀请别人）
	async inviteJoin(data){
		if(data.self_user == data.user_id) return {
			status: 0,
			msg: "不允许自己邀请自己"
		}
		
		const res = await db.collection('xm-stp-project_detail').where({
			_id:data.proj_id,
			user_id:data.self_user
		}).field('_id').get()
		if(!res.affectedDocs) return {
			status: 0,
			msg: "项目不存在"
		}
		
		let check = await db.collection('xm-stp-project_app_invite').where({
			user_id: data.user_id,
			project_id:data.proj_id
		}).field('_id').get()
		
		if(check.affectedDocs) return {
			status: 0,
			msg: "该用户已经有被邀请过"
		}
		
		check = await db.collection('xm-stp-project_app_request').where({
			user_id: data.user_id,
			project_id:data.proj_id
		}).field('_id').get()
		
		if(check.affectedDocs) return {
			status: 0,
			msg: "该用户已有申请加入你的项目，请记得去过目"
		}
		
		const transaction = await db.startTransaction()
		
		await db.collection('xm-stp-project_app_invite').add({
			user_id: data.user_id,
			project_id:data.proj_id,
			status:0,
			comment:data.self_introduce
		})
		
		await db.collection('xm-stp-project_app_history').add({
			user_id:data.user_id,
			project_id:data.proj_id,
			action:parseInt(getStatus('发出邀请'))
		})
		
		await transaction.commit()
		
		return {
			status:1,
			msg:"邀请成功"
		}
	},
	async getInvitedList(data){
		const res = await db.collection('xm-stp-project_app_invite')
		.where({'user_id':data.user_id})
		.field('project_id,status,comment,create_time')
		.orderBy('create_time desc')
		.get()
		
		if(res.affectedDocs == 0) return {
			status:1,
			msg:"OK",
			data:[]
		}
	},
	async getJoinList(data){
		// 检查参数
		if (!data.user_id && !data.project_id) {
			return {
				status: 0,
				msg: "请提供用户ID或项目ID"
			}
		}

		// 构建查询条件
		let whereCondition = {};
		
		// 如果提供了用户ID，查询该用户加入的所有项目
		if (data.user_id) {
			whereCondition.user_id = data.user_id;
		}
		
		// 如果提供了项目ID，查询该项目的所有成员
		if (data.project_id) {
			whereCondition.project_id = data.project_id;
		}
		
		// 只从 xm-stp-project_detail_user_rel 表获取数据，不再混合申请表数据
		const memberRelations = await db.collection('xm-stp-project_detail_user_rel')
			.where(whereCondition)
			.field("project_id,user_id,project_position,has_invite_permission") // 添加has_invite_permission字段
			.get();
		
		if(!memberRelations.data.length) {
			console.log('未找到项目成员关系');
			return {
				status: 1,
				msg: "OK",
				data: []
			}
		}
		
		// 获取所有项目ID
		const projIds = [...new Set(memberRelations.data.map(m => m.project_id))];
		
		// 获取所有用户ID
		const userIds = [...new Set(memberRelations.data.map(m => m.user_id))];
		
		// 查询这些用户的详细信息
		const userDetails = await db.collection('xm-stp-user_detail')
			.where({
				'_id': dbCmd.in(userIds)
			})
			.field('_id,real_name,nickname,year,education,college,major,contact')
			.get();
		
		// 查询项目详情 
		const projectDetails = await db.collection('xm-stp-project_detail')
			.where({
				'_id': dbCmd.in(projIds)
			})
			.field('_id,title,user_id,person_needed,create_time')
			.get();
		
		// 查询项目基本信息
		const projects = await db.collection('xm-stp-project')
			.where({
				'_id': dbCmd.in(projIds)
			})
			.field('_id,type_id,competition_id,ending_time')
			.get();
		
		// 提取项目类型ID
		const prjTypeList = [...new Set(projects.data.map(p => p.type_id).filter(id => id))];
		
		// 提取竞赛ID
		const compIds = [...new Set(projects.data.map(p => p.competition_id).filter(id => id))];
		
		// 查询项目类型信息
		let projectTypeDb = { data: [] };
		if (prjTypeList.length) {
			projectTypeDb = await db.collection('xm-stp-project_cat')
				.where({
					_id: dbCmd.in(prjTypeList)
				})
				.get();
		}
		
		// 查询竞赛信息
		let compList = { data: [] };
		if (compIds.length) {
			compList = await db.collection('xm-stp-project_comp_detail')
				.where({
					_id: dbCmd.in(compIds)
				})
				.field('_id,title')
				.get();
		}
		
		// 合并项目类型信息到项目中
		for (const project of projects.data) {
			if (project.type_id) {
				const typeInfo = projectTypeDb.data.find(t => t._id === project.type_id);
				if (typeInfo) {
					project.type = typeInfo.name;
				}
				delete project.type_id;
			}
			
			if (project.competition_id) {
				const compInfo = compList.data.find(c => c._id === project.competition_id);
				if (compInfo) {
					project.comp = compInfo.title;
				}
				delete project.competition_id;
			}
		}
		
		// 为每个成员关系添加详细信息
		const result = [];
		
		for (const relation of memberRelations.data) {
			// 查找用户信息
			const userInfo = userDetails.data.find(u => u._id === relation.user_id);
			if (!userInfo) {
				console.log(`跳过无效的用户ID: ${relation.user_id}`);
				continue; // 跳过没有用户信息的关系记录
			}
			
			// 查找项目信息
			const projectDetail = projectDetails.data.find(p => p._id === relation.project_id);
			if (!projectDetail) {
				console.log(`跳过无效的项目ID: ${relation.project_id}`);
				continue; // 跳过没有项目信息的关系记录
			}
			
			const projectInfo = projects.data.find(p => p._id === relation.project_id) || {};
			
			// 确定是否为创建者
			const isCreator = projectDetail.user_id === relation.user_id;
			
			// 如果是按用户ID查询，且该用户是项目创建者，则跳过该项目
			if (data.user_id && !data.project_id && isCreator) {
				console.log(`跳过用户创建的项目: ${relation.project_id}`);
				continue;
			}
			
			// 合并所有信息
			const memberData = {
				project_id: relation.project_id,
				user_id: relation.user_id,
				project_position: relation.project_position,
				is_creator: isCreator,
				has_invite_permission: !!relation.has_invite_permission, // 确保返回邀请权限字段
				// 用户信息
				real_name: userInfo.real_name || '',
				nickname: userInfo.nickname || '',
				year: userInfo.year || '',
				education: userInfo.education || '',
				college: userInfo.college || '',
				major: userInfo.major || '',
				contact: userInfo.contact || '',
				// 项目信息
				title: projectDetail.title || '',
				person_needed: projectDetail.person_needed || 0,
				ending_time: projectInfo.ending_time || 0,
				type: projectInfo.type || '',
			};
			
			if (projectInfo.comp) {
				memberData.comp = projectInfo.comp;
			}
			
			result.push(memberData);
		}
		
		// 如果是通过项目ID查询，确保项目创建者始终包含在结果中
		if (data.project_id && projectDetails.data.length > 0) {
			const project = projectDetails.data[0];
			const creatorId = project.user_id;
			
			// 检查创建者是否已在结果中
			if (creatorId && !result.some(r => r.user_id === creatorId)) {
				// 查找创建者信息
				const creatorInfo = userDetails.data.find(u => u._id === creatorId);
				if (creatorInfo) {
					const projectInfo = projects.data.find(p => p._id === data.project_id) || {};
					
					// 添加创建者信息
					result.push({
						project_id: data.project_id,
						user_id: creatorId,
						project_position: 1, // 1表示项目负责人
						is_creator: true,
						has_invite_permission: true, // 创建者默认有邀请权限
						// 用户信息
						real_name: creatorInfo.real_name || '',
						nickname: creatorInfo.nickname || '',
						year: creatorInfo.year || '',
						education: creatorInfo.education || '',
						college: creatorInfo.college || '',
						major: creatorInfo.major || '',
						contact: creatorInfo.contact || '',
						// 项目信息
						title: project.title || '',
						person_needed: project.person_needed || 0,
						ending_time: projectInfo.ending_time || 0,
						type: projectInfo.type || '',
					});
				}
			}
		}
		
		console.log(`getJoinList 返回有效成员数: ${result.length}`);
		
		return {
			status: 1,
			msg: "OK",
			data: result
		}
	},
	async getListFromMsg(data){
		if (!data.user_id) {
			return {
				status: 0,
				msg: "用户ID不能为空"
			}
		}
		
		// 获取用户创建的项目（用于查询收到的申请和发出的邀请）
		const selfCond = `user_id == '${data.user_id}' && status == 1 && ending_time > ${second()}`
		const selfProj = await db.collection('xm-stp-project')
		.where(selfCond)
		.field('_id')
		.orderBy('create_time','desc')
		.get()
		
		// 收到的请求（别人申请加入我的项目）
		let received_requests = []
		
		if(selfProj.affectedDocs){
			const projIds = []
			for(const i in selfProj.data) projIds.push(selfProj.data[i]._id)
			
			// 获取项目详细信息
			const selfProjDetail = await db.collection('xm-stp-project_detail')
			.where({
				_id:dbCmd.in(projIds)
			})
			.field('title,current_person_request')
			.get()
			
			for(const i1 in selfProj.data){
				for(const i2 in selfProjDetail.data){
					if(selfProj.data[i1]._id == selfProjDetail.data[i2]._id){
						selfProj.data[i1] = { ...selfProj.data[i1], ...selfProjDetail.data[i2]}
						break
					}
				}
			}
			
			// 获取申请加入这些项目的用户
			const requestUsers = await db.collection('xm-stp-project_app_request')
			.where({
				'project_id': dbCmd.in(projIds),
				'status': 0  // 待处理状态
			})
			.field('user_id,project_id,create_time,comment,status')
			.orderBy('create_time desc')
			.get()
			
			if(requestUsers.affectedDocs > 0) {
				// 获取申请用户的基本信息
				const userIds = requestUsers.data.map(item => item.user_id)
				const userDetails = await db.collection('xm-stp-user_detail')
				.where({
					'_id': dbCmd.in(userIds)
				})
				.field('_id,name,avatar')
				.get()
				
				// 组合项目和用户信息
				for(const req of requestUsers.data) {
					// 找到对应项目信息
					const projectInfo = selfProj.data.find(p => p._id === req.project_id) || {}
					
					// 找到对应用户信息
					const userInfo = userDetails.data.find(u => u._id === req.user_id) || {}
					
					received_requests.push({
						project_id: req.project_id,
						user_id: req.user_id,
						title: projectInfo.title || '',
						name: userInfo.name || '',
						avatar: userInfo.avatar || '',
						create_time: req.create_time,
						comment: req.comment || '',
						status: req.status
					})
				}
			}
		}
		
		// 收到的邀请（别人邀请我加入项目）
		const invitedProj = await db.collection('xm-stp-project_app_invite')
		.where({'user_id':data.user_id,'status':parseInt(getInviteStatus('等待回复'))})
		.field('project_id,create_time,comment')
		.orderBy('create_time desc')
		.get()
		
		let received_invites = []
		
		if(invitedProj.affectedDocs){
			const projIds = []
			for(const i in invitedProj.data) projIds.push(invitedProj.data[i].project_id)
			
			// 获取项目详情
			const invitedProjDetail = await db.collection('xm-stp-project_detail')
			.where({
				_id:dbCmd.in(projIds)
			})
			.field('title,user_id')
			.get()
			
			// 获取项目创建者信息
			const ownerIds = invitedProjDetail.data.map(item => item.user_id)
			const ownerDetails = await db.collection('xm-stp-user_detail')
			.where({
				'_id': dbCmd.in(ownerIds)
			})
			.field('_id,name,avatar')
			.get()
			
			for(const i1 in invitedProj.data){
				// 找到项目详情
				const projectDetail = invitedProjDetail.data.find(p => p._id === invitedProj.data[i1].project_id) || {}
				
				// 找到项目创建者
				const ownerInfo = ownerDetails.data.find(u => u._id === projectDetail.user_id) || {}
				
				received_invites.push({
					...invitedProj.data[i1],
					title: projectDetail.title || '',
					owner_id: projectDetail.user_id || '',
					owner_name: ownerInfo.name || '',
					owner_avatar: ownerInfo.avatar || ''
				})
			}
		}
		
		// 发出的请求（我申请加入的项目）
		const sentRequests = await db.collection('xm-stp-project_app_request')
		.where({'user_id':data.user_id})
		.field('project_id,status,create_time,comment')
		.orderBy('create_time desc')
		.get()
		
		let sent_requests = []
		
		if(sentRequests.affectedDocs){
			const projIds = sentRequests.data.map(item => item.project_id)
			
			// 获取项目详情
			const projectDetails = await db.collection('xm-stp-project_detail')
			.where({
				'_id': dbCmd.in(projIds)
			})
			.field('_id,title,user_id')
			.get()
			
			// 获取项目创建者信息
			const ownerIds = projectDetails.data.map(item => item.user_id)
			const ownerInfo = await db.collection('xm-stp-user_detail')
			.where({
				'_id': dbCmd.in(ownerIds)
			})
			.field('_id,name,avatar')
			.get()
			
			for(const req of sentRequests.data){
				// 找到项目详情
				const projectDetail = projectDetails.data.find(p => p._id === req.project_id) || {}
				
				// 找到项目创建者
				const owner = ownerInfo.data.find(u => u._id === projectDetail.user_id) || {}
				
				sent_requests.push({
					project_id: req.project_id,
					status: req.status,
					create_time: req.create_time,
					comment: req.comment || '',
					title: projectDetail.title || '',
					owner_id: projectDetail.user_id || '',
					owner_name: owner.name || '',
					owner_avatar: owner.avatar || ''
				})
			}
		}
		
		// 发出的邀请（我邀请别人加入我的项目）
		let sent_invites = []
		
		if(selfProj.affectedDocs){
			const projIds = selfProj.data.map(item => item._id)
			
			const sentInvites = await db.collection('xm-stp-project_app_invite')
			.where({
				'project_id': dbCmd.in(projIds)
			})
			.field('user_id,project_id,status,create_time,comment')
			.orderBy('create_time desc')
			.get()
			
			if(sentInvites.affectedDocs){
				// 获取被邀请者的信息
				const userIds = sentInvites.data.map(item => item.user_id)
				const userDetails = await db.collection('xm-stp-user_detail')
				.where({
					'_id': dbCmd.in(userIds)
				})
				.field('_id,name,avatar')
				.get()
				
				for(const invite of sentInvites.data){
					// 找到项目信息
					const projectInfo = selfProj.data.find(p => p._id === invite.project_id) || {}
					
					// 找到被邀请用户信息
					const userInfo = userDetails.data.find(u => u._id === invite.user_id) || {}
					
					sent_invites.push({
						project_id: invite.project_id,
						user_id: invite.user_id,
						status: invite.status,
						create_time: invite.create_time,
						comment: invite.comment || '',
						title: projectInfo.title || '',
						name: userInfo.name || '',
						avatar: userInfo.avatar || ''
					})
				}
			}
		}
		
		return {
			status:1,
			msg:'OK',
			data:{
				invite_list: received_invites,       // 我收到的邀请
				request_list: sent_requests,         // 我发出的申请
				invite_others_list: sent_invites,    // 我发出的邀请
				request_others_list: received_requests // 我收到的申请
			}
		}
	},
	async approveJoin(params){
		// ... existing code ...
		// 发送系统通知
		console.log(`准备发送请求同意通知, user_id: ${params.user_id}, project_id: ${params.project_id}`);
		await sendProjectNotification(
			params.user_id,
			params.project_id, 
			`项目申请已通过`, 
			`您申请加入的项目"${project_detail.data[0].title}"已通过审核，现在可以参与项目了。`,
			'approve_join',
			{
				project_id: params.project_id
			}
		);
		// ... existing code ...
	},
	async declineJoin(data){
		const check = await db.collection('xm-stp-project_app_invite')
		.where({
			project_id:data.project_id,
			user_id:data.user_id
		})
		.get()
		
		if(!check.affectedDocs) return{
			status:0,
			msg:"项目邀请不存在"
		}
		else if(check.data[0].status == getInviteStatus('已拒绝')) 
		return {
			status:0,
			msg: "项目早已拒绝"
		}
		
		
		
		const transaction = await db.startTransaction()
		
		await db.collection('xm-stp-project_app_invite')
		.where({
			project_id:data.project_id,
			user_id:data.user_id
		})
		.update({
			status: parseInt(getInviteStatus('已拒绝'))
		})
		
		await db.collection('xm-stp-project_detail_user_rel')
		.where({
			project_id:data.project_id,
			user_id:data.user_id
		}).delete()
		
		await db.collection('xm-stp-project_app_history').add({
			user_id:data.user_id,
			project_id:data.project_id,
			action:parseInt(getStatus('拒绝邀请'))
		})
		
		await transaction.commit()
		
		return {
			status: 1,
			msg: "拒绝邀请成功"
		}
	},
	async updateProjectMembers(data){
		const check = await db.collection('xm-stp-project_detail')
		.where({_id:data.id,user_id:data.user_id}).field('_id').get()
		if(!check.affectedDocs) return {
			status:0,
			msg:'不存在该项目'
		}
		
		// 如果是请求获取统计数据
		if (data.action === 'getStats') {
			try {
				// 获取项目详情
				const projectDetail = await db.collection('xm-stp-project_detail')
					.doc(data.id)
					.field('current_members, person_needed')
					.get();
				
				// 获取申请人数
				const requestCount = await db.collection('xm-stp-project_app_request')
					.where({
						project_id: data.id,
						status: 0 // 只计算待处理的申请
					})
					.count();
				
				// 获取成员数量
				const memberCount = await db.collection('xm-stp-project_detail_user_rel')
					.where({
						project_id: data.id,
						project_position: dbCmd.neq(1) // 不统计项目负责人
					})
					.count();
				
				// 组装统计结果
				const statsResult = {
					current_members: memberCount.total > 0 ? memberCount.total : 
						(projectDetail.data.length > 0 ? projectDetail.data[0].current_members || 0 : 0),
					current_person_request: requestCount.total > 0 ? requestCount.total : 0,
					person_needed: projectDetail.data.length > 0 ? projectDetail.data[0].person_needed || 0 : 0
				};
				
				// 更新项目详情表中的统计数据
				await db.collection('xm-stp-project_detail')
					.doc(data.id)
					.update({
						current_members: statsResult.current_members,
						current_person_request: statsResult.current_person_request
					});
				
				return {
					status: 1,
					msg: "获取统计数据成功",
					data: statsResult
				};
			} catch (error) {
				console.error('获取项目统计数据失败:', error);
				return {
					status: 0,
					msg: "获取统计数据失败: " + error.message
				};
			}
		}
		
		/**
		 * 这里分成3种情况
		 * 1. 从申请中被选入待定甚至是内定成员
		 * 2. 从待定或内定成员被踢回申请中（如果是邀请来的则最低只能在待定）
		 * 3. 待定和内定成员之间变换
		 * 
		 * 1 的情况是需要再project的user_rel里边注册，并且在request表进行更新
		 * 2 是需要从user_rel删除，在request表中更新
		 * 3 的则只需要在user_rel里边调整就行了
		 */
		const list = {unpickedToMember:[], memberToUnpicked:[],  memberAction:[]}
		for(const i in data.data){
			
			switch(data.data[i].from){
				case 'pending':
				case 'confirm':
					if(['pending','confirm'].includes(data.data[i].to)) list.memberAction.push(data.data[i])
					else if(data.data[i].to == 'unpicked') list.memberToUnpicked.push(data.data[i])
				break;
				case 'unpicked':
					list.unpickedToMember.push(data.data[i])
				break;
			}
			
		}
		
		// 做2
		if(list.memberToUnpicked.length){
			const userList = []
			for(const i in list.memberToUnpicked) userList.push(list.memberToUnpicked[i].user_id)
			
			const checkInvited = await db.collection('xm-stp-project_app_invite').where({
				'user_id':dbCmd.in(userList)
			}).get()
			
			if(checkInvited.affectedDocs) return {
				status:0,
				msg:"你邀请的成员是不能放入（还未选上），若不要改成员请放在待定成员中"
			}
			
			await db.collection('xm-stp-project_detail_user_rel').where({
				'user_id':dbCmd.in(userList),
				'project_id':data.id
			}).remove()
			
			await db.collection('xm-stp-project_app_request').where({
				user_id:dbCmd.in(userList),
				project_id:data.id
			})
			.update({
				status:0
			})
			
		}
		
		// 做3
		if(list.memberAction.length){
			const pendingToConfirm = []
			const confirmToPending = []
			
			for(const i in list.memberAction){
				if(list.memberAction[i].from == 'pending' && list.memberAction[i].to == 'confirm')
					pendingToConfirm.push(list.memberAction[i].user_id)
				else
					confirmToPending.push(list.memberAction[i].user_id)
			}
			
			if(pendingToConfirm.length)
				await db.collection('xm-stp-project_detail_user_rel').where({
					'user_id':dbCmd.in(pendingToConfirm),
					'project_id':data.id
				}).update({
					'project_position':parseInt(convertPosition('成员')) 
				})
			
			if(confirmToPending.length)
				await db.collection('xm-stp-project_detail_user_rel').where({
					'user_id':dbCmd.in(confirmToPending),
					'project_id':data.id
				}).update({
					'project_position':parseInt(convertPosition('待定成员'))
				})
		}
		
		// 做1
		if(list.unpickedToMember.length){
			const toPending = []
			const toConfirm = []
			for(const i in list.unpickedToMember){
				if(list.unpickedToMember[i].to == 'pending')
					toPending.push(list.unpickedToMember[i].user_id)
				else
					toConfirm.push(list.unpickedToMember[i].user_id)
			}
				
			await db.collection('xm-stp-project_app_request').where({
				user_id:dbCmd.in(toPending.concat(toConfirm)),
				project_id:data.id
			})
			.update({
				status:1
			})
			
			if(toPending.length){
				const list = []
				for(const i in toPending) 
					list.push({
					'user_id':toPending[i],
					'project_id':data.id,
					'project_position':parseInt(convertPosition('待定成员'))
				})
				
				await db.collection('xm-stp-project_detail_user_rel').add(list)
			}
				
			
			if(toConfirm.length){
				const list = []
				for(const i in toConfirm) 
					list.push({
					'user_id':toConfirm[i],
					'project_id':data.id,
					'project_position':parseInt(convertPosition('成员'))
				})
				
				await db.collection('xm-stp-project_detail_user_rel').add(list)
			}
			
			// 更新项目中的成员数量
			try {
				// 获取当前成员数
				const projectDetailRes = await db.collection('xm-stp-project_detail')
					.doc(data.id)
					.field('current_members, person_needed')
					.get();
				
				if (projectDetailRes.data && projectDetailRes.data.length > 0) {
					let currentMembers = projectDetailRes.data[0].current_members || 0;
					const personNeeded = projectDetailRes.data[0].person_needed || 10;
					
					// 增加成员数量，最多不超过需求人数
					const addedMembers = toPending.length + toConfirm.length;
					let newMembers = currentMembers + addedMembers;
					if (newMembers > personNeeded) {
						newMembers = personNeeded;
					}
					
					// 更新项目详情表中的成员数
					await db.collection('xm-stp-project_detail')
						.doc(data.id)
						.update({
							current_members: newMembers
						});
					console.log(`已更新项目 ${data.id} 的成员数为 ${newMembers}`);
				}
			} catch (memberError) {
				console.error('更新项目成员数失败:', memberError);
				// 错误不影响主流程
			}
		}
		
		return {
			status:1,
			msg:"更新成功"
		}
	},
	async checkRequestStatus(data) {
		try {
			if (!data.project_id || !data.user_id) {
				return {
					status: 0,
					msg: "项目ID和用户ID不能为空"
				};
			}
			
			// 只检查用户是否在xm-stp-project_app_request表中有申请记录
			const requestRes = await db.collection('xm-stp-project_app_request')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();
				
			// 判断用户是否已申请
			const hasRequested = requestRes.affectedDocs > 0;
			
			return {
				status: 1,
				msg: hasRequested ? "用户已申请项目" : "用户未申请",
				data: hasRequested
			};
		} catch (error) {
			console.error('检查申请状态失败:', error);
			return {
				status: 0,
				msg: "检查申请状态失败: " + error.message,
				data: false
			};
		}
	},
	approveRequest: async (data) => {
		if (!data.project_id) {
			return {
				status: false,
				msg: '缺少项目ID'
			};
		}
		if (!data.user_id) {
			return {
				status: false,
				msg: '缺少用户ID'
			};
		}

		const db = uniCloud.database();
		const dbCmd = db.command;
		
		// 开启事务
		try {
			return await db.runTransaction(async transaction => {
				// 1. 查询请求记录
				const requestRecord = await transaction.collection('project_members').where({
					project_id: data.project_id,
					user_id: data.user_id,
					status: 0,     // 状态为待处理
					type: 'request' // 类型为请求
				}).get();
				
				if (requestRecord.data.length === 0) {
					return {
						status: false,
						msg: '未找到请求记录或请求已处理'
					};
				}
				
				// 2. 更新请求状态为已接受
				await transaction.collection('project_members').doc(requestRecord.data[0]._id).update({
					status: 1,  // 1表示已接受
					update_time: parseInt(Date.now() / 1000)
				});
				
				// 3. 查询项目信息，获取当前成员列表
				const projectInfo = await transaction.collection('projects').doc(data.project_id).get();
				if (projectInfo.data.length === 0) {
					return {
						status: false,
						msg: '项目不存在'
					};
				}
				
				const members = projectInfo.data[0].members || [];
				// 如果用户已在成员列表中，则不需要添加
				if (!members.includes(data.user_id)) {
					members.push(data.user_id);
				}
				
				// 4. 更新项目成员列表
				await transaction.collection('projects').doc(data.project_id).update({
					members: members
				});
				
				return {
					status: true,
					msg: '已接受申请',
					data: {
						project_id: data.project_id,
						user_id: data.user_id
					}
				};
			});
		} catch (e) {
			console.error('接受申请失败', e);
			return {
				status: false,
				msg: '处理申请失败，请稍后再试'
			};
		}
	},

	declineRequest: async (data) => {
		if (!data.project_id) {
			return {
				status: false,
				msg: '缺少项目ID'
			};
		}
		if (!data.user_id) {
			return {
				status: false,
				msg: '缺少用户ID'
			};
		}

		const db = uniCloud.database();
		
		// 查询请求记录
		const requestRecord = await db.collection('project_members').where({
			project_id: data.project_id,
			user_id: data.user_id,
			status: 0,      // 状态为待处理
			type: 'request'  // 类型为请求
		}).get();
		
		if (requestRecord.data.length === 0) {
			return {
				status: false,
				msg: '未找到请求记录或请求已处理'
			};
		}
		
		// 更新请求状态为已拒绝
		try {
			await db.collection('project_members').doc(requestRecord.data[0]._id).update({
				status: 2,  // 2表示已拒绝
				update_time: parseInt(Date.now() / 1000)
			});
			
			return {
				status: true,
				msg: '已拒绝申请',
				data: {
					project_id: data.project_id,
					user_id: data.user_id
				}
			};
		} catch (e) {
			console.error('拒绝申请失败', e);
			return {
				status: false,
				msg: '处理申请失败，请稍后再试'
			};
		}
	},
	
	// 拒绝用户申请的完整流程处理方法
	async rejectUserRequest(data) {
		try {
			// 设置管理员权限，允许访问数据库
			db.setUser({
				role: ['admin']
			});
			
			if (!data.project_id || !data.user_id || !data.operator_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID、申请用户ID和操作者ID"
				};
			}
			
			// 1. 首先验证操作者是否是项目的创建者
			const projectCheck = await db.collection('xm-stp-project_detail')
				.where({_id: data.project_id, user_id: data.operator_id})
				.field('_id')
				.get();
				
			if (!projectCheck.affectedDocs) {
				return {
					status: 0,
					msg: "权限不足，只有项目创建者可以拒绝申请"
				};
			}
			
			// 2. 检查是否存在申请记录
			const requestCheck = await db.collection('xm-stp-project_app_request')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();
				
			if (!requestCheck.affectedDocs) {
				return {
					status: 0,
					msg: "未找到有效的申请记录"
				};
			}
			
			// 3. 只执行基本的拒绝操作 - 更新申请状态为申请者未读(3)
			try {
				console.log('准备更新拒绝申请状态');
				
				// 3.1 更新申请记录的状态为申请者未读(3)，而不是直接设为已拒绝(2)
				const updateData = {
					status: 3, // 状态3表示申请者未读，处理结果是拒绝
					result: 2,  // 增加result字段记录实际处理结果：2表示已拒绝
				};
				
				// 如果提供了拒绝理由，则添加到更新数据中
				if (data.reject_reason && data.reject_reason.trim()) {
					updateData.reject_reason = data.reject_reason.trim();
				}
				
				console.log('更新数据:', updateData);
				
				const reqRes = await db.collection('xm-stp-project_app_request')
					.where({
						user_id: data.user_id,
						project_id: data.project_id
					})
					.update(updateData);
				
				console.log('更新结果:', reqRes);
				
				// 判断是否更新成功
				if (reqRes && reqRes.updated > 0) {
					// 同时发送一条系统消息给申请者
					try {
						const projectDetail = await db.collection('xm-stp-project_detail')
							.doc(data.project_id)
							.field('title')
							.get();
						
						const projectTitle = projectDetail.data.length ? projectDetail.data[0].title || '项目' : '项目';
						
						// 构建消息内容，只有在有拒绝理由时才添加拒绝理由部分
						let messageContent = `您申请加入的项目「${projectTitle}」已被拒绝。`;
						if (data.reject_reason && data.reject_reason.trim()) {
							messageContent += `拒绝理由：${data.reject_reason.trim()}`;
						}
						
						await db.collection('xm-stp-message').add({
							user_id: data.user_id,
							title: '申请被拒绝通知',
							content: messageContent,
							type: 'system',
							status: 0, // 0表示未读
							create_time: new Date() // 保持这里为Date对象
						});
					} catch (msgError) {
						console.error('发送拒绝通知失败', msgError);
						// 不影响主流程，失败不返回错误
					}
					
					return {
						status: 1,
						msg: "拒绝申请成功"
					};
				} else {
					return {
						status: 0,
						msg: "拒绝申请失败：数据未更新"
					};
				}
			} catch (dbError) {
				console.error('数据库操作失败:', dbError);
				return {
					status: 0,
					msg: "拒绝申请失败: " + dbError.message
				};
			}
		} catch (error) {
			console.error('拒绝用户申请失败:', error);
			return {
				status: 0,
				msg: "处理申请失败: " + error.message
			};
		}
	},
	
	// 新增：通过用户申请的完整流程处理方法
	async approveUserRequest(data) {
		try {
			// 设置管理员权限，允许访问数据库
			db.setUser({
				role: ['admin']
			});
			
			if (!data.project_id || !data.user_id || !data.operator_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID、申请用户ID和操作者ID"
				};
			}
			
			// 1. 首先验证操作者是否是项目的创建者
			const projectCheck = await db.collection('xm-stp-project_detail')
				.where({_id: data.project_id, user_id: data.operator_id})
				.field('_id')
				.get();
				
			if (!projectCheck.affectedDocs) {
				return {
					status: 0,
					msg: "权限不足，只有项目创建者可以通过申请"
				};
			}
			
			// 2. 检查是否存在申请记录
			const requestCheck = await db.collection('xm-stp-project_app_request')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();
				
			if (!requestCheck.affectedDocs) {
				return {
					status: 0,
					msg: "未找到有效的申请记录"
				};
			}
			
			// 3. 获取用户类型，用于决定项目中的职位
			const user = await db.collection('xm-stp-user_detail')
				.doc(data.user_id)
				.field('type')
				.get();
			
			let projectPosition = 3; // 修改为3，表示待定成员
			if (user.data && user.data.length > 0) {
				const userType = await getType(user.data[0].type);
				if (userType && userType.name === "老师") {
					projectPosition = 0; // 老师设置为指导老师(0)
				}
			}
			
			// 4. 使用直接数据库操作而不是事务
			try {
				// 4.1 更新申请记录的状态为申请者未读(3)，而不是直接设为已接受(1)
				const reqUpdateRes = await db.collection('xm-stp-project_app_request')
					.where({
						user_id: data.user_id,
						project_id: data.project_id
					})
					.update({
						status: 3, // 状态3表示申请者未读，处理结果是接受
						result: 1   // 增加result字段记录实际处理结果：1表示已接受
					});
				
				// 4.2 添加用户到项目成员关系表
				const addMemberRes = await db.collection('xm-stp-project_detail_user_rel').add({
					project_id: data.project_id,
					user_id: data.user_id,
					project_position: projectPosition
				});
				
				// 4.3 更新项目当前成员数量
				try {
					// 先获取当前成员数
					const projectDetailRes = await db.collection('xm-stp-project_detail')
						.doc(data.project_id)
						.field('current_members, person_needed')
						.get();
					
					if (projectDetailRes.data && projectDetailRes.data.length > 0) {
						let currentMembers = projectDetailRes.data[0].current_members || 0;
						const personNeeded = projectDetailRes.data[0].person_needed || 10;
						
						// 确保不超过需求人数上限
						if (currentMembers < personNeeded) {
							currentMembers++;
							
							// 更新项目详情表中的成员数
							await db.collection('xm-stp-project_detail')
								.doc(data.project_id)
								.update({
									current_members: currentMembers
								});
							console.log(`已更新项目 ${data.project_id} 的成员数为 ${currentMembers}`);
						}
					}
				} catch (memberError) {
					console.error('更新项目成员数失败:', memberError);
					// 错误不影响主流程
				}
				
				// 4.4 添加操作历史记录
				await db.collection('xm-stp-project_app_history').add({
					user_id: data.user_id,
					project_id: data.project_id,
					action: 2 // 使用固定数字代替getStatus('申请被接受')
				});
				
				// 4.5 发送系统消息通知申请者 - 使用新的通知函数
				try {
					await this.sendProjectNotification({
						user_id: data.user_id,
						project_id: data.project_id,
						title: '申请通过通知',
						content: `恭喜！您申请加入的项目「{{projectTitle}}」已被通过，您现在是该项目的待定成员。项目负责人后续可能会将您转为正式成员。`,
						type: 'member_status',
						action_data: {
							from: 'application',
							to: 'pending',
							operator_id: data.operator_id
						}
					});
					
					console.log(`已成功发送申请通过通知给用户 ${data.user_id}`);
				} catch (notifyError) {
					// 记录通知发送错误，但不影响主流程
					console.error('发送申请通过通知失败，但申请已被成功接受:', notifyError);
				}
				
				return {
					status: 1,
					msg: "通过申请成功"
				};
			} catch (dbError) {
				console.error('数据库操作失败:', dbError);
				return {
					status: 0,
					msg: "通过申请失败: " + dbError.message
				};
			}
		} catch (error) {
			console.error('通过用户申请失败:', error);
			return {
				status: 0,
				msg: "处理申请失败: " + error.message
			};
		}
	},
	// 新增：手动标记申请为已读的方法
	async markRequestAsRead(data) {
		try {
			// 设置管理员权限，允许访问数据库
			db.setUser({
				role: ['admin']
			});
			
			if (!data.request_id || !data.operator_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供申请ID和操作者ID"
				};
			}
			
			// 检查是否存在申请记录
			const requestCheck = await db.collection('xm-stp-project_app_request')
				.doc(data.request_id)
				.get();
				
			if (!requestCheck.data || requestCheck.data.length === 0) {
				return {
					status: 0,
					msg: "未找到有效的申请记录"
				};
			}
			
			// 检查操作者是否就是申请者本人
			if (requestCheck.data[0].user_id !== data.operator_id) {
				return {
					status: 0,
					msg: "权限不足，只有申请者本人可以标记为已读"
				};
			}
			
			// 检查申请记录是否处于未读状态(3)
			if (requestCheck.data[0].status !== 3) {
				return {
					status: 0,
					msg: "该申请不是未读状态，无需标记"
				};
			}
			
			// 执行标记操作 - 更新申请状态为已读(4)
			try {
				console.log('准备更新申请的已读状态');
				
				const reqRes = await db.collection('xm-stp-project_app_request')
					.doc(data.request_id)
					.update({
						status: 4 // 状态4表示申请者已读
					});
				
				console.log('更新结果:', reqRes);
				
				// 判断是否更新成功
				if (reqRes && reqRes.updated > 0) {
					return {
						status: 1,
						msg: "标记为已读成功"
					};
				} else {
					return {
						status: 0,
						msg: "标记为已读失败：数据未更新"
					};
				}
			} catch (dbError) {
				console.error('数据库操作失败:', dbError);
				return {
					status: 0,
					msg: "标记为已读失败: " + dbError.message
				};
			}
		} catch (error) {
			console.error('标记申请为已读失败:', error);
			return {
				status: 0,
				msg: "标记为已读失败: " + error.message
			};
		}
	},
	// 新增：用于更新成员邀请权限的方法
	async updateMemberPermission(data) {
		try {
			// 设置管理员权限，允许访问数据库
			db.setUser({
				role: ['admin']
			});
			
			if (!data.project_id || !data.user_id || !data.operator_id || !data.action) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID、成员ID、操作者ID和操作类型"
				};
			}
			
			// 1. 首先验证操作者是否是项目的创建者
			const projectCheck = await db.collection('xm-stp-project_detail')
				.where({_id: data.project_id, user_id: data.operator_id})
				.field('_id')
				.get();
				
			if (!projectCheck.affectedDocs) {
				return {
					status: 0,
					msg: "权限不足，只有项目创建者可以管理成员权限"
				};
			}
			
			// 2. 检查成员是否存在于项目中
			const memberCheck = await db.collection('xm-stp-project_detail_user_rel')
				.where({
					project_id: data.project_id,
					user_id: data.user_id
				})
				.get();
				
			if (!memberCheck.affectedDocs) {
				return {
					status: 0,
					msg: "该用户不是项目成员"
				};
			}
			
			// 3. 确认成员不是创建者或指导老师
			const member = memberCheck.data[0];
			if (member.project_position === 0 || member.project_position === 1) {
				return {
					status: 0,
					msg: "无法修改创建者或指导老师的权限"
				};
			}
			
			// 4. 执行操作
			let updateData = {};
			
			// 根据操作类型设置字段
			if (data.action === 'add_invite_permission') {
				updateData.has_invite_permission = true;
			} else if (data.action === 'remove_invite_permission') {
				updateData.has_invite_permission = false;
			} else {
				return {
					status: 0,
					msg: "未知的操作类型"
				};
			}
			
			// 5. 更新数据库
			try {
				const updateResult = await db.collection('xm-stp-project_detail_user_rel')
					.where({
						project_id: data.project_id,
						user_id: data.user_id
					})
					.update(updateData);
				
				if (updateResult.updated > 0) {
					// 发送系统消息通知用户获得邀请权限
					try {
						// 获取项目信息
						const projectDetail = await db.collection('xm-stp-project_detail')
							.doc(data.project_id)
							.field('title')
							.get();
						
						const projectTitle = projectDetail.data && projectDetail.data.length > 0 ? 
							projectDetail.data[0].title || '项目' : '项目';
						
						// 创建并发送系统消息
						await db.collection('xm-stp-message').add({
							user_id: data.user_id,
							title: '获得项目邀请权限',
							content: `您在项目「${projectTitle}」中获得了邀请权限，现在可以邀请其他用户加入此项目。`,
							type: 'system',
							status: 0, // 0表示未读
							create_time: new Date()
						});
						
						console.log('已发送邀请权限授予通知给用户:', data.user_id);
					} catch (msgError) {
						console.error('发送系统消息失败:', msgError);
						// 消息发送失败不影响主流程
					}
					
					return {
						status: 1,
						msg: "已授予该成员邀请权限"
					};
				} else {
					return {
						status: 0,
						msg: "更新失败：没有记录被修改"
					};
				}
			} catch (dbError) {
				console.error('数据库更新失败:', dbError);
				return {
					status: 0,
					msg: "更新成员权限失败: " + dbError.message
				};
			}
		} catch (error) {
			console.error('更新成员权限失败:', error);
			return {
				status: 0,
				msg: "操作失败: " + error.message
			};
		}
	},
	// 辅助函数：发送项目通知
	async sendProjectNotification(data) {
		try {
			console.log('开始发送项目通知, 参数:', JSON.stringify(data));
			
			if (!data.user_id || !data.project_id || !data.title || !data.content || !data.type) {
				console.error('发送通知参数不完整:', data);
				return false;
			}
			
			// 显式设置管理员权限，以确保可以操作数据库
			const admin_db = uniCloud.database();
			admin_db.setUser({
				role: ['admin']
			});
			
			// 获取项目信息以供显示
			const projectDetail = await admin_db.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.field('title')
				.get();
			
			console.log('项目详情查询结果:', JSON.stringify(projectDetail));
			
			const projectTitle = projectDetail.data && projectDetail.data.length > 0 ? 
				projectDetail.data[0].title || '项目' : '项目';
			
			// 构建通知内容，如果已提供则使用提供的内容
			const finalContent = data.content.replace(/{{projectTitle}}/g, projectTitle);
			
			console.log('准备添加通知到xm-stp-project-notification表, 内容:', finalContent);
			
			// 使用admin_db向项目通知表添加通知
			const notificationData = {
				user_id: data.user_id,
				project_id: data.project_id,
				title: data.title,
				content: finalContent,
				type: data.type,
				status: 0, // 0表示未读
				action_data: data.action_data || {},
				create_time: new Date()
			};
			
			console.log('即将写入数据库的通知数据:', JSON.stringify(notificationData));
			
			// 向项目通知表添加通知
			const notificationResult = await admin_db.collection('xm-stp-project-notification').add(notificationData);
			
			console.log('通知添加结果:', JSON.stringify(notificationResult));
			console.log('已成功发送项目通知给用户:', data.user_id, '类型:', data.type);
			return true;
		} catch (error) {
			console.error('发送项目通知失败, 详细错误:', error);
			if (error.message) console.error('错误消息:', error.message);
			if (error.stack) console.error('错误堆栈:', error.stack);
			return false;
		}
	},
	// 管理项目成员状态和权限的方法
	async manageMember(data) {
		try {
			// 设置管理员权限，允许访问数据库
			db.setUser({
				role: ['admin']
			});
			
			if (!data.project_id || !data.user_id || !data.operator_id || !data.action) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID、成员ID、操作者ID和操作类型"
				};
			}
			
			// 1. 首先验证操作者是否是项目的创建者或有权限的成员
			const projectCheck = await db.collection('xm-stp-project_detail')
				.where({_id: data.project_id})
				.field('_id,user_id')
				.get();
				
			if (!projectCheck.affectedDocs) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}
			
			// 检查操作者是否是项目创建者
			const isCreator = projectCheck.data[0].user_id === data.operator_id;
			
			// 如果不是创建者，检查是否有邀请权限
			if (!isCreator) {
				const operatorCheck = await db.collection('xm-stp-project_detail_user_rel')
					.where({
						project_id: data.project_id,
						user_id: data.operator_id,
						has_invite_permission: true
					})
					.get();
					
				if (!operatorCheck.affectedDocs) {
					return {
						status: 0,
						msg: "权限不足，您没有管理成员的权限"
					};
				}
			}
			
			// 2. 检查目标成员是否存在于项目中
			const memberCheck = await db.collection('xm-stp-project_detail_user_rel')
				.where({
					project_id: data.project_id,
					user_id: data.user_id
				})
				.get();
			
			// 成员存在时的操作
			if (memberCheck.affectedDocs > 0) {
				const member = memberCheck.data[0];
				
				// 3. 确认成员不是创建者或指导老师（这些角色不能被修改）
				if (member.project_position === 0 || member.project_position === 1) {
					return {
						status: 0,
						msg: "无法修改创建者或指导老师的状态"
					};
				}
				
				// 4. 执行操作
				switch (data.action) {
					case 'add_invite_permission':
						// 只有项目创建者可以授予邀请权限
						if (!isCreator) {
							return {
								status: 0,
								msg: "只有项目创建者可以设置邀请权限"
							};
						}
						
						await db.collection('xm-stp-project_detail_user_rel')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.update({
								has_invite_permission: true
							});
							
						// 发送项目通知
						await this.sendProjectNotification({
							user_id: data.user_id,
							project_id: data.project_id,
							title: '获得项目邀请权限',
							content: `您在项目「{{projectTitle}}」中获得了邀请权限，现在可以邀请其他用户加入此项目。`,
							type: 'invite_permission',
							action_data: {
								action: 'add_permission',
								operator_id: data.operator_id
							}
						});
						
						return {
							status: 1,
							msg: "已授予该成员邀请权限"
						};
						
					case 'remove_invite_permission':
						// 只有项目创建者可以移除邀请权限
						if (!isCreator) {
							return {
								status: 0,
								msg: "只有项目创建者可以设置邀请权限"
							};
						}
						
						await db.collection('xm-stp-project_detail_user_rel')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.update({
								has_invite_permission: false
							});
							
						// 发送项目通知
						await this.sendProjectNotification({
							user_id: data.user_id,
							project_id: data.project_id,
							title: '项目邀请权限移除',
							content: `您在项目「{{projectTitle}}」中的邀请权限已被移除。`,
							type: 'invite_permission',
							action_data: {
								action: 'remove_permission',
								operator_id: data.operator_id
							}
						});
							
						return {
							status: 1,
							msg: "已移除该成员的邀请权限"
						};
						
					case 'move_to_pending':
						// 正式成员移到待定区
						if (member.project_position === 2) { // 确保是正式成员
							// 正确设置管理员权限
							const admin_db = uniCloud.database();
							const dbForJQL = uniCloud.databaseForJQL();
							dbForJQL.setUser({
								role: ['admin']
							});
							
							// 使用admin_db更新成员状态
							await admin_db.collection('xm-stp-project_detail_user_rel')
								.where({
									project_id: data.project_id,
									user_id: data.user_id
								})
								.update({
									project_position: 3 // 待定成员
								});
							
							console.log(`已将用户 ${data.user_id} 在项目 ${data.project_id} 中的状态更新为待定成员`);
							
							// 发送项目通知
							try {
								// 先获取项目名称
								const projectInfo = await db.collection('xm-stp-project_detail')
									.doc(data.project_id)
									.field('title')
									.get();
								
								const projectTitle = projectInfo.data && projectInfo.data.length > 0 ? 
									projectInfo.data[0].title : '未知项目';
								
								// 直接使用本地函数发送通知
								await sendNotificationToUser(
									data.user_id,
									data.project_id,
									'项目成员状态更新',
									`您在项目「${projectTitle}」中的状态已更新：您已从正式成员调整为待定成员。`,
									'member_status',
									{
										from: 'confirmed',
										to: 'pending',
										operator_id: data.operator_id
									}
								);
								
								console.log(`成功发送状态更新通知: 用户 ${data.user_id} 被移至待定区`);
							} catch (notifyError) {
								console.error('发送状态更新通知失败（移至待定区）:', notifyError);
							}
							
							return {
								status: 1,
								msg: "已将成员移至待定区"
							};
						} else {
							return {
								status: 0,
								msg: "该成员已经是待定成员"
							};
						}
						
					case 'move_to_confirmed':
						// 待定成员升级为正式成员
						if (member.project_position === 3) { // 确保是待定成员
							// 正确设置管理员权限
							const admin_db = uniCloud.database();
							const dbForJQL = uniCloud.databaseForJQL();
							dbForJQL.setUser({
								role: ['admin']
							});
							
							// 使用admin_db更新成员状态
							await admin_db.collection('xm-stp-project_detail_user_rel')
								.where({
									project_id: data.project_id,
									user_id: data.user_id
								})
								.update({
									project_position: 2 // 正式成员
								});
							
							console.log(`已将用户 ${data.user_id} 在项目 ${data.project_id} 中的状态更新为正式成员`);
							
							// 发送项目通知
							try {
								// 先获取项目名称
								const projectInfo = await db.collection('xm-stp-project_detail')
									.doc(data.project_id)
									.field('title')
									.get();
								
								const projectTitle = projectInfo.data && projectInfo.data.length > 0 ? 
									projectInfo.data[0].title : '未知项目';
									
								// 直接使用本地函数发送通知
								await sendNotificationToUser(
									data.user_id,
									data.project_id,
									'项目成员状态更新',
									`您在项目「${projectTitle}」中的状态已更新：您已从待定成员升级为正式成员！`,
									'member_status',
									{
										from: 'pending',
										to: 'confirmed',
										operator_id: data.operator_id
									}
								);
								
								console.log(`成功发送状态更新通知: 用户 ${data.user_id} 升级为正式成员`);
							} catch (notifyError) {
								console.error('发送状态更新通知失败（升级为正式成员）:', notifyError);
							}
							
							return {
								status: 1,
								msg: "已将成员设为正式成员"
							};
						} else {
							return {
								status: 0,
								msg: "该成员已经是正式成员"
							};
						}
						
					case 'remove_member':
						// 移除成员 (从项目中完全删除)
						await db.collection('xm-stp-project_detail_user_rel')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.remove();
							
						// 发送项目通知
						try {
							// 先获取项目名称
							const projectInfo = await db.collection('xm-stp-project_detail')
								.doc(data.project_id)
								.field('title')
								.get();
							
							const projectTitle = projectInfo.data && projectInfo.data.length > 0 ? 
								projectInfo.data[0].title : '未知项目';
							
							// 直接使用本地函数发送通知
							await sendNotificationToUser(
								data.user_id,
								data.project_id,
								'项目成员移除通知',
								`您已被移出项目「${projectTitle}」。`,
								'removed',
								{
									operator_id: data.operator_id
								}
							);
							
							console.log(`成功发送移除通知: 用户 ${data.user_id} 被移出项目`);
						} catch (notifyError) {
							console.error('发送移除通知失败:', notifyError);
						}
							
						// 更新项目成员数量 - 无论成员类型都减少计数
						try {
							// 直接获取项目详情并更新成员数
							const projectDetail = await db.collection('xm-stp-project_detail')
								.doc(data.project_id)
								.field('current_members,user_id')
								.get();
								
							if (projectDetail.data && projectDetail.data.length > 0) {
								// 确保current_members字段存在
								let currentMembers = projectDetail.data[0].current_members;
								
								// 如果current_members为undefined或null，设为0
								if (currentMembers === undefined || currentMembers === null) {
									currentMembers = 0;
								} else if (typeof currentMembers === 'string') {
									// 如果是字符串，转换为数字
									currentMembers = parseInt(currentMembers) || 0;
								}
								
								// 只有当成员数大于0时才减少
								if (currentMembers > 0) {
									await db.collection('xm-stp-project_detail')
										.doc(data.project_id)
										.update({
											current_members: currentMembers - 1
										});
									console.log(`项目 ${data.project_id} 的成员数量已从 ${currentMembers} 更新为 ${currentMembers - 1}`);
								} else {
									console.warn(`项目 ${data.project_id} 的成员数量为 ${currentMembers}，已经是0或负数，无需减少`);
								}
							} else {
								console.error(`找不到项目 ${data.project_id} 的详细信息`);
							}
						} catch (error) {
							console.error('更新成员数量失败:', error);
						}
						
						return {
							status: 1,
							msg: "已移除该成员"
						};
						
					default:
						return {
							status: 0,
							msg: "未知的操作类型"
						};
				}
			} else {
				// 成员不存在，无法执行操作
				return {
					status: 0,
					msg: "该用户不是项目成员"
				};
			}
		} catch (error) {
			console.error('成员管理操作失败:', error);
			return {
				status: 0,
				msg: "操作失败: " + error.message
			};
		}
	},
	// 获取用户的项目通知
	async getProjectNotifications(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});
			
			if (!data.user_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID"
				};
			}
			
			// 从xm-stp-project-notification表获取用户通知
			const notificationsRes = await dbForJQL.collection('xm-stp-project-notification')
				.where({
					user_id: data.user_id
				})
				.orderBy('create_time', 'desc')
				.limit(50)
				.get();
				
			return {
				status: 1,
				msg: "获取项目通知成功",
				data: notificationsRes.data
			};
		} catch (error) {
			console.error('获取项目通知失败:', error);
			return {
				status: 0,
				msg: "获取项目通知失败: " + error.message
			};
		}
	},
	
	// 标记单个通知为已读
	async markNotificationRead(data) { // 使用 'data' 作为接收到的参数
		try {
			console.log('markNotificationRead received raw argument:', JSON.stringify(data)); // 记录原始参数

			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({ role: ['admin'] });

			// --- 健壮地提取参数 ---
			let notificationId, userId;
			
			// 直接从参数中提取
			if (data && data.notification_id) {
				console.log('Accessing params directly from data');
				notificationId = data.notification_id;
				userId = data.user_id;
			} 
			// 尝试从data.data中提取 (兼容旧的调用方式) 
			else if (data && data.data && data.data.notification_id) {
				console.log('Accessing params via data.data');
				notificationId = data.data.notification_id;
				userId = data.data.user_id;
			}
			// 如果前两种方法都失败，再尝试其他可能的结构
			else {
				console.error('Failed to extract parameters from data:', JSON.stringify(data));
				return { status: 0, msg: "内部错误：参数解析失败" };
			}

			if (!notificationId || !userId) {
				console.error('Validation failed: notificationId or userId is missing after extraction.');
				return { status: 0, msg: "参数不完整，请提供通知ID和用户ID" };
			}
			console.log(`Processing markNotificationRead for notification_id: ${notificationId}, user_id: ${userId}`);

			// 验证通知所属用户
			const checkRes = await dbForJQL.collection('xm-stp-project-notification')
				.where({
					_id: notificationId, // 使用提取的变量
					user_id: userId      // 使用提取的变量
				})
				.count();
				
			if (checkRes.total === 0) {
				console.log('Validation failed: Notification not found or user mismatch.');
				return { status: 0, msg: "通知不存在或无权操作" };
			}
			
			// 更新通知状态为已读
			console.log(`Updating notification ${notificationId} status to read.`);
			const updateRes = await dbForJQL.collection('xm-stp-project-notification')
				.doc(notificationId) // 使用提取的变量
				.update({
					status: 1, // 1表示已读
					read_time: Date.now() // 使用时间戳
				});
			
			console.log('Update result:', JSON.stringify(updateRes));

			if (updateRes.updated > 0) {
				console.log('Update successful.');
				return { status: 1, msg: "标记通知已读成功" };
			} else {
				console.warn('Update failed: No documents matched or status already updated.');
				return { status: 0, msg: "标记通知已读失败（可能已是已读状态）" };
			}
		} catch (error) {
			console.error('标记通知已读失败 (catch block):', error);
			return { status: 0, msg: "标记通知已读失败: " + error.message };
		}
	},
	
	// 批量标记通知为已读
	async markAllNotificationsRead(data) { // 使用 'data' 作为接收到的参数
		try {
			console.log('markAllNotificationsRead received raw argument:', JSON.stringify(data)); // 记录原始参数

			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({ role: ['admin'] });
			
			// --- 健壮地提取参数 ---
			let notificationIds, userId;
			
			// 直接从参数中提取
			if (data && data.notification_ids && Array.isArray(data.notification_ids)) {
				console.log('Accessing params directly from data');
				notificationIds = data.notification_ids;
				userId = data.user_id;
			} 
			// 尝试从data.data中提取 (兼容旧的调用方式)
			else if (data && data.data && data.data.notification_ids && Array.isArray(data.data.notification_ids)) {
				console.log('Accessing params via data.data');
				notificationIds = data.data.notification_ids;
				userId = data.data.user_id;
			}
			// 如果前两种方法都失败，再尝试其他可能的结构
			else {
				console.error('Failed to extract parameters from data:', JSON.stringify(data));
				return { status: 0, msg: "内部错误：参数解析失败" };
			}

			if (!notificationIds || notificationIds.length === 0 || !userId) {
				console.error('Validation failed: notificationIds or userId is missing/empty after extraction.');
				return { status: 0, msg: "参数不完整，请提供通知ID列表和用户ID" };
			}
			console.log(`Processing markAllNotificationsRead for ${notificationIds.length} notifications, user_id: ${userId}`);

			// 更新通知状态为已读
			console.log(`Updating ${notificationIds.length} notifications status to read.`);
			const updateRes = await dbForJQL.collection('xm-stp-project-notification')
				.where({
					_id: dbForJQL.command.in(notificationIds), // 使用提取的变量
					user_id: userId                           // 使用提取的变量
				})
				.update({
					status: 1, // 1表示已读
					read_time: Date.now() // 使用时间戳
				});
			
			console.log('Bulk update result:', JSON.stringify(updateRes));

			if (updateRes.updated > 0) {
				console.log(`Bulk update successful, updated ${updateRes.updated} notifications.`);
				return { status: 1, msg: "全部标记已读成功", updated: updateRes.updated };
			} else {
				console.warn('Bulk update failed: No documents matched or statuses already updated.');
				return { status: 0, msg: "标记已读失败或无需更新" };
			}
		} catch (error) {
			console.error('批量标记通知已读失败 (catch block):', error);
			return { status: 0, msg: "批量标记通知已读失败: " + error.message };
		}
	},
	// 获取用户未读通知数量
	async getUnreadNotificationCount(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});
			
			if (!data.user_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID",
					count: 0
				};
			}
			
			// 从xm-stp-project-notification表获取未读通知数量
			const countRes = await dbForJQL.collection('xm-stp-project-notification')
				.where({
					user_id: data.user_id,
					status: 0 // 0表示未读
				})
				.count();
				
			return {
				status: 1,
				msg: "获取未读通知数量成功",
				count: countRes.total || 0
			};
		} catch (error) {
			console.error('获取未读通知数量失败:', error);
			return {
				status: 0,
				msg: "获取未读通知数量失败: " + error.message,
				count: 0
			};
		}
	}
}
