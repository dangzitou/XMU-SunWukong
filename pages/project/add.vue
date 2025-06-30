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
			<uni-datetime-picker
				type="datetime"
				v-model="ending_date"
			/>
		</u-form-item>
		<u-form-item class="diygw-col-24" label="是否发布" prop="status">
			<u-radio-group class="flex flex-wrap diygw-col-24 justify-start" wrapClass=" justify-start" activeColor="#008D00" v-model="status">
				<u-radio class="diygw-col-12" shape="circle" v-for="(statusitem, statusindex) in statusDatas" :key="statusindex" :name="statusitem.value">
					{{ statusitem.label }}
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
				globalData: { },
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
				statusDatas: [
					{ value: '0', label: '草稿箱', checked: true },
					{ value: '1', label: '发布', checked: false }
				],
				status: '0',
				projectImages: [],
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

					// 如果有项目ID，则更新项目的图片数组
					if (this.globalOption && this.globalOption.id && fileID) {
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

				console.log('预览图片:', index, this.projectImages);

				// 图片列表现在直接是临时URL字符串
				const urls = this.projectImages;

				console.log('预览图片URLs:', urls);

				uni.previewImage({
					current: urls[index],
					urls: urls,
					indicator: 'number',
					loop: true,
					success: () => {
						console.log('图片预览成功');
					},
					fail: (err) => {
						console.error('图片预览失败:', err);
					}
				});
			},

			// 删除图片
			async deleteImage(index) {
				const imageUrl = this.projectImages[index];

				if (!imageUrl) return;

				uni.showLoading({
					title: '删除中...'
				});

				try {
					// 如果有项目ID，则调用云函数删除图片
					if (this.globalOption && this.globalOption.id) {
						// 获取原始fileID
						let fileID = imageUrl;
						if (this._fileIdMap && this._fileIdMap[imageUrl]) {
							fileID = this._fileIdMap[imageUrl];
						}

						const result = await uniCloud.importObject('ProjectAction').deleteProjectImage({
							file_id: fileID,
							project_id: this.globalOption.id
						});

						if (result.status !== 1) {
							console.error('删除图片失败:', result.msg);
						}
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
				console.log('日期时间改变:', evt);
				// 日期时间选择器的@change事件会直接返回格式化好的日期字符串
				this.ending_date = evt;
			},

			// 添加项目 自定义方法
			async addProjectFunction(param) {
				let thiz = this;
				let title = param && (param.title || param.title == 0) ? param.title : thiz.title || '';
				let type_id = param && (param.type_id || param.type_id == 0) ? param.type_id : thiz.project_type || '';
				let college_categories = param && (param.college_categories || param.college_categories == 0) ? param.college_categories : thiz.college_type || '';
				let ending_time = param && (param.ending_time || param.ending_time == 0) ? param.ending_time : thiz.ending_date || '';
				let content_text = param && (param.content_text || param.content_text == 0) ? param.content_text : thiz.contentText || '';
				let person_needed = param && (param.person_needed || param.person_needed == 0) ? param.person_needed : thiz.person_needed || '';
				let status = param && (param.status || param.status == 0) ? param.status : thiz.status || '';

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
				if (!content_text) {
					this.showToast('请输入项目详情描述', 'error');
					return;
				}
				if (!person_needed) {
					this.showToast('请输入要求人数', 'error');
					return;
				}

				// 构建富文本内容，兼容旧版本
				let description = `<div>${content_text}</div>`;

				const data = {
					title,
					type_id,
					college_categories,
					ending_time: Math.floor(new Date(ending_time).getTime() / 1000),
					description,
					content_text,
					images,
					person_needed,
					status
				};

				// 添加content_text字段到项目详情
				if (content_text) {
					data.content_text = content_text;
				}

				data.user_id = this.$session.getUserValue('user_id');

				console.log('准备提交的项目数据:', data);

				try {
					uni.showLoading({
						title: '提交中...'
					});

					const res = await uniCloud.importObject('Project').addProject(data);

					uni.hideLoading();

					if (res.status != 1) {
						this.showToast(res.msg, 'error');
						return;
					}

					// 显示成功提示并在完成后跳转
					uni.showToast({
						title: res.msg,
						icon: 'success',
						duration: 1500,
						success: () => {
							// 通过事件通知应用内其他页面刷新数据
							uni.$emit('project_added', {
								id: res.data,
								timestamp: Date.now()
							});

							// 延迟跳转，确保Toast有足够时间显示
							setTimeout(() => {
								// 尝试返回上一页，如果失败则跳转到项目列表页
								try {
									const pages = getCurrentPages();
									if (pages.length > 1) {
										// 有上一页，可以返回
										uni.navigateBack({ delta: 1 });
									} else {
										// 没有上一页，跳转到项目列表
										uni.redirectTo({
											url: '/pages/project/main_page'
										});
									}
								} catch (e) {
									// 出错时直接跳转到项目列表
									uni.redirectTo({
										url: '/pages/project/main_page'
									});
								}
							}, 1500);
						}
					});
				} catch (error) {
					uni.hideLoading();
					console.error('添加项目失败:', error);
					this.showToast('添加项目失败:' + (error.message || '未知错误'), 'error');
				}
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
	/* 容器样式 */
</style>
