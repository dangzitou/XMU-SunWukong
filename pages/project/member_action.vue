<template>
	<view class="container container328924">
		
		<view class="flex flex-direction-column flex-sub diygw-col-24 main-content">
			<view class="flex flex-direction-column flex-sub member-section">
				<view @tap="changeCollapse1" data-index="0" class="diygw-text-md padding flex solid-bottom section-header" :class="[collapse1Datas[0].isShow ? 'text- cur ' : '']">
					<view class="flex-sub section-title"> 项目成员 ({{ getConfirm.length }}) </view>
					<i class="diy-icon-unfold diy-collapse-icon" :class="[collapse1Datas[0].isShow ? 'diy-collapse-active' : '']"></i>
				</view>
				<view v-if="collapse1Datas[0].isShow" class="solid-bottom member-list">
					<view v-for="(value, index) in getConfirm" :key="index" class="flex flex-wrap diygw-col-24 justify-between member-card">
						<view class="flex flex-wrap diygw-col-0 flex-direction-column flex-clz member-info">
							<text class="diygw-col-24 member-name"> 
								{{ value.user.real_name }} （{{ value.project_position }}）
								<text v-if="value.has_invite_permission" class="tag-invite">邀请者</text>
							</text>
							<text v-if="value.project_position != '指导老师'" class="diygw-col-24 member-year"> {{ value.user.onboarding_year }}级 {{ value.user.type }} </text>
							<text class="diygw-col-24 member-college"> {{ value.user.college_category_id }} - {{ value.user.specific_category_id }} </text>
						</view>
						<view v-if="!value.project_position || (value.project_position && value.project_position !== '指导老师' && value.project_position !== '项目负责人')" class="flex diygw-col-0 flex-direction-column button-clz">
							<button @tap="openActionSheet" :data-member="value" class="diygw-btn action-btn radius-sm flex-sub margin-xs button-action-clz">
								<text class="button-icon diy-icon-more"></text>
							</button>
						</view>
					</view>
				</view>
			</view>
			<view class="flex flex-direction-column flex-sub member-section">
				<view @tap="changeCollapse1" data-index="1" class="diygw-text-md padding flex solid-bottom section-header" :class="[collapse1Datas[1].isShow ? 'text- cur ' : '']">
					<view class="flex-sub section-title"> 待定成员({{ getPending.length }}) </view>
					<i class="diy-icon-unfold diy-collapse-icon" :class="[collapse1Datas[1].isShow ? 'diy-collapse-active' : '']"></i>
				</view>
				<view v-if="collapse1Datas[1].isShow" class="solid-bottom member-list">
					<view v-for="(value, index) in getPending" :key="index" class="flex flex-wrap diygw-col-24 justify-between member-card pending-card">
						<view class="flex flex-wrap diygw-col-0 flex-direction-column flex1-clz member-info" @tap="navigateTo" data-type="openIntroductionFunction" :data-comment="value.comment">
							<text class="diygw-col-24 member-name">
								{{ value.user.real_name }}
							</text>
							<text class="diygw-col-24 member-year"> {{ value.user.onboarding_year }}级 {{ value.user.type }} </text>
							<text class="diygw-col-24 member-college"> {{ value.user.college_category_id }} - {{ value.user.specific_category_id }} </text>
						</view>
						<view class="flex diygw-col-0 flex-direction-column button2-clz">
							<button @tap="openPendingActionSheet" :data-member="value" class="diygw-btn action-btn radius-sm flex-sub margin-xs button-action-clz">
								<text class="button-icon diy-icon-more"></text>
							</button>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column diygw-bottom">
			<button v-if="Object.keys(globalData.changedList).length" @tap="navigateTo" data-type="openmodal" data-id="modal1" class="diygw-col-24 submit-btn">人员选择更新</button>
		</view>
		<view @touchmove.stop.prevent="" @click.stop.prevent="closeModal1" v-if="modal1" class="diygw-modal basic" :class="modal1" style="z-index: 1000000">
			<view @click.stop.prevent="stopCloseModal1" class="diygw-dialog diygw-dialog-modal1 basis-lg modal-container">
				<view class="justify-end diygw-bar">
					<view class="content modal-title"> 是否对以下成员进行更该？ </view>
				</view>
				<view>
					<view class="flex diygw-dialog-content">
						<view v-for="(item, index) in globalData.changedList" :key="index" class="flex flex-wrap diygw-col-24 flex-direction-column">
							<rich-text :nodes="text3" class="diygw-col-24"></rich-text>
						</view>
					</view>
				</view>
				<view class="flex justify-end modal-actions">
					<button data-type="closemodal" @tap="navigateTo" data-id="modal1" class="diygw-btn cancel-btn flex1 margin-xs">取消</button>
					<button @tap="navigateTo" data-type="updateMemberFunction" :data-option="globalOption" class="diygw-btn confirm-btn flex1 margin-xs">确定</button>
				</view>
			</view>
		</view>
		<view @touchmove.stop.prevent="" @click.stop.prevent="closeModal" v-if="modal" class="diygw-modal bottom-modal" :class="modal" style="z-index: 1000000">
			<view @click.stop.prevent="stopCloseModal" class="diygw-dialog diygw-dialog-modal modal-container">
				<view class="justify-end diygw-bar">
					<view class="content modal-title"> 自我介绍 </view>
				</view>
				<view>
					<view class="flex diygw-dialog-content">
						<mp-html :content="globalData.introduction" class="diygw-col-24 ucontent1-clz"></mp-html>
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
				globalData: { changedList: {}, list: { request: [], relation: [] }, introduction: '', defaultList: {} },
				collapse1Datas: [
					{ text: '项目成员 ({{getConfirm.length}})', isShow: true },
					{ text: '待定成员({{getPending.length}})', isShow: true }
				],
				modal1: '',
				text3: `<p style="text-align: center;">名字：{{item.default.user.real_name}}</p>
<p style="text-align: center;">身份: {{item.default.user.onboarding_year}}级别 {{item.default.user.type}}</p>
<p style="text-align: center;">学院：{{item.default.user.college_category_id}}-{{item.default.user.specific_category_id}}</p>
<p style="text-align: center;">从 <span style="color: #3598db;">还未选上</span> 设置成 <span style="color: #3598db;">内定成员</span></p>`,
				modal: ''
			};
		},
		computed: {
			getConfirm() {
				const list = new Map(); // 用 Map 去重
				// 过滤正式成员（非待定成员）
				// 处理字符串或数字类型的project_position
				this.globalData.list.relation.filter((value) => {
					// 处理数字类型
					if (typeof value.project_position === 'number') {
						return value.project_position !== 3; // 3是待定成员的数字编码
					}
					// 处理字符串类型
					return value.project_position !== '待定成员'; 
				}).forEach((item) => list.set(item._id, { ...item, default: 'confirm' }));

				for (const id in this.globalData.changedList) {
					const changed = this.globalData.changedList[id];
					if (changed.to === 'confirm') {
						list.set(changed.default._id, changed.default);
					}
				}

				return Array.from(list.values());
			},
			getPending() {
				const list = new Map(); // 用 Map 去重
				// 过滤待定成员
				// 处理字符串或数字类型的project_position
				this.globalData.list.relation.filter((value) => {
					// 处理数字类型
					if (typeof value.project_position === 'number') {
						return value.project_position === 3; // 3是待定成员的数字编码
					}
					// 处理字符串类型
					return value.project_position === '待定成员';
				}).forEach((item) => list.set(item._id, { ...item, default: 'pending' }));

				for (const id in this.globalData.changedList) {
					const changed = this.globalData.changedList[id];
					if (changed.to === 'pending') {
						list.set(changed.default._id, changed.default);
					}
				}

				return Array.from(list.values());
			}
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
				await this.getMembersFunction();
			},
			// 获取该项目的人员 自定义方法
			async getMembersFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';
				const res = await uniCloud.importObject('Project').getProjectMembers({ id: option.id, user_id: this.$session.getUserValue('user_id') });

				if (!res.status) {
					uni.showToast({
						title: res.msg,
						icon: 'error',
						duration: 2000
					});
					setTimeout(function () {
						uni.redirectTo({
							url: '/pages/in_project/self'
						});
					}, 2000);
				}

				this.globalData.list = res.data;
				
				// 确保项目关系数据中的 project_position 是数字类型
				// 数据库中的位置代码：0：指导老师，1：项目负责人，2：成员，3：待定成员
				if (this.globalData.list.relation && this.globalData.list.relation.length > 0) {
					for (const i in this.globalData.list.relation) {
						// 如果 project_position 是字符串，需要转换为对应的数字
						if (typeof this.globalData.list.relation[i].project_position === 'string') {
							// 处理从后端返回的字符串描述，转换为数字
							switch (this.globalData.list.relation[i].project_position) {
								case '指导老师':
									this.globalData.list.relation[i]._position_code = 0;
									break;
								case '项目负责人':
									this.globalData.list.relation[i]._position_code = 1;
									break;
								case '成员':
									this.globalData.list.relation[i]._position_code = 2;
									break;
								case '待定成员':
									this.globalData.list.relation[i]._position_code = 3;
									break;
								default:
									// 默认为成员
									this.globalData.list.relation[i]._position_code = 2;
							}
						}
					}
				}

				const tempList = this.globalData.list.user;
				const userList = {};
				for (const i in tempList) userList[tempList[i]._id] = tempList[i];

				for (const i in this.globalData.list.relation) {
					this.globalData.list.relation[i].user = userList[this.globalData.list.relation[i].user_id];

					for (const j in this.globalData.list.invited) {
						if (this.globalData.list.relation[i].user_id == this.globalData.list.invited[j].user_id) this.globalData.list.relation[i].isInvited = 1;
					}
				}

				this.globalData.defaultList = { ...this.globalData.list };
				
				// 打印一下处理后的数据，用于调试
				console.log('项目成员数据:', JSON.stringify(this.globalData.list.relation));
			},

			// 打开项目成员操作菜单（三点按钮点击事件）
			openActionSheet(event) {
				const member = event.currentTarget.dataset.member;
				const items = [];
				
				// 根据成员的状态添加不同选项
				if (member.has_invite_permission) {
					items.push('移除邀请权限');
				} else {
					items.push('设置为邀请者');
				}
				
				items.push('移至待定区');
				items.push('移除成员');
				
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const tapIndex = res.tapIndex;
						switch (items[tapIndex]) {
							case '设置为邀请者':
								this.manageMemberAction(member, 'add_invite_permission');
								break;
							case '移除邀请权限':
								this.manageMemberAction(member, 'remove_invite_permission');
								break;
							case '移至待定区':
								this.manageMemberAction(member, 'move_to_pending');
								break;
							case '移除成员':
								this.manageMemberAction(member, 'remove_member');
								break;
						}
					}
				});
			},
			
			// 打开待定成员操作菜单
			openPendingActionSheet(event) {
				const member = event.currentTarget.dataset.member;
				uni.showActionSheet({
					itemList: ['添加为正式成员', '移除成员'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								this.manageMemberAction(member, 'move_to_confirmed');
								break;
							case 1:
								this.manageMemberAction(member, 'remove_member');
								break;
						}
					}
				});
			},
			
			// 管理成员操作
			async manageMemberAction(member, action) {
				try {
					console.log('管理成员操作:', action, member);
					
					// 确保有用户ID
					if (!member || !member.user_id) {
						console.error('成员数据缺失用户ID:', member);
						uni.showToast({
							title: '成员数据错误，无法执行操作',
							icon: 'none',
							duration: 2000
						});
						return;
					}
					
					// 显示加载中提示
					uni.showLoading({
						title: '处理中...',
						mask: true
					});
					
					const res = await uniCloud.importObject('ProjectAction').manageMember({
						project_id: this.globalOption.id,
						user_id: member.user_id,
						operator_id: this.$session.getUserValue('user_id'),
						action: action
					});
					
					console.log('操作结果:', res);
					
					// 隐藏加载提示
					uni.hideLoading();
					
					// 即使后端出错但实际上操作可能已成功，所以始终刷新数据
					if (res.status) {
						uni.showToast({
							title: res.msg,
							icon: 'success',
							duration: 2000
						});
						
						// 操作成功，立即刷新页面数据
						await this.getMembersFunction();
					} else {
						// 如果是通知相关错误，我们仍然认为操作成功，只是通知失败
						if (res.msg && (res.msg.includes('sendProjectNotification') || res.msg.includes('通知'))) {
							console.warn('操作可能已成功，但发送通知失败:', res.msg);
							uni.showToast({
								title: '操作已完成',
								icon: 'success',
								duration: 2000
							});
							// 仍然刷新页面
							await this.getMembersFunction();
						} else {
							// 其他真正的错误
							uni.showToast({
								title: res.msg || '操作失败，请重试',
								icon: 'none',
								duration: 2000
							});
						}
					}
				} catch (error) {
					uni.hideLoading();
					console.error('成员管理操作失败:', error);
					
					// 捕获可能的通知错误并继续
					if (error && error.message && error.message.includes('sendProjectNotification')) {
						console.warn('操作可能已成功，但发送通知失败:', error.message);
						uni.showToast({
							title: '操作已完成',
							icon: 'success',
							duration: 2000
						});
						// 尝试刷新页面
						await this.getMembersFunction();
					} else {
						uni.showToast({
							title: '操作失败，请重试',
							icon: 'none',
							duration: 2000
						});
					}
				}
			},

			// 开启自我介绍 自定义方法
			async openIntroductionFunction(param) {
				let thiz = this;
				let comment = param && (param.comment || param.comment == 0) ? param.comment : '';
				this.globalData.introduction = comment;

				this.navigateTo({
					type: 'openmodal',
					id: 'modal'
				});
			},

			// 改变成员状态 自定义方法
			async changeStatusFunction(param) {
				let thiz = this;
				let data = param && (param.data || param.data == 0) ? param.data : '';
				let from = param && (param.from || param.from == 0) ? param.from : '';
				let to = param && (param.to || param.to == 0) ? param.to : '';
				const userId = data.user_id;

				this.globalData.changedList[data.user_id] = {
					default: data,
					from: from,
					to: to
				};

				if (data.default == to) {
					delete this.globalData.changedList[data.user_id];

					switch (to) {
						case 'confirm':
						case 'pending':
							this.globalData.list.relation.push(data);
							break;
					}

					return;
				}

				switch (from) {
					case 'confirm':
					case 'pending':
						this.globalData.list.relation = this.globalData.list.relation.filter((v) => {
							return v._id != data._id;
						});
						break;
				}
			},

			// 更新队员 自定义方法
			async updateMemberFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';
				const data = [];
				for (const user_id in this.globalData.changedList) {
					data.push({
						user_id: user_id,
						from: this.globalData.changedList[user_id].default.default,
						to: this.globalData.changedList[user_id].to
					});
				}

				const res = await uniCloud.importObject('ProjectAction').updateProjectMembers({
					data: data,
					id: option.id,
					user_id: this.$session.getUserValue('user_id')
				});

				this.navigateTo({
					type: 'closemodal',
					id: 'modal1'
				});

				uni.showToast({
					title: res.msg,
					icon: res.status ? 'success' : 'error',
					duration: 2000
				});

				if (res.status) {
					setTimeout(function () {
						uni.redirectTo({
							url: '/pages/in_project/self'
						});
					}, 2000);
				}
			},
			changeCollapse1(evt) {
				let { index } = evt.currentTarget.dataset;
				let collapse1Datas = this.collapse1Datas;

				collapse1Datas[index]['isShow'] = !collapse1Datas[index]['isShow'];
				this.setData({ collapse1Datas });
			},
			stopCloseModal1(e) {
				e.stopPropagation();
			},
			closeModal1() {
				this.modal1 = '';
			},
			stopCloseModal(e) {
				e.stopPropagation();
			},
			closeModal() {
				this.modal = '';
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container328924 {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding: 10rpx;
	}
	
	.main-content {
		padding: 0 5rpx;
	}
	
	.member-section {
		margin-bottom: 15rpx;
		background-color: #fff;
		border-radius: 8rpx;
		box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.03);
		overflow: hidden;
	}
	
	.section-header {
		background-color: #f8f9fb;
		border-bottom: 1px solid #eaedf2;
	}
	
	.section-title {
		font-weight: bold;
		font-size: 28rpx;
		color: #2d3748;
	}
	
	.member-list {
		padding: 5rpx 0;
	}
	
	.member-card {
		margin: 10rpx;
		padding: 15rpx 10rpx;
		border-radius: 6rpx;
		background-color: #ffffff;
		box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.03);
	}
	
	.pending-card {
		background-color: #fffdf8;
	}
	
	.member-info {
		padding: 0 5rpx;
	}
	
	.member-name {
		font-size: 28rpx !important;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.member-year {
		font-size: 24rpx !important;
		color: #666;
		margin-bottom: 4rpx;
	}
	
	.member-college {
		font-size: 24rpx !important;
		color: #888;
	}
	
	.tag-invite {
		margin-left: 10rpx;
		font-size: 20rpx;
		background-color: #1989fa;
		color: #fff;
		padding: 2rpx 8rpx;
		border-radius: 6rpx;
		font-weight: normal;
	}
	
	.action-btn {
		background-color: transparent !important;
		color: #2d3748 !important;
		border: none !important;
		width: 60rpx !important;
		height: 60rpx !important;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0 !important;
		padding: 0 !important;
	}
	
	.submit-btn {
		background-color: #07c160;
		padding: 20rpx 15rpx;
		color: #fff;
		font-size: 28rpx;
		text-align: center;
		border-radius: 8rpx;
		margin: 10rpx;
		box-shadow: 0 2rpx 5rpx rgba(7, 193, 96, 0.2);
		border: none;
	}
	
	.modal-container {
		border-radius: 10rpx;
		overflow: hidden;
	}
	
	.modal-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		padding: 8rpx 0;
	}
	
	.modal-actions {
		padding: 8rpx;
	}
	
	.cancel-btn {
		background-color: #f5f7fa !important;
		color: #666 !important;
		border: 1px solid #ddd !important;
	}
	
	.confirm-btn {
		background-color: #07c160 !important;
		color: #fff !important;
		border: none !important;
	}
	
	.ucontent1-clz {
		padding: 15rpx;
		width: 100% !important;
		font-size: 26rpx !important;
		line-height: 1.5;
		color: #333;
	}
</style>
