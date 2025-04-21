<template>
	<view class="container container332681">
		<view class="flex diygw-col-24 justify-center items-center flex-nowrap flex-clz">
			<view class="flex flex-wrap diygw-col-23 flex-direction-column flex1-clz">
				<image :src="globalData.news.avatar.url" class="response diygw-col-24 image-clz" mode="widthFix"></image>
				<rich-text :nodes="globalData.news.title" class="diygw-col-24 text-clz"></rich-text>
				<view class="flex flex-wrap diygw-col-24 flex2-clz">
					<rich-text :nodes="text2" class="diygw-col-24"></rich-text>
				</view>
				<rich-text :nodes="globalData.news.paragraph" class="diygw-col-24 text3-clz"></rich-text>
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
				globalData: { news: { avatar: { url: '' } } }
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
				await this.getNewsDetailFunction();
			},
			// 获取新闻详情 自定义方法
			async getNewsDetailFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';
				const res = await uniCloud.importObject('News').getDetail(option.id);
				if (res.status == 0) {
					uni.showToast({
						title: res.msg,
						icon: 'error',
						duration: 2000
					});
					setTimeout(function () {
						uni.redirectTo({
							url: '/pages/home'
						});
					}, 2000);
				}

				this.globalData.news = res.data;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex-clz {
		flex-shrink: 0;
		width: 100% !important;
	}
	.flex1-clz {
		margin-left: 0rpx;
		flex-shrink: 0;
		width: calc(95.8333333333%) !important;
		margin-top: 12rpx;
		margin-bottom: 16rpx;
		margin-right: 0rpx;
	}
	.image-clz {
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
	}
	.text-clz {
		margin-left: 0rpx;
		font-weight: bold;
		width: calc(100%) !important;
		margin-top: 14rpx;
		margin-bottom: 16rpx;
		margin-right: 0rpx;
	}
	.flex2-clz {
		margin-left: 2rpx;
		width: calc(100% - 2rpx) !important;
		margin-top: 0rpx;
		margin-bottom: 30rpx;
		margin-right: 0rpx;
	}
	.text3-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		font-size: 28rpx !important;
		line-height: 2;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.container332681 {
	}
</style>
