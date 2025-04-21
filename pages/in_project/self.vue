<template>
	<view class="container container332681">
		<!-- 添加空项目提示 -->
		<view v-if="globalData.list.length === 0" class="empty-container">
			<image src="/static/empty-data.png" class="empty-image" mode="aspectFit"></image>
			<text class="empty-text">暂无发起的项目，请点击"+"号创建</text>
		</view>
		<!-- 项目列表 -->
		<view v-else v-for="(item, index) in globalData.list" :key="index" 
			class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz"
			@tap="navigateToProjectDetail(item)">
			<view class="flex flex-wrap diygw-col-24 items-stretch">
				<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between flex6-clz">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0 text3-clz">{{ item.title }}</text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
						<text class="diygw-col-0 text4-clz"></text>
						<image :src="item.creator_avatar || item.avatar?.url || '/static/team-1.jpg'" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
						<text class="diygw-col-0 text6-clz">{{ item.creator_type || (item.type === 'teacher' ? '导师发起' : '学生发起') }}</text>
						<text class="diygw-col-0 text6-clz">{{ item.project_cat?.name || item.type || '科技创新' }}</text>
					</view>
				</view>
				<image :src="getProjectTypeImage(item.project_cat?.name || item.type)" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex12-clz">
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">要求：</text>
					<template v-if="getRequirements(item).length > 0">
						<text v-for="(requirement, idx) in getRequirements(item)" :key="idx"
							:class="['diygw-col-0', idx === 0 ? 'text8-clz' : idx === 1 ? 'text-clz' : 'text9-clz']">
							{{ requirement }}
						</text>
					</template>
					<template v-else-if="item.requirements && item.requirements.split(',').length">
						<text v-for="(req, reqIndex) in item.requirements.split(',')" :key="reqIndex" 
							:class="['diygw-col-0', reqIndex === 0 ? 'text8-clz' : reqIndex === 1 ? 'text-clz' : 'text9-clz']">
							{{ req }}
						</text>
					</template>
					<template v-else-if="item.tags && item.tags.length">
						<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" 
							:class="['diygw-col-0', tagIndex === 0 ? 'text8-clz' : tagIndex === 1 ? 'text-clz' : 'text9-clz']">
							{{ tag }}
						</text>
					</template>
					<template v-else>
						<text class="diygw-col-0 text8-clz">{{ item.type || '项目协作' }}</text>
					</template>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="flex icon diygw-col-0 diy-icon-attention"></text>
					<text class="diygw-col-0">{{ item.view_count || 0 }}</text>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex15-clz">
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">截止：{{ item.deadline || endingDateReturnFunction({ ending_time: item.ending_time }) }}</text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">已招募{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
				</view>
			</view>
		</view>
		
		<view class="flex diygw-col-0 right-bottom floatbar-clz">
			<view class="diygw-grid diygw-actions">
				<button class="diygw-action" @tap="navigateTo" data-type="page" data-url="/pages/project/add">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar diy-icon-roundaddfill" style="color: #07c160"> </view>
						<view class="diygw-grid-title"></view>
					</view>
				</button>
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
				globalData: { list: [] },
				// 项目类型图标映射
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				isLoading: false
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

			// 获取自身的项目列表 自定义方法
			async getListFunction() {
				try {
					this.isLoading = true;
					console.log('准备获取用户发起的项目列表...');
					
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
					
					// 获取用户发起的项目
					console.log('获取用户发起的项目，用户ID:', userId);
					const res = await uniCloud.importObject('ProjectAction').getSelf({
						user_id: userId
					});
					
					console.log('API返回数据:', JSON.stringify(res.data));
					
					if (res.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
						console.log(`API返回了${res.data.length}个项目记录`);
						
						// 处理每个项目数据，确保所有计数字段都是数字
						const projectList = res.data.map(item => {
							// 确保current_members存在且为数字
							if (item.current_members === undefined) {
								item.current_members = parseInt(item.member_count || 0);
							} else if (typeof item.current_members === 'string') {
								item.current_members = parseInt(item.current_members || 0);
							}
							
							// 确保current_person_request存在且为数字
							if (item.current_person_request === undefined) {
								item.current_person_request = parseInt(item.person_request || 0);
							} else if (typeof item.current_person_request === 'string') {
								item.current_person_request = parseInt(item.current_person_request || 0);
							}
							
							// 确保person_needed为数字
							if (item.person_needed !== undefined) {
								item.person_needed = parseInt(item.person_needed || 0);
							}
							
							console.log(`项目 ${item._id}: ${item.title} - 成员数: ${item.current_members}, 申请数: ${item.current_person_request}, 需要人数: ${item.person_needed}`);
							
							return {
								...item,
								project_id: item._id || item.project_id
							};
						});
						
						this.globalData.list = projectList;
					} else {
						console.log('API返回的数据不是数组或为空');
						this.globalData.list = [];
					}
					
					this.isLoading = false;
				} catch (error) {
					console.error('获取发起的项目列表失败:', error);
					this.isLoading = false;
					
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
				}
			},
			
			// 返回时间和是否过期 自定义方法
			endingDateReturnFunction(param) {
				try {
					if (!param || !param.ending_time) {
						return '未设置';
					}
					
					console.log('原始ending_time:', param.ending_time, typeof param.ending_time);
					
					let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : '';
					var date = this.$tools.formatDateTime(ending_time, 'YYYY-mm-dd HH:MM');
					
					// 获取当前时间的字符串表示
					const now = this.$tools.getCurrentDateTime();
					
					// 比较是否过期
					const isExpired = date < now;
					
					return date + (isExpired ? '(已过期)' : '');
				} catch (error) {
					console.error('日期格式化错误:', error, param);
					return '日期格式错误';
				}
			},
			
			// 获取项目类型对应的图标
			getProjectTypeImage(type) {
				return this.projectTypeImages[type] || '/static/cxcp.png';
			},
			
			// 获取项目要求
			getRequirements(item) {
				const requirements = [];
				if (item.student_type) requirements.push(item.student_type);
				if (item.major) requirements.push(item.major);
				if (item.skills) requirements.push(item.skills);
				return requirements;
			},
			
			// 导航到项目详情页面
			navigateToProjectDetail(item) {
				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${item._id}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
						// 如果跳转失败，降级回原来的方式
						this.navigateTo({
							type: 'page', 
							url: '/pages/project/detail/self',
							id: item._id
						});
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.empty-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 400rpx;
		width: 100%;
		padding: 30rpx;
	}
	
	.empty-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}
	
	.empty-text {
		font-size: 32rpx;
		color: #999;
		text-align: center;
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
		margin-bottom: 20rpx;
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
	
	.tag-style-0 {
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
	
	.tag-style-1 {
		padding-top: 6rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 12rpx;
		padding-bottom: 6rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #e6f7ff;
		margin-left: 10rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 12rpx;
	}
	
	.tag-style-2 {
		padding-top: 6rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 12rpx;
		padding-bottom: 6rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #f6ffed;
		margin-left: 10rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 12rpx;
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
		padding-bottom: 20rpx;
		margin-bottom: 0;
	}
	.text26-clz {
		margin-left: 10rpx;
		border: 2rpx solid #aba6a6;
		flex-shrink: 0;
		padding-top: 4rpx;
		padding-left: 20rpx;
		width: 96rpx !important;
		padding-bottom: 4rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		height: 46rpx !important;
		margin-right: 10rpx;
		padding-right: 12rpx;
	}
	.text11-clz {
		margin-left: 10rpx;
		border: 2rpx solid #aba6a6;
		flex-shrink: 0;
		padding-top: 4rpx;
		padding-left: 20rpx;
		width: 96rpx !important;
		padding-bottom: 4rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		height: 46rpx !important;
		margin-right: 10rpx;
		padding-right: 10rpx;
	}
	.floatbar-clz {
		transform: translate(0rpx, 0rpx) scale(2, 2);
		bottom: 200rpx;
		width: 80rpx !important;
		right: 60rpx;
		z-index: 900;
	}
	.flex-direction-column {
		flex-direction: column;
	}
</style>
