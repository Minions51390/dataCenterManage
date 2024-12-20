export const dateFormat = 'YYYY-MM-DD';
export const dateFormatH = 'YYYY-MM-DD';
export const dataFormatHm = 'YYYY-MM-DD HH:mm';
export const dataFormatHms = 'YYYY-MM-DD HH:mm:ss';
export const FunGetDateStr = (p_count: any, nowDate: any) => {
    let dd = nowDate;
    dd.setDate(dd.getDate() + p_count); //获取p_count天后的日期
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1; //获取当前月份的日期
    let d = dd.getDate();
    return y + '-' + m + '-' + d;
};