<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 justify-center items-center">
			<view class="flex flex-wrap diygw-col-24 justify-center items-center flex9-clz">
				<!-- 个人信息卡片 -->
				<view class="profile-card">
					<!-- 头像区域 -->
					<view class="avatar-container">
						<view class="diygw-avatar lg radius bg-none">
							<image v-if="globalData.userDetail.avatar" mode="aspectFit" class="diygw-avatar-img radius" :src="globalData.userDetail.avatar"></image>
								<view v-else class="diygw-avatar-img radius default-avatar">{{ globalData.userDetail.real_name ? globalData.userDetail.real_name.substring(0, 1) : 'U' }}</view>
						</view>
					</view>
					<!-- 用户名 -->
					<view class="name-container">
						<text class="user-name">{{ globalData.userDetail.real_name || '未设置姓名' }}</text>
					</view>
					<!-- 标签区域 -->
					<view class="tag-container">
						<!-- 学院标签 -->
						<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
							<text class="diygw-icon diy-icon-home"></text>
							<text class="tag-text">{{ globalData.userDetail.college_category?.name || '未设置学院' }}</text>
						</view>
						<!-- 专业标签 -->
						<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
							<text class="diygw-icon diy-icon-write"></text>
							<text class="tag-text">{{ globalData.userDetail.specific_category?.name || '未设置专业' }}</text>
						</view>
						<!-- 年级标签 -->
						<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
							<text class="diygw-icon diy-icon-time"></text>
							<text class="tag-text">{{ globalData.userDetail.onboarding_year || '未设置' }}级</text>
						</view>
						<!-- 身份标签 -->
						<view class="diygw-tag margin-xs xs radius diygw-line-green tag-item">
							<text class="diygw-icon diy-icon-vip"></text>
							<text class="tag-text">{{ globalData.userDetail.type?.name || '未设置身份' }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="flex diygw-col-24">
				<view class="diygw-grid col-3">
					<view class="diygw-grid-item">
						<view class="diygw-grid-inner" @tap="navigateTo"
                    data-type="page"
                    data-url="/pages/in_project/self">
							<view style="color: #008d00" class="diygw-grid-icon diygw-avatar diy-icon-formfill"> </view>
							<view class="diygw-grid-title"> 发起的项目 </view>
						</view>
					</view>
					<view class="diygw-grid-item" @tap="navigateTo"
                    data-type="page"
                    data-url="/pages/in_project/others">
						<view class="diygw-grid-inner">
							<view style="color: #008d00" class="diygw-grid-icon diygw-avatar diy-icon-friendfill"> </view>
							<view class="diygw-grid-title"> 加入的项目 </view>
						</view>
					</view>
					<view class="diygw-grid-item" @tap="navigateTo"
                    data-type="page"
                    data-url="/pages/project/favorite">
						<view class="diygw-grid-inner">
							<view style="color: #008d00" class="diygw-grid-icon diygw-avatar diy-icon-starfill"> </view>
							<view class="diygw-grid-title"> 收藏的项目 </view>
						</view>
					</view>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex4-clz" @tap="navigateTo" data-type="page" data-url="/pages/profile/profile_edit">
				<text class="flex icon diygw-col-0 icon-clz diy-icon-edit"></text>
				<text class="diygw-col-0 text2-clz"> 编辑个人资料 </text>
				<text class="flex icon5 diygw-col-2 icon5-clz diy-icon-right"></text>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex8-clz">
				<text class="flex icon11 diygw-col-0 icon11-clz diy-icon-mobile"></text>
				<text class="diygw-col-0 text8-clz"> 绑定手机号 </text>
				<text class="flex icon12 diygw-col-2 icon12-clz diy-icon-right"></text>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex2-clz">
				<image src="/static/yx.png" class="response diygw-col-2 image-clz" mode="widthFix"></image>
				<text class="diygw-col-0 text1-clz"> 绑定邮箱 </text>
				<text class="flex icon8 diygw-col-2 icon8-clz diy-icon-right"></text>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex7-clz">
				<text class="flex icon3 diygw-col-0 icon3-clz diy-icon-creative1"></text>
				<text class="diygw-col-0 text5-clz"> 帮助与反馈 </text>
				<text class="flex icon6 diygw-col-2 icon6-clz diy-icon-right"></text>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex6-clz">
				<text class="flex icon2 diygw-col-0 icon2-clz diy-icon-comment"></text>
				<text class="diygw-col-0 text4-clz"> 消息订阅 </text>
				<text class="flex icon7 diygw-col-2 icon7-clz diy-icon-right"></text>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex3-clz">
				<text class="flex icon4 diygw-col-0 icon4-clz diy-icon-settings"></text>
				<text class="diygw-col-0 text7-clz"> 设置 </text>
				<text class="flex icon10 diygw-col-2 icon10-clz diy-icon-right"></text>
			</view>
			<view class="flex flex-wrap diygw-col-24 items-center flex5-clz">
				<text class="flex icon1 diygw-col-0 icon1-clz diy-icon-info"></text>
				<text class="diygw-col-0 text3-clz"> 关于我们 </text>
				<text class="flex icon9 diygw-col-2 icon9-clz diy-icon-right"></text>
			</view>
		</view>

		<view class="logout-container">
			<button @tap="handleLogout" class="global-button">退出登录</button>
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
					userDetail: {
						real_name: '',
						_id: '',
						college_category: { name: '' },
						specific_category: { name: '' },
						onboarding_year: '',
						type: { name: '' },
						avatar: ''
					}
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
			async init() {},
			async initShow() {
				await this.checkLoginFunction();
			},
			// 检查登录 自定义方法
			async checkLoginFunction(param) {
				if (!this.$session.getToken()) {
					this.showToast('请先登录');
					this.navigateTo({
						type: 'page',
						url: 'sign/login'
					});
					return;
				}

				// 获取用户信息并保存到 globalData
				this.globalData.userDetail = this.$session.getUser();
				console.log('用户信息:', this.globalData.userDetail); // 添加日志查看数据
			},

			// 修改登出函数
			async logoutFunction() {
				try {
					console.log('开始退出登录流程');

					// 使用更直接的方式清除存储的会话信息
					uni.removeStorageSync('token');
					uni.removeStorageSync('userInfo');

					// 使用自定义会话清理方法（如果存在）
					if (this.$session && typeof this.$session.clearUser === 'function') {
						this.$session.clearUser();
					}

					if (this.$session && typeof this.$session.clear === 'function') {
						this.$session.clear();
					}

					console.log('会话信息已清除');

					// 显示退出成功提示
					uni.showToast({
						title: '退出成功',
						icon: 'success',
						duration: 1000
					});

					// 延迟一小段时间确保提示显示，然后重定向
					setTimeout(() => {
						console.log('准备跳转到登录页面');
						// 使用 reLaunch 确保清除页面栈
						uni.reLaunch({
							url: '/pages/sign/login',
							success: function() {
								console.log('成功跳转到登录页面');
							},
							fail: function(err) {
								console.error('跳转失败：', err);
							}
						});
					}, 1000);
				} catch (error) {
					// 输出详细错误信息以便调试
					console.error('退出登录失败，详细错误：', error);

					// 显示错误提示，包含一些详细信息
					uni.showToast({
						title: '退出失败：' + (error.message || '未知错误'),
						icon: 'none',
						duration: 2000
					});
				}
			},
			/**
			 * 处理退出登录
			 */
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							// 直接调用登出函数，不再重复显示退出成功提示
							this.logoutFunction();
						}
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex9-clz {
		width: 100% !important;
		margin: 10rpx 0 0 0;
		min-height: 180rpx !important;
		height: auto !important;
		padding-bottom: 0;
	}

	.profile-card {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10rpx 20rpx 0 20rpx;
	}

	.avatar-container {
		display: flex;
		justify-content: center;
		margin-bottom: 10rpx;
	}

	.diygw-avatar {
		width: 160rpx !important;
		height: 160rpx !important;
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
		font-size: 80rpx;
		font-weight: bold;
	}

	.name-container {
		width: 100%;
		text-align: center;
		margin-bottom: 5rpx;
	}

	.user-name {
		font-size: 46rpx !important;
		font-weight: bold;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
		display: inline-block;
	}
	.text6-clz {
		top: 20rpx;
		left: 20rpx;
		font-size: 28rpx !important;
		position: relative;
	}
	.tag-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;
		padding: 0 10rpx;
		margin-top: 5rpx;
		margin-bottom: 0;
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
	.flex4-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon-clz {
		margin-left: 10rpx;
		color: #008d00;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.icon {
		font-size: 50rpx;
	}
	.text2-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 12rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon5-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon5 {
		font-size: 40rpx;
	}
	.flex8-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon11-clz {
		margin-left: 10rpx;
		color: #008d00;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.icon11 {
		font-size: 50rpx;
	}
	.text8-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 12rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon12-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon12 {
		font-size: 40rpx;
	}
	.flex2-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.image-clz {
		flex-shrink: 0;
		top: 0rpx;
		left: 8rpx;
		width: 56rpx !important;
		position: relative;
		height: 56rpx !important;
	}
	.text1-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 30rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon8-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon8 {
		font-size: 40rpx;
	}
	.flex7-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon3-clz {
		margin-left: 10rpx;
		color: #008d00;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.icon3 {
		font-size: 50rpx;
	}
	.text5-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 12rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon6-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon6 {
		font-size: 40rpx;
	}
	.flex6-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon2-clz {
		margin-left: 10rpx;
		color: #008d00;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.icon2 {
		font-size: 50rpx;
	}
	.text4-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 12rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon7-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon7 {
		font-size: 40rpx;
	}
	.flex3-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon4-clz {
		margin-left: 10rpx;
		color: #008d00;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.icon4 {
		font-size: 50rpx;
	}
	.text7-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 12rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon10-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon10 {
		font-size: 40rpx;
	}
	.flex5-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon1-clz {
		margin-left: 10rpx;
		color: #008d00;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 10rpx;
	}
	.icon1 {
		font-size: 50rpx;
	}
	.text3-clz {
		margin-left: 0rpx;
		top: 0rpx;
		left: 12rpx;
		font-size: 30rpx !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon9-clz {
		color: #008d00;
		position: absolute;
		right: 10rpx;
	}
	.icon9 {
		font-size: 40rpx;
	}
	.btn-clz {
		padding-top: 20rpx;
		border-bottom-left-radius: 18rpx;
		color: #fff;
		padding-left: 20rpx;
		font-size: 32rpx !important;
		padding-bottom: 20rpx;
		border-top-right-radius: 18rpx;
		right: 14rpx;
		background-color: #07c160;
		overflow: hidden;
		top: 40rpx;
		left: 14rpx;
		border-top-left-radius: 18rpx;
		border-bottom-right-radius: 18rpx;
		position: relative;
		text-align: center;
		padding-right: 20rpx;
	}
	.container332681 {
		padding-bottom: 80px;
	}
	.logout-container {
		margin: 30rpx 20rpx;
		padding: 20rpx 0;
		margin-bottom: 120rpx; /* 确保底部导航栏不覆盖按钮 */
	}
	.global-button {
		background-color: #07c160; /* 修改为与其他绿色按钮一致 */
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 0 auto;
		width: 100%;
	}
</style>
