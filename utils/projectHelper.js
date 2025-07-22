export function endingDateReturnFunction(param) {
	try {
		if (!param || !param.ending_time) {
			return '未设置';
		}
		const date = formatDateTime(param.ending_time, 'YYYY-mm-dd HH:MM');
		const now = getCurrentDateTime();
		const isExpired = date < now;
		return date + (isExpired ? '(已过期)' : '');
	} catch (error) {
		console.error('日期格式化错误:', error, param);
		return '日期格式错误';
	}
}

export function getProjectDescription(item) {
	if (item.detail && item.detail.description) {
		const plainText = item.detail.description.replace(/<[^>]+>/g, '');
		return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
	}
	if (item.description) {
		const plainText = item.description.replace(/<[^>]+>/g, '');
		return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
	}
	if (item.content_text) {
		return item.content_text.length > 50 ? item.content_text.substring(0, 50) + '...' : item.content_text;
	}
	const requirements = getRequirements(item);
	if (requirements.length > 0) {
		return requirements.join('、');
	}
	return '暂无项目描述';
}

export function getCreatorAvatar(item) {
	if (!item) return '/static/profile/default.png';
	if (item.creator_avatar) return item.creator_avatar;
	if (item._id && this.creatorAvatars[item._id]) return this.creatorAvatars[item._id];
	if (item.avatar && item.avatar.url) return item.avatar.url;
	return '/static/profile/default.png';
}

export function getProjectImage(item) {
	if (item && item._id && this.projectImages[item._id]) {
		return this.projectImages[item._id];
	}
	const categoryName = item?.project_cat?.name;
	return this.projectTypeImages[categoryName] || '/static/cxcp.png';
}

function getRequirements(item) {
	const requirements = [];
	if (item.student_type) requirements.push(item.student_type);
	if (item.major) requirements.push(item.major);
	if (item.skills) requirements.push(item.skills);
	return requirements;
}

function formatDateTime(timestamp, format) {
	if (!timestamp) return '';
	try {
		let timeMs;
		if (typeof timestamp === 'number') {
			timeMs = timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp;
		} else {
			timeMs = new Date(timestamp).getTime();
		}
		const date = new Date(timeMs);
		if (isNaN(date.getTime())) {
			return '日期格式错误';
		}
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return format
			.replace('YYYY', year)
			.replace('mm', month)
			.replace('dd', day)
			.replace('HH', hours)
			.replace('MM', minutes);
	} catch (error) {
		return '日期格式错误';
	}
}

function getCurrentDateTime() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}`;
}
