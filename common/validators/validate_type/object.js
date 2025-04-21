import { validateObj } from "../business/common.js";

/**
 * 验证表单数据
 * @param formData 要验证的表单数据
 * @param validateData 验证规则
 * @param language 返回的语言（错误信息）
 * @returns {*[]} 如果返回字符串代表验证失败，如果返回true代表验证成功
 */
export default function validateByObj(formData, validateData, language = 'en-us') {
    const result = [];

    // 遍历验证规则
    for (const i in validateData) {
        const functionForCheck = validateData[i].rule.split('|');

        // 如果没有必填要求且formData中不存在该属性，则跳过
        if (
            !functionForCheck.includes('require') &&
            !formData.hasOwnProperty(i)
        )
            continue;

        const errors = []; // 用于保存每个formData的错误信息

        // 遍历每个验证方法
        for (const validateMethod of functionForCheck) {
            const key = validateMethod.split(':')[0]; // 验证方法名
            const rule = validateMethod.split(':')[1]; // 验证规则

            let check;

            // 根据验证方法调用对应的验证函数
            switch (key) {
                case 'require':
                    check = validateObj['require'](formData, i);
                    break;
                default:
                    try {
                        // 调用自定义的验证函数
                        check = validateObj[key](formData[i], rule);
                    } catch (err) {
                        // 如果验证函数不存在，则抛出错误
                        if (err.message === 'validateObj[key] is not a function')
                            console.error(`${key} 不在验证函数内`);
                        throw `${key} 不在验证函数内`;
                    }
                    break;
            }

            // 根据检查结果处理错误信息
            if (typeof check === 'object') {
                const returnMsg = checkNestedKey(
                    validateData[i],
                    'msg.' + key + '.' + language
                )
                    ? validateData[i]['msg'][key][language]
                    : check[language];
                errors.push(handleMsgReturn(returnMsg, i, rule));
            } else if (typeof check === 'string') {
                errors.push(handleMsgReturn(check, i, rule));
            }
        }

        // 将属性和错误信息添加到结果数组中
        if (errors.length > 0)
            result.push({
                attribute: i,
                passed: false,
                errors: errors,
            });
        else
            result.push({
                attribute: i,
                passed: true,
            });
    }

    return result; // 返回验证结果
}

/**
 * 处理要返回的信息
 * @param msg 要返回的信息
 * @param attribute 要替换的键
 * @param rule 验证规则
 * @returns {string} 处理后的信息
 */
function handleMsgReturn(msg, attribute, rule = '') {
    let returnMsg = msg.replace(':attribute', attribute);
    // 对rule进行拆解
    const ruleLength = rule.split(',').length;
    // 如果rule只有1个参数
    if (ruleLength === 1) {
        returnMsg = returnMsg.replace(':rule', rule);
    }
    // 如果rule有2个参数
    else if (ruleLength === 2) {
        returnMsg = returnMsg.replace(':rule1', rule.split(',')[0]);
        returnMsg = returnMsg.replace(':rule2', rule.split(',')[1]);
    }

    return returnMsg; // 返回处理后的信息
}

/**
 * 检查是否有自定义消息用于返回
 * @param obj 验证规则
 * @param keys 要返回的消息的键
 * @returns {boolean}
 */
function checkNestedKey(obj, keys) {
    // 将 keys 拆分为数组
    const keyArr = keys.split('.');

    // 递归遍历对象的每一层
    for (let i = 0; i < keyArr.length; i++) {
        const key = keyArr[i];

        // 如果当前层的键不存在，返回 false
        if (!obj || !obj.hasOwnProperty(key)) {
            return false;
        }

        // 更新 obj 为下一层的值
        obj = obj[key];
    }

    // 如果遍历完所有层级，且最后一层键存在，则返回 true
    return true;
}
