'use strict';

// 主函数
exports.main = async (event, context) => {
	const { request_id, user_id } = event;
	
	// 参数校验
	if (!request_id || !user_id) {
		return {
			code: -1,
			msg: '缺少必要参数'
		};
	}
	
	// 获取数据库引用
	const db = uniCloud.database();
	const requestDB = db.collection('xm-stp-project_app_request');
	const projectDB = db.collection('xm-stp-project');
	
	try {
		console.log(`尝试查找请求记录，ID: ${request_id}`);
		
		// 获取请求记录
		const requestRes = await requestDB.doc(request_id).get();
		if (!requestRes.data || requestRes.data.length === 0) {
			console.error(`未找到请求记录，ID: ${request_id}`);
			return {
				code: -1,
				msg: '未找到请求记录'
			};
		}
		
		const request = requestRes.data[0];
		console.log(`找到请求记录: ${JSON.stringify(request)}`);
		
		// 获取项目信息，验证权限
		const projectRes = await projectDB.where({
			_id: request.project_id
		}).get();
		
		if (!projectRes.data || projectRes.data.length === 0) {
			return {
				code: -1,
				msg: '未找到项目信息'
			};
		}
		
		const project = projectRes.data[0];
		let newStatus = request.status; // 默认保持原状态
		let updateData = {};
		
		// 根据用户请求，直接设置为已读状态
		if (request.status === 3 && request.user_id === user_id) {
			// 用户查看自己状态为3的申请，直接设置为状态4
			newStatus = 4;
			updateData.status = newStatus;
			console.log(`将申请状态从3更新为4, 用户ID: ${user_id}`);
		} else if (project.user_id === user_id && request.status === 0) {
			// 项目创建者查看待审核的申请
			newStatus = 3;
			updateData.status = newStatus;
			console.log(`将申请状态从0更新为3, 项目创建者ID: ${user_id}`);
		} else {
			console.log(`无需更新状态，当前状态: ${request.status}`);
			// 返回当前状态
			return {
				code: 0,
				msg: '无需更新',
				status: request.status
			};
		}
		
		// 更新记录
		if (Object.keys(updateData).length > 0) {
			console.log(`更新请求记录: ${JSON.stringify(updateData)}`);
			await requestDB.doc(request_id).update(updateData);
			
			return {
				code: 0,
				msg: '标记成功',
				status: newStatus
			};
		}
		
		// 无需更新，返回成功
		return {
			code: 0,
			msg: '无需更新',
			status: newStatus
		};
	} catch (error) {
		console.error('标记已读失败:', error);
		return {
			code: -1,
			msg: '服务器错误: ' + error.message
		};
	}
}; 