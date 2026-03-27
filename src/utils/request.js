import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import router from "@/router";
import { getToken } from "@/utils/auth";
import { vipDialog } from "@/plugins/vip-dialog";
const isPoint401 = false;

// 版本更新提示防重複彈框
let versionUpdatePromptShown = false;
// VIP 过期提示防重复弹框
let vipExpiredPromptShown = false;
let proVipExpiredPromptShown = false;
// forceShow 会员弹窗打开期间，暂停到期提醒拦截，避免重复弹框抢焦点
let vipExpirePromptLockedByForceShowDialog = false;

const VIP_EXPIRE_CHECK_WHITE_LIST = [
  "/logout",
  "gateway/auth/wx/loginMock",
  "ateway/wechat/wechatScanLogin",
  "wechat/wechatScanLoginQrCode",
  "gateway/wechat/getByUnionid",
  "consumer/wx/switchIdentity",
  "operate/api/activate/redeem",
  "operate/api/vipPay/queryPayStatus"
];

function normalizeRequestUrl(url = "") {
  return String(url).split("?")[0];
}

function shouldSkipVipExpireCheck(url = "") {
  const normalizedUrl = normalizeRequestUrl(url);
  return VIP_EXPIRE_CHECK_WHITE_LIST.some((item) =>
    normalizedUrl.includes(item)
  );
}

function redirectToLogin() {
  const pushResult = router.push("/login");
  if (pushResult && typeof pushResult.catch === "function") {
    pushResult.catch(() => {});
  }
}

function switchToAthlete() {
  return service({
    url: "/consumer/wx/switchIdentity?clinetType=web",
    method: "post",
    data: { clinetType: "web" },
  })
    .catch(() => {})
    .finally(() => {
      localStorage.setItem("loginType", "1");
      localStorage.setItem("activeName", "class");
      location.reload();
    });
}

function logoutAndRedirect(options = {}) {
  const { resetLoginType = false } = options;
  return store
    .dispatch("user/logout")
    .catch(() => store.dispatch("user/resetToken"))
    .finally(() => {
      if (resetLoginType) {
        localStorage.setItem("loginType", "1");
      }
      redirectToLogin();
    });
}

function showVipExpiredConfirm({
  message,
  openDialog,
  resetPromptFlag,
  onCancel,
  cancelButtonText = "退出登录",
  reopenOnDialogCloseWhenForceShow = false,
}) {
  return MessageBox({
    title: "会员到期提醒",
    message,
    confirmButtonText: "去订阅",
    cancelButtonText,
    showCancelButton: true,
    distinguishCancelAndClose: true,
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    type: "warning",
    beforeClose(action, instance, done) {
      if (action === "confirm") {
        const forceShow = true;
        done();
        if (forceShow) {
          vipExpirePromptLockedByForceShowDialog = true;
        }
        openDialog({
          tradeType: "2",
          forceShow,
          onClose: () => {
            vipExpirePromptLockedByForceShowDialog = false;
            if (typeof resetPromptFlag === "function") {
              resetPromptFlag();
            }
            if (forceShow && reopenOnDialogCloseWhenForceShow) {
              showVipExpiredConfirm({
                message,
                openDialog,
                resetPromptFlag,
                onCancel,
                cancelButtonText,
                reopenOnDialogCloseWhenForceShow,
              });
            }
          },
        });
        return;
      }
      done();
    },
  }).catch((action) => {
    if (typeof onCancel === "function") {
      return onCancel(action);
    }
    return logoutAndRedirect();
  });
}

/**
 * 從 extInfo 解析伺服器版本號
 * extInfo 格式: {"version":"{\"version\":\"1772502805183\",\"buildTime\":\"...\",\"environment\":\"...\"}"}
 */
