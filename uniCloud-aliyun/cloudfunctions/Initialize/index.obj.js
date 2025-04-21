// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { milliSecond } = require('timestamp')
module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({ 
			role: ['admin'],
		})
	},
	async getCategoryForAdd(){
		const res = await db.collection('xm-stp-project_cat').get()
		const collres = await db.collection('xm-stp-college_cat').get()
	
		return {
			status:1,
			msg:"OK",
			data:{
				proj:res.data,
				coll:collres.data
			}
		}
	},
	async getCompetitionForAdd(data){
		const res = await db.collection('xm-stp-project_comp_detail')
		.where({'_id':data.id}).field('title').get()
		
		const check = await db.collection('xm-stp-project').where({'_id':data.id,'status':1})
		.field('ending_time').get()
		if(check.affectedDocs == 0)return{
			status:0,
			msg:"竞赛项目不存在"
		}
		else if(check.data[0].ending_time < milliSecond()) return {
			status:0,
			msg:"竞赛报名已结束"
		}
		
		const collres = await db.collection('xm-stp-college_cat').get()
		
		return {
			status:1,
			msg:"OK",
			data:{
				proj:{...res.data[0],...check.data[0]},
				coll:collres.data
			}
		}
	},
	async getProjectCategory(){
		const res = await db.collection('xm-stp-project_cat').get()
		
		return {
			status:1,
			msg:"OK",
			data:	res.data
			
		}
	}
}
