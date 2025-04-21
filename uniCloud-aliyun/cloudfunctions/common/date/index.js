function type(obj) {
		const toString = Object.prototype.toString

		if (obj == null) {
			return obj + ''
		}

		return typeof obj === 'object' || typeof obj === 'function' ? toString.call(obj) || 'object' : typeof obj
	}
function isDate(value) {
		return type(value) === '[object Date]'
	}
	
function	getWeek(dateTime) {
		let temptTime = new Date(dateTime.getTime());
		// 周几
		let weekday = temptTime.getDay() || 7;
		// 周1+5天=周六
		temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
		let firstDay = new Date(temptTime.getFullYear(), 0, 1);
		let dayOfWeek = firstDay.getDay();
		let spendDay = 1;
		if (dayOfWeek != 0) spendDay = 7 - dayOfWeek + 1;
		firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
		let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
		let result = Math.ceil(d / 7);
		return result;
	}
function formatDateTime(val,format='YYYY-mm-dd HH:MM:SS'){
		if(isDate(val)){
			return formatDate(val, format)
		}else if(!isNaN(val)){
			if(String(val).length==10){
				val = val*1000
			}
			let date = new Date(val); 
			return formatDate(date, format)
		}else if(val){
			let date = new Date(val);
			return formatDate(date, format)
		}
	}
function formatDate(date, format) {
		let we = date.getDay(); // 星期
		
		let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // 季度
		const opt = {
			'Y+': date.getFullYear().toString(), // 年
			'm+': (date.getMonth() + 1).toString(), // 月(月份从0开始，要+1)
			'd+': date.getDate().toString(), // 日
			'H+': date.getHours().toString(), // 时
			'M+': date.getMinutes().toString(), // 分
			'S+': date.getSeconds().toString(), // 秒
			'q+': qut, // 季度
		};
		// 中文数字 (星期)
		const week = {
			'0': '日',
			'1': '一',
			'2': '二',
			'3': '三',
			'4': '四',
			'5': '五',
			'6': '六',
		};
		// 中文数字（季度）
		const quarter = {
			'1': '一',
			'2': '二',
			'3': '三',
			'4': '四',
		};
		if (/(W+)/.test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '星期' + week[we] : '周' + week[we]) : week[we]);
		if (/(Q+)/.test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 4 ? '第' + quarter[qut] + '季度' : quarter[qut]);
		if (/(Z+)/.test(format)){
			let z = this.getWeek(date); // 周
			format = format.replace(RegExp.$1, RegExp.$1.length == 3 ? '第' + z + '周' : z + '');
		} 
		for (let k in opt) {
			let r = new RegExp('(' + k + ')').exec(format);
			// 若输入的长度不为1，则前面补零
			if (r) format = format.replace(r[1], RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, '0'));
		}
		return format;
	}
module.exports = {
	formatDateTime
}