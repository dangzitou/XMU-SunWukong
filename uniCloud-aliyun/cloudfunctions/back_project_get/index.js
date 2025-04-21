'use strict';
const db = uniCloud.databaseForJQL()

db.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission字段
		})	
exports.main = async (event, context) => {
	const project = await db.collection('xm-stp-project').doc(event.id).get()
	if(project.affectedDocs == 0) return {
		status:0,
		msg:'项目不存在'
	}
	
	const detail = await db.collection('xm-stp-project_detail').doc(event.id).get()
	console.log(project,detail)
	
	
	const data = {
		...project.data[0],
		...detail.data[0]
	}
	
	const user_detail = await db.collection('xm-stp-user_detail').doc(data.user_id).field('real_name').get()
	data['name'] = user_detail.data[0].real_name
	
	const project_type = await db.collection('xm-stp-project_cat').doc(data.type_id).get()
	data['project_type'] = project_type.data[0].name
	
	delete data.type_id
 	
	//返回数据给客户端
	return {
		status:1,
		msg:'OK',
		data:data
	}
};
