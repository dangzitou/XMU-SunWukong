<template>
	<view class="container container332681">
		<view class="flex flex-wrap diygw-col-24 flex-direction-column">
			<view class="flex diygw-col-24 swiper-clz">
				<swiper :current="swiperIndex" class="swiper" @change="changeSwiper" indicator-color="rgba(51, 51, 51, 0.39)" indicator-active-color="#fff" indicator-dots="true" autoplay interval="3000" circular="true" style="height: 300rpx">
					<swiper-item class="diygw-swiper-item">
						<view class="diygw-swiper-item-wrap">
							<image src="/static/pic1.jpg" class="diygw-swiper-image"></image>
							<view class="diygw-swiper-item-title swiper-title"> 滑块一 </view>
						</view>
					</swiper-item>
					<swiper-item class="diygw-swiper-item">
						<view class="diygw-swiper-item-wrap">
							<image src="/static/pic2.jpg" class="diygw-swiper-image"></image>
							<view class="diygw-swiper-item-title swiper-title"> 滑块二 </view>
						</view>
					</swiper-item>
					<swiper-item class="diygw-swiper-item">
						<view class="diygw-swiper-item-wrap">
							<image src="/static/pic3.jpg" class="diygw-swiper-image"></image>
							<view class="diygw-swiper-item-title swiper-title"> 滑块三 </view>
						</view>
					</swiper-item>
				</swiper>
			</view>
			<rich-text :nodes="text" class="diygw-col-24 text-clz"></rich-text>
			<view class="flex diygw-col-24 justify-center">
				<view class="diygw-tag margin-xs xs radius bg-green">
					<text> 深度学习 </text>
				</view>
				<view class="diygw-tag margin-xs xs radius bg-green">
					<text> 硬件优化 </text>
				</view>
				<view class="diygw-tag margin-xs xs radius bg-green">
					<text> 低功耗计算 </text>
				</view>
			</view>
			<rich-text :nodes="text2" class="diygw-col-24"></rich-text>
			<rich-text :nodes="text1" class="diygw-col-24 text1-clz"></rich-text>
			<button class="diygw-col-24 btn-clz diygw-btn-default">更新项目</button>
			<button class="diygw-col-24 btn1-clz diygw-btn-default">人员管理</button>
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
				globalData: { detail: {} },
				swiperIndex: 0,
				text: `<p><strong>类脑计算在边缘智能设备中的应用探索</strong></p>
<p><strong>项目简介</strong></p>`,
				text2: `<p style="text-align: center;">发布时间：2025年3月2日&nbsp; &nbsp; &nbsp; &nbsp;发布者：Jackson</p>`,
				text1: `<h2 style="white-space: pre-wrap;" data-zone-id="0" data-line-index="0" data-line="true"><strong style="font-family: inherit;">一、项目背景</strong></h2>
<p style="text-align: left;">&nbsp; &nbsp; &nbsp; &nbsp;随着物联网和人工智能技术的飞速发展，边缘智能设备的应用场景日益广泛。然而，传统计算架构在处理复杂任务时面临能耗高、效率低等问题。类脑计算作为一种模拟大脑神经结构和信息处理机制的新兴计算范式，有望为边缘智能设备带来突破。它能够实现高效的信息处理、强大的学习与自适应能力，契合边缘智能设备对低功耗、高性能的需求。因此，开展类脑计算在边缘智能设备中的应用探索具有重要的现实意义和广阔的应用前景。</p>
<div style="white-space: pre-wrap;" data-zone-id="0" data-line-index="3" data-line="true">
<h2 class="heading-h2"><strong>二、项目目标</strong></h2>
</div>
<div style="white-space: pre-wrap; text-align: left;" data-zone-id="0" data-line-index="4" data-line="true">&nbsp; &nbsp; &nbsp; &nbsp;本项目旨在深入研究类脑计算技术，并将其创新性地应用于边缘智能设备，提升设备的智能水平和性能表现。具体目标包括：设计并开发基于类脑计算的边缘智能设备原型，实现对复杂环境信息的快速感知与准确处理；优化类脑计算模型在边缘设备上的运行效率，降低能耗，延长设备续航时间；探索类脑计算在多领域边缘智能应用中的可行性，如智能家居监控、工业物联网故障诊断、智能交通监测等，为相关产业的智能化升级提供技术支撑和解决方案。</div>
<div style="white-space: pre-wrap;" data-zone-id="0" data-line-index="4" data-line="true">&nbsp;</div>
<div style="white-space: pre-wrap;" data-zone-id="0" data-line-index="5" data-line="true">
<h2 class="heading-h2"><strong>三、项目内容</strong></h2>
</div>
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol style="margin: 0px;">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="eU2CytUw" data-start="1"><strong>类脑计算模型研究与适配</strong>：深入分析和改进现有的类脑计算模型，使其更适合边缘智能设备的硬件资源和应用需求。研究模型的轻量化技术，减少计算复杂度和存储需求，确保模型能够在资源受限的边缘设备上高效运行。</li>
</ol>
</li>
</ol>
</li>
</ol>
</li>
</ol>
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol style="margin: 0px;">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="4VuKxUac" data-start="2"><strong>边缘智能设备硬件设计优化</strong>：结合类脑计算特点，对边缘智能设备的硬件架构进行针对性优化。探索新型硬件材料和电路设计，提高设备的计算能力和数据处理速度，同时降低功耗。设计专门的神经形态芯片或硬件加速器，以加速类脑计算模型的运算。</li>
</ol>
</li>
</ol>
</li>
</ol>
</li>
</ol>
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol style="margin: 0px;">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="ynXjMA7u" data-start="3"><strong>应用场景开发与验证</strong>：选取典型的边缘智能应用场景，如智能家居中的人体行为识别与安防监控、工业物联网中的设备故障预测与诊断、智能交通中的车辆检测与流量分析等，基于开发的类脑计算边缘智能设备进行应用开发。通过实际场景测试，验证设备在复杂环境下的性能和可靠性，评估类脑计算技术带来的优势。</li>
</ol>
</li>
</ol>
</li>
</ol>
</li>
</ol>
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol>
<li style="list-style-type: none;">
<ol style="margin: 0px;">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="ekXXlEwX" data-start="4"><strong>系统集成与平台搭建</strong>：将类脑计算模型、优化后的硬件以及应用程序进行系统集成，搭建一个完整的类脑计算边缘智能设备平台。该平台应具备良好的开放性和可扩展性，便于后续的功能升级和新应用的开发。同时，建立相应的测试与评估体系，对平台的性能和稳定性进行全面测试。</li>
</ol>
</li>
</ol>
</li>
</ol>
</li>
</ol>
<div style="white-space: pre-wrap;" data-zone-id="0" data-line-index="10" data-line="true">
<h2 class="heading-h2"><strong>四、项目创新点</strong></h2>
</div>
<ol style="margin: 0px;" start="1">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="jGkCEwqp" data-start="1"><strong>跨学科融合创新</strong>：融合神经科学、计算机科学、电子工程等多学科知识，将类脑计算这一前沿理论与边缘智能设备的实际应用紧密结合，为解决边缘计算中的难题提供全新的思路和方法。</li>
</ol>
<ol style="margin: 0px;" start="2">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="uqe2Y0mI" data-start="2"><strong>技术创新性突破</strong>：在类脑计算模型优化、边缘设备硬件设计以及系统集成等方面进行技术创新。通过提出新的模型结构、硬件架构和集成方法，实现边缘智能设备在性能、能耗和智能水平上的显著提升。</li>
</ol>
<ol style="margin: 0px;" start="3">
<li class="temp-li number1" style="line-height: 1.6; margin-top: 0px; margin-bottom: 0px; list-style-type: decimal;" data-line="true" data-list="number1" data-ol-id="zPKR4yVa" data-start="3"><strong>应用拓展创新</strong>：探索类脑计算在多个新兴边缘智能应用领域的应用可能性，开拓新的市场需求和应用场景。为不同行业的智能化转型提供创新性的技术解决方案，推动相关产业的发展。</li>
</ol>
<div style="white-space: pre-wrap;" data-zone-id="0" data-line-index="14" data-line="true">
<h2 class="heading-h2"><strong>五、项目预期成果</strong></h2>
</div>
<p><strong>&nbsp; &nbsp; &nbsp; &nbsp;技术成果</strong>：发表一系列高水平的学术论文，阐述项目在类脑计算与边缘智能设备融合技术方面的研究成果；申请多项相关技术专利，保护项目的创新成果。</p>
<p><strong>&nbsp; &nbsp; &nbsp; &nbsp;产品成果</strong>：成功开发出基于类脑计算的边缘智能设备原型，具备实际应用功能，并通过性能测试和验证。形成一套完整的类脑计算边缘智能设备平台，包括硬件设备、软件系统和应用开发工具。</p>
<p><strong>&nbsp; &nbsp; &nbsp; &nbsp;产业影响</strong>：与相关企业合作，将项目成果进行推广应用，推动类脑计算技术在边缘智能设备产业中的普及和发展。培养一批掌握类脑计算和边缘智能技术的专业人才，为产业发展提供人才支持。</p>`
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
				await this.getDetailFunction();
			},
			async initShow() {
				await this.checkLoginFunction();
			},
			// 获取项目详情 自定义方法
			async getDetailFunction(param) {
				let thiz = this;
				let option = param && (param.option || param.option == 0) ? param.option : thiz.globalOption || '';

				const res = await uniCloud.importObject('Project').getDetail({ id: option.id });
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

				this.globalData.detail = res.data;
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

			// 获取我的职位 自定义方法
			getMyPositionFunction(param) {
				let thiz = this;
				const userId = this.$session.getUserValue('user_id');
				for (const i in this.globalData.detail.memberList) {
					if (this.globalData.detail.memberList[i].user._id == userId) return this.globalData.detail.memberList[i].project_position;
				}
				return '游客';
			},
			changeSwiper(evt) {
				let swiperIndex = evt.detail.current;
				this.setData({ swiperIndex });
			}
		}
	};
