// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { getStatus, getInviteStatus } = require('project-history')
const { convertPosition, convertStatus } = require('b_project')
const { getType } = require('identified')
const { second } = require('timestamp')

// 发送系统通知的辅助函数
async function sendSystemNotification(userId, projectId, title, content, type = 'other', actionData = {}) {
	try {
		console.log('发送系统通知:', { userId, projectId, title, content, type });

		// 获取项目信息
		const projectInfo = await db.collection('xm-stp-project_detail')
			.doc(projectId)
			.field('title')
			.get();

		const projectTitle = projectInfo.data && projectInfo.data.length > 0 ?
			projectInfo.data[0].title : '项目';

		// 准备通知数据
		const notification = {
			user_id: userId,
			project_id: projectId,
			title: title,
			content: content.replace('${projectTitle}', projectTitle),
			type: type,
			status: 0, // 0表示未读
			action_data: actionData,
			create_time: second()
		};

		console.log('准备发送的通知数据:', notification);

		// 使用database()而不是databaseForJQL()来发送通知
		const notificationDb = uniCloud.database();
		const result = await notificationDb.collection('xm-stp-project-notification').add(notification);
		console.log('系统通知发送成功:', result);

		return {
			status: 1,
			msg: '通知发送成功'
		};
	} catch (error) {
		console.error('发送系统通知失败:', error);
		console.error('错误详情:', error.message);
		console.error('错误堆栈:', error.stack);

		// 尝试使用云函数调用作为备用方案
		try {
			console.log('尝试使用云函数发送通知...');
			const backupResult = await uniCloud.callFunction({
				name: 'SendProjectNotification',
				data: {
					user_id: userId,
					project_id: projectId,
					title: title,
					content: content.replace('${projectTitle}', projectTitle),
					type: type,
					action_data: actionData
				}
			});

			console.log('云函数发送通知结果:', backupResult);

			if (backupResult.result && backupResult.result.status === 1) {
				return {
					status: 1,
					msg: '通知发送成功（备用方案）'
				};
			}
		} catch (backupError) {
			console.error('备用方案也失败:', backupError);
		}

		return {
			status: 0,
			msg: '通知发送失败: ' + error.message
		};
	}
}

