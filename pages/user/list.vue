<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex diygw-col-24">
				<view class="diygw-search">
					<view class="flex1 align-center flex padding-xs solid radius">
						<text style="color: #555 !important" class="diy-icon-search"></text>
						<input class="flex1" name="search" type="" v-model="search" placeholder="请输入名字" />
					</view>
					<view @tap="navigateTo" data-type="searchFunction" style="color: #333 !important" class="diygw-tag margin-left-xs radius-xs"> 搜索 </view>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-24 flex-direction-column">
				<view class="flex tabs diygw-col-24 flex-direction-column">
					<view class="diygw-tabs text-center solid-bottom justify-center scale-title tabs-title">
						<view class="diygw-tab-item tabs-item-title flex-sub" :class="index == tabsIndex ? ' font-bold   cur text-green  ' : ''" v-for="(item, index) in tabsDatas" :key="index" @click="changeTabs" :data-index="index"> <text v-if="item.icon" :class="item.icon"></text> {{ item.text }} </view>
					</view>
					<view class="">
						<view v-if="tabsIndex == 0" class="flex-sub">
							<view v-for="(item, index) in globalData.list[0]" :key="index" class="flex flex-wrap diygw-col-24 items-center flex7-clz" @tap="navigateTo" data-type="page" data-url="/pages/user/project" :data-user_id="item._id">
								<image :src="item.avatar || '/static/profile/default.png'" class="image3-size diygw-image diygw-col-0 image3-clz" mode="widthFix"></image>
								<view class="flex flex-wrap diygw-col-18 flex-direction-column justify-center items-start flex8-clz">
									<text class="diygw-col-24 text4-clz"> {{ item.real_name }} </text>
									<view class="flex flex-wrap diygw-col-24 items-center flex9-clz">
										<view class="flex diygw-col-24 flex-wrap tag-clz">
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.college }} </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.specific || '未填写专业' }} </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.onboarding_year }}级 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.type }} </text>
											</view>
										</view>
									</view>
									<view class="flex flex-wrap diygw-col-24 justify-between items-center flex17-clz">
										<view class="flex flex-wrap diygw-col-0 items-center flex18-clz">
											<text class="diygw-col-0 text8-clz"> 自身项目：{{ item.self_count ?? 0 }}, 加入项目：{{ item.request_count ?? 0 }} </text>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view v-if="tabsIndex == 1" class="flex-sub">
							<view v-for="(item, index) in globalData.list[1]" :key="index" class="flex flex-wrap diygw-col-24 items-center flex1-clz" @tap="navigateTo" data-type="page" data-url="/pages/user/project" :data-user_id="item._id">
								<image :src="item.avatar || '/static/profile/default.png'" class="image-size diygw-image diygw-col-0 image-clz" mode="widthFix"></image>
								<view class="flex flex-wrap diygw-col-18 flex-direction-column justify-center items-start flex3-clz">
									<text class="diygw-col-24 text-clz"> {{ item.real_name }} </text>
									<view class="flex flex-wrap diygw-col-24 items-center flex4-clz">
										<view class="flex diygw-col-24 flex-wrap tag1-clz">
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.college }} </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.specific || '未填写专业' }} </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.onboarding_year }}级 </text>
											</view>
											<view class="diygw-tag margin-xs xs radius diygw-line-green">
												<text> {{ item.type }} </text>
											</view>
										</view>
									</view>
									<view class="flex flex-wrap diygw-col-24 justify-between items-center flex5-clz">
										<view class="flex flex-wrap diygw-col-0 items-center flex6-clz">
											<text class="diygw-col-0 text1-clz"> 自身项目：{{ item.self_count ?? 0 }}, 加入项目：{{ item.request_count ?? 0 }} </text>
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
				globalData: { backup_list: [null, null], list: [null, null], backup_search: '' },
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
			async init() {
				await this.checkLoginFunction();
				await this.defaultLoadFunction();
			},
			// 获取用户列表 自定义方法
			async getListFunction() {
				let thiz = this;
				if (this.globalData.backup_list[thiz.tabsIndex] !== null) return;

				const res = await uniCloud.importObject('User').getList({ type: ['学生', '导师'][thiz.tabsIndex], user_id: this.$session.getUserValue('user_id') });
				this.globalData.list[thiz.tabsIndex] = res.data;
				this.globalData.backup_list[thiz.tabsIndex] = res.data;
			},

			// 检查登录 自定义方法
			async checkLoginFunction() {
				if (!this.$session.getToken()) {
					//比如未登录，转身到其他页面等
					this.showToast('请先登录');

					this.navigateTo({
						type: 'page',
						url: '/pages/sign/login'
					});
				}
			},

			// 默认获取 自定义方法
			async defaultLoadFunction() {
				this.getListFunction();
			},

			// 搜索用户 自定义方法
			async searchFunction() {
				let thiz = this;
				if (this.globalData.backup_search != '' && this.globalData.backup_search == this.search) {
					return;
				}

				if (this.search == '') {
					this.globalData.list[thiz.tabsIndex] = this.globalData.backup_list[thiz.tabsIndex];
					this.globalData.backup_search = '';
					return;
				}

				const res = await uniCloud.importObject('User').getList({ type: ['学生', '导师'][thiz.tabsIndex], user_id: this.$session.getUserValue('user_id'), real_name: this.search });
				this.globalData.list[thiz.tabsIndex] = res.data;
				this.globalData.backup_search = this.search;
			},
			changeTabs(evt) {
				let { index } = evt.currentTarget.dataset;
				if (index == this.tabsIndex) return;
				this.setData({
					tabsIndex: index
				});
				this.navigateTo({ type: 'getListFunction' });
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
		padding-bottom: 20rpx;
	}
</style>
