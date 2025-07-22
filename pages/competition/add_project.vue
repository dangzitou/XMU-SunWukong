<template>
	<view class="container container332681">
		<u-form-item labelWidth="auto" class="diygw-col-24 input-clz" label="竞赛" prop="input">
			<u-input :disabled="inputDisabled" v-model="globalData.comp.title" placeholder=""></u-input>
		</u-form-item>
		<u-form-item labelWidth="auto" class="diygw-col-24" label="项目类型：" prop="project_type">
			<diy-selectinput disabled="true" class="diygw-col-24" valueName="value" labelName="label" :list="project_typeDatas" placeholder="竞赛项目" v-model="project_type" type="select"></diy-selectinput>
			<u-select mode="single-column" valueName="value" labelName="label" :list="project_typeDatas" isDefaultSelect :defaultSelectValue="project_type" v-model="showProject_type" @confirm="changeProject_type"></u-select>
		</u-form-item>
		<u-form-item labelWidth="auto" class="diygw-col-24 title-clz" :required="true" label="主题：" prop="title">
			<u-input placeholder="输入您的主题" v-model="title"></u-input>
		</u-form-item>
		<u-form-item :required="true" class="diygw-col-24" label="学院选择" prop="college_type">
			<diy-selectinput @click="showCollege_type = true" class="diygw-col-24" placeholder="请选择" valueName="value" labelName="label" :list="college_typeDatas" v-model="college_type" type="select"></diy-selectinput>
			<diy-select mode="checkbox" activeColor="#39b54a" placeholder="请输入搜索关键词" valueName="value" labelName="label" :list="college_typeDatas" :defaultValue="college_type" v-model="showCollege_type" @confirm="changeCollege_type"></diy-select>
		</u-form-item>
		<u-form-item class="diygw-col-24" :required="true" label="要求人数" prop="person_needed">
			<u-input placeholder="请输入要求人数" v-model="person_needed" type="number"></u-input>
		</u-form-item>
		<u-form-item class="diygw-col-24" label="结束时间" :required="true" prop="ending_date">
			<u-input @click="showEnding_date = true" class="" placeholder="请选择" v-model="ending_date" type="select"></u-input>
			<u-calendar :minDate="minDate" :maxDate="$tools.formatDateTime(globalData.comp.ending_time, 'YYYY-mm-dd')" v-model="showEnding_date" :dateValue="ending_date" maxDate="2050-12-31" @change="changeEnding_date"></u-calendar>
		</u-form-item>
		<u-form-item class="diygw-col-24" label="是否发布" prop="status">
			<u-radio-group class="flex flex-wrap diygw-col-24 justify-start" wrapClass=" justify-start" v-model="status">
				<u-radio class="diygw-col-12" shape="circle" v-for="(statusitem, statusindex) in statusDatas" :key="statusindex" :name="statusitem.value">
					{{ statusitem.label }}
				</u-radio>
			</u-radio-group>
		</u-form-item>
		<text class="diygw-col-24 text1-clz"> 详情 </text>
		<u-form-item :borderBottom="false" class="diygw-col-24 detail-clz" labelPosition="top" prop="detail">
			<diy-editor height="500px" v-model="detail"></diy-editor>
		</u-form-item>
		<button class="diygw-col-24 btn-clz diygw-btn-default">发布</button>
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
				globalData: { comp: {}, minDate: '' },
				inputDisabled: true,

				input: '',
				showProject_type: false,
				project_typeDatas: [{ value: '0', label: '竞赛项目' }],

				project_type: '0',
				title: '',
				showCollege_type: false,
				college_typeDatas: [{ value: '3', label: '管理学院' }],
				college_type: [],
				person_needed: 5,
				showEnding_date: false,
				ending_date: '',
				statusDatas: [
					{ value: '0', label: '草稿箱', checked: false },
					{ value: '1', label: '发布', checked: true }
				],
				status: '1',
				detail: ''
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
			},
			async initShow() {
				this.getCurrentDateFunction();
				await this.checkLoginFunction();
			},
			// 获取类别列表 自定义方法
			async getCatListFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';

				const res = await uniCloud.importObject('Initialize').getCompetitionForAdd({ id: option.id });
				const collegeCat = res.data.coll;
				this.college_typeDatas = [];

				for (const index in collegeCat) this.college_typeDatas.push({ value: collegeCat[index]._id, label: collegeCat[index].name });

				this.globalData.comp = res.data.proj;
			},

			// 添加项目 自定义方法
			async addProjectFunction(param) {
				let thiz = this;
				let title = param && (param.title || param.title == 0) ? param.title : thiz.title || '';
				let college_categories = param && (param.college_categories || param.college_categories == 0) ? param.college_categories : thiz.college_type || '';
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : thiz.ending_date || '';
				let description = param && (param.description || param.description == 0) ? param.description : thiz.detail || '';
				let person_needed = param && (param.person_needed || param.person_needed == 0) ? param.person_needed : thiz.person_needed || '';
				let status = param && (param.status || param.status == 0) ? param.status : thiz.status || '';
				let comp = param && (param.comp || param.comp == 0) ? param.comp : thiz.globalData.comp || '';
				const data = {
					title,
					college_categories,
					ending_time: Math.floor(new Date(ending_time).getTime() / 1000),
					description,
					person_needed,
					status,
					comp
				};

				data.user_id = this.$session.getUserValue('user_id');

				const res = await uniCloud.importObject('Competition').addProject(data);

				if (res.status != 1) {
					this.showToast(res.msg, 'error');
					return;
				}

				this.showToast(res.msg, 'success');
				uni.redirectTo({
					url: '/pages/profile/project'
				});
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
	.input-clz {
		margin-left: 0rpx;
		width: calc(100%) !important;
		margin-top: 10rpx;
		margin-bottom: 0rpx;
		margin-right: 0rpx;
	}
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
	.detail-clz {
		margin-left: 10rpx;
		border: 2rpx solid #aba6a6;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
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
		top: 20rpx;
		left: 0rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 18rpx;
		margin-top: 0rpx;
		border-bottom-right-radius: 18rpx;
		position: relative;
		margin-bottom: 40rpx;
		text-align: center;
		padding-right: 20rpx;
	}
	.container332681 {
	}
</style>
