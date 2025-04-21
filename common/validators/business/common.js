// 引入
import msg from "./msg.js";

class Validator{
    static validateMsg = msg() ;

    static validateObj = {
        require(formData, key) {
            return formData.hasOwnProperty(key) && formData[key] != null && formData[key] !== ''
                ? true
                : Validator.validateMsg['require'];
        },
        isString(value) {
            return !value || typeof value === 'string' ? true : Validator.validateMsg['isString'];
        },
        isEmail(value) {
            return !value || /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value)
                ? true
                : Validator.validateMsg['isEmail'];
        },
        isDateTime(value) {
            return !value || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
                ? true
                : Validator.validateMsg['isDateTime'];
        },
        onlyUrl(value) {
            return !value || /^(https?|ftp|ftps):\/\/[^\s/$.?#].[^\s]*$/.test(value)
                ? true
                : Validator.validateMsg['onlyUrl'];
        },
        onlyNumber(value) {
            return !value || /^\d+$/.test(value) || typeof value === 'number'
                ? true
                : Validator.validateMsg['onlyNumber'];
        },
        onlyCurrency(value) {
            return !value || /^\d+(\.\d{1,2})?$/.test(value)
                ? true
                : Validator.validateMsg['onlyCurrency'];
        },
        min(value, rule) {
            return !value || value.length >= rule ? true : Validator.validateMsg['min'];
        },
        max(value, rule) {
            return !value || value.length < rule ? true : Validator.validateMsg['max'];
        },
        length(value, rule) {
            if (!value) return true;
			console.log(Validator.validateMsg['length'])
            const [min, max] = rule.split(',').map(Number);
            return (!value && value.length >= min && (!max || value.length <= max))
                ? true
                : Validator.validateMsg['length-'+(max ? 2 : 1)];
        },
        noSpecialCharacter(value) {
            return !value || /^[A-Za-z0-9_]+$/.test(value)
                ? true
                : Validator.validateMsg['noSpecialCharacter'];
        },
        different(value, rule) {
            return !value || value !== rule
                ? true
                : Validator.validateMsg['different'];
        },
        same(value, rule) {
            return !value || value === rule
                ? true
                : Validator.validateMsg['same'];
        },
        isUnixFileName(value) {
            return !value || /^[^\/\0<>:"|?*\x00-\x1F]+$/.test(value)
                ? true
                : Validator.validateMsg['isUnixFileName'];
        },
        isMobileNumber(value) {
            return !value || /^(?:\+|00)?(\d{1,3})[-\s]?(\d{1,4})[-\s]?(\d{4,12})$/.test(value)
                ? true
                : Validator.validateMsg['isMobileNumber'];
        },
    };
}


// 导出 validateObj
export const validateObj = Validator.validateObj;
