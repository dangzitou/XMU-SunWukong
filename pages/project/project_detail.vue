<template>
	<view class="container">
		<!-- 项目图片轮播 -->
		<view class="project-swiper" v-if="projectId && projectImages && projectImages.length > 0">
			<swiper
				indicator-dots="true"
				autoplay="true"
				interval="3000"
				duration="500"
				circular
				style="height: 400rpx;"
			>
				<swiper-item v-for="(imageUrl, index) in projectImages" :key="index" class="swiper-item">
					<image
						:src="imageUrl"
						mode="aspectFit"
						@error="handleImageError(index)"
						class="slide-image"
						@tap="previewImage(index)"
					></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 项目详情头部 -->
		<view class="project-header">
			<view class="project-title">{{ projectDetail.title }}</view>
			<view class="project-meta">
				<view class="meta-item">
					<text class="meta-label">发起人：</text>
					<text class="meta-value">{{ getCreatorName() }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">项目类型：</text>
					<text class="meta-value">{{ projectDetail.project_cat ? projectDetail.project_cat.name : '未分类' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">创建时间：</text>
					<text class="meta-value">{{ formatDateTime(projectDetail.create_time) }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">截止时间：</text>
					<text class="meta-value">{{ formatDateTime(projectDetail.ending_time) }} {{ isExpired ? '(已过期)' : '' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">招募进度：</text>
					<text class="meta-value">{{ projectDetail.current_members || 0 }}/{{ projectDetail.person_needed }}人</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">申请人数：</text>
					<text class="meta-value">{{ projectDetail.current_person_request || 0 }}人</text>
				</view>
			</view>
		</view>

		<!-- 添加发起人信息区域 -->
		<view class="section creator-section" v-if="shouldShowCreatorSection()">
			<view class="section-title">发起人信息</view>
			<view class="creator-info">
				<view class="creator-avatar" v-if="projectDetail.avatar">
					<image :src="projectDetail.avatar" mode="aspectFill"></image>
				</view>
				<view class="creator-avatar placeholder" v-else>
					<text>{{ getInitials(getCreatorName()) }}</text>
				</view>
				<view class="creator-details">
					<view class="creator-name">{{ getCreatorName() }}</view>
					<view class="creator-intro" v-if="projectDetail.creator_intro">{{ projectDetail.creator_intro }}</view>
					<view class="creator-intro" v-else>暂无介绍</view>
					<view class="creator-contact" v-if="projectDetail.user_id">
						<button class="contact-button" @tap="viewCreator">查看用户信息</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 项目描述 -->
		<view class="section">
			<view class="section-title">项目描述</view>
			<view class="project-description">
				<view v-if="projectDetail.detail && projectDetail.detail.content_text" class="content-text preserve-whitespace">
					{{ projectDetail.detail.content_text }}
				</view>
				<mp-html v-else-if="projectDetail.detail && projectDetail.detail.description" :content="projectDetail.detail.description"></mp-html>
				<text v-else>暂无描述</text>
			</view>
		</view>

		<!-- 竞赛信息 -->
		<view class="section" v-if="projectDetail.comp_name">
			<view class="section-title">竞赛信息</view>
			<view class="competition-info">
				<text>{{ projectDetail.comp_name }}</text>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-button-container">
			<!-- 我的项目时显示编辑和管理按钮 -->
			<view class="button-row" v-if="isMyProject">
				<button class="global-button edit-btn" @tap="editProject">修改项目</button>
				<button class="global-button manage-btn" @tap="navigateToMemberManagement">人员管理</button>
			</view>
			<!-- 已过期项目 -->
			<view class="button-row" v-else-if="isExpired">
				<button class="global-button expired-btn" disabled>已过期</button>
				<button class="global-button favorite-btn" @tap="toggleFavorite">
					<image :src="isFavorite ? '/static/project_action/star-filled.svg' : '/static/project_action/star.svg'"
						class="button-icon" mode="aspectFit"></image>
					{{ isFavorite ? '已收藏' : '收藏' }}
				</button>
			</view>
			<!-- 已申请加入的项目 -->
			<view class="button-row" v-else-if="isInProject">
				<button class="global-button edit-request-btn" @tap="openRequestModal">
					<image src="/static/project_action/edit_application.svg" class="button-icon" mode="aspectFit"></image>
					修改申请
				</button>
				<button class="global-button favorite-btn" @tap="toggleFavorite">
					<image :src="isFavorite ? '/static/project_action/star-filled.svg' : '/static/project_action/star.svg'"
						class="button-icon" mode="aspectFit"></image>
					{{ isFavorite ? '已收藏' : '收藏' }}
				</button>
			</view>
			<!-- 未申请加入的项目 -->
			<view class="button-row" v-else>
				<button class="global-button apply-btn" @tap="openRequestModal">
					<image src="/static/project_action/apply.svg" class="button-icon" mode="aspectFit"></image>
					申请加入
				</button>
				<button class="global-button favorite-btn" @tap="toggleFavorite">
					<image :src="isFavorite ? '/static/project_action/star-filled.svg' : '/static/project_action/star.svg'"
						class="button-icon" mode="aspectFit"></image>
					{{ isFavorite ? '已收藏' : '收藏' }}
				</button>
			</view>
		</view>

		<!-- 申请加入弹窗 -->
		<view @touchmove.stop.prevent="" v-if="modal" class="modal basic" :class="modal" style="z-index: 1000000">
			<view class="dialog basis-lg">
				<view class="dialog-header">
					<view class="dialog-title">{{ isInProject ? '修改申请' : '申请加入' }}</view>
					<view class="dialog-close" @tap="closeModal">
						<text class="diy-icon-close"></text>
					</view>
				</view>
				<view class="dialog-content">
					<view class="form-item">
						<text class="form-label">项目：{{ projectDetail.title }}</text>
					</view>
					<view class="form-item">
						<text class="form-label">自我介绍</text>
						<textarea class="form-textarea" v-model="self_introduce" :placeholder="isInProject ? '修改自我介绍' : '请介绍自己以提升被选中的可能性'" maxlength="200"></textarea>
					</view>
				</view>
				<view class="dialog-footer">
					<button class="cancel-button" @tap="closeModal">取消</button>
					<button class="confirm-button" @tap="requestToJoin">{{ isInProject ? '修改' : '申请' }}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				projectId: '',
				projectDetail: {},
				isMyProject: false,
				isInProject: false,
				isExpired: false,
				modal: '',
				self_introduce: '',
				currentRequest: null,
				projectImages: [],
				imageFileIds: {}, // 保存临时URL到fileID的映射
				needRefresh: false, // 添加刷新标志
				isFavorite: false // 是否已收藏
			};
		},
		onLoad(option) {
			if (option && option.id) {
				this.projectId = option.id;
				// 检查是否需要刷新数据
				if (option.refresh || option.timestamp) {
					console.log('从编辑页返回，强制刷新数据', option);
					this.needRefresh = true;
				}
				// 先检查用户是否已申请
				this.checkUserRequestStatus();
				// 检查项目是否已收藏
				this.checkProjectFavorite();
				// 再加载项目详情
				this.loadProjectDetail();

				// 添加全局事件监听，响应项目更新
				uni.$on('project_updated', (data) => {
					console.log('收到项目更新事件:', data);
					if (data && data.id === this.projectId) {
						console.log('当前项目已更新，刷新数据');
						this.checkUserRequestStatus();
						this.checkProjectFavorite();
						this.loadProjectDetail();
					}
				});
			} else {
				uni.showToast({
					title: '项目ID不存在',
					icon: 'error'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},
		// 添加onShow生命周期函数，处理从其他页面返回时的刷新
		onShow() {
			// 如果设置了需要刷新的标志，重新加载数据
			if (this.needRefresh) {
				console.log('检测到需要刷新，重新加载数据');
				this.needRefresh = false; // 重置刷新标志
				// 重新加载数据
				this.checkUserRequestStatus();
				this.checkProjectFavorite();
				this.loadProjectDetail();
			}
		},
		// 添加onUnload生命周期函数，清理事件监听
		onUnload() {
			// 移除全局事件监听
			uni.$off('project_updated');
		},
		methods: {
			// 检查项目是否已收藏
			async checkProjectFavorite() {
				const userId = this.$session.getUserValue('user_id');
				if (!userId || !this.projectId) {
					return;
				}

				try {
					console.log('检查项目是否已收藏');
					const res = await uniCloud.importObject('ProjectAction').checkProjectFavorite({
						user_id: userId,
						project_id: this.projectId
					});

					if (res.status === 1) {
						this.isFavorite = res.is_favorite;
						console.log('项目收藏状态:', this.isFavorite ? '已收藏' : '未收藏');
					}
				} catch (error) {
					console.error('检查项目收藏状态失败:', error);
				}
			},
			// 切换收藏状态
			async toggleFavorite() {
				const userId = this.$session.getUserValue('user_id');
				if (!userId) {
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

				try {
					uni.showLoading({
						title: this.isFavorite ? '取消收藏中...' : '收藏中...'
					});

					let res;
					if (this.isFavorite) {
						// 取消收藏
						res = await uniCloud.importObject('ProjectAction').unfavoriteProject({
							user_id: userId,
							project_id: this.projectId
						});
					} else {
						// 添加收藏
						res = await uniCloud.importObject('ProjectAction').favoriteProject({
							user_id: userId,
							project_id: this.projectId
						});
					}

					uni.hideLoading();

					if (res.status === 1) {
						// 更新收藏状态
						this.isFavorite = !this.isFavorite;

						uni.showToast({
							title: res.msg,
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg || (this.isFavorite ? '取消收藏失败' : '收藏失败'),
							icon: 'none'
						});
					}
				} catch (error) {
					console.error(this.isFavorite ? '取消收藏失败:' : '收藏失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: this.isFavorite ? '取消收藏失败' : '收藏失败',
						icon: 'none'
					});
				}
			},

			// 检查用户是否已申请
			async checkUserRequestStatus() {
				const userId = this.$session.getUserValue('user_id');
				if (userId) {
					try {
						const checkRes = await uniCloud.importObject('ProjectAction').checkRequestStatus({
							project_id: this.projectId,
							user_id: userId
						});

						if (checkRes.status === 1) {
							this.isInProject = checkRes.data;
							// 如果已申请，获取申请信息
							if (this.isInProject) {
								const requestRes = await uniCloud.importObject('ProjectAction').getRequestInfo({
									project_id: this.projectId,
									user_id: userId
								});
								if (requestRes.status === 1 && requestRes.data) {
									this.currentRequest = requestRes.data;
									this.self_introduce = requestRes.data.introduce || '';
								}
							}
						}
					} catch (error) {
						console.error('检查申请状态失败:', error);
					}
				}
			},

			// 加载项目详情
			async loadProjectDetail() {
				try {
					console.log('开始加载项目详情，ID:', this.projectId);
					uni.showLoading({
						title: '加载中...',
						mask: true
					});

					// 添加时间戳参数，避免从缓存中获取数据
					const timestamp = Date.now();

					// 获取项目详情
					const res = await uniCloud.importObject('Project').getDetailFromList({
						id: this.projectId,
						timestamp: timestamp // 添加时间戳
					});

					console.log('项目详情数据:', res);

					if (res.status === 0) {
						uni.hideLoading();
						uni.showToast({
							title: res.msg || '获取项目详情失败',
							icon: 'error'
						});
						return;
					}

					// 获取项目基本信息和用户信息
					const projectRes = await uniCloud.importObject('Project').getProjectById({
						id: this.projectId,
						timestamp: timestamp // 添加时间戳
					});

					console.log('项目基本信息:', projectRes);

					if (projectRes.status === 0) {
						uni.hideLoading();
						uni.showToast({
							title: projectRes.msg || '获取项目信息失败',
							icon: 'error'
						});
						return;
					}

					// 合并项目信息
					this.projectDetail = {
						...projectRes.data,
						detail: res.data
					};

					// 确保招募人数和申请人数字段存在
					if (typeof this.projectDetail.current_members === 'undefined') {
						this.projectDetail.current_members = 0;
					}
					if (typeof this.projectDetail.current_person_request === 'undefined') {
						this.projectDetail.current_person_request = 0;
					}

					// 如果申请人数不存在，从详情数据中获取
					if (res.data && res.data.person_pending !== undefined) {
						this.projectDetail.current_person_request = res.data.person_pending;
					}

					console.log('合并后的项目信息:', this.projectDetail);

					// 确保creator_name有值
					if (!this.projectDetail.creator_name) {
						console.log('尝试获取项目创建者信息');
						// 尝试获取项目创建者信息
						try {
							// 从xm-stp-project表中获取更多信息
							const creatorRes = await uniCloud.importObject('ProjectAction').getProjectCreator({
								project_id: this.projectId
							});

							console.log('创建者信息响应:', creatorRes);

							if (creatorRes && creatorRes.status === 1 && creatorRes.data) {
								this.projectDetail.creator_name = creatorRes.data.nickname || creatorRes.data.username || '未知用户';
								this.projectDetail.avatar = creatorRes.data.avatar;
								this.projectDetail.creator_intro = creatorRes.data.introduction || '';
								console.log('设置创建者信息后:', this.projectDetail.creator_name);
							}
						} catch (error) {
							console.error('获取创建者信息失败:', error);
						}
					} else {
						console.log('已有创建者信息:', this.projectDetail.creator_name);
					}

					// 使用云函数获取项目图片
					console.log('开始加载项目图片');
					this.loadProjectImages();
					console.log('项目图片加载完成调用');

					// 检查是否是我的项目
					const userId = this.$session.getUserValue('user_id');
					this.isMyProject = userId && this.projectDetail.user_id === userId;

					// 检查是否过期
					this.isExpired = this.checkExpired(this.projectDetail.ending_time);

					uni.hideLoading();
				} catch (error) {
					console.error('加载项目详情失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '加载项目详情失败',
						icon: 'error'
					});
				}
			},

			// 格式化日期时间
			formatDateTime(timestamp) {
				if (!timestamp) return '未设置';

				try {
					// 判断时间戳类型并转换
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

					return `${year}-${month}-${day} ${hours}:${minutes}`;
				} catch (error) {
					console.error('格式化日期出错:', error, timestamp);
					return '日期格式错误';
				}
			},

			// 检查是否过期
			checkExpired(endingTime) {
				if (!endingTime) return false;

				try {
					// 转换为毫秒级时间戳
					let timeMs;
					if (typeof endingTime === 'number') {
						timeMs = endingTime.toString().length <= 10 ? endingTime * 1000 : endingTime;
					} else {
						timeMs = new Date(endingTime).getTime();
					}

					// 获取当前时间戳
					const now = Date.now();

					// 比较是否过期
					return timeMs < now;
				} catch (error) {
					console.error('检查过期时间出错:', error);
					return false;
				}
			},

			// 打开申请加入弹窗
			openRequestModal() {
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

				this.modal = 'show';
			},

			// 关闭弹窗
			closeModal() {
				this.modal = '';
				if (this.currentRequest && this.isInProject) {
					this.self_introduce = this.currentRequest.introduce || '';
				} else {
					this.self_introduce = '';
				}
			},

			// 申请加入项目
			async requestToJoin() {
				if (!this.self_introduce.trim()) {
					uni.showToast({
						title: '请填写自我介绍',
						icon: 'none'
					});
					return;
				}

				try {
					uni.showLoading({
						title: this.isInProject ? '修改中...' : '提交中...',
						mask: true
					});

					const res = await uniCloud.importObject('ProjectAction').requestJoin({
						project_id: this.projectId,
						introduce: this.self_introduce,
						user_id: this.$session.getUserValue('user_id')
					});

					uni.hideLoading();

					uni.showToast({
						icon: res.status ? 'success' : 'error',
						title: res.msg
					});

					if (res.status === 1) {
						this.isInProject = true;
						// 更新当前申请信息
						if (this.currentRequest) {
							this.currentRequest.introduce = this.self_introduce;
						}
						this.closeModal();
					}
				} catch (error) {
					console.error('申请操作失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: this.isInProject ? '修改失败' : '申请失败',
						icon: 'error'
					});
				}
			},

			// 编辑项目
			editProject() {
				this.navigateTo({
					type: 'page',
					url: `/pages/project/edit?id=${this.projectId}`
				});
			},

			// 获取名字首字母作为头像占位符
			getInitials(name) {
				if (!name) return '?';
				return name.charAt(0).toUpperCase();
			},

			// 获取创建者名称
			getCreatorName() {
				if (!this.projectDetail) return '未知用户';
				return this.projectDetail.creator_name || '未知用户';
			},

			// 判断是否显示创建者信息区域
			shouldShowCreatorSection() {
				return this.projectDetail &&
					(this.projectDetail.creator_name || this.projectDetail.avatar || this.projectDetail.creator_intro);
			},

			// 查看创建者详情
			viewCreator() {
				if (!this.projectDetail || !this.projectDetail.user_id) return;

				uni.navigateTo({
					url: `/pages/user/project?user_id=${this.projectDetail.user_id}`,
					fail: (err) => {
						console.error('跳转到用户项目页面失败:', err);
						uni.showToast({
							title: '跳转失败',
							icon: 'none'
						});
					}
				});
			},

			// 跳转到人员管理页面
			navigateToMemberManagement() {
				uni.navigateTo({
					url: `/pages/project/member_action?id=${this.projectId}`,
					fail: (err) => {
						console.error('跳转到人员管理页面失败:', err);
						uni.showToast({
							title: '跳转失败',
							icon: 'none'
						});
					}
				});
			},

			// 使用云函数加载项目图片
			async loadProjectImages() {
				if (!this.projectId) {
					console.log('没有项目ID，不加载图片');
					this.projectImages = [];
					return;
				}

				try {
					uni.showLoading({
						title: '加载图片中...'
					});

					console.log('开始加载项目图片，项目ID:', this.projectId);

					// 首先检查项目详情中是否已有图片fileID数组
					let images = [];
					// 修复：检查更多可能的图片路径位置
					if (this.projectDetail && this.projectDetail.detail && this.projectDetail.detail.images) {
						images = this.projectDetail.detail.images;
					} else if (this.projectDetail && this.projectDetail.images) {
						images = this.projectDetail.images;
					}

					console.log('项目详情中的图片fileIDs:', images);

					// 如果项目详情中有图片，直接使用这些图片URL
					if (images && images.length > 0 && typeof images[0] === 'string') {
						// 如果图片数组中的元素是字符串，直接使用
						this.projectImages = images;
						console.log('直接使用项目详情中的图片URLs:', this.projectImages);
						uni.hideLoading();
						return;
					}

					if (images && images.length > 0) {
						// 直接使用fileID数组获取临时链接
						try {
							// 直接调用云函数，传入fileID数组
							const result = await uniCloud.importObject('ProjectAction').getProjectImages({
								temp_file_ids: images
							});

							console.log('获取临时链接结果:', result);

							if (result.status === 1 && result.data && result.data.length > 0) {
								// 设置图片数组和fileID映射
								// 直接使用临时URL字符串数组
								this.projectImages = result.data.map(item => {
									return typeof item.tempFileURL === 'string' ? item.tempFileURL :
										(item.tempFileURL ? item.tempFileURL.toString() : '');
								}).filter(url => url);

								// 存储fileID映射，用于错误处理和删除
								this.imageFileIds = {};
								result.data.forEach(item => {
									if (item.tempFileURL && item.fileID) {
										const tempUrl = typeof item.tempFileURL === 'string' ?
													item.tempFileURL : item.tempFileURL.toString();
										this.imageFileIds[tempUrl] = item.fileID;
									}
								});

								console.log('设置图片数组成功:', this.projectImages);
							} else {
								console.log('获取临时链接失败或返回空结果:', result);
								this.projectImages = [];
							}
						} catch (tempUrlError) {
							console.error('获取临时链接出错:', tempUrlError);
							this.projectImages = [];
						}
					} else {
						// 如果项目详情中没有图片，尝试从云函数获取
						console.log('项目详情中没有图片，从云函数获取');

							// 检查数据库中的图片字段
							if (this.projectDetail && this.projectDetail.images) {
								console.log('数据库中的images字段:', JSON.stringify(this.projectDetail.images));
							}
						try {
							const result = await uniCloud.importObject('ProjectAction').getProjectImages({
								project_id: this.projectId
							});

							// 详细打印云函数返回的完整数据结构
							console.log('从云函数获取项目图片结果:', result);
							console.log('云函数返回的data完整结构:', JSON.stringify(result.data));

							// 检查数据库中的图片是否直接是URL字符串
							if (this.projectDetail && this.projectDetail.images && this.projectDetail.images.length > 0) {
								console.log('数据库中的原始图片数组:', JSON.stringify(this.projectDetail.images));
							}

							if (result.status === 1 && result.data && result.data.length > 0) {
								// 直接使用数据库中的图片URL
								if (this.projectDetail && this.projectDetail.images &&
									this.projectDetail.images.length > 0 &&
									typeof this.projectDetail.images[0] === 'string' &&
									(this.projectDetail.images[0].startsWith('http://') || this.projectDetail.images[0].startsWith('https://'))) {
									// 如果数据库中已经有URL字符串，直接使用
									console.log('直接使用数据库中的URL字符串');
									this.projectImages = [...this.projectDetail.images];
									console.log('设置图片数组成功:', JSON.stringify(this.projectImages));
									return;
								}

								// 尝试直接使用云函数返回的原始数据
								if (Array.isArray(result.data)) {
									// 检查第一个元素的结构
									const firstItem = result.data[0];
									console.log('第一个图片元素类型:', typeof firstItem);

									if (typeof firstItem === 'string') {
										// 如果是字符串数组，直接使用
										this.projectImages = [...result.data];
										console.log('直接使用字符串数组:', JSON.stringify(this.projectImages));
										return;
									}
								}

								// 如果上面的方法都不成功，尝试处理对象数组
								const processedUrls = [];
								this.imageFileIds = {};

								// 详细检查每个元素
								for (let i = 0; i < result.data.length; i++) {
									const item = result.data[i];
									console.log(`检查第${i}个元素:`, JSON.stringify(item));

									// 如果是字符串，直接使用
									if (typeof item === 'string') {
										processedUrls.push(item);
										continue;
									}

									// 如果是对象，尝试提取URL
									if (typeof item === 'object' && item !== null) {
										// 检查所有可能的属性
										let url = null;
										let fileId = null;

										// 检查所有可能的URL属性
										if (item.tempFileURL) {
											url = typeof item.tempFileURL === 'string' ?
												item.tempFileURL : String(item.tempFileURL);
										} else if (item.url) {
											url = typeof item.url === 'string' ?
												item.url : String(item.url);
										}

										// 检查所有可能的fileID属性
										if (item.fileID) {
											fileId = item.fileID;
										} else if (item.fileId) {
											fileId = item.fileId;
										}

										// 如果有URL，添加到数组
										if (url) {
											processedUrls.push(url);
											// 如果有fileID，添加到映射
											if (fileId) {
												this.imageFileIds[url] = fileId;
											}
										}
									}
								}

								// 如果处理后仍然没有图片，尝试直接使用原始数据
								if (processedUrls.length === 0 && result.data.length > 0) {
									console.log('尝试直接使用原始数据');

									// 尝试将原始数据转换为字符串
									result.data.forEach(item => {
										if (typeof item === 'string') {
											processedUrls.push(item);
										} else if (typeof item === 'object' && item !== null) {
											// 如果是对象，尝试将整个对象转换为字符串
											const str = JSON.stringify(item);
											console.log('将对象转换为字符串:', str);

											// 尝试从字符串中提取URL
											const urlMatch = str.match(/https?:\/\/[^"]+/g);
											if (urlMatch && urlMatch.length > 0) {
												console.log('从字符串中提取到URL:', urlMatch[0]);
												processedUrls.push(urlMatch[0]);
											}
										}
									});
								}

								// 设置处理后的图片数组
								this.projectImages = processedUrls;

								console.log('处理后的图片列表:', JSON.stringify(this.projectImages));
							} else {
								this.projectImages = [];
								console.log('没有找到项目图片');
							}
						} catch (error) {
							console.error('从云函数获取项目图片失败:', error);
							this.projectImages = [];
						}
					}

					// 检查图片数组是否为对象，如果是则转换为字符串数组
					if (this.projectImages && this.projectImages.length > 0) {
						// 创建一个新的数组，存储处理后的图片URL字符串
						const processedImages = [];

						// 遍历处理每个图片项
						for (let i = 0; i < this.projectImages.length; i++) {
							const img = this.projectImages[i];
							let processedUrl = null;

							// 根据类型处理
							if (typeof img === 'object' && img !== null) {
								// 如果是对象，尝试提取URL
								if (img.tempFileURL) {
									processedUrl = typeof img.tempFileURL === 'string' ?
										img.tempFileURL : String(img.tempFileURL);
								} else if (img.url) {
									processedUrl = typeof img.url === 'string' ?
										img.url : String(img.url);
								}
							} else if (typeof img === 'string') {
								// 如果已经是字符串，直接使用
								processedUrl = img;
							} else if (img) {
								// 其他情况尝试转换为字符串
								try {
									processedUrl = String(img);
									// 检查是否为[object Object]格式的字符串
									if (processedUrl === '[object Object]') {
										processedUrl = null;
									}
								} catch (e) {
									console.error('转换图片URL失败:', e);
								}
							}

							// 如果处理后有有效URL，添加到数组
							if (processedUrl) {
								processedImages.push(processedUrl);
							}
						}

						// 更新图片数组
						if (processedImages.length > 0) {
							console.log('处理后的图片数组:', JSON.stringify(processedImages));
							this.projectImages = processedImages;
						} else {
							console.log('处理后没有有效的图片URL');
							this.projectImages = [];
						}
					}

					uni.hideLoading();

					// 输出最终的图片数组状态
					console.log('图片加载完成，最终状态:', this.projectImages ? this.projectImages.length : 0, '张图片');
					if (this.projectImages && this.projectImages.length > 0) {
						console.log('有图片，将显示轮播图');
					} else {
						console.log('没有图片，不显示轮播图');
						this.projectImages = [];
					}
				} catch (error) {
					console.error('加载项目图片失败:', error);
					uni.hideLoading();
					this.projectImages = [];
					console.log('图片加载失败，不显示轮播图');
				}
			},

			// 处理图片加载错误
			handleImageError(index) {
				console.error('图片加载失败:', index, JSON.stringify(this.projectImages[index]));

				// 尝试重新获取该图片的临时URL
				try {
					// 检查是否有fileID映射
					if (this.imageFileIds && this.projectImages[index]) {
						const fileID = this.imageFileIds[this.projectImages[index]];
						if (fileID) {
							console.log('尝试重新获取图片URL:', fileID);
							// 使用云函数获取临时URL
							uniCloud.importObject('ProjectAction').getProjectImages({
								temp_file_ids: [fileID]
							}).then(result => {
								if (result.status === 1 && result.data && result.data.length > 0) {
									// 提取临时URL
									const item = result.data[0];
									if (item && item.tempFileURL) {
										// 确保是字符串
										const updatedUrl = typeof item.tempFileURL === 'string' ?
											item.tempFileURL : String(item.tempFileURL);

										// 创建新数组并更新
										const newImages = [...this.projectImages];
										newImages[index] = updatedUrl;
										this.projectImages = newImages;

										// 更新映射
										this.imageFileIds[updatedUrl] = fileID;

										console.log('重新获取图片URL成功:', updatedUrl);
										return;
									}
								}

								// 如果获取失败，尝试直接使用uniCloud.getTempFileURL
								console.log('尝试使用uniCloud.getTempFileURL获取临时URL');
								uniCloud.getTempFileURL({
									fileList: [{ fileID: fileID }]
								}).then(res => {
									if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
										// 更新图片URL
										let updatedUrl = res.fileList[0].tempFileURL;
										if (typeof updatedUrl !== 'string') {
											updatedUrl = String(updatedUrl);
										}

										// 创建新数组并更新
										const newImages = [...this.projectImages];
										newImages[index] = updatedUrl;
										this.projectImages = newImages;

										// 更新映射
										this.imageFileIds[updatedUrl] = fileID;

										console.log('使用getTempFileURL成功获取图片URL:', updatedUrl);
									} else {
										console.log('无法获取图片URL，从数组中移除');
										const newImages = [...this.projectImages];
										newImages.splice(index, 1);
										this.projectImages = newImages;
									}
								}).catch(err => {
									console.error('重新获取图片URL失败:', err);
									// 从数组中移除无效图片
									const newImages = [...this.projectImages];
									newImages.splice(index, 1);
									this.projectImages = newImages;
								});
							}).catch(err => {
								console.error('使用云函数获取图片URL失败:', err);
								// 尝试直接修复或移除
								this.handleInvalidImage(index);
							});
						} else {
							// 如果没有对应的fileID，尝试直接修复图片URL
							this.handleInvalidImage(index);
						}
					} else {
						// 没有映射关系，尝试直接修复或移除
						this.handleInvalidImage(index);
					}
				} catch (error) {
					console.error('处理图片错误时出错:', error);
					// 从数组中移除无效图片
					const newImages = [...this.projectImages];
					newImages.splice(index, 1);
					this.projectImages = newImages;
				}
			},

			// 处理无效图片
			handleInvalidImage(index) {
				try {
					const currentImg = this.projectImages[index];

					// 检查是否为对象
					if (typeof currentImg === 'object' && currentImg !== null) {
						// 尝试提取URL
						let newUrl = null;
						if (currentImg.tempFileURL) {
							newUrl = typeof currentImg.tempFileURL === 'string' ?
								currentImg.tempFileURL : String(currentImg.tempFileURL);
						} else if (currentImg.url) {
							newUrl = typeof currentImg.url === 'string' ?
								currentImg.url : String(currentImg.url);
						} else if (currentImg.fileID) {
							// 如果有fileID但没有URL，尝试获取临时URL
							console.log('尝试从fileID获取临时URL:', currentImg.fileID);
							uniCloud.getTempFileURL({
								fileList: [{ fileID: currentImg.fileID }]
							}).then(res => {
								if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
									// 更新图片URL
									let updatedUrl = res.fileList[0].tempFileURL;
									if (typeof updatedUrl !== 'string') {
										updatedUrl = String(updatedUrl);
									}

									// 创建新数组并更新
									const newImages = [...this.projectImages];
									newImages[index] = updatedUrl;
									this.projectImages = newImages;

									console.log('从fileID获取临时URL成功:', updatedUrl);
									return;
								} else {
									this.removeImageAtIndex(index);
								}
							}).catch(() => {
								this.removeImageAtIndex(index);
							});
							return; // 异步处理中，先返回
						}

						if (newUrl) {
							// 创建新数组并更新
							const newImages = [...this.projectImages];
							newImages[index] = newUrl;
							this.projectImages = newImages;
							console.log('直接从对象提取URL:', newUrl);
							return;
						}
					} else if (typeof currentImg === 'string' && currentImg === '[object Object]') {
						// 如果是[object Object]字符串，直接移除
						this.removeImageAtIndex(index);
						return;
					}

					// 如果无法修复，从数组中移除无效图片
					this.removeImageAtIndex(index);
				} catch (error) {
					console.error('处理无效图片时出错:', error);
					this.removeImageAtIndex(index);
				}
			},

			// 从数组中移除指定索引的图片
			removeImageAtIndex(index) {
				console.log('从数组中移除无效图片，索引:', index);
				const newImages = [...this.projectImages];
				newImages.splice(index, 1);
				this.projectImages = newImages;
			},

			// 预览图片
			previewImage(index) {
				if (!this.projectImages || this.projectImages.length === 0) return;

				console.log('预览图片:', index, this.projectImages);

				// 确保图片数组中的所有项都是字符串URL
				const imageUrls = this.projectImages.map(img => {
					if (typeof img === 'object') {
						if (img.tempFileURL) return img.tempFileURL;
						if (img.url) return img.url;
						return null;
					}
					return img;
				}).filter(url => url); // 过滤掉空值

				if (imageUrls.length === 0) {
					console.log('没有有效的图片URL');
					return;
				}

				console.log('预览图片URLs:', imageUrls);

				uni.previewImage({
					current: imageUrls[index] || imageUrls[0],
					urls: imageUrls,
					indicator: 'number',
					loop: true,
					success: () => {
						console.log('图片预览成功');
					},
					fail: (err) => {
						console.error('图片预览失败:', err);
						uni.showToast({
							title: '图片预览失败',
							icon: 'none'
						});
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 0;
		/* 添加底部内边距，为固定定位的按钮留出空间 */
		padding-bottom: calc(150rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(150rpx + env(safe-area-inset-bottom)); /* 适配底部安全区域 */
	}

	.page-bg {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		min-height: 100vh;
		background-color: #f5f5f5;
		z-index: -1;
	}

	.project-swiper {
		width: 100%;
		height: 400rpx;
		background-color: #f5f5f5;
		margin-bottom: 20rpx;
	}

	.swiper-wrap {
		width: 100%;
		height: 350rpx;
	}

	.swiper-item {
		width: 100%;
		height: 100%;
		text-align: center;
	}

	.slide-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		background-color: #f5f5f5;
	}

	.project-header {
		padding: 20rpx;
		background: white;
		border-radius: 10rpx;
		margin-top: 20rpx;
	}

	.empty-image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		background-color: #f9f9f9;
		height: 350rpx;
	}

	.empty-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}

	.empty-image-text {
		font-size: 28rpx;
		color: #666;
	}

	.project-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.project-meta {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.meta-item {
		display: flex;
		font-size: 28rpx;
	}

	.meta-label {
		color: #666;
		width: 160rpx;
	}

	.meta-value {
		color: #333;
		flex: 1;
	}

	.section {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
		border-bottom: 1rpx solid #eee;
		padding-bottom: 10rpx;
	}

	.requirements {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.requirement-item {
		display: flex;
		font-size: 28rpx;
	}

	.requirement-label {
		color: #666;
		width: 160rpx;
	}

	.requirement-value {
		color: #333;
		flex: 1;
	}

	.project-description {
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		margin-bottom: 20rpx;
		word-break: break-all; /* 确保长文本能够正确换行 */
	}

	/* 保留空白符和换行 */
	.preserve-whitespace {
		white-space: pre-wrap; /* 保留空白符和换行符，并正常换行 */
		word-wrap: break-word; /* 确保长单词也能换行 */
	}

	.competition-info {
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
	}

	.bottom-button-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 20rpx calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); /* 适配底部安全区域 */
		background-color: #ffffff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.button-row {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
		width: 100%;
	}

	.button-icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
		vertical-align: middle;
	}

	.favorite-btn {
		background-color: #ff9500;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		font-size: 34rpx;
	}

	.apply-btn {
		background-color: #07c160;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.edit-request-btn {
		background-color: #1989fa;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.global-button {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 0;
		flex: 1;
		position: relative; /* 确保按钮不会被安全区域挡住 */
	}

	.edit-btn {
		background-color: #07c160;
	}

	.manage-btn {
		background-color: #20c971;
	}

	.expired-btn {
		background-color: #999999;
	}

	/* 弹窗样式 */
	.modal {
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

		&::after {
			content: "";
			display: inline-block;
			height: 100%;
			vertical-align: middle;
		}
	}

	.modal.show {
		opacity: 1;
		transition-duration: 0.3s;
		-ms-transform: scale(1);
		transform: scale(1);
		overflow-x: hidden;
		overflow-y: auto;
		pointer-events: auto;
	}

	.dialog {
		position: relative;
		display: inline-block;
		vertical-align: middle;
		margin: 30rpx auto;
		width: 90%;
		max-width: 600rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.1);
	}

	.dialog-header {
		padding: 30rpx;
		font-size: 32rpx;
		color: #333;
		background-color: #fff;
		border-bottom: 1rpx solid #f2f2f2;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.dialog-title {
		font-weight: bold;
		font-size: 34rpx;
	}

	.dialog-close {
		font-size: 40rpx;
		color: #999;
		padding: 0 20rpx;
	}

	.dialog-content {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.form-label {
		font-size: 30rpx;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
		font-weight: 500;
	}

	.form-textarea {
		width: 100%;
		height: 240rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 16rpx;
		padding: 20rpx;
		font-size: 28rpx;
		box-sizing: border-box;
		background-color: #fff;
		color: #333;
	}

	.dialog-footer {
		display: flex;
		justify-content: space-between;
		padding: 30rpx;
		background-color: #fff;
		border-top: 1rpx solid #eee;
	}

	.cancel-button {
		background-color: #f5f5f5;
		color: #333;
		font-size: 30rpx;
		font-weight: 500;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 50rpx;
		width: 45%;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		border: none;
	}

	.confirm-button {
		background-color: #07c160;
		color: #ffffff;
		font-size: 30rpx;
		font-weight: 500;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 50rpx;
		width: 45%;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
		border: none;
	}

	.meta-value.clickable {
		color: #07c160;
		text-decoration: underline;
		font-weight: 500;
	}

	.creator-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.creator-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		overflow: hidden;

		image {
			width: 100%;
			height: 100%;
		}

		&.placeholder {
			background-color: #07c160;
			color: #ffffff;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 48rpx;
			font-weight: bold;
		}
	}

	.creator-details {
		flex: 1;
	}

	.creator-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.creator-intro {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.creator-contact {
		text-align: right;
	}

	.contact-button {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 28rpx;
		padding: 10rpx 20rpx;
	}

	.creator-section {
		margin-top: 20rpx;
	}
</style>