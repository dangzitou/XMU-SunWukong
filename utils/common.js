/**
 * 日期格式化函数
 * @param {Date} date 日期对象
 * @param {String} fmt 格式字符串，如: yyyy-MM-dd hh:mm:ss
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, fmt) {
	const o = {
		"M+": date.getMonth() + 1,
		"d+": date.getDate(),
		"h+": date.getHours(),
		"m+": date.getMinutes(),
		"s+": date.getSeconds(),
		"q+": Math.floor((date.getMonth() + 3) / 3),
		"S": date.getMilliseconds()
	};
	
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	
	for (let k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	
	return fmt;
}

/**
 * 格式化时间戳为指定格式
 * @param {Number} timestamp 时间戳
 * @param {String} fmt 格式字符串
 * @returns {String} 格式化后的日期字符串
 */
export function formatTimestamp(timestamp, fmt = 'yyyy-MM-dd hh:mm:ss') {
	return formatDate(new Date(timestamp * 1000), fmt);
} 