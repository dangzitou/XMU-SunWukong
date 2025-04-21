const db = uniCloud.databaseForJQL()
db.setUser({ 
	role: ['admin'], 
})
		
async function getType(type_id){
	const type = {"0":"老师","1":"本科生","2":"硕士（研究生）","3":"博士(研究生)"}
	return {type:type_id, name:type[type_id]}
}

async function getCollege(id){
	const res = await db.collection('xm-stp-college_cat').doc(id).get()
	if(res.affectedDocs) return res.data[0]
	return {}
}

async function getSpecific(id){
	const res = await db.collection('xm-stp-specific_cat').doc(id).field('name').get()
	if(res.affectedDocs) return res.data[0]
	return {}
}


module.exports = {
	getType,
	getCollege,
	getSpecific
}
