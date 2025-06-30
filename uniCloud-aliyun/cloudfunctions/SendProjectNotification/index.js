'use strict';

/**
 * 发送项目通知的云函数
 * 专门用于向 xm-stp-project-notification 表添加通知
 */
exports.main = async (event, context) => {
	console.log('SendProjectNotification 云函数被调用，参数:', event);

	try {
		// 检查必要参数
		if (!event.user_id || !event.project_id || !event.title || !event.content || !event.type) {
			console.error('参数不完整:', event);
			return {
				status: 0,
				msg: '参数不完整，请提供用户ID、项目ID、标题、内容和类型'
			};
		}

		// 准备通知数据
		const notification = {
			user_id: event.user_id,
			project_id: event.project_id,
			title: event.title,
			content: event.content,
			type: event.type,
			status: 0, // 0表示未读
			action_data: event.action_data || {},
			create_time: new Date()
		};

		console.log('准备添加通知:', notification);

		// 获取数据库引用并设置管理员权限
		console.log('获取数据库引用');
		const db = uniCloud.database();
		console.log('设置管理员权限');
		db.setUser({
			role: ['admin']
		});
		console.log('权限设置完成');

		// 添加通知到 xm-stp-project-notification 表
		console.log('尝试向 xm-stp-project-notification 表添加通知');

		// 检查表是否存在
		try {
			const tables = await db.getTables();
			console.log('数据库中的表:', tables);
			if (!tables.includes('xm-stp-project-notification')) {
				console.error('表 xm-stp-project-notification 不存在！');
			}
		} catch (e) {
			console.error('获取表列表失败:', e);
		}

		// 添加通知
		const result = await db.collection('xm-stp-project-notification').add(notification);
		console.log('通知添加结果:', JSON.stringify(result));

		// 检查结果
		if (result && (result.id || result._id || result.insertedId)) {
			const notificationId = result.id || result._id || result.insertedId;
			console.log('成功添加通知，通知ID:', notificationId);
			return {
				status: 1,
				msg: '通知发送成功',
				id: notificationId
			};
		} else {
			console.error('通知添加失败，无法获取通知ID:', result);
			return {
				status: 0,
				msg: '通知添加失败，无法获取通知ID',
				result: result
			};
		}
	} catch (error) {
		console.error('发送通知失败:', error);
		console.error('错误详情:', error.message);
		console.error('错误堆栈:', error.stack);
		return {
			status: 0,
			msg: '发送通知失败: ' + error.message
		};
	}
};
