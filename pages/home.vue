<template>
	<view class="container container332681">
		<view class="flex diygw-col-24">
			<view class="diygw-search">
				<view class="flex1 align-center flex padding-xs solid radius">
					<text style="color: #555 !important" class="diy-icon-search"></text>
					<input class="flex1" name="search" type="text" v-model="search" placeholder="搜索资讯" />
				</view>
				<view style="color: #333 !important" class="diygw-tag margin-left-xs radius-xs" @tap="handleSearch"> 搜索 </view>
			</view>
		</view>
		<view class="flex diygw-col-23 swiper-clz">
			<swiper :current="swiperIndex" class="swiper" @change="changeSwiper" indicator-color="rgba(51, 51, 51, 0.39)" indicator-active-color="#fff" indicator-dots="true" autoplay interval="3000" circular="true" style="height: 300rpx">
				<swiper-item v-for="(item, index) in bannerList" :key="index" class="diygw-swiper-item">
					<view class="diygw-swiper-item-wrap">
						<image :src="item.image" class="diygw-swiper-image"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		
		<view class="flex diygw-col-24 grid-clz">
			<view class="diygw-grid col-4">
				<view class="diygw-grid-item" @tap="filterNews('competition')">
					<view class="diygw-grid-inner">
						<view style="color: #008d00" :class="['diygw-grid-icon', 'diygw-avatar', 'grid-icon-clz', 'diy-icon-message', {'active': currentFilter === 'competition'}]"> </view>
						<view class="diygw-grid-title"> 竞赛资讯 </view>
					</view>
				</view>
				<view class="diygw-grid-item" @tap="filterNews('team')">
					<view class="diygw-grid-inner">
						<view style="color: #008d00" class="diygw-grid-icon diygw-avatar grid-icon-clz diy-icon-friendadd"> </view>
						<view class="diygw-grid-title"> 团队招募 </view>
					</view>
				</view>
				<view class="diygw-grid-item" @tap="filterNews('experience')">
					<view class="diygw-grid-inner">
						<view style="color: #008d00" class="diygw-grid-icon diygw-avatar grid-icon-clz diy-icon-write"> </view>
						<view class="diygw-grid-title"> 经验分享 </view>
					</view>
				</view>
				<view class="diygw-grid-item" @tap="filterNews('showcase')">
					<view class="diygw-grid-inner">
						<view style="color: #008d00" class="diygw-grid-icon diygw-avatar grid-icon-clz diy-icon-evaluate"> </view>
						<view class="diygw-grid-title"> 风采展示 </view>
					</view>
				</view>
			</view>
		</view>
		<view v-for="(news, index) in newsList" :key="index" 
			:class="['flex', 'flex-wrap', 'diygw-col-23', 'flex-direction-column', index % 2 === 0 ? 'flex1-clz' : 'flex-clz']"
			@tap="navigateTo"
			data-type="page"
			:data-url="news.type === 'competition' ? '/pages/competition/detail' : '/pages/news/detail'"
			:data-id="news._id">
			<view class="content-wrapper">
				<view class="text-wrapper">
					<text :class="['diygw-col-18', index % 2 === 0 ? 'text2-clz' : 'text-clz']">
						{{ news.title }}
					</text>
					<text :class="['diygw-col-18', index % 2 === 0 ? 'text1-clz' : 'text3-clz']">
						{{ news.author || '未知作者' }} {{ formatDateTime(news.create_time, 'YYYY-mm-dd HH:MM') }}
					</text>
				</view>
				<image 
					:src="news.avatar ? news.avatar.url : '/static/default.png'" 
					:class="['response', 'diygw-col-6', index % 2 === 0 ? 'image1-clz' : 'image-clz']" 
					mode="widthFix"
					@error="handleImageError(index)">
				</image>
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
				globalData: { newsList: [], competitionList: [] },
				search: '',
				swiperIndex: 0,
				newsList: [],
				bannerList: [
					{ image: '/static/dc.jpg' },
					{ image: '/static/c7604cfcc52f57819203f4ca3e02e50b.jpg' },
					{ image: '/static/51281f3e8f96c05fca0d9044ed77e007.jpg' }
				],
				currentFilter: '',
				competitionList: [],
			};
		},
		onShow() {
			this.setCurrentPage(this);
			// 更新消息tabbar徽标
			this.updateMessageBadge();
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
				await this.getNewsListFunction();
			},

			// 更新消息tabbar徽标
			updateMessageBadge() {
				try {
					// 检查用户是否已登录
					const userInfo = uni.getStorageSync('userInfo');
					if (userInfo && userInfo.user_id) {
						// 调用全局方法更新徽标
						getApp().updateMessageTabBarBadge();
					}
				} catch (error) {
					console.error('更新消息徽标失败:', error);
				}
			},
			// 获取新闻列表
			async getNewsListFunction() {
				try {
					const res = await uniCloud.importObject('News').getList(3);
					if (res.data) {
						this.newsList = res.data.map(news => ({
							...news,
							type: 'news',
							avatar: news.avatar || { url: '/static/default.png' }
						}));
						
						// 调试用：查看返回的数据结构
						console.log('News data:', this.newsList);
					}
				} catch (error) {
					console.error('获取新闻列表错误:', error);
					uni.showToast({
						title: '获取新闻列表失败',
						icon: 'error',
						duration: 2000
					});
				}
			},
			// 格式化日期时间
			formatDateTime(timestamp, format = 'YYYY-mm-dd HH:MM') {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				
				return format
					.replace('YYYY', year)
					.replace('mm', month)
					.replace('dd', day)
					.replace('HH', hours)
					.replace('MM', minutes);
			},
			changeSwiper(evt) {
				this.swiperIndex = evt.detail.current;
			},
			// 处理图片加载错误
			handleImageError(index) {
				if (this.newsList[index]) {
					this.newsList[index].avatar = { url: '/static/default-news.jpg' };
				}
			},
			// 添加筛选方法
			async filterNews(type) {
				this.currentFilter = type;
				
				if (type === 'competition') {
					await this.getCompetitionList();
				} else {
					// 重置为普通新闻列表
					await this.getNewsListFunction();
				}
			},
			// 修改 getCompetitionList 方法
			async getCompetitionList() {
				try {
					const db = uniCloud.database();
					const res = await db.collection('xm-stp-project_comp_detail')
						.orderBy('create_time', 'desc')  // 使用正确的时间字段名
						.limit(10)
						.field({
							_id: true,
							title: true,
							organizers: true,  // 使用正确的主办方字段名
							description: true,
							cover_image: true,
							create_time: true
						})
						.get();

					if (res.result && res.result.data) {
						this.newsList = res.result.data.map(comp => ({
							_id: comp._id,
							title: comp.title || '未命名竞赛',
							author: comp.organizers || '未知主办方',  // 使用 organizers 作为作者显示
							create_time: comp.create_time,
							avatar: {
								url: comp.cover_image || '/static/default.png'
							},
							type: 'competition'
						}));
						
						console.log('Competition list:', this.newsList);
					}
				} catch (error) {
					console.error('获取竞赛资讯失败:', error);
					uni.showToast({
						title: '获取竞赛资讯失败',
						icon: 'error',
						duration: 2000
					});
				}
			},
			navigateTo(evt) {
				const url = evt.currentTarget.dataset.url;
				const id = evt.currentTarget.dataset.id;
				uni.navigateTo({
					url: `${url}?id=${id}`,
					success: () => {
						// 成功跳转后的处理逻辑
					},
					fail: (error) => {
						console.error('跳转失败:', error);
						uni.showToast({
							title: '跳转失败',
							icon: 'error',
							duration: 2000
						});
					}
				});
			},
			// 添加搜索方法
			async handleSearch() {
				if (!this.search.trim()) {
					uni.showToast({
						title: '请输入搜索内容',
						icon: 'none'
					});
					return;
				}

				try {
					const db = uniCloud.database();
					const searchText = this.search.trim();

					// 同时搜索新闻和竞赛
					const [newsRes, compRes] = await Promise.all([
						// 搜索新闻
						db.collection('xm-stp-news')
							.where({
								title: new RegExp(searchText, 'i') // 使用正则进行模糊搜索
							})
							.field({
								_id: true,
								title: true,
								author: true,
								create_time: true,
								avatar: true
							})
							.get(),

						// 搜索竞赛
						db.collection('xm-stp-project_comp_detail')
							.where({
								title: new RegExp(searchText, 'i')
							})
							.field({
								_id: true,
								title: true,
								organizers: true,
								create_time: true,
								cover_image: true
							})
							.get()
					]);

					// 处理搜索结果
					const searchResults = [
						// 处理新闻结果
						...(newsRes.result.data || []).map(news => ({
							...news,
							type: 'news'
						})),
						// 处理竞赛结果
						...(compRes.result.data || []).map(comp => ({
							_id: comp._id,
							title: comp.title,
							author: comp.organizers,
							create_time: comp.create_time,
							avatar: { url: comp.cover_image || '/static/default.png' },
							type: 'competition'
						}))
					];

					// 更新列表显示
					this.newsList = searchResults;

					// 显示搜索结果数量
					uni.showToast({
						title: `找到 ${searchResults.length} 条结果`,
						icon: 'none'
					});

				} catch (error) {
					console.error('搜索失败:', error);
					uni.showToast({
						title: '搜索失败',
						icon: 'error'
					});
				}
			},
		}
	};