module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({
			role: ['admin'],
		})
	},

	// 获取项目成员列表
	async getJoinList(data) {
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

		if (!memberRelations.data.length) {
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

	// 更新项目成员状态
	async updateProjectMembers(data) {
		const check = await db.collection('xm-stp-project_detail')
			.where({ _id: data.id, user_id: data.user_id }).field('_id').get()
		if (!check.affectedDocs) return {
			status: 0,
			msg: '不存在该项目'
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
		const list = { unpickedToMember: [], memberToUnpicked: [], memberAction: [] }
		for (const i in data.data) {

			switch (data.data[i].from) {
				case 'pending':
				case 'confirm':
					if (['pending', 'confirm'].includes(data.data[i].to)) list.memberAction.push(data.data[i])
					else if (data.data[i].to == 'unpicked') list.memberToUnpicked.push(data.data[i])
					break;
				case 'unpicked':
					list.unpickedToMember.push(data.data[i])
					break;
			}

		}

		// 做2
		if (list.memberToUnpicked.length) {
			const userList = []
			for (const i in list.memberToUnpicked) userList.push(list.memberToUnpicked[i].user_id)

			const checkInvited = await db.collection('xm-stp-project_app_invite').where({
				'user_id': dbCmd.in(userList)
			}).get()

			if (checkInvited.affectedDocs) return {
				status: 0,
				msg: "你邀请的成员是不能放入（还未选上），若不要改成员请放在待定成员中"
			}

			await db.collection('xm-stp-project_detail_user_rel').where({
				'user_id': dbCmd.in(userList),
				'project_id': data.id
			}).remove()

			await db.collection('xm-stp-project_app_request').where({
				user_id: dbCmd.in(userList),
				project_id: data.id
			})
				.update({
					status: 0
				})

		}

		// 做3
		if (list.memberAction.length) {
			const pendingToConfirm = []
			const confirmToPending = []

			for (const i in list.memberAction) {
				if (list.memberAction[i].from == 'pending' && list.memberAction[i].to == 'confirm')
					pendingToConfirm.push(list.memberAction[i].user_id)
				else
					confirmToPending.push(list.memberAction[i].user_id)
			}

			if (pendingToConfirm.length)
				await db.collection('xm-stp-project_detail_user_rel').where({
					'user_id': dbCmd.in(pendingToConfirm),
					'project_id': data.id
				}).update({
					'project_position': parseInt(convertPosition('成员'))
				})

			if (confirmToPending.length)
				await db.collection('xm-stp-project_detail_user_rel').where({
					'user_id': dbCmd.in(confirmToPending),
					'project_id': data.id
				}).update({
					'project_position': parseInt(convertPosition('待定成员'))
				})
		}

		// 做1
		if (list.unpickedToMember.length) {
			const toPending = []
			const toConfirm = []
			for (const i in list.unpickedToMember) {
				if (list.unpickedToMember[i].to == 'pending')
					toPending.push(list.unpickedToMember[i].user_id)
				else
					toConfirm.push(list.unpickedToMember[i].user_id)
			}

			await db.collection('xm-stp-project_app_request').where({
				user_id: dbCmd.in(toPending.concat(toConfirm)),
				project_id: data.id
			})
				.update({
					status: 1
				})

			if (toPending.length) {
				const list = []
				for (const i in toPending)
					list.push({
						'user_id': toPending[i],
						'project_id': data.id,
						'project_position': parseInt(convertPosition('待定成员'))
						// join_time 字段会由数据库schema自动设置为当前时间
					})

				await db.collection('xm-stp-project_detail_user_rel').add(list)
			}


			if (toConfirm.length) {
				const list = []
				for (const i in toConfirm)
					list.push({
						'user_id': toConfirm[i],
						'project_id': data.id,
						'project_position': parseInt(convertPosition('成员'))
						// join_time 字段会由数据库schema自动设置为当前时间
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
			status: 1,
			msg: "更新成功"
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
				.where({ _id: data.project_id, user_id: data.operator_id })
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
							create_time: second() // 保持这里为秒级时间戳
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

	// 通过用户申请的完整流程处理方法
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
				.where({ _id: data.project_id, user_id: data.operator_id })
				.field('_id')
				.get();

			if (!projectCheck.affectedDocs) {
				return {
					status: 0,
					msg: "权限不足，只有项目创建者可以通过申请"
				};
			}

			// 2. 检查用户是否已经是项目成员
		const memberCheck = await db.collection('xm-stp-project_detail_user_rel')
			.where({
				user_id: data.user_id,
				project_id: data.project_id
			})
			.get();

		if (memberCheck.affectedDocs > 0) {
			return {
				status: 0,
				msg: "该用户已经是项目成员，无需重复添加"
			};
		}

		// 3. 检查是否存在申请记录
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

		// 4. 检查申请记录的状态，避免重复处理
		const currentRequest = requestCheck.data[0];
		if (currentRequest.status === 1 || currentRequest.status === 3) {
			return {
				status: 0,
				msg: "该申请已经处理过，用户已被添加到项目中"
			};
		}

		if (currentRequest.status === 2) {
			return {
				status: 0,
				msg: "该申请已被拒绝，无法通过"
			};
		}

			// 5. 获取用户类型，用于决定项目中的职位
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

			// 6. 使用直接数据库操作而不是事务
			try {
				// 6.1 更新申请记录的状态为申请者未读(3)，而不是直接设为已接受(1)
				const reqUpdateRes = await db.collection('xm-stp-project_app_request')
					.where({
						user_id: data.user_id,
						project_id: data.project_id,
						status: 0 // 只更新待审核状态的申请
					})
					.update({
						status: 3, // 状态3表示申请者未读，处理结果是接受
						result: 1   // 增加result字段记录实际处理结果：1表示已接受
					});

				if (reqUpdateRes.updated === 0) {
					return {
						status: 0,
						msg: "申请记录状态异常，无法处理"
					};
				}

				// 6.2 添加用户到项目成员关系表
				const addMemberRes = await db.collection('xm-stp-project_detail_user_rel').add({
					project_id: data.project_id,
					user_id: data.user_id,
					project_position: projectPosition
					// join_time 字段会由数据库schema自动设置为当前时间
				});

				// 6.3 更新项目当前成员数量
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

	// 手动标记申请为已读的方法
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

	// 更新成员邀请权限的方法
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
				.where({ _id: data.project_id, user_id: data.operator_id })
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
					return {
						status: 1,
						msg: data.action === 'add_invite_permission' ? "已授予该成员邀请权限" : "已移除该成员邀请权限"
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
				.where({ _id: data.project_id })
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

						// 使用已初始化的db对象更新成员状态
						const invite_updateResult = await db.collection('xm-stp-project_detail_user_rel')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.update({
								has_invite_permission: true
							});

						console.log(`已将用户 ${data.user_id} 在项目 ${data.project_id} 中设置为邀请者，结果:`, invite_updateResult);

						// 发送系统通知
						await sendSystemNotification(
							data.user_id,
							data.project_id,
							'您获得了邀请权限',
							'您已被授予项目"${projectTitle}"的邀请权限，现在可以邀请其他用户加入项目。',
							'invite_permission',
							{
								project_id: data.project_id,
								action: 'add_invite_permission'
							}
						);

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

						// 使用已初始化的db对象更新成员状态
						const remove_invite_updateResult = await db.collection('xm-stp-project_detail_user_rel')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.update({
								has_invite_permission: false
							});

						console.log(`已将用户 ${data.user_id} 在项目 ${data.project_id} 中移除邀请者权限，结果:`, remove_invite_updateResult);

						// 发送系统通知
						await sendSystemNotification(
							data.user_id,
							data.project_id,
							'您的邀请权限已被移除',
							'您在项目"${projectTitle}"中的邀请权限已被移除。',
							'invite_permission',
							{
								project_id: data.project_id,
								action: 'remove_invite_permission'
							}
						);

						return {
							status: 1,
							msg: "已移除该成员的邀请权限"
						};

					case 'move_to_pending':
						// 正式成员移到待定区
						if (member.project_position === 2) { // 确保是正式成员
							// 检查用户是否有邀请权限
							const hasInvitePermission = member.has_invite_permission === true;

							// 使用已初始化的db对象更新成员状态，同时移除邀请权限
							await db.collection('xm-stp-project_detail_user_rel')
								.where({
									project_id: data.project_id,
									user_id: data.user_id
								})
								.update({
									project_position: 3, // 待定成员
									has_invite_permission: false // 移除邀请权限
								});

							console.log(`已将用户 ${data.user_id} 在项目 ${data.project_id} 中的状态更新为待定成员，并移除邀请权限`);

							// 发送系统通知
							await sendSystemNotification(
								data.user_id,
								data.project_id,
								'您已被移至待定区',
								'您在项目"${projectTitle}"中的状态已被更改为待定成员' + (hasInvitePermission ? '，邀请权限已被移除' : '') + '。',
								'member_status',
								{
									project_id: data.project_id,
									action: 'move_to_pending',
									had_invite_permission: hasInvitePermission
								}
							);

							return {
								status: 1,
								msg: "已将成员移至待定区" + (hasInvitePermission ? "并移除邀请权限" : "")
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
							// 使用已初始化的db对象更新成员状态
							await db.collection('xm-stp-project_detail_user_rel')
								.where({
									project_id: data.project_id,
									user_id: data.user_id
								})
								.update({
									project_position: 2 // 正式成员
								});

							console.log(`已将用户 ${data.user_id} 在项目 ${data.project_id} 中的状态更新为正式成员`);

							// 发送系统通知
							await sendSystemNotification(
								data.user_id,
								data.project_id,
								'您已成为正式成员',
								'恭喜！您在项目"${projectTitle}"中的状态已更新为正式成员。',
								'member_status',
								{
									project_id: data.project_id,
									action: 'move_to_confirmed'
								}
							);

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

						// 清理相关的邀请记录，允许重新邀请
						await db.collection('xm-stp-project_app_invite')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.remove();

						// 清理相关的申请记录，允许重新申请
						await db.collection('xm-stp-project_app_request')
							.where({
								project_id: data.project_id,
								user_id: data.user_id
							})
							.remove();

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

						// 发送系统通知
						await sendSystemNotification(
							data.user_id,
							data.project_id,
							'您已被移出项目',
							'您已被从项目"${projectTitle}"中移除。',
							'removed',
							{
								project_id: data.project_id,
								action: 'remove_member'
							}
						);

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
	}
}
