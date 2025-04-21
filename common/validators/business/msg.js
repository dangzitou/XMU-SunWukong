// 语言文件
import enUsValidateMsg from '../language/en-us.js';
import msMyValidateMsg from '../language/ms-my.js';
import zhTwValidateMsg from '../language/zh-tw.js';
import zhCnValidateMsg from '../language/zh-cn.js';

export default function msg (){

    let list = {}

    // 收集函数名 【有个缺点，信息是必须从zh-cn作为主要更新】
    const keyList = Object.keys(zhCnValidateMsg)

    // 在这里填充 list 对象
    for (const key of keyList) {
        list[key] = {
            'zh-cn': zhCnValidateMsg[key],
            'en-us': enUsValidateMsg[key],
            'zh-tw': zhTwValidateMsg[key],
            'ms-my': msMyValidateMsg[key],
        }
    }

    return list;
}
