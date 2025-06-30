<template>
	<view class="container container328924">
		<view v-for="(item, index) in globalData.list" :key="index" class="flex flex-wrap diygw-col-24 flex-direction-column justify-center items-center">
			<view class="flex flex-wrap diygw-col-24 flex5-clz">
				<view class="flex flex-wrap diygw-col-16 flex-direction-column">
					<text class="diygw-col-0 text1-clz">
						{{ item.title }}
					</text>
					<text class="diygw-col-0 text2-clz"> 项目类型：{{ item.type }} </text>
					<text v-if="item.comp" class="diygw-col-0 text8-clz"> 竞赛：{{ item.comp }} </text>
					<text v-if="item.comp_name" class="diygw-col-0 text-clz"> 竞赛：{{ item.comp_name }} </text>
					<text class="diygw-col-24 text3-clz"> 申请者： {{ item.person_needed }} 人 </text>
					<text class="diygw-col-24 text4-clz"> 加入者： {{ item.person_request ?? 0 }} 人 </text>
					<text class="diygw-col-24 text6-clz"> 创建时间： {{ $tools.formatDateTime(item.create_time, 'YYYY-mm-dd HH:MM') }} </text>
					<text class="diygw-col-24 text7-clz"> 结束时间： {{ $tools.formatDateTime(item.ending_time, 'YYYY-mm-dd HH:MM') }} </text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-start flex4-clz">
					<view class="flex flex-wrap diygw-col-24 flex-direction-row-reverse">
						<text class="diygw-col-0 text5-clz">
							{{ item.status }}
						</text>
					</view>
					<view class="flex flex-wrap diygw-col-24 flex-direction-row-reverse flex15-clz">
						<text v-if="!item.target_status && item.ending_time > secondFunction()" @tap="navigateTo" data-type="openInviteModalFunction" :data-item="item" class="diygw-col-16 text26-clz"> 邀请加入 </text>
						<text v-if="item.target_status" class="diygw-col-0 text11-clz">
							{{ item.target_status }}
						</text>
					</view>
				</view>
			</view>
		</view>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<text v-if="!globalData.list.length" class="diygw-col-24 text10-clz diygw-text-md"> 你还没有可邀请项目呢 </text>
		</view>
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
							<u-input maxlength="200" height="60px" class="" placeholder="自我推荐（通过推荐自己）" v-model="self_introduce" type="textarea"></u-input>
						</u-form-item>
					</view>
				</view>
				<view class="flex justify-end">
					<button @tap="navigateTo" data-type="inviteToProjectFunction" :data-option="globalOption" class="diygw-btn green flex1 margin-xs">申请</button>
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
				globalData: { list: [], showProjectDetail: {} },
				modal1: '',
				self_introduce: ''
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

			// 获取自身的项目列表 自定义方法
			async getListFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';
				const res = await uniCloud.importObject('Project').getSelf({ user_id: this.$session.getUserValue('user_id'), target_user: option.user_id });

				if (res.status == 0) {
					uni.showToast({
						title: res.msg,
						icon: 'error',
						duration: 2000
					});
					setTimeout(function () {
						uni.redirectTo({
							url: '/pages/home'
						});
					}, 2000);
				}

				this.globalData.list = res.data;
			},

			// 邀请加入项目 自定义方法
			async inviteToProjectFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';

				// 显示加载中
				uni.showLoading({
					title: '发送邀请中...',
					mask: true
				});

				try {
					// 先检查当前用户是否有权限邀请
					const currentUserId = this.$session.getUserValue('user_id');
					const projectId = this.globalData.showProjectDetail._id;

					// 检查是否是项目创建者
					let hasPermission = this.globalData.showProjectDetail.user_id === currentUserId;

					// 如果不是创建者，检查是否有邀请权限
					if (!hasPermission) {
						// 获取用户在项目中的角色和权限
						const memberRelations = await uniCloud.importObject('ProjectAction').getJoinList({
							user_id: currentUserId,
							project_id: projectId
						});

						if (memberRelations.status === 1 && memberRelations.data && Array.isArray(memberRelations.data)) {
							// 查找当前用户的项目关系
							const userRelation = memberRelations.data.find(relation =>
								relation.user_id === currentUserId &&
								relation.project_id === projectId &&
								relation.type === 'position'
							);

							// 检查是否有邀请权限
							hasPermission = userRelation && userRelation.has_invite_permission === true;
						}
					}

					if (!hasPermission) {
						uni.hideLoading();
						uni.showToast({
							title: '您没有邀请权限',
							icon: 'error',
							duration: 2000
						});
						return;
					}

					// 使用ProjectAction.inviteJoin方法发送邀请
					const res = await uniCloud.importObject('ProjectAction').inviteJoin({
						self_introduce: this.self_introduce,
						proj_id: projectId,
						user_id: option.user_id,
						self_user: currentUserId
					});

					uni.hideLoading();

					// 处理结果
					if (res) {
						uni.showToast({
							title: res.msg,
							icon: res.status ? 'success' : 'error'
						});

						if (res.status) {
							this.self_introduce = '';
							// 使用Vue的$set方法更新状态，避免直接修改字符串属性
							this.$set(this.globalData.showProjectDetail, 'target_status', '已被邀请');

							this.navigateTo({
								type: 'closemodal',
								id: 'modal1'
							});
						}
					} else {
						uni.showToast({
							title: '邀请发送失败',
							icon: 'error'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('邀请发送失败:', error);
					uni.showToast({
						title: '邀请发送失败: ' + (error.message || '未知错误'),
						icon: 'error'
					});
				}
			},

			// 开启邀请加入·弹窗 自定义方法
			async openInviteModalFunction(param) {
				let thiz = this;
				let item = param && (param.item || param.item == 0) ? param.item : thiz.item || '';
				this.navigateTo({
					type: 'openmodal',
					id: 'modal1'
				});

				this.globalData.showProjectDetail = item;
			},

			// 秒timestamp 自定义方法
			secondFunction(param) {
				let thiz = this;
				const timestampMs = Date.now();
				const timestampSeconds = Math.floor(timestampMs / 1000);
				return timestampSeconds;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex5-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text1-clz {
		margin-left: 10rpx;
		font-size: 26rpx !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text2-clz {
		margin-left: 10rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text8-clz {
		margin-left: 10rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text-clz {
		margin-left: 10rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text3-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text4-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text6-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.text7-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.flex4-clz {
		flex: 1;
	}
	.text5-clz {
		padding-top: 2rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 10rpx;
		padding-bottom: 10rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #e5eae5;
		margin-left: 10rpx;
		flex-shrink: 0;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		height: 40rpx !important;
		padding-right: 10rpx;
	}
	.flex15-clz {
		margin-left: 2rpx;
		flex-shrink: 0;
		left: 0rpx;
		bottom: 0rpx;
		width: calc(100% - 2rpx - 0rpx) !important;
		margin-top: 0rpx;
		position: absolute;
		margin-bottom: 6rpx;
		height: 60rpx !important;
		margin-right: 0rpx;
	}
	.text26-clz {
		margin-left: 10rpx;
		border: 2rpx solid #aba6a6;
		flex-shrink: 0;
		padding-top: 4rpx;
		padding-left: 20rpx;
		width: calc(66.6666666667% - 10rpx - 10rpx) !important;
		padding-bottom: 4rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		height: 46rpx !important;
		margin-right: 10rpx;
		padding-right: 12rpx;
	}
	.text11-clz {
		padding-top: 2rpx;
		border-bottom-left-radius: 12rpx;
		padding-left: 10rpx;
		padding-bottom: 10rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #e5eae5;
		margin-left: 10rpx;
		flex-shrink: 0;
		overflow: hidden;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		height: 40rpx !important;
		padding-right: 10rpx;
	}
	.text10-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		text-align: center;
		margin-right: 10rpx;
	}
	.modal1-clz {
		z-index: 1000000;
	}
	.diygw-dialog-modal1 {
	}
	.container328924 {
	}
</style>
