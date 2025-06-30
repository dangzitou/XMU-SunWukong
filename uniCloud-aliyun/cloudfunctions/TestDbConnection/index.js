'use strict';

/**
 * 测试数据库连接和表操作的云函数
 */
exports.main = async (event, context) => {
	console.log('TestDbConnection 云函数被调用，参数:', event);
	
	try {
		// 获取数据库引用并设置管理员权限
		console.log('获取数据库引用');
		const db = uniCloud.database();
		console.log('设置管理员权限');
		db.setUser({
			role: ['admin']
		});
		console.log('权限设置完成');
		
		// 获取所有表
		console.log('尝试获取所有表');
		const tables = await db.getTables();
		console.log('数据库中的表:', tables);
		
		// 检查特定表是否存在
		const targetTable = 'xm-stp-project-notification';
		const tableExists = tables.includes(targetTable);
		console.log(`表 ${targetTable} ${tableExists ? '存在' : '不存在'}`);
		
		// 如果表存在，尝试查询一条数据
		let queryResult = null;
		if (tableExists) {
			console.log(`尝试从 ${targetTable} 表查询数据`);
			queryResult = await db.collection(targetTable).limit(1).get();
			console.log('查询结果:', JSON.stringify(queryResult));
		}
		
		// 尝试创建一条测试数据
		if (tableExists) {
			console.log(`尝试向 ${targetTable} 表添加测试数据`);
			const testData = {
				user_id: 'test_user',
				project_id: 'test_project',
				title: '测试通知',
				content: '这是一条测试通知',
				type: 'test',
				status: 0,
				action_data: {},
				create_time: new Date()
			};
			
			const addResult = await db.collection(targetTable).add(testData);
			console.log('添加测试数据结果:', JSON.stringify(addResult));
			
			// 如果添加成功，尝试删除刚刚添加的数据
			if (addResult && (addResult.id || addResult._id || addResult.insertedId)) {
				const docId = addResult.id || addResult._id || addResult.insertedId;
				console.log(`尝试删除刚刚添加的测试数据，ID: ${docId}`);
				const removeResult = await db.collection(targetTable).doc(docId).remove();
				console.log('删除测试数据结果:', JSON.stringify(removeResult));
			}
		}
		
		return {
			status: 1,
			msg: '测试完成',
			data: {
				tables,
				tableExists,
				queryResult
			}
		};
	} catch (error) {
		console.error('测试失败:', error);
		console.error('错误详情:', error.message);
		console.error('错误堆栈:', error.stack);
		return {
			status: 0,
			msg: '测试失败: ' + error.message
		};
	}
};
