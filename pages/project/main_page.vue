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
				<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between flex6-clz">
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
				<image :src="getProjectImage(item)" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
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
		<!-- 加载更多区域 -->
		<view v-if="globalData.list.length > 0" class="load-more-area">
			<view v-if="isLoading && currentPage > 1" class="loading-indicator">
				<text>加载中...</text>
			</view>
			<view v-else-if="hasMore" class="load-more-btn" @tap="loadMore">
				<text>加载更多</text>
			</view>
			<view v-else class="no-more-data">
				<text>没有更多项目了</text>
			</view>
		</view>

		<!-- 底部占位元素，确保有足够的滚动空间 -->
		<view class="bottom-spacer"></view>
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
				globalData: {
					list: [],
					allProjects: [], // 存储所有项目，用于筛选
					projectList: {},
					showProjectDetail: {}
				},
				search: '',
				currentFilter: '', // 当前筛选的项目类型
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				projectImages: {}, // 存储项目ID到图片URL的映射
				creatorAvatars: {}, // 存储项目ID到创建者头像的映射
				tabsDatas: [],
				tabsIndex: 0,
				modal: '',
				modal1: '',
				self_introduce: '',
				// 分页相关
				pageSize: 10, // 每页显示的项目数量
				currentPage: 1, // 当前页码
				isLoading: false, // 是否正在加载
				hasMore: true, // 是否还有更多数据
				loadingImages: false, // 是否正在加载图片
				loadingAvatars: false // 是否正在加载头像
			};
		},
		onShow() {
			this.setCurrentPage(this);
			// 只有在需要刷新时才重新加载项目数据
			if (uni.getStorageSync('project_list_need_refresh')) {
				console.log('检测到需要刷新项目列表');
				uni.removeStorageSync('project_list_need_refresh');
				this.getListFunction();
			}
		},
		onLoad(option) {
			this.setCurrentPage(this);
			if (option) {
				this.setData({
					globalOption: this.getOption(option)
				});
			}

			this.init();

			// 添加页面滚动监听
			uni.onPageScroll(this.handlePageScroll);
		},
		onUnload() {
			// 移除页面滚动监听
			uni.offPageScroll(this.handlePageScroll);
		},
		methods: {
			async init() {
				await this.getListFunction();
			},
			async getListFunction(loadMore = false) {
				try {
					// 如果不是加载更多，则重置分页参数
					if (!loadMore) {
						this.currentPage = 1;
						this.hasMore = true;
						this.globalData.list = [];
						this.globalData.allProjects = [];

						// 只在初始加载时显示全屏加载中
						uni.showLoading({
							title: '加载中...',
							mask: true
						});

						// 获取项目类型列表
						const catRes = await uniCloud.importObject('Initialize').getProjectCategory();
						console.log('项目分类:', catRes.data);

						// 初始化项目列表数据结构
						this.globalData.projectList = {};
						this.tabsDatas = [];

						// 为每个项目类型创建数据结构
						for (const i in catRes.data) {
							this.tabsDatas.push({
								text: catRes.data[i].name,
								icon: ''
							});
							this.globalData.projectList[catRes.data[i].name] = {
								data: [],
								load: 0
							};
						}
					} else if (this.isLoading || !this.hasMore) {
						// 如果正在加载或没有更多数据，则直接返回
						return;
					}

					// 标记为正在加载
					this.isLoading = true;

					// 使用分页参数获取项目数据
					const projectsRes = await uniCloud.importObject('Project').getProjectsByPage({
						page: this.currentPage,
						pageSize: this.pageSize,
						filter: this.currentFilter || ''
					});

					console.log(`获取第 ${this.currentPage} 页项目数据:`, projectsRes);

					if (projectsRes.status !== 1 || !Array.isArray(projectsRes.data)) {
						console.error('获取项目列表失败:', projectsRes.msg);
						uni.showToast({
							title: projectsRes.msg || '获取项目列表失败',
							icon: 'error'
						});
						this.isLoading = false;
						// 只在初始加载时隐藏全屏加载
						if (!loadMore) {
							uni.hideLoading();
						}
						return;
					}

					// 检查是否还有更多数据
					this.hasMore = projectsRes.data.length === this.pageSize;

					// 将新获取的项目添加到列表中
					const newProjects = projectsRes.data;

					// 确保按创建时间降序排序（最新的在最上面）
					newProjects.sort((a, b) => {
						// 如果是秒级时间戳，转换为毫秒级进行比较
						const timeA = typeof a.create_time === 'number' ?
							(a.create_time.toString().length <= 10 ? a.create_time * 1000 : a.create_time) : 0;
						const timeB = typeof b.create_time === 'number' ?
							(b.create_time.toString().length <= 10 ? b.create_time * 1000 : b.create_time) : 0;
						return timeB - timeA; // 降序排序，最新的在前面
					});

					// 添加到全局项目列表，避免重复
					const existingIds = new Set(this.globalData.allProjects.map(p => p._id));
					const uniqueNewProjects = newProjects.filter(p => !existingIds.has(p._id));

					console.log(`获取到 ${newProjects.length} 个项目，其中 ${uniqueNewProjects.length} 个是新项目`);

					// 添加不重复的项目到全局列表
					this.globalData.allProjects = [...this.globalData.allProjects, ...uniqueNewProjects];

					// 更新显示列表
					this.globalData.list = [...this.globalData.list, ...uniqueNewProjects];

					// 按类型分组项目
					for (const project of uniqueNewProjects) {
						// 尝试从多个可能的字段获取分类名称
						let categoryName = null;

						// 优先使用project_cat.name
						if (project.project_cat && project.project_cat.name) {
							categoryName = project.project_cat.name;
						}
						// 其次尝试使用type字段
						else if (project.type && typeof project.type === 'string' &&
								 this.globalData.projectList[project.type]) {
							categoryName = project.type;
						}
						// 最后尝试使用type_name字段
						else if (project.type_name && typeof project.type_name === 'string' &&
								 this.globalData.projectList[project.type_name]) {
							categoryName = project.type_name;
						}

						// 如果找到有效的分类名称，添加到对应分类
						if (categoryName && this.globalData.projectList[categoryName]) {
							// 检查是否已存在于该分类中
							const existsInCategory = this.globalData.projectList[categoryName].data.some(
								p => p._id === project._id
							);

							if (!existsInCategory) {
								this.globalData.projectList[categoryName].data.push(project);
								this.globalData.projectList[categoryName].load = 1;
							}
						}
					}

					// 获取新项目的ID
					const projectIds = newProjects.map(project => project._id);

					// 增加页码
					this.currentPage++;

					// 标记为加载完成
					this.isLoading = false;

					// 只在初始加载时隐藏全屏加载
					if (!loadMore) {
						uni.hideLoading();
					}

					// 延迟加载图片和头像
					setTimeout(() => {
						this.loadProjectImages(projectIds);
					}, 500);

					console.log(`已加载 ${this.globalData.list.length} 个项目`);
				} catch (error) {
					console.error('获取项目数据失败:', error);
					this.isLoading = false;
					// 只在初始加载时隐藏全屏加载
					if (!loadMore) {
						uni.hideLoading();
					}
					uni.showToast({
						title: '获取项目列表失败',
						icon: 'error'
					});
				}
			},
			// 获取项目创建者头像
			getCreatorAvatar(item) {
				if (!item) return '/static/profile/default.png';

				const projectId = item._id;

				// 优先使用已经获取到的creator_avatar属性
				if (item.creator_avatar) {
					return item.creator_avatar;
				}

				// 其次使用缓存的创建者头像
				if (projectId && this.creatorAvatars[projectId]) {
					return this.creatorAvatars[projectId];
				}

				// 其次检查avatar是否存在
				if (item.avatar && item.avatar.url) {
					return item.avatar.url;
				}

				// 最后使用默认头像
				return '/static/profile/default.png';
			},
			// 优化: 获取项目图片的方法
			async loadProjectImages(projectIds) {
				if (!projectIds || projectIds.length === 0) return;
				if (this.loadingImages) return; // 防止重复加载

				this.loadingImages = true;

				try {
					console.log('开始加载项目图片...');
					// 批量处理项目，每5个为一组
					const batchSize = 5;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的图片
						const promises = batchIds.map(async (projectId) => {
							// 如果已经有缓存，跳过
							if (this.projectImages[projectId]) {
								return { projectId, success: true };
							}

							try {
								const result = await uniCloud.importObject('ProjectAction').getProjectImages({
									project_id: projectId
								});

								if (result.status === 1 && result.data && result.data.length > 0) {
									// 保存第一张图片的URL
									this.projectImages[projectId] = result.data[0].tempFileURL;
									return { projectId, success: true };
								}
								return { projectId, success: false };
							} catch (error) {
								console.error(`获取项目 ${projectId} 图片失败:`, error);
								return { projectId, success: false };
							}
						});

						await Promise.all(promises);

						// 每批次加载后强制更新视图
						this.$forceUpdate();
					}

					console.log('项目图片加载完成:', Object.keys(this.projectImages).length);

					// 延迟加载创建者头像
					setTimeout(() => {
						this.loadCreatorAvatars(projectIds);
					}, 300);

				} catch (error) {
					console.error('批量加载项目图片失败:', error);
				} finally {
					this.loadingImages = false;
				}
			},
			// 优化: 批量获取创建者头像
			async loadCreatorAvatars(projectIds) {
				if (!projectIds || projectIds.length === 0) return;
				if (this.loadingAvatars) return; // 防止重复加载

				this.loadingAvatars = true;

				try {
					console.log('开始获取创建者头像');
					// 批量处理项目，每3个为一组
					const batchSize = 3;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的创建者信息
						const promises = batchIds.map(async (projectId) => {
							if (!projectId) return { projectId, success: false };

							// 如果已经有缓存，跳过
							if (this.creatorAvatars[projectId]) {
								return { projectId, success: true };
							}

							try {
								const result = await uniCloud.importObject('ProjectAction').getProjectCreator({
									project_id: projectId
								});

								if (result && result.status === 1 && result.data) {
									// 保存创建者头像
									if (result.data.avatar) {
										this.creatorAvatars[projectId] = result.data.avatar;

										// 更新对应项目的创建者信息
										const projectIndex = this.globalData.list.findIndex(p => p._id === projectId);
										if (projectIndex !== -1) {
											this.globalData.list[projectIndex].creator_name = result.data.name || '未知用户';
											this.globalData.list[projectIndex].creator_avatar = result.data.avatar;
											this.globalData.list[projectIndex].creator_intro = result.data.introduction || '';
										}

										return { projectId, success: true };
									}
								}
								return { projectId, success: false };
							} catch (error) {
								console.error(`获取项目 ${projectId} 创建者信息失败:`, error);
								return { projectId, success: false };
							}
						});

						await Promise.all(promises);

						// 每批次加载后强制更新视图
						this.$forceUpdate();
					}

					console.log('创建者头像加载完成:', Object.keys(this.creatorAvatars).length);
				} catch (error) {
					console.error('批量加载创建者头像失败:', error);
				} finally {
					this.loadingAvatars = false;
				}
			},
			// 修改: 获取项目图片的方法，优先使用项目图片
			getProjectImage(item) {
				if (item && item._id && this.projectImages[item._id]) {
					return this.projectImages[item._id];
				}

				// 如果没有项目图片，使用分类图标
				const categoryName = item?.project_cat?.name;
				return this.projectTypeImages[categoryName] || '/static/cxcp.png';
			},
			getProjectTypeImage(type) {
				return this.projectTypeImages[type] || '/static/cxcp.png';
			},
			getRequirements(item) {
				const requirements = [];
				if (item.student_type) requirements.push(item.student_type);
				if (item.major) requirements.push(item.major);
				if (item.skills) requirements.push(item.skills);
				return requirements;
			},

			// 获取项目描述文本
			getProjectDescription(item) {
				// 优先使用项目详情中的description字段
				if (item.detail && item.detail.description) {
					// 移除HTML标签，只保留纯文本
					const plainText = item.detail.description.replace(/<[^>]+>/g, '');
					return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
				}

				// 直接使用description字段
				if (item.description) {
					// 移除HTML标签，只保留纯文本
					const plainText = item.description.replace(/<[^>]+>/g, '');
					return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
				}

				// 其次使用content_text字段
				if (item.content_text) {
					return item.content_text.length > 50 ? item.content_text.substring(0, 50) + '...' : item.content_text;
				}

				// 最后使用项目要求作为备选
				const requirements = this.getRequirements(item);
				if (requirements.length > 0) {
					return requirements.join('、');
				}

				return '暂无项目描述';
			},
			// 修改自实现日期格式化函数，处理秒级时间戳
			formatDateTime(timestamp, format) {
				if (!timestamp) return '';

				try {
					// 关键修改：判断时间戳类型并转换
					let timeMs;
					if (typeof timestamp === 'number') {
						// 如果是秒级时间戳（长度约为10位数），转换为毫秒级
						timeMs = timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp;
					} else {
						// 如果是字符串，尝试解析
						timeMs = new Date(timestamp).getTime();
					}

					const date = new Date(timeMs);

					// 检查日期是否有效
					if (isNaN(date.getTime())) {
						console.error('无效的日期格式:', timestamp);
						return '日期格式错误';
					}

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
				} catch (error) {
					console.error('格式化日期出错:', error, timestamp);
					return '日期格式错误';
				}
			},
			// 获取当前日期时间字符串
			getCurrentDateTime() {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');

				return `${year}-${month}-${day} ${hours}:${minutes}`;
			},
			// 修改后的截止日期函数
			endingDateReturnFunction(param) {
				try {
					if (!param || !param.ending_time) {
						return '未设置';
					}

					// 打印原始日期，用于调试
					console.log('原始ending_time:', param.ending_time, typeof param.ending_time);

					// 使用修改后的格式化函数
					const date = this.formatDateTime(param.ending_time, 'YYYY-mm-dd HH:MM');

					// 获取当前时间的字符串表示
					const now = this.getCurrentDateTime();

					// 比较是否过期
					const isExpired = date < now;

					return date + (isExpired ? '(已过期)' : '');
				} catch (error) {
					console.error('日期格式化错误:', error, param);
					return '日期格式错误';
				}
			},
			// 搜索功能
			async handleSearch() {
				if (!this.search.trim()) {
					// 如果搜索框为空，根据当前筛选条件还原列表
					if (this.currentFilter) {
						this.filterByType(this.currentFilter);
					} else {
						this.globalData.list = this.globalData.allProjects;
					}
					return;
				}

				try {
					const searchText = this.search.trim().toLowerCase();

					// 在所有项目中搜索，而不是当前标签页
					const filteredProjects = this.globalData.allProjects.filter(project => {
						return project.title && project.title.toLowerCase().includes(searchText);
					});

					// 确保搜索结果仍然按创建时间降序排序
					filteredProjects.sort((a, b) => {
						// 如果是秒级时间戳，转换为毫秒级进行比较
						const timeA = typeof a.create_time === 'number' ?
							(a.create_time.toString().length <= 10 ? a.create_time * 1000 : a.create_time) : 0;
						const timeB = typeof b.create_time === 'number' ?
							(b.create_time.toString().length <= 10 ? b.create_time * 1000 : b.create_time) : 0;
						return timeB - timeA; // 降序排序，最新的在前面
					});

					this.globalData.list = filteredProjects;

					// 清除当前筛选状态，因为搜索结果可能跨越多个分类
					this.currentFilter = '';

					uni.showToast({
						title: `找到 ${filteredProjects.length} 个项目`,
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
			// 根据项目类型筛选
			async filterByType(type) {
				// 如果点击的是当前已筛选的类型，则取消筛选
				if (this.currentFilter === type) {
					// 使用clearFilter方法来取消筛选，确保去重
					this.clearFilter();
					return;
				}

				// 设置当前筛选类型
				this.currentFilter = type;

				try {
					// 显示加载中
					uni.showLoading({
						title: '筛选中...',
						mask: true
					});

					// 从已获取的项目列表中筛选对应类型的项目
					const filteredProjects = this.globalData.allProjects.filter(project => {
						// 检查项目分类信息
						if (project.project_cat && project.project_cat.name === type) {
							return true;
						}
						// 备用检查：如果项目有type字段且与筛选类型匹配
						if (project.type === type) {
							return true;
						}
						// 如果项目有type_name字段且与筛选类型匹配
						if (project.type_name === type) {
							return true;
						}
						return false;
					});

					// 确保筛选后的项目仍然按创建时间降序排序
					filteredProjects.sort((a, b) => {
						// 如果是秒级时间戳，转换为毫秒级进行比较
						const timeA = typeof a.create_time === 'number' ?
							(a.create_time.toString().length <= 10 ? a.create_time * 1000 : a.create_time) : 0;
						const timeB = typeof b.create_time === 'number' ?
							(b.create_time.toString().length <= 10 ? b.create_time * 1000 : b.create_time) : 0;
						return timeB - timeA; // 降序排序，最新的在前面
					});

					// 更新显示列表
					this.globalData.list = filteredProjects;

					// 显示筛选结果
					uni.showToast({
						title: `已筛选 ${filteredProjects.length} 个${type}项目`,
						icon: 'none'
					});

					uni.hideLoading();
				} catch (error) {
					console.error('筛选失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '筛选失败',
						icon: 'error'
					});
				}
			},
			clearFilter() {
				this.currentFilter = '';

				// 确保项目列表没有重复
				const uniqueProjects = [];
				const seenIds = new Set();

				for (const project of this.globalData.allProjects) {
					if (!seenIds.has(project._id)) {
						uniqueProjects.push(project);
						seenIds.add(project._id);
					}
				}

				// 更新全局项目列表，确保没有重复
				this.globalData.allProjects = uniqueProjects;

				// 重新加载所有项目列表
				this.globalData.list = uniqueProjects;

				console.log(`显示所有项目，共 ${uniqueProjects.length} 个`);
				uni.showToast({
					title: `已显示所有项目 (${uniqueProjects.length})`,
					icon: 'none'
				});
			},
			// 添加新方法用于加载所有项目
			async loadAllProjects() {
				try {
					// 显示加载中
					uni.showLoading({
						title: '加载中...',
						mask: true
					});

					// 重新获取所有项目
					const res = await uniCloud.importObject('Project').getAllProjects();

					if (res.status === 0) {
						console.error('获取项目列表失败:', res.msg);
						uni.hideLoading();
						uni.showToast({
							title: res.msg || '获取项目列表失败',
							icon: 'error'
						});
						return;
					}

					// 确保项目按创建时间降序排序
					const allProjects = res.data;
					allProjects.sort((a, b) => {
						// 如果是秒级时间戳，转换为毫秒级进行比较
						const timeA = typeof a.create_time === 'number' ?
							(a.create_time.toString().length <= 10 ? a.create_time * 1000 : a.create_time) : 0;
						const timeB = typeof b.create_time === 'number' ?
							(b.create_time.toString().length <= 10 ? b.create_time * 1000 : b.create_time) : 0;
						return timeB - timeA; // 降序排序，最新的在前面
					});

					// 更新项目列表
					this.globalData.allProjects = allProjects;
					this.globalData.list = allProjects;

					console.log(`总共加载了 ${allProjects.length} 个项目`);

					uni.hideLoading();
				} catch (error) {
					console.error('加载所有项目失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '加载项目失败',
						icon: 'error'
					});
				}
			},
			showAllProjectTypes() {
				// 收集所有项目类型
				const allTypes = new Set();
				this.globalData.allProjects.forEach(project => {
					if (project.project_cat && project.project_cat.name) {
						allTypes.add(project.project_cat.name);
					}
				});

				// 将Set转换为数组并排序
				const typesArray = Array.from(allTypes).sort();

				// 显示所有项目类型
				if (typesArray.length > 0) {
					uni.showModal({
						title: '所有项目类型',
						content: typesArray.join('\n'),
						showCancel: false,
						confirmText: '确定'
					});
				} else {
					uni.showToast({
						title: '没有找到项目类型',
						icon: 'none'
					});
				}
			},
			// 切换分类时调用
			async changeTabs(evt) {
				let { index } = evt.currentTarget.dataset;
				if (index == this.tabsIndex) return;
				this.setData({
					tabsIndex: index
				});
				await this.getProjectListFunction({}); // 使用新的方法获取项目
			},
			// 展现项目详情
			async showProjectDetailFunction(param) {
				try {
					const index = param.index;
					console.log('显示项目详情:', param.id, index);

					this.globalData.showProjectDetail = this.globalData.list[index];

					if (!this.globalData.showProjectDetail.hasOwnProperty('detail')) {
						const res = await uniCloud.importObject('Project').getDetailFromList({
							id: param.id
						});

						if (res.status == 0) {
							uni.showToast({
								title: res.msg,
								icon: 'error',
								duration: 2000
							});
							return;
						}

						this.globalData.showProjectDetail['detail'] = res.data;
					}

					// 打开详情模态框
					this.modal = 'show';
				} catch (error) {
					console.error('获取项目详情失败:', error);
					uni.showToast({
						title: '获取项目详情失败',
						icon: 'error'
					});
				}
			},
			// 打开申请加入模块
			async openRequestModalFunction() {
				if (!this.$session.getToken()) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					this.navigateTo({
						type: 'page',
						url: '/pages/sign/login'
					});
					return;
				}

				this.modal = '';
				this.modal1 = 'show';
			},
			// 申请加入项目
			async requestToJoinFunction() {
				try {
					const res = await uniCloud.importObject('ProjectAction').requestJoin({
						project_id: this.globalData.showProjectDetail._id,
						introduce: this.self_introduce,
						user_id: this.$session.getUserValue('user_id')
					});

					uni.showToast({
						icon: res.status ? 'success' : 'error',
						title: res.msg
					});

					if (res.status == 1) {
						this.modal1 = '';
						this.self_introduce = '';
					}
				} catch (error) {
					console.error('申请加入失败:', error);
					uni.showToast({
						title: '申请加入失败',
						icon: 'error'
					});
				}
			},
			// 秒timestamp 自定义方法
			secondFunction() {
				const timestampMs = Date.now();
				const timestampSeconds = Math.floor(timestampMs / 1000);
				return timestampSeconds;
			},
			navigateToProjectDetail(item) {
				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${item._id}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
						// 如果跳转失败，可以回退到原来的模态框显示方式
						this.showProjectDetailFunction({id: item._id, index: this.globalData.list.findIndex(p => p._id === item._id)});
					}
				});
			},
			// 导航到用户列表页面
			navigateToUserList() {
				uni.navigateTo({
					url: '/pages/user/list',
					success: () => {
						console.log('成功跳转到用户列表页');
					},
					fail: (err) => {
						console.error('跳转到用户列表页失败:', err);
						uni.showToast({
							title: '跳转失败',
							icon: 'error'
						});
					}
				});
			},

			// 处理页面滚动
			handlePageScroll(e) {
				// 获取页面高度
				const windowHeight = uni.getSystemInfoSync().windowHeight;
				// 如果已经加载了第一页数据，并且滚动到距离底部150px的位置，自动加载更多
				if (this.currentPage > 1 && e.scrollTop + windowHeight + 150 >= e.scrollHeight && !this.isLoading && this.hasMore) {
					this.loadMore();
				}
			},

			// 加载更多数据
			async loadMore() {
				if (this.isLoading || !this.hasMore) return;

				console.log('加载更多数据...');
				await this.getListFunction(true);
			},
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
