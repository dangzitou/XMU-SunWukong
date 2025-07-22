<template>
	<view class="container container332681">
		<!-- 消息类别列表，类似微信的垂直列表布局 -->
		<view class="message-list">
			<!-- 邀请消息 -->
			<view class="message-item" @tap="navigateToDetail('invite')">
				<view class="message-icon bg-orange">
					<text class="icon diy-icon-group"></text>
			</view>
				<view class="message-content">
					<view class="message-content-title">
						<text>邀请通知</text>
						<view class="message-badge" v-if="inviteUnreadCount > 0">{{inviteUnreadCount}}</view>
						</view>
					<text class="message-desc">查看项目邀请消息</text>
						</view>
				<text class="icon arrow diy-icon-right"></text>
					</view>
					
			<!-- 申请消息 -->
			<view class="message-item" @tap="navigateToDetail('request')">
				<view class="message-icon bg-green">
					<text class="icon diy-icon-form"></text>
											</view>
				<view class="message-content">
					<view class="message-content-title">
						<text>申请通知</text>
						<view class="message-badge" v-if="requestUnreadCount > 0">{{requestUnreadCount}}</view>
										</view>
					<text class="message-desc">查看项目申请消息</text>
									</view>
				<text class="icon arrow diy-icon-right"></text>
					</view>
					
			<!-- 系统通知 -->
			<view class="message-item" @tap="navigateToDetail('system')">
				<view class="message-icon bg-blue">
					<text class="icon diy-icon-notice"></text>
											</view>
				<view class="message-content">
					<view class="message-content-title">
						<text>系统通知</text>
						<view class="message-badge" v-if="systemUnreadCount > 0">{{systemUnreadCount}}</view>
										</view>
					<text class="message-desc">查看系统公告和提醒</text>
									</view>
				<text class="icon arrow diy-icon-right"></text>
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
					request_list: [], 
					invite_list: [], 
					system_notices: []
				},
				// 未读消息计数
				inviteUnreadCount: 0,
				requestUnreadCount: 0,
				systemUnreadCount: 0
			};
		},
		onShow() {
			this.setCurrentPage(this);
			// 每次页面显示时刷新消息计数
			this.refreshMessageStatus();
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
		onReady() {
			console.log('页面准备完成');
		},
		methods: {
			async init() {
				await this.checkLoginState();
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				
				// 加载消息计数
				await this.loadMessageCount();
				uni.hideLoading();
			},
			
			// 检查是否登录
			async checkLoginState() {
				if (!this.$session.getToken()) {
					this.showToast('请先登录');

					this.navigateTo({
						type: 'page',
						url: '/pages/sign/login'
					});
				}
			},
			
			// 加载各类消息的未读计数
			async loadMessageCount() {
				try {
					console.log('加载消息计数');
					
					// 这里应该调用API获取实际未读计数
					// 以下为模拟数据，实际应替换为API调用
					
					// 加载邀请未读计数
					const inviteRes = await this.loadInviteCount();
					this.inviteUnreadCount = inviteRes;
					
					// 加载申请未读计数
					const requestRes = await this.loadRequestCount();
					this.requestUnreadCount = requestRes;
					
					// 加载系统通知未读计数
					const systemRes = await this.loadSystemNoticeCount();
					this.systemUnreadCount = systemRes;
					
					console.log('消息计数加载完成', {
						邀请: this.inviteUnreadCount,
						申请: this.requestUnreadCount,
						系统通知: this.systemUnreadCount
					});

					// 更新tabbar徽标
					this.updateTabBarBadge();
				} catch (error) {
					console.error('加载消息计数失败', error);
				}
			},

			// 更新tabbar徽标
			updateTabBarBadge() {
				try {
					// 计算总的未读消息数量
					const totalUnreadCount = this.inviteUnreadCount + this.requestUnreadCount + this.systemUnreadCount;

					console.log('更新tabbar徽标，总未读数量:', totalUnreadCount);

					if (totalUnreadCount > 0) {
						// 设置tabbar徽标
						uni.setTabBarBadge({
							index: 2, // 消息tab的索引（从0开始）
							text: totalUnreadCount > 99 ? '99+' : totalUnreadCount.toString()
						});
					} else {
						// 移除tabbar徽标
						uni.removeTabBarBadge({
							index: 2
						});
					}
				} catch (error) {
					console.error('更新tabbar徽标失败:', error);
				}
			},
			
			// 获取邀请未读计数
			async loadInviteCount() {
				try {
					// 使用云函数获取未读邀请计数，而不是直接查询数据库
					const res = await uniCloud.callFunction({
						name: 'get_message_count',
						data: { 
							user_id: this.$session.getUserValue('user_id'),
							type: 'invite'
						}
					});
					
					if (res && res.result && res.result.status === 1) {
						console.log('未读邀请数量:', res.result.count);
						return res.result.count;
					}
					
					return 0; // 默认返回0
				} catch (error) {
					console.error('获取邀请未读计数失败', error);
					return 0; // 发生错误时返回0
				}
			},
			
			// 获取申请未读计数
			async loadRequestCount() {
				try {
					// 使用云函数获取未读申请计数，而不是直接查询数据库
						const res = await uniCloud.callFunction({
						name: 'get_message_count',
						data: { 
							user_id: this.$session.getUserValue('user_id'),
							type: 'request'
						}
					});
					
					if (res && res.result && res.result.status === 1) {
						console.log('未读申请数量:', res.result.count);
						return res.result.count;
					}
					
					return 0; // 默认返回0
					} catch (error) {
					console.error('获取申请未读计数失败', error);
					return 0; // 发生错误时返回0
				}
			},
			
			// 获取系统通知未读计数
			async loadSystemNoticeCount() {
				try {
					const userId = this.$session.getUserValue('user_id');
					console.log('获取系统通知计数，用户ID:', userId);

					// 使用云函数获取未读系统通知计数
					const res = await uniCloud.callFunction({
						name: 'get_message_count',
						data: {
							user_id: userId,
							type: 'system'
						}
					});

					console.log('系统通知计数云函数返回结果:', res);

					if (res && res.result && res.result.status === 1) {
						console.log('未读系统通知数量:', res.result.count);
						return res.result.count || 0;
					} else {
						console.log('系统通知计数获取失败:', res.result ? res.result.msg : '无返回结果');
					}

					return 0; // 默认返回0
				} catch (error) {
					console.error('获取系统通知未读计数失败', error);
					return 0; // 发生错误时返回0
				}
			},
			
			// 导航到消息详情页
			navigateToDetail(type) {
				console.log(`导航到${type}消息详情页`);
				
				// 打印当前页面栈信息
				const pages = getCurrentPages();
				console.log('当前页面栈:', pages.map(p => p.route));
				
				// 根据类型导航到不同的详情页
				let url = '';
				
				switch(type) {
					case 'invite':
						url = '/pages/message/invite_detail?type=invite';
						break;
					case 'request':
						url = '/pages/message/request_detail?type=request';
						break;
					case 'system':
						url = '/pages/message/system_detail?type=system';
						break;
					default:
						url = '/pages/message/invite_detail?type=invite';
				}
				
				console.log('准备跳转到URL:', url);
				
				// 检测平台
				// #ifdef MP-WEIXIN
				console.log('当前平台: 微信小程序');
				// #endif
				
				// #ifdef H5
				console.log('当前平台: H5');
				// #endif
				
				// #ifdef APP-PLUS
				console.log('当前平台: App');
				// #endif
				
				// 获取系统信息
				const systemInfo = uni.getSystemInfoSync();
				console.log('系统信息:', systemInfo.platform);
				
				// 根据平台选择不同的导航方法
				if (systemInfo.platform === 'android' || systemInfo.platform === 'ios') {
					// App端使用redirectTo
					uni.redirectTo({
						url: url,
						success: () => console.log(`成功跳转到${type}消息详情页 (redirectTo)`),
						fail: (err) => {
							console.error(`跳转到${type}消息详情页失败 (redirectTo):`, err);
							this.showToast(`页面跳转失败: ${err.errMsg || '未知错误'}`);
						}
					});
					} else {
					// 其他平台使用navigateTo
					uni.navigateTo({
						url: url,
						success: () => console.log(`成功跳转到${type}消息详情页 (navigateTo)`),
						fail: (err) => {
							console.error(`跳转到${type}消息详情页失败 (navigateTo):`, err);
							this.showToast(`页面跳转失败: ${err.errMsg || '未知错误'}`);
							
							console.log('尝试使用其他导航方式');
							// 尝试使用reLaunch
							uni.reLaunch({
								url: url,
								fail: (err2) => console.error('reLaunch也失败了:', err2)
							});
						}
					});
				}
			},
			
			// 导航测试区域
			testNavigate(navType) {
				console.log(`测试${navType}导航`);
				
				// 使用同一个URL进行测试
				let url = '/pages/message/invite_detail?type=invite';
				console.log('准备使用', navType, '跳转到:', url);
				
				// 根据传入的导航类型使用不同的方法
				switch(navType) {
					case 'navigateTo':
				uni.navigateTo({
							url,
							success: () => console.log('navigateTo成功'),
					fail: (err) => {
								console.error('navigateTo失败:', err);
								this.showToast(`navigateTo失败: ${err.errMsg || '未知错误'}`);
							}
						});
						break;
					case 'redirectTo':
						uni.redirectTo({
							url,
							success: () => console.log('redirectTo成功'),
							fail: (err) => {
								console.error('redirectTo失败:', err);
								this.showToast(`redirectTo失败: ${err.errMsg || '未知错误'}`);
							}
						});
						break;
					case 'reLaunch':
						uni.reLaunch({
							url,
							success: () => console.log('reLaunch成功'),
							fail: (err) => {
								console.error('reLaunch失败:', err);
								this.showToast(`reLaunch失败: ${err.errMsg || '未知错误'}`);
							}
						});
						break;
				}
			},
			
			// 刷新消息状态
			async refreshMessageStatus() {
				try {
					console.log('刷新消息状态');
					
					// 检查本地存储是否有状态更新标志
					const statusUpdated = uni.getStorageSync('message_status_updated');
					console.log('消息状态更新标志:', statusUpdated);
					
					// 不管有没有标志，每次返回都刷新计数
					// 这样可以确保即使用户从其他页面返回，计数也是最新的
					uni.showLoading({
						title: '刷新中...',
						mask: false
					});
					
					await this.loadMessageCount();
					
					uni.hideLoading();
					
					// 如果有标志，则清除
					if (statusUpdated) {
						uni.removeStorageSync('message_status_updated');
					}
				} catch (error) {
					console.error('刷新消息状态失败', error);
					uni.hideLoading();
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container332681 {
		padding-bottom: 80px;
		background-color: #f7f7f7;
	}
	
	.message-header {
		padding: 30rpx;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1rpx solid #eeeeee;
	}
	
	.message-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.message-list {
		margin-top: 20rpx;
	}
	
	.message-item {
		background-color: #ffffff;
		display: flex;
		align-items: center;
		padding: 30rpx;
		margin-bottom: 2rpx;
		position: relative;
	}
	
	.message-icon {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}
	
	.bg-orange {
		background-color: #ff9500;
	}
	
	.bg-green {
		background-color: #07c160;
	}
	
	.bg-blue {
		background-color: #007aff;
	}
	
	.message-icon .icon {
		font-size: 48rpx;
		color: #ffffff;
	}
	
	.message-content {
		flex: 1;
	}
	
	.message-content-title {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.message-content-title text {
		font-size: 34rpx;
		color: #333333;
			font-weight: 500;
		}
	
	.message-badge {
		background-color: #ff3b30;
		color: #ffffff;
		font-size: 24rpx;
		height: 36rpx;
		min-width: 36rpx;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 10rpx;
		margin-left: 16rpx;
	}
	
	.message-desc {
			font-size: 28rpx;
		color: #999999;
	}
	
	.arrow {
		font-size: 40rpx;
		color: #cccccc;
		position: absolute;
		right: 30rpx;
	}
	
	.test-area {
		margin-top: 20rpx;
		padding: 30rpx;
		background-color: #ffffff;
	}
	
	.test-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 20rpx;
	}
	
	.test-buttons {
		display: flex;
		justify-content: space-between;
	}
	
	.test-btn {
		background-color: #007aff;
		color: #ffffff;
		padding: 20rpx 40rpx;
		border-radius: 10rpx;
	}
</style>
