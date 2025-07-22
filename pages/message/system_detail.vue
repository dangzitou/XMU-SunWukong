<template>
	<view class="container">
		<!-- 返回按钮 -->
		<view class="back-button" @tap="goBack">
			<text class="diygw-icon diy-icon-left"></text>
		</view>

		<!-- 通知列表 -->
		<view class="notice-list">

			<view v-if="globalData.system_notices.length === 0" class="empty-box">
				<image src="/static/empty-data.png" mode="aspectFit" class="empty-image"></image>
				<text>暂无系统通知</text>
			</view>

			<view v-else v-for="(item, index) in globalData.system_notices" :key="index" class="notice-item" :class="{'unread': item.status === 0}">
				<view class="notice-status" :class="{
					'status-read': item.status === 1
				}">
					<view v-if="item.status === 0" class="red-dot"></view>
				</view>

				<view class="notice-header">
					<!-- 根据通知类型或标题显示不同图标 -->
					<image v-if="item.type === 'member_status'" src="/static/project_action/member_transfer.svg" class="notice-icon" mode="aspectFit"></image>
					<image v-else-if="item.type === 'removed' || item.title.includes('移除')" src="/static/project_action/member_remove.svg" class="notice-icon" mode="aspectFit"></image>
					<image v-else-if="item.type === 'invite_permission' || item.title.includes('邀请权限')" src="/static/project_action/member_right.svg" class="notice-icon" mode="aspectFit"></image>
					<image v-else src="/static/message_center/notification.png" class="notice-icon" mode="aspectFit"></image>
					<view class="notice-title">
						<text class="title">{{ item.title || '系统通知' }}</text>

					</view>
				</view>

				<view class="notice-content">
					<text class="notice-text">{{ item.content || '暂无详细内容' }}</text>
				</view>

				<view class="divider"></view>

				<view class="notice-footer">
					<view v-if="item.status === 0" class="mark-read-btn" @tap="markAsRead(index)">
						<text class="mark-read-text">标记为已读</text>
					</view>
					<view v-else class="read-status">
						<text class="read-text">已读</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar" v-if="globalData.system_notices.length > 0 && hasUnreadNotice">
			<button class="btn-all-read" @tap="markAllAsRead">全部标记为已读</button>
		</view>
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
					system_notices: []
				},
				loading: true
			};
		},
		computed: {
			// 检查是否有未读通知
			hasUnreadNotice() {
				return this.globalData.system_notices.some(item => item.status === 0);
			}
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
			// 返回上一页
			goBack() {
				uni.navigateBack({
					delta: 1
				});
			},

			async init() {
				await this.checkLoginState();

				// 显示加载中
				this.loading = true;
				uni.showLoading({
					title: '加载中...',
					mask: true
				});

				// 加载系统通知
				await this.loadSystemNotices();

				uni.hideLoading();
				this.loading = false;
			},

			// 检查是否登录
			async checkLoginState() {
				if (!this.$session.getToken()) {
					this.showToast('请先登录');
					uni.navigateTo({
						url: '/pages/sign/login'
					});
				}
			},

			// 加载系统通知
			async loadSystemNotices() {
				try {
					console.log('开始加载系统通知');

					// 获取当前用户信息
					const myUser = this.$session.getUserValue('user_id');
					if (!myUser) {
						console.error('用户未登录，无法加载通知');
						this.showToast('请先登录');
						return;
					}
					console.log(`当前用户ID: ${myUser}`);

					try {
						// 使用云函数获取通知，这样可以避免权限问题
						console.log('准备调用云函数 ProjectNotification.getProjectNotifications');
						const callData = {
							method: 'getProjectNotifications',
							data: {
								user_id: myUser
							}
						};
						console.log('调用云函数参数:', JSON.stringify(callData));

						const res = await uniCloud.callFunction({
							name: 'ProjectNotification',
							data: callData
						});

						console.log('云函数 getProjectNotifications 返回结果:', JSON.stringify(res));

						// 处理返回结果
						if (res.result && res.result.status === 1 && Array.isArray(res.result.data)) {
							this.globalData.system_notices = res.result.data;
							console.log(`成功从云函数获取 ${this.globalData.system_notices.length} 条通知`);
						} else {
							console.warn('从云函数获取通知失败或返回数据格式不正确:', res.result ? JSON.stringify(res.result) : '无 result');
							// 尝试直接从数据库获取（备用方案）
							console.log('尝试直接从数据库获取通知...');
							try {
								// 正确设置数据库权限
								const dbForJQL = uniCloud.databaseForJQL();
								dbForJQL.setUser({
									role: ['admin']
								});

								// *** 使用设置了权限的 dbForJQL 实例进行查询 ***
								const dbRes = await dbForJQL.collection('xm-stp-project-notification')
									.where({
										user_id: myUser
									})
									.orderBy('create_time', 'desc')
									.limit(50)
									.get();

								if (dbRes.data && dbRes.data.length > 0) {
									this.globalData.system_notices = dbRes.data;
									console.log('从数据库直接获取的通知数量:', this.globalData.system_notices.length);
								} else {
									this.globalData.system_notices = [];
									console.log('数据库中没有系统通知');
								}
							} catch (dbError) {
								console.error('直接查询数据库失败:', dbError);
								this.globalData.system_notices = [];
							}
						}
					} catch (error) {
						console.error('加载系统通知失败:', error);
						this.globalData.system_notices = [];
						this.showToast('加载系统通知失败: ' + (error.message || String(error)));
					}
				} catch (error) {
					console.error('获取系统通知失败:', error);
					this.showToast('加载系统通知失败: ' + (error.message || String(error)));
					this.globalData.system_notices = [];
				}
			},

			// 标记已读
			async markAsRead(index) {
				try {
					const notice = this.globalData.system_notices[index];
					if (!notice || notice.status === 1) return;

					const messageId = notice._id;

					console.log('准备标记通知已读 (使用 importObject):', messageId);

					// 直接导入云对象并调用方法
					try {
						// 先显示操作中提示
						uni.showLoading({
							title: '处理中...',
							mask: true
						});

						// 导入云对象
						const projectNotification = uniCloud.importObject('ProjectNotification');

						// 直接调用云对象方法
						const result = await projectNotification.markNotificationRead({
							notification_id: messageId,
							user_id: this.$session.getUserValue('user_id')
						});

						console.log('标记已读结果:', JSON.stringify(result));

						uni.hideLoading();

						if (result && result.status === 1) {
							// 更新本地数据
							this.globalData.system_notices[index].status = 1;
							this.globalData.system_notices[index].read_time = Date.now();
							this.$forceUpdate();

							// 通知主页面刷新消息计数
							uni.setStorageSync('message_status_updated', true);

							this.showToast('已标记为已读');
						} else {
							console.error('标记已读失败:', result);
							this.showToast('操作失败，请重试');
						}
					} catch (error) {
						uni.hideLoading();
						console.error('调用云对象方法失败:', error);
						this.showToast('操作失败，请检查网络连接');
					}
				} catch (error) {
					console.error('标记已读异常:', error);
					this.showToast('操作失败，请重试');
				}
			},

			// 全部标记为已读
			async markAllAsRead() {
				try {
					// 获取所有未读消息ID
					const unreadMessages = this.globalData.system_notices
						.filter(item => item.status === 0)
						.map(item => item._id);

					if (unreadMessages.length === 0) {
						this.showToast('没有未读消息');
						return;
					}

					console.log('准备标记所有消息已读 (使用 importObject):', unreadMessages);

					// 直接导入云对象并调用方法
					try {
						// 先显示操作中提示
						uni.showLoading({
							title: '处理中...',
							mask: true
						});

						// 导入云对象
						const projectNotification = uniCloud.importObject('ProjectNotification');

						// 直接调用云对象方法
						const result = await projectNotification.markAllNotificationsRead({
							notification_ids: unreadMessages,
							user_id: this.$session.getUserValue('user_id')
						});

						console.log('批量标记已读结果:', JSON.stringify(result));

						uni.hideLoading();

						if (result && result.status === 1) {
							// 更新本地数据
							this.globalData.system_notices.forEach(item => {
								if (item.status === 0) {
									item.status = 1;
									item.read_time = Date.now();
								}
							});
							this.$forceUpdate();

							// 通知主页面刷新消息计数
							uni.setStorageSync('message_status_updated', true);

							this.showToast('已全部标记为已读');
						} else {
							console.error('批量标记已读失败:', result);
							this.showToast('操作失败，请重试');
						}
					} catch (error) {
						uni.hideLoading();
						console.error('调用云对象方法失败:', error);
						this.showToast('操作失败，请检查网络连接');
					}
				} catch (error) {
					console.error('批量标记已读异常:', error);
					this.showToast('操作失败，请重试');
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f7f7f7;
		min-height: 100vh;
		padding-bottom: calc(130rpx + constant(safe-area-inset-bottom)); /* 为底部操作栏留出空间，适配安全区域 */
		padding-bottom: calc(130rpx + env(safe-area-inset-bottom)); /* iOS 11.0 之后 */
		position: relative;
	}

	.back-button {
		position: fixed;
		top: 50rpx;
		left: 30rpx;
		width: 60rpx;
		height: 60rpx;
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 999;

		.diygw-icon {
			font-size: 32rpx;
			color: #333;
		}
	}

	/* 顶部导航栏 */
	.nav-bar {
		background-color: #07c160;
		height: 90rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		position: relative;
	}

	.nav-back {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		left: 30rpx;
	}

	.nav-back .icon {
		font-size: 40rpx;
		color: #ffffff;
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 34rpx;
		font-weight: bold;
		color: #ffffff;
	}

	.page-header {
		position: relative;
		padding: 30rpx;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.header-back {
		position: absolute;
		left: 30rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-back .icon {
		font-size: 40rpx;
		color: #333333;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	/* 通知列表 */
	.notice-list {
		padding: 20rpx;
	}

	.loading-box, .empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
	}

	.loading {
		width: 60rpx;
		height: 60rpx;
		border: 6rpx solid #f3f3f3;
		border-top: 6rpx solid #07c160;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}

	.empty-box text {
		font-size: 28rpx;
		color: #999999;
	}

	.notice-item {
		background-color: #ffffff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		position: relative;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}

	.notice-status {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 20rpx;
		height: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.red-dot {
		width: 16rpx;
		height: 16rpx;
		background-color: #ff3b30;
		border-radius: 50%;
	}

	.notice-header {
		padding: 30rpx;
		display: flex;
		align-items: center;
		border-bottom: 1px solid #f5f5f5;
	}

	.notice-icon {
		width: 80rpx;
		height: 80rpx;
		margin-right: 20rpx;
		border-radius: 8rpx;
	}

	.notice-title {
		flex: 1;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 8rpx;
		display: block;
	}

	.time {
		font-size: 24rpx;
		color: #999999;
		display: block;
	}

	.notice-content {
		padding: 30rpx;
	}

	.notice-text {
		font-size: 28rpx;
		color: #333333;
		line-height: 1.6;
	}

	.divider {
		height: 1px;
		background-color: #f5f5f5;
		margin: 0 30rpx;
	}

	.notice-footer {
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.mark-read-btn {
		background-color: #07c160;
		padding: 8rpx 24rpx;
		border-radius: 30rpx;
	}

	.mark-read-text {
		color: #ffffff;
		font-size: 24rpx;
	}

	.read-status {
		display: flex;
		align-items: center;
	}

	.read-text {
		font-size: 24rpx;
		color: #999999;
	}

	.read-time {
		font-size: 24rpx;
		color: #999999;
		margin-left: 10rpx;
	}

	/* 底部按钮栏 */
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 20rpx calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); /* 适配底部安全区域 */
		background-color: #ffffff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.btn-all-read {
		background-color: #07c160 !important;
		color: #ffffff !important;
		border-radius: 50rpx !important;
		font-size: 32rpx !important;
		height: 90rpx !important;
		line-height: 90rpx !important;
		width: 100% !important;
		border: none !important;
		text-align: center !important;
		padding: 0 20rpx !important;
		transition: all 0.3s ease !important;
	}

	.btn-all-read:active {
		opacity: 0.8 !important;
		transform: scale(0.98) !important;
	}
</style>