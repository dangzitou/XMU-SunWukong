function getStatus(value){
	const type = {
		"0":"申请加入",
		"1":"退出项目申请",
		"2":"发出邀请",
		"3":"拒绝邀请",
		"4":"加入候选",
		"5":"退出候选",
		"6":"接受邀请",
		"申请加入":"0",
		"退出项目申请":"1",
		"发出邀请":"2",
		"拒绝邀请":"3",
		"加入候选":"4",
		"退出候选":"5",
		"接受邀请":"6"
	}
	return type[value]
}

function getInviteStatus(value){
	const type = {
		"0":"等待回复",
		"1":"已接受",
		"2":"已拒绝",
		"等待回复":"0",
		"已接受":"1",
		"已拒绝":"2",
	}
	return type[value]
}

module.exports = {
	getStatus,
	getInviteStatus
}