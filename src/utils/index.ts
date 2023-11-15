import queryString from 'query-string';
/**
 * 获取URL参数
 */
export function parseQuery() {
    return queryString.parseUrl(window.location.href).query;
}

/**
 * 校验是否登录
 * @param permits
 */
export const checkLogin = (permits: any): boolean =>
    (process.env.NODE_ENV === 'production' && !!permits) || process.env.NODE_ENV === 'development';

/**
 * 截取url字符串中的参数
 *
 * @export
 * @param {string} url 传入标准的url
 * @returns {object} 截取到url上的参数
 */
export function getQuery(url: string) {
    const queryArr = url.slice(1).split('?');
    const returnString = {} as any;
    if (queryArr.length === 0 || queryArr.length === 1) {
        return returnString;
    }
    const queryStr = queryArr.slice(1)[0];
    const queryStrArr = queryStr.split('&');
    for (let i = 0; i < queryStrArr.length; i++) {
        const obj = queryStrArr[i].split('=');
        if (obj.length) {
            returnString[obj[0]] = obj[1];
        }
    }
    return returnString;
}

/**
 * 获取url上面的参数
 *
 * @export
 * @returns {object} 截取到url上的参数
 */
export function getQueryString() {
    const href: string = window.location.href;
    return getQuery(href);
}
