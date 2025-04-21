'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
    switch (event.action) {
        case 'getCompetitionList':
            return await getCompetitionList();
        default:
            return {
                code: -1,
                msg: '未知操作'
            }
    }
};

// 获取竞赛列表
async function getCompetitionList() {
    try {
        // 从竞赛详情集合中获取数据
        const collection = db.collection('xm-stp-project_comp_detail')
        const res = await collection
            .orderBy('created_at', 'desc')  // 按创建时间倒序
            .limit(10)  // 限制返回10条
            .get()
            
        return {
            code: 0,
            msg: 'success',
            data: res.data
        }
    } catch (e) {
        return {
            code: -1,
            msg: '获取竞赛列表失败',
            error: e
        }
    }
} 