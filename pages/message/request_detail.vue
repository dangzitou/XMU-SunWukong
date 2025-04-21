<template>
	<view class="container">
		<!-- 切换导航 -->
		<view class="switch-nav">
			<view class="switch-btn" :class="{'active': requestMode === 'received'}" @tap="changeRequestMode('received')">
				<image :src="requestMode === 'received' ? '/static/message_center/others_selected.png' : '/static/message_center/others.png'" class="switch-icon" mode="aspectFit"></image>
				<text>我收到的</text>
			</view>
			<view class="switch-btn" :class="{'active': requestMode === 'sent'}" @tap="changeRequestMode('sent')">
				<image :src="requestMode === 'sent' ? '/static/message_center/mine_selected.png' : '/static/message_center/mine.png'" class="switch-icon" mode="aspectFit"></image>
				<text>我发出的</text>
			</view>
		</view>
		
		<!-- 申请列表 -->
		<view class="request-list">
			
			<view v-if="globalData.request_list.length === 0" class="empty-box">
				<image src="/static/empty-data.png" mode="aspectFit" class="empty-image"></image>
				<text>暂无{{ requestMode === 'received' ? '收到' : '发出' }}的申请</text>
			</view>
			
			<!-- 我发出的申请列表 -->
			<block v-else-if="requestMode === 'sent'">
				<view v-for="(item, index) in globalData.request_list" :key="'sent-'+index" class="request-item" @tap="navigateToProjectDetail(item)">
					<view class="request-status" :class="{
						'status-pending': item.status === 0,
						'status-accepted': item.status === 1 || (item.status === 3 && item.result === 1) || (item.status === 4 && item.result === 1),
						'status-rejected': item.status === 2 || (item.status === 3 && item.result === 2) || (item.status === 4 && item.result === 2),
						'status-unread': item.status === 3
					}">
						<text v-if="item.status === 0">待审核</text>
						<text v-else-if="item.status === 1 || (item.status === 3 && item.result === 1) || (item.status === 4 && item.result === 1)">已通过(待定)</text>
						<text v-else-if="item.status === 2 || (item.status === 3 && item.result === 2) || (item.status === 4 && item.result === 2)">已拒绝</text>
					</view>
					
					
					<view class="request-header">
						<image src="/static/team-1.jpg" class="project-image" mode="aspectFit"></image>
						<view class="request-title">
							<text class="title">{{ item.title || '未知项目' }}</text>
							<text class="subtitle">我申请加入</text>
						</view>
					</view>
					
					<view class="request-content">
						<view class="info-item">
							<text class="label">申请时间：</text>
							<text class="value">{{ $tools.formatDateTime(item.create_time, 'YYYY/mm/dd HH:MM') }}</text>
						</view>
						<view class="info-item">
							<text class="label">项目创建者：</text>
							<text class="value">{{ item.creator_name || '未知' }}</text>
						</view>
						<view class="info-item">
							<text class="label">申请内容：</text>
							<text class="value">{{ item.comment || item.description || '(无申请内容)' }}</text>
						</view>
						
						<!-- 显示拒绝理由 -->
						<view v-if="(item.status === 2 || item.status === 3 || item.status === 4) && item.result === 2 && item.reject_reason" class="info-item reject-reason">
							<text class="label">拒绝理由：</text>
							<text class="value">{{ item.reject_reason }}</text>
						</view>
					</view>
					
					<view class="divider"></view>
					
					<view class="request-footer">
						<!-- 如果是未读状态，显示标记为已读按钮 -->
						<view v-if="item.status === 3" class="mark-read-btn" @tap.stop="markRequestAsRead(item)">
							<text class="mark-read-text">标记为已读</text>
						</view>
						<text v-else class="view-details">点击查看项目详情</text>
						<text class="icon diy-icon-right"></text>
					</view>
				</view>
			</block>
			
			<!-- 我收到的申请列表 -->
			<block v-else>
				<view v-for="(item, index) in globalData.request_list" :key="'received-'+index" class="request-item">
					<view class="request-status" :class="{
						'status-pending': item.status === 0,
						'status-accepted': item.status === 1 || (item.status === 3 && item.result === 1) || (item.status === 4 && item.result === 1),
						'status-rejected': item.status === 2 || (item.status === 3 && item.result === 2) || (item.status === 4 && item.result === 2)
					}">
						<text v-if="item.status === 0">待审核</text>
						<text v-else-if="item.status === 1 || (item.status === 3 && item.result === 1) || (item.status === 4 && item.result === 1)">已通过(待定)</text>
						<text v-else-if="item.status === 2 || (item.status === 3 && item.result === 2) || (item.status === 4 && item.result === 2)">已拒绝</text>
						<text v-else>{{ item.status === 0 ? '待审核' : (item.status === 1 ? '已通过' : '已拒绝') }}</text>
					</view>
					
					<view class="request-header">
						<image :src="item.applicant_avatar || '/static/team-1.jpg'" class="user-avatar" mode="aspectFit"></image>
						<view class="request-title">
							<view class="applicant-info">
								<text class="applicant-name">{{ item.applicant_name || '申请者' }}</text>
								<text class="applicant-type">{{ item.applicant_type || '学生' }}</text>
							</view>
							<text class="subtitle">申请加入 <text class="highlight">{{ item.title }}</text></text>
						</view>
					</view>
					
					<view class="applicant-detail">
						<text class="section-title">申请人信息</text>
						<view class="info-grid">
							<view class="info-item">
								<text class="label">姓名：</text>
								<text class="value">{{ item.applicant_name || '未填写' }}</text>
							</view>
							<view class="info-item">
								<text class="label">类型：</text>
								<text class="value">{{ item.applicant_type || '未填写' }}</text>
							</view>
						</view>
						
						<text class="section-title">申请简介</text>
						<view class="description">
							<text>{{ item.comment || item.description || '申请者未填写申请简介' }}</text>
						</view>
						
						<view class="info-item">
							<text class="label">申请时间：</text>
							<text class="value">{{ $tools.formatDateTime(item.create_time, 'YYYY/mm/dd HH:MM') }}</text>
						</view>
					</view>
					
					<!-- 审核按钮 -->
					<view v-if="item.status === 0" class="action-buttons">
						<button @tap.stop="rejectApplication(item, index)" class="btn btn-reject">拒绝</button>
						<button @tap.stop="approveApplication(item, index)" class="btn btn-approve">通过</button>
					</view>
					
					<!-- 已处理状态信息 -->
					<view v-else class="status-info">
						<text v-if="item.status === 1 || (item.status === 3 && item.result === 1) || (item.status === 4 && item.result === 1)" class="status-text approved">已通过该申请，用户已设为待定成员</text>
						<text v-else-if="item.status === 2 || (item.status === 3 && item.result === 2) || (item.status === 4 && item.result === 2)" class="status-text rejected">已拒绝该申请</text>
					</view>
				</view>
			</block>
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
					request_list: []
				},
				requestMode: 'received', // 默认显示我收到的申请
				requestLoading: false, // 申请数据加载状态
				received_list: [],
				sent_list: []
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
				this.requestLoading = true;
				
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				
				// 根据当前模式加载数据
				if (this.requestMode === 'received') {
					await this.loadReceivedRequestList();
				} else {
					await this.loadRequestList();
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
			
			// 切换申请模式（我发出的/我收到的）
			changeRequestMode(mode) {
				if (this.requestMode === mode) return;
				
				// 先清空数据并设置加载状态
				this.globalData.request_list = [];
				this.requestLoading = true;
				this.$forceUpdate(); // 强制更新视图
				
				// 显示加载
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				
				// 然后修改模式
				this.requestMode = mode;
				
				// 加载数据
				if (mode === 'received') {
					// 加载我收到的申请
					this.loadReceivedRequestList();
				} else {
					// 加载我发出的申请
					this.loadRequestList();
				}
			},
			
			// 加载我收到的申请
			async loadReceivedRequestList() {
				try {
					console.log('开始加载他人对我的项目的申请列表...');
					this.requestLoading = true;
					
					const db = uniCloud.database();
					const myUser = this.$session.getUserValue('user_id');
					
					// 获取我创建的项目
					const myProjectsRes = await db.collection('xm-stp-project')
						.where({ user_id: myUser })
						.field('_id')
						.get();
					
					const myProjects = myProjectsRes.result?.data || [];
					if (!myProjects.length) {
						console.log('未找到您创建的项目');
						this.globalData.request_list = [];
						this.requestLoading = false;
						return;
					}
					
					const projectIds = myProjects.map(p => p._id);
					console.log('您创建的项目IDs:', projectIds);
					
					// 获取这些项目的申请记录 - 确保获取result字段
					const requestsRes = await db.collection('xm-stp-project_app_request')
						.where({
							project_id: db.command.in(projectIds)
						})
						.field('_id, user_id, project_id, create_time, comment, status, result, reject_reason')
						.orderBy('create_time', 'desc')
						.get();
					
					const requests = requestsRes.result?.data || [];
					if (!requests.length) {
						console.log('未找到申请记录');
						this.globalData.request_list = [];
						this.requestLoading = false;
						// 确保设置消息状态更新标志
						uni.setStorageSync('message_status_updated', true);
						return;
					}
					
					console.log('找到申请记录数量:', requests.length);
					console.log('申请记录详情:', JSON.stringify(requests));
					
					// 获取项目详情
					const projectsDetailsRes = await db.collection('xm-stp-project_detail')
						.where({
							_id: db.command.in(projectIds)
						})
						.field('_id,title,type,person_needed,requirements')
						.get();
					
					const projectDetails = projectsDetailsRes.result?.data || [];
					
					// 获取申请者信息
					const userIds = requests.map(req => req.user_id);
					const usersRes = await db.collection('xm-stp-user_detail')
						.where({
							_id: db.command.in([...new Set(userIds)])
						})
						.field('_id,real_name,username,avatar,user_type')
						.get();
					
					const users = usersRes.result?.data || [];
					
					// 合并数据
					const requestList = requests.map(req => {
						const project = projectDetails.find(p => p._id === req.project_id) || {};
						const applicant = users.find(u => u._id === req.user_id) || {};
						
						// 处理状态显示逻辑
						let displayStatus = req.status;
						// 如果状态是3或4，查看result字段
						if ((req.status === 3 || req.status === 4) && req.result) {
							displayStatus = req.result === 1 ? 1 : 2; // 转换为对应的已接受/已拒绝状态
						}
						
						return {
							...req,
							title: project.title || '未知项目',
							type: project.type || '项目协作',
							requirements: project.requirements || [],
							person_needed: project.person_needed || 10,
							applicant_name: applicant.real_name || applicant.username || '申请者',
							applicant_avatar: applicant.avatar || '/static/team-1.jpg',
							applicant_type: applicant.user_type || '学生',
							view_count: 0, // 默认值
							status: displayStatus, // 使用处理后的状态
							display_status: displayStatus, // 额外添加显示状态字段
							request_type: 'received' // 标记这是收到的申请
						};
					});
					
					this.globalData.request_list = requestList;
					console.log('成功加载他人对我的申请列表, 条数:', requestList.length);
					
					// 确保设置消息状态更新标志
					uni.setStorageSync('message_status_updated', true);
				} catch (error) {
					console.error('加载他人对我的申请列表失败', error);
					this.showToast('加载申请列表失败');
					this.globalData.request_list = [];
				} finally {
					this.requestLoading = false;
					uni.hideLoading();
				}
			},
			
			// 加载我的申请列表
			async loadRequestList() {
				try {
					console.log('开始加载我的申请列表...');
					this.requestLoading = true;
					
					// 获取当前用户ID
					const myUser = this.$session.getUserValue('user_id');
					
					try {
						// 尝试用云函数获取我的申请列表
						const res = await uniCloud.callFunction({
							name: 'get_user_requests',
							data: { user_id: myUser }
						});
						
						if (res.result && res.result.status === 1 && res.result.data) {
							this.globalData.request_list = res.result.data;
							console.log('最终申请列表条数:', this.globalData.request_list.length);
							
							// 确保设置消息状态更新标志
							uni.setStorageSync('message_status_updated', true);
						} else {
							// 如果云函数返回为空，使用备用方法
							await this.loadRequestListFallback(myUser);
						}
					} catch (error) {
						console.error('通过云函数获取数据失败:', error);
						// 使用备用方法获取
						await this.loadRequestListFallback(myUser);
					}
				} catch (error) {
					console.error('加载申请列表失败', error);
					this.showToast('加载申请列表失败');
				} finally {
					this.requestLoading = false;
					uni.hideLoading();
				}
			},
			
			// 备用方法：申请列表加载
			async loadRequestListFallback(userId) {
				try {
					console.log('使用备用方法加载申请列表...');
					const db = uniCloud.database();
					
					// 直接从申请表获取记录
					const res = await db.collection('xm-stp-project_app_request')
						.where({
							user_id: userId
						})
						.get();
					
					const requests = res.result?.data || [];
					if (!requests.length) {
						console.log('未找到申请记录');
						this.globalData.request_list = [];
						
						// 确保设置消息状态更新标志
						uni.setStorageSync('message_status_updated', true);
						return;
					}
					
					// 获取申请的项目详情
					const projectIds = requests.map(req => req.project_id);
					const projectsRes = await db.collection('xm-stp-project_detail')
						.where({
							_id: db.command.in(projectIds)
						})
						.field('_id,title,person_needed')
						.get();
					
					const projects = projectsRes.result?.data || [];
					
					// 获取项目的创建者信息
					const projectInfoRes = await db.collection('xm-stp-project')
						.where({
							_id: db.command.in(projectIds)
						})
						.field('_id,user_id')
						.get();
					
					const projectInfos = projectInfoRes.result?.data || [];
					
					// 提取所有创建者ID
					const creatorIds = [];
					projectInfos.forEach(proj => {
						if (proj.user_id) creatorIds.push(proj.user_id);
					});
					
					// 如果有创建者ID，获取创建者信息
					let creators = [];
					if (creatorIds.length > 0) {
						const creatorsRes = await db.collection('xm-stp-user_detail')
							.where({
								_id: db.command.in([...new Set(creatorIds)])
							})
							.field('_id,real_name,username')
							.get();
						
						creators = creatorsRes.result?.data || [];
					}
					
					// 合并项目信息到申请
					const requestList = requests.map(req => {
						const project = projects.find(p => p._id === req.project_id) || {};
						const projectInfo = projectInfos.find(p => p._id === req.project_id) || {};
						let creatorName = '项目创建者';
						
						// 查找创建者名字
						if (projectInfo.user_id) {
							const creator = creators.find(c => c._id === projectInfo.user_id);
							if (creator) {
								creatorName = creator.real_name || creator.username || '项目创建者';
							}
						}
						
						return {
							...req,
							title: project.title || '未知项目',
							person_needed: project.person_needed,
							creator_name: creatorName,
							user_id: projectInfo.user_id,
							project_id: req.project_id,
							type: 'request'
						};
					});
					
					this.globalData.request_list = requestList;
					console.log('备用方法处理后的申请列表条数:', requestList.length);
					
					// 确保设置消息状态更新标志
					uni.setStorageSync('message_status_updated', true);
				} catch (error) {
					console.error('备用方法加载失败:', error);
					this.globalData.request_list = [];
				}
			},
			
			// 导航到项目详情页面
			navigateToProjectDetail(item) {
				if (!item || (!item.project_id && !item._id)) {
					console.error('项目ID不存在:', item);
					this.showToast('项目信息不完整');
					return;
				}
				
				const projectId = item.project_id || item._id;
				console.log('跳转到项目详情页面, 项目ID:', projectId);
				
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${projectId}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
						// 如果跳转失败，尝试备用方式
						this.navigateTo({
							type: 'page',
							url: '/pages/project/detail/others',
							id: projectId
						});
					}
				});
			},
			
			// 审核申请 - 拒绝
			async rejectApplication(item, index) {
				try {
					console.log('准备拒绝申请', item);
					
					// 先询问是否拒绝
					uni.showModal({
						title: '确认操作',
						content: `确定要拒绝 ${item.applicant_name} 的申请吗？`,
						success: (res) => {
							if (res.confirm) {
								// 如果确认拒绝，再弹出拒绝理由输入框
								this.showRejectReasonInput(item, index);
							}
						}
					});
				} catch (error) {
					console.error('拒绝申请失败', error);
					this.showToast('拒绝申请失败，请重试');
				}
			},
			
			// 显示拒绝理由输入框
			showRejectReasonInput(item, index) {
				uni.showModal({
					title: '填写拒绝理由',
					content: '请输入拒绝理由（可选）：',
					editable: true,
					placeholderText: '请输入拒绝理由',
					success: async (res) => {
						if (res.confirm) {
							// 用户点击确定，执行拒绝操作
							uni.showLoading({
								title: '处理中...',
								mask: true
							});
							
							try {
								// 使用云对象完成整个拒绝申请流程，不再分开操作
								const result = await uniCloud.importObject('ProjectAction').rejectUserRequest({
									project_id: item.project_id,
									user_id: item.user_id,
									operator_id: this.$session.getUserValue('user_id'), // 当前操作用户ID（项目创建者）
									reject_reason: res.content || '' // 如果没有输入，则为空字符串
								});
								
								uni.hideLoading();
								
								if (result && result.status === 1) {
									this.showToast('已拒绝申请');
									
									// 设置消息状态已更新的标记
									uni.setStorageSync('message_status_updated', true);
									
									// 更新当前项目的状态为"已拒绝"
									if (this.globalData.request_list[index]) {
										this.globalData.request_list[index].status = 2;
										this.globalData.request_list[index].reject_reason = res.content || '';
										this.$forceUpdate(); // 强制视图更新
									}
									
									// 延时重新加载列表，确保数据同步
									setTimeout(() => {
										this.loadReceivedRequestList();
									}, 1000);
								} else {
									this.showToast('操作失败: ' + (result?.msg || '未知错误'));
								}
							} catch (error) {
								uni.hideLoading();
								console.error('拒绝申请失败', error);
								this.showToast('操作失败: ' + error.message);
							}
						}
					}
				});
			},
			
			// 审核申请 - 通过
			async approveApplication(item, index) {
				try {
					console.log('准备通过申请', item);
					
					uni.showModal({
						title: '确认操作',
						content: `确定要通过 ${item.applicant_name} 的申请吗？`,
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '处理中...',
									mask: true
								});
								
								try {
									// 使用云对象完成整个通过申请流程
									// approveUserRequest函数会自动处理将用户添加到项目成员的逻辑
									const result = await uniCloud.importObject('ProjectAction').approveUserRequest({
										project_id: item.project_id,
										user_id: item.user_id,
										operator_id: this.$session.getUserValue('user_id') // 当前操作用户ID（项目创建者）
									});
									
									uni.hideLoading();
									
									// 判断操作是否成功或者通知系统出现错误
									if (result && result.status === 1) {
										this.showToast('已通过申请');
										this.handleSuccessfulApproval(index);
									} else {
										// 检查错误信息是否与通知相关
										if (result && result.msg && (result.msg.includes('sendProjectNotification') || result.msg.includes('通知'))) {
											console.warn('操作实际已成功，但发送通知失败:', result.msg);
											this.showToast('已通过申请');
											this.handleSuccessfulApproval(index);
										} else {
											this.showToast('操作失败: ' + (result?.msg || '未知错误'));
										}
									}
								} catch (error) {
									uni.hideLoading();
									console.error('通过申请失败', error);
									
									// 检查错误是否与通知相关
									if (error && error.message && (error.message.includes('sendProjectNotification') || error.message.includes('通知'))) {
										console.warn('操作实际已成功，但发送通知失败:', error.message);
										this.showToast('已通过申请');
										this.handleSuccessfulApproval(index);
									} else {
										this.showToast('操作失败: ' + error.message);
									}
								}
							}
						}
					});
				} catch (error) {
					console.error('通过申请失败', error);
					this.showToast('通过申请失败，请重试');
				}
			},
			
			// 处理成功通过申请后的界面更新
			handleSuccessfulApproval(index) {
				// 设置消息状态已更新的标记
				uni.setStorageSync('message_status_updated', true);
				
				// 更新当前项目的状态为"已通过"
				if (this.globalData.request_list[index]) {
					this.globalData.request_list[index].status = 1;
					this.$forceUpdate(); // 强制视图更新
				}
				
				// 延时重新加载列表，确保数据同步
				setTimeout(() => {
					this.loadReceivedRequestList();
				}, 1000);
			},
			
			// 修改标记已读方法，使用云函数
			async markRequestAsRead(item) {
				console.log('标记申请为已读，当前状态:', item.status, '项目ID:', item.project_id, '请求ID:', item._id);
				
				if (!item || !item._id) {
					console.error('消息ID不存在');
					return;
				}
				
				// 只处理状态为3的消息
				if (item.status !== 3) {
					console.log('当前消息状态不是3，无需标记为已读');
					uni.showToast({
						title: '该消息已处理',
						icon: 'none'
					});
					return;
				}
				
				uni.showLoading({
					title: '正在处理'
				});
				
				try {
					// 获取当前用户ID
					const userId = this.$session.getUserValue('user_id');
					if (!userId) {
						throw new Error('未获取到用户ID');
					}
					
					console.log('准备调用云函数，用户ID:', userId, '请求ID:', item._id);
					
					// 调用云函数
					const res = await uniCloud.callFunction({
						name: 'mark_request_as_read',
						data: {
							request_id: item._id,
							user_id: userId
						}
					});
					
					console.log('标记已读结果:', JSON.stringify(res.result));
					
					if (res.result && res.result.code === 0) {
						// 更新本地数据
						const index = this.globalData.request_list.findIndex(req => req._id === item._id);
						if (index !== -1) {
							console.log('更新本地状态，原状态:', this.globalData.request_list[index].status, '新状态:', res.result.status);
							this.globalData.request_list[index].status = res.result.status;
							this.$forceUpdate(); // 强制刷新视图
						}
						
						uni.showToast({
							title: '已标记为已读',
							icon: 'none'
						});
						
						// 确保设置消息状态更新标志，用于首页刷新计数
						uni.setStorageSync('message_status_updated', true);
					} else {
						uni.showToast({
							title: res.result?.msg || '标记失败，请重试',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('标记已读出错:', err);
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 批量标记已读
			async markAllAsRead() {
				if (!this.globalData.request_list || this.globalData.request_list.length === 0) {
					uni.showToast({
						title: '没有需要标记的消息',
						icon: 'none'
					});
					return;
				}
				
				uni.showLoading({
					title: '正在处理'
				});
				
				// 获取当前用户ID
				const userId = this.$session.getUserValue('user_id');
				if (!userId) {
					uni.hideLoading();
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
					return;
				}
				
				// 找出需要标记的消息
				let needMarkItems = this.globalData.request_list.filter(item => {
					// 如果是接收到的申请，只标记状态为0的
					if (this.requestMode === 'received') {
						return item.status === 0;
					} 
					// 如果是发出的申请，只标记状态为3的
					else {
						return item.status === 3;
					}
				});
				
				if (needMarkItems.length === 0) {
					uni.hideLoading();
					uni.showToast({
						title: '没有需要标记的消息',
						icon: 'none'
					});
					return;
				}
				
				try {
					// 创建标记请求的Promise数组
					let markPromises = needMarkItems.map(item => {
						return uniCloud.callFunction({
							name: 'mark_request_as_read',
							data: {
								request_id: item._id,
								user_id: userId
							}
						});
					});
					
					// 并行处理所有标记请求
					const results = await Promise.all(markPromises);
					console.log('批量标记结果:', results);
					
					let successCount = 0;
					
					// 更新本地状态
					results.forEach((res, index) => {
						if (res.result && res.result.code === 0) {
							const itemId = needMarkItems[index]._id;
							const listIndex = this.globalData.request_list.findIndex(item => item._id === itemId);
							
							if (listIndex !== -1) {
								this.globalData.request_list[listIndex].status = res.result.status;
							}
							
							successCount++;
						}
					});
					
					uni.showToast({
						title: `成功标记${successCount}条消息为已读`,
						icon: 'none'
					});
					
					// 确保设置消息状态更新标志，用于首页刷新计数
					if (successCount > 0) {
						uni.setStorageSync('message_status_updated', true);
					}
				} catch (err) {
					console.error('批量标记已读出错:', err);
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 点击查看详情时标记为已读
			async markAsRead(item) {
				try {
					// 判断消息是否需要标记为已读
					let needMark = false;
					
					if (this.requestMode === 'received' && item.status === 0) { // 收到的申请，状态为0
						needMark = true;
					} else if (this.requestMode === 'sent' && item.status === 3) { // 发出的申请，状态为3
						needMark = true;
					}
					
					if (!needMark) return;
					
					// 获取当前用户ID
					const userId = this.$session.getUserValue('user_id');
					if (!userId) {
						throw new Error('未获取到用户ID');
					}
					
					// 调用云函数标记为已读
					const res = await uniCloud.callFunction({
						name: 'mark_request_as_read',
						data: {
							request_id: item._id,
							user_id: userId
						}
					});
					
					if (res.result && res.result.code === 0) {
						console.log('标记成功');
						// 更新列表中的状态
						const index = this.globalData.request_list.findIndex(req => req._id === item._id);
						if (index !== -1) {
							this.globalData.request_list[index].status = res.result.status;
						}
						
						// 确保设置消息状态更新标志
						uni.setStorageSync('message_status_updated', true);
					} else {
						console.error('标记失败', res.result?.msg);
					}
				} catch (e) {
					console.error('标记已读出错', e);
				}
			},
			
			// 查看申请详情
			viewDetail(item) {
				// 先标记为已读
				this.markAsRead(item);
				
				// 跳转到详情页面，或者在当前页面展示详情
				uni.showModal({
					title: '申请详情',
					content: `项目: ${item.title || '未知项目'}\n${item.description || '无描述'}\n${item.status === 2 ? '拒绝理由: ' + (item.reject_reason || '无') : ''}`,
					showCancel: false
				});
			},
			
			// 加载我收到的申请
			async loadReceivedRequest() {
				// ... existing code ...
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
	
	/* 申请列表 */
	.request-list {
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
	
	.request-item {
		position: relative;
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.request-status {
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
	
	.status-unread {
		background-color: #007aff;
		color: #ffffff;
	}
	
	.request-header {
		display: flex;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.project-image, .user-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 16rpx;
	}
	
	.user-avatar {
		border-radius: 40rpx;
	}
	
	.request-title {
		flex: 1;
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
	
	.applicant-info {
		display: flex;
		align-items: center;
	}
	
	.applicant-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.applicant-type {
		margin-left: 10rpx;
		font-size: 24rpx;
		color: #ffffff;
		background-color: #007aff;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}
	
	.request-content {
		padding: 20rpx 0;
	}
	
	.info-item {
		display: flex;
		margin-bottom: 10rpx;
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
	
	.divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 10rpx 0;
	}
	
	.request-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 10rpx;
	}
	
	.view-details {
		font-size: 26rpx;
		color: #007aff;
	}
	
	.icon {
		font-size: 24rpx;
		color: #007aff;
	}
	
	/* 申请人详情 */
	.applicant-detail {
		padding: 20rpx 0;
	}
	
	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.info-grid {
		display: flex;
		flex-wrap: wrap;
		background-color: #f9f9f9;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.info-grid .info-item {
		width: 50%;
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
	
	/* 拒绝理由样式 */
	.reject-reason {
		margin-top: 10rpx;
		padding: 10rpx;
		background-color: #FFF9F9;
		border-radius: 8rpx;
		border-left: 6rpx solid #ff3b30;
	}
	
	.reject-reason .label {
		color: #ff3b30;
		font-weight: bold;
	}
	
	.reject-reason .value {
		color: #ff3b30;
	}
	
	/* 未读标记样式 */
	.unread-marker {
		position: absolute;
		top: 60rpx;
		right: 20rpx;
		display: flex;
		align-items: center;
		background-color: #ff3b30;
		color: #ffffff;
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}
	
	.unread-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background-color: #ffffff;
		margin-right: 8rpx;
	}
	
	/* 标记为已读按钮样式 */
	.mark-read-btn {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 30rpx;
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.mark-read-text {
		font-size: 28rpx;
	}
	
	/* 未读标记样式 */
	.unread-text {
		margin-left: 10rpx;
	}
	
	/* 增加状态信息样式 */
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
</style> 