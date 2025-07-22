// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { second } = require('timestamp')

// 发送项目通知的辅助函数（直接添加通知到数据库）
async function sendNotificationToUser(userId, projectId, title, content, type = 'other', actionData = {}) {
	console.log('尝试直接向用户发送通知:', { userId, projectId, title, content, type });

	try {
		// 使用second()函数获取秒级时间戳，符合timestamp类型要求
		const timestamp = second();
		// 准备通知数据
		const notification = {
			user_id: userId,
			project_id: projectId,
			title: title,
			content: content,
			type: type,
			status: 0, // 0表示未读
			action_data: actionData,
			create_time: timestamp
		};

		console.log('准备添加通知:', notification);

		// 直接添加到通知表 - 使用db对象（已在模块顶部初始化并设置了管理员权限）
		console.log('尝试向 xm-stp-project-notification 表添加通知');
		const result = await db.collection('xm-stp-project-notification').add(notification);
		console.log('通知添加结果:', JSON.stringify(result));

		// 检查不同的结果字段
		const notificationId = result.id || result._id || result.insertedId || (result.inserted && result.inserted.length > 0 ? result.inserted[0] : null);

		// 如果添加成功，返回结果
		if (notificationId) {
			console.log('成功添加通知到 xm-stp-project-notification 表，通知ID:', notificationId);
			return {
				status: 1,
				msg: '通知发送成功',
				id: notificationId
			};
		} else {
			console.error('通知添加失败，无法获取通知ID:', JSON.stringify(result));
			// 尝试直接返回成功，而不是抛出异常
			return {
				status: 1,
				msg: '通知可能已发送，但无法获取ID',
				result: JSON.stringify(result)
			};
		}
	} catch (error) {
		console.error('直接添加通知失败:', error);
		console.error('错误详情:', error.message);
		console.error('错误堆栈:', error.stack);
		return {
			status: 0,
			msg: '通知发送失败: ' + error.message
		};
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
		return {
			status: 0,
			msg: '发送项目通知失败：必要参数缺失'
		};
	}

	try {
		// 使用已初始化的db对象，不再创建新的数据库实例
		// 注意：db已经在模块顶部定义并设置了管理员权限

		// 查询项目信息 - 使用字符串格式指定字段避免冲突
		const project = await db.collection('xm-stp-project_detail').doc(projectId).field('title').get();

		if (!project.data || !project.data.length) {
			console.error(`发送项目通知失败：找不到项目信息 projectId=${projectId}`);
			return {
				status: 0,
				msg: `发送项目通知失败：找不到项目信息 projectId=${projectId}`
			};
		}

		const projectName = project.data[0].title;
		// 使用second()函数获取秒级时间戳，符合timestamp类型要求
		const timestamp = second();
		const notificationData = {
			user_id: userId,
			project_id: projectId,
			title: title || `项目"${projectName}"通知`,
			content: content,
			type: type,
			status: 0,
			action_data: actionData,
			create_time: timestamp
		};

		console.log('准备添加顶部通知, 通知数据:', JSON.stringify(notificationData));

		// 添加到项目通知表 - 使用db对象
		console.log('尝试向 xm-stp-project-notification 表添加通知');
		const notificationResult = await db.collection('xm-stp-project-notification').add(notificationData);
		console.log('通知添加结果:', JSON.stringify(notificationResult));

		// 检查不同的结果字段
		const notificationId = notificationResult.id || notificationResult._id || notificationResult.insertedId ||
			(notificationResult.inserted && notificationResult.inserted.length > 0 ? notificationResult.inserted[0] : null);

		if (notificationId) {
			console.log('成功添加通知，通知ID:', notificationId);
		} else {
			console.warn('无法获取通知ID，但通知可能已添加:', JSON.stringify(notificationResult));
		}

		console.log(`成功为用户${userId}发送项目通知，标题：${title}，结果:`, JSON.stringify(notificationResult));
		return {
			status: 1,
			msg: '通知发送成功',
			id: notificationId
		};
	} catch (error) {
		console.error('发送项目通知失败，详细错误:', error);
		if (error.message) console.error('错误消息:', error.message);
		if (error.stack) console.error('错误堆栈:', error.stack);
		return {
			status: 0,
			msg: '通知发送失败: ' + (error.message || '未知错误')
		};
	}
}

module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({
			role: ['admin'],
		})
	},

	// 发送项目通知
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

	// 发送通知给用户（辅助函数）
	async sendNotificationToUser(data) {
		return await sendNotificationToUser(
			data.user_id,
			data.project_id,
			data.title,
			data.content,
			data.type || 'other',
			data.action_data || {}
		);
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
			console.log('尝试从 xm-stp-project-notification 表获取用户通知');
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
	async markNotificationRead(data) {
		try {
			console.log('markNotificationRead received raw argument:', JSON.stringify(data));

			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({ role: ['admin'] });

			// 健壮地提取参数
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
			console.log('尝试验证 xm-stp-project-notification 表中的通知');
			const checkRes = await dbForJQL.collection('xm-stp-project-notification')
				.where({
					_id: notificationId,
					user_id: userId
				})
				.count();

			if (checkRes.total === 0) {
				console.log('Validation failed: Notification not found or user mismatch.');
				return { status: 0, msg: "通知不存在或无权操作" };
			}

			// 更新通知状态为已读
			console.log(`尝试更新 xm-stp-project-notification 表中的通知 ${notificationId} 状态为已读`);
			const updateRes = await dbForJQL.collection('xm-stp-project-notification')
				.doc(notificationId)
				.update({
					status: 1, // 1表示已读
					read_time: Date.now()
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
	async markAllNotificationsRead(data) {
		try {
			console.log('markAllNotificationsRead received raw argument:', JSON.stringify(data));

			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({ role: ['admin'] });

			// 健壮地提取参数
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
			console.log(`尝试更新 xm-stp-project-notification 表中的 ${notificationIds.length} 条通知状态为已读`);
			const updateRes = await dbForJQL.collection('xm-stp-project-notification')
				.where({
					_id: dbForJQL.command.in(notificationIds),
					user_id: userId
				})
				.update({
					status: 1, // 1表示已读
					read_time: Date.now()
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
			console.log('尝试从 xm-stp-project-notification 表获取用户未读通知数量');
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