</script>

<style lang="scss" scoped>
	.swiper-clz {
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		top: 20rpx;
		left: 14rpx;
		border-top-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		position: relative;
	}
	.swiper-title {
		background-color: rgba(0, 0, 0, 0.281);
	}
	.grid-clz {
		margin-left: 10rpx;
		top: 20rpx;
		left: 0rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		position: relative;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.grid-item-clz {
	}
	.grid-icon-clz {
		font-size: 41px !important;
	}
	.flex1-clz {
		flex-shrink: 0;
		border-bottom-left-radius: 20rpx;
		box-shadow: 6rpx 6rpx 10rpx rgba(31, 31, 31, 0.16);
		overflow: hidden;
		top: 20rpx;
		left: 14rpx;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
		position: relative;
		height: 170rpx !important;
	}
	.text2-clz {
		margin-left: 10rpx;
		font-weight: bold;
		width: calc(75% - 10rpx - 10rpx) !important;
		font-size: 28rpx !important;
		line-height: 2;
		font-family: 黑体;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text1-clz {
		top: 0rpx;
		left: 10rpx;
		font-family: 黑体;
		position: relative;
	}
	.image1-clz {
		border-bottom-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		margin-right: 20rpx;
		margin-left: 10rpx;
		flex-shrink: 0;
		overflow: hidden;
		top: 10rpx;
		left: 0rpx;
		width: calc(25% - 10rpx - 20rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		position: relative;
		margin-bottom: 10rpx;
		height: 100rpx !important;
	}
	.flex-clz {
		flex-shrink: 0;
		border-bottom-left-radius: 20rpx;
		box-shadow: 6rpx 6rpx 10rpx rgba(31, 31, 31, 0.16);
		overflow: hidden;
		top: 20rpx;
		left: 14rpx;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
		position: relative;
		height: 170rpx !important;
	}
	.text-clz {
		margin-left: 10rpx;
		font-weight: bold;
		width: calc(75% - 10rpx - 10rpx) !important;
		font-size: 28rpx !important;
		line-height: 2;
		font-family: 黑体;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text3-clz {
		top: 0rpx;
		left: 10rpx;
		position: relative;
	}
	.image-clz {
		border-bottom-left-radius: 12rpx;
		border-top-right-radius: 12rpx;
		margin-right: 20rpx;
		margin-left: 10rpx;
		flex-shrink: 0;
		overflow: hidden;
		top: 10rpx;
		left: 0rpx;
		width: calc(25% - 10rpx - 20rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		position: relative;
		margin-bottom: 10rpx;
		height: 100rpx !important;
	}
	.container332681 {
		padding-bottom: 80px;
	}
	.diygw-grid-icon.active {
		color: #1aad19 !important;
		transform: scale(1.1);
		transition: all 0.3s ease;
	}
	.diygw-grid-item {
		transition: all 0.3s ease;
		
		&:active {
			opacity: 0.7;
		}
	}
	.content-wrapper {
		display: flex;
		width: 100%;
		padding: 10rpx;
	}
	.text-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 70%;  // 限制文本区域宽度
		margin-right: 20rpx;
	}
	.text2-clz, .text-clz {
		margin-left: 10rpx;
		font-weight: bold;
		font-size: 28rpx !important;
		line-height: 2;
		font-family: 黑体;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.text1-clz, .text3-clz {
		font-size: 24rpx;
		color: #666;
		margin-left: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.image1-clz, .image-clz {
		width: 160rpx !important;
		height: 120rpx !important;
		border-radius: 12rpx;
		object-fit: cover;
		flex-shrink: 0;
	}
</style>
