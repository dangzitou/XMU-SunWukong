<template>
	<view class="container">

		<!-- 切换导航 -->
		<view class="switch-nav">
			<view class="switch-btn" :class="{'active': inviteMode === 'received'}" @tap="changeInviteMode('received')">
				<image :src="inviteMode === 'received' ? '/static/message_center/others_selected.png' : '/static/message_center/others.png'" class="switch-icon" mode="aspectFit"></image>
				<text>我收到的</text>
			</view>
			<view class="switch-btn" :class="{'active': inviteMode === 'sent'}" @tap="changeInviteMode('sent')">
				<image :src="inviteMode === 'sent' ? '/static/message_center/mine_selected.png' : '/static/message_center/mine.png'" class="switch-icon" mode="aspectFit"></image>
				<text>我发出的</text>
			</view>
		</view>

		<!-- 邀请列表 -->
		<view class="invite-list">

			<view v-if="globalData.invite_list.length === 0" class="empty-box">
				<image src="/static/empty-data.png" mode="aspectFit" class="empty-image"></image>
				<text>暂无{{ inviteMode === 'received' ? '收到' : '发出' }}的邀请</text>
			</view>

			<!-- 我收到的邀请列表 -->
			<block v-else-if="inviteMode === 'received'">
				<view v-for="(item, index) in globalData.invite_list" :key="'received-'+index" class="invite-item">
					<view class="invite-status" :class="{
						'status-pending': item.status === 0,
						'status-accepted': item.status === 1,
						'status-rejected': item.status === 2
					}">
						<text v-if="item.status === 0">待接受</text>
						<text v-else-if="item.status === 1">已接受</text>
						<text v-else-if="item.status === 2">已拒绝</text>
					</view>

					<view class="invite-header">
						<image :src="item.owner_avatar || item.creator_avatar || '/static/team-1.jpg'" class="user-avatar" mode="aspectFit"></image>
						<view class="invite-title">
							<view class="inviter-info">
								<text class="inviter-name">{{ item.owner_name || item.creator_name || '项目创建者' }}</text>
							</view>
							<text class="subtitle">邀请你加入 <text class="highlight project-link" @tap="navigateToProject(item.project_id)">{{ item.title }}</text></text>
						</view>
					</view>

					<view class="invite-detail-content">
						<text class="section-title">项目信息</text>
						<view class="info-list">
							<view class="info-item">
								<text class="label">项目名称：</text>
								<text class="value project-link" @tap="navigateToProject(item.project_id)">{{ item.title || '未知项目' }}</text>
							</view>
							<view class="info-item">
								<text class="label">创建者：</text>
								<text class="value">{{ item.owner_name || item.creator_name || '未知' }}</text>
							</view>
							<view class="info-item">
								<text class="label">项目人数：</text>
								<text class="value">已加入 {{ item.current_members || 0 }}/需求 {{ item.person_needed || 0 }}</text>
							</view>
							<view class="info-item">
								<text class="label">邀请时间：</text>
								<text class="value">{{ $tools.formatDateTime(item.create_time, 'YYYY/mm/dd HH:MM') }}</text>
							</view>
						</view>

						<text class="section-title">邀请说明</text>
						<view class="description">
							<text>{{ item.comment || '项目创建者未填写邀请说明' }}</text>
						</view>

						<view class="requirements" v-if="item.requirements && item.requirements.length > 0">
							<text class="section-title">项目要求</text>
							<view class="req-tags">
								<text class="req-tag" v-for="(req, reqIndex) in item.requirements" :key="reqIndex">{{ req }}</text>
							</view>
						</view>
					</view>

					<!-- 操作按钮 - 只有待接受状态才显示 -->
					<view v-if="item.status === 0" class="action-buttons">
						<button @tap.stop="declineInvite(item, index)" class="btn btn-reject">拒绝</button>
						<button @tap.stop="approveInvite(item, index)" class="btn btn-approve">接受</button>
					</view>

					<!-- 已处理状态信息 -->
					<view v-else class="status-info">
						<text v-if="item.status === 1" class="status-text approved">已接受该邀请，您已成为项目成员</text>
						<text v-else-if="item.status === 2" class="status-text rejected">已拒绝该邀请</text>
					</view>
				</view>
			</block>

			<!-- 我发出的邀请列表 -->
			<block v-else>
				<view v-for="(item, index) in globalData.invite_list" :key="'sent-'+index" class="invite-item">
					<view class="invite-status" :class="{
						'status-pending': item.status === 0,
						'status-accepted': item.status === 1,
						'status-rejected': item.status === 2
					}">
						<text v-if="item.status === 0">待接受</text>
						<text v-else-if="item.status === 1">已接受</text>
						<text v-else-if="item.status === 2">已拒绝</text>
					</view>

					<view class="invite-header">
						<image :src="item.applicant_avatar || '/static/team-1.jpg'" class="user-avatar" mode="aspectFit"></image>
						<view class="invite-title">
							<text class="title">{{ item.applicant_name || '被邀请者' }}</text>
							<text class="subtitle">
								<text class="inviter-name">{{ inviteMode === 'sent' ? '我' : (item.owner_name || '项目创建者') }}</text> 邀请加入
								<text class="highlight project-link" @tap="navigateToProject(item.project_id)">{{ item.title }}</text>
							</text>
						</view>
					</view>

					<view class="invite-detail-content">
						<text class="section-title">项目信息</text>
						<view class="info-list">
							<view class="info-item">
								<text class="label">项目名称：</text>
								<text class="value project-link" @tap="navigateToProject(item.project_id)">{{ item.title || '未知项目' }}</text>
							</view>
							<view class="info-item">
								<text class="label">邀请者：</text>
								<text class="value">{{ inviteMode === 'sent' ? '我' : (item.owner_name || '项目创建者') }}</text>
							</view>
							<view class="info-item">
								<text class="label">项目人数：</text>
								<text class="value">已加入 {{ item.current_members || 0 }}/需求 {{ item.person_needed || 0 }}</text>
							</view>
							<view class="info-item">
								<text class="label">申请人数：</text>
								<text class="value">{{ item.current_person_request || 0 }}</text>
							</view>
							<view class="info-item">
								<text class="label">邀请时间：</text>
								<text class="value">{{ $tools.formatDateTime(item.create_time, 'YYYY/mm/dd HH:MM') }}</text>
							</view>
						</view>

						<text class="section-title">邀请说明</text>
						<view class="description">
							<text>{{ item.comment || '(无邀请内容)' }}</text>
						</view>
					</view>

					<view class="divider"></view>

					<view class="invite-footer">
						<text class="view-details">邀请状态：{{ item.status === 0 ? '等待接受' : (item.status === 1 ? '已接受' : '已拒绝') }}</text>
					</view>
				</view>
			</block>
		</view>

		<!-- 邀请弹窗 -->
		<view @touchmove.stop.prevent="" v-if="modal" class="invite-modal" :class="modal">
			<view class="invite-dialog">
				<view class="invite-dialog-header">
					<text class="invite-dialog-title">{{ globalData.inviteShow.title }}</text>
					<view class="invite-dialog-close" data-type="closemodal" data-id="modal" @tap="navigateTo">
						<text class="icon diy-icon-close"></text>
					</view>
				</view>
				<view class="invite-dialog-content">
					<text class="invite-message">
						{{ globalData.inviteShow.comment || '是否接受该项目的邀请?' }}
					</text>
					<view class="invite-buttons">
						<button @tap="declineInviteModal" class="btn btn-decline">拒绝</button>
						<button @tap="approveInviteModal" class="btn btn-accept">加入</button>
					</view>
				</view>
			</view>
		</view>
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
					invite_list: [],
					inviteShow: {}
				},
				modal: '',
				inviteMode: 'received', // 默认显示我收到的邀请
				inviteLoading: false // 邀请数据加载状态
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
				await this.checkLoginState();

				// 设置初始加载状态并显示加载中
				this.inviteLoading = true;

				uni.showLoading({
					title: '加载中...',
					mask: true
				});

				// 根据当前模式加载数据
				if (this.inviteMode === 'received') {
					await this.loadInviteList();
				} else {
					await this.loadSentInviteList();
				}

				uni.hideLoading();
			},

			// 检查是否登录
			async checkLoginState() {
				if (!this.$session.getToken()) {
					this.showToast('请先登录');
					uni.navigateTo({
						url: '/pages/sign/login'
					});
				}
			},

			// 返回上一页
			navigateBack() {
				uni.navigateBack();
			},

			// 导航到项目详情页面
			navigateToProject(projectId) {
				if (!projectId) {
					this.showToast('项目ID不存在');
					return;
				}

				console.log('导航到项目详情页面:', projectId);
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${projectId}`,
					success: () => console.log('成功导航到项目详情页'),
					fail: (err) => {
						console.error('导航到项目详情页失败:', err);
						// 如果跳转失败，尝试备用方式
						uni.navigateTo({
							url: `/pages/project/detail?id=${projectId}`,
							fail: (err2) => {
								console.error('备用导航也失败:', err2);
								this.showToast('导航失败，请重试');
							}
						});
					}
				});
			},

			// 切换邀请模式（我发出的/我收到的）
			changeInviteMode(mode) {
				if (this.inviteMode === mode) return;

				// 先清空数据并设置加载状态
				this.globalData.invite_list = [];
				this.inviteLoading = true;
				this.$forceUpdate(); // 强制更新视图

				// 显示加载
				uni.showLoading({
					title: '加载中...',
					mask: true
				});

				// 然后修改模式
				this.inviteMode = mode;

				// 加载数据
				if (mode === 'received') {
					// 加载我收到的邀请
					this.loadInviteList();
				} else {
					// 加载我发出的邀请
					this.loadSentInviteList();
				}
			},

			// 加载他人邀请列表
			async loadInviteList() {
				try {
					console.log('加载收到的邀请列表');
					this.inviteLoading = true;

					const res = await uniCloud.importObject('ProjectAction').getListFromMsg({
						user_id: this.$session.getUserValue('user_id')
					});

					if (res && res.data) {
						// 确保邀请列表存在
						const inviteList = res.data.received_invites || res.data.invite_list || [];
						console.log('收到的邀请列表原始数据:', inviteList);

						// 处理数据，确保字段名称一致
						this.globalData.invite_list = inviteList.map(item => {
							// 记录原始数据
							console.log('处理邀请项目:', JSON.stringify(item));

							// 确保所有必要字段存在
							return {
								...item,
								// 确保项目ID字段存在
								project_id: item.project_id,
								// 保留原始的创建者信息字段
								owner_name: item.owner_name || '',
								owner_avatar: item.owner_avatar || '',
								creator_name: item.creator_name || item.owner_name || '项目创建者',
								creator_avatar: item.creator_avatar || item.owner_avatar || '/static/team-1.jpg',
								// 确保项目人数字段存在
								current_members: item.current_members || 0,
								person_needed: item.person_needed || item.need_person || 0,
								// 确保其他必要字段存在
								status: item.status !== undefined ? item.status : 0,
								title: item.title || '未知项目',
								comment: item.comment || ''
							};
						});

						console.log('已更新邀请列表，数量:', this.globalData.invite_list.length);
						console.log('处理后的第一条邀请:', this.globalData.invite_list[0]);
					}
				} catch (error) {
					console.error('加载邀请列表失败', error);
					this.showToast('加载邀请列表失败');
				} finally {
					this.inviteLoading = false;
					uni.hideLoading();
				}
			},

			// 加载我发出的邀请列表
			async loadSentInviteList() {
				try {
					console.log('加载我发出的邀请列表');
					this.inviteLoading = true;

					const myUser = this.$session.getUserValue('user_id');
					console.log('当前用户ID:', myUser);

					// 使用数据库直接查询方式
					const db = uniCloud.database();

					// 1. 获取我创建的项目
					const myProjectsRes = await db.collection('xm-stp-project')
						.where({ user_id: myUser })
						.field('_id')
						.get();

					const myProjects = myProjectsRes.result?.data || [];
					if (!myProjects.length) {
						console.log('未找到您创建的项目');
						this.globalData.invite_list = [];
						this.inviteLoading = false;
						uni.hideLoading();
						return;
					}

					const projectIds = myProjects.map(p => p._id);
					console.log('您创建的项目IDs:', projectIds);

					// 2. 获取项目详情
					const projectDetailsRes = await db.collection('xm-stp-project_detail')
						.where({
							_id: db.command.in(projectIds)
						})
						.field('_id,title,user_id,current_members,person_needed,current_person_request')
						.get();

					const projectDetails = projectDetailsRes.result?.data || [];

					// 3. 获取这些项目发出的邀请
					const invitesRes = await db.collection('xm-stp-project_app_invite')
						.where({
							project_id: db.command.in(projectIds)
						})
						.field('_id,user_id,project_id,status,create_time,comment')
						.orderBy('create_time', 'desc')
						.get();

					const invites = invitesRes.result?.data || [];
					if (!invites.length) {
						console.log('未找到邀请记录');
						this.globalData.invite_list = [];
						this.inviteLoading = false;
						uni.hideLoading();
						return;
					}

					console.log('找到邀请记录数量:', invites.length);

					// 4. 获取被邀请用户的信息
					const userIds = invites.map(invite => invite.user_id);
					const usersRes = await db.collection('xm-stp-user_detail')
						.where({
							_id: db.command.in([...new Set(userIds)])
						})
						.field('_id,real_name,nickname,avatar,user_type')
						.get();

					const users = usersRes.result?.data || [];

					// 5. 获取当前用户（邀请者）的信息
					const myUserRes = await db.collection('xm-stp-user_detail')
						.where({
							_id: myUser
						})
						.field('_id,real_name,nickname,avatar,user_type')
						.get();

					const myUserInfo = myUserRes.result?.data?.[0] || {};

					// 6. 合并数据
					const inviteList = invites.map(invite => {
						const project = projectDetails.find(p => p._id === invite.project_id) || {};
						const applicant = users.find(u => u._id === invite.user_id) || {};

						// 打印当前用户信息，用于调试
						console.log('当前用户信息:', myUserInfo);

						// 创建邀请对象
						const inviteObj = {
							_id: invite._id,
							project_id: invite.project_id,
							user_id: invite.user_id,
							status: invite.status,
							create_time: invite.create_time,
							comment: invite.comment || '',
							title: project.title || '未知项目',
							// 项目人数信息
							current_members: project.current_members || 0,
							person_needed: project.person_needed || 0,
							current_person_request: project.current_person_request || 0,
							// 被邀请者信息
							applicant_name: applicant.real_name || applicant.nickname || '被邀请者',
							applicant_avatar: applicant.avatar || '/static/team-1.jpg',
							applicant_type: applicant.user_type || '学生',
							// 邀请者（当前用户）信息
							creator_name: myUserInfo.real_name || myUserInfo.nickname || '项目创建者',
							creator_avatar: myUserInfo.avatar || '/static/team-1.jpg',
							owner_name: myUserInfo.real_name || myUserInfo.nickname || '项目创建者',
							owner_avatar: myUserInfo.avatar || '/static/team-1.jpg'
						};

						// 打印创建的邀请对象，用于调试
						console.log('创建的邀请对象:', inviteObj);

						return inviteObj;
					});

					this.globalData.invite_list = inviteList;
					console.log('已更新我发出的邀请列表，数量:', inviteList.length);

					// 如果有数据，打印第一条记录用于调试
					if (this.globalData.invite_list.length > 0) {
						console.log('第一条邀请记录:', this.globalData.invite_list[0]);
					}
				} catch (error) {
					console.error('加载我发出的邀请列表失败', error);
					this.showToast('加载邀请列表失败');
					this.globalData.invite_list = [];
				} finally {
					this.inviteLoading = false;
					uni.hideLoading();
				}
			},

			// 打开邀请弹窗
			openInviteModal(item, index) {
				this.globalData.inviteShow = item;
				this.globalData.inviteIndex = index;

				this.navigateTo({
					type: 'openmodal',
					id: 'modal'
				});
			},

			// 拒绝邀请 - 直接在列表中操作
			async declineInvite(item, index) {
				try {
					console.log('准备拒绝邀请', item);

					// 先询问是否拒绝
					uni.showModal({
						title: '确认操作',
						content: `确定要拒绝加入项目"${item.title || '未知项目'}"吗？`,
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '处理中...',
									mask: true
								});

								try {
									console.log('拒绝邀请项目ID:', item.project_id);
									const result = await uniCloud.importObject('ProjectAction').declineJoin({
										user_id: this.$session.getUserValue('user_id'),
										project_id: item.project_id
									});

									uni.hideLoading();

									if (result && result.status === 1) {
										this.showToast('已拒绝邀请');

										// 设置消息状态已更新的标记
										uni.setStorageSync('message_status_updated', true);

										// 更新当前项目的状态为"已拒绝"
										if (this.globalData.invite_list[index]) {
											this.globalData.invite_list[index].status = 2;
											this.$forceUpdate(); // 强制视图更新
										}

										// 延时重新加载列表，确保数据同步
										setTimeout(() => {
											this.loadInviteList();
										}, 1000);
									} else {
										this.showToast('操作失败: ' + (result?.msg || '未知错误'));
									}
								} catch (error) {
									uni.hideLoading();
									console.error('拒绝邀请失败', error);
									this.showToast('操作失败: ' + error.message);
								}
							}
						}
					});
				} catch (error) {
					console.error('拒绝邀请失败', error);
					this.showToast('拒绝邀请失败，请重试');
				}
			},

			// 旧的弹窗方式拒绝邀请
			async declineInviteModal() {
				try {
					const res = await uniCloud.importObject('ProjectAction').declineJoin({
						user_id: this.$session.getUserValue('user_id'),
						project_id: this.globalData.inviteShow.project_id
					});

					uni.showToast({
						title: res.msg || '操作成功',
						icon: res.status ? 'success' : 'error'
					});

					if (res.status !== 0) {
						this.globalData.invite_list.splice(this.globalData.inviteIndex, 1);
						this.globalData.inviteIndex = null;

						this.navigateTo({
							type: 'closemodal',
							id: 'modal'
						});

						// 设置消息状态已更新的标记
						uni.setStorageSync('message_status_updated', true);
					}
				} catch (error) {
					console.error('拒绝邀请失败', error);
					this.showToast('操作失败，请重试');
				}
			},

			// 接受邀请
			// 接受邀请 - 直接在列表中操作
			async approveInvite(item, index) {
				try {
					console.log('准备接受邀请', item);

					uni.showModal({
						title: '确认操作',
						content: `确定要接受加入项目"${item.title || '未知项目'}"吗？`,
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '处理中...',
									mask: true
								});

								try {
									console.log('接受邀请项目ID:', item.project_id);
									const result = await uniCloud.importObject('ProjectAction').approveJoin({
										user_id: this.$session.getUserValue('user_id'),
										project_id: item.project_id
									});

									uni.hideLoading();

									if (result && result.status === 1) {
										this.showToast('已接受邀请');

										// 设置消息状态已更新的标记
										uni.setStorageSync('message_status_updated', true);

										// 更新当前项目的状态为"已接受"
										if (this.globalData.invite_list[index]) {
											this.globalData.invite_list[index].status = 1;
											this.$forceUpdate(); // 强制视图更新
										}

										// 延时重新加载列表，确保数据同步
										setTimeout(() => {
											this.loadInviteList();
										}, 1000);
									} else {
										this.showToast('操作失败: ' + (result?.msg || '未知错误'));
									}
								} catch (error) {
									uni.hideLoading();
									console.error('接受邀请失败', error);
									this.showToast('操作失败: ' + error.message);
								}
							}
						}
					});
				} catch (error) {
					console.error('接受邀请失败', error);
					this.showToast('接受邀请失败，请重试');
				}
			}

			// 旧的弹窗方式接受邀请
			,async approveInviteModal() {
				try {
					const res = await uniCloud.importObject('ProjectAction').approveJoin({
						user_id: this.$session.getUserValue('user_id'),
						project_id: this.globalData.inviteShow.project_id
					});

					uni.showToast({
						title: res.msg || '操作成功',
						icon: res.status ? 'success' : 'error'
					});

					if (res.status !== 0) {
						// 更新邀请状态
						this.globalData.invite_list[this.globalData.inviteIndex].status = 1;
						this.globalData.inviteIndex = null;

						this.navigateTo({
							type: 'closemodal',
							id: 'modal'
						});

						// 设置消息状态已更新的标记
						uni.setStorageSync('message_status_updated', true);
					}
				} catch (error) {
					console.error('接受邀请失败', error);
					this.showToast('操作失败，请重试');
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f7f7f7;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.page-header {
		position: relative;
		padding: 30rpx;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.header-back {
		position: absolute;
		left: 30rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-back .icon {
		font-size: 40rpx;
		color: #333333;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	/* 顶部导航栏 */
	.nav-bar {
		background-color: #07c160;
		height: 90rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		position: relative;
	}

	.nav-back {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		left: 30rpx;
	}

	.nav-back .icon {
		font-size: 40rpx;
		color: #ffffff;
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 34rpx;
		font-weight: bold;
		color: #ffffff;
	}

	/* 切换导航 */
	.switch-nav {
		display: flex;
		justify-content: center;
		padding: 20rpx 0;
		background-color: #ffffff;
		margin-bottom: 20rpx;
	}

	.switch-btn {
		display: flex;
		align-items: center;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
		margin: 0 20rpx;
		background-color: #f7f7f7;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;

		&.active {
			background-color: #07c160;
			color: #ffffff;
		}

		text {
			font-size: 28rpx;
			margin-left: 10rpx;
		}
	}

	.switch-icon {
		width: 36rpx;
		height: 36rpx;
	}

	/* 邀请列表 */
	.invite-list {
		padding: 0 20rpx;
	}

	.loading-box, .empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
	}

	.loading {
		width: 60rpx;
		height: 60rpx;
		border: 6rpx solid #f3f3f3;
		border-top: 6rpx solid #07c160;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}

	.empty-box text {
		font-size: 28rpx;
		color: #999999;
	}

	.invite-item {
		position: relative;
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.invite-status {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}

	.status-pending {
		background-color: #ff9500;
		color: #ffffff;
	}

	.status-accepted {
		background-color: #07c160;
		color: #ffffff;
	}

	.status-rejected {
		background-color: #ff3b30;
		color: #ffffff;
	}

	.invite-header {
		display: flex;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.user-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 40rpx;
		margin-right: 16rpx;
	}

	.invite-title {
		flex: 1;
	}

	.inviter-info {
		display: flex;
		align-items: center;
	}

	.inviter-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		display: block;
	}

	.subtitle {
		font-size: 26rpx;
		color: #666666;
		margin-top: 6rpx;
		display: block;
	}

	.highlight {
		color: #007aff;
		font-weight: 500;
	}

	.invite-detail-content, .invite-content {
		padding: 20rpx 0;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
		display: block;
	}

	.info-grid, .info-list {
		background-color: #f9f9f9;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.info-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.info-list {
		display: flex;
		flex-direction: column;
	}

	.info-item {
		display: flex;
		margin-bottom: 10rpx;
		width: 100%;
	}

	.info-grid .info-item {
		width: 50%;
	}

	.info-item .label {
		font-size: 28rpx;
		color: #666666;
		min-width: 160rpx;
	}

	.info-item .value {
		font-size: 28rpx;
		color: #333333;
		flex: 1;
	}

	.info-item .project-link {
		color: #007AFF;
		text-decoration: underline;
	}

	.description {
		background-color: #f9f9f9;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.description text {
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
	}

	.requirements {
		margin-bottom: 20rpx;
	}

	.req-tags {
		display: flex;
		flex-wrap: wrap;
		margin-top: 10rpx;
	}

	.req-tag {
		background-color: #f7f7f7;
		border-radius: 20rpx;
		padding: 6rpx 16rpx;
		font-size: 24rpx;
		color: #333333;
		margin-right: 10rpx;
		margin-bottom: 10rpx;
	}

	.divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 10rpx 0;
	}

	.invite-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 10rpx;
	}

	.view-details {
		font-size: 26rpx;
		color: #007aff;
	}

	/* 操作按钮 */
	.action-buttons {
		display: flex;
		margin-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
		padding-top: 20rpx;
	}

	.btn {
		flex: 1;
		height: 80rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-reject {
		background-color: #ffffff;
		color: #ff3b30;
		border: 1rpx solid #ff3b30;
		margin-right: 20rpx;
	}

	.btn-approve {
		background-color: #07c160;
		color: #ffffff;
	}

	.btn-primary {
		background-color: #1989fa;
		color: #ffffff;
	}

	/* 状态信息样式 */
	.status-info {
		margin-top: 20rpx;
		padding: 16rpx 0;
		text-align: center;
		border-top: 2rpx solid #f2f2f2;
	}

	.status-text {
		font-size: 28rpx;
		font-weight: 500;
	}

	.status-text.approved {
		color: #07c160;
	}

	.status-text.rejected {
		color: #ff5252;
	}

	/* 邀请弹窗 */
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
		z-index: 999;
	}

	.invite-dialog {
		width: 80%;
		background-color: #ffffff;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.invite-dialog-header {
		position: relative;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.invite-dialog-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		text-align: center;
	}

	.invite-dialog-close {
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.invite-dialog-close .icon {
		font-size: 40rpx;
		color: #999999;
	}

	.invite-dialog-content {
		padding: 30rpx;
	}

	.invite-message {
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.invite-buttons {
		display: flex;
		justify-content: space-between;
	}

	.btn-decline {
		background-color: #ff3b30;
		color: #ffffff;
		flex: 1;
		margin-right: 20rpx;
	}

	.btn-accept {
		background-color: #07c160;
		color: #ffffff;
		flex: 1;
	}
</style>