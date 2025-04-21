export default class User{
	rule = {
		'username':'require|min:3',
		'password':'require|length:6,18',
		'id':'require|onlyNumber|length:6,18',
		'email':'require|isEmail'
	}
	scene = {
		'login':['username','password'],
		'register':['username','password']
	}
}