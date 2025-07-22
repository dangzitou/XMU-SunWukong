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
			<uni-datetime-picker
				type="datetime"
				v-model="ending_date"
				:clear-icon="true"
				:start="minDate"
				return-type="string"
				format="yyyy-MM-dd HH:mm"
				@change="changeEnding_date"
				:border="false"
				theme-color="#07c160"
				button-color="#07c160"
			/>
		</u-form-item>
		<view class="date-tip">注意：结束时间不能早于当前时间</view>
		<u-form-item class="diygw-col-24" label="是否发布" prop="release">
			<u-radio-group class="flex flex-wrap diygw-col-24 justify-start" wrapClass=" justify-start" v-model="release">
				<u-radio class="diygw-col-12" shape="circle" v-for="(releaseitem, releaseindex) in releaseDatas" :key="releaseindex" :name="releaseitem.value">
					{{ releaseitem.label }}
				</u-radio>
			</u-radio-group>
		</u-form-item>
		<text class="diygw-col-24 text1-clz"> 项目图片 </text>
		<view class="image-upload-container">
			<!-- 图片预览区域 -->
			<text class="image-count">已上传: {{projectImages.length}}张</text>

			<!-- 显示已上传的图片和上传按钮在同一行 -->
			<view class="image-list">
				<!-- 上传按钮 - 放在最前面 -->
				<view class="upload-button" @tap="chooseImage">
					<image src="/static/project_action/add_photo.png" mode="aspectFit" class="upload-icon"></image>
					<text class="upload-text">点击上传图片</text>
				</view>

				<!-- 已上传的图片 -->
				<view class="image-item" v-for="(imageUrl, index) in projectImages" :key="index">
					<image :src="imageUrl" mode="aspectFill" class="preview-image" @tap="previewImage(index)"></image>
					<view class="delete-icon" @tap="deleteImage(index)">×</view>
				</view>
			</view>

			<view class="upload-tips">可上传多张图片，点击图片可预览</view>
		</view>

		<text class="diygw-col-24 text1-clz"> 详情描述 </text>
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="diygw-col-24 content-text-clz">
				<textarea
					v-model="contentText"
					class="native-textarea"
					placeholder="请输入项目详情描述"
					auto-height
					maxlength="-1"
				></textarea>
			</view>
			<view class="description-tip">请详细说明项目内容</view>
		</view>
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
				globalData: { oldDetail: {}, detail: {} },
				title: '',
				showProject_type: false,
				project_typeDatas: [{ value: '3', label: '选项三' }],

				project_type: '',
				showCollege_type: false,
				college_typeDatas: [{ value: '3', label: '管理学院' }],
				college_type: [],
				person_needed: 5,
				ending_date: '',
				minDate: '',
				releaseDatas: [
					{ value: '0', label: '草稿箱', checked: false },
					{ value: '1', label: '发布', checked: false }
				],
				release: 'undefined',
				description: '',
				projectImages: [], // 存储图片的临时URL
				_fileIdMap: {}, // 存储临时URL到fileID的映射
				contentText: ''
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

			// 设置确认按钮样式
			this.$nextTick(() => {
				setTimeout(() => {
					// 尝试通过DOM修改确认按钮样式
					const confirmBtns = document.querySelectorAll('.uni-datetime-picker-btn-group button, .confirm');
					if (confirmBtns && confirmBtns.length) {
						confirmBtns.forEach(btn => {
							if (btn.textContent.includes('确认') || btn.classList.contains('confirm')) {
								btn.style.backgroundColor = '#07c160';
								btn.style.color = '#ffffff';
								btn.style.border = '1px solid #07c160';
							}
						});
					}
				}, 500);
			});
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

			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 9, // 最多可以选择的图片数量
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图
					sourceType: ['album', 'camera'], // 从相册选择或使用相机
					success: (res) => {
						// 选择成功后的回调
						const tempFilePaths = res.tempFilePaths;
						console.log('选择的本地图片路径:', tempFilePaths);

						// 显示上传中的提示
						uni.showLoading({
							title: '上传中...'
						});

						// 逐个上传图片
						const uploadTasks = tempFilePaths.map(filePath => this.uploadImageViaCloud(filePath));

						Promise.all(uploadTasks).then((results) => {
							uni.hideLoading();
							console.log('所有图片上传完成,当前图片列表:', this.projectImages);

							// 强制更新视图
							this.$forceUpdate();

							if (this.projectImages.length > 0) {
								uni.showToast({
									title: '上传成功',
									icon: 'success'
								});
							}
						}).catch(err => {
							console.error('上传过程出错:', err);
							uni.hideLoading();
							uni.showToast({
								title: '上传失败',
								icon: 'error'
							});
						});
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
						uni.showToast({
							title: '选择图片失败',
							icon: 'error'
						});
					}
				});
			},

			// 直接上传图片到云存储
			async uploadImageViaCloud(filePath) {
				try {
					console.log('开始上传图片:', filePath);

					// 生成云存储路径
					const cloudPath = `project_images/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`;

					// 使用 uniCloud.uploadFile 直接上传到云存储
					const uploadResult = await uniCloud.uploadFile({
						filePath: filePath,
						cloudPath: cloudPath,
						fileType: 'image'
					});

					console.log('上传结果:', uploadResult);

					// 重要：保存文件ID，这是保存到数据库中的值
					const fileID = uploadResult.fileID;

					if (!fileID) {
						throw new Error('上传失败：未获取到文件ID');
					}

					// 更新项目的图片数组
					if (fileID) {
						try {
							await uniCloud.importObject('ProjectAction').updateProjectImages({
								project_id: this.globalOption.id,
								file_id: fileID
							});
							console.log('项目图片数组更新成功');
						} catch (updateError) {
							console.error('更新项目图片数组失败:', updateError);
						}
					}

					// 获取图片访问地址以便显示
					const tempUrl = await uniCloud.getTempFileURL({
						fileList: [fileID]
					});

					console.log('获取临时链接结果:', tempUrl);

					if (tempUrl.fileList && tempUrl.fileList[0] && tempUrl.fileList[0].tempFileURL) {
						const imageUrl = tempUrl.fileList[0].tempFileURL;
						console.log('添加到图片列表的URL:', imageUrl);

						// 创建一个新数组而不是使用push方法
						const newImages = [...this.projectImages, imageUrl];
						console.log('创建新图片数组:', newImages);
						this.projectImages = newImages;

						// 在内部维护一个映射关系，用于提交表单时使用
						if (!this._fileIdMap) this._fileIdMap = {};
						this._fileIdMap[imageUrl] = fileID;
						console.log('添加映射关系 URL->fileID:', imageUrl, '->', fileID);

						console.log('当前图片列表:', JSON.stringify(this.projectImages));
						return imageUrl;
					} else {
						throw new Error('获取临时URL失败');
					}
				} catch (error) {
					console.error('上传图片失败:', error);
					throw error;
				}
			},

			// 预览图片
			previewImage(index) {
				if (!this.projectImages || this.projectImages.length === 0) return;

				// 图片列表现在直接是临时URL字符串
				const urls = this.projectImages;

				uni.previewImage({
					current: urls[index],
					urls: urls,
					indicator: 'number',
					loop: true
				});
			},

			// 使用云函数加载项目图片
			async loadProjectImages() {
				if (!this.globalOption || !this.globalOption.id) {
					console.log('没有项目ID，无法加载图片');
					return;
				}

				try {
					console.log('开始加载项目图片，项目ID:', this.globalOption.id);

					// 检查项目详情中是否有图片
					if (this.globalData.detail && this.globalData.detail.images && this.globalData.detail.images.length > 0) {
						console.log('项目详情中的图片fileIDs:', this.globalData.detail.images);

						// 直接通过fileID获取临时链接
						const tempUrlResult = await uniCloud.getTempFileURL({
							fileList: this.globalData.detail.images
						});

						console.log('临时链接获取结果:', tempUrlResult);

						if (tempUrlResult.fileList && tempUrlResult.fileList.length > 0) {
							// 初始化映射关系和图片数组
							this._fileIdMap = {};

							// 创建临时图片URL数组
							const tempImages = [];

							// 处理每个图片
							tempUrlResult.fileList.forEach(item => {
								if (item.tempFileURL) {
									this._fileIdMap[item.tempFileURL] = item.fileID;
									tempImages.push(item.tempFileURL);
								}
							});

							// 一次性更新数组
							this.projectImages = tempImages;

							console.log('从fileID解析的图片列表:', JSON.stringify(this.projectImages));
							return;
						}
					}

					// 如果项目详情中没有图片或无法直接获取临时链接，则使用云函数
					console.log('从云函数获取项目图片');
					const result = await uniCloud.importObject('ProjectAction').getProjectImages({
						project_id: this.globalOption.id
					});

					console.log('云函数获取项目图片结果:', result);

					if (result.status === 1 && result.data && result.data.length > 0) {
						// 初始化映射关系
						this._fileIdMap = {};

						// 创建临时图片URL数组
						const tempImages = [];

						// 处理返回的图片数据
						result.data.forEach(item => {
							if (item.tempFileURL) {
								this._fileIdMap[item.tempFileURL] = item.fileID;
								tempImages.push(item.tempFileURL);
							}
						});

						// 一次性更新数组
						this.projectImages = tempImages;

						console.log('处理后的项目图片列表:', JSON.stringify(this.projectImages));
					} else {
						console.log('没有找到项目图片或返回数据格式不正确:', result);
						this.projectImages = [];
					}
				} catch (error) {
					console.error('加载项目图片失败:', error);
					this.projectImages = [];
				}
			},

			// 删除图片
			async deleteImage(index) {
				const imageUrl = this.projectImages[index];

				if (!imageUrl) return;

				uni.showLoading({
					title: '删除中...'
				});

				try {
					// 获取原始fileID
					let fileID = imageUrl;
					if (this._fileIdMap && this._fileIdMap[imageUrl]) {
						fileID = this._fileIdMap[imageUrl];
					}

					// 调用云函数删除图片
					const result = await uniCloud.importObject('ProjectAction').deleteProjectImage({
						file_id: fileID,
						project_id: this.globalOption.id
					});

					if (result.status !== 1) {
						console.error('删除图片失败:', result.msg);
					}

					// 创建新数组而不是使用splice方法
					const newImages = [...this.projectImages];
					newImages.splice(index, 1);
					this.projectImages = newImages;

					console.log('删除后的图片列表:', JSON.stringify(this.projectImages));

					uni.hideLoading();
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				} catch (error) {
					console.error('删除图片失败:', error);
					uni.hideLoading();

					// 即使出错，仍然更新前端列表
					const newImages = [...this.projectImages];
					newImages.splice(index, 1);
					this.projectImages = newImages;

					uni.showToast({
						title: '删除图片失败',
						icon: 'error'
					});
				}
			},

			// 获取项目详情 自定义方法
			async getProjectDetailFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';

				try {
					uni.showLoading({
						title: '加载项目信息...'
					});

					const res = await uniCloud.importObject('Project').getDetailForUpdate({ id: option.id, user_id: this.$session.getUserValue('user_id') });

					console.log('获取项目详情:', res);

					// 先保存原始数据
					this.globalData.detail = res.data;
					res.data.status = res.data.status.toString();

					// 格式化时间并存储
					const formattedTime = this.$tools.formatDateTime(res.data.ending_time, 'YYYY-mm-dd HH:MM');
					console.log('原始结束时间:', res.data.ending_time, '格式化后:', formattedTime);

					// 保存原始数据到oldDetail，但要确保ending_time使用格式化后的值
					this.globalData.oldDetail = {
						...res.data,
						ending_time: formattedTime
					};

					// 设置表单值
					this.project_type = res.data.type_id;
					this.ending_date = formattedTime;
					this.release = res.data.status;
					this.description = res.data.description;
					this.contentText = res.data.content_text || '';
					this.college_type = res.data.academyList;

					// 加载项目图片
					await this.loadProjectImages();

					uni.hideLoading();
				} catch (error) {
					console.error('获取项目详情失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '获取项目信息失败',
						icon: 'none'
					});
				}
			},

			// 更新项目 自定义方法
			async updateProjectFunction(param) {
				let thiz = this;
				let title = param && (param.title || param.title == 0) ? param.title : thiz.globalData.detail.title || '';
				let person_needed = param && (param.person_needed || param.person_needed == 0) ? param.person_needed : thiz.globalData.detail.person_needed || '';

				// 确保结束时间格式正确
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : thiz.ending_date || '';
				console.log('提交的结束时间:', ending_time);

				let type_id = param && (param.type_id || param.type_id == 0) ? param.type_id : thiz.project_type || '';
				let status = param && (param.status || param.status == 0) ? param.status : thiz.release || '';
				let content_text = param && (param.content_text || param.content_text == 0) ? param.content_text : thiz.contentText || '';
				let academyList = param && (param.academyList || param.academyList == 0) ? param.academyList : thiz.college_type || '';
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';

				// 确保获取正确的fileID数组用于保存到数据库
				let images = [];
				if (this.projectImages && this.projectImages.length > 0) {
					console.log('准备保存图片数组到数据库:', this.projectImages);

					// 如果有映射关系，使用原始fileID
					if (this._fileIdMap) {
						this.projectImages.forEach(url => {
							const fileID = this._fileIdMap[url] || url;
							if (fileID) {
								console.log('保存图片ID:', fileID);
								images.push(fileID);
							}
						});
					} else {
						// 如果没有映射关系，直接使用URL (不应该走这个分支)
						images = this.projectImages.filter(url => url);
					}

					console.log('最终保存到数据库的图片数组:', images);
				}

				// 构建富文本内容，兼容旧版本
				let description = `<div>${content_text}</div>`;

				const data = {
					title,
					person_needed: parseInt(person_needed),
					ending_time,
					type_id,
					status,
					description,
					content_text,
					images,
					academyList
				};

				console.log('准备更新的项目数据:', data);

				// 检查是否有变化
				var flag = 0;
				for (const key in data) {
					// 对于图片数组，需要特殊处理
					if (key === 'images') {
						const oldImages = this.globalData.oldDetail.images || [];
						console.log('比较图片数组:', 'old:', oldImages, 'new:', images);

						if (images.length !== oldImages.length) {
							console.log('图片数量不同，需要更新');
							flag = 1;
							break;
						}

						// 检查每个图片URL是否相同
						for (let i = 0; i < images.length; i++) {
							if (images[i] !== oldImages[i]) {
								console.log('图片内容不同，需要更新');
								flag = 1;
								break;
							}
						}
						if (flag === 1) break;
					} else if (data[key] != this.globalData.oldDetail[key]) {
						console.log('字段变化:', key, 'old:', this.globalData.oldDetail[key], 'new:', data[key]);
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

				try {
					uni.showLoading({
						title: '更新中...'
					});

					const updateData = {
						...data,
						user_id: this.$session.getUserValue('user_id'),
						id: option.id
					};

					console.log('发送到云函数的更新数据:', updateData);

					const res = await uniCloud.importObject('Project').updateProject(updateData);

					uni.hideLoading();

					if (res.status == 1) {
						this.globalData.oldDetail = { ...data };

						// 显示成功提示并在完成后跳转
						uni.showToast({
							title: res.msg,
							icon: 'success',
							duration: 1500,
							success: () => {
								// 设置项目列表需要刷新的标志
								uni.setStorageSync('project_list_need_refresh', true);

								// 通过事件通知应用内其他页面刷新数据
								uni.$emit('project_updated', {
									id: option.id,
									timestamp: Date.now()
								});

								// 延迟跳转，确保Toast有足够时间显示
								setTimeout(() => {
									// 重定向到详情页而不是返回，确保页面重新加载
									uni.redirectTo({
										url: `/pages/project/project_detail?id=${option.id}&refresh=true&timestamp=${Date.now()}`
									});
								}, 1500);
							}
						});
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('更新项目失败:', error);
					uni.showToast({
						title: '更新失败: ' + (error.message || '未知错误'),
						icon: 'error'
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
				// 如果是日历控件返回的结果
				if (evt.result) {
					this.ending_date = evt.result;
				}
				// 如果是datetime-picker返回的结果
				else {
					const date = new Date(evt);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');

					// 格式化为 YYYY-MM-DD HH:MM
					this.ending_date = `${year}-${month}-${day} ${hours}:${minutes}`;
					console.log('设置日期时间:', this.ending_date);
				}

				// 关闭日期选择器
				this.showEnding_date = false;
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
	.content-text-clz {
		margin-left: 10rpx;
		border: 2rpx solid #aba6a6;
		border-radius: 12rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}

	.image-upload-container {
		padding: 20rpx;
		margin: 10rpx;
	}

	.image-count {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 15rpx;
	}

	.upload-tips {
		font-size: 24rpx;
		color: #999;
		margin-top: 20rpx;
		text-align: center;
	}

	.description-tip {
		font-size: 24rpx;
		color: #999;
		margin: 10rpx 20rpx 20rpx;
		text-align: left;
	}

	.native-textarea {
		width: 100%;
		min-height: 300rpx;
		padding: 20rpx;
		font-size: 28rpx;
		line-height: 1.5;
		color: #333;
		background-color: #fff;
		border: none;
		box-sizing: border-box;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-bottom: 20rpx;
		align-items: flex-start;
	}

	.image-item {
		position: relative;
		width: 200rpx;
		height: 200rpx;
		border-radius: 8rpx;
		overflow: hidden;
		border: 1px solid #eee;
		background-color: #f5f5f5;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.delete-icon {
		position: absolute;
		top: 5rpx;
		right: 5rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		border-radius: 50%;
		z-index: 2;
	}

	.upload-button {
		width: 200rpx;
		height: 200rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 8rpx;
		border: 1px dashed #dcdcdc;
		margin-bottom: 20rpx;
		/* 确保与图片项目在同一行 */
		flex-shrink: 0;
		order: -1; /* 让上传按钮始终在最前面 */
	}

	.upload-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.upload-text {
		font-size: 24rpx;
		color: #666;
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
	.global-button:active {
		background-color: #139913;
		transform: scale(0.98);
	}
	.date-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
		display: block;
		margin-left: 30rpx;
		margin-bottom: 15rpx;
	}

	/* 日期时间选择器样式 - 简化版，只保留必要的绿色按钮样式 */
	:deep(.uni-date) {
		width: 100%;
	}

	:deep(.uni-date-editor) {
		width: 100%;
	}

	/* 选中日期的圆形背景 */
	:deep(.uni-calendar-item--checked) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	/* 今日日期样式 */
	:deep(.uni-calendar-item--today) {
		color: #07c160 !important;
	}

	/* 主要按钮样式 - 仅确认按钮为绿色 */
	:deep(.uni-datetime-picker-btn-group .confirm-text) {
		color: #07c160 !important;
	}

	:deep(.uni-calendar__button-text) {
		color: #07c160 !important;
	}

	/* 确认按钮 - 绿色背景白色文字 */
	:deep(.uni-date-submit) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	/* 清除之前可能影响整个底部区域的样式 */
	:deep(.uni-datetime-picker-popup) {
		border-top: 1px solid #f0f0f0;
	}

	:deep(.uni-datetime-picker-view) {
		background-color: #fff;
	}

	:deep(.uni-datetime-picker-btn) {
		background-color: transparent !important;
	}

	:deep(.uni-date-x__bottm) {
		background-color: #fff !important;
	}

	/* 确认按钮为绿色，其他按钮恢复默认 */
	:deep(.okBtn) {
		color: #07c160 !important;
	}

	:deep(.confirm) {
		color: #fff !important;
		background-color: #07c160 !important;
	}

	/* 日历中选中当前日期的样式 */
	:deep(.uni-calendar-item--checked) {
		background-color: #07c160 !important;
	}

	/* 确保确认按钮是绿色 */
	:deep(.uni-calendar__footer) {
		padding: 0;
	}

	:deep(.uni-calendar__footer-btn-box) {
		display: flex;
	}

	:deep(.uni-calendar__footer-btn) {
		padding: 12rpx 20rpx;
		margin: 10rpx;
		border-radius: 4rpx;
		flex: 1;
	}

	:deep(.uni-calendar__confirm-btn) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	:deep(.uni-picker-calendar-main .uni-picker-calendar-footer .uni-picker-calendar-button) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	/* 弹窗底部确认按钮 */
	:deep(.uni-calendar-footer .confirm) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	/* 专门针对日期时间选择器底部确认按钮样式 */
	:deep(.uni-datetime-picker-popup .confirm) {
		background-color: #07c160 !important;
		color: #fff !important;
		border-radius: 4px !important;
	}

	:deep(.uni-datetime-picker-popup .uni-datetime-picker-btn-group) {
		display: flex !important;
	}

	:deep(.uni-datetime-picker-popup .uni-datetime-picker-btn-group button) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	/* 底部确认按钮最高优先级样式 */
	:deep(.uni-button-color) {
		color: #07c160 !important;
	}

	:deep(.uni-button-color.uni-button-color-primary) {
		background-color: #07c160 !important;
		color: #fff !important;
	}

	/* 强制覆盖所有蓝色按钮 */
	:deep(button.uni-button[type=primary]) {
		background-color: #07c160 !important;
		border-color: #07c160 !important;
	}

	/* 针对特定日期选择器底部按钮 */
	:deep(.uni-picker-container button.uni-picker-action) {
		color: #fff !important;
		background-color: #07c160 !important;
	}

	/* 直接覆盖 */
	button.uni-button-color {
		color: #07c160 !important;
	}
</style>
