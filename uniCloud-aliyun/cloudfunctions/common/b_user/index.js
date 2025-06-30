const db = uniCloud.databaseForJQL()
db.setUser({
	role: ['admin'],
})

const {getToken} = require('session-token')
const { getType, getCollege, getSpecific } = require('identified')

async function getUserDetail(userData){
	let res = {
	   'user_id': userData._id,
	   'username':userData.username,
	   'token':getToken(userData._id,userData.token)
	}

	const userDetail = await db.collection('xm-stp-user_detail').doc(userData._id).get()

	if(userDetail.affectedDocs != 0) {
		res = {...res,...userDetail.data[0]}
		delete res._id

		// 头像为空时前端会显示默认头像
		if (!res.avatar) {
			res.avatar = ''
		}

		// 整理学院类别
		res.college_category = await getCollege(res.college_category_id)
		delete res.college_category_id
		// 整理科系类别
		res.specific_category = await getSpecific(res.specific_category_id)
		delete res.specific_category_id
		// 整理身份
		res.type = await getType(res.type)
	}

	return res
}

module.exports = {
	getUserDetail
}