// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

// 使用云函数传统API操作数据库
const db = uniCloud.database()

module.exports = {
	_before: function () { // 通用预处理器
		// 不需要设置用户角色，因为我们使用的是传统API
	},

	/**
	 * 获取所有学院列表
	 * @returns {Object} 包含学院列表的对象
	 */
	async getCollegeList() {
		try {
			// 查询所有学院
			const collection = db.collection('xm-stp-college_cat');
			const collegeResult = await collection.get();

			if (!collegeResult.data || collegeResult.data.length === 0) {
				return {
					status: 0,
					msg: "没有找到学院数据"
				};
			}

			// 将数据转换为前端需要的格式
			const formattedData = collegeResult.data.map(item => ({
				value: item._id,
				text: item.name
			}));

			return {
				status: 1,
				msg: "获取学院列表成功",
				data: formattedData
			};
		} catch (error) {
			console.error('获取学院列表失败:', error);
			return {
				status: 0,
				msg: "获取学院列表失败: " + error.message
			};
		}
	},

	/**
	 * 获取指定学院下的专业列表
	 * @param {Object} data 包含学院ID的对象
	 * @returns {Object} 包含专业列表的对象
	 */
	async getMajorList(data) {
		try {
			// 验证参数
			if (!data || !data.collegeId) {
				return {
					status: 0,
					msg: "缺少学院ID参数"
				};
			}

			// 查询指定学院下的所有专业
			const collection = db.collection('xm-stp-specific_cat');
			const majorResult = await collection.where({
				college_id: data.collegeId
			}).get();

			// 将数据转换为前端需要的格式
			const formattedData = majorResult.data.map(item => ({
				value: item._id,
				text: item.name
			}));

			return {
				status: 1,
				msg: "获取专业列表成功",
				data: formattedData
			};
		} catch (error) {
			console.error('获取专业列表失败:', error);
			return {
				status: 0,
				msg: "获取专业列表失败: " + error.message
			};
		}
	}
}
