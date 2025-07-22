<template>
	<view class="container">
		<view class="form-container">
			<!-- Avatar upload section -->
			<view class="avatar-section">
				<!-- 微信小程序专用按钮 -->
				<view v-if="isWechatMP" class="avatar-wrapper">
					<!-- 头像图片可点击 -->
					<view class="diygw-avatar lg radius bg-none" @tap="chooseAvatar">
						<image v-if="userInfo.avatar" mode="aspectFit" class="diygw-avatar-img radius" :src="userInfo.avatar"></image>
						<image v-else mode="aspectFit" class="diygw-avatar-img radius" src="/static/profile/default.png"></image>
					</view>
					<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">点击更换头像</button>
				</view>

				<!-- 其他平台标准按钮 -->
				<view v-else class="avatar-wrapper">
					<view class="diygw-avatar lg radius bg-none" @tap="chooseAvatar">
						<image v-if="userInfo.avatar" mode="aspectFit" class="diygw-avatar-img radius" :src="userInfo.avatar"></image>
						<image v-else mode="aspectFit" class="diygw-avatar-img radius" src="/static/profile/default.png"></image>
					</view>
					<view class="avatar-text" @tap="chooseAvatar">点击更换头像</view>
				</view>
			</view>

			<!-- Form fields -->
			<view class="form-group">
				<view class="form-item">
					<view class="form-label">姓名</view>
					<input class="form-input" type="text" v-model="userInfo.real_name" placeholder="请输入姓名" />
				</view>

				<view class="form-item">
					<view class="form-label">学院</view>
					<picker @change="onCollegeChange" :value="collegeIndex" :range="collegeList" range-key="text">
						<view class="form-picker">
							<text>{{ collegeList[collegeIndex]?.text || '请选择学院' }}</text>
							<text class="picker-arrow diy-icon-right"></text>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<view class="form-label">专业</view>
					<picker @change="onMajorChange" :value="majorIndex" :range="majorList" range-key="text">
						<view class="form-picker">
							<text>{{ majorList[majorIndex]?.text || '请选择专业' }}</text>
							<text class="picker-arrow diy-icon-right"></text>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<view class="form-label">入学年份</view>
					<input class="form-input" type="number" v-model="userInfo.onboarding_year" placeholder="请输入入学年份" />
				</view>

				<view class="form-item">
					<view class="form-label">身份</view>
					<picker @change="onTypeChange" :value="typeIndex" :range="typeList" range-key="text">
						<view class="form-picker">
							<text>{{ typeList[typeIndex]?.text || '请选择身份' }}</text>
							<text class="picker-arrow diy-icon-right"></text>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<view class="form-label">个人简介</view>
					<textarea class="form-textarea" v-model="userInfo.bio" placeholder="请输入个人简介（最多200字）" maxlength="200" />
					<view class="textarea-counter">{{ userInfo.bio ? userInfo.bio.length : 0 }}/200</view>
				</view>
			</view>

			<!-- Submit button -->
			<view class="btn-container">
				<button class="submit-btn" @tap="saveProfile">保存</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			// 判断是否微信小程序环境
			const isWechatMP = uni.getSystemInfoSync().uniPlatform === 'mp-weixin';
			console.log('当前环境是否微信小程序:', isWechatMP);

			return {
				userInfo: {
					_id: '',
					real_name: '',
					avatar: '',
					college_category_id: '',
					specific_category_id: '',
					onboarding_year: '',
					type: null,
					bio: ''
				},
				collegeList: [],
				majorList: [],
				typeList: [
					{ value: 0, text: '老师' },
					{ value: 1, text: '本科生' },
					{ value: 2, text: '硕士（研究生）' },
					{ value: 3, text: '博士（研究生）' }
				],
				collegeIndex: 0,
				majorIndex: 0,
				typeIndex: 0,
				originalUserInfo: {}, // 用于比较是否有修改
				isWechatMP: isWechatMP // 是否微信小程序环境
			};
		},
		onLoad() {
			this.loadUserInfo();
			this.loadCollegeList();
		},
		methods: {
			// 加载用户信息
			async loadUserInfo() {
				try {
					// 从会话中获取用户ID
					const userId = this.$session.getUserValue('user_id');
					if (!userId) {
						this.showToast('请先登录');
						this.navigateTo({
							type: 'page',
							url: '/pages/sign/login'
						});
						return;
					}

					// 获取用户详细信息
					const userDetail = this.$session.getUser();
					console.log('用户信息:', userDetail);

					// 设置用户信息
					this.userInfo._id = userId;
					this.userInfo.real_name = userDetail.real_name || '';
					this.userInfo.avatar = userDetail.avatar || '';
					this.userInfo.onboarding_year = userDetail.onboarding_year || '';
					this.userInfo.bio = userDetail.bio || '';

					// 设置学院ID
					if (userDetail.college_category && userDetail.college_category._id) {
						this.userInfo.college_category_id = userDetail.college_category._id;
					}

					// 设置专业ID
					if (userDetail.specific_category && userDetail.specific_category._id) {
						this.userInfo.specific_category_id = userDetail.specific_category._id;
					}

					// 设置用户类型
					if (userDetail.type) {
						// 检查type对象的结构，兼容不同的格式
						let typeValue;
						if (userDetail.type.value !== undefined) {
							typeValue = userDetail.type.value;
						} else if (userDetail.type.type !== undefined) {
							typeValue = userDetail.type.type;
						} else if (typeof userDetail.type === 'number') {
							typeValue = userDetail.type;
						}

						if (typeValue !== undefined) {
							console.log('用户类型值:', typeValue);
							this.userInfo.type = typeValue;
							// 设置类型选择器的索引
							const typeIndex = this.typeList.findIndex(item => item.value === typeValue);
							if (typeIndex !== -1) {
								this.typeIndex = typeIndex;
							}
						}
					}

					// 保存原始信息用于比较
					this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
				} catch (error) {
					console.error('加载用户信息失败:', error);
					this.showToast('加载用户信息失败');
				}
			},

			// 加载学院列表
			async loadCollegeList() {
				try {
					// 使用云对象获取学院列表
					const Category = uniCloud.importObject('Category');
					const result = await Category.getCollegeList();

					if (result && result.status === 1 && result.data) {
						this.collegeList = result.data;

						// 设置当前选中的学院索引
						if (this.userInfo.college_category_id) {
							const index = this.collegeList.findIndex(item => item.value === this.userInfo.college_category_id);
							if (index !== -1) {
								this.collegeIndex = index;
								// 加载该学院下的专业列表
								this.loadMajorList(this.userInfo.college_category_id);
							}
						}
					} else {
						console.error('获取学院列表失败:', result?.msg || '未知错误');
						this.showToast(result?.msg || '加载学院列表失败');
					}
				} catch (error) {
					console.error('加载学院列表失败:', error);
					this.showToast('加载学院列表失败');
				}
			},

			// 加载专业列表
			async loadMajorList(collegeId) {
				try {
					if (!collegeId) return;

					// 使用云对象获取专业列表
					const Category = uniCloud.importObject('Category');
					const result = await Category.getMajorList({
						collegeId: collegeId
					});

					if (result && result.status === 1 && result.data) {
						this.majorList = result.data;

						// 设置当前选中的专业索引
						if (this.userInfo.specific_category_id) {
							const index = this.majorList.findIndex(item => item.value === this.userInfo.specific_category_id);
							if (index !== -1) {
								this.majorIndex = index;
							}
						}
					} else {
						console.error('获取专业列表失败:', result?.msg || '未知错误');
						this.showToast(result?.msg || '加载专业列表失败');
					}
				} catch (error) {
					console.error('加载专业列表失败:', error);
					this.showToast('加载专业列表失败');
				}
			},

			// 选择头像
			chooseAvatar() {
				// 判断当前平台
				const platform = uni.getSystemInfoSync().platform;
				const isMP = uni.getSystemInfoSync().uniPlatform === 'mp-weixin';

				console.log('当前平台:', platform, '是否微信小程序:', isMP);

				// 微信小程序专用头像选择器
				if (isMP && wx.chooseAvatar) {
					console.log('使用微信小程序头像选择器');
					wx.chooseAvatar({
						success: async (res) => {
							const tempFilePath = res.tempFilePath;
							console.log('选择头像成功:', tempFilePath);
							this.uploadAvatarFile(tempFilePath);
						},
						fail: (err) => {
							console.error('选择头像失败:', err);
							this.showToast('选择头像失败');
						}
					});
				} else {
					// 其他平台使用通用方法
					uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera'],
						success: async (res) => {
							const tempFilePath = res.tempFilePaths[0];
							console.log('选择图片成功:', tempFilePath);
							this.uploadAvatarFile(tempFilePath);
						},
						fail: (err) => {
							console.error('选择图片失败:', err);
							this.showToast('选择图片失败');
						}
					});
				}
			},

			// 上传头像文件
			async uploadAvatarFile(tempFilePath) {
				// 显示上传中提示
				uni.showLoading({
					title: '上传中...'
				});

				try {
					// 压缩图片
					let compressedPath = tempFilePath;
					if (uni.getSystemInfoSync().uniPlatform === 'mp-weixin') {
						try {
							const compressRes = await new Promise((resolve, reject) => {
								wx.compressImage({
									src: tempFilePath,
									quality: 80,
									success: resolve,
									fail: reject
								});
							});
							compressedPath = compressRes.tempFilePath;
							console.log('图片压缩成功');
						} catch (compressErr) {
							console.error('图片压缩失败:', compressErr);
							// 如果压缩失败，使用原图
						}
					}

					console.log('开始上传头像:', compressedPath);

					// 生成云存储路径
					const cloudPath = `avatars/${this.userInfo._id}_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;

					// 直接使用 uniCloud.uploadFile 上传到云存储
					const uploadResult = await uniCloud.uploadFile({
						filePath: compressedPath,
						cloudPath: cloudPath,
						fileType: 'image'
					});

					console.log('上传结果:', uploadResult);

					// 获取文件ID
					const fileID = uploadResult.fileID;

					if (!fileID) {
						throw new Error('上传失败：未获取到文件ID');
					}

					// 调用云函数更新用户头像
					const User = uniCloud.importObject('User');
					const updateResult = await User.updateAvatar({
						user_id: this.userInfo._id,
						avatar_url: fileID
					});

					console.log('更新头像结果:', updateResult);

					if (updateResult && updateResult.status === 1) {
						// 更新头像URL
						this.userInfo.avatar = fileID;
						this.showToast('头像更新成功');

						// 更新session中的用户信息
						const userInfo = this.$session.getUser();
						userInfo.avatar = fileID;
						this.$session.setUser(userInfo);
					} else {
						this.showToast(updateResult?.msg || '头像更新失败');
					}
				} catch (error) {
					console.error('上传头像失败:', error);
					this.showToast('上传头像失败: ' + (error.message || '未知错误'));
				} finally {
					uni.hideLoading();
				}
			},



			// 微信小程序头像选择回调
			onChooseAvatar(e) {
				console.log('微信小程序头像选择回调:', e);
				const tempFilePath = e.detail.avatarUrl;
				if (tempFilePath) {
					this.uploadAvatarFile(tempFilePath);
				}
			},

			// 学院选择变化
			onCollegeChange(e) {
				const index = e.detail.value;
				this.collegeIndex = index;
				const collegeId = this.collegeList[index].value;
				this.userInfo.college_category_id = collegeId;

				// 重置专业选择
				this.majorIndex = 0;
				this.userInfo.specific_category_id = '';
				this.majorList = [];

				// 加载该学院下的专业列表
				this.loadMajorList(collegeId);
			},

			// 专业选择变化
			onMajorChange(e) {
				const index = e.detail.value;
				this.majorIndex = index;
				this.userInfo.specific_category_id = this.majorList[index].value;
			},

			// 用户类型选择变化
			onTypeChange(e) {
				const index = e.detail.value;
				this.typeIndex = index;
				this.userInfo.type = this.typeList[index].value;
			},

			// 保存个人资料
			async saveProfile() {
				try {
					// 验证表单
					if (!this.userInfo.real_name) {
						return this.showToast('请输入姓名');
					}

					if (!this.userInfo.college_category_id) {
						return this.showToast('请选择学院');
					}

					if (!this.userInfo.specific_category_id) {
						return this.showToast('请选择专业');
					}

					if (!this.userInfo.onboarding_year) {
						return this.showToast('请输入入学年份');
					}

					if (this.userInfo.type === null || this.userInfo.type === undefined) {
						return this.showToast('请选择身份');
					}

					// 检查是否有修改
					if (this.isProfileChanged()) {
						// 显示加载提示
						uni.showLoading({
							title: '保存中...'
						});

						// 调用云函数更新用户资料
						const User = uniCloud.importObject('User');
						const result = await User.updateUserProfile({
							user_id: this.userInfo._id,
							real_name: this.userInfo.real_name,
							college_category_id: this.userInfo.college_category_id,
							specific_category_id: this.userInfo.specific_category_id,
							onboarding_year: parseInt(this.userInfo.onboarding_year),
							type: this.userInfo.type,
							bio: this.userInfo.bio
						});

						uni.hideLoading();

						if (result && result.status === 1) {
							this.showToast('保存成功');

							// 更新session中的用户信息
							const userInfo = this.$session.getUser();
							userInfo.real_name = this.userInfo.real_name;

							// 更新学院信息
							const college = this.collegeList.find(item => item.value === this.userInfo.college_category_id);
							if (college) {
								userInfo.college_category = {
									_id: college.value,
									name: college.text
								};
							}

							// 更新专业信息
							const major = this.majorList.find(item => item.value === this.userInfo.specific_category_id);
							if (major) {
								userInfo.specific_category = {
									_id: major.value,
									name: major.text
								};
							}

							// 更新年份
							userInfo.onboarding_year = parseInt(this.userInfo.onboarding_year);

							// 更新类型
							const type = this.typeList.find(item => item.value === this.userInfo.type);
							if (type) {
								userInfo.type = {
									value: type.value,
									name: type.text
								};
							}

							// 更新个人简介
							userInfo.bio = this.userInfo.bio;

							this.$session.setUser(userInfo);

							// 返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} else {
							this.showToast(result?.msg || '保存失败');
						}
					} else {
						this.showToast('未做任何修改');
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				} catch (error) {
					uni.hideLoading();
					console.error('保存个人资料失败:', error);
					this.showToast('保存失败');
				}
			},

			// 检查个人资料是否有修改
			isProfileChanged() {
				return (
					this.userInfo.real_name !== this.originalUserInfo.real_name ||
					this.userInfo.college_category_id !== this.originalUserInfo.college_category_id ||
					this.userInfo.specific_category_id !== this.originalUserInfo.specific_category_id ||
					parseInt(this.userInfo.onboarding_year) !== parseInt(this.originalUserInfo.onboarding_year) ||
					this.userInfo.type !== this.originalUserInfo.type ||
					this.userInfo.bio !== this.originalUserInfo.bio
				);
			},

			// 显示提示
			showToast(title, icon = 'none') {
				uni.showToast({
					title,
					icon
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 30rpx;
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	.form-container {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.avatar-section {
		display: flex;
		justify-content: center;
		padding: 40rpx 0;
	}

	.avatar-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.diygw-avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		border: 2rpx solid #eee;
	}

	.diygw-avatar-img {
		width: 100%;
		height: 100%;
	}



	.avatar-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #07c160;
	}

	.avatar-btn {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #07c160;
		background: none;
		border: none;
		line-height: 1.5;
		padding: 0;
		width: auto;
		outline: none;
	}

	.avatar-btn::after {
		border: none;
	}

	.form-group {
		margin-top: 30rpx;
	}

	.form-item {
		margin-bottom: 30rpx;
		border-bottom: 1rpx solid #eee;
		padding-bottom: 20rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
	}

	.form-input {
		font-size: 30rpx;
		height: 80rpx;
		width: 100%;
	}

	.form-textarea {
		font-size: 30rpx;
		width: 100%;
		height: 200rpx;
		padding: 10rpx 0;
		line-height: 1.5;
	}

	.textarea-counter {
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.form-picker {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 80rpx;
		font-size: 30rpx;
	}

	.picker-arrow {
		color: #999;
		font-size: 32rpx;
	}

	.btn-container {
		margin-top: 60rpx;
		padding: 0 30rpx;
	}

	.submit-btn {
		background-color: #07c160;
		color: #fff;
		border-radius: 50rpx;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		border: none;
	}
</style>
