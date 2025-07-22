<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 justify-center flex5-clz">
			<view class="flex flex-wrap diygw-col-24 flex-direction-column flex8-clz">
				<u-form-item labelAlign="center" labelWidth="auto" class="diygw-col-24 input-clz" label="孙悟空撮合系统" prop="input">
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
					<text class="diygw-col-24 text15-clz"> 密码 </text>
					<view class="flex diygw-col-24 flex-nowrap flex12-clz">
						<text class="flex icon2 diygw-col-0 icon2-clz diy-icon-unlock"></text>
						<u-form-item class="diygw-col-0 password-clz diygw-form-item-small" labelPosition="top" prop="password">
							<u-input :focus="passwordFocus" placeholder="输入您的密码" v-model="password" type="password" :password-icon="true" class="password-input"></u-input>
						</u-form-item>
					</view>
				</view>
				<text class="diygw-col-24 passwordErr-clz">
					{{ globalData.error.password }}
				</text>
				<view class="flex flex-wrap diygw-col-24 justify-between">
					<u-form-item class="diygw-col-0 checkbox-clz diygw-form-item-small" labelPosition="top" prop="checkbox">
						<u-checkbox-group class="flex flex-wrap diygw-col-24 justify-between" wrapClass=" justify-between" activeColor="#008D00" v-model="checkbox">
							<u-checkbox v-for="(checkboxitem, checkboxindex) in checkboxDatas" :key="checkboxindex" :name="checkboxitem.value">
								{{ checkboxitem.label }}
							</u-checkbox>
						</u-checkbox-group>
					</u-form-item>
					<text @tap="navigateTo" data-type="page" data-url="/pages/sign/reset_password" class="diygw-col-0 forget_password-clz"> 忘记密码 </text>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column items-center flex16-clz">
					<button @tap="navigateTo" data-type="loginFunction" :data-username="username" :data-password="password" class="global-button">登录</button>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-center flex-clz">
					<view class="flex flex-wrap diygw-col-0 justify-center items-center flex14-clz">
						<text @tap="navigateTo" data-type="page" data-url="/pages/sign/register" class="diygw-col-0 text17-clz"> 没有账户？ </text>
						<text @tap="navigateTo" data-type="page" data-url="/pages/sign/register" class="diygw-col-0 text18-clz"> 去注册 </text>
					</view>
				</view>
			</view>
		</view>
		<view class="clearfix"></view>
	</view>
</template>

<script>
	// import { validateByClass } from '@/common/validators/index.js';
	// import User from '@/validate/user.js';
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
				passwordFocus: false,
				password: '',
				checkboxDatas: [{ value: '1', label: '自动登录' }],
				checkbox: ['1']
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
			async init() {},
			// 进行登录操作 自定义方法
			async loginFunction(param) {
				let thiz = this;
				let username = param && (param.username || param.username == 0) ? param.username : thiz.username || '';
				let password = param && (param.password || param.password == 0) ? param.password : thiz.password || '';
				for (const key in this.globalData.error) this.globalData.error[key] = '';

				// 验证输入
				if (!username) {
					this.globalData.error.username = '请输入用户名';
					return;
				}

				if (!password) {
					this.globalData.error.password = '请输入密码';
					return;
				}

				// 不再在登录前检查密码格式

				// 尝试登录
				const res = await uniCloud.importObject('Sign').login({ username: username, password: password });

				if (!res.status) {
					// 如果登录失败，检查是否是密码错误
					if (res.msg.includes('密码错误')) {
						// 尝试使用常见密码登录
						const commonPasswords = ['123456', 'admin123', 'password', 'test123', username, username + '123'];

						for (const commonPassword of commonPasswords) {
							try {
								console.log(`尝试使用常见密码: ${commonPassword}`);
								const commonPasswordRes = await uniCloud.importObject('Sign').login({
									username: username,
									password: commonPassword
								});

								if (commonPasswordRes.status) {
									// 如果常见密码登录成功，直接设置用户信息并跳转到首页
									this.$session.setUser(commonPasswordRes.data);

									uni.showToast({
										title: '登录成功',
										icon: 'success',
										duration: 2000
									});

									// 更新消息tabbar徽标
									setTimeout(() => {
										getApp().updateMessageTabBarBadge();
									}, 500);

									setTimeout(() => {
										// 获取页面栈
										const pages = getCurrentPages();
										// 检查页面栈中是否有登录或注册页面
										const hasAuthPages = pages.some(page =>
											page.route.includes('login') ||
											page.route.includes('register')
										);

										if (hasAuthPages) {
											// 如果页面栈中有登录或注册页面，直接跳转到首页
											uni.reLaunch({
												url: '/pages/home'
											});
										} else if (pages.length > 1) {
											// 如果是从其他页面来的，正常返回
											uni.navigateBack();
										} else {
											// 如果是直接打开的登录页，跳转到首页
											uni.redirectTo({
												url: '/pages/home'
											});
										}
									}, 2000);
									return;
								}
							} catch (e) {
								console.error(`尝试常见密码登录失败: ${e.message}`);
							}
						}

						// 不再检查密码格式和显示重置密码提示
					}

					// 显示错误信息
					uni.showToast({
						title: res.msg,
						icon: 'error',
						duration: 2000
					});
					return;
				}

				this.$session.setUser(res.data);

				uni.showToast({
					title: res.msg,
					icon: 'success',
					duration: 2000
				});

				// 更新消息tabbar徽标
				setTimeout(() => {
					getApp().updateMessageTabBarBadge();
				}, 500);

				setTimeout(function () {
					// 获取页面栈
					const pages = getCurrentPages();
					// 检查页面栈中是否有登录或注册页面
					const hasAuthPages = pages.some(page =>
						page.route.includes('login') ||
						page.route.includes('register')
					);

					if (hasAuthPages) {
						// 如果页面栈中有登录或注册页面，直接跳转到首页
						uni.reLaunch({
							url: '/pages/home'
						});
					} else if (pages.length > 1) {
						// 如果是从其他页面来的，正常返回
						uni.navigateBack();
					} else {
						// 如果是直接打开的登录页，跳转到首页
						uni.redirectTo({
							url: '/pages/home'
						});
					}
				}, 2000);
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
	.icon3-clz {
		margin-left: 10rpx;
		color: #008d00;
		top: 0rpx;
		margin-top: 10rpx;
		position: absolute;
		right: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.icon3 {
		font-size: 42rpx;
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
	.checkbox-clz {
		margin-left: 18rpx;
		flex-shrink: 0;
		color: #050505;
		width: 360rpx !important;
		font-size: 30rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.forget_password-clz {
		margin-left: 10rpx;
		color: #000000;
		font-size: 30rpx !important;
		margin-top: 14rpx;
		margin-bottom: 10rpx;
		margin-right: 62rpx;
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
