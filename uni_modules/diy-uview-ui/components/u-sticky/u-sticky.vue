<template>
	<view :class="'u-sticky'+elClass">
		<view class="u-sticky-wrap" :class="[elClass]" :style="{
			height: fixed ? height + 'px' : 'auto',
			backgroundColor: bgColor
		}">
			<view class="u-sticky" :style="{
				position: fixed ? 'fixed' : 'static',
				height: fixed ? height + 'px' : 'auto',
				top: stickyTop + 'px',
				left: left + 'px',
				width: width == 'auto' ? 'auto' : width + 'px',
				zIndex: uZIndex
			}">
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script>
	// 获取系统状态栏的高度
	let systemInfo = uni.getSystemInfoSync();
	/**
	 * sticky 吸顶
	 * @description 该组件与CSS中position: sticky属性实现的效果一致，当组件达到预设的到顶部距离时， 就会固定在指定位置，组件位置大于预设的顶部距离时，会重新按照正常的布局排列。
	 * @tutorial https://www.uviewui.com/components/sticky.html
	 * @property {String Number} offset-top 吸顶时与顶部的距离，单位rpx（默认0）
	 * @property {String Number} index 自定义标识，用于区分是哪一个组件
	 * @property {Boolean} enable 是否开启吸顶功能（默认true）
	 * @property {String} bg-color 组件背景颜色（默认#ffffff）
	 * @property {String Number} z-index 吸顶时的z-index值（默认970）
	 * @property {String Number} h5-nav-height 导航栏高度，自定义导航栏时(无导航栏时需设置为0)，需要传入此值，单位px（默认44）
	 * @event {Function} fixed 组件吸顶时触发
	 * @event {Function} unfixed 组件取消吸顶时触发
	 * @example <u-sticky offset-top="200"><view>塞下秋来风景异，衡阳雁去无留意</view></u-sticky>
	 */
	export default {
		name: "u-sticky",
		emits: ["fixed", "unfixed"],
		props: {
			// 吸顶容器到顶部某个距离的时候，进行吸顶，在H5平台，NavigationBar为44px
			offsetTop: {
				type: [Number, String],
				default: 0
			},
			// 是否用页面级
			isPage:{
				type: Boolean,
				default: false
			},
			pageScrollTop:{
				type: Number,
				default: 0
			},
			navbarHeight:{
				type: Number,
				default: 0
			},
			//列表中的索引值
			index: {
				type: [Number, String],
				default: ''
			},
			// 是否开启吸顶功能
			enable: {
				type: Boolean,
				default: true
			},
			// h5顶部导航栏的高度
			h5NavHeight: {
				type: [Number, String],
				default: 44
			},
			
			// 吸顶区域的背景颜色
			bgColor: {
				type: String,
				default: '#ffffff'
			},
			// z-index值
			zIndex: {
				type: [Number, String],
				default: ''
			},
			//用于兼容微信小程序用法
			isStatusBarHeight:{
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				fixed: false,
				height: 'auto',
				top:0,
				stickyTop: 0,
				statusBarHeight: systemInfo.statusBarHeight,
				elClass: this.$u.guid(),
				left: 0,
				width: 'auto',
			};
		},
		watch: {
			navbarHeight(val){
				if(val&&this.stickyTop!=val&&val>0){
					this.stickyTop = val
				}
			},
			pageScrollTop(val){
				this.setPageScrollFix(val)
			},
			offsetTop(val) {
				if(!this.isPage){
					this.initObserver();
				}
			},
			enable(val) {
				if(!this.isPage){
					if (val == false) {
						this.fixed = false;
						this.disconnectObserver('contentObserver');
					} else {
						this.initObserver();
					}
				}
			}
		},
		computed: {
			uZIndex() {
				return this.zIndex ? this.zIndex : this.$u.zIndex.sticky;
			}
		},
		mounted() {
			this.initObserver();
		},
		methods: {
			initObserver() {
				if (!this.enable) return;
				this.$nextTick(() => {
					// #ifdef H5
					this.stickyTop = this.offsetTop != 0 ? this.offsetTop/2 + this.h5NavHeight : this
						.h5NavHeight;
					// #endif
					// #ifdef MP
					this.stickyTop = (this.offsetTop != 0 ? uni.upx2px(this.offsetTop-10) : 0) + (this.isStatusBarHeight?this.statusBarHeight:0);
					// #endif
					// #ifndef H5 || MP
					this.stickyTop = (this.offsetTop != 0 ? uni.upx2px(this.offsetTop) : 0) + (this.isStatusBarHeight?this.statusBarHeight:0);
					// #endif
					if(this.navbarHeight){
						this.stickyTop = this.navbarHeight
					}
					this.disconnectObserver('contentObserver');
					this.$uGetRect('.' + this.elClass).then((res) => {
						this.height = res.height;
						this.left = res.left;
						this.width = res.width;
						this.top = res.top
						if(!this.isPage){
							this.$nextTick(() => {
								this.observeContent();
							});
						}
					});
				})
			},
			observeContent() {
				this.disconnectObserver('contentObserver');
				const contentObserver = uni.createIntersectionObserver(this, {
					thresholds: [0.95, 0.98, 1]
				});
				contentObserver.relativeToViewport({
					top: -this.stickyTop
				});
				contentObserver.observe('.' + this.elClass, res => {
					if (!this.enable) return;
					this.setFixed(res.boundingClientRect.top);
				});
				this.contentObserver = contentObserver;
			},
			setPageScrollFix(top){
				let  fixed = (this.top - 10) < top;
				if (fixed) this.$emit('fixed', this.index);
				else if (this.fixed) this.$emit('unfixed', this.index);
				this.fixed = fixed;
			},
			setFixed(top) {
				let fixed = top < this.stickyTop;
				if (fixed) this.$emit('fixed', this.index);
				else if (this.fixed) this.$emit('unfixed', this.index);
				this.fixed = fixed;
			},
			disconnectObserver(observerName) {
				const observer = this[observerName];
				observer && observer.disconnect();
			},
		},
		// #ifndef VUE3
		beforeDestroy() {
			this.disconnectObserver('contentObserver');
		},
		// #endif

		// #ifdef VUE3
		beforeUnmount() {
			this.disconnectObserver('contentObserver');
		},
		// #endif
	};
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-sticky {
		z-index: 9999999999;
	}
</style>