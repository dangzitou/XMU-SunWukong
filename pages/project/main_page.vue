<template>
	<view class="container container332681 safe-bottom">
		<!-- 搜索栏 -->
		<view class="flex flex-wrap diygw-col-24">
			<view class="flex diygw-col-24">
				<view class="diygw-search">
					<view class="flex1 align-center flex padding-xs solid radius">
						<text style="color: #555 !important" class="diy-icon-search"></text>
						<input class="flex1" name="search" type="text" v-model="search" placeholder="搜索项目" />
					</view>
					<view style="color: #333 !important"
						  class="diygw-tag margin-left-xs radius-xs"
						  @tap="handleSearch">
						搜索
					</view>
					<view style="color: #07c160 !important"
						  class="diygw-tag margin-left-xs radius-xs"
						  @tap="refreshList">
						刷新
					</view>
				</view>
			</view>
			<!-- 当前筛选类型提示 -->
			<view v-if="currentFilter" class="filter-indicator">
				<text>当前筛选: {{ currentFilter }}</text>
				<text class="clear-filter" @tap="clearFilter">清除筛选</text>
			</view>
		</view>

		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex diygw-col-24">
				<view class="diygw-grid col-5">
					<!-- 动态渲染分类，如果没有获取到则使用默认分类 -->
					<view v-if="projectCategories.length > 0"
						  v-for="(category, index) in projectCategories.slice(0, 4)"
						  :key="category._id"
						  class="diygw-grid-item"
						  @tap="filterByType(category.name)"
						  :class="{'active-filter': currentFilter === category.name}">
						<view class="diygw-grid-inner">
							<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
								<image mode="aspectFit" class="diygw-avatar-img" :src="getCategoryImage(category.name)"></image>
							</view>
							<view class="diygw-grid-title"> {{ category.name }} </view>
						</view>
					</view>

					<!-- 如果没有获取到分类，使用默认分类 -->
					<template v-else>
						<view class="diygw-grid-item" @tap="filterByType('项目协作')" :class="{'active-filter': currentFilter === '项目协作'}">
							<view class="diygw-grid-inner">
								<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
									<image mode="aspectFit" class="diygw-avatar-img" src="/static/cxcp.png"></image>
								</view>
								<view class="diygw-grid-title"> 项目协作 </view>
							</view>
						</view>
						<view class="diygw-grid-item" @tap="filterByType('竞赛组队')" :class="{'active-filter': currentFilter === '竞赛组队'}">
							<view class="diygw-grid-inner">
								<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
									<image mode="aspectFit" class="diygw-avatar-img" src="/static/cy3.png"></image>
								</view>
								<view class="diygw-grid-title"> 竞赛组队 </view>
							</view>
						</view>
						<view class="diygw-grid-item" @tap="filterByType('科研招募')" :class="{'active-filter': currentFilter === '科研招募'}">
							<view class="diygw-grid-inner">
								<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
									<image mode="aspectFit" class="diygw-avatar-img" src="/static/dc.png"></image>
								</view>
								<view class="diygw-grid-title"> 科研招募 </view>
							</view>
						</view>
						<view class="diygw-grid-item" @tap="filterByType('大创计划')" :class="{'active-filter': currentFilter === '大创计划'}">
							<view class="diygw-grid-inner">
								<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
									<image mode="aspectFit" class="diygw-avatar-img" src="/static/zh.png"></image>
								</view>
								<view class="diygw-grid-title"> 大创计划 </view>
							</view>
						</view>
					</template>
					<view class="diygw-grid-item" @tap="navigateToUserList">
						<view class="diygw-grid-inner">
							<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
								<image mode="aspectFit" class="diygw-avatar-img" src="/static/project_action/user_list.svg"></image>
							</view>
							<view class="diygw-grid-title"> 用户列表 </view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 项目列表 -->
		<view v-for="(item, index) in globalData.list" :key="index"
			class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz"
			@tap="navigateToProjectDetail(item)">
			<view class="flex flex-wrap diygw-col-24 items-stretch">
				<view class="flex flex-wrap flex-direction-column justify-between"
					:class="hasProjectImage(item) ? 'diygw-col-0 flex6-clz' : 'diygw-col-24'">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0 text3-clz">{{ item.title }}</text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
						<text class="diygw-col-0 text4-clz"></text>
						<image :src="getCreatorAvatar(item)" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
						<text class="diygw-col-0 text6-clz">{{ item.type === 'teacher' ? '导师发起' : '学生发起' }}</text>
						<text class="diygw-col-0 text6-clz">{{ item.project_cat ? item.project_cat.name : (item.type || '科技创新') }}</text>
					</view>
				</view>
				<!-- 只有当项目有图片时才显示图片 -->
				<image v-if="hasProjectImage(item)" :src="getProjectImage(item)" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex12-clz">
				<view class="flex flex-wrap diygw-col-0 items-center description-container">
					<text class="diygw-col-0">简介：</text>
					<text class="diygw-col-0 description-text">{{ getProjectDescription(item) }}</text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="flex icon diygw-col-0 diy-icon-attention"></text>
					<text class="diygw-col-0">{{ item.view_count || 0 }}</text>
				</view>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex15-clz">
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">截止：{{ endingDateReturnFunction({ ending_time: item.ending_time }) }}</text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">需求{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
				</view>
			</view>
		</view>

		<!-- 项目详情弹窗 -->
		<view @touchmove.stop.prevent="" v-if="modal" class="diygw-modal bottom-modal" :class="modal" style="z-index: 1000000">
			<view class="diygw-dialog diygw-dialog-modal">
				<view class="justify-end diygw-bar">
					<view class="content"> 项目描述 </view>
					<view class="action" data-type="closemodal" data-id="modal" @tap="navigateTo">
						<text class="diy-icon-close"></text>
					</view>
				</view>
				<view>
					<view class="flex diygw-dialog-content">
						<text class="diygw-col-24 text1-clz diygw-text-md">
							{{ globalData.showProjectDetail.title }}
						</text>
						<text v-if="globalData.showProjectDetail.comp_name" class="diygw-col-24 diygw-text-sm"> 竞赛：{{ globalData.showProjectDetail.comp_name }} </text>
						<text class="diygw-col-24 diygw-text-sm"> 招募人数： {{ globalData.showProjectDetail.person_needed }} </text>
						<text class="diygw-col-24 diygw-text-sm" v-if="globalData.showProjectDetail.detail"> 已加入： {{ globalData.showProjectDetail.detail.person_pending }} </text>
						<text class="diygw-col-24 diygw-text-sm"> 项目创建时间: {{ $tools.formatDateTime(globalData.showProjectDetail.create_time, 'YYYY-mm-dd HH:MM') }} </text>
						<text class="diygw-col-24 diygw-text-sm"> 项目结束时间: {{ $tools.formatDateTime(globalData.showProjectDetail.ending_time, 'YYYY-mm-dd HH:MM') }} </text>
						<!-- 优先显示content_text，保留换行 -->
						<view v-if="globalData.showProjectDetail.detail && globalData.showProjectDetail.detail.content_text" class="diygw-col-24 content-text preserve-whitespace">
							{{ globalData.showProjectDetail.detail.content_text }}
						</view>
						<!-- 其次显示HTML格式的description -->
						<mp-html v-else-if="globalData.showProjectDetail.detail && globalData.showProjectDetail.detail.description" :content="globalData.showProjectDetail.detail.description" class="diygw-col-24 ucontent1-clz"></mp-html>
						<button v-show="!globalData.showProjectDetail.in_project && globalData.showProjectDetail.ending_time > secondFunction()" @tap="openRequestModalFunction" class="diygw-col-24 btn-clz diygw-btn-default">申请加入</button>
						<button v-show="!(globalData.showProjectDetail.ending_time > secondFunction())" class="diygw-col-24 btn1-clz diygw-btn-default">已过期</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 申请加入弹窗 -->
		<view @touchmove.stop.prevent="" v-if="modal1" class="diygw-modal basic" :class="modal1" style="z-index: 1000000">
			<view class="diygw-dialog diygw-dialog-modal1 basis-lg">
				<view class="justify-end diygw-bar">
					<view class="content"> 申请加入 </view>
					<view class="action" data-type="closemodal" data-id="modal1" @tap="navigateTo">
						<text class="diy-icon-close"></text>
					</view>
				</view>
				<view>
					<view class="flex diygw-dialog-content">
						<text class="diygw-col-24"> 主题：{{ globalData.showProjectDetail.title }} </text>
						<u-form-item class="diygw-col-24" labelPosition="top" prop="self_introduce">
							<u-input maxlength="200" height="60px" class="" placeholder="自我介绍（请介绍自己以提升被选中的可能性）" v-model="self_introduce" type="textarea"></u-input>
						</u-form-item>
					</view>
				</view>
				<view class="flex justify-end">
					<button @tap="requestToJoinFunction" class="diygw-btn green flex1 margin-xs">申请</button>
				</view>
			</view>
		</view>

		<view class="flex diygw-col-0 right-bottom floatbar-clz">
			<view class="diygw-grid diygw-actions">
				<button class="diygw-action" @tap="navigateTo" data-type="page" data-url="/pages/project/add">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar diy-icon-roundaddfill" style="color: #07c160"> </view>
						<view class="diygw-grid-title"></view>
					</view>
				</button>
			</view>
		</view>
	</view>
		<!-- 自动加载更多区域 -->
		<view v-if="globalData.list.length > 0" class="load-more-area">
			<view v-if="isLoading" class="loading-indicator">
				<text>{{ currentPage > 1 ? '加载更多中...' : '加载中...' }}</text>
			</view>
			<view v-else-if="!hasMore" class="no-more-data">
				<text>已显示全部项目</text>
			</view>
		</view>

		<!-- 底部占位元素，确保有足够的滚动空间 -->
		<view class="bottom-spacer"></view>
</template>

<script>
	import {
		useProjectStore
	} from '@/stores/project.js';

	export default {
		data() {
			return {
				// 本地组件状态
				search: '',
				self_introduce: '',
				modal: '',
				modal1: '',
				globalData: {
					list: [],
					showProjectDetail: {}
				},
				currentFilter: '',
				isLoading: false,
				hasMore: true,
				currentPage: 1,
				// 缓存用户头像和项目图片
				creatorAvatars: {},
				projectImages: {},
				// 项目类型对应的默认图片
				projectTypeImages: {
					'项目协作': '/static/cxcp.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/zh.png'
				},
				// 动态获取的项目分类
				projectCategories: []
			};
		},
		computed: {
			// 不使用mapState，直接在data中管理状态
		},
		onShow() {
			this.setCurrentPage(this);
			this.checkAndRefreshList();
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
			// 直接调用init方法
			this.init();
		},
		onUnload() {
			this.isInitialized = false;
			this.isLoading = false;
			console.log('页面卸载，重置初始化状态');
		},
		onReachBottom() {
			// 滚动到底部时自动加载更多
			if (this.hasMore && !this.isLoading) {
				console.log('触发自动加载更多');
				this.loadMore();
			}
		},

		onPullDownRefresh() {
			// 下拉刷新
			console.log('用户下拉刷新项目列表');
			this.currentPage = 1;
			this.hasMore = true;
			this.getListFunction(false).finally(() => {
				uni.stopPullDownRefresh();
			});
		},
		methods: {
			// 直接在页面中实现方法
			async init() {
				await this.loadProjectCategories(); // 先加载分类
				await this.getListFunction();
			},

			// 加载项目分类
			async loadProjectCategories() {
				try {
					const res = await uniCloud.importObject('Initialize').getCategoryForAdd();
					this.projectCategories = res.data.proj || [];
				} catch (e) {
					console.error('加载分类失败:', e);
					this.projectCategories = [];
				}
			},

			// 检查并刷新列表
			checkAndRefreshList() {
				// 检查是否需要刷新项目列表
				if (uni.getStorageSync('project_list_need_refresh')) {
					console.log('检测到需要刷新项目列表');
					uni.removeStorageSync('project_list_need_refresh');
					this.currentPage = 1;
					this.getListFunction(false);
				}

				// 检查是否有新项目发布的事件
				const lastRefreshTime = uni.getStorageSync('project_list_last_refresh') || 0;
				const currentTime = Date.now();

				// 如果超过30秒没有刷新，自动刷新一次
				if (currentTime - lastRefreshTime > 30000) {
					console.log('自动刷新项目列表');
					uni.setStorageSync('project_list_last_refresh', currentTime);
					this.currentPage = 1;
					this.getListFunction(false);
				}
			},

			async getListFunction(loadMore = false) {
				if (this.isLoading) return;

				try {
					this.isLoading = true;
					console.log('开始获取项目列表...', loadMore ? '加载更多' : '初始加载');

					// 获取用户ID（如果已登录）
					let userId = null;
					try {
						if (this.$session && this.$session.getUserValue) {
							userId = this.$session.getUserValue('user_id');
						}
					} catch (e) {
						console.log('获取用户ID失败，使用匿名访问');
					}

					// 调用支持分页的API，添加筛选参数
					const requestData = {
						user_id: userId,
						page: loadMore ? this.currentPage : 1,
						limit: 20 // 每页20个项目
					};

					// 添加筛选条件 - 使用分类ID
					if (this.currentFilter) {
						// 根据分类名称找到对应的ID
						const category = this.projectCategories.find(cat => cat.name === this.currentFilter);
						if (category) {
							requestData.filter_type_id = category._id;
						}
					}

					// 添加搜索条件
					if (this.search && this.search.trim()) {
						requestData.search = this.search.trim();
					}

					const res = await uniCloud.importObject('Project').getListForMainPage(requestData);

					console.log('云函数返回数据:', res);

					// 详细检查返回的数据结构
					if (res.data && res.data.length > 0) {
						console.log('第一个项目的数据结构:', res.data[0]);
						console.log('第一个项目的creator_avatar:', res.data[0].creator_avatar);
						console.log('第一个项目的user_id:', res.data[0].user_id);
					}

					if (res.status === 1 && res.data) {
						// 处理返回的数据，确保格式正确
						const projectList = res.data.map(item => ({
							...item,
							// 确保有正确的字段映射
							_id: item._id || item.id,
							title: item.title || item.project_name || '未命名项目',
							description: item.description || item.project_description || '',
							creator_name: item.creator_name || '未知用户',
							type_name: item.type_name || item.type || '项目协作',
							person_needed: item.person_needed || 0,
							create_time: item.create_time,
							ending_time: item.ending_time,
							in_project: item.in_project || false,
							// 保持原始的creator_avatar值，不设置默认值
							creator_avatar: item.creator_avatar || '',
							project_image: item.project_image || '/static/default.png'
						}));

						if (loadMore && this.currentPage > 1) {
							// 加载更多时追加数据
							this.globalData.list.push(...projectList);
						} else {
							// 初始加载时替换数据
							this.globalData.list = projectList;
						}

						// 判断是否还有更多数据
						this.hasMore = res.pagination ? res.pagination.hasMore : (projectList.length >= 20);

						console.log(`成功加载 ${projectList.length} 个项目，总计 ${this.globalData.list.length} 个项目`);

						// 异步加载用户头像和项目图片
						this.loadCreatorAvatars(projectList);
						this.loadProjectImages(projectList);

					} else {
						console.warn('API返回状态异常:', res.status, res.msg);
						if (!loadMore) {
							this.globalData.list = [];
						}
						this.hasMore = false;
					}

				} catch (error) {
					console.error('获取项目列表失败:', error);

					uni.showToast({
						title: '获取项目列表失败',
						icon: 'none',
						duration: 3000
					});

					if (!loadMore) {
						this.globalData.list = [];
					}
					this.hasMore = false;

				} finally {
					this.isLoading = false;
				}
			},

			handleSearch() {
				console.log('搜索项目:', this.search);
				this.currentPage = 1; // 重置分页
				this.hasMore = true; // 重置加载更多状态
				this.getListFunction(false); // 重新加载，不是加载更多
			},

			refreshList() {
				console.log('手动刷新项目列表');
				this.currentPage = 1;
				this.hasMore = true;
				this.getListFunction(false);

				uni.showToast({
					title: '刷新中...',
					icon: 'loading',
					duration: 1000
				});
			},



			filterByType(type) {
				console.log('按类型筛选:', type);
				// 切换筛选状态
				this.currentFilter = this.currentFilter === type ? '' : type;
				this.currentPage = 1;
				this.hasMore = true;
				this.getListFunction(false);
			},

			clearFilter() {
				console.log('清除筛选');
				this.currentFilter = '';
				this.search = '';
				this.currentPage = 1; // 重置分页
				this.hasMore = true; // 重置加载更多状态
				this.getListFunction(false); // 重新加载，不是加载更多
			},

			showProjectDetailFunction(project) {
				console.log('跳转到项目详情页面:', project);
				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${project._id}`
				});
			},

			openRequestModalFunction() {
				console.log('打开申请弹窗');
				this.modal = '';
				this.modal1 = 'show';
				this.self_introduce = '';
			},

			async requestToJoinFunction() {
				if (!this.self_introduce.trim()) {
					uni.showToast({
						title: '请填写自我介绍',
						icon: 'none'
					});
					return;
				}

				try {
					console.log('申请加入项目:', {
						project: this.globalData.showProjectDetail,
						introduce: this.self_introduce
					});

					// 这里应该调用实际的申请API
					// const res = await uniCloud.importObject('ProjectAction').requestToJoin({...});

					uni.showToast({
						title: '申请已提交',
						icon: 'success'
					});

					this.modal1 = '';
					this.self_introduce = '';

				} catch (error) {
					console.error('申请失败:', error);
					uni.showToast({
						title: '申请失败，请重试',
						icon: 'none'
					});
				}
			},

			async loadMore() {
				if (!this.hasMore || this.isLoading) return;

				this.currentPage++;
				await this.getListFunction(true); // 传入true表示加载更多
			},

			navigateToProjectDetail(project) {
				console.log('导航到项目详情:', project);
				this.showProjectDetailFunction(project);
			},

			navigateToUserList() {
				console.log('导航到用户列表');
				uni.navigateTo({
					url: '/pages/user/list'
				});
			},

			endingDateReturnFunction(param) {
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : '';
				if (!ending_time) return '';

				try {
					var date = this.$tools.formatDateTime(ending_time, 'YYYY-mm-dd HH:MM');
					date += this.$tools.formatDateTime(ending_time, 'YYYY-mm-dd HH:MM') < this.$tools.getCurrentDateTime() ? '(已过期)' : '';
					return date;
				} catch (e) {
					// 如果$tools不可用，使用简单的日期格式化
					const d = new Date(ending_time);
					return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
				}
			},

			getProjectDescription(project) {
				// 优先使用 content_text（纯文本描述）
				if (project.content_text) {
					return project.content_text.length > 50 ?
						project.content_text.substring(0, 50) + '...' :
						project.content_text;
				}

				// 其次使用 description（可能包含HTML）
				if (project.description) {
					// 移除HTML标签，只保留文本
					const textOnly = project.description.replace(/<[^>]*>/g, '');
					return textOnly.length > 50 ?
						textOnly.substring(0, 50) + '...' :
						textOnly;
				}

				// 最后使用其他可能的描述字段
				return project.project_description || '暂无简介';
			},

			getCreatorAvatar(project) {
				if (!project) return '/static/profile/default.png';

				const projectId = project._id;

				// 优先使用已经获取到的creator_avatar属性（非空字符串）
				if (project.creator_avatar && project.creator_avatar.trim() !== '') {
					console.log(`项目 ${projectId} 使用creator_avatar:`, project.creator_avatar);
					return project.creator_avatar;
				}

				// 其次使用缓存的创建者头像
				if (projectId && this.creatorAvatars[projectId]) {
					console.log(`项目 ${projectId} 使用缓存头像:`, this.creatorAvatars[projectId]);
					return this.creatorAvatars[projectId];
				}

				// 如果项目有user_id字段，尝试异步加载用户头像
				if (project.user_id && !this.creatorAvatars[projectId]) {
					console.log(`项目 ${projectId} 异步加载用户头像，用户ID:`, project.user_id);
					this.loadUserAvatar(project.user_id, projectId);
				}

				// 最后使用默认头像
				console.log(`项目 ${projectId} 使用默认头像`);
				return '/static/profile/default.png';
			},

			// 判断项目是否有实际图片（非分类图标）
			hasProjectImage(project) {
				if (!project) return false;

				// 检查项目的图片数组
				if (project.images && project.images.length > 0) {
					return true;
				}

				const projectId = project._id || project.project_id;

				// 检查缓存的项目图片
				if (projectId && this.projectImages[projectId]) {
					return true;
				}

				// 没有实际项目图片
				return false;
			},

			getProjectImage(project) {
				if (!project) return '/static/cxcp.png';

				// 优先使用项目的图片数组
				if (project.images && project.images.length > 0) {
					return project.images[0]; // 使用第一张图片
				}

				const projectId = project._id || project.project_id;

				// 其次使用缓存的项目图片
				if (projectId && this.projectImages[projectId]) {
					return this.projectImages[projectId];
				}

				// 如果没有项目图片，使用分类图标
				const categoryName = project.type_name || project.type;
				return this.projectTypeImages[categoryName] || '/static/cxcp.png';
			},

			getCategoryImage(categoryName) {
				return this.projectTypeImages[categoryName] || '/static/cxcp.png';
			},

			// 异步加载用户头像
			async loadUserAvatar(userId, projectId) {
				if (!userId || !projectId || this.creatorAvatars[projectId]) return;

				try {
					const userResult = await uniCloud.importObject('User').getUserDetail({
						user_id: userId
					});

					if (userResult.status === 1 && userResult.data) {
						const avatarUrl = userResult.data.avatar || '/static/profile/default.png';
						this.creatorAvatars[projectId] = avatarUrl;
						this.$forceUpdate(); // 强制更新视图
					} else {
						this.creatorAvatars[projectId] = '/static/profile/default.png';
					}
				} catch (error) {
					console.error(`获取用户 ${userId} 信息失败:`, error);
					this.creatorAvatars[projectId] = '/static/profile/default.png';
				}
			},

			// 批量加载创建者头像
			async loadCreatorAvatars(projectList) {
				if (!projectList || projectList.length === 0) return;

				try {
					console.log('开始批量加载创建者头像...');

					// 收集需要加载头像的项目
					const needLoadProjects = projectList.filter(project =>
						project.user_id && !this.creatorAvatars[project._id]
					);

					if (needLoadProjects.length === 0) return;

					// 批量异步加载
					const promises = needLoadProjects.map(async (project) => {
						try {
							await this.loadUserAvatar(project.user_id, project._id);
							return { projectId: project._id, success: true };
						} catch (error) {
							console.error(`获取项目 ${project._id} 创建者信息失败:`, error);
							return { projectId: project._id, success: false };
						}
					});

					await Promise.all(promises);
					console.log('批量加载创建者头像完成');

				} catch (error) {
					console.error('批量加载创建者头像失败:', error);
				}
			},

			// 批量加载项目图片
			async loadProjectImages(projectList) {
				if (!projectList || projectList.length === 0) return;

				try {
					console.log('开始批量加载项目图片...');

					// 收集项目ID
					const projectIds = projectList.map(project => project._id).filter(id => id);

					if (projectIds.length === 0) return;

					// 批量处理项目，每10个为一组
					const batchSize = 10;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的图片
						const promises = batchIds.map(async (projectId) => {
							try {
								const result = await uniCloud.importObject('ProjectAction').getProjectImages({
									project_id: projectId
								});

								if (result.status === 1 && result.data && result.data.length > 0) {
									// 只有当项目真正有图片时才保存到缓存
									this.projectImages[projectId] = result.data[0].tempFileURL;
									return { projectId, success: true };
								}
								// 如果项目没有图片，不在缓存中存储任何内容
								return { projectId, success: false };
							} catch (error) {
								console.error(`获取项目 ${projectId} 图片失败:`, error);
								return { projectId, success: false };
							}
						});

						await Promise.all(promises);
					}

					console.log('批量加载项目图片完成:', Object.keys(this.projectImages).length);

				} catch (error) {
					console.error('批量加载项目图片失败:', error);
				}
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

			// 兼容性方法
			setCurrentPage(page) {
				// Vue3 不需要设置 $scope，直接用 this 即可
			},
			getOption(option) {
				return option;
			},
			setData(data) {
				Object.assign(this, data);
			},

			// 获取当前时间戳（毫秒）
			secondFunction() {
				return Date.now();
			},

			// 处理导航和弹窗关闭
			navigateTo(e) {
				const dataset = e.currentTarget.dataset || {};
				const type = dataset.type;
				const id = dataset.id;
				const url = dataset.url;

				if (type === 'closemodal') {
					if (id === 'modal') {
						this.modal = '';
					} else if (id === 'modal1') {
						this.modal1 = '';
					}
				} else if (type === 'page' && url) {
					uni.navigateTo({
						url: url
					});
				}
			},

			// Swiper切换事件
			changeSwiper1(evt) {
				let swiper1Index = evt.detail.current;
				this.setData({ swiper1Index });
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex9-clz {
		margin-left: 0rpx;
		flex: 1;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 20rpx;
		border-bottom: 2rpx solid #eee;
		margin-right: 0rpx;
	}
	/* 网格项样式 */
	.grid-icon-clz {
		font-size: 36px !important;
	}
	.floatbar-clz {
		transform: translate(0rpx, 0rpx) scale(2, 2);
		bottom: 280rpx; /* 进一步增加底部距离，避免被 tabbar 遮挡 */
		width: 80rpx !important;
		right: 60rpx;
		z-index: 900;
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
		margin-bottom: 30rpx; /* 增加底部边距 */
		padding-right: 20rpx;
	}

	/* 添加一个类来为最后一个项目增加额外的底部边距 */
	.flex7-clz:last-child {
		margin-bottom: 100rpx; /* 为最后一个项目增加更大的底部边距 */
	}
	.flex6-clz {
		flex: 1;
	}
	.text3-clz {
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
	.image1-clz {
		border-bottom-left-radius: 40rpx;
		overflow: hidden;
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
	}
	.image1-size {
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
	.text-clz {
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
	.flex15-clz {
		padding-top: 20rpx;
		padding-left: 0rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #eee;
		padding-right: 0rpx;
	}
	.container332681 {
		padding-bottom: 180rpx; /* 进一步增加底部内边距，为 tabbar 预留更多空间 */
		margin-bottom: 0;
		min-height: 100vh; /* 确保容器至少有一个屏幕高度 */
	}

	/* 安全区域底部样式 */
	.safe-bottom {
		padding-bottom: calc(180rpx + constant(safe-area-inset-bottom)); /* iOS 11.0 之前 */
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom)); /* iOS 11.0 之后 */
	}

	/* 底部占位元素样式 */
	.bottom-spacer {
		height: 200rpx; /* 足够的高度确保内容不被 tabbar 遮挡 */
		width: 100%;
		clear: both;
	}

	/* 加载更多区域样式 */
	.load-more-area {
		padding: 30rpx 0;
		text-align: center;
		width: 100%;
	}

	/* 保留空白符和换行 */
	.preserve-whitespace {
		white-space: pre-wrap; /* 保留空白符和换行符，并正常换行 */
		word-wrap: break-word; /* 确保长单词也能换行 */
	}

	.loading-indicator {
		color: #999;
		font-size: 28rpx;
	}

	.load-more-btn {
		background-color: #f8f8f8;
		color: #07c160;
		font-size: 28rpx;
		padding: 15rpx 0;
		border-radius: 10rpx;
		margin: 0 30rpx;
	}

	.no-more-data {
		color: #999;
		font-size: 28rpx;
	}
	.flex-direction-column {
		flex-direction: column;
	}
	.items-end {
		align-items: flex-end;
	}
	.active-filter {
		background-color: #f0f0f0;
	}
	.filter-indicator {
		margin-left: 10rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
		padding: 10rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		background-color: #f0f0f0;
	}
	.clear-filter {
		margin-left: 10rpx;
		color: #07c160;
		font-size: 28rpx;
		font-weight: bold;
	}
	.creator-name {
		background-color: #e6f7ff !important;
		color: #0066cc !important;
		border: 1px solid #91d5ff !important;
	}
	.show-types-container {
		margin-top: 10rpx;
		margin-left: 10rpx;
		padding: 10rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		background-color: #f0f0f0;
	}
	.show-types-btn {
		color: #07c160;
		font-size: 28rpx;
		font-weight: bold;
	}

	/* 弹窗样式 */
	.diygw-modal {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1110;
		opacity: 0;
		outline: 0;
		text-align: center;
		-ms-transform: scale(1.185);
		transform: scale(1.185);
		backface-visibility: hidden;
		perspective: 2000rpx;
		background: rgba(0, 0, 0, 0.6);
		transition: all 0.3s ease-in-out 0s;
		pointer-events: none;
	}

	.diygw-modal.show {
		opacity: 1;
		transition-duration: 0.3s;
		-ms-transform: scale(1);
		transform: scale(1);
		overflow-x: hidden;
		overflow-y: auto;
		pointer-events: auto;
	}

	.diygw-dialog {
		position: relative;
		margin: 0 auto;
		max-width: 100%;
		background-color: #ffffff;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.diygw-modal.bottom-modal .diygw-dialog {
		width: 100%;
		border-radius: 0;
		position: absolute;
		bottom: 0;
	}

	.diygw-dialog-content {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	.diygw-bar {
		min-height: 100rpx;
		box-sizing: border-box;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #eee;
	}

	.btn-clz {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 20rpx auto 0;
		width: 100%;
		text-align: center;
	}

	.btn1-clz {
		background-color: #cccccc;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 20rpx auto 0;
		width: 100%;
		text-align: center;
	}

	.text1-clz {
		font-size: 30rpx !important;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.ucontent1-clz {
		flex-shrink: 0;
		width: 100% !important;
		font-size: 26rpx !important;
		margin-top: 20rpx;
	}

	.description-container {
		flex: 1;
		overflow: hidden;
	}

	.description-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 400rpx;
		color: #666;
	}
</style>
