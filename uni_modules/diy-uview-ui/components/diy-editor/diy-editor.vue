<template>
	<view class="diygw-col-24">
		<view :style="{height:height}" class='flex  flex-direction-column wrapper'>
			<view class='toolbar' @tap="format">
				<view v-if="tools.indexOf('undo')>-1" class="iconfont icon-undo" @tap="undo"></view>
				<view v-if="tools.indexOf('redo')>-1" class="iconfont icon-redo" @tap="redo"></view>
				<view v-if="tools.indexOf('bold')>-1" :class="formats.bold ? 'ql-active' : ''" class="iconfont icon-zitijiacu" data-name="bold"></view>
				<view v-if="tools.indexOf('italic')>-1" :class="formats.italic ? 'ql-active' : ''" class="iconfont icon-zitixieti" data-name="italic"></view>
				<view v-if="tools.indexOf('underline')>-1" :class="formats.underline ? 'ql-active' : ''" class="iconfont icon-zitixiahuaxian" data-name="underline"></view>
				<view v-if="tools.indexOf('strike')>-1" :class="formats.strike ? 'ql-active' : ''" class="iconfont icon-zitishanchuxian" data-name="strike"></view>
				<view v-if="tools.indexOf('align-left')>-1" :class="formats.align === 'left' ? 'ql-active' : ''" class="iconfont icon-zuoduiqi" data-name="align" data-value="left"></view>
				<view v-if="tools.indexOf('align-center')>-1" :class="formats.align === 'center' ? 'ql-active' : ''" class="iconfont icon-juzhongduiqi" data-name="align" data-value="center"></view>
				<view v-if="tools.indexOf('align-right')>-1" :class="formats.align === 'right' ? 'ql-active' : ''" class="iconfont icon-youduiqi" data-name="align" data-value="right"></view>
				<view v-if="tools.indexOf('align-justify')>-1" :class="formats.align === 'justify' ? 'ql-active' : ''" class="iconfont icon-zuoyouduiqi" data-name="align" data-value="justify"></view>
				<view v-if="tools.indexOf('lineHeight')>-1" :class="formats.lineHeight ? 'ql-active' : ''" class="iconfont icon-line-height" data-name="lineHeight" data-value="2"></view>
				<view v-if="tools.indexOf('letterSpacing')>-1" :class="formats.letterSpacing ? 'ql-active' : ''" class="iconfont icon-Character-Spacing" data-name="letterSpacing" data-value="2em"></view>
				<view v-if="tools.indexOf('marginTop')>-1" :class="formats.marginTop ? 'ql-active' : ''" class="iconfont icon-722bianjiqi_duanqianju" data-name="marginTop" data-value="20px"></view>
				<view v-if="tools.indexOf('previewarginBottom')>-1" :class="formats.previewarginBottom ? 'ql-active' : ''" class="iconfont icon-723bianjiqi_duanhouju" data-name="marginBottom" data-value="20px"></view>
				<view v-if="tools.indexOf('removeFormat')>-1" class="iconfont icon-clearedformat" @tap="removeFormat"></view>
				<view v-if="tools.indexOf('fontFamily')>-1" :class="formats.fontFamily ? 'ql-active' : ''" class="iconfont icon-font" data-name="fontFamily" data-value="仿宋, 仿宋_GB2312"></view>
			
				<!-- <picker v-if="tools.indexOf('fontSize')>-1" :range="fontSizelist" @change="formatsChange" @tap.stop="formatsChange" data-name="size" class="iconfont icon-fontsize" :class="formats.size? ' ql-active' : ''"></picker> -->
				<picker v-if="tools.indexOf('fontSize')>-1" range-key="name" :range="fontSizelist" @change="formatsChange" @tap.stop="formatsChange" data-name="fontSize" class="iconfont icon-fontsize" :class="formats.fontSize? ' ql-active' : ''"></picker>
				<!-- <view v-if="tools.indexOf('fontSize')>-1" :class="formats.fontSize === '24px' ? 'ql-active' : ''" class="iconfont icon-fontsize" data-name="fontSize" data-value="24px"></view> -->
				<view v-if="tools.indexOf('color')>-1" :style="(formats.color != '#FFFFFF'&&formats.color != '#fff'&&formats.color != '#ffffff')? 'color:' + formats.color : ''" class="iconfont icon-text_color" data-name="color" @tap.stop="openColor"></view>
				<view v-if="tools.indexOf('backgroundColor')>-1" :style="(formats.backgroundColor != '#FFFFFF'&&formats.backgroundColor != '#fff'&&formats.backgroundColor != '#ffffff') ? 'color:' + formats.backgroundColor : ''" class="iconfont icon-fontbgcolor" data-name="backgroundColor" @tap.stop="openColor"></view>

				<view v-if="tools.indexOf('insertDate')>-1" class="iconfont icon-date" @tap="insertDate"></view>
				<view v-if="tools.indexOf('list')>-1" class="iconfont icon--checklist" data-name="list" data-value="check"></view>
				<view v-if="tools.indexOf('ordered')>-1" :class="formats.list === 'ordered' ? 'ql-active' : ''" class="iconfont icon-youxupailie" data-name="list" data-value="ordered"></view>
				<view v-if="tools.indexOf('bullet')>-1" :class="formats.list === 'bullet' ? 'ql-active' : ''" class="iconfont icon-wuxupailie" data-name="list" data-value="bullet"></view>
				
				<view v-if="tools.indexOf('indent-reduce')>-1" class="iconfont icon-outdent" data-name="indent" data-value="-1"></view>
				<view v-if="tools.indexOf('indent-add')>-1" class="iconfont icon-indent" data-name="indent" data-value="+1"></view>
				<view v-if="tools.indexOf('insert-divider')>-1" class="iconfont icon-fengexian" @tap="insertDivider"></view>
				<view v-if="tools.indexOf('insert-image')>-1" class="iconfont icon-charutupian" @tap="selectImage"></view>
				<picker v-if="tools.indexOf('header')>-1" :range="headerlist" @change="formatsChange" @tap.stop="formatsChange" data-name="header" :class="'iconfont icon-format-header-'+(headerindex==0?1:headerindex)+(formats.header? ' ql-active' : '')"></picker>
				<!-- <view v-if="tools.indexOf('header')>-1" :class="formats.header === 1 ? 'ql-active' : ''" class="iconfont icon-format-header-1" data-name="header" :data-value="3"></view> -->
				<view v-if="tools.indexOf('script-sub')>-1" :class="formats.script === 'sub' ? 'ql-active' : ''" class="iconfont icon-zitixiabiao" data-name="script" data-value="sub"></view>
				<view v-if="tools.indexOf('script-super')>-1" :class="formats.script === 'super' ? 'ql-active' : ''" class="iconfont icon-zitishangbiao" data-name="script" data-value="super"></view>
				<view v-if="tools.indexOf('direction')>-1" :class="formats.direction === 'rtl' ? 'ql-active' : ''" class="iconfont icon-direction-rtl" data-name="direction" data-value="rtl"></view>
				<view v-if="tools.indexOf('clear')>-1" class="iconfont icon-shanchu" @tap="clear"></view>
			
			</view>
			<view class="flex-sub editor-wrapper">
				<editor id="editor" class="ql-container" :placeholder="placeholder" showImgSize showImgToolbar showImgResize @statuschange="onStatusChange" :read-only="readOnly" @ready="onEditorReady" @input="editorChange">
				</editor>
			</view>
		</view>
		<block v-if="modal.show">
			<view class="mask" />
			<view class="modal">
				<view class="modal_title">{{modal.title}}</view>
				<input type="text" class="modal_input" v-model="modal.value" />
				<view class="modal_foot">
					<view class="modal_button" @tap="modalCancel">取消</view>
					<view class="modal_button" style="color:#576b95;border-left:1px solid rgba(0,0,0,.1)" @tap="modalConfirm">确定</view>
				</view>
			</view>
		</block>
		<diy-color-picker v-model="showColorPicker" :hexcolor="hexcolor" @confirm="getColor"></diy-color-picker>
	</view>
