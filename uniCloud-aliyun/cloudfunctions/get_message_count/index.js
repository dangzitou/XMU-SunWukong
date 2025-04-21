'use strict';

/**
 * 获取用户的消息未读计数
 * @param {String} user_id - 用户ID
 * @param {String} type - 消息类型：invite(邀请), request(申请), system(系统通知)
 */
exports.main = async (event, context) => {
	console.log('获取消息计数, 参数:', event);
	
	// 参数验证
	if (!event.user_id) {
		return {
			status: 0,
			msg: '缺少用户ID参数',
			count: 0
		};
	}
	
	if (!event.type || !['invite', 'request', 'system'].includes(event.type)) {
		return {
			status: 0,
			msg: '消息类型参数无效',
			count: 0
		};
	}
	
	// 使用databaseForJQL而不是database
	const db = uniCloud.databaseForJQL();
	const dbCmd = db.command;
	
	try {
		let count = 0;
		
		// 根据消息类型选择不同的查询逻辑
		switch (event.type) {
			case 'invite': 
				// 邀请消息 - 获取发给当前用户且状态为0(等待回复)的邀请数量
				try {
					const inviteRes = await db.collection('xm-stp-project_app_invite')
						.where({
							user_id: event.user_id,
							status: 0 // 状态0表示等待回复
						})
						.count();
					
					console.log('邀请消息查询结果:', JSON.stringify(inviteRes));
					
					// 使用databaseForJQL时，计数在affectedDocs中
					count = inviteRes.affectedDocs || 0;
					console.log('邀请消息数量:', count);
				} catch (err) {
					console.error('查询邀请消息时出错:', err);
				}
				break;
				
			case 'request':
				// 申请消息 - 有两种情况：
				// 1. 项目创建者：获取发给当前用户创建的项目且状态为0(待审核)的申请数量
				// 2. 申请者：获取当前用户发出的且状态为3(申请者未读)的申请数量
				try {
					// 先获取用户创建的项目列表
					const myProjectsRes = await db.collection('xm-stp-project')
						.where({ user_id: event.user_id })
						.field('_id')
						.get();
					
					console.log('用户创建的项目查询结果:', JSON.stringify(myProjectsRes));
					
					// 使用databaseForJQL时，数据在data中
					const myProjects = myProjectsRes.data || [];
					console.log('找到用户创建的项目数量:', myProjects.length);
					
					// 如果有创建的项目，统计待审核申请数量
					if (myProjects.length > 0) {
						const projectIds = myProjects.map(p => p._id);
						console.log('项目ID列表:', projectIds);
						
						// 统计待审核申请数量（状态为0的申请）
						const requestsRes = await db.collection('xm-stp-project_app_request')
							.where({
								project_id: dbCmd.in(projectIds),
								status: 0 // 状态0表示待审核
							})
							.count();
						
						console.log('项目创建者收到的申请消息查询结果:', JSON.stringify(requestsRes));
						count = requestsRes.affectedDocs || 0;
						console.log('项目创建者的待审核申请数量:', count);
					}
					
					// 统计用户是申请者的情况 - 已处理但申请者未读的申请（状态为3）
					const myRequestsRes = await db.collection('xm-stp-project_app_request')
						.where({
							user_id: event.user_id,
							status: 3 // 状态3表示申请者未读（项目创建者已读/处理）
						})
						.count();
					
					console.log('申请者的未读申请结果查询结果:', JSON.stringify(myRequestsRes));
					
					// 添加申请者未读申请数量
					count += (myRequestsRes.affectedDocs || 0);
					console.log('总申请消息数量:', count);
				} catch (err) {
					console.error('查询申请消息时出错:', err);
				}
				break;
				
			case 'system':
				// 系统消息 - 获取发给当前用户且状态为0(未读)的系统通知数量
				try {
					// 从项目通知表获取未读通知计数
					try {
						// 设置最高权限访问数据表
						const admin_db = uniCloud.database();
						admin_db.setUser({
							role: ['admin']
						});
						
						const noticesRes = await admin_db.collection('xm-stp-project-notification')
							.where({
								user_id: event.user_id,
								status: 0 // 状态0表示未读
							})
							.count();
						
						console.log('项目通知查询结果:', JSON.stringify(noticesRes));
						
						// 获取计数
						count = noticesRes.total || 0;
						console.log('项目通知未读数量:', count);
					} catch (adminErr) {
						console.error('使用admin权限查询项目通知失败:', adminErr);
						
						// 尝试通过云函数调用获取通知计数
						try {
							const projectAction = uniCloud.importObject('ProjectAction');
							const countRes = await projectAction.getUnreadNotificationCount({
								user_id: event.user_id
							});
							
							if (countRes && countRes.status === 1) {
								count = countRes.count || 0;
								console.log('通过ProjectAction获取的未读通知数量:', count);
							}
						} catch (cloudFnErr) {
							console.error('通过云函数获取通知计数失败:', cloudFnErr);
						}
					}
				} catch (err) {
					console.error('查询系统消息时出错:', err);
				}
				break;
		}
		
		// 确保计数是整数
		count = parseInt(count) || 0;
		
		return {
			status: 1,
			msg: 'success',
			count: count
		};
		
	} catch (error) {
		console.error('获取消息计数失败:', error);
		return {
			status: 0,
			msg: '获取消息计数失败: ' + error.message,
			count: 0
		};
	}
}; 