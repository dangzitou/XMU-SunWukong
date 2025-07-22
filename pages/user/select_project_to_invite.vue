<template>
	<view class="container container332681 safe-bottom">
		<!-- 项目列表 -->
		<view class="project-list">
			<view v-if="loading" class="loading-container">
				<u-loading mode="circle" size="36"></u-loading>
				<text class="loading-text">加载中...</text>
			</view>

			<view v-else-if="projects.length === 0" class="empty-projects">
				<text>您还没有创建任何项目</text>
				<button class="create-project-btn" @tap="navigateToCreateProject">创建新项目</button>
			</view>

			<!-- 项目列表 - 使用与project/main_page相同的样式 -->
			<view v-else>
				<view v-for="(item, index) in projects" :key="index"
					class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz">
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
					</view>
					<view class="flex flex-wrap diygw-col-24 justify-between items-center flex15-clz">
						<view class="flex flex-wrap diygw-col-0 items-center">
							<text class="diygw-col-0">截止：{{ endingDateReturnFunction({ ending_time: item.ending_time }) }}</text>
						</view>
						<view class="flex flex-wrap diygw-col-0 items-center">
							<text class="diygw-col-0">需求{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
						</view>
					</view>
					<view class="flex flex-wrap diygw-col-24 justify-end items-center select-btn-container">
						<button class="select-btn" @tap="selectProject(item)">选择</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 邀请表单弹窗 -->
		<view @touchmove.stop.prevent="" v-if="showInviteModal" class="invite-modal">
			<view class="invite-dialog">
				<view class="invite-header">
					<text class="invite-title">邀请加入项目</text>
					<text class="close-icon" @tap="closeInviteModal">×</text>
				</view>

				<view class="invite-content">
					<view class="selected-project">
						<text class="label">项目:</text>
						<text class="value">{{ selectedProject.title }}</text>
					</view>

					<view class="invite-form">
						<view class="form-item">
							<text class="label">邀请说明:</text>
							<textarea
								class="invite-comment"
								v-model="inviteComment"
								placeholder="请输入邀请说明，向对方介绍项目和邀请原因..."
								maxlength="500"
							></textarea>
							<text class="char-count">{{ inviteComment.length }}/500</text>
						</view>
					</view>
				</view>

				<view class="invite-footer">
					<button class="cancel-btn" @tap="closeInviteModal">取消</button>
					<button class="confirm-btn" @tap="sendInvitation" :disabled="sending">
						{{ sending ? '发送中...' : '发送邀请' }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 页面参数
				globalOption: {},
				// 项目列表
				projects: [],
				// 加载状态
				loading: true,
				// 是否显示邀请弹窗
				showInviteModal: false,
				// 选中的项目
				selectedProject: {},
				// 邀请说明
				inviteComment: '',
				// 发送状态
				sending: false,
				// 项目类型图片映射
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				// 存储项目ID到图片URL的映射
				projectImages: {},
				// 存储项目ID到创建者头像的映射
				creatorAvatars: {}
			};
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
			// 初始化
			async init() {
				await this.checkLoginStatus();
				await this.loadProjects();
			},

			// 检查登录状态
			async checkLoginStatus() {
				if (!this.$session.getToken()) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});

					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/sign/login'
						});
					}, 1500);
				}
			},

			// 加载项目列表
			async loadProjects() {
				this.loading = true;

				try {
					const currentUserId = this.$session.getUserValue('user_id');
					if (!currentUserId) {
						this.loading = false;
						return;
					}

					console.log('开始加载项目列表...');

					// 1. 获取用户创建的项目（用户是创建者的项目）
					const createdProjects = await uniCloud.importObject('Project').getSelf({
						user_id: currentUserId,
						target_user: this.globalOption.user_id
					});

					console.log('用户创建的项目结果:', createdProjects);

					// 2. 获取用户加入的所有项目
					const joinedProjects = await uniCloud.importObject('ProjectMember').getJoinList({
						user_id: currentUserId
					});

					console.log('用户加入的项目结果:', joinedProjects);

					// 3. 从加入的项目中筛选出有邀请权限的项目
					let projectsWithPermission = [];

					if (joinedProjects.status === 1 && joinedProjects.data) {
						// 检查数据结构
						if (Array.isArray(joinedProjects.data)) {
							// 直接是数组
							projectsWithPermission = joinedProjects.data.filter(item =>
								item && item.has_invite_permission === true && item.project_id
							);
						} else if (typeof joinedProjects.data === 'object') {
							// 可能是嵌套在某个属性中
							for (const key in joinedProjects.data) {
								if (Array.isArray(joinedProjects.data[key])) {
									projectsWithPermission = joinedProjects.data[key].filter(item =>
										item && item.has_invite_permission === true && item.project_id
									);
									if (projectsWithPermission.length > 0) break;
								}
							}
						}
					}

					console.log('筛选出的有邀请权限的项目关系:', projectsWithPermission);

					// 4. 获取这些项目的详细信息
					const memberProjects = { status: 1, data: [], msg: 'OK' };

					if (projectsWithPermission.length > 0) {
						// 获取项目ID列表
						const projectIds = projectsWithPermission.map(item => item.project_id);

						// 逐个获取项目详情
						for (const projectId of projectIds) {
							try {
								console.log(`获取项目 ${projectId} 详情...`);
								const projectDetail = await uniCloud.importObject('Project').getDetail({
									id: projectId
								});

								console.log(`项目 ${projectId} 详情:`, projectDetail);

								if (projectDetail.status === 1 && projectDetail.data) {
									memberProjects.data.push({
										...projectDetail.data,
										_id: projectId, // 确保_id字段存在
										hasInvitePermission: true
									});
								}
							} catch (error) {
								console.error(`获取项目 ${projectId} 详情失败:`, error);

								// 尝试使用getDetailFromList方法
								try {
									console.log(`尝试使用getDetailFromList获取项目 ${projectId} 详情...`);
									const detailResult = await uniCloud.importObject('Project').getDetailFromList({
										id: projectId
									});

									if (detailResult.status === 1 && detailResult.data) {
										memberProjects.data.push({
											...detailResult.data,
											_id: projectId,
											hasInvitePermission: true
										});
									}
								} catch (detailError) {
									console.error(`使用getDetailFromList获取项目 ${projectId} 详情失败:`, detailError);
								}
							}
						}
					}

					console.log('用户创建的项目:', createdProjects.data ? createdProjects.data.length : 0);
					console.log('用户有邀请权限的项目:', memberProjects.data ? memberProjects.data.length : 0);

					// 合并两种项目列表
					let allProjects = [];

					// 添加用户创建的项目
					if (createdProjects.status === 1 && createdProjects.data) {
						// 标记这些项目为用户创建的
						createdProjects.data.forEach(project => {
							project.isCreator = true;
						});
						allProjects = [...createdProjects.data];
					}

					// 添加用户有邀请权限的项目
					if (memberProjects.status === 1 && memberProjects.data) {
						// 标记这些项目为用户有邀请权限的
						memberProjects.data.forEach(project => {
							project.hasInvitePermission = true;
						});

						// 过滤掉已经在创建者列表中的项目
						const additionalProjects = memberProjects.data.filter(memberProject =>
							!allProjects.some(createdProject => createdProject._id === memberProject._id)
						);

						allProjects = [...allProjects, ...additionalProjects];
					}

					this.projects = allProjects;
					console.log('已加载可邀请的项目列表:', this.projects.length);

					// 获取项目ID列表
					const projectIds = this.projects.map(project => project._id);

					// 直接加载创建者头像
					if (projectIds.length > 0) {
						// 先尝试直接加载创建者头像
						await this.loadCreatorAvatars(projectIds);

						// 然后加载项目图片
						this.loadProjectImages(projectIds);

						// 强制更新视图
						this.$forceUpdate();
					}
				} catch (error) {
					console.error('加载项目列表失败:', error);
					uni.showToast({
						title: '加载项目列表失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			// 获取项目描述
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

				return '暂无项目描述';
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

				// 如果项目有user_id字段，尝试从用户详情中获取头像
				if (item.user_id && !this.creatorAvatars[projectId]) {
					// 异步加载用户头像
					this.loadUserAvatar(item.user_id, projectId);
					// 返回默认头像，等待异步加载完成后会自动更新
				}

				// 最后使用默认头像
				return '/static/profile/default.png';
			},

			// 异步加载用户头像
			async loadUserAvatar(userId, projectId) {
				if (!userId || !projectId) return;

				try {
					console.log(`开始获取用户 ${userId} 的头像信息`);

					// 获取用户详情
					const userResult = await uniCloud.importObject('User').getUserDetail({
						user_id: userId
					});

					console.log(`用户 ${userId} 详情获取结果:`, userResult);

					if (userResult.status === 1 && userResult.data) {
						// 从返回的数据结构中正确提取用户信息
						const userData = userResult.data.user || userResult.data;

						// 保存创建者头像
						if (userData.avatar) {
							console.log(`用户 ${userId} 头像URL:`, userData.avatar);
							this.creatorAvatars[projectId] = userData.avatar;

							// 更新项目的创建者信息
							const projectIndex = this.projects.findIndex(p => p._id === projectId);
							if (projectIndex !== -1) {
								this.projects[projectIndex].creator_name = userData.nickname || userData.real_name || userData.username || '未知用户';
								this.projects[projectIndex].creator_avatar = userData.avatar;
								this.projects[projectIndex].creator_intro = userData.introduction || userData.bio || '';
							}

							// 强制更新视图
							this.$forceUpdate();
						} else {
							console.log(`用户 ${userId} 没有头像`);
							this.creatorAvatars[projectId] = '/static/profile/default.png';
						}
					} else {
						console.warn(`获取用户 ${userId} 详情失败:`, userResult.msg);
						this.creatorAvatars[projectId] = '/static/profile/default.png';
					}
				} catch (error) {
					console.error(`获取用户 ${userId} 信息失败:`, error);
					this.creatorAvatars[projectId] = '/static/profile/default.png';
				}
			},

			// 获取项目图片
			getProjectImage(item) {
				if (item && item._id && this.projectImages[item._id]) {
					return this.projectImages[item._id];
				}

				// 如果没有项目图片，使用分类图标
				const categoryName = item?.project_cat?.name;
				return this.projectTypeImages[categoryName] || '/static/cxcp.png';
			},

			// 加载项目图片
			async loadProjectImages(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

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
				}
			},

			// 加载创建者头像 - 直接从项目详情中获取
			async loadCreatorAvatars(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

				try {
					console.log('开始获取创建者头像，项目数量:', this.projects.length);

					// 直接从项目详情中获取创建者信息
					for (const project of this.projects) {
						if (!project._id) {
							console.warn('项目缺少_id:', project);
							continue;
						}

						if (this.creatorAvatars[project._id]) {
							console.log(`项目 ${project._id} 已有缓存的创建者头像`);
							continue;
						}

						// 如果项目有user_id字段，直接获取用户信息
						if (project.user_id) {
							console.log(`获取项目 ${project._id} 的创建者(${project.user_id})信息`);

							try {
								// 获取用户详情
								const userResult = await uniCloud.importObject('User').getUserDetail({
									user_id: project.user_id
								});

								console.log(`项目 ${project._id} 的创建者信息获取结果:`, userResult);

								if (userResult.status === 1 && userResult.data) {
									// 从返回的数据结构中正确提取用户信息
									const userData = userResult.data.user || userResult.data;

									// 保存创建者头像
									if (userData.avatar) {
										console.log(`创建者 ${project.user_id} 头像URL:`, userData.avatar);
										this.creatorAvatars[project._id] = userData.avatar;

										// 更新项目的创建者信息
										project.creator_name = userData.nickname || userData.real_name || userData.username || '未知用户';
										project.creator_avatar = userData.avatar;
										project.creator_intro = userData.introduction || userData.bio || '';

										// 每次更新后强制刷新视图
										this.$forceUpdate();
									} else {
										console.log(`创建者 ${project.user_id} 没有头像`);
										this.creatorAvatars[project._id] = '/static/profile/default.png';
									}
								} else {
									console.warn(`获取创建者 ${project.user_id} 详情失败:`, userResult.msg);
									this.creatorAvatars[project._id] = '/static/profile/default.png';
								}
							} catch (error) {
								console.error(`获取用户 ${project.user_id} 信息失败:`, error);
								this.creatorAvatars[project._id] = '/static/profile/default.png';
							}
						} else {
							console.warn(`项目 ${project._id} 没有user_id字段`);
							this.creatorAvatars[project._id] = '/static/profile/default.png';
						}
					}

					// 最后再强制更新一次视图
					this.$forceUpdate();

					console.log('创建者头像加载完成，数量:', Object.keys(this.creatorAvatars).length);

					// 加载项目申请人数和其他详细信息
					this.loadProjectDetails(projectIds);
				} catch (error) {
					console.error('批量加载创建者头像失败:', error);
				}
			},

			// 加载项目详细信息（申请人数等）
			async loadProjectDetails(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

				try {
					console.log('开始加载项目详细信息...');
					// 批量处理项目，每5个为一组
					const batchSize = 5;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的详细信息
						const promises = batchIds.map(async (projectId) => {
							try {
								const result = await uniCloud.importObject('Project').getDetailFromList({
									id: projectId
								});

								if (result.status === 1 && result.data) {
									// 更新对应项目的详细信息
									const projectIndex = this.projects.findIndex(p => p._id === projectId);
									if (projectIndex !== -1) {
										// 添加详细信息到项目对象
										this.projects[projectIndex].detail = result.data;

										// 更新申请人数
										if (result.data.person_pending !== undefined) {
											this.projects[projectIndex].current_members = result.data.person_pending;
										}

										// 更新申请人数
										if (result.data.current_person_request !== undefined) {
											this.projects[projectIndex].current_person_request = result.data.current_person_request;
										}
									}
									return { projectId, success: true };
								}
								return { projectId, success: false };
							} catch (error) {
								console.error(`获取项目 ${projectId} 详细信息失败:`, error);
								return { projectId, success: false };
							}
						});

						await Promise.all(promises);

						// 每批次加载后强制更新视图
						this.$forceUpdate();
					}

					console.log('项目详细信息加载完成');
				} catch (error) {
					console.error('批量加载项目详细信息失败:', error);
				}
			},

			// 格式化日期时间
			formatDateTime(timestamp, format) {
				if (!timestamp) return '';

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

			// 截止日期函数
			endingDateReturnFunction(param) {
				try {
					if (!param || !param.ending_time) {
						return '未设置';
					}

					// 使用格式化函数
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

			// 秒timestamp 自定义方法
			secondFunction() {
				const timestampMs = Date.now();
				const timestampSeconds = Math.floor(timestampMs / 1000);
				return timestampSeconds;
			},

			// 选择项目
			selectProject(project) {
				this.selectedProject = project;
				this.showInviteModal = true;
			},

			// 关闭邀请弹窗
			closeInviteModal() {
				this.showInviteModal = false;
				this.inviteComment = '';
			},

			// 跳转到创建项目页面
			navigateToCreateProject() {
				uni.navigateTo({
					url: '/pages/project/create'
				});
			},

			// 跳转到创建项目页面
			navigateToCreateProject() {
				uni.navigateTo({
					url: '/pages/project/create'
				});
			},

			// 发送邀请
			async sendInvitation() {
				// 验证表单
				if (!this.inviteComment.trim()) {
					uni.showToast({
						title: '请输入邀请说明',
						icon: 'none'
					});
					return;
				}

				this.sending = true;

				try {
					// 显示加载中
					uni.showLoading({
						title: '发送邀请中...',
						mask: true
					});

					// 先检查当前用户是否有权限邀请
					const currentUserId = this.$session.getUserValue('user_id');
					const projectId = this.selectedProject._id;

					// 检查是否是项目创建者
					let hasPermission = this.selectedProject.user_id === currentUserId || this.selectedProject.isCreator === true;

					// 如果不是创建者，检查是否有邀请权限
					if (!hasPermission) {
						hasPermission = this.selectedProject.hasInvitePermission === true;
					}

					if (!hasPermission) {
						uni.hideLoading();
						uni.showToast({
							title: '您没有邀请权限',
							icon: 'none',
							duration: 2000
						});
						return;
					}

					// 使用ProjectAction.inviteJoin方法发送邀请
					const res = await uniCloud.importObject('ProjectAction').inviteJoin({
						self_introduce: this.inviteComment,
						proj_id: projectId,
						user_id: this.globalOption.user_id,
						self_user: currentUserId
					});

					uni.hideLoading();

					// 处理结果
					console.log('邀请结果:', res);

					uni.showToast({
						title: res.msg,
						icon: res.status ? 'success' : 'none',
						duration: 2000
					});

					if (res.status) {
						// 邀请成功，关闭弹窗并返回上一页
						this.closeInviteModal();
						setTimeout(() => {
							uni.navigateBack();
						}, 2000);
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('邀请发送失败:', error);
					uni.showToast({
						title: '邀请发送失败: ' + (error.message || '未知错误'),
						icon: 'none',
						duration: 3000
					});
				} finally {
					this.sending = false;
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	.page-header {
		padding: 20rpx 0;
		margin-bottom: 20rpx;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}

	.loading-text {
		margin-top: 20rpx;
		color: #666;
		font-size: 28rpx;
	}

	.empty-projects {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		color: #999;
		font-size: 28rpx;
	}

	.create-project-btn {
		margin-top: 30rpx;
		background-color: #07c160;
		color: #fff;
		font-size: 28rpx;
		padding: 12rpx 30rpx;
		border-radius: 40rpx;
	}

	/* 项目列表样式 - 与project/main_page一致 */
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
		margin-bottom: 30rpx;
		padding-right: 20rpx;
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

	.flex15-clz {
		padding-top: 10rpx;
		padding-left: 0rpx;
		padding-bottom: 0rpx;
		padding-right: 0rpx;
		font-size: 24rpx;
		color: #666;
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

	.container332681 {
		padding-bottom: 30rpx;
		margin-bottom: 0;
		min-height: 100vh;
	}

	.safe-bottom {
		padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
	}

	.select-btn-container {
		margin-top: 10rpx;
	}

	.select-btn {
		background-color: #07c160;
		color: #fff;
		font-size: 28rpx;
		padding: 10rpx 30rpx;
		border-radius: 40rpx;
		border: none;
		margin-right: 0;
	}

	/* 邀请弹窗样式 */
	.invite-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.invite-dialog {
		width: 80%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.invite-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
	}

	.invite-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.close-icon {
		font-size: 40rpx;
		color: #999;
		padding: 0 10rpx;
	}

	.invite-content {
		padding: 30rpx;
	}

	.selected-project {
		margin-bottom: 30rpx;
	}

	.label {
		font-size: 28rpx;
		color: #666;
		margin-right: 10rpx;
	}

	.value {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}

	.invite-form {
		margin-top: 20rpx;
	}

	.form-item {
		margin-bottom: 20rpx;
	}

	.invite-comment {
		width: 100%;
		height: 200rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-top: 10rpx;
		box-sizing: border-box;
	}

	.char-count {
		font-size: 24rpx;
		color: #999;
		text-align: right;
		display: block;
		margin-top: 10rpx;
	}

	.invite-footer {
		display: flex;
		border-top: 1rpx solid #eee;
	}

	.cancel-btn, .confirm-btn {
		flex: 1;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		border: none;
		border-radius: 0;
	}

	.cancel-btn {
		background-color: #f5f5f5;
		color: #666;
	}

	.confirm-btn {
		background-color: #07c160;
		color: #fff;
	}

	.confirm-btn[disabled] {
		background-color: #9be7b5;
	}
</style>
