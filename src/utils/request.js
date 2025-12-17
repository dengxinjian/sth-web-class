import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";
const isPoint401 = false;

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10 * 60 * 1000, // request timeout
});
// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers["Authorization"] = getToken();
    }
    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;
    if (res instanceof Blob) {
      return response;
    }
    if (res.code && res.code !== "100000") {
      // if the custom code is not 20000, it is judged as an error.
      Message({
        message: res.message || "Error",
        type: "error",
        duration: 6 * 1000,
      });

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm(
          "You have been logged out, you can cancel to stay on this page, or log in again",
          "Confirm logout",
          {
            confirmButtonText: "Re-Login",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        ).then(() => {
          store.dispatch("user/resetToken").then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject(res);
    } else {
      return res;
    }
  },
  (error) => {
    if (error.message.includes("timeout")) {
      // 判断请求异常信息中是否含有超时timeout字符串
      return Message({
        message: "请求超时,请刷新重试",
        type: "error",
        duration: 5 * 1000,
      });
    }
    if (error.response.status === 403) {
      // if (!isPoint401) {
      //   isPoint401 = true;
      //   MessageBox.confirm("登录已过期 ", "提示", {
      //     confirmButtonText: "重新登录",
      //     showCancelButton: false,
      //     type: "warning",
      //   })
      //     .then(() => {
      //       isPoint401 = false;
      //       store.dispatch("user/resetToken").then(() => {
      //         location.reload();
      //       });
      //     })
      //     .catch(() => {
      //       isPoint401 = false;
      //     });
      // }
      // store.dispatch("user/resetToken").then(() => {
      //   location.reload();
      // });
    } else {
      Message({
        message: error.message,
        type: "error",
        duration: 5 * 1000,
      });
    }
    return Promise.reject(error);
  }
);

export default service;

export const exportExal = async (
  url,
  params = null,
  name = "",
  cb = () => {},
  method = "get"
) => {
  const requestObj = {
    url,
    method,
    responseType: "blob",
  };
  const paramsObj = {
    get: () => {
      return {
        ...requestObj,
        params: params,
      };
    },
    post: () => {
      return {
        ...requestObj,
        data: params,
      };
    },
  };
  const res = await service(paramsObj[method]());
  const fileReader = new FileReader();
  fileReader.onload = () => {
    const { result } = fileReader;
    // 说明是普通对象数据，后台转换失败
    if (result.includes("success") || result.includes("code")) {
      const jsonData = JSON.parse(result);
      cb(jsonData); // (data)=>{this.$message.error(data.message || '导出失败')}
      return false;
    }

    // 二进制数据
    const link = document.createElement("a");
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    const names = decodeURIComponent(
      res.headers["content-disposition"].split("=")[1]
    );
    link.setAttribute("download", names ?? name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  fileReader.readAsDataURL(res.data);
};
