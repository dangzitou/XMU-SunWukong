<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex diygw-col-24">
				<view class="diygw-search">
					<view class="flex1 align-center flex padding-xs solid radius">
						<text style="color: #555 !important" class="diy-icon-search"></text>
						<input class="flex1" name="search" type="" v-model="search" placeholder="请输入关键字" />
					</view>
					<view style="color: #333 !important" class="diygw-tag margin-left-xs radius-xs"> 搜索 </view>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-24 flex-direction-column">
				<view class="flex tabs diygw-col-24 flex-direction-column">
					<view class="diygw-tabs text-center solid-bottom justify-center scale-title tabs-title">
						<view class="diygw-tab-item tabs-item-title flex-sub" :class="index == tabsIndex ? ' font-bold   cur text-green  ' : ''" v-for="(item, index) in tabsDatas" :key="index" @click="changeTabs" :data-index="index"> <text v-if="item.icon" :class="item.icon"></text> {{ item.text }} </view>
					</view>
					<view class="">
						<view v-if="tabsIndex == 0" class="flex-sub">
							<view class="flex flex-wrap diygw-col-24 items-center flex7-clz">
								<image src="/static/3.png" class="image3-size diygw-image diygw-col-0 image3-clz" mode="widthFix"></image>
								<view class="flex flex-wrap diygw-col-18 flex-direction-column justify-center items-start flex8-clz">
									<text class="diygw-col-24 text4-clz"> 张三 </text>
									<view class="flex flex-wrap diygw-col-24 items-center flex9-clz">
										<view class="flex diygw-col-24 flex-wrap tag-clz">
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 信息学院 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 计算机科学与技术 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 2023级 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 本科生 </text>
											</view>
										</view>
									</view>
									<view class="flex flex-wrap diygw-col-24 justify-between items-center flex17-clz">
										<view class="flex flex-wrap diygw-col-0 items-center flex18-clz">
											<text class="flex icon3 diygw-col-0 icon3-clz diy-icon-star"></text>
											<text class="diygw-col-0 text8-clz"> 9999 </text>
										</view>
									</view>
								</view>
							</view>
							<view class="flex flex-wrap diygw-col-24 items-center flex10-clz">
								<image src="/static/3.png" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
								<view class="flex flex-wrap diygw-col-18 flex-direction-column justify-center items-start flex11-clz">
									<text class="diygw-col-24 text2-clz"> 王五 </text>
									<view class="flex flex-wrap diygw-col-24 items-center flex12-clz">
										<view class="flex diygw-col-24 flex-wrap tag2-clz">
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 信息学院 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 计算机科学与技术 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 2023级 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 硕士研究生 </text>
											</view>
										</view>
									</view>
									<view class="flex flex-wrap diygw-col-24 justify-between items-center flex13-clz">
										<view class="flex flex-wrap diygw-col-0 items-center flex14-clz">
											<text class="flex icon1 diygw-col-0 icon1-clz diy-icon-star"></text>
											<text class="diygw-col-0 text3-clz"> 9999 </text>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view v-if="tabsIndex == 1" class="flex-sub">
							<view class="flex flex-wrap diygw-col-24 items-center flex1-clz">
								<image src="/static/3.png" class="image-size diygw-image diygw-col-0 image-clz" mode="widthFix"></image>
								<view class="flex flex-wrap diygw-col-18 flex-direction-column justify-center items-start flex3-clz">
									<text class="diygw-col-24 text-clz"> 李四 </text>
									<view class="flex flex-wrap diygw-col-24 items-center flex4-clz">
										<view class="flex diygw-col-24 flex-wrap tag1-clz">
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 信息学院 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 计算机科学与技术 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 2023级 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> 副教授 </text>
											</view>
										</view>
									</view>
									<view class="flex flex-wrap diygw-col-24 justify-between items-center flex5-clz">
										<view class="flex flex-wrap diygw-col-0 items-center flex6-clz">
											<text class="flex icon diygw-col-0 icon-clz diy-icon-star"></text>
											<text class="diygw-col-0 text1-clz"> 9999 </text>
										</view>
									</view>
								</view>
							</view>
						</view>
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
				globalData: {},
				search: '',
				tabsDatas: [
					{ text: `学生`, icon: `` },
					{ text: `导师`, icon: `` }
				],
				tabsLeft: 0,
				tabsWidth: 0,
				tabsItemWidth: 0,
				tabsIndex: 0
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
			changeTabs(evt) {
				let { index } = evt.currentTarget.dataset;
				if (index == this.tabsIndex) return;
				this.setData({
					tabsIndex: index
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex7-clz {
		padding-top: 16rpx;
		border-bottom-left-radius: 24rpx;
		padding-left: 16rpx;
		padding-bottom: 16rpx;
		border-top-right-radius: 24rpx;
		margin-right: 10rpx;
		background-color: #ffffff;
		margin-left: 10rpx;
		box-shadow: 0rpx 2rpx 6rpx 1px rgba(120, 120, 120, 0.16);
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 24rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 24rpx;
		margin-bottom: 0rpx;
		padding-right: 16rpx;
	}
	.image3-clz {
		border-bottom-left-radius: 24rpx;
		overflow: hidden;
		top: -20rpx;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		border-bottom-right-radius: 24rpx;
		position: relative;
	}
	.image3-size {
		height: 110rpx !important;
		width: 110rpx !important;
	}
	.flex8-clz {
		padding-top: 0rpx;
		flex: 1;
		padding-left: 10rpx;
		padding-bottom: 0rpx;
		padding-right: 0rpx;
	}
	.text4-clz {
		font-weight: bold;
		font-size: 28rpx !important;
	}
	.flex9-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.tag-clz {
		font-size: 16rpx !important;
	}
	.flex17-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.flex18-clz {
		color: #5e5e5e;
	}
	.icon3-clz {
		margin-left: 0rpx;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 6rpx;
	}
	.icon3 {
		font-size: 32rpx;
	}
	.text8-clz {
		font-weight: bold;
	}
	.flex10-clz {
		padding-top: 16rpx;
		border-bottom-left-radius: 24rpx;
		padding-left: 16rpx;
		padding-bottom: 16rpx;
		border-top-right-radius: 24rpx;
		margin-right: 10rpx;
		background-color: #ffffff;
		margin-left: 10rpx;
		box-shadow: 0rpx 2rpx 6rpx 1px rgba(120, 120, 120, 0.16);
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 24rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 24rpx;
		margin-bottom: 0rpx;
		padding-right: 16rpx;
	}
	.image1-clz {
		border-bottom-left-radius: 24rpx;
		overflow: hidden;
		top: -20rpx;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		border-bottom-right-radius: 24rpx;
		position: relative;
	}
	.image1-size {
		height: 110rpx !important;
		width: 110rpx !important;
	}
	.flex11-clz {
		padding-top: 0rpx;
		flex: 1;
		padding-left: 10rpx;
		padding-bottom: 0rpx;
		padding-right: 0rpx;
	}
	.text2-clz {
		font-weight: bold;
		font-size: 28rpx !important;
	}
	.flex12-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.tag2-clz {
		font-size: 16rpx !important;
	}
	.flex13-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.flex14-clz {
		color: #5e5e5e;
	}
	.icon1-clz {
		margin-left: 0rpx;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 6rpx;
	}
	.icon1 {
		font-size: 32rpx;
	}
	.text3-clz {
		font-weight: bold;
	}
	.flex1-clz {
		padding-top: 16rpx;
		border-bottom-left-radius: 24rpx;
		padding-left: 16rpx;
		padding-bottom: 16rpx;
		border-top-right-radius: 24rpx;
		margin-right: 10rpx;
		background-color: #ffffff;
		margin-left: 10rpx;
		box-shadow: 0rpx 2rpx 6rpx 1px rgba(120, 120, 120, 0.16);
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 24rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 24rpx;
		margin-bottom: 0rpx;
		padding-right: 16rpx;
	}
	.image-clz {
		border-bottom-left-radius: 24rpx;
		overflow: hidden;
		top: -20rpx;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		border-bottom-right-radius: 24rpx;
		position: relative;
	}
	.image-size {
		height: 110rpx !important;
		width: 110rpx !important;
	}
	.flex3-clz {
		padding-top: 0rpx;
		flex: 1;
		padding-left: 10rpx;
		padding-bottom: 0rpx;
		padding-right: 0rpx;
	}
	.text-clz {
		font-weight: bold;
		font-size: 28rpx !important;
	}
	.flex4-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.tag1-clz {
		font-size: 16rpx !important;
	}
	.flex5-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.flex6-clz {
		color: #5e5e5e;
	}
	.icon-clz {
		margin-left: 0rpx;
		margin-top: 0rpx;
		margin-bottom: 0rpx;
		margin-right: 6rpx;
	}
	.icon {
		font-size: 32rpx;
	}
	.text1-clz {
		font-weight: bold;
	}
	.container332681 {
	}
</style>
