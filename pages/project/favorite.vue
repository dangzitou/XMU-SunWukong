<template>
	<view class="container container332681">
		<!-- 添加空项目提示 -->
		<view v-if="globalData.list.length === 0" class="empty-container">
			<image src="/static/empty-data.png" class="empty-image" mode="aspectFit"></image>
			<text class="empty-text">暂无收藏的项目</text>
		</view>
		<!-- 项目列表 -->
		<view v-else v-for="(item, index) in globalData.list" :key="index"
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
						<text class="diygw-col-0 text6-clz">{{ item.creator_type === 0 ? '导师发起' : '学生发起' }}</text>
						<text class="diygw-col-0 text6-clz">{{ item.project_cat?.name || '科技创新' }}</text>
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
					<text class="diygw-col-0">截止：{{ item.deadline || endingDateReturnFunction({ ending_time: item.ending_time }) }}</text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">已招募{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
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
				globalData: { list: [] },
				// 项目类型图标映射
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				projectImages: {}, // 存储项目ID到图片URL的映射
				creatorAvatars: {}, // 存储项目ID到创建者头像的映射
				isLoading: false
			};
		},
		onShow() {
			this.setCurrentPage(this);
			this.initShow();
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
			async initShow() {
				await this.checkLoginFunction();
			},
			// 检查登录 自定义方法
			async checkLoginFunction(param) {
				let thiz = this;
				if (!this.$session.getToken()) {
					//比如未登录，转身到其他页面等
					this.showToast('请先登录');

					this.navigateTo({
						type: 'page',
						url: 'sign/login'
					});
				}
			},

			// 获取收藏的项目列表 自定义方法
			async getListFunction() {
				try {
					this.isLoading = true;
					console.log('准备获取用户收藏的项目列表...');

					// 检查用户登录状态
					if (!this.$session.getToken()) {
						console.log('用户未登录，无法获取项目列表');
						this.isLoading = false;
						uni.navigateTo({
							url: '/pages/sign/login'
						});
						return;
					}

					// 获取用户ID
					const userId = this.$session.getUserValue('user_id');
					if (!userId) {
						console.log('无法获取用户ID');
						this.isLoading = false;
						return;
					}

					// 使用ProjectAsset.getFavoriteProjects云函数获取收藏项目
					console.log('调用getFavoriteProjects云函数，用户ID:', userId);
					const res = await uniCloud.importObject('ProjectAsset').getFavoriteProjects({
						user_id: userId
					});

					console.log('API返回数据:', JSON.stringify(res));

					if (res.status === 1 && Array.isArray(res.data)) {
						// 已从云函数获取基本的项目数据
						const projectList = res.data;
						console.log(`加载了 ${projectList.length} 个收藏项目`);

						// 为每个项目获取详细信息
						if (projectList.length > 0) {
							for (let i = 0; i < projectList.length; i++) {
								const project = projectList[i];
								try {
									// 获取项目详细信息，包括description字段
									const detailRes = await uniCloud.importObject('Project').getDetailFromList({
										id: project._id
									});

									if (detailRes.status === 1 && detailRes.data) {
										console.log(`获取项目 ${project._id} 详情成功:`, detailRes.data);
										// 合并详情到项目数据
										projectList[i].detail = detailRes.data;

										// 如果项目本身没有description，但详情中有，则添加到项目中
										if (!project.description && detailRes.data.description) {
											projectList[i].description = detailRes.data.description;
										}

										// 如果项目本身没有content_text，但详情中有，则添加到项目中
										if (!project.content_text && detailRes.data.content_text) {
											projectList[i].content_text = detailRes.data.content_text;
										}
									}
								} catch (detailError) {
									console.error(`获取项目 ${project._id} 详情失败:`, detailError);
								}
							}
						}

						this.globalData.list = projectList;

						// 获取项目图片
						const projectIds = projectList.map(project => project._id);
						if (projectIds.length > 0) {
							await this.loadProjectImages(projectIds);
						}
					} else {
						console.log('API返回的数据为空或格式不符');
						this.globalData.list = [];
					}

					this.isLoading = false;
				} catch (error) {
					console.error('获取收藏的项目列表失败:', error);
					this.isLoading = false;
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
				}
			},

			// 加载项目图片
			async loadProjectImages(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

				try {
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
					}

					console.log('所有项目图片加载完成:', Object.keys(this.projectImages).length);

					// 批量获取创建者头像
					await this.loadCreatorAvatars(projectIds);
				} catch (error) {
					console.error('批量加载项目图片失败:', error);
				}
			},

			// 批量获取创建者头像
			async loadCreatorAvatars(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

				try {
					console.log('开始获取创建者头像');
					// 批量处理项目，每5个为一组
					const batchSize = 5;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的创建者信息
						const promises = batchIds.map(async (projectId) => {
							if (!projectId) return { projectId, success: false };

							try {
								const result = await uniCloud.importObject('ProjectAction').getProjectCreator({
									project_id: projectId
								});

								if (result && result.status === 1 && result.data) {
									console.log(`获取项目 ${projectId} 创建者信息成功:`, result.data);
									// 保存创建者头像
									if (result.data.avatar) {
										this.creatorAvatars[projectId] = result.data.avatar;

										// 更新对应项目的创建者信息
										const projectIndex = this.globalData.list.findIndex(p => p._id === projectId);
										if (projectIndex !== -1) {
											this.globalData.list[projectIndex].creator_name = result.data.nickname || result.data.username || '未知用户';
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
					}

					console.log('所有创建者头像加载完成:', Object.keys(this.creatorAvatars).length);
					this.$forceUpdate(); // 强制更新视图
				} catch (error) {
					console.error('批量加载创建者头像失败:', error);
				}
			},

			// 返回时间和是否过期 自定义方法
			endingDateReturnFunction(param) {
				let thiz = this;
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : '';
				var date = this.$tools.formatDateTime(ending_time, 'YYYY-mm-dd HH:MM');
				date += this.$tools.formatDateTime(ending_time, 'YYYY-mm-dd HH:MM') < this.$tools.getCurrentDateTime() ? '(已过期)' : '';
				return date;
			},

			// 判断项目是否有实际图片（非分类图标）
			hasProjectImage(item) {
				if (!item) return false;

				// 检查项目的图片数组
				if (item.images && item.images.length > 0) {
					return true;
				}

				// 检查缓存的项目图片
				if (item._id && this.projectImages[item._id]) {
					return true;
				}

				// 没有实际项目图片
				return false;
			},

			// 获取项目图片的方法，优先使用项目图片
			getProjectImage(item) {
				if (item && item._id && this.projectImages[item._id]) {
					return this.projectImages[item._id];
				}

				// 如果没有项目图片，使用分类图标
				const categoryName = item?.project_cat?.name;
				return this.projectTypeImages[categoryName] || '/static/cxcp.png';
			},

			// 获取创建者头像
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

				// 最后使用项目要求作为备选
				const requirements = this.getRequirements(item);
				if (requirements.length > 0) {
					return requirements.join('、');
				}

				return '暂无项目描述';
			},

			// 获取项目要求
			getRequirements(item) {
				const requirements = [];
				if (item.student_type) requirements.push(item.student_type);
				if (item.major) requirements.push(item.major);
				if (item.skills) requirements.push(item.skills);
				return requirements;
			},

			// 导航到项目详情页面
			navigateToProjectDetail(item) {
				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${item._id}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
						// 如果跳转失败，降级回原来的方式
						this.navigateTo({
							type: 'page',
							url: '/pages/project/detail/self',
							id: item._id
						});
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.empty-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 400rpx;
		width: 100%;
		padding: 30rpx;
	}

	.empty-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 32rpx;
		color: #999;
		text-align: center;
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
		margin-bottom: 20rpx;
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
		font-size: 26rpx;
	}

	.flex15-clz {
		padding-top: 20rpx;
		padding-left: 0rpx;
		padding-bottom: 20rpx;
		padding-right: 0rpx;
	}

	.icon {
		font-size: 40rpx;
	}

	.container332681 {
		padding-bottom: 20rpx;
		margin-bottom: 0;
	}

	.flex-direction-column {
		flex-direction: column;
	}
</style>
