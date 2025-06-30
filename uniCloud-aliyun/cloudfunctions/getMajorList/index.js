'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		// 验证参数
		if (!event.collegeId) {
			return {
				code: 1,
				msg: "缺少学院ID参数"
			};
		}
		
		// 查询指定学院下的所有专业
		const majorResult = await db.collection('xm-stp-specific_cat')
			.where({
				college_id: event.collegeId
			})
			.field('_id as value, name as text')
			.get();
		
		return {
			code: 0,
			msg: "获取专业列表成功",
			data: majorResult.data
		};
	} catch (error) {
		console.error('获取专业列表失败:', error);
		return {
			code: 1,
			msg: "获取专业列表失败: " + error.message
		};
	}
};
