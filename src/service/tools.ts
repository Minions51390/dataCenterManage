import axios from 'axios';
import { message } from 'antd';

interface IFRequestParam {
    url: string;
    msg?: string;
    config?: any;
    data?: any;
}

const service = axios.create({
    timeout: 50000 // 请求超时时间
});


service.interceptors.response.use(
    response => {
      const res = response.data;
      if (res.state === 1) { // 后台返回码，根据自己的业务进行修改
        // 权限问题
        message.error((res && res.msg) || "错误");
        return response;
      } else {
        return response;
      }
    },
    error => {
      console.log('err' + error) // for debug
      return Promise.reject(error);
});

/**
 * 公用get请求
 * @param url       接口地址
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const get = ({ url, msg = '接口异常', config }: IFRequestParam) =>
    service
        .get(url, config)
        .then((res) => res.data)
        .catch((err) => {
            console.log(err);
            message.warn(msg);
        });

/**
 * 公用post请求
 * @param url       接口地址
 * @param data      接口参数
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const post = ({ url, data, msg = '接口异常', config }: IFRequestParam) =>
    service
        .post(url, data, config)
        .then((res) => res.data)
        .catch((err) => {
            console.log(err);
            message.warn(msg);
        });

export const patch = ({ url, data, msg = '接口异常', config }: IFRequestParam) =>
    service
        .patch(url, data, config)
        .then((res) => res.data)
        .catch((err) => {
            console.log(err);
            message.warn(msg);
        });

// export const baseUrl = '/api'; //本地调试使用
export const baseUrl = '';
