<template>
	<view class="container container328924">
		<!-- 用户信息卡片 -->
		<view class="user-info-card">
			<!-- 头像区域 -->
			<view class="avatar-container">
				<view class="diygw-avatar xl radius bg-none">
					<image v-if="globalData.user.avatar" mode="aspectFit" class="diygw-avatar-img radius" :src="globalData.user.avatar"></image>
					<view v-else class="diygw-avatar-img radius default-avatar">{{ globalData.user.real_name ? globalData.user.real_name.substring(0, 1) : 'U' }}</view>
				</view>
			</view>

			<!-- 用户名 -->
			<view class="name-container">
				<text class="user-name">{{ globalData.user.real_name || '未设置姓名' }}</text>
			</view>

			<!-- 个人简介 -->
			<view class="bio-container" v-if="globalData.user.bio">
				<text class="bio-text">{{ globalData.user.bio }}</text>
			</view>

			<!-- 标签区域 -->
			<view class="tag-container">
				<!-- 学院标签 -->
				<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
					<text class="diygw-icon diy-icon-home"></text>
					<text class="tag-text">{{ globalData.user.college || '未设置学院' }}</text>
				</view>
				<!-- 专业标签 -->
				<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
					<text class="diygw-icon diy-icon-write"></text>
					<text class="tag-text">{{ globalData.user.specific || '未设置专业' }}</text>
				</view>
				<!-- 年级标签 -->
				<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
					<text class="diygw-icon diy-icon-time"></text>
					<text class="tag-text">{{ globalData.user.onboarding_year || '未设置' }}级</text>
				</view>
				<!-- 身份标签 -->
				<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
					<text class="diygw-icon diy-icon-vip"></text>
					<text class="tag-text">{{ globalData.user.type || '未设置身份' }}</text>
				</view>
			</view>

			<!-- 项目统计信息 -->
			<view class="stats-container" v-if="globalData.user.self_count !== undefined || globalData.user.request_count !== undefined">
				<view class="stat-item">
					<text class="stat-value">{{ globalData.user.self_count || 0 }}</text>
					<text class="stat-label">发起项目</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ globalData.user.request_count || 0 }}</text>
					<text class="stat-label">加入项目</text>
				</view>
				<view class="stat-item" v-if="globalData.user.invited_count !== undefined">
					<text class="stat-value">{{ globalData.user.invited_count || 0 }}</text>
					<text class="stat-label">受邀项目</text>
				</view>
			</view>

			<!-- 邀请加入我的项目按钮 -->
			<view class="invite-button-container" v-if="!isSelfProfile">
				<button class="invite-button" @tap="inviteToMyProject">邀请加入我的项目</button>
			</view>
		</view>

		<!-- 项目列表标题 -->
		<view class="section-title">
			<text>创建的项目</text>
		</view>

		<!-- 项目列表 - 使用与项目广场相同的样式 -->
		<view v-if="globalData.list && globalData.list.length > 0">
			<view v-for="(item, index) in globalData.list" :key="index"
				class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz"
				@tap="navigateToProjectDetail(item)">
				<view class="flex flex-wrap diygw-col-24 items-stretch">
					<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between flex6-clz">
						<view class="flex flex-wrap diygw-col-0 items-center">
							<text class="diygw-col-0 text3-clz">{{ item.title }}</text>
						</view>
						<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
							<image :src="globalData.user.avatar || '/static/profile/default.png'" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
							<text class="diygw-col-0 text6-clz">{{ globalData.user.type === '导师' ? '导师发起' : '学生发起' }}</text>
							<text class="diygw-col-0 text6-clz">{{ item.type || '科技创新' }}</text>
						</view>
					</view>
					<image :src="getProjectImage(item)" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-between items-center flex12-clz">
					<view class="flex flex-wrap diygw-col-0 items-center description-container">
						<text class="diygw-col-0">简介：</text>
						<text class="diygw-col-0 description-text">{{ getProjectDescription(item) }}</text>
					</view>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-between items-center flex15-clz">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0">需求{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 无项目提示 -->
		<view v-else class="empty-projects">
			<text>该用户暂未创建任何项目</text>
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
				globalData: { user: { real_name: '' }, list: [] },
				// 项目类型图片映射
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				// 存储项目ID到图片URL的映射
				projectImages: {},
				// 是否是自己的个人资料
				isSelfProfile: false,
				// 我的项目列表
				myProjects: []
			};
		},
		onShow() {
			this.setCurrentPage(this);
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
				try {
					// 显示加载中
					uni.showLoading({
						title: '加载中...',
						mask: true
					});

					// 获取用户详情
					await this.getDetailFunction();

					// 检查登录状态
					await this.checkLoginStatus();

					// 如果已登录，加载我的项目列表
					if (this.$session.getUserValue('user_id')) {
						await this.loadMyProjects();
					}

					uni.hideLoading();
				} catch (error) {
					uni.hideLoading();
					console.error('初始化失败:', error);
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
				}
			},

			// 检查登录状态并判断是否是自己的个人资料
			async checkLoginStatus() {
				const currentUserId = this.$session.getUserValue('user_id');
				if (currentUserId && this.globalOption.user_id) {
					this.isSelfProfile = currentUserId === this.globalOption.user_id;
				}
			},

			// 加载当前登录用户的项目列表
			async loadMyProjects() {
				try {
					const currentUserId = this.$session.getUserValue('user_id');
					if (!currentUserId) return;

					// 显示加载中
					uni.showLoading({
						title: '加载项目列表...',
						mask: true
					});

					// 使用Project.getSelf方法获取用户创建的项目
					const res = await uniCloud.importObject('Project').getSelf({
						user_id: currentUserId,
						target_user: this.globalOption.user_id
					});

					uni.hideLoading();

					if (res.status === 1 && res.data) {
						this.myProjects = res.data;
						console.log('已加载我的项目列表:', this.myProjects.length);
					} else {
						console.warn('加载项目列表返回状态:', res.status, '消息:', res.msg);
						this.myProjects = [];
					}
				} catch (error) {
					uni.hideLoading();
					console.error('加载我的项目列表失败:', error);
					this.myProjects = [];
				}
			},

			// 邀请用户加入我的项目
			async inviteToMyProject() {
				// 检查是否登录
				if (!this.$session.getToken()) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});

					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/sign/login'
						});
					}, 1500);
					return;
				}

				// 直接跳转到项目选择页面
				uni.navigateTo({
					url: `/pages/user/select_project_to_invite?user_id=${this.globalOption.user_id}`
				});
			},
			// 获取用户详情 自定义方法
			async getDetailFunction(param) {
				try {
					let thiz = this;
					let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';

					const res = await uniCloud.importObject('User').getUserDetail({ user_id: option.user_id });

					if (!res.status) {
						uni.showToast({
							title: '用户不存在',
							icon: 'error'
						});

						uni.redirectTo({
							url: '/pages/home'
						});
						return;
					}

					this.globalData = res.data;
					console.log('获取到的用户数据:', this.globalData);

					// 如果有项目列表，加载项目图片
					if (this.globalData.list && this.globalData.list.length > 0) {
						// 获取所有项目ID
						const projectIds = this.globalData.list.map(project => project._id);
						// 加载项目图片
						await this.loadProjectImages(projectIds);
					}
				} catch (error) {
					console.error('获取用户详情失败:', error);
					throw error; // 向上传递错误，让init方法处理
				}
			},

			// 获取项目图片的方法
			async loadProjectImages(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

				try {
					console.log('开始加载项目图片...');
					// 批量处理项目，每10个为一组
					const batchSize = 10;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的图片
						const promises = batchIds.map(async (projectId) => {
							try {
								const result = await uniCloud.importObject('ProjectAction').getProjectImages({
									project_id: projectId
								});

								if (result.status === 1 && result.data && result.data.length > 0) {
									// 保存第一张图片的URL
									this.projectImages[projectId] = result.data[0].tempFileURL;
									return { projectId, success: true };
								}
								return { projectId, success: false };
							} catch (error) {
								console.error(`获取项目 ${projectId} 图片失败:`, error);
								return { projectId, success: false };
							}
						});

						await Promise.all(promises);
					}

					console.log('所有项目图片加载完成:', Object.keys(this.projectImages).length);
				} catch (error) {
					console.error('批量加载项目图片失败:', error);
				}
			},

			// 获取项目类型对应的图片
			getProjectTypeImage(type) {
				return this.projectTypeImages[type] || '/static/cxcp.png';
			},

			// 获取项目图片，优先使用项目图片，如果没有则使用类型图片
			getProjectImage(item) {
				if (item && item._id && this.projectImages[item._id]) {
					return this.projectImages[item._id];
				}

				// 如果没有项目图片，使用分类图标
				return this.getProjectTypeImage(item.type);
			},

			// 获取项目描述文本
			getProjectDescription(item) {
				// 优先使用项目详情中的description字段
				if (item.detail && item.detail.description) {
					// 移除HTML标签，只保留纯文本
					const plainText = item.detail.description.replace(/<[^>]+>/g, '');
					return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
				}

				// 直接使用description字段
				if (item.description) {
					// 移除HTML标签，只保留纯文本
					const plainText = item.description.replace(/<[^>]+>/g, '');
					return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
				}

				// 其次使用content_text字段
				if (item.content_text) {
					return item.content_text.length > 50 ? item.content_text.substring(0, 50) + '...' : item.content_text;
				}

				return '暂无项目描述';
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
						// 如果跳转失败，尝试使用旧的详情页
						uni.navigateTo({
							url: `/pages/project/detail?id=${item._id}`
						});
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	// 用户信息卡片样式
	.user-info-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin: 20rpx;
		box-shadow: 0rpx 2rpx 6rpx rgba(31, 31, 31, 0.16);

		.avatar-container {
			display: flex;
			justify-content: center;
			margin-bottom: 20rpx;
		}

		.diygw-avatar {
			width: 120rpx !important;
			height: 120rpx !important;
		}

		.diygw-avatar-img {
			width: 100%;
			height: 100%;
		}

		.default-avatar {
			background-color: #07c160;
			color: #ffffff;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 60rpx;
			font-weight: bold;
		}

		.name-container {
			width: 100%;
			text-align: center;
			margin-bottom: 15rpx;
		}

		.user-name {
			font-size: 36rpx !important;
			font-weight: bold;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 100%;
			display: inline-block;
		}

		.bio-container {
			width: 100%;
			text-align: center;
			margin: 10rpx 0 15rpx 0;
			padding: 0 20rpx;
		}

		.bio-text {
			font-size: 28rpx;
			color: #666;
			line-height: 1.5;
			display: inline-block;
			text-align: center;
		}

		.tag-container {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			width: 100%;
			padding: 0 10rpx;
			margin-top: 5rpx;
			margin-bottom: 10rpx;
		}

		.tag-item {
			margin: 6rpx;
			padding: 6rpx 12rpx;
			display: flex;
			align-items: center;
			max-width: calc(50% - 16rpx); /* 确保每行最多显示两个标签 */
			box-sizing: border-box;
			border-radius: 30rpx;
		}

		.tag-text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 100%;
			font-size: 24rpx;
			margin-left: 4rpx;
		}

		.stats-container {
			display: flex;
			justify-content: space-around;
			width: 100%;
			margin: 20rpx 0;
			padding: 10rpx 0;
			border-top: 1px solid #f0f0f0;
			border-bottom: 1px solid #f0f0f0;
		}

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.stat-value {
			font-size: 32rpx;
			font-weight: bold;
			color: #07c160;
		}

		.stat-label {
			font-size: 24rpx;
			color: #666;
			margin-top: 4rpx;
		}
	}

	// 项目列表标题
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin: 30rpx 20rpx 10rpx 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 2rpx solid #eee;
	}

	// 空项目提示
	.empty-projects {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
	}

	// 项目卡片样式 - 与项目广场一致
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
		margin-bottom: 30rpx;
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

	.description-container {
		flex: 1;
		overflow: hidden;
	}

	.description-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.flex15-clz {
		padding-top: 10rpx;
		padding-left: 0rpx;
		padding-bottom: 0rpx;
		padding-right: 0rpx;
		font-size: 24rpx;
		color: #666;
	}

	.container328924 {
		padding-bottom: 30rpx;
	}

	/* 邀请按钮样式 */
	.invite-button-container {
		display: flex;
		justify-content: center;
		width: 100%;
		margin: 20rpx 0 10rpx 0;
	}

	.invite-button {
		background-color: #07c160;
		color: #ffffff;
		font-size: 28rpx;
		padding: 12rpx 30rpx;
		border-radius: 40rpx;
		border: none;
		box-shadow: 0 4rpx 8rpx rgba(7, 193, 96, 0.2);
	}
</style>
