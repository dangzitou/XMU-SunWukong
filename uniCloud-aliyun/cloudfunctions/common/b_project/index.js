const db = uniCloud.databaseForJQL()
const dbCmd = db.command
db.setUser({ 
	role: ['admin'], 
})
function convertStatus(param){
	const type = {"0":"草稿箱","1":"正常","2":"已废弃","草稿箱":"0","正常":"1","已废弃":"2"}
	return type[param]
}

function convertPosition(param){
	const type = {"0":"指导老师","1":"项目负责人","2":"成员",
	"3":"待定成员", "指导老师":"0","项目负责人":"1","成员":"2",
	"待定成员":"3"}
	return type[param]
}

async function getDetailForUpdate(data){
	const check = await db.collection('xm-stp-project_detail').doc(data.id).field('user_id,title,description,person_needed').get()
	if(check.affectedDocs == 0 ) return {
		status:0,
		msg:"项目类型不存在"
	}
	else if(check.data[0].user_id != data.user_id) return {
		status:0,
		msg:"这不是你的项目，不能进行更改"
	} 
	
	const project = await db.collection('xm-stp-project').doc(data.id).field('type_id,ending_time,status').get()
	
	const projAcademies = await db.collection('xm-stp-project_cat_relation').where({project_id:data.id}).field('college_category_id').get()
	
	const academyList = []
	
	for(const i in projAcademies.data) academyList.push(projAcademies.data[i].college_category_id)
	
	return {
		status:1,
		msg:"OK",
		data:{...project.data[0],...check.data[0], ...{academyList:academyList}}
	}
}

module.exports = {
	convertStatus,
	convertPosition,
	getDetailForUpdate
}