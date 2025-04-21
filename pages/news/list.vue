<template>
	<view class="container container332681">
		<view class="flex diygw-col-24 diygw-bottom">
			<view class="diygw-grid diygw-actions">
				<button @tap="navigateTo" data-type="page" data-url="/pages/home" class="diygw-action">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar radius diy-icon-home" style=""> </view>
						<view class="diygw-grid-title"> 首页 </view>
					</view>
				</button>
				<button @tap="navigateTo" data-type="page" data-url="/pages/project/main_page" class="diygw-action">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar radius diy-icon-text" style=""> </view>
						<view class="diygw-grid-title"> 项目 </view>
					</view>
				</button>
				<button @tap="navigateTo" data-type="page" data-url="/pages/message/main_page" class="diygw-action">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar radius diy-icon-mark" style=""> </view>
						<view class="diygw-grid-title"> 消息 </view>
					</view>
				</button>
				<button @tap="navigateTo" data-type="page" data-url="/pages/profile/main_page" class="diygw-action">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar radius diy-icon-my" style=""> </view>
						<view class="diygw-grid-title"> 我 </view>
					</view>
				</button>
			</view>
		</view>
		<view class="flex diygw-col-24 items-center flex-nowrap flex-clz">
			<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between items-center flex3-clz">
				<text class="diygw-col-24 text2-clz"> 华为技术有限公司中国国际大学生创新大赛报名启动 </text>
				<view class="flex diygw-col-24 items-center flex-nowrap flex5-clz">
					<text class="diygw-col-0"> 信息学院团委 </text>
					<text class="diygw-col-0 text7-clz"> 2天前发布 </text>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-center items-center flex2-clz"> </view>
		</view>
		<view class="flex diygw-col-24 items-center flex-nowrap flex1-clz">
			<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between items-center flex4-clz">
				<text class="diygw-col-24 text-clz"> 华为技术有限公司中国国际大学生创新大赛报名启动 </text>
				<view class="flex diygw-col-24 items-center flex-nowrap flex6-clz">
					<text class="diygw-col-0"> 信息学院团委 </text>
					<text class="diygw-col-0 text3-clz"> 2天前发布 </text>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-center items-center flex7-clz"> </view>
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
				globalData: { newList: [] }
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
				await this.getListFunction();
			},
			// 获取新闻列表 自定义方法
			async getListFunction(param) {
				let thiz = this;
				const res = await uniCloud.importObject('News').getList(8);
				this.globalData.newsList = res.data;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		box-shadow: 0rpx 4rpx 4rpx 3px rgba(150, 148, 148, 0.09);
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex3-clz {
		padding-top: 0rpx;
		padding-left: 0rpx;
		padding-bottom: 0rpx;
		padding-right: 10rpx;
	}
	.text2-clz {
		padding-top: 10rpx;
		padding-left: 0rpx;
		font-size: 28rpx !important;
		padding-bottom: 10rpx;
		padding-right: 0rpx;
	}
	.flex5-clz {
		padding-top: 10rpx;
		color: #939393;
		padding-left: 0rpx;
		padding-bottom: 10rpx;
		padding-right: 0rpx;
	}
	.text7-clz {
		margin-left: 10rpx;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.flex2-clz {
		border: 2rpx solid #eee;
		flex-shrink: 0;
		border-bottom-left-radius: 12rpx;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
		width: 160rpx !important;
		border-top-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		background-image: url(/static/c7604cfcc52f57819203f4ca3e02e50b.jpg);
		height: 160rpx;
	}
	.flex1-clz {
		margin-left: 10rpx;
		border-bottom-left-radius: 12rpx;
		box-shadow: 0rpx 4rpx 4rpx 3px rgba(150, 148, 148, 0.09);
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex4-clz {
		padding-top: 0rpx;
		padding-left: 0rpx;
		padding-bottom: 0rpx;
		padding-right: 10rpx;
	}
	.text-clz {
		padding-top: 10rpx;
		padding-left: 0rpx;
		font-size: 28rpx !important;
		padding-bottom: 10rpx;
		padding-right: 0rpx;
	}
	.flex6-clz {
		padding-top: 10rpx;
		color: #939393;
		padding-left: 0rpx;
		padding-bottom: 10rpx;
		padding-right: 0rpx;
	}
	.text3-clz {
		margin-left: 10rpx;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.flex7-clz {
		border: 2rpx solid #eee;
		flex-shrink: 0;
		border-bottom-left-radius: 12rpx;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
		width: 160rpx !important;
		border-top-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		background-image: url(/static/c7604cfcc52f57819203f4ca3e02e50b.jpg);
		height: 160rpx;
	}
	.container332681 {
		padding-bottom: 80px;
	}
</style>
