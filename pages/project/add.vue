<template>
	<view class="container container332681">
		<u-form-item labelWidth="auto" class="diygw-col-24 title-clz" :required="true" label="主题：" prop="title">
			<u-input placeholder="输入您的主题" v-model="title"></u-input>
		</u-form-item>
		<u-form-item labelWidth="auto" :required="true" class="diygw-col-24" label="项目类型：" prop="project_type">
			<diy-selectinput @click="showProject_type = true" class="diygw-col-24" valueName="value" labelName="label" :list="project_typeDatas" placeholder="请选择" v-model="project_type" type="select"></diy-selectinput>
			<u-select mode="single-column" valueName="value" labelName="label" :list="project_typeDatas" isDefaultSelect :defaultSelectValue="project_type" v-model="showProject_type" @confirm="changeProject_type"></u-select>
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
			<u-calendar :minDate="minDate" v-model="showEnding_date" :dateValue="ending_date" maxDate="2050-12-31" @change="changeEnding_date"></u-calendar>
		</u-form-item>
		<u-form-item class="diygw-col-24" label="是否发布" prop="status">
			<u-radio-group class="flex flex-wrap diygw-col-24 justify-start" wrapClass=" justify-start" activeColor="#008D00" v-model="status">
				<u-radio class="diygw-col-12" shape="circle" v-for="(statusitem, statusindex) in statusDatas" :key="statusindex" :name="statusitem.value">
					{{ statusitem.label }}
				</u-radio>
			</u-radio-group>
		</u-form-item>
		<text class="diygw-col-24 text1-clz"> 详情 </text>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<u-form-item :borderBottom="false" class="diygw-col-24 editor-clz" labelPosition="top" prop="editor">
				<diy-editor height="500px" v-model="editor"></diy-editor>
			</u-form-item>
		</view>
		<view class="submit-container">
			<button class="global-button" @tap="addProjectFunction">提交</button>
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
				globalData: { minDate: '' },
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
				statusDatas: [
					{ value: '0', label: '草稿箱', checked: true },
					{ value: '1', label: '发布', checked: false }
				],
				status: '0',
				editor: ''
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

				const res = await uniCloud.importObject('Initialize').getCategoryForAdd();
				const projCat = res.data.proj;
				const collegeCat = res.data.coll;
				this.project_typeDatas = [];
				this.college_typeDatas = [];
				for (const index in projCat) this.project_typeDatas.push({ value: projCat[index]._id, label: projCat[index].name });

				for (const index in collegeCat) this.college_typeDatas.push({ value: collegeCat[index]._id, label: collegeCat[index].name });
			},

			// 添加项目 自定义方法
			async addProjectFunction(param) {
				let thiz = this;
				let title = param && (param.title || param.title == 0) ? param.title : thiz.title || '';
				let type_id = param && (param.type_id || param.type_id == 0) ? param.type_id : thiz.project_type || '';
				let college_categories = param && (param.college_categories || param.college_categories == 0) ? param.college_categories : thiz.college_type || '';
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : thiz.ending_date || '';
				let description = param && (param.description || param.description == 0) ? param.description : thiz.editor || '';
				let person_needed = param && (param.person_needed || param.person_needed == 0) ? param.person_needed : thiz.person_needed || '';
				let status = param && (param.status || param.status == 0) ? param.status : thiz.status || '';
				
				// 验证必填字段
				if (!title) {
					this.showToast('请输入项目主题', 'error');
					return;
				}
				if (!type_id) {
					this.showToast('请选择项目类型', 'error');
					return;
				}
				if (!college_categories || college_categories.length === 0) {
					this.showToast('请选择学院', 'error');
					return;
				}
				if (!ending_time) {
					this.showToast('请选择结束时间', 'error');
					return;
				}
				if (!description) {
					this.showToast('请输入项目详情', 'error');
					return;
				}
				if (!person_needed) {
					this.showToast('请输入要求人数', 'error');
					return;
				}
				
				const data = {
					title,
					type_id,
					college_categories,
					ending_time: Math.floor(new Date(ending_time).getTime() / 1000),
					description,
					person_needed,
					status
				};

				data.user_id = this.$session.getUserValue('user_id');

				const res = await uniCloud.importObject('Project').addProject(data);

				if (res.status != 1) {
					this.showToast(res.msg, 'error');
					return;
				}

				this.showToast(res.msg, 'success');
				
				// 等待提示显示完成后再返回
				setTimeout(() => {
					// 返回上一页（项目列表页面）
					uni.navigateBack({
						delta: 1
					});
				}, 1500);
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
	.editor-clz {
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
	.container332681 {
	}
</style>
