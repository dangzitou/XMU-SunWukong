<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 justify-center items-center flex5-clz">
			<view class="flex flex-wrap diygw-col-24 flex-direction-column flex8-clz">
				<text class="diygw-col-24 text11-clz"> 创建账户 </text>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column">
					<text class="diygw-col-24 text-clz"> 用户名 </text>
					<view class="flex diygw-col-24 flex-nowrap flex1-clz">
						<text class="flex icon diygw-col-0 icon-clz diy-icon-profile"></text>
						<u-form-item class="diygw-col-0 username-clz diygw-form-item-small" labelPosition="top" prop="username">
							<u-input placeholder="请输入用户名" v-model="username"></u-input>
						</u-form-item>
					</view>
					<text class="diygw-col-24 text3-clz">
						{{ globalData.error.username }}
					</text>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column">
					<text class="diygw-col-24 text14-clz"> 学号 </text>
					<view class="flex diygw-col-24 flex-nowrap flex10-clz">
						<text class="flex icon1 diygw-col-0 icon1-clz diy-icon-people"></text>
						<u-form-item class="diygw-col-0 id-clz diygw-form-item-small" labelPosition="top" prop="id">
							<u-input placeholder="请输入学号" v-model="id"></u-input>
						</u-form-item>
					</view>
					<text class="diygw-col-24 text4-clz">
						{{ globalData.error.id }}
					</text>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column">
					<text class="diygw-col-24 text1-clz"> 邮箱 </text>
					<view class="flex diygw-col-24 flex-nowrap flex3-clz">
						<text class="flex icon4 diygw-col-0 icon4-clz diy-icon-mail"></text>
						<u-form-item class="diygw-col-0 email-clz diygw-form-item-small" labelPosition="top" prop="email">
							<u-input placeholder="user@email.com" v-model="email"></u-input>
						</u-form-item>
					</view>
					<text class="diygw-col-24 text5-clz">
						{{ globalData.error.email }}
					</text>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column flex11-clz">
					<text class="diygw-col-24 text15-clz"> 密码 </text>
					<view class="flex diygw-col-24 flex-nowrap flex12-clz">
						<text class="flex icon2 diygw-col-0 icon2-clz diy-icon-unlock"></text>
						<u-form-item class="diygw-col-0 password-clz diygw-form-item-small" labelPosition="top" prop="password">
							<u-input placeholder="请输入密码" v-model="password" type="password" :password-icon="true"></u-input>
						</u-form-item>
					</view>
					<text class="diygw-col-24 text6-clz">
						{{ globalData.error.password }}
					</text>
				</view>
				<view class="flex flex-wrap diygw-col-24 flex-direction-column items-center flex16-clz">
					<button class="global-button">注册</button>
				</view>
				<view class="flex flex-wrap diygw-col-24 justify-center flex4-clz">
					<view class="flex flex-wrap diygw-col-0 justify-center items-center flex14-clz">
						<text @tap="navigateTo" data-type="page" data-url="/pages/sign/login" class="diygw-col-0 text17-clz"> 已有账户？ </text>
						<text @tap="navigateTo" data-type="page" data-url="/pages/sign/login" class="diygw-col-0 text2-clz"> 登录 </text>
					</view>
				</view>
			</view>
		</view>
		<view class="clearfix"></view>
	</view>
</template>

