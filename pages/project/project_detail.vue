<template>
	<view class="container">
		<!-- 项目详情头部 -->
		<view class="project-header">
			<view class="project-title">{{ projectDetail.title }}</view>
			<view class="project-meta">
				<view class="meta-item">
					<text class="meta-label">发起人：</text>
					<text class="meta-value clickable" @tap="viewCreator">{{ getCreatorName() }}</text>
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
						<button class="contact-button" @tap="viewCreator">查看详细资料</button>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 项目描述 -->
		<view class="section">
			<view class="section-title">项目描述</view>
			<view class="project-description">
				<mp-html v-if="projectDetail.detail && projectDetail.detail.description" :content="projectDetail.detail.description"></mp-html>
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
			<view class="button-row" v-if="isMyProject">
				<button class="global-button edit-btn" @tap="editProject">修改项目</button>
				<button class="global-button manage-btn" @tap="navigateToMemberManagement">人员管理</button>
			</view>
			<button v-else-if="isExpired" class="global-button" disabled>已过期</button>
			<button v-else-if="isInProject" class="global-button" @tap="openRequestModal">修改申请</button>
			<button v-else class="global-button" @tap="openRequestModal">申请加入</button>
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
				currentRequest: null
			};
		},
		onLoad(option) {
			if (option && option.id) {
				this.projectId = option.id;
				// 先检查用户是否已申请
				this.checkUserRequestStatus();
				// 再加载项目详情
				this.loadProjectDetail();
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
		methods: {
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
					uni.showLoading({
						title: '加载中...',
						mask: true
					});
					
					// 获取项目详情
					const res = await uniCloud.importObject('Project').getDetailFromList({
						id: this.projectId
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
						id: this.projectId
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
							const creatorRes = await uniCloud.importObject('Project').getProjectCreator({
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
					url: `/pages/user/detail?id=${this.projectDetail.user_id}`,
					fail: (err) => {
						console.error('跳转到用户详情页失败:', err);
						uni.showToast({
							title: '暂不支持查看用户详情',
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
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;
		padding-bottom: 120rpx;
	}
	
	.project-header {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.project-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
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
		padding: 20rpx;
		background-color: #ffffff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}
	
	.button-row {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}
	
	.global-button {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 0 auto;
		width: 100%;
	}
	
	.edit-btn {
		background-color: #07c160;
	}
	
	.manage-btn {
		background-color: #20c971;
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