</template>

<script>
	import Emitter from "../../libs/util/emitter.js";
	
	export default {
		mixins: [Emitter],
		emits: ["update:modelValue", "change","input"],
		props: {
			value: {
				type: String
			},
			modelValue:{
				type: String
			},
			placeholder: {
				type: String,
				default: '开始输入...'
			},
			height:{
				type:String,
				default: '100vh'
			},
			tools: {
				type: Array,
				default: function() {
					return [
						'bold',
						'italic',
						'underline',
						'strike',
						'align-left',
						'align-center',
						'align-right',
						'align-justify',
						'lineHeight',
						'letterSpacing',
						'marginTop',
						'previewarginBottom',
						'removeFormat',
						'fontFamily',
						'fontSize',
						'color',
						'backgroundColor',
						'insertDate',
						'list',
						'ordered',
						'bullet',
						'redo',
						'undo',
						'indent-reduce',
						'indent-add',
						'insert-divider',
						'insert-image',
						'header',
						'script-sub',
						'script-super',
						'clear',
						'direction'
					];
				}
			},
			//上传图片
			action:{
				type:String,
				default: '/sys/storage/upload'
			}/*,
			uploadFile: {
				type: Function
			}*/
		},
		data() {
			return {
				modal: {
					show: false,
					title: '',
					value: ''
				},
				showColorPicker:false,
				html: '',
				fontSizelist: [{
					code: "",
					name: "默认"
				}, {
					code: "x-small",
					name: "超小"
				}, {
					code: "small",
					name: "小"
				}, {
					code: "medium",
					name: "中等"
				}, {
					code: "large",
					name: "大"
				}, {
					code: "x-large",
					name: "超大"
				}, {
					code: "xx-large",
					name: "超级大"
				}],
				headerlist: ['默认', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
				headerindex: 0,
				colorPickerName: '',
				hexcolor: "#0000ff",
				readOnly: false,
				formats: {},
				update: 0,
				uForm:{
					inputAlign: "",
					clearable: ""
				}
			}
		},
		watch: {
			value: function(newval) {
				this.html = newval
			},
			modelValue: function(newval) {
				this.html = newval
			},
			html: function(newvar) {
				if (this.editorCtx) {
					if (this.update == 0) {
						this.editorCtx.setContents({
							html: this.html
						});
					} else {
						this.update = 0
					}
				}
			}
		},
		created() {
			// #ifndef VUE3
			this.html = this.value;
			// #endif
					
			// #ifdef VUE3
			this.html = this.modelValue;
			// #endif
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
			openColor(e) {
				let dataset = e.target.dataset
				this.colorPickerName = dataset.name;
				this.hexcolor = dataset.value;
				this.showColorPicker = true
				// this.$refs.colorPicker.open();
			},
			getColor(e) {
				let msg = '';
				switch (this.colorPickerName) {
					case 'backgroundColor':
						if (e.hex.toUpperCase() == '#FFFFFF') {
							e.hex = '';
						}
						msg = '背景色';
						break;
					case 'color':
						msg = '颜色';
						break;
				}
				this.setformat(this.colorPickerName, e.hex, msg + e.hex);
			},

			modalConfirm() {
				let src = this.modal.value || '';
				if (src) {
					this.insertImage(src, null, null)
				}
				this.modal.show = false;
			},
			modalCancel() {
				this.modal.show = false;
			},

			formatsChange(e) {
				if (e.type == 'click') { //不让上层触发点击事件
					return false;
				}

				let value = e.detail.value;
				let name = e.target.dataset.name
				if (name == 'header') {
					this.headerindex = value;
					if (value == 0) {
						value = null;
					}
				} else if (name == 'fontSize') {
					value = this.fontSizelist[value].code;
				} else if (name == 'size') {
					value = value > 0 ? value : 1;
				}
				let msg = name + '设置成功';
				// console.log(value);
				this.setformat(name, value, msg)
				return false;
			},
			editorChange(e) {
				this.update = 1
				this.$emit('input', e.detail.html);
				
				this.$emit("update:modelValue", e.detail.html);
				
				// vue 原生的方法 return 出去
				this.$emit("change", e.detail.html);
				// 将当前的值发送到 u-form-item 进行校验
				this.dispatch("u-form-item", "onFieldBlur", e.detail.html);
			},
			readOnlyChange() {
				this.readOnly = !this.readOnly
			},
			onEditorReady() {
				const query = uni.createSelectorQuery().in(this);
				query.select('#editor').context((res) => {
					this.editorCtx = res.context
					if (this.html) {
						this.editorCtx.setContents({
							html: this.html
						});
					}
				}).exec()
			},
			undo() {
				this.editorCtx.undo()
			},
			redo() {
				this.editorCtx.redo()
			},
			format(e) {
				let {
					name,
					value
				} = e.target.dataset
				if (!name) return
				// console.log('format', name, value)
				this.editorCtx.format(name, value)

			},
			setformat(name, value, msg) {
				this.editorCtx.format(name, value);
				// this.toast(msg);
			},
			toast(msg) {
				uni.showToast({
					duration: 600,
					icon: 'none',
					title: msg
				});
			},
			onStatusChange(e) {
				const formats = e.detail
				this.formats = formats
			},
			insertDivider() {
				this.editorCtx.insertDivider({
					success: function() {
						// console.log('insert divider success')
					}
				})
			},
			clear() {
				uni.showModal({
					content: "确定清空编辑器内容?",
					complete: (rs) => {
						if (rs.confirm) {
							this.editorCtx.clear({
								success: function(res) {
									console.log("clear success")
								}
							})
						}
					}
				})
			},
			removeFormat() {
				this.editorCtx.removeFormat()
			},
			insertDate() {
				const date = new Date()
				let month = date.getMonth() + 1
				if(month<10){
					month = "0" +month
				}
				let day = date.getDate()
				if(day<10){
					day = "0" + day
				}
				const formatDate = `${date.getFullYear()}-${month}-${day}`
				this.editorCtx.insertText({
					text: formatDate
				})
			},
			selectImage() {
				let thiz = this
				// 本地选取 自已处理上传方法，包括选择文件
				uni.chooseImage({
					count: 9,
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有javascript:;
					success: function (res) {
						// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
						let tempFilePaths = res.tempFilePaths;
						for (let i = 0; i < tempFilePaths.length; i++) {
							let header = {}
							if(getApp().globalData.currentPage && getApp().globalData.currentPage.$session){
								header.Authorization =  getApp().globalData.currentPage.$session.getToken()||''
							}
							uni.uploadFile({
								url: getApp().globalData.currentPage && getApp().globalData.currentPage.$http?getApp().globalData.currentPage.$http.setUrl(thiz.action,{}):thiz.action,
								filePath: tempFilePaths[i],
								name: 'file',
								header:header,
								success(res) {
									let data = getApp().globalData.currentPage.$tools.fromJson(res.data);
									let url = ''
									if(data.url){
										url = getApp().globalData.currentPage.$tools.renderImage(data.url);
									}
									if(data.data &&getApp().globalData.currentPage.$tools.isObject(data.data) && data.data.url){
										url = getApp().globalData.currentPage.$tools.renderImage(data.data.url);
									}
									if(url){
										thiz.insertImage(url,null,null);
									}
								}
							});
						}
					},
				});
				// uni.showActionSheet({
				// 	itemList: ['本地选取', '远程链接'],
				// 	success: res => {
				// 		if (res.tapIndex === 0) {
							
				// 		} else {
				// 			thiz.modal = {
				// 				show: true,
				// 				title: '图片链接',
				// 				value: ''
				// 			}
				// 		}
				// 	}
				// })
			},
			insertImage(src, data, alt) {
				debugger
				let inserdata = {
					src: src
				}
				if (data) {
					inserdata.data = data
				}
				if (alt) {
					inserdata.alt = alt
				}
				this.editorCtx.insertImage({
					...inserdata,
					success: function() {
						// console.log('insert image success')
					}
				})
			}
		}
	}
</script>

<style>
	@import "./editor-icon.css";

	.container {
		width: 100%;
	}

	.wrapper {
		width: 100%;
	}

	.editor-wrapper {
		width: 100%;
		background: #fff;
	}

	.iconfont {
		display: inline-block;
		padding: 8px 8px;
		cursor: pointer;
		font-size: 25px;
	}

	.toolbar {
		box-sizing: border-box;
		border-bottom: 0;
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
	}

	.ql-container {
		box-sizing: border-box;
		padding: 10px;
		width: 100%;
		min-height: 30vh;
		height: 100%;
		font-size: 16px;
		line-height: 1.5;
	}

	.ql-active {
		color: #06c;
	}

	/* 模态框 */
	.modal {
		position: fixed;
		z-index: 999999;
		top: 50%;
		left: 16px;
		right: 16px;
		background-color: #fff;
		border-radius: 12px;
		transform: translateY(-50%);
	}

	.modal_title {
		padding: 32px 24px 16px;
		font-size: 17px;
		font-weight: 700;
		text-align: center;
	}

	.modal_input {
		display: block;
		padding: 5px;
		line-height: 2.5em;
		height: 2.5em;
		margin: 0 24px 32px 24px;
		font-size: 14px;
		border: 1px solid #dfe2e5;
	}

	.modal_foot {
		display: flex;
		line-height: 56px;
		font-weight: 700;
		border-top: 1px solid rgba(0, 0, 0, .1);
	}

	.modal_button {
		flex: 1;
		text-align: center;
	}

	/* 遮罩版 */
	.mask {
		position: fixed;
		z-index: 99999;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: black;
		opacity: 0.5;
	}
</style>
