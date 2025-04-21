import { validateObj } from "../business/common.js";

// 主验证函数，根据场景选择适用的验证规则
export default function validateByClass(formData, validateData, scenePicked = '', language = 'en-us') {
    const sceneList = validateData.scene;

    // 检查场景选择，如果没有选择或场景不存在，验证所有规则
    if (scenePicked === '' || !sceneList.hasOwnProperty(scenePicked)) {
        return loopAllRule(formData, validateData, language);
    } else {
        // 否则验证特定场景的规则
        return loopRuleByScene(formData, validateData, scenePicked, language);
    }
}

// 验证所有规则的函数
function loopAllRule(formData, validateData, language) {
    // 调用通用的验证规则函数，检查所有的验证字段
    return loopValidationRules(formData, validateData, Object.keys(validateData.rule), language);
}

// 验证特定场景规则的函数
function loopRuleByScene(formData, validateData, scenePicked, language) {
    // 获取当前场景需要检查的字段
    const pickedCheckField = validateData.scene[scenePicked];
    // 调用通用的验证规则函数
    return loopValidationRules(formData, validateData, pickedCheckField, language);
}

// 通用的验证规则函数，处理所有验证逻辑
function loopValidationRules(formData, validateData, checkFields, language) {
    const result = []; // 保存最终的验证结果
    const ruleList = validateData.rule; // 获取验证规则
    const msgList = validateData.msg; // 获取验证消息
    const methodList = validateData.methods; // 获取自定义方法

    // 遍历每个要检查的字段
    for (const i of checkFields) {
        // 如果没有该规则，跳过
        if (!ruleList.hasOwnProperty(i)) continue;

        const functionForCheck = ruleList[i].split('|'); // 将验证方法分割为数组
        // 如果没有"require"且formData中没有该字段，跳过
        if (!functionForCheck.includes('require') && !formData.hasOwnProperty(i)) continue;

        const errors = []; // 用于保存每个字段的错误信息

        // 遍历所有的验证方法
        for (const validateMethod of functionForCheck) {
            const key = validateMethod.split(':')[0]; // 获取验证方法名称
            const rule = validateMethod.split(':')[1]; // 获取规则参数

            let check; // 用于保存验证结果
            switch (key) {
                case 'require':
                    check = validateObj['require'](formData, i); // 验证必填项
                    break;
                default:
                    try {
                        // 如果common.js有该方法就执行
                        if (validateObj.hasOwnProperty(key)) {
                            check = validateObj[key](formData[i], rule);
                        } else {
                            // 如果没有，尝试调用自定义方法
                            check = methodList[key](formData[i], rule, formData);
                        }
                    } catch (err) {
                        // 如果验证方法不存在，记录错误
                        if (err.message === 'validateObj[key] is not a function') {
                            console.error(`${key} is not inside validation function`);
                        }
                        throw `${key} is not inside validation function`;
                    }
                    break;
            }

            // 处理验证结果
            if (typeof check === 'object') {
                const ruleName = key + (rule === undefined ? '' : (':' + rule)); // 构建规则名称
                const selfMsg = (msgList && msgList[i] && msgList[i][ruleName]) ? msgList[i][ruleName] : undefined; // 获取自定义消息

                let returnMsg; // 返回的消息
                // 如果没有自定义消息，使用默认消息
                if (selfMsg === undefined) {
                    returnMsg = check[language];
                } else if (typeof selfMsg === 'string') {
                    returnMsg = selfMsg; // 直接使用自定义消息
                } else if (typeof selfMsg === 'object') {
                    // 如果是多语言消息，检查是否有对应语言的消息
                    returnMsg = selfMsg.hasOwnProperty(language) ? selfMsg[language] : check[language];
                }

                // 将处理后的消息添加到错误数组
                errors.push(handleMsgReturn(returnMsg, i, rule));
            } else if (typeof check === 'string') {
                // 处理返回字符串类型的错误消息
                errors.push(handleMsgReturn(check, i, rule));
            }
        }

        // 添加属性及错误消息到结果数组
        result.push({
            attribute: i,
            passed: errors.length === 0, // 检查是否有错误
            errors: errors,
        });
    }

    return result; // 返回验证结果
}

/**
 * 处理要返回的信息
 * @param msg 要返回的信息
 * @param attribute 要替换的key
 * @param rule 验证数据
 * @returns {string} 处理后的信息
 */
function handleMsgReturn(msg, attribute, rule = '') {
    // 替换消息中的占位符
    let returnMsg = msg.replace(':attribute', attribute);
    const ruleLength = rule.split(',').length;

    if (ruleLength === 1) {
        returnMsg = returnMsg.replace(':rule', rule); // 处理单个规则
    } else if (ruleLength === 2) {
        returnMsg = returnMsg.replace(':rule1', rule.split(',')[0]); // 处理第一个规则
        returnMsg = returnMsg.replace(':rule2', rule.split(',')[1]); // 处理第二个规则
    }

    return returnMsg; // 返回处理后的消息
}