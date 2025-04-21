<template>
	<view class="container container332681">
		<u-form-item labelWidth="auto" class="diygw-col-24 title-clz" :required="true" label="主题：" prop="title">
			<u-input v-model="globalData.detail.title" placeholder="输入您的主题"></u-input>
		</u-form-item>
		<u-form-item labelWidth="auto" class="diygw-col-24" label="项目类型：" prop="project_type">
			<diy-selectinput disabled="true" class="diygw-col-24" valueName="value" labelName="label" :list="project_typeDatas" placeholder="请选择" v-model="project_type" type="select"></diy-selectinput>
			<u-select mode="single-column" valueName="value" labelName="label" :list="project_typeDatas" isDefaultSelect :defaultSelectValue="project_type" v-model="showProject_type" @confirm="changeProject_type"></u-select>
		</u-form-item>
		<u-form-item :required="true" class="diygw-col-24" label="学院选择" prop="college_type">
			<diy-selectinput @click="showCollege_type = true" class="diygw-col-24" placeholder="请选择" valueName="value" labelName="label" :list="college_typeDatas" v-model="college_type" type="select"></diy-selectinput>
			<diy-select mode="checkbox" activeColor="#39b54a" placeholder="请输入搜索关键词" valueName="value" labelName="label" :list="college_typeDatas" :defaultValue="college_type" v-model="showCollege_type" @confirm="changeCollege_type"></diy-select>
		</u-form-item>
		<u-form-item class="diygw-col-24" :required="true" label="要求人数" prop="person_needed">
			<u-input v-model="globalData.detail.person_needed" placeholder="请输入要求人数" type="number"></u-input>
		</u-form-item>
		<u-form-item class="diygw-col-24" label="结束时间" :required="true" prop="ending_date">
			<u-input @click="showEnding_date = true" class="" placeholder="请选择" v-model="ending_date" type="select"></u-input>
			<u-calendar :minDate="minDate" v-model="showEnding_date" :dateValue="ending_date" maxDate="2050-12-31" @change="changeEnding_date"></u-calendar>
		</u-form-item>
		<u-form-item class="diygw-col-24" label="是否发布" prop="release">
			<u-radio-group class="flex flex-wrap diygw-col-24 justify-start" wrapClass=" justify-start" v-model="release">
				<u-radio class="diygw-col-12" shape="circle" v-for="(releaseitem, releaseindex) in releaseDatas" :key="releaseindex" :name="releaseitem.value">
					{{ releaseitem.label }}
				</u-radio>
			</u-radio-group>
		</u-form-item>
		<text class="diygw-col-24 text1-clz"> 详情 </text>
		<u-form-item :borderBottom="false" class="diygw-col-24 description-clz" labelPosition="top" prop="description">
			<diy-editor height="500px" v-model="description"></diy-editor>
		</u-form-item>
		<view class="submit-container">
			<button class="global-button" @tap="updateProjectFunction">提交</button>
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
				globalData: { oldDetail: {}, minDate: '', detail: {} },
				title: '',
				showProject_type: false,
				project_typeDatas: [{ value: '3', label: '选项三' }],

				project_type: '',
				showCollege_type: false,
				college_typeDatas: [{ value: '3', label: '管理学院' }],
				college_type: [],
				person_needed: 5,
				showEnding_date: false,
				ending_date: '',
				releaseDatas: [
					{ value: '0', label: '草稿箱', checked: false },
					{ value: '1', label: '发布', checked: false }
				],
				release: 'undefined',
				description: ''
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
				this.getCatListFunction();
				await this.getProjectDetailFunction();
			},
			async initShow() {
				this.getCurrentDateFunction();
				await this.checkLoginFunction();
			},
			// 获取类别列表 自定义方法
			async getCatListFunction(param) {
				let thiz = this;

				const res = await uniCloud.importObject('Initialize').getCategoryForAdd();
				const projCat = res.data.proj;
				const collegeCat = res.data.coll;
				this.project_typeDatas = [];
				this.college_typeDatas = [];
				for (const index in projCat) this.project_typeDatas.push({ value: projCat[index]._id, label: projCat[index].name });

				for (const index in collegeCat) this.college_typeDatas.push({ value: collegeCat[index]._id, label: collegeCat[index].name });
			},

			// 获取今日日期 自定义方法
			getCurrentDateFunction(param) {
				let thiz = this;
				const today = new Date();

				// 获取年份
				const year = today.getFullYear();

				// 获取月份（注意：月份从0开始，所以需要加1）
				const month = String(today.getMonth() + 1).padStart(2, '0');

				// 获取日期
				const day = String(today.getDate()).padStart(2, '0');

				// 组合成 YYYY-MM-DD 格式
				this.minDate = `${year}-${month}-${day}`;
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

			// 获取项目详情 自定义方法
			async getProjectDetailFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';
				const res = await uniCloud.importObject('Project').getDetailForUpdate({ id: option.id, user_id: this.$session.getUserValue('user_id') });

				this.globalData.detail = res.data;
				res.data.status = res.data.status.toString();
				res.data.ending_time = this.$tools.formatDateTime(res.data.ending_time, 'YYYY-mm-dd');

				this.globalData.oldDetail = { ...res.data };
				this.project_type = res.data.type_id;

				this.ending_date = res.data.ending_time;

				this.release = res.data.status;

				this.description = res.data.description;

				this.college_type = res.data.academyList;
			},

			// 更新项目 自定义方法
			async updateProjectFunction(param) {
				let thiz = this;
				let title = param && (param.title || param.title == 0) ? param.title : thiz.globalData.detail.title || '';
				let person_needed = param && (param.person_needed || param.person_needed == 0) ? param.person_needed : thiz.globalData.detail.person_needed || '';
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : thiz.ending_date || '';
				let type_id = param && (param.type_id || param.type_id == 0) ? param.type_id : thiz.project_type || '';
				let status = param && (param.status || param.status == 0) ? param.status : thiz.release || '';
				let description = param && (param.description || param.description == 0) ? param.description : thiz.description || '';
				let academyList = param && (param.academyList || param.academyList == 0) ? param.academyList : thiz.college_type || '';
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';
				const data = { title, person_needed: parseInt(person_needed), ending_time, type_id, status, description, academyList };

				var flag = 0;
				for (const key in data) {
					if (data[key] != this.globalData.oldDetail[key]) {
						console.log(key, data[key]);
						flag = 1;
						break;
					}
				}

				if (flag == 0) {
					uni.showToast({
						title: '参数没变过，不需要更新',
						icon: 'error'
					});
					return;
				}

				const res = await uniCloud.importObject('Project').updateProject({ ...data, ...{ user_id: this.$session.getUserValue('user_id'), id: option.id } });

				uni.showToast({
					title: res.msg,
					icon: res.status == 0 ? 'error' : 'success'
				});
				if (res.status == 1) {
					this.globalData.oldDetail = { ...data };
				}
			},
			changeProject_type(evt) {
				evt.map((val, index) => {
					this.project_type = val.value;
				});
			},
			changeCollege_type(evt) {
				let values = [];
				evt.forEach((item) => {
					values.push(item.value);
				});
				this.college_type = values;
			},
			changeEnding_date(evt) {
				this.ending_date = evt.result;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.title-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
	.text1-clz {
		margin-left: 10rpx;
		font-weight: bold;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.description-clz {
		margin-left: 10rpx;
		border: 2rpx solid #aba6a6;
		border-bottom-left-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-top-right-radius: 12rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.btn-clz {
		padding-top: 20rpx;
		border-bottom-left-radius: 18rpx;
		color: #fff;
		padding-left: 20rpx;
		font-size: 32rpx !important;
		padding-bottom: 20rpx;
		border-top-right-radius: 18rpx;
		margin-right: 10rpx;
		background-color: #07c160;
		margin-left: 10rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 18rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 18rpx;
		margin-bottom: 10rpx;
		text-align: center;
		padding-right: 20rpx;
	}
	.container332681 {
	}
	.submit-container {
		margin: 30rpx 20rpx;
		padding: 20rpx 0;
		margin-bottom: 60rpx;
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
</style>