<script>
	import { validateByClass } from '@/common/validators/index.js';
	import User from '@/validate/user.js';
	export default {
		data() {
			return {
				//用户全局信息
				userInfo: {},
				//页面传参
				globalOption: {},
				//自定义全局变量
				globalData: { error: { password: '', id: '', email: '', username: '' } },
				username: '',
				id: '',
				email: '',
				password: ''
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
			// 注册 自定义方法
			async registerFunction(param) {
				let thiz = this;
				let username = param && (param.username || param.username == 0) ? param.username : thiz.username || '';
				let email = param && (param.email || param.email == 0) ? param.email : thiz.email || '';
				let id = param && (param.id || param.id == 0) ? param.id : thiz.id || '';
				let password = param && (param.password || param.password == 0) ? param.password : thiz.password || '';
				for (const key in this.globalData.error) this.globalData.error[key] = '';
				// 把报错先全部清空
				for (const key in this.globalData.error) this.globalData.error[key] = '';

				// const validationResults = validateByClass(param, new User(), 'register', 'zh-cn');

				// // 处理验证结果
				// let allPassed = true;
				// validationResults.forEach((result) => {
				// 	if (!result.passed) {
				// 		allPassed = false;
				// 		console.log(result.attribute, this.globalData.error);
				// 		this.globalData.error[result.attribute] = result.errors[0];
				// 	}
				// });

				// if (!allPassed) return;

				const res = await uniCloud.importObject('Sign').register({ username: username, password: password });

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
				uni.redirectTo({
					url: '/pages/sign/login'
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex5-clz {
		padding-top: 40rpx;
		padding-left: 10rpx;
		padding-bottom: -4rpx;
		padding-right: 16rpx;
	}
	.flex8-clz {
		margin-left: 0rpx;
		border: 2rpx solid #eee;
		border-bottom-left-radius: 18rpx;
		box-shadow: 2rpx 2rpx 6rpx 3px rgba(31, 31, 31, 0.16);
		overflow: hidden;
		width: calc(100%) !important;
		border-top-left-radius: 18rpx;
		margin-top: 0rpx;
		border-top-right-radius: 18rpx;
		border-bottom-right-radius: 18rpx;
		margin-bottom: 30rpx;
		margin-right: 0rpx;
	}
	.text11-clz {
		margin-left: 20rpx;
		color: #008d00;
		font-weight: bold;
		width: calc(100% - 20rpx - 10rpx) !important;
		font-size: 44rpx !important;
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		margin-right: 10rpx;
	}
	.text-clz {
		margin-left: 26rpx;
		width: calc(100% - 26rpx - 10rpx) !important;
		font-size: 28rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex1-clz {
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
	.text3-clz {
		margin-left: 20rpx;
		color: #ff0000;
		width: calc(100% - 20rpx - 10rpx) !important;
		font-size: 20rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text14-clz {
		margin-left: 26rpx;
		width: calc(100% - 26rpx - 10rpx) !important;
		font-size: 28rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex10-clz {
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
	.icon1-clz {
		margin-left: 10rpx;
		color: #8d8585;
		margin-top: 6rpx;
		margin-bottom: 8rpx;
		margin-right: 10rpx;
	}
	.icon1 {
		font-size: 50rpx;
	}
	.id-clz {
		flex-shrink: 0;
		width: 89% !important;
	}
	.text4-clz {
		margin-left: 20rpx;
		color: #ff0000;
		width: calc(100% - 20rpx - 10rpx) !important;
		font-size: 20rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text1-clz {
		margin-left: 26rpx;
		width: calc(100% - 26rpx - 10rpx) !important;
		font-size: 28rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex3-clz {
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
	.icon4-clz {
		margin-left: 10rpx;
		color: #8d8585;
		margin-top: 4rpx;
		margin-bottom: 8rpx;
		margin-right: 10rpx;
	}
	.icon4 {
		font-size: 56rpx;
	}
	.email-clz {
		flex-shrink: 0;
		width: 88% !important;
	}
	.text5-clz {
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
		width: 87% !important;
	}
	.text6-clz {
		margin-left: 20rpx;
		color: #ff0000;
		width: calc(100% - 20rpx - 10rpx) !important;
		font-size: 20rpx !important;
		margin-top: 0rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex16-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 30rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
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
	.flex4-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 30rpx;
		margin-bottom: 100rpx;
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
		margin-right: 0rpx;
	}
	.text2-clz {
		color: #008d00;
		font-weight: bold;
		font-size: 32rpx !important;
	}
	.container332681 {
	}
</style>
