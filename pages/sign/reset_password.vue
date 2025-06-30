<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 justify-center flex5-clz">
			<view class="flex flex-wrap diygw-col-24 flex-direction-column flex8-clz">
				<u-form-item labelAlign="center" labelWidth="auto" class="diygw-col-24 input-clz" label="密码重置" prop="input">
					<u-input placeholder="" v-model="input"></u-input>
				</u-form-item>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column">
					<text class="diygw-col-24 text-clz"> 用户名 </text>
					<view class="flex diygw-col-24 flex-nowrap flex2-clz">
						<text class="flex icon diygw-col-0 icon-clz diy-icon-profile"></text>
						<u-form-item class="diygw-col-0 username-clz diygw-form-item-small" labelPosition="top" prop="username">
							<u-input :focus="usernameFocus" placeholder="请输入用户名" v-model="username"></u-input>
						</u-form-item>
					</view>
					<text class="diygw-col-24 usernameErr-clz">
						{{ globalData.error.username }}
					</text>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column flex11-clz">
					<text class="diygw-col-24 text15-clz"> 旧密码 (可选) </text>
					<view class="flex diygw-col-24 flex-nowrap flex12-clz">
						<text class="flex icon2 diygw-col-0 icon2-clz diy-icon-unlock"></text>
						<u-form-item class="diygw-col-0 password-clz diygw-form-item-small" labelPosition="top" prop="oldPassword">
							<u-input :focus="oldPasswordFocus" placeholder="输入您的旧密码 (可选)" v-model="oldPassword" type="password" :password-icon="true" class="password-input"></u-input>
						</u-form-item>
					</view>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column flex11-clz">
					<text class="diygw-col-24 text15-clz"> 新密码 </text>
					<view class="flex diygw-col-24 flex-nowrap flex12-clz">
						<text class="flex icon2 diygw-col-0 icon2-clz diy-icon-unlock"></text>
						<u-form-item class="diygw-col-0 password-clz diygw-form-item-small" labelPosition="top" prop="newPassword">
							<u-input :focus="newPasswordFocus" placeholder="输入您的新密码" v-model="newPassword" type="password" :password-icon="true" class="password-input"></u-input>
						</u-form-item>
					</view>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column flex11-clz">
					<text class="diygw-col-24 text15-clz"> 确认新密码 </text>
					<view class="flex diygw-col-24 flex-nowrap flex12-clz">
						<text class="flex icon2 diygw-col-0 icon2-clz diy-icon-unlock"></text>
						<u-form-item class="diygw-col-0 password-clz diygw-form-item-small" labelPosition="top" prop="confirmPassword">
							<u-input :focus="confirmPasswordFocus" placeholder="再次输入您的新密码" v-model="confirmPassword" type="password" :password-icon="true" class="password-input"></u-input>
						</u-form-item>
					</view>
				</view>
				<text class="diygw-col-24 passwordErr-clz">
					{{ globalData.error.password }}
				</text>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column items-center flex16-clz">
					<button @tap="resetPassword" class="global-button">重置密码</button>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-center flex-clz">
					<view class="flex flex-wrap diygw-col-0 justify-center items-center flex14-clz">
						<text @tap="navigateTo" data-type="page" data-url="/pages/sign/login" class="diygw-col-0 text17-clz"> 返回 </text>
						<text @tap="navigateTo" data-type="page" data-url="/pages/sign/login" class="diygw-col-0 text18-clz"> 登录页面 </text>
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
				globalData: { error: { password: '', username: '' } },
				usernameFocus: false,
				username: '',
				oldPasswordFocus: false,
				oldPassword: '',
				newPasswordFocus: false,
				newPassword: '',
				confirmPasswordFocus: false,
				confirmPassword: ''
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

				// 如果有传入的用户名，自动填充
				if (option.username) {
					this.username = option.username;
				}
			}

			this.init();
		},
		methods: {
			async init() {},

			// 重置密码
			async resetPassword() {
				// 清除错误信息
				for (const key in this.globalData.error) this.globalData.error[key] = '';

				// 验证输入
				if (!this.username) {
					this.globalData.error.username = '请输入用户名';
					return;
				}

				if (!this.newPassword) {
					this.globalData.error.password = '请输入新密码';
					return;
				}

				if (this.newPassword !== this.confirmPassword) {
					this.globalData.error.password = '两次输入的密码不一致';
					return;
				}

				// 调用云函数重置密码
				try {
					const data = {
						username: this.username,
						newPassword: this.newPassword
					};

					// 如果提供了旧密码，添加到请求中
					if (this.oldPassword) {
						data.oldPassword = this.oldPassword;
					}

					const res = await uniCloud.importObject('Sign').resetPassword(data);

					if (!res.status) {
						uni.showToast({
							title: res.msg,
							icon: 'error',
							duration: 2000
						});
						return;
					}

					uni.showToast({
						title: res.msg,
						icon: 'success',
						duration: 2000
					});

					// 重置成功后，延迟跳转到登录页
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/sign/login'
						});
					}, 2000);
				} catch (e) {
					console.error('重置密码出错:', e);
					uni.showToast({
						title: '重置密码失败，请稍后再试',
						icon: 'error',
						duration: 2000
					});
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex5-clz {
		padding-top: 40rpx;
		padding-left: 16rpx;
		padding-bottom: 20rpx;
		padding-right: 16rpx;
	}
	.flex8-clz {
		border: 2rpx solid #eee;
		border-bottom-left-radius: 18rpx;
		box-shadow: 2rpx 2rpx 6rpx 3px rgba(31, 31, 31, 0.16);
		overflow: hidden;
		border-top-left-radius: 18rpx;
		border-top-right-radius: 18rpx;
		border-bottom-right-radius: 18rpx;
	}
	.input-clz {
		color: #008d00;
		font-size: 42rpx !important;
		text-align: left;
	}
	.text-clz {
		margin-left: 26rpx;
		width: calc(100% - 26rpx - 10rpx) !important;
		font-size: 28rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex2-clz {
		margin-left: 20rpx;
		border: 2rpx solid #07c160;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 20rpx - 20rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 4rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 20rpx;
	}
	.icon-clz {
		margin-left: 10rpx;
		color: #8d8585;
		margin-top: 4rpx;
		margin-bottom: 8rpx;
		margin-right: 10rpx;
	}
	.icon {
		font-size: 52rpx;
	}
	.username-clz {
		flex-shrink: 0;
		width: 89% !important;
	}
	.usernameErr-clz {
		margin-left: 20rpx;
		color: #ff0000;
		width: calc(100% - 20rpx - 10rpx) !important;
		font-size: 20rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex11-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 14rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.text15-clz {
		margin-left: 26rpx;
		width: calc(100% - 26rpx - 10rpx) !important;
		font-size: 28rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex12-clz {
		margin-left: 20rpx;
		border: 2rpx solid #07c160;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 20rpx - 20rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 4rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 20rpx;
	}
	.icon2-clz {
		margin-left: 14rpx;
		color: #8d8585;
		margin-top: 6rpx;
		margin-bottom: 10rpx;
		margin-right: 16rpx;
	}
	.icon2 {
		font-size: 48rpx;
	}
	.password-clz {
		flex-shrink: 0;
		width: 92% !important;
	}
	.passwordErr-clz {
		margin-left: 20rpx;
		color: #ff0000;
		width: calc(100% - 20rpx - 10rpx) !important;
		font-size: 20rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex16-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 0rpx;
	}
	.global-button {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 0 auto;
		width: 100%;
	}
	.flex-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 30rpx;
		margin-bottom: 110rpx;
		margin-right: 10rpx;
	}
	.flex14-clz {
		margin-left: 0rpx;
		font-size: 30rpx !important;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		text-align: center;
		margin-right: 0rpx;
	}
	.text17-clz {
		margin-left: 14rpx;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 4rpx;
	}
	.text18-clz {
		color: #008d00;
		font-weight: bold;
	}
	/* 容器样式 */
	.container332681 {
		width: 100%;
	}
	.password-input {
		:deep(.u-input__suffix-icon) {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			padding-right: 10rpx;
		}
	}
</style>
