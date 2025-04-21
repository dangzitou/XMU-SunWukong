<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 flex-direction-column justify-center items-center">
			<view class="flex diygw-col-0 avatar-clz">
				<view class="diygw-avatar xl radius bg-none">
					<image mode="aspectFit" class="diygw-avatar-img radius" src="/static/team-3.jpg"></image>
				</view>
			</view>
			<text class="diygw-col-0 text-clz"> 某某某 </text>
		</view>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex diygw-col-24 justify-center tag-clz">
				<view class="diygw-tag margin-xs xs radius diygw-line-green">
					<text class="diygw-icon diy-icon-home"></text>
					<text> 信息学院 </text>
				</view>
				<view class="diygw-tag margin-xs xs radius diygw-line-green">
					<text class="diygw-icon diy-icon-write"></text>
					<text> 计算机科学与技术 </text>
				</view>
				<view class="diygw-tag margin-xs xs radius diygw-line-green">
					<text class="diygw-icon diy-icon-time"></text>
					<text> 2023级 </text>
				</view>
				<view class="diygw-tag margin-xs xs radius diygw-line-green">
					<text class="diygw-icon diy-icon-vip"></text>
					<text> 本科生 </text>
				</view>
			</view>
		</view>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex flex-wrap diygw-col-24 flex13-clz">
				<view class="flex diygw-col-12 items-start flex-nowrap flex14-clz">
					<view class="flex flex-wrap diygw-col-0 flex-direction-column flex15-clz">
						<text class="diygw-col-0 text3-clz"> 发起项目 </text>
						<text class="diygw-col-0 text16-clz"> 2 </text>
					</view>
					<image src="/static/wcjd.png" class="image1-size diygw-image diygw-col-0 bg-none image1-clz" mode="widthFix"></image>
				</view>
				<view class="flex diygw-col-12 flex-direction-column items-center flex-nowrap flex23-clz">
					<view class="flex diygw-col-24 items-start flex-nowrap">
						<view class="flex flex-wrap diygw-col-0 flex-direction-column flex26-clz">
							<text class="diygw-col-0 text23-clz"> 加入项目 </text>
							<text class="diygw-col-0 text24-clz"> 6 </text>
						</view>
						<image src="/static/wjrd.png" class="image4-size diygw-image diygw-col-0 image4-clz" mode="widthFix"></image>
					</view>
				</view>
			</view>
		</view>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz">
			<view class="flex flex-wrap diygw-col-24 items-stretch">
				<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between flex6-clz">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0 text1-clz"> 类脑计算在边缘智能设备中的应用探索 </text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
						<text class="diygw-col-0 text4-clz"> </text>
						<image src="/static/team-1.jpg" class="image-size diygw-image diygw-col-0 image-clz" mode="widthFix"></image>
						<text class="diygw-col-0 text6-clz"> 导师发起 </text>
					</view>
				</view>
				<image src="/static/1200px-19th_asian_games_hangzhou_2022_logo.svg.png" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex12-clz">
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0"> 要求： </text>
					<text class="diygw-col-0 text8-clz"> 本科生 </text>
					<text class="diygw-col-0 text2-clz"> 计算机专业 </text>
					<text class="diygw-col-0 text9-clz"> 数据分析能力 </text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="flex icon diygw-col-0 diy-icon-attention"></text>
					<text class="diygw-col-0"> 1999 </text>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex9-clz">
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0"> 截止：2025/10/1 23:59 </text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0"> 报名44/需求50 </text>
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
				globalData: {}
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
			async init() {}
		}
	};
</script>

<style lang="scss" scoped>
	.avatar-clz {
		margin-left: 10rpx;
		margin-top: 10rpx;
		margin-bottom: 30rpx;
		margin-right: 10rpx;
	}
	.text-clz {
		font-size: 26rpx !important;
	}
	.tag-clz {
		top: 0rpx;
		left: 0rpx;
		position: relative;
	}
	.flex13-clz {
		padding-top: 10rpx;
		padding-left: 10rpx;
		padding-bottom: 10rpx;
		padding-right: 10rpx;
	}
	.flex14-clz {
		padding-top: 20rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 20rpx;
		padding-bottom: 20rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #f7faff;
		margin-left: 10rpx;
		flex-shrink: 0;
		overflow: hidden;
		width: calc(50% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 20rpx;
	}
	.flex15-clz {
		flex: 1;
	}
	.text3-clz {
		flex: 1;
		font-size: 30rpx !important;
	}
	.text16-clz {
		margin-left: 0rpx;
		color: #4b5b76;
		font-weight: bold;
		flex: 1;
		font-size: 36rpx !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 0rpx;
	}
	.image1-clz {
		border: 2rpx solid #fbfbfb;
	}
	.image1-size {
		height: 80rpx !important;
		width: 80rpx !important;
	}
	.flex23-clz {
		padding-top: 20rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 20rpx;
		padding-bottom: 20rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #f7faff;
		margin-left: 10rpx;
		flex-shrink: 0;
		overflow: hidden;
		width: calc(50% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		padding-right: 20rpx;
	}
	.flex26-clz {
		flex: 1;
	}
	.text23-clz {
		flex: 1;
		font-size: 30rpx !important;
	}
	.text24-clz {
		margin-left: 0rpx;
		color: #4b5b76;
		font-weight: bold;
		flex: 1;
		font-size: 36rpx !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 0rpx;
	}
	.image4-clz {
		border: 2rpx solid #fbfbfb;
	}
	.image4-size {
		height: 80rpx !important;
		width: 80rpx !important;
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
		margin-bottom: 10rpx;
		padding-right: 20rpx;
	}
	.flex6-clz {
		flex: 1;
	}
	.text1-clz {
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
	.image-clz {
		border-bottom-left-radius: 40rpx;
		overflow: hidden;
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
	}
	.image-size {
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
	.text2-clz {
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
	.flex9-clz {
		padding-top: 20rpx;
		padding-left: 0rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #eee;
		padding-right: 0rpx;
	}
	.container332681 {
	}
</style>
