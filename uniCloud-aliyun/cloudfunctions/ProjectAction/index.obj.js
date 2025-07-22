// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { getStatus,getInviteStatus } = require('project-history')
const { getType } = require('identified')


const { second } = require('timestamp')



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

			// 查询用户发起的项目，按创建时间倒序排序
			const projects = await db.collection('xm-stp-project_detail')
				.where({
					user_id: data.user_id
				})
				.field('_id,title,description,content_text,person_needed,current_members,current_person_request,user_id,create_time')
				.orderBy('create_time desc')
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

		// 1. 首先检查用户是否已经是项目成员
		const memberCheck = await db.collection('xm-stp-project_detail_user_rel')
		.where({
			user_id:data.user_id,
			project_id:data.project_id
		})
		.get()

		if(memberCheck.affectedDocs > 0) return {
			status:0,
			msg:"你已经是该项目的成员"
		}

		// 2. 检查是否有任何状态的申请记录
		const check = await db.collection('xm-stp-project_app_request')
		.where({
			user_id:data.user_id,
			project_id:data.project_id
		})
		.get()

		// 如果已存在申请记录，根据状态进行不同处理
		if(check.affectedDocs > 0) {
			const existingRequest = check.data[0];

			// 如果是待审核状态(0)，允许修改申请内容
			if(existingRequest.status === 0) {
				try {
					// 只更新comment字段
					await db.collection('xm-stp-project_app_request')
					.where({
						user_id:data.user_id,
						project_id:data.project_id,
						status: 0
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
			// 如果是已接受状态(1)或申请者未读状态(3)，说明已通过审核
			else if(existingRequest.status === 1 || existingRequest.status === 3) {
				return {
					status:0,
					msg:"你的申请已通过审核，请查看消息或刷新页面"
				}
			}
			// 如果是已拒绝状态(2)，允许重新申请
			else if(existingRequest.status === 2) {
				try {
					// 更新现有申请记录，重置为待审核状态
					await db.collection('xm-stp-project_app_request')
					.where({
						user_id:data.user_id,
						project_id:data.project_id
					})
					.update({
						comment:data.introduce,
						status:0,
						result: null // 清除之前的处理结果
					})

					// 更新项目申请数量
					await db.collection('xm-stp-project_detail').where({_id:data.project_id})
					.update({
						'current_person_request':checkProject.data[0].current_person_request + 1
					})

					return {
						status:1,
						msg:"重新申请成功"
					}
				} catch (error) {
					console.error('重新申请失败:', error);
					return {
						status:0,
						msg:"重新申请失败: " + error.message
					}
				}
			}
			// 其他状态
			else {
				return {
					status:0,
					msg:"你已经申请过该项目，请等待审核结果"
				}
			}
		}

		// 3. 检查是否被邀请
		const check2 = await db.collection('xm-stp-project_app_invite')
		.where({
			user_id:data.user_id,
			project_id:data.project_id,
			status: parseInt(getInviteStatus('等待回复')) // 只检查等待回复的邀请
		})
		.get()
		if(check2.affectedDocs == 1) return {
			status:0,
			msg:"你已被邀请于这个项目"
		}

		// 4. 创建新的申请记录
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
			msg: "不允许邀请自己"
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
			project_id:data.proj_id,
			status: parseInt(getInviteStatus('等待回复')) // 只检查等待回复的邀请
		}).field('_id').get()

		if(check.affectedDocs) return {
			status: 0,
			msg: "该用户已被邀请过"
		}

		check = await db.collection('xm-stp-project_app_request').where({
			user_id: data.user_id,
			project_id:data.proj_id,
			status: 0 // 只检查待审核状态的申请
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
				.field('_id,real_name,nickname,avatar')
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
						name: userInfo.real_name || userInfo.nickname || '申请者',
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
		.where({'user_id':data.user_id, 'status': dbCmd.in([0,1,2])})
		.field('project_id,create_time,comment,status')
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
			.field('title,user_id,person_needed,current_members,current_person_request')
			.get()

			// 获取项目创建者信息
			const ownerIds = invitedProjDetail.data.map(item => item.user_id)
			const ownerDetails = await db.collection('xm-stp-user_detail')
			.where({
				'_id': dbCmd.in(ownerIds)
			})
			.field('_id,name,real_name,nickname,avatar')
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
					owner_name: ownerInfo.real_name || ownerInfo.nickname || ownerInfo.name || '项目创建者',
					owner_avatar: ownerInfo.avatar || '',
					person_needed: projectDetail.person_needed || 0,
					current_members: projectDetail.current_members || 0,
					current_person_request: projectDetail.current_person_request || 0
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
			.field('_id,real_name,nickname,avatar')
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
					owner_name: owner.real_name || owner.nickname || '项目创建者',
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
				.field('_id,real_name,nickname,avatar')
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
						name: userInfo.real_name || userInfo.nickname || '被邀请者',
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
	async approveJoin(data){
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
		else if(check.data[0].status == getInviteStatus('已接受'))
		return {
			status:0,
			msg: "项目早已接受"
		}

		const user = await db.collection('xm-stp-user_detail')
		.doc(data.user_id)
		.field('type')
		.get()

		const userType = await getType(user.data[0].type)

		const transaction = await db.startTransaction()

		await db.collection('xm-stp-project_app_invite')
		.where({
			project_id:data.project_id,
			user_id:data.user_id
		})
		.update({
			status: parseInt(getInviteStatus('已接受'))
		})

		await db.collection('xm-stp-project_detail_user_rel')
		.add({
			project_id:data.project_id,
			user_id:data.user_id,
			project_position: userType.name == "老师"?0:2
			// join_time 字段会由数据库schema自动设置为当前时间
		})

		await db.collection('xm-stp-project_app_history').add({
			user_id:data.user_id,
			project_id:data.project_id,
			action:parseInt(getStatus('接受邀请'))
		})

		await transaction.commit()

		return {
			status: 1,
			msg: "接受邀请成功"
		}
	},

	// 获取未读通知计数
	async getUnreadNotificationCount(data) {
		try {
			console.log('获取未读通知计数，用户ID:', data.user_id);

			// 使用database()而不是databaseForJQL()来查询通知
			const notificationDb = uniCloud.database();
			const result = await notificationDb.collection('xm-stp-project-notification')
				.where({
					user_id: data.user_id,
					status: 0 // 0表示未读
				})
				.count();

			console.log('未读通知查询结果:', result);

			return {
				status: 1,
				count: result.total || 0,
				msg: '获取成功'
			};
		} catch (error) {
			console.error('获取未读通知计数失败:', error);
			return {
				status: 0,
				count: 0,
				msg: '获取失败: ' + error.message
			};
		}
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

	async checkRequestStatus(data) {
		try {
			if (!data.project_id || !data.user_id) {
				return {
					status: 0,
					msg: "项目ID和用户ID不能为空"
				};
			}

			// 1. 首先检查用户是否已经是项目成员
			const memberRes = await db.collection('xm-stp-project_detail_user_rel')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();

			if (memberRes.affectedDocs > 0) {
				return {
					status: 1,
					msg: "用户已是项目成员",
					data: false // 不需要显示申请按钮
				};
			}

			// 2. 检查用户是否在xm-stp-project_app_request表中有申请记录
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
						await db.collection('xm-stp-project-notification').add({
							user_id: data.user_id,
							title: '获得项目邀请权限',
							content: `您在项目「${projectTitle}」中获得了邀请权限，现在可以邀请其他用户加入此项目。`,
							type: 'system',
							status: 0, // 0表示未读
							create_time: second()
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

			// 使用已初始化的db对象，不再创建新的数据库实例
			// 注意：db已经在模块顶部定义并设置了管理员权限

			// 获取项目信息以供显示
			const projectDetail = await db.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.field('title')
				.get();

			console.log('项目详情查询结果:', JSON.stringify(projectDetail));

			const projectTitle = projectDetail.data && projectDetail.data.length > 0 ?
				projectDetail.data[0].title || '项目' : '项目';

			// 构建通知内容，如果已提供则使用提供的内容
			const finalContent = data.content.replace(/{{projectTitle}}/g, projectTitle);

			console.log('准备添加通知到xm-stp-project-notification表, 内容:', finalContent);

			// 使用second()函数获取秒级时间戳，符合timestamp类型要求
			const timestamp = second();

			// 使用db向项目通知表添加通知
			const notificationData = {
				user_id: data.user_id,
				project_id: data.project_id,
				title: data.title,
				content: finalContent,
				type: data.type,
				status: 0, // 0表示未读
				action_data: data.action_data || {},
				create_time: timestamp
			};

			console.log('即将写入数据库的通知数据:', JSON.stringify(notificationData));

			// 向项目通知表添加通知
			const notificationResult = await db.collection('xm-stp-project-notification').add(notificationData);

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










	// 获取项目图片 - 代理方法，调用ProjectAsset云函数
	async getProjectImages(params) {
		try {
			console.log('ProjectAction.getProjectImages 代理调用 ProjectAsset.getProjectImages');
			const projectAsset = uniCloud.importObject('ProjectAsset');
			const result = await projectAsset.getProjectImages(params);
			return result;
		} catch (error) {
			console.error('代理调用ProjectAsset.getProjectImages失败:', error);
			return {
				status: 0,
				msg: "获取项目图片失败: " + error.message,
				data: []
			};
		}
	},

	// 上传项目图片
	async uploadProjectImage(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			// 检查是否提供了文件内容
			if (!data.file_content && !data.file_path) {
				return {
					status: 0,
					msg: "参数不完整，请提供文件内容或路径"
				};
			}

			console.log('开始上传项目图片');

			// 生成随机文件名，避免文件名冲突
			const timestamp = Date.now();
			const randomNum = Math.floor(Math.random() * 10000);

			// 获取文件扩展名
			let fileExt = 'png'; // 默认扩展名
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
				fileExt = mimeToExt[data.file_type] || 'png';
			}

			const cloudPath = `project_images/${timestamp}_${randomNum}.${fileExt}`;

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

			console.log('图片上传成功:', uploadResult);

			// 如果提供了项目ID，则更新项目的图片数组
			if (data.project_id) {
				const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
					.doc(data.project_id)
					.get();

				if (projectDetail.data && projectDetail.data.length > 0) {
					// 获取现有图片数组
					let images = projectDetail.data[0].images || [];

					// 添加新图片
					images.push(uploadResult.fileID);

					// 更新项目图片数组
					await dbForJQL.collection('xm-stp-project_detail')
						.doc(data.project_id)
						.update({
							images: images
						});

					console.log(`已更新项目 ${data.project_id} 的图片数组`);
				}
			}

			return {
				status: 1,
				msg: "图片上传成功",
				data: {
					fileID: uploadResult.fileID,
					cloudPath: cloudPath
				}
			};
		} catch (error) {
			console.error('上传项目图片失败:', error);
			return {
				status: 0,
				msg: "上传项目图片失败: " + error.message
			};
		}
	},

	// 更新项目图片数组
	async updateProjectImages(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.file_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供文件ID和项目ID"
				};
			}

			console.log(`开始更新项目图片数组: 添加 ${data.file_id} 到项目 ${data.project_id}`);

			// 获取项目详情
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}

			// 获取现有图片数组
			let images = projectDetail.data[0].images || [];

			// 添加新图片
			images.push(data.file_id);

			// 更新项目图片数组
			await dbForJQL.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.update({
					images: images
				});

			console.log(`已更新项目 ${data.project_id} 的图片数组`);

			return {
				status: 1,
				msg: "图片添加成功"
			};
		} catch (error) {
			console.error('更新项目图片数组失败:', error);
			return {
				status: 0,
				msg: "更新项目图片数组失败: " + error.message
			};
		}
	},



	// 删除项目图片
	async deleteProjectImage(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.file_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供文件ID和项目ID"
				};
			}

			console.log(`开始删除项目图片: ${data.file_id} 从项目 ${data.project_id}`);

			// 获取项目详情
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}

			// 获取现有图片数组
			let images = projectDetail.data[0].images || [];

			// 从数组中移除指定图片
			const newImages = images.filter(img => img !== data.file_id);

			// 如果图片存在于数组中
			if (images.length !== newImages.length) {
				// 更新项目图片数组
				await dbForJQL.collection('xm-stp-project_detail')
					.doc(data.project_id)
					.update({
						images: newImages
					});

				// 从云存储中删除文件
				try {
					await uniCloud.deleteFile({
						fileList: [data.file_id]
					});
					console.log(`已从云存储中删除文件: ${data.file_id}`);
				} catch (deleteError) {
					console.error('从云存储删除文件失败:', deleteError);
					// 即使删除云存储文件失败，我们仍然更新了数据库，所以继续返回成功
				}

				return {
					status: 1,
					msg: "图片删除成功"
				};
			} else {
				return {
					status: 0,
					msg: "图片不存在于项目中"
				};
			}
		} catch (error) {
			console.error('删除项目图片失败:', error);
			return {
				status: 0,
				msg: "删除项目图片失败: " + error.message
			};
		}
	},

	// 收藏项目
	async favoriteProject(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID和项目ID"
				};
			}

			console.log(`用户 ${data.user_id} 尝试收藏项目 ${data.project_id}`);

			// 检查项目是否存在
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.field('_id,title')
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}

			// 检查是否已经收藏过
			const favoriteCheck = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();

			if (favoriteCheck.data && favoriteCheck.data.length > 0) {
				return {
					status: 0,
					msg: "您已经收藏过该项目"
				};
			}

			// 添加收藏记录
			const favoriteResult = await dbForJQL.collection('xm-stp-project_favorite').add({
				user_id: data.user_id,
				project_id: data.project_id
				// create_time 字段由数据库自动生成
			});

			console.log('收藏结果:', favoriteResult);

			return {
				status: 1,
				msg: "收藏成功",
				data: {
					favorite_id: favoriteResult.id
				}
			};
		} catch (error) {
			console.error('收藏项目失败:', error);
			return {
				status: 0,
				msg: "收藏项目失败: " + error.message
			};
		}
	},

	// 取消收藏项目
	async unfavoriteProject(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID和项目ID"
				};
			}

			console.log(`用户 ${data.user_id} 尝试取消收藏项目 ${data.project_id}`);

			// 删除收藏记录
			const deleteResult = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.remove();

			console.log('取消收藏结果:', deleteResult);

			if (deleteResult.deleted > 0) {
				return {
					status: 1,
					msg: "取消收藏成功"
				};
			} else {
				return {
					status: 0,
					msg: "您尚未收藏该项目"
				};
			}
		} catch (error) {
			console.error('取消收藏项目失败:', error);
			return {
				status: 0,
				msg: "取消收藏项目失败: " + error.message
			};
		}
	},

	// 检查项目是否已收藏
	async checkProjectFavorite(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID和项目ID",
					is_favorite: false
				};
			}

			// 检查是否已经收藏过
			const favoriteCheck = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();

			const isFavorite = favoriteCheck.data && favoriteCheck.data.length > 0;

			return {
				status: 1,
				msg: "检查成功",
				is_favorite: isFavorite
			};
		} catch (error) {
			console.error('检查项目收藏状态失败:', error);
			return {
				status: 0,
				msg: "检查项目收藏状态失败: " + error.message,
				is_favorite: false
			};
		}
	},

	// 获取项目创建者信息
	async getProjectCreator(params) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!params.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID",
					data: null
				};
			}

			console.log(`获取项目 ${params.project_id} 的创建者信息`);

			// 获取项目详情
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(params.project_id)
				.field('user_id')
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在",
					data: null
				};
			}

			const creatorId = projectDetail.data[0].user_id;
			if (!creatorId) {
				return {
					status: 0,
					msg: "项目创建者ID不存在",
					data: null
				};
			}

			// 获取创建者信息
			const creatorInfo = await dbForJQL.collection('xm-stp-user_detail')
				.doc(creatorId)
				.field('_id,real_name,nickname,avatar,introduction,type')
				.get();

			if (!creatorInfo.data || creatorInfo.data.length === 0) {
				return {
					status: 0,
					msg: "创建者信息不存在",
					data: null
				};
			}

			// 处理创建者信息
			const creator = creatorInfo.data[0];
			const result = {
				_id: creator._id,
				name: creator.real_name || creator.nickname || '未知用户',
				avatar: creator.avatar || '',
				introduction: creator.introduction || '',
				type: creator.type || ''
			};

			return {
				status: 1,
				msg: "获取项目创建者信息成功",
				data: result
			};
		} catch (error) {
			console.error('获取项目创建者信息失败:', error);
			return {
				status: 0,
				msg: "获取项目创建者信息失败: " + error.message,
				data: null
			};
		}
	},

	// 获取邀请详情
	async getInviteDetail(data) {
		try {
			console.log('getInviteDetail 被调用，参数:', data);

			if (!data.invite_id) {
				return {
					status: 0,
					msg: "邀请ID不能为空"
				}
			}

			// 获取邀请记录
			const inviteRes = await db.collection('xm-stp-project_app_invite')
				.doc(data.invite_id)
				.get();

			if (!inviteRes.data || inviteRes.data.length === 0) {
				return {
					status: 0,
					msg: "未找到邀请记录"
				}
			}

			const invite = inviteRes.data[0];
			console.log('找到邀请记录:', invite);

			// 获取项目信息
			const projectRes = await db.collection('xm-stp-project_detail')
				.doc(invite.project_id)
				.field('_id,title,user_id,person_needed,current_members,current_person_request')
				.get();

			if (!projectRes.data || projectRes.data.length === 0) {
				return {
					status: 0,
					msg: "未找到项目信息"
				}
			}

			const project = projectRes.data[0];
			console.log('找到项目信息:', project);

			// 获取项目创建者信息
			const ownerRes = await db.collection('xm-stp-user_detail')
				.doc(project.user_id)
				.field('_id,real_name,nickname,avatar')
				.get();

			const owner = ownerRes.data && ownerRes.data.length > 0 ? ownerRes.data[0] : {};
			console.log('找到项目创建者信息:', owner);

			// 获取被邀请者信息
			const inviteeRes = await db.collection('xm-stp-user_detail')
				.doc(invite.user_id)
				.field('_id,real_name,nickname,avatar')
				.get();

			const invitee = inviteeRes.data && inviteeRes.data.length > 0 ? inviteeRes.data[0] : {};
			console.log('找到被邀请者信息:', invitee);

			// 组装结果
			const result = {
				_id: invite._id,
				project_id: invite.project_id,
				user_id: invite.user_id,
				status: invite.status,
				create_time: invite.create_time,
				comment: invite.comment || '',
				title: project.title || '未知项目',
				// 被邀请者信息
				applicant_name: invitee.real_name || invitee.nickname || '未知用户',
				applicant_avatar: invitee.avatar || '',
				// 项目创建者信息
				owner_id: project.user_id,
				creator_name: owner.real_name || owner.nickname || '项目创建者',
				creator_avatar: owner.avatar || '',
				owner_name: owner.real_name || owner.nickname || '项目创建者',
				owner_avatar: owner.avatar || '',
				// 项目人数信息
				person_needed: project.person_needed || 0,
				current_members: project.current_members || 0,
				current_person_request: project.current_person_request || 0
			};

			console.log('返回结果:', result);

			return {
				status: 1,
				msg: 'OK',
				data: result
			}
		} catch (error) {
			console.error('获取邀请详情失败:', error);
			return {
				status: 0,
				msg: "获取邀请详情失败: " + error.message,
				data: null
			}
		}
	},

	// 获取用户发出的邀请列表
	async getSentInvitations(data) {
		try {
			console.log('getSentInvitations 被调用，参数:', data);

			if (!data.user_id) {
				return {
					status: 0,
					msg: "用户ID不能为空"
				}
			}

			// 直接获取用户的所有项目（包括创建的和参与的）
			const userProjects = await db.collection('xm-stp-project_detail_user_rel')
				.where({
					user_id: data.user_id,
					// 只获取有邀请权限的项目关系
					has_invite_permission: true
				})
				.field('project_id')
				.get();

			console.log('用户有邀请权限的项目关系:', userProjects);

			// 如果没有项目，直接返回空数组
			if (!userProjects.data || userProjects.data.length === 0) {
				console.log('用户没有有邀请权限的项目');
				return {
					status: 1,
					msg: 'OK',
					data: []
				}
			}

			// 收集项目ID
			const projectIds = userProjects.data.map(p => p.project_id);
			console.log('项目ID列表:', projectIds);

			// 获取项目详情
			const projectDetails = await db.collection('xm-stp-project_detail')
				.where({
					_id: dbCmd.in(projectIds)
				})
				.field('_id,title,user_id')
				.get();

			console.log('项目详情:', projectDetails);

			// 获取项目创建者信息
			const creatorIds = [...new Set(projectDetails.data.map(p => p.user_id))];
			const creatorDetails = await db.collection('xm-stp-user_detail')
				.where({
					_id: dbCmd.in(creatorIds)
				})
				.field('_id,real_name,nickname,avatar')
				.get();

			console.log('项目创建者信息:', creatorDetails);

			// 获取这些项目发出的邀请
			const sentInvites = await db.collection('xm-stp-project_app_invite')
				.where({
					project_id: dbCmd.in(projectIds)
				})
				.field('_id,user_id,project_id,status,create_time,comment')
				.orderBy('create_time', 'desc')
				.get();

			console.log('发出的邀请:', sentInvites);

			// 如果没有邀请记录，返回空数组
			if (!sentInvites.data || sentInvites.data.length === 0) {
				console.log('没有发出的邀请记录');
				return {
					status: 1,
					msg: 'OK',
					data: []
				}
			}

			// 获取被邀请用户的信息
			const inviteeIds = [...new Set(sentInvites.data.map(invite => invite.user_id))];
			const inviteeDetails = await db.collection('xm-stp-user_detail')
				.where({
					_id: dbCmd.in(inviteeIds)
				})
				.field('_id,real_name,nickname,avatar')
				.get();

			console.log('被邀请用户信息:', inviteeDetails);

			// 组装结果
			const result = sentInvites.data.map(invite => {
				// 找到项目信息
				const project = projectDetails.data.find(p => p._id === invite.project_id) || {};

				// 找到项目创建者信息
				const creator = creatorDetails.data.find(c => c._id === project.user_id) || {};

				// 找到被邀请用户信息
				const invitee = inviteeDetails.data.find(u => u._id === invite.user_id) || {};

				return {
					_id: invite._id,
					project_id: invite.project_id,
					user_id: invite.user_id,
					status: invite.status,
					create_time: invite.create_time,
					comment: invite.comment || '',
					title: project.title || '未知项目',
					// 被邀请者信息
					applicant_name: invitee.real_name || invitee.nickname || '未知用户',
					applicant_avatar: invitee.avatar || '',
					// 项目创建者信息
					creator_name: creator.real_name || creator.nickname || '项目创建者',
					creator_avatar: creator.avatar || '',
					owner_name: creator.real_name || creator.nickname || '项目创建者',
					owner_avatar: creator.avatar || ''
				};
			});

			console.log('返回结果:', result);

			return {
				status: 1,
				msg: 'OK',
				data: result
			}
		} catch (error) {
			console.error('获取发出的邀请列表失败:', error);
			return {
				status: 0,
				msg: "获取发出的邀请列表失败: " + error.message,
				data: []
			}
		}
	},


}