</script>

<style lang="scss" scoped>
	.swiper-clz {
		margin-left: 10rpx;
		width: calc(100% - 10rpx - 10rpx) !important;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		margin-right: 10rpx;
	}
	.swiper-title {
		background-color: rgba(0, 0, 0, 0.281);
	}
	.text-clz {
		font-weight: bold;
		font-size: 38rpx !important;
		text-align: center;
	}
	.text1-clz {
		margin-left: 16rpx;
		width: calc(100% - 16rpx - 16rpx) !important;
		font-size: 30rpx !important;
		margin-top: 16rpx;
		margin-bottom: 16rpx;
		margin-right: 16rpx;
	}
	.btn-clz {
		padding-top: 20rpx;
		border-bottom-left-radius: 12rpx;
		color: #fff;
		padding-left: 20rpx;
		padding-bottom: 20rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #07c160;
		margin-left: 10rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		text-align: center;
		padding-right: 20rpx;
	}
	.btn1-clz {
		padding-top: 20rpx;
		border-bottom-left-radius: 12rpx;
		color: #fff;
		padding-left: 20rpx;
		padding-bottom: 20rpx;
		border-top-right-radius: 12rpx;
		margin-right: 10rpx;
		background-color: #07c160;
		margin-left: 10rpx;
		overflow: hidden;
		width: calc(100% - 10rpx - 10rpx) !important;
		border-top-left-radius: 12rpx;
		margin-top: 10rpx;
		border-bottom-right-radius: 12rpx;
		margin-bottom: 10rpx;
		text-align: center;
		padding-right: 20rpx;
	}
	.container332681 {
	}
</style>
