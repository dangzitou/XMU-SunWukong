<template>
	<view class="u-input" :class="{
			'u-input--border': border,
			'u-input--error': validateState
		}" :style="{
			padding: padding ? padding : `0 ${border ? 20 : 0}rpx`,
			borderColor: borderColor,
			textAlign: inputAlignCom,
			backgroundColor: backgroundColor,
		}" @tap.stop="inputClick">
		<input class="u-input__input" type="text" :class="{disabled:(disabled || type === 'select')}" :style="[getStyle]" :value="defaultValue" :placeholder="placeholder"
			:placeholderStyle="placeholderStyle" :disabled="disabled || type === 'select'" :maxlength="inputMaxlength"
			:focus="focus" @focus="onFocus" @blur="handleBlur" @input="handleInput" @confirm="onConfirm" />
		<view class="u-input__right-icon u-flex">
			<view class="u-input__right-icon__clear u-input__right-icon__item" @tap="onClear"
				v-if="clearableCom && valueCom != ''&& focused">
				<u-icon size="32" name="close-circle-fill" color="#c0c4cc" />
			</view>
			<view class="u-input__right-icon--select u-input__right-icon__item" :class="{
					'u-input__right-icon--select--reverse': selectOpen
				}">
				<text v-if="icon" :class="icon" :style="{ color: iconColor,fontSize:iconSize }"></text>
				<u-icon v-else name="arrow-right" size="26" color="#c0c4cc"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
	import Emitter from "../../libs/util/emitter.js";

	/**
	 * input 输入框
	 * @description 此组件为一个输入框，默认没有边框和样式，是专门为配合表单组件u-form而设计的，利用它可以快速实现表单验证，输入内容，下拉选择等功能。
	 * @tutorial http://uviewui.com/components/input.html
	 * @property {String} type 模式选择，见官网说明
	 * @property {Boolean} clearable 是否显示右侧的清除图标(默认true)
	 * @property {} v-model 用于双向绑定输入框的值
	 * @property {String} input-align 输入框文字的对齐方式(默认left)
	 * @property {String} placeholder placeholder显示值(默认 '请输入内容')
	 * @property {Boolean} disabled 是否禁用输入框(默认false)
	 * @property {String} placeholderStyle placeholder的样式，字符串形式，如"color: red;"(默认 "color: #c0c4cc;")
	 * @property {Object} custom-style 自定义输入框的样式，对象形式
	 * @property {Boolean} focus 是否自动获得焦点(默认false)
	 * @property {Boolean} fixed 如果type为textarea，且在一个"position:fixed"的区域，需要指明为true(默认false)
	 * @property {Boolean} password-icon type为password时，是否显示右侧的密码查看图标(默认true)
	 * @property {Boolean} border 是否显示边框(默认false)
	 * @property {String} border-color 输入框的边框颜色(默认#dcdfe6)
	 * @property {Boolean} auto-height 是否自动增高输入区域，type为textarea时有效(默认true)
	 * @property {String Number} height 高度，单位rpx(text类型时为70，textarea时为100)
	 * @example <u-input v-model="value" :type="type" :border="border" />
	 */
	export default {
		name: "u-input",
		emits: ["update:modelValue", "input", "change", "blur", "focus", "click", "touchstart", "confirm"],
		mixins: [Emitter],
		props: {
			// 通过双向绑定控制组件的弹出与收起
			// 绑定的值
			value: {
				type: [String, Number, Array],
				default: ''
			},
			// 通过双向绑定控制组件的弹出与收起
			// 绑定的值
			modelValue: {
				type: [String, Number, Array],
				default: ''
			},
			list: {
				type: Array,
				default: []
			},
			mode:{
				type: String,
				default: ""
			},
			iconName: {
				type: String,
				default: 'arrow-right'
			},
			iconColor: {
				type: String,
				default: '#c0c4cc'
			},
			// 输入框的类型，textarea，text，number
			type: {
				type: String,
				default: "select"
			},
			inputAlign: {
				type: String,
				default: ""
			},
			placeholder: {
				type: String,
				default: "请输入内容"
			},
			disabled: {
				type: Boolean,
				default: false
			},
			maxlength: {
				type: [Number, String],
				default: 140
			},
			placeholderStyle: {
				type: String,
				default: "color: #c0c4cc;"
			},
			// 输入框的自定义样式
			customStyle: {
				type: Object,
				default () {
					return {};
				}
			},
			// 如果 textarea 是在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true
			fixed: {
				type: Boolean,
				default: false
			},
			// 是否自动获得焦点
			focus: {
				type: Boolean,
				default: false
			},
			// input|textarea是否显示边框
			border: {
				type: Boolean,
				default: false
			},
			// 输入框的边框颜色
			borderColor: {
				type: String,
				default: "#dcdfe6"
			},
			autoHeight: {
				type: Boolean,
				default: false
			},
			// type=select时，旋转右侧的图标，标识当前处于打开还是关闭select的状态
			// open-打开，close-关闭
			selectOpen: {
				type: Boolean,
				default: false
			},
			// 高度，单位rpx
			height: {
				type: [Number, String],
				default: "auto"
			},
			// 是否可清空
			clearable: {
				type: [Boolean, String],
				default: true
			},
			// input的背景色
			backgroundColor: {
				type: String,
			},
			// input的padding
			padding: {
				type: String,
			},
			// 自定义value属性名
			valueName: {
				type: String,
				default: 'value'
			},
			// 自定义label属性名
			labelName: {
				type: String,
				default: 'label'
			},
			icon: {
				  type: String,
				  default: "",
			},
			iconSize: {
			  type: String,
			  default: "16px",
			}
		},
		data() {
			return {
				defaultValue: "",
				inputHeight: 70, // input的高度
				validateState: false, // 当前input的验证状态，用于错误时，边框是否改为红色
				focused: false, // 当前是否处于获得焦点的状态
				lastValue: "", // 用于头条小程序，判断@input中，前后的值是否发生了变化，因为头条中文下，按下键没有输入内容，也会触发@input时间
				uForm: {
					inputAlign: "",
					clearable: ""
				}
			};
		},
		watch: {
			valueCom(nVal, oVal) {
				// 当值发生变化，且为select类型时(此时input被设置为disabled，不会触发@input事件)，模拟触发@input事件
				if (nVal != oVal && this.type == "select"){
					this.initDefaultValue(nVal)
					this.handleInput()
				}
			}
		},
		computed: {
			valueCom() {
				// #ifndef VUE3
				return this.value;
				// #endif

				// #ifdef VUE3
				return this.modelValue;
				// #endif
			},
			inputAlignCom() {
				return this.inputAlign || this.uForm.inputAlign || "left";
			},
			clearableCom() {
				if (typeof this.clearable == "boolean") return this.clearable;
				if (typeof this.uForm.clearable == "boolean") return this.uForm.clearable;
				return true;
			},
			// 因为uniapp的input组件的maxlength组件必须要数值，这里转为数值，给用户可以传入字符串数值
			inputMaxlength() {
				return Number(this.maxlength);
			},
			getStyle() {
				let style = {};
				// 如果没有自定义高度，就根据type为input还是textare来分配一个默认的高度
				style.minHeight = (this.height ?
					isNaN(this.height) ? this.height : this.height + "rpx" :
					this.inputHeight + "rpx") + " !important";
				style = Object.assign(style, this.customStyle);
				return style;
			}
		},
		created() {
			// 监听u-form-item发出的错误事件，将输入框边框变红色
			// #ifndef VUE3
			this.$on("onFormItemError", this.onFormItemError);
			// #endif
			this.initDefaultValue(this.valueCom)
		},
		mounted() {
			let parent = this.$u.$parent.call(this, 'u-form');
			if (parent) {
				Object.keys(this.uForm).map(key => {
					this.uForm[key] = parent[key];
				});
			}
		},
		methods: {
			getColumnLabel(list,findValue,values,columnIndex){
				let column = findValue[columnIndex]
				let find = list.find(item=>{
					return item[this.valueName]==column
				})
				
				if(find){
					values.push(find[this.labelName])
					columnIndex++
					if(columnIndex<findValue.length){
						let children = find.children
						if(children&&children.length>0){
							this.getColumnLabel(children,findValue,values,columnIndex)
						}
					}
				}
			},
			initDefaultValue(findValue) {
				if(this.mode=='multi'){
					let valueLabel = [];
					let value = [];
					findValue.forEach((item, index) => {
						let find = this.list[index].find((data) => {
							return data[this.valueName] == item;
						});
					    valueLabel.push(find?find[this.labelName]:'');
					});
					this.defaultValue = valueLabel.join("-");
				}else if(this.mode=='mutil-column-auto'){
					if(Array.isArray(findValue)&&findValue.length>0){
						let columnIndex = 0;
						let values = [] 
						this.getColumnLabel(this.list,findValue,values,columnIndex)
						this.defaultValue = values.join("-");
					}
				}else{
					let data = this.list.filter(item => {
						if ((Array.isArray(findValue) && findValue.includes(item[this.valueName])) || (!Array.isArray(
								findValue) && item[this.valueName] == findValue)) {
							return item;
						}
					}).map(item => {
						return item[this.labelName]
					})
					this.defaultValue = data.join("-");
				}
				
			},
			/**
			 * change 事件
			 * @param event
			 */
			handleInput() {
				setTimeout(() => {
					// 将当前的值发送到 u-form-item 进行校验
					this.dispatch("u-form-item", "onFieldChange", this.defaultValue);
				}, 40);
			},
			/**
			 * blur 事件
			 * @param event
			 */
			handleBlur(event) {
				// 最开始使用的是监听图标@touchstart事件，自从hx2.8.4后，此方法在微信小程序出错
				// 这里改为监听点击事件，手点击清除图标时，同时也发生了@blur事件，导致图标消失而无法点击，这里做一个延时
				setTimeout(() => {
					this.focused = false;
				}, 100);
				// vue 原生的方法 return 出去
				this.$emit("blur", event.detail.value);
				this.$emit("update:modelValue", event.detail.value);
				setTimeout(() => {
					// 头条小程序由于自身bug，导致中文下，每按下一个键(尚未完成输入)，都会触发一次@input，导致错误，这里进行判断处理
					// #ifdef MP-TOUTIAO
					if (this.$u.trim(value) == this.lastValue) return;
					this.lastValue = value;
					// #endif
					// 将当前的值发送到 u-form-item 进行校验
					this.dispatch("u-form-item", "onFieldBlur", event.detail.value);
				}, 40);
			},
			onFormItemError(status) {
				this.validateState = status;
			},
			onFocus(event) {
				this.focused = true;
				this.$emit("focus");
			},
			onConfirm(e) {
				this.$emit("confirm", e.detail.value);
			},
			onClear(event) {
				this.defaultValue = ''
				this.$nextTick(() => {
					this.$emit("input", "");
					this.$emit("update:modelValue", "");
					this.$emit("change", "");
					this.focused = true;
				})
			},
			inputClick() {
				this.$emit("click");
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-input {
		position: relative;
		flex: 1;
		@include vue-flex;
		align-items: center;

		&__input {
			//height: $u-form-item-height;
			//font-size: 28rpx;
			// color: $u-main-color;

			flex: 1;
		}
		.disabled{
			position: relative;
			&::after{
				position: absolute;
				left:0;
				right:0;
				top:0;
				bottom: 0;
				content: '';
			}
		}
		&__textarea {
			width: auto;
			// font-size: 28rpx;
			// color: $u-main-color;
			padding: 10rpx 0;
			line-height: normal;
			flex: 1;
		}

		&--border {
			border-radius: 6rpx;
			border-radius: 4px;
			border: 1px solid $u-form-item-border-color;
		}

		&--error {
			border-color: $u-type-error !important;
		}

		&__right-icon {
			&__item {
				margin-left: 10rpx;
			}

			&--select {
				transition: transform 0.4s;

				&--reverse {
					transform: rotate(-180deg);
				}
			}
		}
	}
</style>