function getServerVersionFromExtInfo(extInfo) {
  if (!extInfo || typeof extInfo !== "string") return null;
  try {
    const parsed = JSON.parse(extInfo);
    const versionStr = parsed?.version;
    if (typeof versionStr === "string") {
      try {
        const inner = JSON.parse(versionStr);
        return inner?.version || null;
      } catch {
        return versionStr;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 檢查版本並在非開發環境下提示更新
 */
function checkVersionAndPromptUpdate(extInfo) {
  console.log(process.env.NODE_ENV);
  console.log(process.env.VUE_APP_VERSION);
  console.log(JSON.parse(extInfo));
  const version = JSON.parse(extInfo);
  console.log(JSON.parse(version.version));
  if (process.env.NODE_ENV === "development") return;
  if (versionUpdatePromptShown) return;

  const serverVersion = getServerVersionFromExtInfo(extInfo);
  if (!serverVersion) return;

  const currentVersion = process.env.VUE_APP_VERSION || "";
  if (currentVersion === serverVersion) return;

  versionUpdatePromptShown = true;
  MessageBox.confirm("系统已更新，请刷新页面以使用最新版本", "版本更新提示", {
    confirmButtonText: "立即刷新",
    showCancelButton: false,
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    type: "warning",
  }).then(() => {
    location.reload(true);
  });
}

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
    const requestUrl = response.config?.url || "";
    const skipVipExpireCheck = shouldSkipVipExpireCheck(requestUrl);
    if (res instanceof Blob) {
      return response;
    }
    if (res.code && res.code !== "100000") {
      // 运动员身份 + code 300：检查精英版是否过期
      if (
        (res.code === 300 || res.code === "300") &&
        localStorage.getItem("loginType") === "1" &&
        !vipExpirePromptLockedByForceShowDialog &&
        !skipVipExpireCheck
      ) {
        let vipSubStatus = null;
        try {
          const extInfo =
            typeof res.extInfo === "string"
              ? JSON.parse(res.extInfo)
              : res.extInfo;
          vipSubStatus = Number(extInfo?.vipSubStatus);
        } catch { /* extInfo 解析失败则保持 vipSubStatus 为 null */ }

        if (vipSubStatus !== 1 && vipSubStatus !== 4 && !vipExpiredPromptShown) {
          vipExpiredPromptShown = true;
          showVipExpiredConfirm({
            message: "您的精英版会员已经到期，请及时续费",
            openDialog: vipDialog.openVip2.bind(vipDialog),
            resetPromptFlag: () => {
              vipExpiredPromptShown = false;
            },
            cancelButtonText: "暂不订阅",
            onCancel: () => {
              vipExpiredPromptShown = false;
            },
          });
          return Promise.reject(res);
        }
      }

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
      // 非開發環境下檢查版本，若與伺服器不一致則提示更新並強制刷新

      if (res.extInfo) {
        checkVersionAndPromptUpdate(res.extInfo);

        if (
          localStorage.getItem("loginType") === "2" &&
          !proVipExpiredPromptShown &&
          !vipExpirePromptLockedByForceShowDialog &&
          !skipVipExpireCheck
        ) {
          let vipSubStatus = null;
          try {
            const extInfo =
              typeof res.extInfo === "string"
                ? JSON.parse(res.extInfo)
                : res.extInfo;
            vipSubStatus = Number(extInfo?.vipSubStatus);
          } catch { /* ignore */ }

          if (vipSubStatus !== 2 && vipSubStatus !== 4) {
            proVipExpiredPromptShown = true;
            showVipExpiredConfirm({
              message: "您的专业版会员已经到期，请及时续费",
              openDialog: vipDialog.openVip1.bind(vipDialog),
              reopenOnDialogCloseWhenForceShow: true,
              resetPromptFlag: () => {
                proVipExpiredPromptShown = false;
              },
              cancelButtonText: "切换成运动员",
              onCancel: () => {
                proVipExpiredPromptShown = false;
                return switchToAthlete();
              },
            });
          }
        }
      }
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
      store.dispatch("user/resetToken").then(() => {
        router.push("/login");
      });
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
