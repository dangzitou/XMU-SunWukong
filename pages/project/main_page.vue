<template>
	<view class="container container332681">
		<!-- 搜索栏 -->
		<view class="flex flex-wrap diygw-col-24">
			<view class="flex diygw-col-24">
				<view class="diygw-search">
					<view class="flex1 align-center flex padding-xs solid radius">
						<text style="color: #555 !important" class="diy-icon-search"></text>
						<input class="flex1" name="search" type="text" v-model="search" placeholder="搜索项目" />
					</view>
					<view style="color: #333 !important" 
						  class="diygw-tag margin-left-xs radius-xs"
						  @tap="handleSearch">
						搜索
					</view>
				</view>
			</view>
			<!-- 当前筛选类型提示 -->
			<view v-if="currentFilter" class="filter-indicator">
				<text>当前筛选: {{ currentFilter }}</text>
				<text class="clear-filter" @tap="clearFilter">清除筛选</text>
			</view>
		</view>

		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex diygw-col-24">
				<view class="diygw-grid col-4">
					<view class="diygw-grid-item" @tap="filterByType('项目协作')" :class="{'active-filter': currentFilter === '项目协作'}">
						<view class="diygw-grid-inner">
							<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
								<image mode="aspectFit" class="diygw-avatar-img" src="/static/cxcp.png"></image>
							</view>
							<view class="diygw-grid-title"> 项目协作 </view>
						</view>
					</view>
					<view class="diygw-grid-item" @tap="filterByType('竞赛组队')" :class="{'active-filter': currentFilter === '竞赛组队'}">
						<view class="diygw-grid-inner">
							<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
								<image mode="aspectFit" class="diygw-avatar-img" src="/static/cy3.png"></image>
							</view>
							<view class="diygw-grid-title"> 竞赛组队 </view>
						</view>
					</view>
					<view class="diygw-grid-item" @tap="filterByType('科研招募')" :class="{'active-filter': currentFilter === '科研招募'}">
						<view class="diygw-grid-inner">
							<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
								<image mode="aspectFit" class="diygw-avatar-img" src="/static/dc.png"></image>
							</view>
							<view class="diygw-grid-title"> 科研招募 </view>
						</view>
					</view>
					<view class="diygw-grid-item" @tap="filterByType('大创计划')" :class="{'active-filter': currentFilter === '大创计划'}">
						<view class="diygw-grid-inner">
							<view class="diygw-grid-icon diygw-avatar grid-icon-clz">
								<image mode="aspectFit" class="diygw-avatar-img" src="/static/zh.png"></image>
							</view>
							<view class="diygw-grid-title"> 大创计划 </view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 项目列表 -->
		<view v-for="(item, index) in globalData.list" :key="index" 
			class="flex flex-wrap diygw-col-24 flex-direction-column flex7-clz"
			@tap="navigateToProjectDetail(item)">
			<view class="flex flex-wrap diygw-col-24 items-stretch">
				<view class="flex flex-wrap diygw-col-0 flex-direction-column justify-between flex6-clz">
					<view class="flex flex-wrap diygw-col-0 items-center">
						<text class="diygw-col-0 text3-clz">{{ item.title }}</text>
					</view>
					<view class="flex flex-wrap diygw-col-0 items-center flex10-clz">
						<text class="diygw-col-0 text4-clz"></text>
						<image :src="item.avatar ? item.avatar.url : '/static/team-1.jpg'" class="image1-size diygw-image diygw-col-0 image1-clz" mode="widthFix"></image>
						<text class="diygw-col-0 text6-clz">{{ item.type === 'teacher' ? '导师发起' : '学生发起' }}</text>
						<text class="diygw-col-0 text6-clz">{{ item.project_cat ? item.project_cat.name : (item.type || '科技创新') }}</text>
					</view>
				</view>
				<image :src="getProjectTypeImage(item.project_cat?.name)" class="image2-size diygw-image diygw-col-0 image2-clz" mode="widthFix"></image>
			</view>
			<view class="flex flex-wrap diygw-col-24 justify-between items-center flex12-clz">
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="diygw-col-0">要求：</text>
					<text v-for="(requirement, idx) in getRequirements(item)" :key="idx"
						:class="['diygw-col-0', idx === 0 ? 'text8-clz' : idx === 1 ? 'text-clz' : 'text9-clz']">
						{{ requirement }}
					</text>
				</view>
				<view class="flex flex-wrap diygw-col-0 items-center">
					<text class="flex icon diygw-col-0 diy-icon-attention"></text>
					<text class="diygw-col-0">{{ item.view_count || 0 }}</text>
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
		</view>

		<!-- 项目详情弹窗 -->
		<view @touchmove.stop.prevent="" v-if="modal" class="diygw-modal bottom-modal" :class="modal" style="z-index: 1000000">
			<view class="diygw-dialog diygw-dialog-modal">
				<view class="justify-end diygw-bar">
					<view class="content"> 项目描述 </view>
					<view class="action" data-type="closemodal" data-id="modal" @tap="navigateTo">
						<text class="diy-icon-close"></text>
					</view>
				</view>
				<view>
					<view class="flex diygw-dialog-content">
						<text class="diygw-col-24 text1-clz diygw-text-md">
							{{ globalData.showProjectDetail.title }}
						</text>
						<text v-if="globalData.showProjectDetail.comp_name" class="diygw-col-24 diygw-text-sm"> 竞赛：{{ globalData.showProjectDetail.comp_name }} </text>
						<text class="diygw-col-24 diygw-text-sm"> 招募人数： {{ globalData.showProjectDetail.person_needed }} </text>
						<text class="diygw-col-24 diygw-text-sm" v-if="globalData.showProjectDetail.detail"> 已加入： {{ globalData.showProjectDetail.detail.person_pending }} </text>
						<text class="diygw-col-24 diygw-text-sm"> 项目创建时间: {{ $tools.formatDateTime(globalData.showProjectDetail.create_time, 'YYYY-mm-dd HH:MM') }} </text>
						<text class="diygw-col-24 diygw-text-sm"> 项目结束时间: {{ $tools.formatDateTime(globalData.showProjectDetail.ending_time, 'YYYY-mm-dd HH:MM') }} </text>
						<mp-html v-if="globalData.showProjectDetail.detail" :content="globalData.showProjectDetail.detail.description" class="diygw-col-24 ucontent1-clz"></mp-html>
						<button v-show="!globalData.showProjectDetail.in_project && globalData.showProjectDetail.ending_time > secondFunction()" @tap="openRequestModalFunction" class="diygw-col-24 btn-clz diygw-btn-default">申请加入</button>
						<button v-show="!(globalData.showProjectDetail.ending_time > secondFunction())" class="diygw-col-24 btn1-clz diygw-btn-default">已过期</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 申请加入弹窗 -->
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
							<u-input maxlength="200" height="60px" class="" placeholder="自我介绍（请介绍自己以提升被选中的可能性）" v-model="self_introduce" type="textarea"></u-input>
						</u-form-item>
					</view>
				</view>
				<view class="flex justify-end">
					<button @tap="requestToJoinFunction" class="diygw-btn green flex1 margin-xs">申请</button>
				</view>
			</view>
		</view>

		<view class="flex diygw-col-0 right-bottom floatbar-clz">
			<view class="diygw-grid diygw-actions">
				<button class="diygw-action" @tap="navigateTo" data-type="page" data-url="/pages/project/add">
					<view class="diygw-grid-inner">
						<view class="diygw-grid-icon diygw-avatar diy-icon-roundaddfill" style="color: #07c160"> </view>
						<view class="diygw-grid-title"></view>
					</view>
				</button>
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
					list: [],
					allProjects: [], // 存储所有项目，用于筛选
					projectList: {},
					showProjectDetail: {}
				},
				search: '',
				currentFilter: '', // 当前筛选的项目类型
				projectTypeImages: {
					'项目协作': '/static/zh.png',
					'竞赛组队': '/static/cy3.png',
					'科研招募': '/static/dc.png',
					'大创计划': '/static/cxcp.png'
				},
				tabsDatas: [],
				tabsIndex: 0,
				modal: '',
				modal1: '',
				self_introduce: ''
			};
		},
		onShow() {
			this.setCurrentPage(this);
			// 每次页面显示时都重新加载项目数据
			this.getListFunction();
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
			async getListFunction() {
				try {
					// 获取项目类型列表
					const catRes = await uniCloud.importObject('Initialize').getProjectCategory();
					console.log('项目分类:', catRes.data);
					
					// 初始化项目列表数据结构
					this.globalData.projectList = {};
					this.tabsDatas = [];
					
					// 为每个项目类型创建数据结构
					for (const i in catRes.data) {
						this.tabsDatas.push({
							text: catRes.data[i].name,
							icon: ''
						});
						this.globalData.projectList[catRes.data[i].name] = {
							data: [],
							load: 0
						};
					}
					
					// 使用getAllProjects获取所有项目数据
					const projectsRes = await uniCloud.importObject('Project').getAllProjects();
					console.log('获取所有项目数据:', projectsRes);
					
					if (projectsRes.status !== 1 || !Array.isArray(projectsRes.data)) {
						console.error('获取所有项目失败:', projectsRes.msg);
						uni.showToast({
							title: projectsRes.msg || '获取项目列表失败',
							icon: 'error'
						});
						return;
					}
					
					// 将项目按类型分组
					const allProjects = projectsRes.data;
					this.globalData.allProjects = allProjects;
					
					// 初始设置完整列表
					this.globalData.list = allProjects;
					
					// 按类型分组项目
					for (const project of allProjects) {
						const categoryName = project.project_cat?.name;
						if (categoryName && this.globalData.projectList[categoryName]) {
							this.globalData.projectList[categoryName].data.push(project);
							this.globalData.projectList[categoryName].load = 1;
						}
					}
					
					console.log(`总共加载了 ${allProjects.length} 个项目`);
				} catch (error) {
					console.error('获取项目数据失败:', error);
					uni.showToast({
						title: '获取项目列表失败',
						icon: 'error'
					});
				}
			},
			getProjectTypeImage(type) {
				return this.projectTypeImages[type] || '/static/cxcp.png';
			},
			getRequirements(item) {
				const requirements = [];
				if (item.student_type) requirements.push(item.student_type);
				if (item.major) requirements.push(item.major);
				if (item.skills) requirements.push(item.skills);
				return requirements;
			},
			// 修改自实现日期格式化函数，处理秒级时间戳
			formatDateTime(timestamp, format) {
				if (!timestamp) return '';
				
				try {
					// 关键修改：判断时间戳类型并转换
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
			// 修改后的截止日期函数
			endingDateReturnFunction(param) {
				try {
					if (!param || !param.ending_time) {
						return '未设置';
					}
					
					// 打印原始日期，用于调试
					console.log('原始ending_time:', param.ending_time, typeof param.ending_time);
					
					// 使用修改后的格式化函数
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
			// 搜索功能
			async handleSearch() {
				if (!this.search.trim()) {
					// 如果搜索框为空，根据当前筛选条件还原列表
					if (this.currentFilter) {
						this.filterByType(this.currentFilter);
					} else {
						this.globalData.list = this.globalData.allProjects;
					}
					return;
				}

				try {
					const searchText = this.search.trim().toLowerCase();
					
					// 在所有项目中搜索，而不是当前标签页
					const filteredProjects = this.globalData.allProjects.filter(project => {
						return project.title && project.title.toLowerCase().includes(searchText);
					});
					
					this.globalData.list = filteredProjects;

					// 清除当前筛选状态，因为搜索结果可能跨越多个分类
					this.currentFilter = '';

					uni.showToast({
						title: `找到 ${filteredProjects.length} 个项目`,
						icon: 'none'
					});
				} catch (error) {
					console.error('搜索失败:', error);
					uni.showToast({
						title: '搜索失败',
						icon: 'error'
					});
				}
			},
			// 根据项目类型筛选
			async filterByType(type) {
				// 如果点击的是当前已筛选的类型，则取消筛选
				if (this.currentFilter === type) {
					this.currentFilter = '';
					
					// 重新设置为所有项目列表
					this.globalData.list = this.globalData.allProjects;
					
					uni.showToast({
						title: '已显示所有项目',
						icon: 'none'
					});
					return;
				}
				
				// 设置当前筛选类型
				this.currentFilter = type;
				
				try {
					// 显示加载中
					uni.showLoading({
						title: '筛选中...',
						mask: true
					});
					
					// 从已获取的项目列表中筛选对应类型的项目
					const filteredProjects = this.globalData.allProjects.filter(project => 
						project.project_cat && project.project_cat.name === type
					);
					
					// 更新显示列表
					this.globalData.list = filteredProjects;
					
					// 显示筛选结果
					uni.showToast({
						title: `已筛选 ${filteredProjects.length} 个${type}项目`,
						icon: 'none'
					});
					
					uni.hideLoading();
				} catch (error) {
					console.error('筛选失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '筛选失败',
						icon: 'error'
					});
				}
			},
			clearFilter() {
				this.currentFilter = '';
				
				// 重新加载所有项目列表
				this.globalData.list = this.globalData.allProjects;
				
				uni.showToast({
					title: '已显示所有项目',
					icon: 'none'
				});
			},
			// 添加新方法用于加载所有项目
			async loadAllProjects() {
				try {
					// 显示加载中
					uni.showLoading({
						title: '加载中...',
						mask: true
					});
					
					// 重新获取所有项目
					const res = await uniCloud.importObject('Project').getAllProjects();
					
					if (res.status === 0) {
						console.error('获取项目列表失败:', res.msg);
						uni.hideLoading();
						uni.showToast({
							title: res.msg || '获取项目列表失败',
							icon: 'error'
						});
						return;
					}
					
					// 更新项目列表
					this.globalData.allProjects = res.data;
					this.globalData.list = res.data;
					
					console.log(`总共加载了 ${res.data.length} 个项目`);
					
					uni.hideLoading();
				} catch (error) {
					console.error('加载所有项目失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '加载项目失败',
						icon: 'error'
					});
				}
			},
			showAllProjectTypes() {
				// 收集所有项目类型
				const allTypes = new Set();
				this.globalData.allProjects.forEach(project => {
					if (project.project_cat && project.project_cat.name) {
						allTypes.add(project.project_cat.name);
					}
				});
				
				// 将Set转换为数组并排序
				const typesArray = Array.from(allTypes).sort();
				
				// 显示所有项目类型
				if (typesArray.length > 0) {
					uni.showModal({
						title: '所有项目类型',
						content: typesArray.join('\n'),
						showCancel: false,
						confirmText: '确定'
					});
				} else {
					uni.showToast({
						title: '没有找到项目类型',
						icon: 'none'
					});
				}
			},
			// 切换分类时调用
			async changeTabs(evt) {
				let { index } = evt.currentTarget.dataset;
				if (index == this.tabsIndex) return;
				this.setData({
					tabsIndex: index
				});
				await this.getProjectListFunction({}); // 使用新的方法获取项目
			},
			// 展现项目详情
			async showProjectDetailFunction(param) {
				try {
					const index = param.index;
					console.log('显示项目详情:', param.id, index);
					
					this.globalData.showProjectDetail = this.globalData.list[index];
					
					if (!this.globalData.showProjectDetail.hasOwnProperty('detail')) {
						const res = await uniCloud.importObject('Project').getDetailFromList({
							id: param.id
						});
						
						if (res.status == 0) {
							uni.showToast({
								title: res.msg,
								icon: 'error',
								duration: 2000
							});
							return;
						}
						
						this.globalData.showProjectDetail['detail'] = res.data;
					}
					
					// 打开详情模态框
					this.modal = 'show';
				} catch (error) {
					console.error('获取项目详情失败:', error);
					uni.showToast({
						title: '获取项目详情失败',
						icon: 'error'
					});
				}
			},
			// 打开申请加入模块
			async openRequestModalFunction() {
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
				
				this.modal = '';
				this.modal1 = 'show';
			},
			// 申请加入项目
			async requestToJoinFunction() {
				try {
					const res = await uniCloud.importObject('ProjectAction').requestJoin({
						project_id: this.globalData.showProjectDetail._id,
						introduce: this.self_introduce,
						user_id: this.$session.getUserValue('user_id')
					});
					
					uni.showToast({
						icon: res.status ? 'success' : 'error',
						title: res.msg
					});
					
					if (res.status == 1) {
						this.modal1 = '';
						this.self_introduce = '';
					}
				} catch (error) {
					console.error('申请加入失败:', error);
					uni.showToast({
						title: '申请加入失败',
						icon: 'error'
					});
				}
			},
			// 秒timestamp 自定义方法
			secondFunction() {
				const timestampMs = Date.now();
				const timestampSeconds = Math.floor(timestampMs / 1000);
				return timestampSeconds;
			},
			navigateToProjectDetail(item) {
				// 跳转到项目详情页面
				uni.navigateTo({
					url: `/pages/project/project_detail?id=${item._id}`,
					success: () => {
						console.log('成功跳转到项目详情页');
					},
					fail: (err) => {
						console.error('跳转到项目详情页失败:', err);
						// 如果跳转失败，可以回退到原来的模态框显示方式
						this.showProjectDetailFunction({id: item._id, index: this.globalData.list.findIndex(p => p._id === item._id)});
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.flex9-clz {
		margin-left: 0rpx;
		flex: 1;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 20rpx;
		border-bottom: 2rpx solid #eee;
		margin-right: 0rpx;
	}
	.grid-item-clz {
	}
	.grid-icon-clz {
		font-size: 36px !important;
	}
	.floatbar-clz {
		transform: translate(0rpx, 0rpx) scale(2, 2);
		bottom: 200rpx;
		width: 80rpx !important;
		right: 60rpx;
		z-index: 900;
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
		margin-bottom: 0;
	}
	.flex-direction-column {
		flex-direction: column;
	}
	.items-end {
		align-items: flex-end;
	}
	.active-filter {
		background-color: #f0f0f0;
	}
	.filter-indicator {
		margin-left: 10rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
		padding: 10rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		background-color: #f0f0f0;
	}
	.clear-filter {
		margin-left: 10rpx;
		color: #07c160;
		font-size: 28rpx;
		font-weight: bold;
	}
	.creator-name {
		background-color: #e6f7ff !important;
		color: #0066cc !important;
		border: 1px solid #91d5ff !important;
	}
	.show-types-container {
		margin-top: 10rpx;
		margin-left: 10rpx;
		padding: 10rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		background-color: #f0f0f0;
	}
	.show-types-btn {
		color: #07c160;
		font-size: 28rpx;
		font-weight: bold;
	}
	
	/* 弹窗样式 */
	.diygw-modal {
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
	}
	
	.diygw-modal.show {
		opacity: 1;
		transition-duration: 0.3s;
		-ms-transform: scale(1);
		transform: scale(1);
		overflow-x: hidden;
		overflow-y: auto;
		pointer-events: auto;
	}
	
	.diygw-dialog {
		position: relative;
		margin: 0 auto;
		max-width: 100%;
		background-color: #ffffff;
		border-radius: 10rpx;
		overflow: hidden;
	}
	
	.diygw-modal.bottom-modal .diygw-dialog {
		width: 100%;
		border-radius: 0;
		position: absolute;
		bottom: 0;
	}
	
	.diygw-dialog-content {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}
	
	.diygw-bar {
		min-height: 100rpx;
		box-sizing: border-box;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #eee;
	}
	
	.btn-clz {
		background-color: #07c160;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 20rpx auto 0;
		width: 100%;
		text-align: center;
	}
	
	.btn1-clz {
		background-color: #cccccc;
		color: #ffffff;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		margin: 20rpx auto 0;
		width: 100%;
		text-align: center;
	}
	
	.text1-clz {
		font-size: 30rpx !important;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	
	.ucontent1-clz {
		flex-shrink: 0;
		width: 100% !important;
		font-size: 26rpx !important;
		margin-top: 20rpx;
	}
</style>
