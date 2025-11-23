<template>
  <div class="wx-login-page">
    <header>
      <div class="logo-container">
        <div class="logo">
          <img
            :src="require('@/views/login-wx/imgs/logo-move.png')"
            alt="强者之心"
          />
        </div>
        <div class="brand-description">
          <span>TRI强者，恒心不止。 Try Tri, Timeless Strength.</span>
        </div>
      </div>
    </header>

    <div class="slider-container">
      <div class="slider"></div>
      <div class="content-overlay">
        <div class="text-content">
          <h1>强者之心</h1>
          <p>让科学普及训练</p>
          <!-- <p>敬请期待！</p> -->
          <div class="contact-info">
            <h2>联系我们</h2>
            <!-- <div class="contact-item">
                        <span class="contact-label">电话：</span>
                        <span class="contact-value">000-0000-0000</span>
                    </div> -->
            <div class="contact-item">
              <span class="contact-label">邮箱：</span>
              <span class="contact-value">service@strongtri.com</span>
            </div>
          </div>
        </div>
      </div>
      <div class="wx-login-block">
        <div class="elite-title">
          <img
            src="./imgs/PREMIUM.svg"
            alt="ELITE"
            width="112px"
            style="margin-top: 12px;"
            v-if="loginType === '2'"
          />
          <!-- <span v-else>ELITE</span> -->
           <img src="./imgs/title.png" alt="ELITE"
           style="scale: 0.45;"
            v-else
          />
        </div>
        <div
          id="wx-login-container"
          :class="wx-login-container"
          v-if="isNewUser"
        >
          <!-- 扫码成功状态 -->
          <!-- <div v-if="hasCode" class="login-success">
            <div class="success-icon">✓</div>
            <div class="success-text">扫码成功</div>
            <div class="success-subtitle">正在跳转...</div>
          </div> -->
          <!-- 加载状态 -->
          <!-- <div v-else-if="wxLoginStatus === 'loading'" class="login-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在加载二维码...</div>
          </div> -->
          <!-- 错误状态 -->
          <!-- <div v-else-if="wxLoginStatus === 'error'" class="login-error">
            <div class="error-icon">✗</div>
            <div class="error-text">加载失败</div>
            <div class="error-subtitle">请刷新重试</div>
          </div> -->
          <div class="miniprogram-code">
            <div class="miniprogram-title">请使用微信扫码</div>
            <img
              src="./imgs/miniprogram-test.png"
              alt="小程序码"
              class="miniprogram-img"
            />
            <div class="miniprogram-subtitle">扫码进入小程序</div>
            <el-button @click="handleMiniprogramCode">已完成扫码</el-button>
          </div>
        </div>
        <!-- 扫码关注服务号 -->
        <div
          id="wx-login-container"
          :class="'wx-login-container ' + (!isAgreement ? ' noAgreement' : '')"
          v-if="!isNewUser"
        >
          <img class="qrcode-img" :src="qrcodeUrl" alt="扫码二维码" />
        </div>
        <div v-if="!isAgreement" class="wx-login-cover"></div>
        <div style="margin-bottom: 20px" v-if="!isNewUser
        ">
          <el-radio-group v-model="loginType" @change="handleLoginTypeChange">
            <el-radio label="1">运动员</el-radio>
            <el-radio label="2">教练</el-radio>
          </el-radio-group>
        </div>
        <div style="display: flex; align-items: center; font-size: 14px" v-if="!isNewUser">
          <el-checkbox
            v-model="isAgreement"
            label=""
            style="margin-right: 5px"
          ></el-checkbox>
          <span>我已阅读并同意</span>
          <router-link to="/agreement" style="color: #0924f5"
            >《课程配置器用户协议》</router-link
          >
        </div>
      </div>
    </div>

    <footer>
      <div class="footer-content">
        <p style="margin-right: 30px">
          <img
            :src="require('@/views/login-wx/imgs/logo.png')"
            alt=""
            width="30"
          />© 2025 武汉强大之心体育有限公司 版权所有 鄂ICP备2024075413号-2 |
          <router-link to="/privacy">隐私政策</router-link>
        </p>
        <p>
          <el-link
            type="info"
            href="https://dailysync.vyzt.dev/"
            target="_blank"
          >
            友情链接: 用'dailysync'同步你的佳明中国与佳明国际数据</el-link
          >
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { setToken } from "@/utils/auth";
import { getData, submitData } from "@/api/common";
export default {
  name: "LoginWx",
  data() {
    return {
      currentSlide: 0,
      backgroundImages: [
        // 图片路径 - 使用绝对路径
        require("@/views/login-wx/imgs/banner1.jpg"),
        require("@/views/login-wx/imgs/banner2.jpg"),
        require("@/views/login-wx/imgs/banner3.webp"),
        require("@/views/login-wx/imgs/banner4.jpg"),
      ],
      carouselTimer: null,
      hasCode: false, // 是否包含code参数
      wxLoginStatus: "loading", // 微信登录状态：loading, success, error
      isAgreement: false, // 是否同意用户协议
      loginType: "1", // 登录类型：1-运动员，2-教练
      qrcodeUrl: "",
      sceneId: "",
      pollTimer: null, // 轮询定时器
      POLL_INTERVAL: 2000, // 轮询间隔：2秒
      isNewUser: false, // 是否是新用户
    };
  },
  mounted() {
    this.getScanQrCode();
    // this.checkUrlParams();
    this.initSlider();
    this.loginType = localStorage.getItem("loginType") || "1";
    localStorage.setItem("loginType", this.loginType);
  },
  beforeDestroy() {
    clearInterval(this.carouselTimer);
    this.clearPollTimer();
  },
  methods: {
    handleMiniprogramCode() {
      if (this.unionid) {
        getData({
          url: "/api/wechat/getByUnionid",
          unionid: this.unionid,
        })
          .then((res) => {
            if (res.result.jwt) {
              this.$message.success("登录成功");
              this.$store.commit("user/SET_TOKEN", res.result.jwt);
              this.$store.commit("user/SET_NAME", res.result.nicknameTag);
              localStorage.setItem("triUserId", res.result.triUserId);
              localStorage.setItem("name", res.result.nicknameTag);
              console.log("res.result.jwt", res.result.jwt);
              setToken(res.result.jwt);
              this.$router.push("/timeTable/athletic");
            } else {
              this.$message.error("请重新扫码");
            }
          })
          .catch((error) => {
            console.error("获取微信用户信息失败:", error);
            this.$message.error("获取微信用户信息失败，请刷新重试");
          });
      }
    },
    /**
     * 启动扫码结果轮询定时器
     */
    startPolling() {
      this.clearPollTimer();
      if (!this.sceneId) {
        console.warn("sceneId 为空，无法启动轮询");
        return;
      }
      // 使用递归的 setTimeout 实现轮询，避免定时器类型不匹配问题
      const poll = () => {
        this.pollTimer = setTimeout(async () => {
          await this.checkLoginResult();
          // 如果轮询还在进行（未登录成功），继续下一次轮询
          if (this.pollTimer) {
            poll();
          }
        }, this.POLL_INTERVAL);
      };
      poll();
    },
    /**
     * 清除扫码结果轮询定时器
     */
    clearPollTimer() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer);
        this.pollTimer = null;
      }
    },
    /**
     * 检查扫码登录结果
     */
    async checkLoginResult() {
      if (!this.sceneId) {
        console.warn("sceneId 为空，无法获取登录结果");
        this.clearPollTimer();
        return;
      }

      try {
        const res = await getData({
          url: `/api/wechat/wechatScanLogin/${this.sceneId}`,
        });

        console.log("获取扫码登录结果成功:", res);

        if (res.code === "100000" && res.result && res.result) {
          // 扫码成功，停止轮询并处理登录
          this.clearPollTimer();
          this.handleLoginSuccess(res.result);
        } else if (res.result?.message) {
          // 显示状态信息（但不停止轮询，允许继续尝试）
          console.warn("扫码登录状态:", res.result.message);
        }
      } catch (error) {
        console.error("获取扫码登录结果失败:", error);
        // 网络错误时不停止轮询，继续尝试
      }
    },
    /**
     * 处理登录成功
     * @param {Object} result - 登录结果数据
     */
    handleLoginSuccess(result) {
      if (!result?.jwt) {
        // console.warn("登录结果数据不完整，继续轮询");
        this.isNewUser = true;
        this.unionid = result.unionid;
        // this.checkUrlParams();
        // this.startPolling();
        return;
      }

      this.$message.success("登录成功");

      // 保存用户信息到 Vuex
      this.$store.commit("user/SET_TOKEN", result.jwt);
      this.$store.commit("user/SET_NAME", result.nicknameTag);

      // 保存用户信息到 localStorage
      localStorage.setItem("triUserId", result.triUserId);
      localStorage.setItem("name", result.nicknameTag);

      // 设置 token
      setToken(result.jwt);

      // 跳转到主页
      this.$router.push("/timeTable/class");
    },
    /**
     * 获取扫码二维码
     */
    getScanQrCode() {
      getData({
        url: "/api/wechat/wechatScanLoginQrCode",
      })
        .then((res) => {
          if (res.result?.sceneId && res.result?.ticket) {
            this.sceneId = res.result.sceneId;
            this.qrcodeUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.result.ticket}`;

            // token 不存在时启动轮询
            if (!this.$store.getters.token) {
              this.startPolling();
            }
          } else {
            console.error("获取二维码失败：返回数据不完整", res);
            this.$message.error("获取二维码失败，请刷新重试");
          }
        })
        .catch((error) => {
          console.error("获取扫码二维码失败:", error);
          this.$message.error("获取二维码失败，请检查网络连接后刷新重试");
        });
    },
    // 检查URL参数
    checkUrlParams() {
      // 添加更详细的调试信息
      console.log("当前完整URL:", window.location.href);
      console.log("window.location.search:", window.location.search);
      console.log("window.location.hash:", window.location.hash);

      // 尝试多种方式获取code和state参数
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      // 也检查hash中的参数（有些情况下参数可能在hash中）
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const codeFromHash = hashParams.get("code");
      const stateFromHash = hashParams.get("state");

      // 检查URL中是否包含code字符串
      const urlContainsCode = window.location.href.includes("code=");
      const urlContainsState = window.location.href.includes("state=");

      console.log("URL参数检测详情:", {
        search: window.location.search,
        hash: window.location.hash,
        codeFromSearch: code,
        stateFromSearch: state,
        codeFromHash: codeFromHash,
        stateFromHash: stateFromHash,
        urlContainsCode: urlContainsCode,
        urlContainsState: urlContainsState,
        allSearchParams: Object.fromEntries(urlParams),
        allHashParams: Object.fromEntries(hashParams),
      });

      // 备用方法：使用正则表达式解析URL参数
      const regexCode = this.getUrlParameter("code");
      const regexState = this.getUrlParameter("state");

      // 优先使用search中的参数，如果没有则使用hash中的参数，最后使用正则表达式
      const finalCode = code || codeFromHash || regexCode;
      const finalState = state || stateFromHash || regexState;

      console.log("最终获取到的参数:", { code: finalCode, state: finalState });

      if (finalCode) {
        this.hasCode = true;
        this.wxLoginStatus = "success";
        console.log(
          "检测到code参数，显示扫码成功状态，code值:",
          finalCode,
          "state值:",
          finalState
        );

        // 可以在这里处理登录成功后的逻辑
        this.handleUrlLoginSuccess(finalCode, finalState);
      } else {
        console.log("未检测到code参数，开始初始化微信登录");
        this.initWxLogin();
      }
    },

    // 备用URL参数解析方法
    getUrlParameter(name) {
      const url = window.location.href;
      const regex = new RegExp("[?&]" + name + "=([^&#]*)", "i");
      const results = regex.exec(url);
      return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    // 处理URL参数登录成功
    handleUrlLoginSuccess(code, state) {
      console.log("处理登录成功，code:", code, "state:", state);

      // 调用微信登录回调接口，同时传递code和state参数
      getData({
        url: "/api/wechat/callback",
        data: {
          code: code,
          state: state,
        },
      })
        .then((res) => {
          console.log("微信登录回调成功，res:", res);

          // 根据后端返回结果处理后续逻辑
          if (res.success) {
            // 登录成功，可以跳转到主页或保存用户信息
            console.log("登录成功，准备跳转");
            // this.$router.push('/dashboard'); // 根据实际路由调整
          } else {
            // 登录失败，显示错误信息
            console.error("登录失败:", res.message);
            this.$message.error(res.message || "登录失败，请重试");
          }
        })
        .catch((error) => {
          console.error("微信登录回调失败:", error);
          this.$message.error("登录失败，请重试");
        });

      // 这里可以添加登录成功后的处理逻辑
      // 比如发送code到后端验证，获取用户信息等

      // 示例：3秒后跳转到主页
      setTimeout(() => {
        console.log("准备跳转到主页");
        // this.$router.push('/dashboard'); // 根据实际路由调整
      }, 3000);
    },
    initSlider() {
      // 使用 $nextTick 确保 DOM 完全渲染后再初始化轮播
      this.$nextTick(() => {
        const slider = document.querySelector(".slider");
        if (!slider) {
          console.error("轮播容器未找到");
          return;
        }

        let currentImageIndex = 0;
        let loadedImages = 0;

        console.log("背景图片数组:", this.backgroundImages);
        console.log("轮播容器:", slider);

        // 清空容器
        slider.innerHTML = "";

        // 初始化轮播图片
        this.backgroundImages.forEach((image, index) => {
          console.log(`添加图片 ${index}:`, image);
          const img = document.createElement("img");
          img.src = image;
          img.className = index === 0 ? "active" : "";
          img.style.objectFit = "cover";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.position = "absolute";
          img.style.top = "0";
          img.style.left = "0";
          img.style.opacity = index === 0 ? "1" : "0";
          img.style.transition = "opacity 1s ease-in-out";

          img.onload = () => {
            console.log(`图片 ${index} 加载成功`);
            loadedImages++;
            if (loadedImages === this.backgroundImages.length) {
              console.log("所有图片加载完成，开始轮播");
            }
          };

          img.onerror = (e) => {
            console.error(`图片 ${index} 加载失败:`, e);
            console.error("图片路径:", image);
          };

          slider.appendChild(img);
        });

        // 切换到下一张图片
        const nextImage = () => {
          const imgs = slider.querySelectorAll("img");
          if (imgs.length === 0) {
            console.warn("没有找到轮播图片");
            return;
          }

          imgs[currentImageIndex].classList.remove("active");
          imgs[currentImageIndex].style.opacity = "0";

          currentImageIndex =
            (currentImageIndex + 1) % this.backgroundImages.length;

          imgs[currentImageIndex].classList.add("active");
          imgs[currentImageIndex].style.opacity = "1";

          console.log(`切换到图片 ${currentImageIndex}`);
        };

        // 设置自动轮播间隔
        this.carouselTimer = setInterval(nextImage, 5000);
        console.log("轮播定时器已启动，间隔5秒");
      });
    },
    initWxLogin() {
      this.wxLoginStatus = "loading";
      // 延迟初始化，确保DOM完全加载
      this.$nextTick(() => {
        this.loadWxLoginScript();
      });
    },
    loadWxLoginScript() {
      const ensureScript = () =>
        new Promise((resolve, reject) => {
          if (window.WxLogin) {
            console.log("微信登录脚本已存在");
            return resolve();
          }

          console.log("开始加载微信登录脚本...");
          const s = document.createElement("script");
          s.src =
            "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
          s.async = true;
          s.onload = () => {
            console.log("微信登录脚本加载成功");
            resolve();
          };
          s.onerror = (e) => {
            console.error("微信登录脚本加载失败:", e);
            reject(e);
          };
          document.head.appendChild(s);
        });

      ensureScript()
        .then(() => {
          this.createWxLogin();
        })
        .catch((error) => {
          console.error("微信登录初始化失败:", error);
          this.wxLoginStatus = "error";
          this.$message.error("微信登录初始化失败，请检查网络连接后刷新重试");
        });
    },
    createWxLogin() {
      try {
        const appId =
          process.env.NODE_ENV === "production"
            ? "wxe34b400e55bd075b"
            : "wx4064cabd6845def1";
        const state = (
          Math.random().toString(36).slice(2) + Date.now()
        ).toString();
        const redirectUri = encodeURIComponent(
          process.env.NODE_ENV === "production"
            ? "https://web.strongtri.com/#/login-scan"
            : "https://webtest.strongtri.com/#/login-scan"
        );

        console.log("开始创建微信登录二维码...");
        console.log("AppId:", appId);
        console.log("RedirectUri:", redirectUri);

        // 清空容器
        const container = document.getElementById("wx-login-container");
        if (container) {
          container.innerHTML = "";
        }

        // 创建微信登录二维码
        new window.WxLogin({
          id: "wx-login-container",
          appid: appId,
          scope: "snsapi_login",
          redirect_uri: redirectUri,
          state,
          style: "black",
          href: "",
        });

        console.log("微信登录二维码创建成功");
        this.wxLoginStatus = "success";
      } catch (error) {
        console.error("创建微信登录二维码时出错:", error);
        this.wxLoginStatus = "error";
        this.$message.error("创建微信登录二维码失败，请刷新重试");
      }
    },
    handleLoginTypeChange(value) {
      localStorage.setItem("loginType", value);
    },
  },
};
</script>

<style lang="scss" scoped>
/* 头部样式 */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  width: 200px;
  margin-top: -6px;
}

.logo img {
  width: 100%;
  height: auto;
}

.brand-description {
  color: white;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-style: italic;
}

/* 轮播容器样式 */
.slider-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.slider {
  position: absolute;
  width: 100%;
  height: 100%;
}

.slider img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 1;
}

.slider img.active {
  opacity: 1;
  z-index: 2;
}

/* 内容覆盖层样式 */
.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  padding: 0 10%;
}

.text-content {
  color: white;
  max-width: 800px;
  text-align: left;
  animation: fadeIn 1.5s ease-out;
}

.text-content h1 {
  font-size: 4em;
  margin-bottom: 30px;
  font-weight: 800;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transform: translateX(-20px);
  opacity: 0;
  animation: slideIn 1s ease-out forwards;
}

.text-content p {
  font-size: 1.8em;
  margin-bottom: 20px;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s ease-out forwards;
  animation-delay: 0.5s;
}

.text-content p:last-child {
  font-size: 1.4em;
  font-weight: 300;
  opacity: 0.9;
  animation-delay: 1s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 页脚样式 */
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 30px;
  color: white;
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
}

.footer-content p {
  margin: 2px 0;
}

.footer-content p img {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  margin: -3px 6px 0 0;
}

.footer-content .icp {
  font-size: 0.85em;
  opacity: 0.9;
}
.wx-login-block {
  position: absolute;
  top: 50%;
  right: 10%;
  z-index: 1000;
  transform: translateY(-50%);
  width: 340px;
  height: 550px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 80px;

  .elite-title {
    font-size: 24px;
    position: absolute;
    top: 10px;
    left: 0;
    width: 100%;
    height: 40px;
    color: #0924f5;
    text-align: center;
    line-height: 40px;
    font-weight: bold;
  }
}
.wx-login-cover {
  position: absolute;
  top: 80px;
  left: 0;
  z-index: 1000;
  width: 340px;
  height: 300px;
}
.wx-login-container.noAgreement {
  filter: blur(5px);
}

.wx-login-container iframe {
  width: 200px;
  height: 200px;
  border: none;
  border-radius: 8px;
}

/* 微信登录二维码样式优化 */
.wx-login-container .wx-login-iframe {
  width: 200px !important;
  height: 200px !important;
  border: none !important;
}

/* 登录状态样式 */
.login-success,
.login-loading,
.login-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  text-align: center;
}

/* 扫码成功样式 */
.login-success {
  color: #52c41a;
}

.success-icon {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
  animation: successPulse 1.5s ease-in-out infinite;
}

.success-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.success-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

/* 加载状态样式 */
.login-loading {
  color: #1890ff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 14px;
  opacity: 0.8;
}

/* 错误状态样式 */
.login-error {
  color: #ff4d4f;
}

.error-icon {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
}

.error-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.error-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border: none;
  border-radius: 8px;
  margin-bottom: 60px;
}

/* 登录状态样式 */
.miniprogram-code {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 60px;
}

.miniprogram-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.miniprogram-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

/* 扫码成功样式 */
.login-success {
  color: #52c41a;
}

.miniprogram-subtitle {
  font-size: 12px;
  color: #666;
  opacity: 0.8;
  margin-bottom: 10px;
}

/* 小程序码样式 */
.miniprogram-code {
  color: #1890ff;
}

/* 动画效果 */
@keyframes successPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
