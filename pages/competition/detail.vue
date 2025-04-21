<template>
    <view class="container">
        <view class="competition-detail">
            <!-- 封面图 -->
            <image 
                :src="competition.cover_image || '/static/default.png'" 
                class="cover-image" 
                mode="widthFix"
            />
            
            <!-- 标题区域 -->
            <view class="header">
                <text class="title">{{ competition.title }}</text>
                <view class="organizer-info">
                    <text class="label">主办方：</text>
                    <text class="value">{{ competition.organizers || '未设置' }}</text>
                </view>
                <view class="organizer-info" v-if="competition.contractors">
                    <text class="label">承办方：</text>
                    <text class="value">{{ competition.contractors || '未设置' }}</text>
                </view>
            </view>

            <!-- 竞赛信息 -->
            <view class="info-section">
                <view class="info-item">
                    <text class="number">{{ competition.current_team_request_pending || 0 }}</text>
                    <text class="label">正在组队</text>
                </view>
                <view class="info-item">
                    <text class="number">{{ competition.team_completed_enroll || 0 }}</text>
                    <text class="label">已报名</text>
                </view>
            </view>

            <!-- 详情内容 -->
            <view class="description">
                <view class="section-title">竞赛详情</view>
                <rich-text :nodes="competition.description || '暂无详细信息'" class="content"></rich-text>
            </view>

            <!-- 修改按钮容器的类名和样式 -->
            <view class="bottom-action">
                <button 
                    class="diygw-btn bg-green"
                    @tap="navigateTo"
                    data-type="page"
                    data-url="/pages/competition/add_project"
                    :data-competition-id="competition._id"
                >
                    招募队友
                </button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            competition: {
                title: '',
                organizers: '',
                contractors: '',
                description: '',
                cover_image: '',
                current_team_request_pending: 0,
                team_completed_enroll: 0,
                create_time: null
            }
        }
    },
    onLoad(option) {
        if (option.id) {
            this.getCompetitionDetail(option.id);
        }
    },
    methods: {
        async getCompetitionDetail(id) {
            try {
                const db = uniCloud.database();
                const res = await db.collection('xm-stp-project_comp_detail')
                    .where({
                        _id: id
                    })
                    .field({
                        title: true,
                        organizers: true,
                        contractors: true,
                        description: true,
                        cover_image: true,
                        current_team_request_pending: true,
                        team_completed_enroll: true,
                        create_time: true
                    })
                    .get();

                if (res.result && res.result.data && res.result.data.length > 0) {
                    this.competition = res.result.data[0];
                    console.log('Competition detail:', this.competition);
                } else {
                    uni.showToast({
                        title: '竞赛信息不存在',
                        icon: 'error',
                        duration: 2000
                    });
                }
            } catch (error) {
                console.error('获取竞赛详情失败:', error);
                uni.showToast({
                    title: '获取竞赛详情失败',
                    icon: 'error',
                    duration: 2000
                });
            }
        },
        // 添加导航方法
        navigateTo(evt) {
            const url = evt.currentTarget.dataset.url;
            const competitionId = evt.currentTarget.dataset.competitionId;
            uni.navigateTo({
                url: `${url}?competition_id=${competitionId}`,
                fail: (error) => {
                    console.error('跳转失败:', error);
                    uni.showToast({
                        title: '跳转失败',
                        icon: 'error',
                        duration: 2000
                    });
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.competition-detail {
    background: #fff;
    min-height: 100vh;
    padding-bottom: 120rpx;
}

.cover-image {
    width: 100%;
    height: 400rpx;
    object-fit: cover;
}

.header {
    padding: 30rpx;
    background: #fff;
    margin-top: -40rpx;
    border-radius: 40rpx 40rpx 0 0;
    position: relative;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
}

.organizer-info {
    display: flex;
    align-items: center;
    margin-top: 10rpx;
    font-size: 28rpx;
    
    .label {
        color: #666;
        margin-right: 10rpx;
    }
    
    .value {
        color: #333;
    }
}

.info-section {
    display: flex;
    padding: 30rpx;
    background: #f8f8f8;
    border-radius: 20rpx;
    margin: 20rpx 30rpx;
}

.info-item {
    flex: 1;
    text-align: center;
    
    .number {
        font-size: 36rpx;
        font-weight: bold;
        color: #07c160;
        display: block;
    }
    
    .label {
        font-size: 24rpx;
        color: #666;
        margin-top: 10rpx;
    }
}

.description {
    padding: 30rpx;
    
    .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
        position: relative;
        padding-left: 20rpx;
        
        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 8rpx;
            height: 32rpx;
            background: #07c160;
            border-radius: 4rpx;
        }
    }
    
    .content {
        font-size: 28rpx;
        color: #666;
        line-height: 1.8;
    }
}

// 修改按钮容器样式
.bottom-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 40rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 100;
}

// 修改按钮样式
.diygw-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    font-size: 32rpx;
    border-radius: 40rpx;
    margin: 0;
    padding: 0;
}

.bg-green {
    background-color: #07c160;
    color: #ffffff;
}
</style> 