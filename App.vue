<template>
  <slot />
</template>

<script>
	export default {
		globalData: {
			userInfo: null,
			tabBar: [],
			homePage: '/pages/home',
			pages: [
				'/pages/home',
				'/pages/profile/main_page',
				'/pages/sign/login',
				'/pages/sign/register',
				'/pages/project/main_page',
				'/pages/project/detail/self1742568865041f2bbf651d0',
				'/pages/project/add',
				'/pages/project/edit',
				'/pages/project/user_detail',
				'/pages/project/member_action',
				'/pages/project/list',
				'/pages/user/list',
				'/pages/news/list',
				'/pages/news/detail',
				'/pages/message/main_page',
				'/pages/project/detail/self1742568667570d050aafc0e',
				'/pages/competition/list',
				'/pages/project/detail/self1742569914212f1a7b74235',
				'/pages/competition/add_project',
				'/pages/in_project/self',
				'/pages/project/detail/self',
				'/pages/in_project/self1742482255081401b597a77',
				'/pages/project/detail/self174256853910309a8499c21'
			],
			userData: {}
		},

		// 全局方法：更新消息tabbar徽标
		updateMessageTabBarBadge() {
			// 获取消息计数并更新tabbar徽标
			this.getMessageCount().then(totalCount => {
				if (totalCount > 0) {
					uni.setTabBarBadge({
						index: 2, // 消息tab的索引
						text: totalCount > 99 ? '99+' : totalCount.toString()
					});
				} else {
					uni.removeTabBarBadge({
						index: 2
					});
				}
			}).catch(error => {
				console.error('更新消息tabbar徽标失败:', error);
			});
		},

		// 获取消息总计数
		async getMessageCount() {
			try {
				const result = await uniCloud.callFunction({
					name: 'get_message_count'
				});

				if (result.result && result.result.status === 1) {
					const data = result.result.data;
					return (data.invite_count || 0) + (data.request_count || 0) + (data.system_count || 0);
				}
				return 0;
			} catch (error) {
				console.error('获取消息计数失败:', error);
				return 0;
			}
		}
	};
</script>
<style lang="scss">
	@import 'common/diygw-ui/iconfont.scss';
	@import 'common/diygw-ui/animate.css';
	@import 'common/diygw-ui/index.scss';

	@import './uni_modules/diy-uview-ui/index.scss';
	@import 'common/diygw-ui/uview.scss';
</style>
