const db = uniCloud.databaseForJQL()
db.setUser({
	role: ['admin'],
})

async function getType(type_id){
	const type = {"0":"老师","1":"本科生","2":"硕士（研究生）","3":"博士(研究生)"}

	// 确保 type_id 是有效的
	if (type_id === undefined || type_id === null) {
		console.warn('无效的 type_id:', type_id)
		return {type: -1, name: '未知类型'}
	}

	// 确保返回有效的名称
	const name = type[type_id] || '未知类型'
	return {type: type_id, name: name}
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
