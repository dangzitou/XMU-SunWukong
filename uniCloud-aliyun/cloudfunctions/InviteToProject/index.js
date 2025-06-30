'use strict';

// 使用普通的 database 方法
const db = uniCloud.database();
const dbCmd = db.command;
const { getStatus, getInviteStatus } = require('project-history');
const { second } = require('timestamp');

// 发送项目通知的辅助函数
async function sendProjectNotification(userId, projectId, title, content, type = 'invite', actionData = {}) {
    try {
        // 准备通知数据
        const notification = {
            user_id: userId,
            project_id: projectId,
            title: title,
            content: content,
            type: type,
            status: 0, // 0表示未读
            action_data: actionData,
            create_time: second()
        };

        console.log('准备添加通知:', notification);

        // 添加到通知表
        const result = await db.collection('xm-stp-project-notification').add(notification);
        console.log('通知添加结果:', result);

        return {
            success: true,
            id: result.id
        };
    } catch (error) {
        console.error('发送通知失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 邀请用户加入项目
 * @param {Object} event
 * @param {String} event.user_id - 被邀请的用户ID
 * @param {String} event.project_id - 项目ID
 * @param {String} event.inviter_id - 邀请者ID
 * @param {String} event.comment - 邀请说明/备注
 */
exports.main = async (event, context) => {
    console.log('InviteToProject 云函数被调用，参数:', event);

    // 参数验证
    if (!event.user_id || !event.project_id || !event.inviter_id) {
        return {
            status: 0,
            msg: '参数不完整，请提供用户ID、项目ID和邀请者ID'
        };
    }

    try {
        // 不需要设置管理员权限，因为云函数默认就有管理员权限

        // 1. 检查邀请者是否是项目创建者或有邀请权限
        const projectCheck = await db.collection('xm-stp-project')
            .where({
                _id: event.project_id,
                user_id: event.inviter_id
            })
            .get();

        let hasPermission = projectCheck.data.length > 0;

        // 如果不是项目创建者，检查是否有邀请权限
        if (!hasPermission) {
            const memberCheck = await db.collection('xm-stp-project_detail_user_rel')
                .where({
                    project_id: event.project_id,
                    user_id: event.inviter_id,
                    has_invite_permission: true
                })
                .get();

            hasPermission = memberCheck.data.length > 0;
        }

        if (!hasPermission) {
            return {
                status: 0,
                msg: '您没有邀请权限'
            };
        }

        // 2. 检查被邀请者是否已经是项目成员
        const memberExists = await db.collection('xm-stp-project_detail_user_rel')
            .where({
                project_id: event.project_id,
                user_id: event.user_id
            })
            .get();

        if (memberExists.data.length > 0) {
            return {
                status: 0,
                msg: '该用户已经是项目成员'
            };
        }

        // 3. 检查是否已经邀请过该用户
        const inviteExists = await db.collection('xm-stp-project_app_invite')
            .where({
                project_id: event.project_id,
                user_id: event.user_id
            })
            .get();

        if (inviteExists.data.length > 0) {
            // 如果已拒绝，可以重新邀请
            if (inviteExists.data[0].status === parseInt(getInviteStatus('已拒绝'))) {
                await db.collection('xm-stp-project_app_invite')
                    .doc(inviteExists.data[0]._id)
                    .update({
                        status: parseInt(getInviteStatus('等待回复')),
                        comment: event.comment || '',
                        create_time: second()
                    });

                // 添加历史记录
                await db.collection('xm-stp-project_app_history').add({
                    user_id: event.user_id,
                    project_id: event.project_id,
                    action: parseInt(getStatus('发出邀请'))
                });

                // 获取项目信息用于通知
                const projectInfo = await db.collection('xm-stp-project_detail')
                    .doc(event.project_id)
                    .field('title')
                    .get();

                const projectTitle = projectInfo.data.length > 0 ? projectInfo.data[0].title : '项目';

                // 发送通知
                await sendProjectNotification(
                    event.user_id,
                    event.project_id,
                    `您收到一个项目邀请`,
                    `您被邀请加入项目"${projectTitle}"，请查看详情并决定是否接受。`,
                    'invite',
                    {
                        project_id: event.project_id,
                        inviter_id: event.inviter_id
                    }
                );

                return {
                    status: 1,
                    msg: '邀请已重新发送'
                };
            } else {
                return {
                    status: 0,
                    msg: '已经邀请过该用户'
                };
            }
        }

        // 4. 检查用户是否已申请加入该项目
        const requestExists = await db.collection('xm-stp-project_app_request')
            .where({
                project_id: event.project_id,
                user_id: event.user_id
            })
            .get();

        if (requestExists.data.length > 0) {
            return {
                status: 0,
                msg: '该用户已申请加入此项目，请在申请列表中处理'
            };
        }

        // 5. 创建邀请记录
        const inviteResult = await db.collection('xm-stp-project_app_invite').add({
            user_id: event.user_id,
            project_id: event.project_id,
            status: parseInt(getInviteStatus('等待回复')),
            comment: event.comment || '',
            create_time: second()
        });

        // 6. 添加历史记录
        await db.collection('xm-stp-project_app_history').add({
            user_id: event.user_id,
            project_id: event.project_id,
            action: parseInt(getStatus('发出邀请'))
        });

        // 7. 获取项目信息用于通知
        const projectInfo = await db.collection('xm-stp-project_detail')
            .doc(event.project_id)
            .field('title')
            .get();

        const projectTitle = projectInfo.data.length > 0 ? projectInfo.data[0].title : '项目';

        // 8. 发送通知
        await sendProjectNotification(
            event.user_id,
            event.project_id,
            `您收到一个项目邀请`,
            `您被邀请加入项目"${projectTitle}"，请查看详情并决定是否接受。`,
            'invite',
            {
                project_id: event.project_id,
                inviter_id: event.inviter_id
            }
        );

        return {
            status: 1,
            msg: '邀请发送成功',
            data: {
                invite_id: inviteResult.id
            }
        };

    } catch (error) {
        console.error('邀请用户失败:', error);
        return {
            status: 0,
            msg: '邀请失败: ' + error.message
        };
    }
};
