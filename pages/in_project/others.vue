<template>
	<view class="container container332681">
		<view v-if="isLoading" class="loading-container">
			<text class="loading-text">加载中...</text>
		</view>
		
		<view v-else-if="globalData.list.length === 0" class="empty-container">
			<text class="empty-text">暂无加入的项目</text>
			<view class="empty-tip">
				<text>这里只显示你加入的项目，不包含你发起的项目</text>
			</view>
		</view>
		
		<view v-else v-for="(item, index) in globalData.list" :key="index" 
			class="flex flex-wrap diygw-col-24 flex-direction-column justify-center items-center"
			@tap="navigateToProjectDetail(item)">
			<view class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz">
				<view class="flex flex-wrap diygw-col-24 items-stretch">
					<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between flex6-clz">
						<view class="flex flex-wrap diygw-col-0 items-center">
							<text class="diygw-col-0 text3-clz">{{ item.title || '未知项目' }}</text>
						</view>
						<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
							<text class="diygw-col-0 text4-clz"></text>
							<image :src="item.avatar || '/static/team-1.jpg'" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
							<text class="diygw-col-0 text6-clz">{{ item.display_status || item.status || '未知状态' }}</text>
							<text v-if="item.type" class="diygw-col-0 text6-clz">{{ item.type }}</text>
						</view>
					</view>
					<image :src="getProjectTypeImage(item.type)" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-between items-center flex12-clz">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0">需求：</text>
						<text v-if="item.person_needed" class="diygw-col-0 text8-clz">{{ item.person_needed }}人</text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="flex icon diygw-col-0 diy-icon-attention"></text>
						<text class="diygw-col-0">{{ item.view_count || 0 }}</text>
					</view>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-between items-center flex15-clz">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0">截止：{{ item.deadline || formatDateTime(item.ending_time) }}</text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0">已招募{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
					</view>
				</view>
			</view>
		</view>
		<view class="clearfix"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				//用户全局信息
				userInfo: {},
				//页面传参
				globalOption: {},
				//自定义全局变量
				globalData: {
					list: []
				},
				isLoading: true,
				// 项目类型图标映射
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				}
			};
		},
		onShow() {
			this.setCurrentPage(this);
			this.initShow();
		},
		onLoad(option) {
			this.setCurrentPage(this);
			if (option) {
				this.setData({
					globalOption: this.getOption(option)
				});
			}
			this.init();
		},
		methods: {
			async init() {
				await this.getListFunction();
			},
			async initShow() {
				await this.checkLoginFunction();
			},
			// 检查登录 自定义方法
			async checkLoginFunction(param) {
				let thiz = this;
				if (!this.$session.getToken()) {
					//比如未登录，转身到其他页面等
					this.showToast('请先登录');

					this.navigateTo({
						type: 'page',
						url: 'sign/login'
					});
				}
			},

			// 获取加入的项目列表
			async getListFunction() {
				try {
					this.isLoading = true;
					console.log('准备获取用户加入的项目列表...');
					
					// 清空项目列表
					this.globalData.list = [];
					
					// 检查用户登录状态
					if (!this.$session.getToken()) {
						console.log('用户未登录，无法获取项目列表');
						this.isLoading = false;
						uni.navigateTo({
							url: '/pages/sign/login'
						});
						return;
					}
					
					// 获取用户ID
					const userId = this.$session.getUserValue('user_id');
					if (!userId) {
						console.log('无法获取用户ID');
						this.isLoading = false;
						return;
					}
					
					// 状态优先级映射
					const statusPriority = {
						'成员': 100,         // 最高优先级
						'待审核': 50,
						'已通过': 40,
						'已接受': 30,
						'已邀请': 20,
						'拒绝邀请': 10,
						'已拒绝': 5,
						'default': 0        // 默认优先级
					};
					
					// 获取用户加入的项目
					console.log('获取用户加入的项目，用户ID:', userId);
					const res = await uniCloud.importObject('ProjectAction').getJoinList({
						user_id: userId
					});
					
					console.log('API返回数据:', JSON.stringify(res.data));
					
					if (res.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
						console.log(`API返回了${res.data.length}个项目记录`);
						
						// 处理每个项目记录
						const projectMap = new Map();
						
						res.data.forEach(item => {
							console.log(`处理项目记录: ${JSON.stringify(item)}`);
							
							// 设置显示状态
							let displayStatus = item.status;
							if (item.status === '成员') {
								displayStatus = '已加入';
							} else if (item.status === '拒绝邀请') {
								displayStatus = '已拒绝';
							} else if (item.status === '已通过' || item.status === '已接受') {
								displayStatus = '已加入';
							}
							
							// 计算优先级
							const priority = statusPriority[item.status] || statusPriority.default;
							
							// 确保current_members存在且为数字
							let currentMembers = 0;
							if (item.current_members !== undefined) {
								currentMembers = typeof item.current_members === 'string' ? 
									parseInt(item.current_members || 0) : item.current_members;
							} else if (item.member_count !== undefined) {
								currentMembers = typeof item.member_count === 'string' ? 
									parseInt(item.member_count || 0) : item.member_count;
							}
							
							// 确保current_person_request存在且为数字
							let currentPersonRequest = 0;
							if (item.current_person_request !== undefined) {
								currentPersonRequest = typeof item.current_person_request === 'string' ? 
									parseInt(item.current_person_request || 0) : item.current_person_request;
							} else if (item.person_request !== undefined) {
								currentPersonRequest = typeof item.person_request === 'string' ? 
									parseInt(item.person_request || 0) : item.person_request;
							}
							
							// 确保person_needed为数字
							let personNeeded = 0;
							if (item.person_needed !== undefined) {
								personNeeded = typeof item.person_needed === 'string' ? 
									parseInt(item.person_needed || 0) : item.person_needed;
							}
							
							const processedItem = {
								...item,
								project_id: item._id || item.project_id,
								display_status: displayStatus,
								current_members: currentMembers,
								current_person_request: currentPersonRequest,
								person_needed: personNeeded,
								priority: priority
							};
							
							console.log(`处理后的项目: ${processedItem.project_id}, 状态: ${processedItem.status} (${processedItem.display_status}), 优先级: ${priority}`);
							
							// 如果已有相同ID的项目，保留优先级更高的
							const projectId = processedItem.project_id;
							if (projectMap.has(projectId)) {
								const existingProject = projectMap.get(projectId);
								if (processedItem.priority > existingProject.priority) {
									console.log(`替换项目 ${projectId} 的记录，新优先级 ${processedItem.priority} > 旧优先级 ${existingProject.priority}`);
									projectMap.set(projectId, processedItem);
								} else {
									console.log(`保留项目 ${projectId} 的现有记录，现有优先级 ${existingProject.priority} >= 新优先级 ${processedItem.priority}`);
								}
							} else {
								projectMap.set(projectId, processedItem);
							}
						});
						
						// 转换为数组并过滤掉已拒绝的项目
						let projectList = Array.from(projectMap.values()).filter(project => {
							if (project.display_status === '已拒绝') {
								console.log(`过滤掉已拒绝项目: ${project.project_id}`);
								return false;
							}
							return true;
						});
						
						console.log(`最终处理后的项目列表包含 ${projectList.length} 个项目`);
						this.globalData.list = projectList;
					} else {
						console.log('API返回的数据不是数组或为空');
						this.globalData.list = [];
					}
					
					this.isLoading = false;
				} catch (error) {
					console.error('获取加入的项目列表失败:', error);
					this.isLoading = false;
					
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
				}
			},
			
			// 获取项目状态文本
			getStatus(item) {
				if (!item) return '未知';
				
				if (item.type === 'request') {
					switch(item.status) {
						case '审核通过': return '已加入';
						case '待审核': return '待审核';
						case '审核拒绝': return '已拒绝';
						default: return item.status || '未知状态';
					}
				} else if (item.type === 'position') {
					return '已加入';
				}
				
				return item.status || '未知';
			},
			
			// 获取项目类型对应的图标
			getProjectTypeImage(type) {
				return this.projectTypeImages[type] || '/static/cxcp.png';
			},
			
			// 格式化日期时间
			formatDateTime(timestamp) {
				if (!timestamp) return '未设置';
				
				try {
					// 判断时间戳类型并转换
					let timeMs;
					if (typeof timestamp === 'number') {
						// 如果是秒级时间戳（长度约为10位数），转换为毫秒级
						timeMs = timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp;
					} else {
						// 如果是字符串，尝试解析
						timeMs = new Date(timestamp).getTime();
					}
					
					const date = new Date(timeMs);
					
					// 检查日期是否有效
					if (isNaN(date.getTime())) {
						console.error('无效的日期格式:', timestamp);
						return '日期格式错误';
					}
					
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					
					return `${year}-${month}-${day}`;
				} catch (error) {
					console.error('格式化日期出错:', error, timestamp);
					return '日期格式错误';
				}
			},
			
			// 导航到项目详情页面
			navigateToProjectDetail(item) {
				if (!item || !item.project_id) {
					console.log('项目信息不完整, 无法跳转', item);
					return;
				}
				
				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${item.project_id}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200rpx;
		width: 100%;
	}
	
	.loading-text {
		font-size: 32rpx;
		color: #666;
	}
	
	.empty-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 500rpx;
		width: 100%;
		padding: 30rpx;
	}
	
	.empty-image {
		width: 180rpx;
		height: 180rpx;
		margin-bottom: 20rpx;
	}
	
	.empty-text {
		font-size: 36rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 15rpx;
	}
	
	.empty-tip {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
		max-width: 80%;
	}
	
	.status-text {
		color: #07c160;
		font-weight: bold;
	}
	
	.flex7-clz {
		border: 2rpx solid #eee;
		padding-top: 20rpx;
		border-bottom-left-radius: 24rpx;
		padding-left: 20rpx;
		padding-bottom: 20rpx;
		border-top-right-radius: 24rpx;
		margin-right: 20rpx;
		margin-left: 20rpx;
		box-shadow: 0rpx 2rpx 6rpx rgba(31, 31, 31, 0.16);
		overflow: hidden;
		width: calc(100% - 20rpx - 20rpx) !important;
		border-top-left-radius: 24rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 24rpx;
		margin-bottom: 10rpx;
		padding-right: 20rpx;
	}
	.flex6-clz {
		flex: 1;
	}
	.text3-clz {
		margin-left: 10rpx;
		font-weight: bold;
		font-size: 28rpx !important;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.flex10-clz {
		margin-left: 0rpx;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.text4-clz {
		margin-left: 0rpx;
		color: #e2585d;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.image1-clz {
		border-bottom-left-radius: 40rpx;
		overflow: hidden;
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
	}
	.image1-size {
		height: 40rpx !important;
		width: 40rpx !important;
	}
	.text6-clz {
		padding-top: 6rpx;
		border-bottom-left-radius: 32rpx;
		color: #ffffff;
		padding-left: 12rpx;
		padding-bottom: 6rpx;
		border-top-right-radius: 32rpx;
		margin-right: 10rpx;
		background-color: #fe9834;
		margin-left: 10rpx;
		overflow: hidden;
		border-top-left-radius: 32rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 32rpx;
		margin-bottom: 10rpx;
		padding-right: 12rpx;
	}
	.image2-clz {
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
	}
	.image2-size {
		height: 120rpx !important;
		width: 120rpx !important;
	}
	.flex12-clz {
		padding-top: 10rpx;
		padding-left: 0rpx;
		padding-bottom: 10rpx;
		border-bottom: 2rpx solid #eee;
		padding-right: 0rpx;
	}
	.text8-clz {
		padding-top: 6rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 12rpx;
		padding-bottom: 6rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #edecec;
		margin-left: 10rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 12rpx;
	}
	.text-clz {
		padding-top: 6rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 12rpx;
		padding-bottom: 6rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #edecec;
		margin-left: 10rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 12rpx;
	}
	.text9-clz {
		padding-top: 6rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 12rpx;
		padding-bottom: 6rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #edecec;
		margin-left: 10rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 12rpx;
	}
	.icon {
		font-size: 40rpx;
	}
	.flex15-clz {
		padding-top: 20rpx;
		padding-left: 0rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #eee;
		padding-right: 0rpx;
	}
	.container332681 {
	}
</style>
