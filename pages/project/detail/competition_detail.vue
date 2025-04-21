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
			<button class="diygw-col-24 btn1-clz diygw-btn-default">人员招募</button>
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
				text: `<p><span style="font-size: 18px;"><strong style="margin: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">「智算未来杯」全国高校</strong></span></p>
<p><span style="font-size: 18px;"><strong style="margin: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">生成式</strong></span><span style="font-size: 18px;"><strong style="margin: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">人工智能创新大赛</strong></span><br style="color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; background-color: #fcfcfc;" /><span style="font-size: 18px;"><strong style="margin: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​（FutureGen AI Innovation Challenge）​</strong></span></p>`,
				text2: `<p style="text-align: center;">发布时间：2025年3月2日18:00&nbsp; &nbsp; 发布者：厦门大学创客团队</p>`,
				text1: `<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;"><strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">竞赛背景</strong></h3>
<p>&nbsp;</p>
<p style="margin: var(--yb-md-content-gap-main); border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">随着生成式人工智能（如大语言模型、多模态生成技术）的快速发展，如何高效、安全、创新地应用相关技术解决实际问题成为学术界和产业界的核心议题。为推动高校学生在生成式AI领域的探索，中国计算机学会（CCF）联合国内顶尖科技企业发起本项竞赛，聚焦&ldquo;<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">大模型优化与应用创新</strong>&rdquo;，鼓励参赛者结合垂直场景提出兼具技术深度和实用价值的解决方案。</p>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">竞赛主题</strong></h3>
<p>&nbsp;</p>
<p style="margin: var(--yb-md-content-gap-main); border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;"><strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">​&ldquo;小模型，大智慧：轻量化生成式AI的实践与突破&rdquo;​</strong></p>
<p style="margin: var(--yb-md-content-gap-main); border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;"><br />要求参赛者在有限计算资源（如单张消费级GPU）下，完成以下任务之一：</p>
<ol style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">模型优化</strong>：基于开源大模型（如LLaMA、Stable Diffusion）进行轻量化改造（如剪枝、量化、知识蒸馏），提升推理效率。</li>
<li style="margin: 0.5em 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">场景创新</strong>：设计基于生成式AI的垂直领域应用（如教育、医疗、艺术创作），需包含完整的前后端交互原型。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">伦理与安全</strong>：针对大模型的内容生成风险（如偏见、虚假信息），提出可落地的检测或防御方案。</li>
</ol>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">参赛对象</strong></h3>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">全国高校在校本科生、研究生，允许跨校组队（每队1-4人）。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">需提交代码、技术文档及演示视频，禁止直接调用商业API（如ChatGPT、Midjourney）。</li>
</ul>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">赛程安排</strong></h3>
<div class="hyc-common-markdown__table-wrapper" style="margin: 8px 0px; border: 1px solid var(--yb-color-divider-primary); font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; overflow-x: auto; white-space: nowrap; border-radius: 8px; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<table style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 14px; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; border-spacing: 0px; min-width: 100%; width: max-content; max-width: max-content;">
<thead style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<th style="margin: 0px; padding: 0.66em 1em; vertical-align: middle; background-color: var(--yb-md-th-bg-color); color: var(--yb-md-th-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">阶段</th>
<th style="margin: 0px; padding: 0.66em 1em; vertical-align: middle; background-color: var(--yb-md-th-bg-color); color: var(--yb-md-th-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">时间</th>
<th style="margin: 0px; padding: 0.66em 1em; vertical-align: middle; background-color: var(--yb-md-th-bg-color); color: var(--yb-md-th-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">内容</th>
</tr>
</thead>
<tbody style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">初赛</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">10月</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">线上提交技术方案书（含可行性分析），30%队伍晋级</td>
</tr>
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">复赛</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">11月</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">开发阶段：提交代码、优化报告、原型演示视频</td>
</tr>
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">决赛</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">12月</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">线下答辩+现场任务挑战（如48小时内完成指定场景的模型微调）</td>
</tr>
</tbody>
</table>
</div>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">评分规则</strong></h3>
<div class="hyc-common-markdown__table-wrapper" style="margin: 8px 0px; border: 1px solid var(--yb-color-divider-primary); font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; overflow-x: auto; white-space: nowrap; border-radius: 8px; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<table style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 14px; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; border-spacing: 0px; min-width: 100%; width: max-content; max-width: max-content;">
<thead style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<th style="margin: 0px; padding: 0.66em 1em; vertical-align: middle; background-color: var(--yb-md-th-bg-color); color: var(--yb-md-th-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">维度</th>
<th style="margin: 0px; padding: 0.66em 1em; vertical-align: middle; background-color: var(--yb-md-th-bg-color); color: var(--yb-md-th-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">权重</th>
<th style="margin: 0px; padding: 0.66em 1em; vertical-align: middle; background-color: var(--yb-md-th-bg-color); color: var(--yb-md-th-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">说明</th>
</tr>
</thead>
<tbody style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">技术创新性</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">30%</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">是否提出新算法、新架构或突破性优化方法</td>
</tr>
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">场景价值</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">25%</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">解决的实际问题是否明确，用户需求匹配度</td>
</tr>
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">工程实现</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">20%</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">代码质量、系统稳定性、资源利用率</td>
</tr>
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">伦理合规</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">15%</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-even); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">数据隐私保护、内容安全策略</td>
</tr>
<tr style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline;">
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">答辩表现</strong></td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">10%</td>
<td style="margin: 0px; padding: 0.66em 1em; font: var(--yb-font-body-medium); vertical-align: middle; background-color: var(--yb-md-td-bg-color-odd); color: var(--yb-md-td-color); text-align: center; max-width: 448px; text-wrap-mode: wrap; box-sizing: border-box; border: 0px initial initial;">逻辑清晰度、团队协作能力</td>
</tr>
</tbody>
</table>
</div>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">奖项设置</strong></h3>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">特等奖（1队）​</strong>：10万元奖金 + 合作企业直通实习offer + CCF推荐信</li>
<li style="margin: 0.5em 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">一等奖（3队）​</strong>：5万元奖金 + 云计算算力资源包</li>
<li style="margin: 0.5em 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">最佳技术突破奖</strong>：颁发给模型优化赛道的最高分团队</li>
<li style="margin: 0.5em 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">最佳社会影响奖</strong>：颁发给伦理与安全赛道的优秀方案</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">所有决赛队伍</strong>：获得竞赛组委会认证的AI工程师能力证书</li>
</ul>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">特色环节</strong></h3>
<ol style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">​&ldquo;黑客松&rdquo;挑战</strong>：决赛现场提供限定数据集（如罕见病医疗文本），要求团队快速训练一个分类+生成联合模型。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">企业命题赛道</strong>：由合作企业（如字节跳动、科大讯飞）发布真实业务场景题目，优胜者可参与企业项目孵化。</li>
</ol>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">技术支撑</strong></h3>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">竞赛平台提供云端GPU算力（NVIDIA A100）、开源数据集（如COIG-CN中文指令数据集）。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">技术导师团由高校教授与企业AI实验室负责人联合组成。</li>
</ul>
<hr style="margin: 16px 0px; border-right-style: initial; border-right-color: initial; border-bottom-style: initial; border-bottom-color: initial; border-left-style: initial; border-left-color: initial; border-image: initial; border-top: 1px solid var(--yb-md-hr-border-color); background: none #fcfcfc; color: rgba(0, 0, 0, 0.9); font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-size: 16px; font-weight: 400; white-space-collapse: collapse;" />
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">宣传标语</strong></h3>
<p style="margin: var(--yb-md-content-gap-main); border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;"><strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">​&ldquo;从代码到创造，让生成式AI回归解决问题的本质！&rdquo;​</strong></p>
<p style="margin: var(--yb-md-content-gap-main); border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">&nbsp;</p>
<h3 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;"><strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">主办方组成</strong></h3>
<h4 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">1. 核心主办单位</strong></h4>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">中国计算机学会（CCF）人工智能专业委员会</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">负责竞赛的学术指导、评委邀请和标准制定。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">提供学术资源支持（如开源数据集、论文检索权限）。</li>
</ul>
</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">国家人工智能技术创新中心</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">提供政策指导和行业趋势分析。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">协调企业命题赛道与产业资源对接。</li>
</ul>
</li>
</ul>
<h4 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">2. 联合主办企业</strong></h4>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">深蓝科技（DeepBlue Tech）​</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">国内头部AI公司，提供竞赛技术平台（如大模型训练工具链）。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">为决赛队伍提供算力支持（A100/A800 GPU集群）。</li>
</ul>
</li>
<li style="margin: 0.5em 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">凌云云计算（LingCloud）​</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">赞助竞赛用云服务器资源，提供&ldquo;训练资源池&rdquo;供参赛者按需申请。</li>
</ul>
</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">启智开源社区（OpenGen Community）​</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">维护竞赛开源代码库，推动优秀方案开源化。</li>
</ul>
</li>
</ul>
<h4 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">3. 行业合作方</strong></h4>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">中国人工智能产业发展联盟（AIIA）​</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">提供垂直领域企业需求（如医疗、金融场景命题）。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">协助推广优秀作品至产业界落地。</li>
</ul>
</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">高校人工智能院长联席会</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">协调高校参赛资格审核，推动竞赛学分认证。</li>
</ul>
</li>
</ul>
<h4 style="margin: var(--yb-md-content-gap-t3); border: 0px; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; vertical-align: baseline; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">4. 媒体与传播伙伴</strong></h4>
<p style="margin: var(--yb-md-content-gap-main); border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-weight: 400; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word; color: rgba(0, 0, 0, 0.9); white-space-collapse: collapse; background-color: #fcfcfc;">&nbsp;</p>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">科技之心（TechHub）​</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">独家线上直播平台，负责竞赛全程报道。</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">开设专栏展示优秀团队故事与技术解读。</li>
</ul>
</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">
<p style="margin-top: 0px; margin-bottom: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">AI科技评论（AI Tech Review）​</strong></p>
<ul style="margin-top: 0.5em; margin-bottom: 0px; margin-left: 1em; border: 0px; font: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial;">
<li style="margin: 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">发布竞赛白皮书与年度技术趋势报告。</li>
</ul>
</li>
</ul>
<p>&nbsp;</p>
<ul style="margin-left: 1.5em; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-variant-alternates: inherit; font-variant-position: inherit; font-variant-emoji: inherit; font-stretch: inherit; font-size: 16px; line-height: inherit; font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline; list-style-position: initial; list-style-image: initial; color: rgba(0, 0, 0, 0.9); background-color: #fcfcfc;">
<li style="margin: 0px 0px 0.5em; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;"><strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">报名启动</strong>：2025年9月1日</li>
<li style="margin: 0.5em 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">报名截止</strong>：2025年9月30日</li>
<li style="margin: 0.5em 0px 0px; border: 0px; font: inherit; vertical-align: baseline; word-break: break-word; overflow-wrap: break-word;">​<strong style="margin: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-size: inherit; line-height: inherit; font-family: inherit; font-optical-sizing: inherit; font-size-adjust: inherit; font-kerning: inherit; font-feature-settings: inherit; font-variation-settings: inherit; vertical-align: baseline;">竞赛全程</strong>：2025年10月1日 - 12月15日</li>
</ul>`
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
