const crypto = require('crypto');
let algorithm,password,key,iv
algorithm = 'aes-256-cbc';
password = '68cg6gQzP3WUQ8FRclqDxkaMg '; // 密钥
key = Buffer.alloc(32, password, 'utf8'); // 生成32字节的密钥
iv = crypto.randomBytes(16); // 生成16字节的初始化向量

function aes_encrypt(text) {
	let cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	// 将 iv 和加密数据拼接在一起
	return iv.toString('hex') + ':' + encrypted;
}

function aes_decrypt(encryptedText) {
	// 从加密数据中提取 iv
	const [ivHex, encrypted] = encryptedText.split(':');
	const ivBuffer = Buffer.from(ivHex, 'hex');
	const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
	
	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

const bcrypt = require('bcrypt');

// 密码哈希函数
async function hashPassword(password) {
    try {
        // 生成盐，10 是成本因子，可以根据需要调整
        const salt = await bcrypt.genSalt(10);
        
        // 生成哈希密码
        const hashedPassword = await bcrypt.hash(password, salt);
        
        return hashedPassword;
    } catch (error) {
        throw new Error('哈希密码时出错');
    }
}

// 密码验证函数
async function verifyPassword(password, hashedPassword) {
    // try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    // } catch (error) {
    //     throw new Error('验证密码时出错');
    // }
}


module.exports = {
	aes_encrypt,
	aes_decrypt,
	hashPassword,
	verifyPassword
}