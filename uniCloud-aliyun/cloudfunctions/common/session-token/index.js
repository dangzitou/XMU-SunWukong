const {aes_encrypt, aes_decrypt} = require('password')
function getToken(userId, token){
	const mergeStr = `${userId}-${token}`
	return aes_encrypt(mergeStr)
}

function checkTokenValid(userId, token){
	const arr = aes_decrypt(token).split('-')
	if(arr[0] != userId) return 0
	
	return {
		userId:arr[0],
		token:arr[1]
	}
}

function generateRandomToken(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < length; i++) {
        // 生成一个0到字符集长度之间的随机索引
        const randomIndex = Math.floor(Math.random() * characters.length);
        // 拼接随机字符到token字符串中
        token += characters.charAt(randomIndex);
    }
    
    return token;
}

module.exports = {
	getToken,
	checkTokenValid,
	generateRandomToken
}