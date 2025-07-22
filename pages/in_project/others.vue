<template>
	<view class="container container332681">
		<view v-if="isLoading" class="loading-container">
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else-if="globalData.list.length === 0" class="empty-container">
			<text class="empty-text">暂无加入的项目</text>
			<view class="empty-tip">
				<text>这里只显示你加入的项目，不包含你发起的项目</text>
			</view>
		</view>

		<view v-else v-for="(item, index) in globalData.list" :key="index"
			class="flex flex-wrap diygw-col-24 flex-direction-column justify-center items-center"
			@tap="navigateToProjectDetail(item)">
			<view class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz">
				<view class="flex flex-wrap diygw-col-24 items-stretch">
					<view class="flex flex-wrap flex-direction-column justify-between"
						:class="hasProjectImage(item) ? 'diygw-col-0 flex6-clz' : 'diygw-col-24'">
						<view class="flex flex-wrap diygw-col-0 items-center">
							<text class="diygw-col-0 text3-clz">{{ item.title || '未知项目' }}</text>
						</view>
						<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
							<text class="diygw-col-0 text4-clz"></text>
							<image :src="getCreatorAvatar(item)" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
							<text class="diygw-col-0 text6-clz">{{ item.creator_type || (item.type === 'teacher' ? '导师发起' : '学生发起') }}</text>
							<text class="diygw-col-0 text6-clz">{{ item.project_cat?.name || item.type || '科技创新' }}</text>
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
						<!-- 调试信息 -->
						<text v-if="false" class="diygw-col-0">原始值: {{ item.ending_time }} (类型: {{ typeof item.ending_time }})</text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0">已招募{{ item.current_members || 0 }}/{{ item.person_needed || 0 }}人 · {{ item.current_person_request || 0 }}人申请</text>
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
				globalData: {
					list: []
				},
				isLoading: true,
				// 项目类型图标映射
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				projectImages: {}, // 存储项目ID到图片URL的映射
				creatorAvatars: {}, // 存储项目ID到创建者头像的映射
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

			// 获取加入的项目列表
			async getListFunction() {
				try {
					this.isLoading = true;
					console.log('准备获取用户加入的项目列表...');

					// 清空项目列表
					this.globalData.list = [];

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

					// 状态优先级映射
					const statusPriority = {
						'成员': 100,         // 最高优先级
						'待审核': 50,
						'已通过': 40,
						'已接受': 30,
						'已邀请': 20,
						'拒绝邀请': 10,
						'已拒绝': 5,
						'default': 0        // 默认优先级
					};

					// 获取用户加入的项目
					console.log('获取用户加入的项目，用户ID:', userId);
					const res = await uniCloud.importObject('Project').getJoin({
						user_id: userId
					});

					console.log('API返回数据:', JSON.stringify(res.data));

					// 检查返回数据中的ending_time字段
					if (res.data && res.data.length > 0) {
						res.data.forEach(item => {
							console.log(`项目 ${item._id || item.project_id} 的ending_time:`, item.ending_time, typeof item.ending_time);
						});
					}

					if (res.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
						console.log(`API返回了${res.data.length}个项目记录`);

						// 处理每个项目数据，确保所有计数字段都是数字
						const projectList = res.data.map(item => {
							// 确保current_members存在且为数字
							if (item.current_members === undefined) {
								item.current_members = parseInt(item.member_count || 0);
							} else if (typeof item.current_members === 'string') {
								item.current_members = parseInt(item.current_members || 0);
							}

							// 确保current_person_request存在且为数字
							if (item.current_person_request === undefined) {
								item.current_person_request = parseInt(item.person_request || 0);
							} else if (typeof item.current_person_request === 'string') {
								item.current_person_request = parseInt(item.current_person_request || 0);
							}

							// 确保person_needed为数字
							if (item.person_needed !== undefined) {
								item.person_needed = parseInt(item.person_needed || 0);
							}

							// 设置显示状态
							let displayStatus = item.status || '已加入';
							if (item.project_position === 1) {
								displayStatus = '负责人';
							} else if (item.project_position === 2) {
								displayStatus = '成员';
							}

							console.log(`项目 ${item._id}: ${item.title} - 成员数: ${item.current_members}, 申请数: ${item.current_person_request}, 需要人数: ${item.person_needed}`);

							return {
								...item,
								project_id: item._id || item.project_id,
								display_status: displayStatus
							};
						});

						// 过滤掉已拒绝的项目
						const filteredList = projectList.filter(project => {
							if (project.display_status === '已拒绝') {
								console.log(`过滤掉已拒绝项目: ${project.project_id}`);
								return false;
							}
							return true;
						});

						// 对每个项目使用getDetailFromList获取申请人数
						for (const project of filteredList) {
							try {
								// 使用getDetailFromList获取项目详情和申请人数
								const detailRes = await uniCloud.importObject('Project').getDetailFromList({
									id: project._id || project.project_id
								});

								if (detailRes.status === 1) {
									// 使用getDetailFromList返回的person_pending作为申请人数
									project.current_person_request = detailRes.data.person_pending || 0;
									console.log(`项目 ${project._id || project.project_id} 申请人数更新为: ${project.current_person_request}`);
								}
							} catch (detailError) {
								console.error(`获取项目 ${project._id || project.project_id} 详情失败:`, detailError);
							}
						}

						console.log(`最终处理后的项目列表包含 ${filteredList.length} 个项目`);
						this.globalData.list = filteredList;

						// 获取所有项目ID
						const projectIds = filteredList.map(project => project._id || project.project_id);

						// 批量获取项目图片
						await this.loadProjectImages(projectIds);

						// 批量获取创建者头像
						await this.loadCreatorAvatars(projectIds);
					} else {
						console.log('API返回的数据不是数组或为空');
						this.globalData.list = [];
					}

					this.isLoading = false;
				} catch (error) {
					console.error('获取加入的项目列表失败:', error);
					this.isLoading = false;

					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
				}
			},

			// 新增: 获取项目图片的方法
			async loadProjectImages(projectIds) {
				if (!projectIds || projectIds.length === 0) return;

				try {
					// 批量处理项目，每10个为一组
					const batchSize = 10;
					for (let i = 0; i < projectIds.length; i += batchSize) {
						const batchIds = projectIds.slice(i, i + batchSize);

						// 并行获取这一批项目的图片
						const promises = batchIds.map(async (projectId) => {
							if (!projectId) return { projectId, success: false };

							try {
								const result = await uniCloud.importObject('ProjectAsset').getProjectImages({
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
								const result = await uniCloud.importObject('ProjectAsset').getProjectCreator({
									project_id: projectId
								});

								if (result && result.status === 1 && result.data) {
									console.log(`获取项目 ${projectId} 创建者信息成功:`, result.data);
									// 保存创建者头像
									if (result.data.avatar) {
										this.creatorAvatars[projectId] = result.data.avatar;

										// 更新对应项目的创建者信息
										const projectIndex = this.globalData.list.findIndex(p => (p._id === projectId || p.project_id === projectId));
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

			// 判断项目是否有实际图片（非分类图标）
			hasProjectImage(item) {
				if (!item) return false;

				// 检查项目的图片数组
				if (item.images && item.images.length > 0) {
					return true;
				}

				const projectId = item._id || item.project_id;

				// 检查缓存的项目图片
				if (projectId && this.projectImages[projectId]) {
					return true;
				}

				// 没有实际项目图片
				return false;
			},

			// 修改: 获取项目图片的方法，优先使用项目图片
			getProjectImage(item) {
				if (!item) return '/static/cxcp.png';

				const projectId = item._id || item.project_id;
				if (projectId && this.projectImages[projectId]) {
					return this.projectImages[projectId];
				}

				// 如果没有项目图片，使用分类图标
				const categoryName = item.project_cat?.name;
				return this.projectTypeImages[categoryName] || '/static/cxcp.png';
			},

			// 获取项目创建者头像
			getCreatorAvatar(item) {
				if (!item) return '/static/team-1.jpg';

				const projectId = item._id || item.project_id;

				// 优先使用已经获取到的creator_avatar属性
				if (item.creator_avatar) {
					return item.creator_avatar;
				}

				// 其次使用缓存的创建者头像
				if (projectId && this.creatorAvatars[projectId]) {
					return this.creatorAvatars[projectId];
				}

				// 最后使用默认头像
				return '/static/team-1.jpg';
			},

			// 获取项目状态文本
			getStatus(item) {
				if (!item) return '未知';

				if (item.type === 'request') {
					switch(item.status) {
						case '审核通过': return '已加入';
						case '待审核': return '待审核';
						case '审核拒绝': return '已拒绝';
						default: return item.status || '未知状态';
					}
				} else if (item.type === 'position') {
					return '已加入';
				}

				return item.status || '未知';
			},

			// 获取项目类型对应的图标
			getProjectTypeImage(type) {
				return this.projectTypeImages[type] || '/static/cxcp.png';
			},

			// 获取项目要求
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

			// 返回时间和是否过期 自定义方法
			endingDateReturnFunction(param) {
				try {
					if (!param || !param.ending_time && param.ending_time !== 0) {
						return '未设置';
					}

					console.log('原始ending_time:', param.ending_time, typeof param.ending_time);

					let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : '';
					var date = this.$tools.formatDateTime(ending_time, 'YYYY-mm-dd HH:MM');

					// 获取当前时间的字符串表示
					const now = this.$tools.getCurrentDateTime();

					// 比较是否过期
					const isExpired = date < now;

					return date + (isExpired ? '(已过期)' : '');
				} catch (error) {
					console.error('日期格式化错误:', error, param);
					return '日期格式错误';
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

					return `${year}-${month}-${day}`;
				} catch (error) {
					console.error('格式化日期出错:', error, timestamp);
					return '日期格式错误';
				}
			},

			// 导航到项目详情页面
			navigateToProjectDetail(item) {
				if (!item || !item.project_id) {
					console.log('项目信息不完整, 无法跳转', item);
					return;
				}

				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${item.project_id}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200rpx;
		width: 100%;
	}

	.loading-text {
		font-size: 32rpx;
		color: #666;
	}

	.empty-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 500rpx;
		width: 100%;
		padding: 30rpx;
	}

	.empty-image {
		width: 180rpx;
		height: 180rpx;
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 36rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 15rpx;
	}

	.empty-tip {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
		max-width: 80%;
	}

	.status-text {
		color: #07c160;
		font-weight: bold;
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
		padding-bottom: 20rpx;
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
