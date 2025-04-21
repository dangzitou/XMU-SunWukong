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
			
			<view v-else v-for="(item, index) in globalData.invite_list" :key="index" class="invite-item">
				<view class="invite-item-header">
					<view class="invite-status" :class="item.status === 0 ? 'status-pending' : 'status-accepted'">
						{{ item.status === 0 ? '待接受' : '已接受' }}
					</view>
					<view class="invite-user">
						<image :src="item.avatar || '/static/team-1.jpg'" class="avatar"></image>
						<text class="username">{{ inviteMode === 'received' ? (item.creator_name || '创建者') + ' 邀请你加入' : '我邀请加入' }}</text>
					</view>
					<text class="project-title">{{ item.title }}</text>
				</view>
				
				<view class="invite-item-content">
					<view class="requirements">
						<text class="label">要求：</text>
						<view class="req-tags">
							<text class="req-tag" v-for="(req, reqIndex) in (item.requirements || ['本科生', '计算机专业', '数据分析能力'])" :key="reqIndex">{{ req }}</text>
						</view>
					</view>
					
					<view class="invite-detail">
						<view class="detail-item">
							<text class="label">截止日期：</text>
							<text class="value">{{ $tools.formatDateTime(item.deadline || new Date('2025/10/1'), 'YYYY/mm/dd') }}</text>
						</view>
						<view class="detail-item">
							<text class="label">项目人数：</text>
							<text class="value">已报名 {{ item.current_person || 44 }}/需求 {{ item.need_person || 50 }}</text>
						</view>
						<view class="detail-item">
							<text class="label">浏览次数：</text>
							<text class="value">{{ item.view_count || 1999 }}</text>
						</view>
					</view>
				</view>
				
				<view class="invite-item-footer" v-if="item.status === 0 && inviteMode === 'received'">
					<button @tap="openInviteModal(item, index)" class="btn btn-primary">查看邀请函</button>
				</view>
			</view>
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
						<button @tap="declineInvite" class="btn btn-decline">拒绝</button>
						<button @tap="approveInvite" class="btn btn-accept">加入</button>
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
						this.globalData.invite_list = res.data.invite_list || [];
						console.log('已更新邀请列表，数量:', this.globalData.invite_list.length);
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
					
					const res = await uniCloud.importObject('ProjectAction').getSentInvitations({ 
						user_id: myUser 
					});
					
					if (res && res.data) {
						this.globalData.invite_list = res.data || [];
						console.log('已更新我发出的邀请列表，数量:', this.globalData.invite_list.length);
					} else {
						this.globalData.invite_list = [];
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
			
			// 拒绝邀请
			async declineInvite() {
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
					}
				} catch (error) {
					console.error('拒绝邀请失败', error);
					this.showToast('操作失败，请重试');
				}
			},
			
			// 接受邀请
			async approveInvite() {
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
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.invite-item-header {
		position: relative;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.invite-status {
		position: absolute;
		top: 0;
		right: 0;
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
	
	.invite-user {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 30rpx;
		margin-right: 10rpx;
	}
	
	.username {
		font-size: 28rpx;
		color: #333333;
	}
	
	.project-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-top: 10rpx;
	}
	
	.invite-item-content {
		padding: 20rpx 0;
	}
	
	.requirements {
		margin-bottom: 20rpx;
	}
	
	.label {
		font-size: 28rpx;
		color: #666666;
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
	
	.invite-detail {
		background-color: #f9f9f9;
		border-radius: 8rpx;
		padding: 20rpx;
	}
	
	.detail-item {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
	}
	
	.value {
		font-size: 28rpx;
		color: #333333;
	}
	
	.invite-item-footer {
		padding-top: 20rpx;
		display: flex;
		justify-content: flex-end;
	}
	
	.btn {
		font-size: 28rpx;
		padding: 12rpx 30rpx;
		border-radius: 30rpx;
	}
	
	.btn-primary {
		background-color: #1989fa;
		color: #ffffff;
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