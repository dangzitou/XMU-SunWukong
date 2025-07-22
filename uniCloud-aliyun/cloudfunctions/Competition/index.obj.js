// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command
const { milliSecond } = require('timestamp')

const {
	convertStatus,
	convertPosition,
	getDetailForUpdate
} = require('b_project')

module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({ 
			role: ['admin'],
		})
	},
	async getList(limit=8, all=true){
		const projCat = await db.collection('xm-stp-project_cat').where("name=='竞赛项目'").get()
		
		if(projCat.affectedDocs == 0) return {
			status:0,
			msg:"竞赛项目并不存在于类别中，请注意"
		}
		const id = projCat.data[0]._id
		
		const detail = db.collection('xm-stp-project_comp_detail')
		.field('_id,title')
		.get()
		
		var field = `type_id == '${id}' && status == 1 && competition_id == NULL`
		if(!all) field += ` && ending_time > ${milliSecond()}`
		
		const list = await db.collection('xm-stp-project')
		.where(field)
		.field('create_time')
		.orderBy('create_time desc')
		.limit(limit).get()
		
		if(list.affectedDocs == 0) return {
			status:1,
			msg:'OK',
			data:[]
		}
		
		
		const compIds = []
		for(const i in list.data) 
			compIds.push(list.data[i]._id)
		
		const compList = await db.collection('xm-stp-project_comp_detail')
		.where({
			_id:dbCmd.in(compIds)
		})
		.field('title').get()
		
		for(const i1 in list.data){
			for(const i2 in compList.data)
				if(list.data[i1]._id == compList.data[i2]._id){
					list.data[i1].title = compList.data[i2].title
					break
				}
		}
		
		return {
			status:1,
			msg:'OK',
			data:list.data
		}
		
	},
	
	async getDetail(data){
		const detail = await db.collection('xm-stp-project_comp_detail').doc(data.id).get()
		if(detail.affectedDocs == 0)return {
			status:0,
			msg:"竞赛不存在"
		}
		
		const project = await db.collection('xm-stp-project').where({'_id':data.id,'status':1}).field('ending_time').get()
		if(project.affectedDocs == 0)return {
			status:0,
			msg:"竞赛不存在"
		}
		console.log(project)
		
		return {
			status:1,
			msg:'OK',
			data:{...project.data[0],...detail.data[0]}
		} 
	},
	async addProject(data) {
		
		
		const checkComp = await db.collection('xm-stp-project').doc(data.comp._id).field('type_id,current_team_request_pending').get()
		
		if(checkComp.affectedDocs == 0) return {
			status:0,
			msg: "竞赛不存在"
		}
		
		const compType = checkComp.data[0].type_id
		check = await db.collection('xm-stp-project_cat').doc(compType).get()
		
		if(check.affectedDocs == 0 || check.data[0].name != "竞赛项目") return {
			status:0,
			msg: "该母项目并不属于竞赛"
		}
		
		check = await db.collection('xm-stp-college_cat').where({
			_id: dbCmd.in(data.college_categories)
		}).get()

		if (check.affectedDocs != data.college_categories.length) return {
			status: 0,
			msg: "有学院是不存在"
		}
			
		
		const transaction = await db.startTransaction()
		// try{
		const res = await db.collection('xm-stp-project').add({
			type_id: compType,
			ending_time: data.ending_time,
			status: parseInt(data.status),
			user_id: data.user_id,
			competition_id:data.comp._id
		})

		const projectId = res.id

		await db.collection('xm-stp-project_detail').add({
			_id: projectId,
			user_id: data.user_id,
			title: data.title,
			description: data.description,
			person_needed: parseInt(data.person_needed),
			user_type: data.user_type
		})

		await db.collection('xm-stp-project_detail_user_rel').add({
			user_id: data.user_id,
			project_id: projectId,
			project_position: parseInt(convertPosition("项目负责人"))
			// join_time 字段会由数据库schema自动设置为当前时间
		})

		const catList = []
		for (const index in data.college_categories)
			catList.push({
				project_id: projectId,
				college_category_id: data.college_categories[index]
			})


		await db.collection('xm-stp-project_comp_detail').where({_id:data.comp._id}).update({
			current_team_request_pending:(checkComp.data[0].current_team_request_pending ?? 0) +1
		})
		
		await db.collection('xm-stp-project_cat_relation').add(catList)

		await transaction.commit()
		// }catch(\throw e){
		// 	await transaction.rollback()

		// 	return {
		// 		status:0,
		// 		msg:"项目添加失败，请再重试或者上报给技术部门"
		// 	}
		// }


		return {
			status: 1,
			msg: "项目添加成功"
		}
	},
	
}
