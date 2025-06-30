'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		// 查询所有学院
		const collegeResult = await db.collection('xm-stp-college_cat')
			.field('_id as value, name as text')
			.get();
		
		return {
			code: 0,
			msg: "获取学院列表成功",
			data: collegeResult.data
		};
	} catch (error) {
		console.error('获取学院列表失败:', error);
		return {
			code: 1,
			msg: "获取学院列表失败: " + error.message
		};
	}
};
